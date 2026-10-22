export type VdgsScenario = 'normal' | 'offset' | 'obstacle';
export type VdgsState = { distance: number; elapsed: number; offset: number; speed: number; obstacle: boolean; emergency: boolean; stoppedFor: number };
export const vdgsInitial = (scenario: VdgsScenario): VdgsState => ({ distance: 65, elapsed: 0, offset: scenario === 'offset' ? 3 : 0, speed: 0, obstacle: false, emergency: false, stoppedFor: 0 });
export const vdgsStages = [
 {id:'standby', label:'Chờ và kích hoạt hệ thống', screen:'A321', detail:'VDGS ở trạng thái chờ, được kích hoạt cho loại tàu bay A321. Sơ đồ cũng nêu việc kiểm tra vị trí cầu hành khách PBB và tự kiểm tra hệ thống.'},
 {id:'detected', label:'Phát hiện tàu bay', screen:'A321 và một vạch vàng đứng', detail:'Khi tàu bay lăn vào vùng tiếp cận, hệ thống phát hiện tàu bay và bắt đầu cung cấp chỉ dẫn vào vị trí đỗ.'},
 {id:'guide', label:'Hướng dẫn tiến vào', screen:'A321 · 30M, vạch dẫn dạng chữ T', detail:'Tàu bay tiếp tục lăn theo đường dẫn vào. Màn hình hiển thị khoảng cách còn lại đến điểm dừng; 30M là mốc minh họa trong ảnh.'},
 {id:'verify', label:'Kiểm tra và xác minh', screen:'A321 · 20M', detail:'Hệ thống thực hiện bước kiểm tra, xác minh tàu bay trong quá trình tiếp cận và tiếp tục hiển thị thông tin dẫn hướng.'},
 {id:'near', label:'Tiếp cận điểm dừng', screen:'A321 · 5M', detail:'Khi khoảng cách còn lại từ 5 m trở lên, khoảng cách được hiển thị với độ chia 1 m.'},
 {id:'precise', label:'Dẫn vào chính xác', screen:'A321 · 4.8M', detail:'Khi khoảng cách còn lại dưới 5 m, độ chia hiển thị chuyển sang 0,2 m, giúp theo dõi vị trí chính xác hơn trong đoạn tiếp cận cuối. Vạch vàng ngắn dần khi tàu bay đến gần điểm dừng.'},
 {id:'stop', label:'Dừng tại vị trí quy định', screen:'A321 · STOP, chữ STOP màu đỏ', detail:'VDGS ra tín hiệu dừng khi tàu bay đến điểm dừng. Tàu bay kết thúc chuyển động tiến vào.'},
 {id:'parked', label:'Xác nhận đã đỗ', screen:'A321 · OK, chữ OK màu vàng', detail:'Hệ thống hiển thị trạng thái tàu bay đã đỗ, hoàn tất quá trình dẫn vào vị trí.'},
] as const;
export function vdgsStage(s:VdgsState) {
 if(s.emergency||s.obstacle)return 'stop';
 if(s.distance===0)return s.stoppedFor>=2?'parked':'stop';
 if(s.elapsed<1.5)return 'standby';
 if(s.elapsed<3)return 'detected';
 if(s.distance<5)return 'precise';
 if(s.distance<=10)return 'near';
 if(s.distance<=20)return 'verify';
 return 'guide';
}
export function vdgsDistance(distance:number) {
 if(distance>=5)return `${Math.ceil(distance)}M`;
 return `${(Math.ceil(Math.max(0,distance)*5-1e-9)/5).toFixed(1)}M`;
}
export function vdgsSignal(s: VdgsState) {
 if(s.emergency) return {code:'STOP',text:'Dừng khẩn cấp',tone:'red'};
 if(s.obstacle) return {code:'STOP',text:'Phát hiện vật cản trong vùng tiếp cận',tone:'red'};
 if(s.distance===0) return s.stoppedFor>=2 ? {code:'OK',text:'Tàu bay đã đỗ · Hoàn tất dẫn vào',tone:'amber'} : {code:'STOP',text:'Đã đến điểm dừng · Tàu bay dừng đúng vị trí',tone:'red'};
 if(s.elapsed<3) return {code:'SCAN',text:'Quét vùng tiếp cận · Nhận dạng tàu bay',tone:'cyan'};
 if(Math.abs(s.offset)>.35) return {code:s.offset>0?'→':'←',text:'Căn chỉnh về tim vạch dẫn vào',tone:'amber'};
 if(s.distance<10) return {code:'SLOW',text:'Giảm tốc · Chuẩn bị dừng',tone:'amber'};
 return {code:'↓',text:'Đúng tim · Tiếp tục tiến vào',tone:'green'};
}
export function vdgsTick(s:VdgsState,dt:number,scenario:VdgsScenario):VdgsState {
 if(s.emergency||s.obstacle)return s;
 const step=Math.min(Math.max(dt,0),.1),elapsed=s.elapsed+step;
 if(s.distance===0)return s.stoppedFor>=2?s:{...s,stoppedFor:Math.min(2,s.stoppedFor+step),speed:0};
 if(elapsed<3)return {...s,elapsed,speed:0};
 const speed=s.distance>12?2.4:s.distance>3?1.1:.45;
 const distance=Math.max(0,s.distance-speed*step);
 const obstacle=scenario==='obstacle'&&s.distance>26&&distance<=26;
 return {...s,elapsed,distance:obstacle?26:distance,offset:s.offset*Math.exp(-step*.16),speed:obstacle||distance===0?0:speed,obstacle};
}
