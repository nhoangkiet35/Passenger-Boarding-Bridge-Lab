import { carrying, consolePosition, groundConfig, handover, serviceIds, serviceMount, stage, stairDoorPosition, type Mission, type Point } from './groundOps.ts';
import { mobileBrake, mobileHandle, mobileReady, mobileStepsConfig } from './mobileSteps.ts';

/** A single next action, derived from the same states that authorize interactions. */
export function groundGuide(m:Mission):{title:string;detail:string;at:Point|null} {
 const step=stage(m);
 if(step===0)return {title:'Nhận ca phục vụ',detail:'Bắt đầu để kiểm tra an toàn trên cầu.',at:null};
 if(step===1){const check=groundConfig.checks[m.checks.findIndex(v=>!v)];return {title:check.label,detail:'Đi dọc lối đi, đến biển kiểm tra và nhấn E.',at:check.at};}
 if(step===2)return {title:'Căn chỉnh cầu với cửa L1',detail:'Tại bàn điều khiển: căn cầu, E triển khai canopy, E bật auto level. Tab rời bàn.',at:consolePosition(m)};
 if(step===3)return {title:'Xuống sân đỗ',detail:'E mở cửa ở ống đầu sát cabin. Qua chiếu nghỉ và đi hết cầu thang.',at:stairDoorPosition(m)};
 if(step===7)return {title:'Bàn giao ca phục vụ',detail:'Đến bảng bàn giao trên sân đỗ, nhấn E để kiểm tra toàn bộ.',at:handover};
 if(step===8)return {title:'Đã hoàn tất ca phục vụ',detail:'Tất cả bảy nhiệm vụ đã hoàn thành.',at:null};
 const id=serviceIds[step-4],phase=m.services[id],unit=serviceMount(m,id).control,socket=groundConfig.services[id].socket;
 if(id==='PWS'&&['idle','inspected'].includes(phase)&&m.mobileSteps.phase!=='locked'){
  const pushing=m.mobileSteps.phase==='pushing',ready=mobileReady(m.mobileSteps);
  return {title:ready?'Cố định xe thang':pushing?'Đẩy thang tới khung PWS':'Lấy xe thang bên trái tàu bay',detail:ready?'E buông tay đẩy, đến chốt bánh rồi nhấn F.':pushing?'W/S đẩy hoặc lùi · A/D xoay. Đưa sàn thang vào khung dưới đuôi.':'E nắm tay đẩy. Cần cố định thang trước khi lấy ống nước.',at:ready?mobileBrake(m.mobileSteps):pushing?mobileStepsConfig.target:mobileHandle(m.mobileSteps)};
 }
 if(phase==='idle')return {title:`${id} · kiểm tra thiết bị`,detail:'Đến đầu nối trên cầu ở tầm sân đỗ. E kiểm tra, E lần nữa để cầm.',at:unit};
 if(phase==='inspected')return {title:`${id} · lấy đầu nối`,detail:'Nhấn E tại giá để cầm đầu nối rồi đi bộ kéo dây/ống.',at:unit};
 if(carrying(m)===id)return {title:`${id} · ${id==='PWS'&&!m.waterPanel?'leo thang và mở bảng nước':'đưa đầu nối tới tàu bay'}`,detail:id==='PWS'?'Đi lên thang đã chốt. E mở bảng, ngắm ổ nhận và E cắm ống.':'Ngắm đúng ổ nhận, nhấn E để cắm; nhấn E lần nữa để khóa.',at:socket};
 if(phase==='connected')return {title:`${id} · khóa đầu nối`,detail:'Vẫn ở ổ nhận trên tàu bay, nhấn E lần nữa để khóa chắc đầu nối.',at:socket};
 if(phase==='locked')return {title:`${id} · trở lại thiết bị để bật`,detail:'Đầu nối đã khóa. Trở về thiết bị trên cầu, nhấn E để bắt đầu cấp.',at:unit};
 return {title:'PWS · hoàn tất cấp nước',detail:m.water>=1?'Đã đủ 120 L. Nhấn E tại thiết bị PWS để dừng nước.':'Chờ nước đủ 120 L, giữ thang cố định; sau đó E tại thiết bị để dừng.',at:unit};
}
