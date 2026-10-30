import {pcaReelLayout} from './pcaHoseGeometry.ts';
import { initial, cabinFrame, aligned, metrics, moving, command, type State, type Pose } from './simulation.ts';
import { standLayout } from './standLayout.ts';
import { initialMobileSteps, mobileBrake, mobileFloor, mobileHandle, mobileHoseGuides, mobileReady, onMobilePlatform, type MobileSteps } from './mobileSteps.ts';

export type Point = [number, number, number];
export type ServiceId = 'GPU' | 'PCA' | 'PWS';
export type ServicePhase = 'idle' | 'inspected' | 'carrying' | 'connected' | 'locked' | 'active' | 'complete';
export const serviceIds: ServiceId[] = ['GPU', 'PCA', 'PWS'];
/** Positions and all service parameters are editable gameplay assumptions, not A321 maintenance data. */
export const groundConfig = {
  aircraft: 'Airbus A321 · hình học minh họa', stand: 'G12', flight: 'VN 268',
  interactionRange: 2.3, connectorRange: 1.65, connectorAim: .86,
  walkSpeed: 2.7, radius: .28, waterSeconds: 12,
  dockingTolerance: {offset:.18,yaw:5,height:.2},
  services: {
    GPU: { socket: [6, 2.85, -5.5] as Point, maxLength: 14, radius:.035, color: '#f29b45', description: 'Điện mặt đất · đầu nhận ở đầu tàu bay', quantity: '400 Hz · giả định' },
    PCA: { socket: [5.85, 2.25, 11.5] as Point, maxLength: 26, radius:.12, color: '#e9ac29', description: 'Khí điều hòa · bụng giữa hai cánh', quantity: 'PCA · không phải khí khởi động' },
    PWS: { socket: [6.05, 3.25, 34] as Point, maxLength: 52, radius:.025, color: '#86c6ff', description: 'Nước sạch · dưới đuôi · cần thang', quantity: '120 L · mục tiêu gameplay' },
  },
  checks: [
    { label: 'Tàu bay đã dừng tại vạch', at: [-12, 3, standLayout.rotundaZ] as Point },
    { label: 'Động cơ tắt · beacon tắt', at: [-10, 3, standLayout.rotundaZ] as Point },
    { label: 'Chèn bánh đã bố trí', at: [-8, 3, standLayout.rotundaZ] as Point },
    { label: 'Vùng chuyển động thông thoáng', at: [-6, 3, standLayout.rotundaZ] as Point },
  ],
};
export const phaseLabels: Record<ServicePhase, string> = { idle:'Chưa kiểm tra', inspected:'Đã kiểm tra', carrying:'Đang kéo', connected:'Đã cắm', locked:'Đã khóa', active:'Đang hoạt động', complete:'Hoàn tất' };
export type Mission = {
  bridge: State; checks: boolean[]; services: Record<ServiceId, ServicePhase>;
  started: boolean; docked: boolean; descended: boolean; complete: boolean;
  elapsed: number; errors: number; water: number; waterPanel: boolean; stairDoorOpen: boolean; accuracy: number; message: string;
  cableRoutes: Record<ServiceId,Point[]>;
  mobileSteps:MobileSteps;
};
export function newMission(): Mission { return { bridge: initial(), checks:[false,false,false,false], services:{GPU:'idle',PCA:'idle',PWS:'idle'}, started:false, docked:false, descended:false, complete:false, elapsed:0, errors:0, water:0, waterPanel:false, stairDoorOpen:false, accuracy:0, cableRoutes:{GPU:[],PCA:[],PWS:[]}, mobileSteps:initialMobileSteps(),message:'Nhận chuyến bay để bắt đầu ca phục vụ.' }; }
export const distance = (a: Point, b: Point) => Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
export const carrying = (m: Mission) => serviceIds.find(id => m.services[id] === 'carrying');
/** Exact hierarchy transforms of CabinGPU, HoseReels and MobileCarriage in Infrastructure.tsx.
 * Pickups hang outside the housings, reachable from the apron; no extra service vehicles. */
