export type VdgsScenario = 'normal' | 'offset' | 'obstacle';
export type VdgsState = { distance: number; elapsed: number; offset: number; speed: number; obstacle: boolean; emergency: boolean };
export const vdgsInitial = (scenario: VdgsScenario): VdgsState => ({ distance: 65, elapsed: 0, offset: scenario === 'offset' ? 3 : 0, speed: 0, obstacle: false, emergency: false });
export function vdgsSignal(s: VdgsState) {
 if(s.emergency) return {code:'STOP',text:'Dừng khẩn cấp',tone:'red'};
 if(s.obstacle) return {code:'STOP',text:'Phát hiện vật cản trong vùng tiếp cận',tone:'red'};
 if(s.distance===0) return {code:'STOP',text:'Đã đến điểm dừng · Tàu bay dừng đúng vị trí',tone:'red'};
 if(s.elapsed<3) return {code:'SCAN',text:'Quét vùng tiếp cận · Nhận dạng tàu bay',tone:'cyan'};
 if(Math.abs(s.offset)>.35) return {code:s.offset>0?'→':'←',text:'Căn chỉnh về tim vạch dẫn vào',tone:'amber'};
 if(s.distance<10) return {code:'SLOW',text:'Giảm tốc · Chuẩn bị dừng',tone:'amber'};
 return {code:'↓',text:'Đúng tim · Tiếp tục tiến vào',tone:'green'};
}
export function vdgsTick(s:VdgsState,dt:number,scenario:VdgsScenario):VdgsState {
 if(s.emergency||s.obstacle||s.distance===0)return s;
 const step=Math.min(Math.max(dt,0),.1),elapsed=s.elapsed+step;
 if(elapsed<3)return {...s,elapsed,speed:0};
 const speed=s.distance>12?2.4:s.distance>3?1.1:.45;
 const distance=Math.max(0,s.distance-speed*step);
 const obstacle=scenario==='obstacle'&&s.distance>26&&distance<=26;
 return {...s,elapsed,distance:obstacle?26:distance,offset:s.offset*Math.exp(-step*.16),speed:obstacle||distance===0?0:speed,obstacle};
}
