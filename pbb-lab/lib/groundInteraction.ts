import {consolePosition,distance,groundConfig,handover,serviceIds,serviceMount,stage,nearStairDoor,stairDoorBlockReason,type Mission,type Point} from './groundOps.ts';
import {mobileBrake,mobileHandle} from './mobileSteps.ts';
export type GroundInteractionContext={mission:Mission;player:Point;operating:boolean};
export function groundInteraction(rt:GroundInteractionContext) {
 const m=rt.mission,p=rt.player,step=stage(m);
 if(m.mobileSteps.phase==='pushing')return {kind:'mobile',action:'handle',key:'E',label:'Buông tay đẩy thang'} as const;
 if(step===6&&p[1]<.2){
  if(distance(p,mobileBrake(m.mobileSteps))<1.8)return {kind:'mobile',action:'brake',key:'F',label:m.mobileSteps.phase==='locked'?'Nhả chốt bánh thang':'Chốt bánh thang'} as const;
  if(distance(p,mobileHandle(m.mobileSteps))<1.8)return {kind:'mobile',action:'handle',key:'E',label:'Nắm tay đẩy · lấy thang có bánh xe'} as const;
 }
 if(!rt.operating&&nearStairDoor(m,p)){const blocked=stairDoorBlockReason(m);return {kind:'stairDoor',key:'E',label:blocked??`${m.stairDoorOpen?'Đóng':'Mở'} cửa cầu thang · ống A sau cabin`} as const;}
 if(step===1){const i=groundConfig.checks.findIndex(c=>distance(p,c.at)<1.4&&!m.checks[groundConfig.checks.indexOf(c)]);if(i>=0)return {kind:'check',i,label:groundConfig.checks[i].label} as const;}

 if(distance(p,consolePosition(m))<1.7)return {kind:'console',key:rt.operating&&m.docked?'C':'E',label:rt.operating?(m.docked?'Cập cầu lại / thu canopy · Tab rời bàn':m.bridge.pose.canopy<.999?'Triển khai canopy (cần căn chỉnh)':!m.bridge.autoLevel?'Bật theo dõi cao độ':'Cố định cầu và rời bàn'):'Vào bàn điều khiển PBB'} as const;
 if(step===7&&distance(p,handover)<2.3)return {kind:'finish',label:'Kiểm tra tổng thể và bàn giao'} as const;
 const eye:Point=[p[0],p[1]+1.65,p[2]];
 const hand:Point=[p[0],p[1]+1,p[2]];
 const near=serviceIds.flatMap(id=>[{id,kind:'unit' as const,at:serviceMount(m,id).control},{id,kind:'socket' as const,at:groundConfig.services[id].socket}]).filter(t=>distance(t.kind==='unit'?hand:eye,t.at)<(t.kind==='socket'?groundConfig.connectorRange:groundConfig.interactionRange)).sort((a,b)=>Number(serviceIds.indexOf(b.id)===step-4)-Number(serviceIds.indexOf(a.id)===step-4)||distance(eye,a.at)-distance(eye,b.at))[0];
 if(near){const phase=m.services[near.id];
 if(serviceIds.indexOf(near.id)!==step-4)return {...near,label:`${near.id} · ${phase==='active'?'Đang hoạt động':phase==='complete'?'Đã hoàn tất':'Hoàn thành nhiệm vụ hiện tại trước'}`};const action=near.kind==='socket'?(phase==='locked'?'Đã khóa · trở lại thiết bị để bật':phase==='connected'?'Khóa và kiểm tra chắc chắn':near.id==='PWS'&&!m.waterPanel?'Mở bảng nước sạch dưới tàu bay':'Căn tâm ngắm và cắm đầu nối'):phase==='idle'?'Kiểm tra thiết bị và đầu nối trên cầu':phase==='inspected'?'Cầm đầu nối · kéo dây/ống ra':phase==='carrying'?'Trả đầu nối vào giá trên cầu':phase==='active'&&near.id==='PWS'?(m.water>=1?'Dừng cấp nước':'Đang cấp nước · chờ đủ 120 L'):phase==='connected'?'Trở lại ổ nhận để khóa đầu nối':'Khởi động tại thiết bị trên cầu';return {...near,label:`${near.id} · ${action}`};}
 return null;
}