export function serviceMount(m:Mission,id:ServiceId) {
 const p=m.bridge.pose,a=p.angle*Math.PI/180,f=cabinFrame(p);
 const bridge=(along:number,y:number,side:number):Point=>[standLayout.rotundaX+along*Math.cos(a)-side*Math.sin(a),y,standLayout.rotundaZ+along*Math.sin(a)+side*Math.cos(a)];
 const cabin=(x:number,y:number,z:number):Point=>[f.x+x*Math.cos(f.heading)-z*Math.sin(f.heading),p.height+y,f.z+x*Math.sin(f.heading)+z*Math.cos(f.heading)];
 const anchor=id==='GPU'?cabin(.83,-1.1,.7):id==='PCA'?bridge(p.length+pcaReelLayout.mount[0]+pcaReelLayout.outlet[0],p.height+pcaReelLayout.mount[1]+pcaReelLayout.outlet[1]-pcaReelLayout.lipDrop,-pcaReelLayout.spacing+pcaReelLayout.outlet[2]):bridge(p.length-1.985,1.3,-2.419);
 const pickup=id==='GPU'?cabin(.65,1.05-p.height,1.65):id==='PCA'?bridge(p.length-1.5,1.05,-2.75):bridge(p.length-1.985,1.0,-2.95);
 const guide:Point=[pickup[0],.16,pickup[2]];
 return {anchor,pickup,guide,control:pickup};
}
export function heldConnector(player:Point,yaw:number,pitch=0):Point {
 return [player[0]-.58*Math.sin(yaw)+.27*Math.cos(yaw),player[1]+1.12+.2*Math.sin(pitch),player[2]-.58*Math.cos(yaw)-.27*Math.sin(yaw)];
}
export const cableLength=(points:Point[])=>points.slice(1).reduce((sum,p,i)=>sum+distance(points[i],p),0);
export function cableControlPoints(m:Mission,id:ServiceId,end:Point,route=m.cableRoutes[id]):Point[] {
 const mount=serviceMount(m,id);
 const stair=id==='PWS'?mobileHoseGuides(m.mobileSteps,end):null;
 return [mount.anchor,mount.pickup,mount.guide,...route,...(stair??[[end[0],.16,end[2]] as Point]),end];
}
export function cableFreeEnd(m:Mission,id:ServiceId,end:Point):Point{return id==='PWS'?mobileHoseGuides(m.mobileSteps,end)?.[0]??end:end;}
export function stage(m: Mission) {
  if (!m.started) return 0;
  if (!m.checks.every(Boolean)) return 1;
  if (!m.docked) return 2;
  if (!m.descended) return 3;
  if (m.services.GPU !== 'active') return 4;
  if (m.services.PCA !== 'active') return 5;
  if (m.services.PWS !== 'complete') return 6;
  return m.complete ? 8 : 7;
}
export const objectives = ['Nhận chuyến bay VN 268', 'Đi dọc cầu · kiểm tra 4 điều kiện an toàn', 'Đến bàn điều khiển · căn chỉnh cửa L1', 'Rời bàn · mở cửa sau cabin · xuống cầu thang', 'GPU · cấp điện tại đầu tàu bay', 'PCA · cấp khí ở bụng giữa hai cánh', 'PWS · lấy thang, đẩy tới đuôi, chốt bánh, leo lên và kết nối', 'Kiểm tra tổng thể tại bảng bàn giao', 'Hoàn thành phục vụ'];
export const consolePosition = (m: Mission): Point => { const f=cabinFrame(m.bridge.pose); return [f.x-.5*Math.cos(f.heading),m.bridge.pose.height,f.z-.5*Math.sin(f.heading)]; };
export function fail(m: Mission, message: string): Mission { return {...m,errors:m.errors+1,message}; }
export function serviceAction(m: Mission, id: ServiceId, target: 'unit'|'socket', player: Point, aiming = true): Mission {
  const cfg=groundConfig.services[id], state=m.services[id], step=stage(m), required=4+serviceIds.indexOf(id);
  if (step !== required) return fail(m,'Hoàn thành nhiệm vụ hiện tại trước khi thao tác dịch vụ này.');
  const mount=serviceMount(m,id),at=target==='unit'?mount.control:cfg.socket;
  if (distance([player[0],player[1]+(target==='socket'?1.65:1),player[2]],at)>(target==='socket'?groundConfig.connectorRange:groundConfig.interactionRange)) return fail(m,'Hãy đến gần đúng thiết bị / đầu nối.');
  if(id==='PWS'&&target==='socket'&&(!mobileReady(m.mobileSteps)||!onMobilePlatform(m.mobileSteps,player)||!m.mobileSteps.climbed))return fail(m,'PWS: đẩy thang đúng vị trí dưới đuôi, chốt bánh và tự leo lên sàn thang trước.');
  if(id==='PWS'&&target==='unit'&&state==='locked'&&(!mobileReady(m.mobileSteps)||m.mobileSteps.phase!=='locked'||!m.mobileSteps.climbed))return fail(m,'PWS: thang phải giữ đúng vị trí và còn chốt bánh.');
  let next: ServicePhase = state;
  if (target==='unit') {
    if(state==='idle') next='inspected';
    else if(state==='inspected' && !carrying(m)) next='carrying';
    else if(state==='carrying')return {...m,services:{...m.services,[id]:'inspected'},cableRoutes:{...m.cableRoutes,[id]:[]},message:`${id} · Đã trả đầu nối vào giá trên cầu.`};
    else if(state==='locked') next='active';
    else if(state==='active' && id==='PWS' && m.water>=1) next='complete';
    else return fail(m,id==='PWS' && state==='active'?'Chưa đủ lượng nước mục tiêu.':'Cần cắm và khóa đầu nối tại tàu bay trước khi cấp dịch vụ.');
  } else {
    if(state==='carrying') {
      if(id==='PWS'&&!m.waterPanel)return {...m,waterPanel:true,message:'PWS · Đã mở bảng cấp nước sạch. Căn đầu nối rồi nhấn E để cắm.'};
      if(!aiming) return fail(m,'Căn tâm ngắm vào đúng đầu nối trước khi cắm.');
      if(cableLength(cableControlPoints(m,id,cfg.socket))>cfg.maxLength) return fail(m,'Đầu nối nằm ngoài chiều dài cáp / ống.');
      next='connected';
    } else if(state==='connected') next='locked';
    else return fail(m,'Lấy đúng đầu nối tại thiết bị trước.');
  }
  return {...m,services:{...m.services,[id]:next},message:`${id} · ${phaseLabels[next]}${next==='carrying'?' — đầu nối đang ở trên tay; đi bộ kéo đến đầu nhận dưới tàu bay.':next==='locked'?' — trở lại thiết bị trên cầu để khởi động.':''}`};
}
export function advanceMission(m: Mission, seconds: number): Mission {
  if(!m.started || m.complete) return m;
  if(m.services.PWS==='active'&&(m.mobileSteps.phase!=='locked'||!mobileReady(m.mobileSteps)))return {...m,elapsed:m.elapsed+seconds,services:{...m.services,PWS:'locked'},message:'PWS đã ngắt: thang không còn ở vị trí cố định an toàn.'};
  const water=m.services.PWS==='active'?Math.min(1,m.water+seconds/groundConfig.waterSeconds):m.water;
  return {...m,elapsed:m.elapsed+seconds,water};
}
export function secureBridge(m: Mission): Mission {
  const p=m.bridge.pose,g=metrics(p),t=groundConfig.dockingTolerance;
  if(!m.checks.every(Boolean) || !aligned(p) || Math.abs(g.offset)>t.offset || Math.abs(p.angle+p.cabYaw)>t.yaw || Math.abs(g.heightError)>t.height || p.canopy<.999 || !m.bridge.autoLevel || m.bridge.fault) return fail(m,'Cần căn chỉnh lệch cửa ≤ 0,18 m, góc ≤ 5°, triển khai canopy và bật theo dõi cao độ.');
  return {...m,docked:true,accuracy:Math.max(0,100-100*(Math.abs(g.heightError)/t.height+Math.abs(g.offset)/t.offset+Math.abs(p.angle+p.cabYaw)/t.yaw)/3),message:'Cầu ổn định. Rời bàn, đến cửa ống đầu sát cabin, nhấn E mở cửa và xuống cầu thang.'};
}
export const handover: Point = [-8,0,24];
/** Re-entering the console does not detach the bridge; C explicitly starts a new approach. */
export function restartGroundDocking(m:Mission,player:Point):Mission {
 if(distance(player,consolePosition(m))>=1.7)return fail(m,'Hãy vào bàn điều khiển trước khi cập cầu lại.');
 if(m.complete)return fail(m,'Ca phục vụ đã bàn giao. Chọn Chơi lại để bắt đầu ca mới.');
 if(m.stairDoorOpen)return fail(m,'Đóng cửa cầu thang trước khi cập cầu lại.');
 if(serviceIds.some(id=>!['idle','inspected'].includes(m.services[id])))return fail(m,'Dây/ống dịch vụ đang được sử dụng. Cầu bị khóa chuyển động để bảo vệ các kết nối.');
 if(m.bridge.fault||m.bridge.emergency||!m.bridge.power)return fail(m,'Khôi phục lỗi / dừng khẩn cấp và bật nguồn trước khi cập cầu lại.');
 let bridge=command(m.bridge,{type:'haltJog'});
 if(bridge.connectedOnce)bridge=command(bridge,{type:'service'});
 if(bridge.autoLevel)bridge=command(bridge,{type:'autolevel',on:false});
 bridge=command(bridge,{type:'canopy',open:false});
 if(bridge.target.canopy!==0||bridge.autoLevel)return {...m,message:bridge.message};
 return {...m,bridge,docked:false,descended:false,accuracy:0,message:'Đang thu canopy để cập cầu lại. Chờ thu hoàn toàn, dùng WASD / R/F / Q/Z căn chỉnh; E triển khai canopy, Tab rời bàn.'};
}
export function finishMission(m: Mission, player: Point, linesClear: boolean): Mission {
  if(stage(m)!==7 || distance(player,handover)>2.3 || !linesClear || !aligned(m.bridge.pose) || !m.bridge.autoLevel || m.bridge.fault || m.mobileSteps.phase!=='locked' || !mobileReady(m.mobileSteps)) return fail(m,'Chưa đủ điều kiện bàn giao: kiểm tra cầu, dịch vụ, chốt thang và tuyến cáp/ống.');
  return {...m,complete:true,message:'Đã hoàn thành ca phục vụ VN 268.'};
}

