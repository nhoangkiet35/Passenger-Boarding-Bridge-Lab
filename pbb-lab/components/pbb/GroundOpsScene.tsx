'use client';
import { Children, memo, Suspense, useCallback, useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { Group, Mesh, PerspectiveCamera, Raycaster, TubeGeometry, Vector3 } from 'three';
import { Aircraft, Box, PBB } from './Models';
import { FixedBridge } from './Infrastructure';
import KeyHints from './KeyHints';
import MobileServiceSteps from './MobileServiceSteps';
import { mobileHandle, mobileMoveAllowed, mobilePassable, moveMobile, onMobilePlatform } from '@/lib/mobileSteps';
import { standLayout } from '@/lib/standLayout';
import { command, tick, cabinFrame } from '@/lib/simulation';
import { advanceMission, atStairBottom, cableControlPoints, carrying, consolePosition, groundConfig, handover, heldConnector, serviceIds, serviceMount, stage, stairConfig, stairDoorBlockReason, stairFrame, stairPassable, walkFloor, type Mission, type Point, type ServiceId } from '@/lib/groundOps';
import { cableCurve, clearCableSegment, planCable } from '@/lib/groundCable';

export type Runtime = { mission: Mission; player: Point; yaw:number; pitch:number; third:boolean; operating:boolean; running:boolean; inputMode?:'pointer'|'drag'; keys:Set<string>; recovery:number; handPoint?:Point; linesClear?:boolean; cableLengths?:Partial<Record<ServiceId,number>>; connectCable?:(id:ServiceId)=>boolean; exitConsole?:()=>void; redock?:()=>void; sound?: (kind:'step'|'motor'|'beep')=>void; interact:(key?:'E'|'F')=>void };
export type RuntimeRef = MutableRefObject<Runtime>;
const StaticAircraft=memo(Aircraft);
function Marker({at,children,color='#ffd167',visible=true}:{at:Point;children:React.ReactNode;color?:string;visible?:boolean}) { return <Html position={at} center zIndexRange={[15,0]} style={{pointerEvents:'none',display:visible?'block':'none'}}><span className="ops-marker" style={{borderColor:color}}>{Children.map(children,child=>typeof child==='string'?<KeyHints text={child}/>:child)}</span></Html>; }
const Apron = memo(function Apron(){ return <>
  <Box at={[0,-.22,5]} size={[100,.4,110]} color="#8b9ca4"/>
  <Box at={[0,4,-26]} size={[75,8,10]} color="#b9cbd1"/>
  <Box at={[0,4.8,-20.9]} size={[75,4,.12]} color="#375c70"/>
  {Array.from({length:35},(_,i)=><Box key={i} at={[-34+i*2,4.8,-20.8]} size={[.06,4,.1]} color="#d0e4e8"/>)}
  <FixedBridge show={false}/>
  <Line points={[[7,.012,-10],[7,.012,38]]} color="#ffe09b" lineWidth={4}/>
  {[-8,0,8,16,24,32].map(z=><Line key={z} points={[[-24,.014,z],[25,.014,z]]} color="#9eafb4" lineWidth={1}/>)}
  <Line points={[[-5,.02,-7],[-5,.02,27],[-9,.02,27]]} color="#e6eee8" lineWidth={2} dashed dashSize={.6} gapSize={.4}/>
  {[-.6,.6].map(z=><Box key={z} at={[7,.12,-3.2+z]} size={[1,.24,.25]} color="#f6be41"/>)}
  <Box at={handover.map((v,i)=>i===1?v+.7:v) as Point} size={[.8,1.4,.5]} color="#254f64"/>

</>; });
function ServiceStairs({m}:{m:Mission}) {
 const f=stairFrame(m),c=stairConfig,door=useRef<Group>(null);
 useFrame((_,dt)=>{if(door.current)door.current.rotation.y+=( (m.stairDoorOpen?-Math.PI/2:0)-door.current.rotation.y)*Math.min(1,dt*9);});
 return <group name="service-stair-tunnel-A" position={[f.x,0,f.z]} rotation={[0,-f.a,0]}>
  <Box at={[0,f.height-.09,(.7+c.side+c.halfWidth)/2]} size={[2,.18,c.side+c.halfWidth-.7]} color="#617b8a"/>
  {[-1,1].map(side=><group key={side}>
   <Box at={[side,f.height+1.05,side===-1?1.25:2.1]} size={[.05,.06,side===-1?.65:1.9]} color="#ffd167"/>
   <Box at={[side,f.height+.5,3.03]} size={[.05,1,.05]} color="#ffd167"/>
  </group>)}
  <Box at={[0,f.height+1.05,3.06]} size={[2,.06,.05]} color="#ffd167"/>
  <Box at={[0,f.height+.52,3.06]} size={[2,.05,.05]} color="#d7e3e8"/>
  {[-1,1].map(s=><Box key={s} at={[s*c.halfDoor,f.height+1.12,c.doorSide]} size={[.07,2.24,.12]} color="#dbe8ea"/>)}
  <Box at={[0,f.height+2.26,c.doorSide]} size={[1.18,.08,.12]} color="#ffd167"/>
  <group ref={door} position={[-c.halfDoor,f.height,c.doorSide]}>
   <Box at={[c.halfDoor,1.1,0]} size={[1.1,2.2,.065]} color="#dbe8e7"/>
   <Box at={[c.halfDoor,1.43,-.04]} size={[.67,.77,.025]} color="#3f7787"/>
   <Box at={[.91,.93,-.075]} size={[.16,.055,.08]} color="#efc44c"/>
   <Box at={[.91,.93,.075]} size={[.16,.055,.08]} color="#efc44c"/>
  </group>
  {Array.from({length:c.steps},(_,i)=>{const tread=c.run/c.steps,x=-c.landingBack-(i+.5)*tread,y=f.height*(1-i/c.steps);return <group key={i}>
   <Box at={[x,y-.055,c.side]} size={[tread,.11,c.halfWidth*2]} color="#bdced6"/>
   <Box at={[x-tread/2+.025,y+.006,c.side]} size={[.045,.016,c.halfWidth*2]} color="#f5cb61"/>
   {i%4===0&&[-1,1].map(s=><Box key={s} at={[x,y+.5,c.side+s*c.halfWidth]} size={[.04,1.05,.04]} color="#dbe8ea"/>)}
  </group>;})}
  {[-1,1].map(s=><group key={s}>
   <Line points={[[-c.landingBack,f.height+1.05,c.side+s*c.halfWidth],[-c.landingBack-c.run,1.05,c.side+s*c.halfWidth]]} color="#ffd167" lineWidth={4}/>
   <Line points={[[-c.landingBack,f.height-.14,c.side+s*.54],[-c.landingBack-c.run,-.14,c.side+s*.54]]} color="#4d6778" lineWidth={8}/>
  </group>)}
  <Marker visible={stage(m)===3} at={[0,f.height+2.6,c.doorSide]} color={stairDoorBlockReason(m)?'#f3a576':'#ffd167'}>{stairDoorBlockReason(m)?'CỬA KHÓA · CHỜ CẦU DỪNG':`E · ${m.stairDoorOpen?'ĐÓNG':'MỞ'} CỬA · ỐNG A / SAU CABIN`}</Marker>
 </group>;
}
function ServiceVisuals({r}:{r:RuntimeRef}) {
  const m=r.current.mission;
  return <>{serviceIds.map(id=>{const cfg=groundConfig.services[id],phase=m.services[id],mount=serviceMount(m,id);return <group key={id}>
    <Marker visible={stage(m)===4+serviceIds.indexOf(id)} at={[mount.pickup[0],mount.pickup[1]+.7,mount.pickup[2]]} color={cfg.color}>{id} · {phase==='active'?'● ON':phase==='complete'?'✓':phase==='carrying'?'ĐANG KÉO':phase==='locked'?'E · KHỞI ĐỘNG':phase==='connected'?'CHỜ KHÓA ĐẦU NỐI':'LẤY ĐẦU NỐI TRÊN CẦU'}</Marker>
    <group position={mount.pickup}><mesh position={[0,-.24,0]}><torusGeometry args={[.16,.025,8,16]}/><meshStandardMaterial color="#9db6c3"/></mesh><Box at={[0,-.43,0]} size={[.26,.07,.15]} color="#344e5c"/></group>
    <group position={cfg.socket} rotation={[0,-Math.PI/2,0]}><group rotation={[Math.PI/3,0,0]}>
     <mesh position={[0,0,-.14]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[id==='PCA'?.18:.075,id==='PCA'?.18:.075,.28,20]}/><meshStandardMaterial color="#b6c9cf" metalness={.4}/></mesh>
     {id==='GPU'?<><Box size={[.25,.3,.09]} color="#233844"/><Box at={[0,0,-.055]} size={[.17,.22,.025]} color={cfg.color}/></>:<mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[id==='PCA'?.19:.065,id==='PCA'?.19:.065,.1,24,1,true]}/><meshStandardMaterial color={cfg.color} side={2}/></mesh>}
    </group></group>
    {id==='PWS'&&<Box at={[cfg.socket[0]-.12,cfg.socket[1]+(m.waterPanel?.5:0),cfg.socket[2]+(m.waterPanel?.4:0)]} size={[.06,.5,.55]} color={m.waterPanel?'#d6e9f1':'#4a697c'}/>}
    <Marker visible={stage(m)===4+serviceIds.indexOf(id)} at={[cfg.socket[0],cfg.socket[1]+.7,cfg.socket[2]]} color={cfg.color}>{id} · {id==='GPU'?'ĐẦU TÀU BAY':id==='PCA'?'BỤNG GIỮA HAI CÁNH':'DƯỚI ĐUÔI · CẦN THANG'}</Marker>
    <Hose id={id} r={r}/><ServiceConnector id={id} r={r}/>
    {phase==='active'&&<mesh position={[cfg.socket[0]-.2,cfg.socket[1],cfg.socket[2]]}><sphereGeometry args={[.1,8,8]}/><meshBasicMaterial color={cfg.color}/></mesh>}
  </group>;})}</>;
}
function Hose({id,r}:{id:typeof serviceIds[number];r:RuntimeRef}) {
 const mesh=useRef<Mesh>(null),generated=useRef<TubeGeometry|null>(null),cfg=groundConfig.services[id],last=useRef(''),updated=useRef(0);
 const initial=useMemo(()=>cableCurve([serviceMount(r.current.mission,id).anchor,serviceMount(r.current.mission,id).pickup]),[id,r]);
 useFrame(({clock})=>{const rt=r.current,m=rt.mission,phase=m.services[id],mount=serviceMount(m,id),held=phase==='carrying';
   const end=held?rt.handPoint??heldConnector(rt.player,rt.yaw,rt.pitch):phase==='idle'||phase==='inspected'?mount.pickup:cfg.socket;
   const stamp=[phase,...end.map(v=>v.toFixed(2)),...mount.anchor.map(v=>v.toFixed(2)),m.cableRoutes[id].length].join(',');
   if(!mesh.current||last.current===stamp||clock.elapsedTime-updated.current<.08)return;last.current=stamp;updated.current=clock.elapsedTime;
   const points=phase==='idle'||phase==='inspected'?[mount.anchor,mount.pickup]:cableControlPoints(m,id,end);
   const curve=cableCurve(points),geometry=new TubeGeometry(curve,72,cfg.radius,8,false);
   mesh.current.geometry.dispose();mesh.current.geometry=geometry;generated.current=geometry;
   rt.cableLengths={...rt.cableLengths,[id]:curve.getLength()};
 });
 useEffect(()=>()=>{generated.current?.dispose();},[]);
 return <mesh ref={mesh}><tubeGeometry args={[initial,72,cfg.radius,8,false]}/><meshStandardMaterial color={id==='GPU'?'#303b43':cfg.color} roughness={.8}/></mesh>;
}
function ServiceConnector({id,r}:{id:ServiceId;r:RuntimeRef}) {
 const root=useRef<Group>(null),glove=useRef<Group>(null),cfg=groundConfig.services[id];
 useFrame(()=>{const rt=r.current,phase=rt.mission.services[id],held=phase==='carrying',stowed=phase==='idle'||phase==='inspected';
  const at=held?rt.handPoint??heldConnector(rt.player,rt.yaw,rt.pitch):stowed?serviceMount(rt.mission,id).pickup:cfg.socket;
  if(root.current){root.current.position.set(...at);root.current.rotation.set(held?rt.pitch:stowed?0:Math.PI/3,held?rt.yaw:stowed?rt.mission.bridge.pose.angle*Math.PI/180:-Math.PI/2,0,'YXZ');}
  if(glove.current)glove.current.visible=held;
 });
 return <group ref={root} name={`connector-${id}`}>
  {id==='GPU'?<>
   <Box at={[0,0,.08]} size={[.16,.2,.28]} color="#354a59"/>
   <Box at={[0,0,-.065]} size={[.17,.21,.045]} color={cfg.color}/>
   {[-.045,.045].flatMap(x=>[-.06,0,.06].map(y=><mesh key={`${x}:${y}`} position={[x,y,-.11]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.012,.012,.06,8]}/><meshStandardMaterial color="#c4c8ac" metalness={.7}/></mesh>))}
   <Box at={[0,.15,.12]} size={[.07,.09,.13]} color="#ef9b45"/>
  </>:<>
   <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[id==='PCA'?.17:.055,id==='PCA'?.145:.045,.26,24,1,true]}/><meshStandardMaterial color={cfg.color} side={2}/></mesh>
   {[-.13,.08].map(z=><mesh key={z} position={[0,0,z]}><torusGeometry args={[id==='PCA'?.18:.065,id==='PCA'?.025:.012,8,24]}/><meshStandardMaterial color="#c2d1d9" metalness={.6}/></mesh>)}
   <Box at={[id==='PCA'?.2:.085,0,0]} size={[.04,.12,.09]} color="#dce6e9"/>
  </>}
  <group ref={glove} visible={false}>
   <mesh position={[.11,-.07,.13]} scale={[1,.65,1]}><sphereGeometry args={[.105,12,10]}/><meshStandardMaterial color="#e3d8b7"/></mesh>
   <Box at={[.19,-.12,.21]} size={[.14,.17,.28]} color="#edb94e"/>
   <Box at={[.19,-.12,.32]} size={[.145,.175,.05]} color="#e9f0ee"/>
  </group>
 </group>;
}
function Player({r,solids,fixedSolids,onUpdate}:{r:RuntimeRef;solids:MutableRefObject<Group|null>;fixedSolids:MutableRefObject<Group|null>;onUpdate:()=>void}) {
 const {camera,gl}=useThree(); const avatar=useRef<Group>(null),ray=useMemo(()=>new Raycaster(),[]),last=useRef(0),lastHand=useRef(''),lastLines=useRef(0),foot=useRef(0),lastRecovery=useRef(-1),lastCabinHeading=useRef<number|null>(null);
 useEffect(()=>{
  const canvas=gl.domElement;
  const mouse=(e:MouseEvent)=>{if(document.pointerLockElement!==canvas&&!(r.current.running&&r.current.inputMode==='drag'&&(e.buttons&3)&&e.target===canvas))return;r.current.yaw-=e.movementX*.002;r.current.pitch=Math.max(-1.35,Math.min(1.35,r.current.pitch-e.movementY*.002));};
  const key=(e:KeyboardEvent)=>{
   if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
   if(document.pointerLockElement!==canvas&&!(r.current.running&&r.current.inputMode==='drag')){if(e.code==='KeyE'&&r.current.mission.started){r.current.mission.message='Game đang tạm dừng. Bấm Tiếp tục hoặc Chơi bằng kéo chuột, rồi đến gần cửa và nhấn E.';onUpdate();}return;}
   if(e.code==='Escape'&&r.current.inputMode==='drag'){r.current.running=false;r.current.keys.clear();r.current.mission.bridge=command(r.current.mission.bridge,{type:'haltJog'});if(r.current.mission.mobileSteps.phase==='pushing')r.current.mission.mobileSteps.phase='parked';onUpdate();return;}
   if(['Space','ArrowUp','ArrowDown','Tab'].includes(e.code))e.preventDefault();
   if(!e.repeat){if(e.code==='Tab'&&r.current.operating){r.current.exitConsole?.();return;}if(e.code==='KeyC'&&r.current.operating){r.current.redock?.();return;}if(e.code==='KeyE')r.current.interact('E');if(e.code==='KeyF'&&!r.current.operating)r.current.interact('F');if(e.code==='KeyV')r.current.third=!r.current.third;}
   r.current.keys.add(e.code);
  };
  const up=(e:KeyboardEvent)=>r.current.keys.delete(e.code);
  const lock=()=>{r.current.running=document.pointerLockElement===canvas;r.current.keys.clear();if(r.current.running)r.current.inputMode='pointer';else {r.current.mission.bridge=command(r.current.mission.bridge,{type:'haltJog'});if(r.current.mission.mobileSteps.phase==='pushing')r.current.mission.mobileSteps.phase='parked';}onUpdate();};
  const blur=()=>{r.current.keys.clear();r.current.running=false;r.current.mission.bridge=command(r.current.mission.bridge,{type:'haltJog'});if(r.current.mission.mobileSteps.phase==='pushing')r.current.mission.mobileSteps.phase='parked';document.exitPointerLock();onUpdate();};
  const context=(e:MouseEvent)=>{if(r.current.inputMode==='drag')e.preventDefault();};
  document.addEventListener('mousemove',mouse);document.addEventListener('keydown',key);document.addEventListener('keyup',up);document.addEventListener('pointerlockchange',lock);window.addEventListener('blur',blur);canvas.addEventListener('contextmenu',context);
  return ()=>{document.removeEventListener('mousemove',mouse);document.removeEventListener('keydown',key);document.removeEventListener('keyup',up);document.removeEventListener('pointerlockchange',lock);window.removeEventListener('blur',blur);canvas.removeEventListener('contextmenu',context);};
 },[gl,r,onUpdate]);
 useFrame((state,raw)=>{
  const rt=r.current,dt=Math.min(raw,.05),m=rt.mission,k=rt.keys;
  const colliders:Mesh[]=[],fixed:Mesh[]=[];
  const collect=(root:Group|null,list:Mesh[])=>root?.traverse(object=>{if(object instanceof Mesh&&!(object as Mesh&{isLineSegments2?:boolean}).isLineSegments2){if(!object.geometry.boundingBox)object.geometry.computeBoundingBox();list.push(object);}});
  // Driving uses the analytic safety integrator; no walking/cable rays are needed yet.
  if(!rt.operating||serviceIds.some(id=>!['idle','inspected'].includes(m.services[id]))){collect(solids.current,colliders);collect(fixedSolids.current,fixed);}
  const routeFor=(id:ServiceId,end:Point)=>planCable(m,id,end,(from,to)=>clearCableSegment(from,to,colliders,ray,groundConfig.services[id].radius));
  rt.connectCable=(id)=>{const current=r.current.mission,plan=planCable(current,id,groundConfig.services[id].socket,(from,to)=>clearCableSegment(from,to,colliders,ray,groundConfig.services[id].radius));if(!plan){current.message='Tuyến dây/ống bị vướng hoặc vượt chiều dài. Hãy đi vòng vật cản trước khi cắm.';current.errors++;return false;}current.cableRoutes[id]=plan.route;return true;};
  if(lastRecovery.current!==rt.recovery){lastRecovery.current=rt.recovery;camera.position.set(rt.player[0],rt.player[1]+1.65,rt.player[2]);}
  if(rt.running&&!m.complete){
   if(rt.operating&&m.stairDoorOpen){m.bridge=command(m.bridge,{type:'haltJog'});rt.operating=false;m.message='Cửa cầu thang đang mở; cầu đã dừng và khóa điều khiển chuyển động.';}
   if(rt.operating){
    const axes={length:Number(k.has('KeyW'))-Number(k.has('KeyS')),angle:Number(k.has('KeyD'))-Number(k.has('KeyA')),height:Number(k.has('KeyR'))-Number(k.has('KeyF')),cabYaw:Number(k.has('KeyQ'))-Number(k.has('KeyZ'))};
    if(Object.values(axes).some(Boolean)){if(!m.bridge.jog||Object.entries(axes).some(([axis,value])=>m.bridge.jog?.[axis as keyof typeof axes]!==value))m.bridge=command(m.bridge,{type:'jog',axes});}
    else if(m.bridge.jog)m.bridge=command(m.bridge,{type:'haltJog'});
    m.bridge=tick(m.bridge,dt);rt.player=consolePosition(m);
    if(Object.values(axes).some(Boolean))rt.sound?.('motor');
   } else if(m.mobileSteps.phase==='pushing'){
    const next=moveMobile(m.mobileSteps,Number(k.has('KeyW'))-Number(k.has('KeyS')),Number(k.has('KeyD'))-Number(k.has('KeyA')),dt);
    const clear=mobileMoveAllowed(m.mobileSteps,next,(a,b)=>clearCableSegment(a,b,fixed,ray,.12));
    if(clear){m.mobileSteps=next;rt.player=mobileHandle(next);rt.yaw=-Math.PI/2-next.angle;}else m.message='Thang vướng tàu bay / thiết bị. Lùi lại và đẩy vòng qua vật cản.';
    m.bridge=tick(m.bridge,dt);
   } else {
    const f=Number(k.has('KeyW'))-Number(k.has('KeyS')),s=Number(k.has('KeyD'))-Number(k.has('KeyA'));
    const n=Math.hypot(f,s)||1, speed=groundConfig.walkSpeed*dt/n;
    const dx=(-Math.sin(rt.yaw)*f+Math.cos(rt.yaw)*s)*speed,dz=(-Math.cos(rt.yaw)*f-Math.sin(rt.yaw)*s)*speed;
    const attempt=(x:number,z:number)=>{
      const p=rt.player, floor=walkFloor(x,z,p[1],m);if(floor===null||Math.abs(x)>40||z>42||z< -20||!stairPassable(p,[x,floor,z],m)||!mobilePassable(m.mobileSteps,p,[x,floor,z]))return;
      const held=carrying(m),plan=held?routeFor(held,heldConnector([x,floor,z],rt.yaw,rt.pitch)):null;
      if(held&&!plan){m.message='Cáp/ống đã căng hoặc vướng vật cản. Lùi lại và đi vòng; không thể kéo dài vô hạn.';return;}
      if(p[1]<.3){
        const delta=new Vector3(x-p[0],0,z-p[2]),len=delta.length();if(len){delta.normalize();
          for(const height of [.35,1.2]){ray.set(new Vector3(p[0],p[1]+height,p[2]),delta);ray.far=len+groundConfig.radius;if(ray.intersectObjects(colliders,false).some(hit=>hit.object.userData.walkThrough!==true))return;}
        }
      }
      if(held&&plan){m.cableRoutes[held]=plan.route;rt.handPoint=heldConnector([x,floor,z],rt.yaw,rt.pitch);}
      rt.player=[x,floor,z];
    };
    if(Math.abs(dx)>.00001)attempt(rt.player[0]+dx,rt.player[2]);if(Math.abs(dz)>.00001)attempt(rt.player[0],rt.player[2]+dz);
    if(f||s){foot.current+=dt;if(foot.current>.44){rt.sound?.('step');foot.current=0;}}
    if(m.docked&&atStairBottom(rt.player,m))m.descended=true;
    if(onMobilePlatform(m.mobileSteps,rt.player))m.mobileSteps.climbed=true;
    m.bridge=tick(m.bridge,dt);
   }
   rt.mission=advanceMission(m,dt);
  }
  if(rt.operating){const heading=cabinFrame(m.bridge.pose).heading;if(lastCabinHeading.current!==null)rt.yaw-=heading-lastCabinHeading.current;lastCabinHeading.current=heading;}else lastCabinHeading.current=null;
  const p=rt.player;camera.rotation.set(rt.pitch,rt.yaw,0,'YXZ');camera.position.set(p[0],p[1]+1.65,p[2]);
  const held=carrying(m);
  if(held){
   const candidate=heldConnector(p,rt.yaw,rt.pitch),stamp=[held,...candidate.map(v=>v.toFixed(2))].join(',');
   if(stamp!==lastHand.current){lastHand.current=stamp;const plan=routeFor(held,candidate);if(plan){rt.handPoint=candidate;m.cableRoutes[held]=plan.route;}}
  }else {rt.handPoint=undefined;lastHand.current='';}
  if(state.clock.elapsedTime-lastLines.current>.25){lastLines.current=state.clock.elapsedTime;rt.linesClear=serviceIds.every(id=>{
   const phase=m.services[id];if(['idle','inspected','carrying'].includes(phase))return true;
   return !!routeFor(id,groundConfig.services[id].socket);
  });}
  if(rt.third&&!rt.operating){const back=new Vector3(0,0,3.5).applyAxisAngle(new Vector3(0,1,0),rt.yaw);ray.set(camera.position,back.clone().normalize());ray.far=3.5;const hit=ray.intersectObjects(colliders,false)[0];camera.position.add(back.multiplyScalar(hit?Math.max(.05,(hit.distance-.3)/3.5):1));camera.position.y+=.5;}
  if(avatar.current){avatar.current.visible=rt.third&&!rt.operating;avatar.current.position.set(...p);avatar.current.rotation.y=rt.yaw;}
  if(state.clock.elapsedTime-last.current>.05){onUpdate();last.current=state.clock.elapsedTime;}
 },-2);
 return <group ref={avatar}><Box at={[0,.95,0]} size={[.48,.65,.28]} color="#e5f252"/><Box at={[0,1,0]} size={[.5,.1,.3]} color="#e9ece9"/><mesh position={[0,1.52,0]}><sphereGeometry args={[.19,12,12]}/><meshStandardMaterial color="#dbb08e"/></mesh>{[-.13,.13].map(x=><Box key={x} at={[x,.32,0]} size={[.17,.65,.2]} color="#243e50"/>)}</group>;
}
function World({r,onUpdate}:{r:RuntimeRef;onUpdate:()=>void}) {
 const solids=useRef<Group>(null),fixedSolids=useRef<Group>(null),m=r.current.mission;
 const livePose=useCallback(()=>r.current.mission.bridge.pose,[r]);
 return <><color attach="background" args={['#bed4dd']}/><fog attach="fog" args={['#bed4dd',60,140]}/><hemisphereLight args={['#ffffff','#627580',2]}/><directionalLight position={[-20,35,-15]} intensity={2.5}/>
  <Apron/>
  <group ref={solids}><group ref={fixedSolids}><ServiceStairs m={m}/><StaticAircraft labels={false} annotations={false} doorOpen={false} halted/><PBB livePose={livePose} serviceAccess pose={m.bridge.pose} labels={false} annotations={false} highlight={false} halted={!r.current.operating} autoLevel={m.bridge.autoLevel} wheelRotation={m.bridge.wheelRotation} wheelTravel={m.bridge.wheelTravel} aux={{interior:true,exterior:true,aircon:false,ventilation:false}}/></group><MobileServiceSteps steps={m.mobileSteps} showGuide={stage(m)===6}/>
  </group>
  <ServiceVisuals r={r}/>
  {groundConfig.checks.map((c,i)=><Marker visible={m.started&&stage(m)===1&&i===m.checks.findIndex(v=>!v)} key={c.label} at={[c.at[0],c.at[1]+2,c.at[2]]} color={m.checks[i]?'#68e2ae':'#ffd167'}>{m.checks[i]?'✓':'E'} · {c.label}</Marker>)}
  <Marker visible={stage(m)===2} at={consolePosition(m).map((v,i)=>i===1?v+2:v) as Point}>PBB · BÀN ĐIỀU KHIỂN</Marker>
  <Marker visible={stage(m)===7} at={[-8,2.4,24]}>E · BÀN GIAO</Marker>
  <Player r={r} solids={solids} fixedSolids={fixedSolids} onUpdate={onUpdate}/>
  <SupportCamera r={r}/>
 </>;
}
function SupportCamera({r}:{r:RuntimeRef}) {
 const support=useMemo(()=>new PerspectiveCamera(55,1.5,.1,180),[]);
 useFrame(({gl,scene,camera,size})=>{
  gl.setViewport(0,0,size.width,size.height);gl.setScissorTest(false);gl.autoClear=true;gl.render(scene,camera);
  if(r.current.operating&&size.width>1000){
   const f=cabinFrame(r.current.mission.bridge.pose);support.position.set(f.x-5,8,f.z+7);support.lookAt(4,3,0);
   gl.autoClear=false;gl.clearDepth();gl.setScissorTest(true);gl.setScissor(size.width-284,150,260,174);gl.setViewport(size.width-284,150,260,174);gl.render(scene,support);
   gl.setScissorTest(false);gl.setViewport(0,0,size.width,size.height);gl.autoClear=true;
  }
 },1);
 return null;
}
export default function GroundOpsScene({r,onUpdate}:{r:RuntimeRef;onUpdate:()=>void}) {return <Canvas dpr={[1,1.5]} camera={{fov:68,near:.05,far:180}}><Suspense fallback={null}><World r={r} onUpdate={onUpdate}/></Suspense></Canvas>;}