/** Service access moves with the tunnel immediately behind the cabin, not the terminal rotunda. */
export const stairConfig = { setback:2.9, doorSide:1.145, halfDoor:.55, side:2.4, halfWidth:.64, run:6.4, steps:32, landingBack:1, landingFront:1, interactionRange:2.1 };
export function stairFrame(m:{bridge:{pose:Pose}}) {
 const p=m.bridge.pose,a=p.angle*Math.PI/180,along=p.length-stairConfig.setback;
 return {x:standLayout.rotundaX+along*Math.cos(a),z:standLayout.rotundaZ+along*Math.sin(a),a,height:3+(p.height-3)*along/p.length,along};
}
export function stairLocal(player:Point,m:Mission){const f=stairFrame(m),dx=player[0]-f.x,dz=player[2]-f.z;return {x:dx*Math.cos(f.a)+dz*Math.sin(f.a),z:-dx*Math.sin(f.a)+dz*Math.cos(f.a)};}
export function stairWorld(x:number,y:number,z:number,m:Mission):Point {const f=stairFrame(m);return [f.x+x*Math.cos(f.a)-z*Math.sin(f.a),y,f.z+x*Math.sin(f.a)+z*Math.cos(f.a)];}
export const stairDoorPosition=(m:Mission):Point=>stairWorld(0,stairFrame(m).height,stairConfig.doorSide,m);
export const nearStairDoor=(m:Mission,player:Point)=>distance(player,stairDoorPosition(m))<=stairConfig.interactionRange;
export function stairDoorBlockReason(m:Mission){
 if(moving(m.bridge)||m.bridge.actualSpeed>.005)return 'Cửa đang khóa vì cầu còn chuyển động. Nhả điều khiển, nhấn Tab rời bàn rồi mở cửa.';
 if(m.bridge.fault||m.bridge.emergency)return 'Cửa đang khóa do cầu có lỗi / dừng khẩn cấp. Khôi phục cầu trước khi xuống thang.';
 return null;
}
export function leaveGroundConsole(m:Mission):Mission {
 const stopped={...m,bridge:command(m.bridge,{type:'haltJog'})};
 // Do not require an extra invisible confirmation before allowing the next task.
 const secured=secureBridge(stopped);
 return secured.docked?{...secured,message:'Đã rời bàn. Đến cửa cầu thang sau cabin và nhấn E để mở.'}:{...stopped,message:'Đã dừng và rời bàn. Bạn có thể đi tới cửa cầu thang; nhiệm vụ phục vụ vẫn chờ căn chỉnh cầu.'};
}
export function toggleStairDoor(m:Mission,player:Point):Mission {
 if(!nearStairDoor(m,player))return fail(m,'Hãy đến gần cửa cầu thang sau cabin đến khi xuất hiện gợi ý E.');
 const block=stairDoorBlockReason(m);if(block)return {...m,message:block};
 const q=stairLocal(player,m);
 if(m.stairDoorOpen&&Math.abs(q.x)<.8&&Math.abs(q.z-stairConfig.doorSide)<.4)return {...m,message:'Hãy rời khỏi ngưỡng cửa trước khi đóng cửa.'};
 return {...m,stairDoorOpen:!m.stairDoorOpen,message:m.stairDoorOpen?'Đã đóng cửa cầu thang; có thể sử dụng bàn điều khiển.':'Đã mở cửa. Đi qua chiếu nghỉ rồi theo cầu thang xuống sân đỗ; chuyển động cầu bị khóa khi cửa mở.'};
}
export function stairPassable(from:Point,to:Point,m:Mission){
 const a=stairLocal(from,m),b=stairLocal(to,m),door=stairConfig.doorSide;
 if(Math.max(from[1],to[1])<stairFrame(m).height-.3)return true;
 if((a.z-door)*(b.z-door)<=0&&Math.abs(b.x)<1.1)return m.stairDoorOpen&&Math.abs(b.x)<stairConfig.halfDoor-groundConfig.radius;
 return true;
}
export function atStairBottom(player:Point,m:Mission){const q=stairLocal(player,m);return player[1]<.2&&q.x< -stairConfig.landingBack-stairConfig.run+.3&&Math.abs(q.z-stairConfig.side)<1;}
export const wheelCompass=(angle:number,steering:number)=>({steering:Math.max(-90,Math.min(90,steering)),heading:((90+angle+steering)%360+360)%360});

export function mobileStepsAction(m:Mission,action:'handle'|'brake',player:Point):Mission {
 const l=m.mobileSteps;
 if(stage(m)!==6)return fail(m,'Thang có bánh xe dành cho nhiệm vụ cấp nước PWS sau khi hoàn thành PCA.');
 if(action==='handle'&&l.phase==='pushing')return {...m,mobileSteps:{...l,phase:'parked'},message:'Đã buông tay đẩy. Đến chốt bánh, nhấn F để cố định thang.'};
 const at=action==='handle'?mobileHandle(l):mobileBrake(l);
 if(distance(player,at)>1.8)return fail(m,'Đến gần tay đẩy / chốt bánh của thang.');
 if(action==='handle'){
  if(carrying(m))return fail(m,'Trả đầu nối vào giá trước khi dùng hai tay đẩy thang.');
  if(l.phase==='locked')return fail(m,'Nhả chốt bánh bằng F trước khi đẩy thang.');
  return {...m,mobileSteps:{...l,phase:'pushing',climbed:false},message:'Đang đẩy thang: W/S tiến/lùi, A/D xoay hướng, E buông tay. Đưa sàn thang vào khung PWS dưới đuôi.'};
 }
 if(l.phase==='pushing')return fail(m,'Buông tay đẩy bằng E trước khi chốt bánh.');
 if(player[1]>.2)return fail(m,'Xuống khỏi thang trước khi thao tác chốt bánh.');
 if(l.phase==='locked'){
  if(['connected','locked','active'].includes(m.services.PWS)||carrying(m)==='PWS')return fail(m,'PWS đang sử dụng ống nước: giữ nguyên chốt bánh.');
  return {...m,mobileSteps:{...l,phase:'parked',climbed:false},message:'Đã nhả chốt bánh; có thể đẩy thang.'};
 }
 if(!mobileReady(l))return fail(m,'Thang chưa đúng khung đỗ PWS: chỉnh vị trí và hướng rồi mới chốt bánh.');
 return {...m,mobileSteps:{...l,phase:'locked'},message:'Đã chốt bánh. Lấy ống nước từ cầu, đi đến chân thang và tự leo từng bậc để kết nối dưới đuôi.'};
}

/** Walkable surfaces share exact dimensions with the rendered stairs and bridge.
 * A small step height permits stair walking; unsupported elevated movement is blocked. */
export function walkFloor(x:number,z:number,y:number,m:Mission): number|null {
  const rz=standLayout.rotundaZ, p=m.bridge.pose, a=p.angle*Math.PI/180;
  const dx=x+12,dz=z-rz,along=dx*Math.cos(a)+dz*Math.sin(a),side=-dx*Math.sin(a)+dz*Math.cos(a);
  const surfaces:number[]=[];
  const mobile=mobileFloor(m.mobileSteps,[x,y,z]);if(mobile!==null)surfaces.push(mobile);
  if(Math.hypot(dx,dz)<1.18) surfaces.push(3);
  if(along>=0 && along<=p.length && Math.abs(side)<.79) surfaces.push(3+(p.height-3)*along/p.length);
  if(Math.hypot(along-p.length,side)<1.12)surfaces.push(p.height);
  const f=cabinFrame(p),fx=x-f.x,fz=z-f.z;
  if(Math.abs(fx*Math.cos(f.heading)+fz*Math.sin(f.heading))<.7 && Math.abs(-fx*Math.sin(f.heading)+fz*Math.cos(f.heading))<.8) surfaces.push(p.height);
  const stair=stairFrame(m),q=stairLocal([x,y,z],m),c=stairConfig;
  if(q.x>=-c.landingBack&&q.x<=c.landingFront&&q.z>=.7&&q.z<=c.side+c.halfWidth)surfaces.push(stair.height);
  if(q.x< -c.landingBack&&q.x>=-c.landingBack-c.run&&Math.abs(q.z-c.side)<c.halfWidth-groundConfig.radius){
    surfaces.push(stair.height*Math.ceil((q.x+c.landingBack+c.run)/(c.run/c.steps))/c.steps);
  }
  surfaces.push(0);
  const reachable=surfaces.filter(h=>Math.abs(h-y)<.24);
  return reachable.length?Math.max(...reachable):null;
}
