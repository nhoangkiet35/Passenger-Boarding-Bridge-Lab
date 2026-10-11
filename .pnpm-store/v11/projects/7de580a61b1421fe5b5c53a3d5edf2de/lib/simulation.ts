import { collision, type Obstacle } from './collision.ts';
import { technicalConfig as config } from './technicalConfig.ts';
import { standLayout } from './standLayout.ts';
/** Educational kinematics only. Units: illustrative metres / degrees. */
export type Axis = 'angle' | 'length' | 'height' | 'cabYaw' | 'floorTilt';
export type Pose = Record<Axis, number> & { canopy: number };
export type Aux = 'interior' | 'exterior' | 'aircon' | 'ventilation';
export type Jog = Partial<Record<Axis, number>>;
export type Scenario = 'obstacle' | 'autolevelFault' | 'powerLoss' | 'wind' | 'auxDeployed';
export type State = {
  obstacles: Obstacle[];
  autoLevel: boolean; aircraftShift: number; scenarios: Record<Scenario, boolean>;
  fault: string | null; elapsed: number; log: string[]; actualSpeed: number; wheelTravel:number;
  pose: Pose; target: Pose; jog: Jog | null;
  power: boolean; emergency: boolean; area: boolean; authorized: boolean;
  serviceEnded: boolean; mode: 'manual' | 'guide'; paused: boolean;
  step: number; speed: number; message: string; action: string; dwell: number;
  connectedOnce: boolean; aux: Record<Aux, boolean>; temperature: number; wheelRotation: number;
};
export const PARK: Pose = { angle: 0, length: config.limits.length[0], height: config.rotundaHeight, canopy: 0, cabYaw: 0, floorTilt: 0 };
export const DOCKING = config.docking;
export const CABIN_OFFSET = config.cabinOffset; // Cabin set back 0.30 m from the previous position.
const dockAngle = Math.atan2(-DOCKING.cabinPassageOffset-standLayout.rotundaZ, 5 - 1 - CABIN_OFFSET - DOCKING.gap - standLayout.rotundaX) * 180 / Math.PI;
export const CONNECTION: Pose = { angle: dockAngle, length: Math.hypot(5 - 1 - CABIN_OFFSET - DOCKING.gap - standLayout.rotundaX, -DOCKING.cabinPassageOffset-standLayout.rotundaZ), height: DOCKING.sillHeight - DOCKING.floorDrop, canopy: 0, cabYaw: -dockAngle, floorTilt: 0 };
export const initial = (): State => ({
  obstacles: [],
  autoLevel: false, aircraftShift: 0, scenarios: { obstacle:false, autolevelFault:false, powerLoss:false, wind:false, auxDeployed:false }, fault:null, elapsed:0, log:[], actualSpeed:0, wheelTravel:0,
  pose: { ...PARK }, target: { ...PARK }, jog: null,
  power: false, emergency: false, area: false, authorized: false,
  serviceEnded: false, mode: 'manual', paused: false, step: -1, speed: 1,
  message: 'Kiểm tra khu vực và xác nhận tàu bay trước khi tiếp cận.',
  action: 'Đang đỗ', dwell: 0, connectedOnce: false,
  aux: { interior: false, exterior: false, aircon: false, ventilation: false }, temperature: 27, wheelRotation: 0,
});
export const steps = [
  ['Kiểm tra khu vực', 'Quan sát sân đỗ, xác nhận vùng di chuyển thông thoáng. Hướng dẫn tự đánh dấu xác nhận này.'],
  ['Xác nhận tàu bay', 'Xác nhận tàu bay đã dừng, được phép tiếp cận và bật nguồn mô phỏng.'],
  ['Tiếp cận cửa', 'Xoay và kéo dài ống lồng, đưa cabin đến vùng chờ trước cửa trái phía trước.'],
  ['Căn chỉnh cabin', 'Điều chỉnh cao độ và vị trí, giữ khoảng hở 2,5 cm và sàn thấp hơn ngưỡng cửa 15 cm theo yêu cầu mô phỏng.'],
  ['Triển khai canopy', 'Mở mái che mềm khi cabin đã đúng vị trí. Liên động khóa chuyển động cầu.'],
  ['Đã kết nối', 'Chọn Tách cầu để tiếp tục nửa sau bài học.'],
  ['Kết thúc phục vụ', 'Xác nhận kết thúc phục vụ hành khách trước khi thu canopy.'],
  ['Thu canopy', 'Thu hoàn toàn mái che mềm trước khi di chuyển cabin.'],
  ['Lùi khỏi tàu bay', 'Thu cầu theo hướng tiếp cận để tạo khoảng cách với thân tàu bay.'],
  ['Về vị trí đỗ', 'Thu các đoạn ống, xoay và hạ cầu về vị trí ban đầu.'],
  ['Hoàn tất bài học', 'Cầu đã về vị trí đỗ, nguồn mô phỏng tắt.'],
] as const;
// Height from ground to cabin floor; configured travel limits supplied for this PBB.
export const limits = config.limits;
const radians = (degrees: number) => degrees * Math.PI / 180;
/** Rotating bridge-frame mount below the rotunda end of tunnel A. */
export const APRON_CAMERA_MOUNT = [.85, -.55, 1.15] as const;
export function apronView(p: Pose) {
  const slope = Math.atan2(p.height - 3, p.length), angle = radians(p.angle);
  const world = (x: number, y: number, z: number): [number, number, number] => {
    const along = x * Math.cos(slope) - y * Math.sin(slope);
    return [standLayout.rotundaX + along * Math.cos(angle) - z * Math.sin(angle),
      3 + x * Math.sin(slope) + y * Math.cos(slope),
      standLayout.rotundaZ + along * Math.sin(angle) + z * Math.cos(angle)];
  };
  return { position: world(...APRON_CAMERA_MOUNT), target: world(12.6, -3.15, 3.3) };
}
export const cctvView = (s: State, selected: 'apron' | 'cabin' | null = null) => !s.area ? 'apron' : selected ?? 'cabin';
export function cabinFrame(p: Pose) {
  const a = radians(p.angle), heading = radians(p.angle + p.cabYaw);
  return { x: standLayout.rotundaX + p.length * Math.cos(a) + CABIN_OFFSET * Math.cos(heading), z: standLayout.rotundaZ + p.length * Math.sin(a) + CABIN_OFFSET * Math.sin(heading), heading };
}
/** Wide interior view behind the glazing: console, doors, floor and front threshold. */
export function cabinView(p: Pose) {
  const f = cabinFrame(p), dx = Math.cos(f.heading), dz = Math.sin(f.heading);
  const position: [number, number, number] = [f.x - 1.1 * dx, p.height + 1.85, f.z - 1.1 * dz];
  const target: [number, number, number] = [position[0] + 4 * dx, position[1] - 1.6, position[2] + 4 * dz];
  return { position, target };
}
export function metrics(p: Pose, aircraftShift = 0) {
  const f = cabinFrame(p), gap = 5 - f.x - Math.cos(f.heading);
  return {
    gap, clearance: gap - 1.375 * Math.abs(Math.sin(f.heading)),
    offset: f.z + Math.sin(f.heading) + DOCKING.cabinPassageOffset * Math.cos(f.heading),
    heightError: p.height + Math.sin(radians(p.floorTilt)) - CONNECTION.height - aircraftShift,
  };
}
export function aligned(p: Pose, aircraftShift = 0) {
  const m = metrics(p, aircraftShift);
  return m.gap >= DOCKING.minimumClearance && m.gap <= config.alignment.maximumGap && m.clearance >= DOCKING.minimumClearance && Math.abs(m.offset) < config.alignment.lateralTolerance &&
    Math.abs(m.heightError) < config.alignment.heightTolerance && Math.abs(p.angle + p.cabYaw) < config.alignment.headingTolerance && Math.abs(p.floorTilt) < config.alignment.floorTolerance;
}
/** Passenger doorway is enabled only after a completed, aligned connection. */
export const passengerAccess = (s: State) => s.pose.canopy >= .999 && aligned(s.pose, s.aircraftShift) && !s.fault && !s.emergency && s.power && s.area && s.authorized && !s.serviceEnded;
export const moving = (s: State) => s.jog !== null || Object.keys(s.pose).some(k => s.pose[k as keyof Pose] !== s.target[k as keyof Pose]);
/** Steering spans -90..+90 degrees; reversing the drive covers the other half-plane. */
export function wheelMotion(s: State): { angle: number; direction: -1 | 0 | 1 } {
  if (!s.power || s.emergency || s.fault || s.paused || s.pose.canopy > 0) return { angle: s.wheelRotation, direction: 0 };
  const near = metrics(s.pose).gap < config.warningDistance;
  let forward = s.jog ? (s.jog.length ?? 0) * (near?config.nearDoorSpeed:config.jogRates.length) : Math.sign(s.target.length - s.pose.length) * (near?config.nearDoorSpeed:config.rates.length);
  let lateral = s.jog ? (s.jog.angle ?? 0) * config.jogRates.angle : Math.sign(s.target.angle - s.pose.angle) * config.rates.angle;
  // Ignore commands pushing into a mechanical stop; use actual travel direction.
  if ((forward < 0 && s.pose.length <= limits.length[0]) || (forward > 0 && s.pose.length >= limits.length[1])) forward = 0;
  if ((lateral < 0 && s.pose.angle <= limits.angle[0]) || (lateral > 0 && s.pose.angle >= limits.angle[1])) lateral = 0;
  lateral *= Math.PI / 180 * Math.max(0, s.pose.length - config.carriageOffset);
  if (Math.hypot(forward, lateral) < 1e-8) return { angle: s.wheelRotation, direction: 0 };
  let angle = Math.atan2(lateral, forward) * 180 / Math.PI;
  let direction: -1 | 1 = 1;
  if (angle > 90) { angle -= 180; direction = -1; }
  else if (angle < -90) { angle += 180; direction = -1; }
  return { angle: Math.max(-config.wheelSteeringLimit, Math.min(config.wheelSteeringLimit, Object.is(angle, -0) ? 0 : angle)), direction };
}
export const parked = (s: State) => Object.keys(PARK).every(k => Math.abs(s.pose[k as keyof Pose] - PARK[k as keyof Pose]) < .01) && s.pose.canopy === 0;
export function status(s: State) {
  return s.fault ? 'LỖI · ĐÃ KHÓA' : s.emergency ? 'DỪNG KHẨN CẤP' : s.step === 10 ? 'HOÀN TẤT · ĐÃ ĐỖ' : s.pose.canopy > .999 ? 'ĐÃ KẾT NỐI' :
    s.paused ? 'ĐÃ TẠM DỪNG' : moving(s) ? 'ĐANG CHUYỂN ĐỘNG' : parked(s) ? 'VỊ TRÍ ĐỖ' : aligned(s.pose) ? 'SẴN SÀNG KẾT NỐI' : 'CHƯA KẾT NỐI';
}
export type Command =
  | {type:'obstacle'; obstacle:Obstacle} | {type:'clearObstacles'}
  | { type: 'scenario'; key: Scenario; active: boolean } | { type: 'aircraftShift'; value: number }
  | { type: 'autolevel'; on: boolean } | { type: 'resetFault' }
  | { type: 'move'; key: Axis; value: number } | { type: 'jog'; axes: Jog } | { type: 'haltJog' }
  | { type: 'aux'; key: Aux } | { type: 'canopy'; open: boolean } | { type: 'power'; on?: boolean }
  | { type: 'emergency' } | { type: 'resetEmergency' } | { type: 'area'; value: boolean }
  | { type: 'authorize'; value: boolean } | { type: 'park' } | { type: 'service' } | { type: 'reset' }
  | { type: 'mode'; mode: State['mode'] } | { type: 'guide'; departure?: boolean } | { type: 'pause' } | { type: 'speed'; value: number };
const stop = (s: State): State => ({ ...s, actualSpeed: 0, target: { ...s.pose }, jog: null });
export function command(s: State, c: Command): State {
  const n = applyCommand(s,c);
  if(n===s)return s;
  return {...n,log:[...n.log,`${n.elapsed.toFixed(1)}s · ${c.type} · ${n.message}`].slice(-80)};
}
function applyCommand(s: State, c: Command): State {
  const block = (message: string) => ({ ...s, message: 'Thao tác bị chặn: ' + message });
  if (c.type === 'reset') return initial();
  if(c.type==='clearObstacles')return {...stop(s),obstacles:[],message:'Đã thu hồi người/xe minh họa; xác nhận khôi phục nếu có lỗi.'};
  if(c.type==='obstacle'){
    const o=c.obstacle;
    if(![o.x,o.z,o.radius,o.height].every(Number.isFinite)||o.radius<=0||o.height<=0)return block('vật cản không hợp lệ.');
    return {...s,obstacles:[...s.obstacles.filter(v=>v.id!==o.id),o].slice(-20),message:'Đã đặt vật cản hình học minh họa.'};
  }
  if (c.type === 'scenario') {
    const n = {...stop(s), scenarios:{...s.scenarios,[c.key]:c.active}, step:-1};
    return c.active ? latchFault(n, {obstacle:'Safety hoop / vật cản',autolevelFault:'Autolevel không theo kịp / lỗi cảm biến',powerLoss:'Mất điện',wind:'Gió: cảnh báo Autolevel 97 km/h',auxDeployed:'Thiết bị phụ trợ chưa thu (bảo vệ mô phỏng)'}[c.key]) : {...n,message:'Đã loại bỏ nguyên nhân; cần xác nhận khôi phục và phát lệnh mới.'};
  }
  if(c.type==='aircraftShift') {
    if(!Number.isFinite(c.value))return block('cao độ tàu bay không hợp lệ.');
    return {...s,aircraftShift:Math.max(-config.autoLevel.maxAircraftShift,Math.min(config.autoLevel.maxAircraftShift,c.value)),message:'Thay đổi cao độ tàu bay minh họa; quan sát Autolevel.'};
  }
  if(c.type==='resetFault') {
    if(Object.values(s.scenarios).some(Boolean))return block('nguyên nhân sự cố chưa được loại bỏ.');
    if(collision(s.pose,s.obstacles))return block('vật cản hình học chưa thu hồi hoặc vùng va chạm còn bị chiếm.');
    return {...stop(s),fault:null,autoLevel:false,power:false,step:-1,message:'Đã xác nhận khôi phục mô phỏng. Bật nguồn và phát lệnh mới; xem hướng dẫn nguồn khi xử lý thiết bị thật.'};
  }
  if(c.type==='autolevel') {
    if(!c.on)return {...stop(s),autoLevel:false,message:'Đã chuyển về OPERATE minh họa; Autolevel ngừng.'};
    if(!s.power||s.emergency||s.fault||moving(s)||!aligned(s.pose,s.aircraftShift)||!s.area||!s.authorized)return block('Autolevel cần nguồn, bumper đã căn chỉnh, cầu dừng và đủ xác nhận.');
    return {...stop(s),autoLevel:true,message:'AUTO LEVEL: bánh cảm biến tì thân tàu; chỉ tự hiệu chỉnh cao độ.'};
  }
  if(s.fault && c.type!=='emergency' && c.type!=='resetEmergency' && c.type!=='power')return block('sự cố đang khóa; loại bỏ nguyên nhân và xác nhận khôi phục.');
  if (c.type === 'haltJog') return s.jog ? { ...stop(s), action: 'Đã nhả điều khiển', message: 'Đã thả điều khiển; cầu dừng tại vị trí hiện tại.' } : s;
  if (c.type === 'emergency') return { ...stop(s), emergency: true, power: false, autoLevel: false, paused: true, action: 'Dừng khẩn cấp', message: 'Mọi chuyển động đã dừng. Đặt lại dừng khẩn cấp rồi phát lệnh mới.' };
  if (c.type === 'resetEmergency') return s.emergency ? { ...s, emergency: false, paused: false, step: -1, action: 'Chờ lệnh mới', message: 'Đã đặt lại. Chuyển động cũ không tự tiếp tục.' } : s;
  if (c.type === 'speed') return { ...s, speed: Math.max(.5, Math.min(2, c.value)) };
  if (c.type === 'mode') return { ...stop(s), mode: c.mode, paused: false, step: -1, message: 'Đã đổi chế độ; chuyển động cũ được hủy.' };
  if (c.type === 'pause') return { ...(s.jog ? stop(s) : s), paused: !s.paused };
  if (c.type === 'power') {
    if((s.emergency||s.fault)&&c.on!==false)return block('dừng khẩn cấp hoặc lỗi còn khóa nguồn.');
    const power = c.on ?? !s.power;
    if (power === s.power) return s;
    return { ...stop(s), power, autoLevel:false, step: -1, action: 'Chờ lệnh', message: power ? 'Nguồn mô phỏng đã bật.' : 'Đã tắt nguồn; chuyển động dừng.' };
  }
  if (c.type === 'area' || c.type === 'authorize') {
    const field = c.type === 'area' ? 'area' : 'authorized';
    return { ...(!c.value ? stop(s) : s), [field]: c.value, step: -1, message: c.value ? 'Đã ghi nhận xác nhận.' : 'Đã thu hồi xác nhận và dừng chuyển động.' };
  }
  if (s.emergency) return block('cần đặt lại dừng khẩn cấp.');
  if (c.type === 'guide') {
    if (c.departure) {
      if (s.pose.canopy < .999) return block('cần hoàn thành kết nối trước khi tách cầu.');
      return executeStep({ ...stop(s), mode: 'guide', paused: false, power: true }, 6);
    }
    if (!parked(s)) return block('hãy đưa cầu về vị trí đỗ hoặc đặt lại bài học.');
    return executeStep({ ...stop(s), mode: 'guide', paused: false, serviceEnded: false, connectedOnce: false }, 0);
  }
  if (!s.power) return block('hãy bật nguồn mô phỏng.');
  if (c.type === 'aux') return { ...s, aux: { ...s.aux, [c.key]: !s.aux[c.key] }, message: 'Đã ' + (s.aux[c.key] ? 'tắt ' : 'bật ') + { interior: 'đèn trong cabin.', exterior: 'đèn tiếp cận.', aircon: 'điều hòa mô phỏng.', ventilation: 'quạt thông gió.' }[c.key] };
  if (s.paused) return block('hãy tiếp tục mô phỏng trước khi điều khiển.');
  if (c.type === 'service') {
    if(!s.connectedOnce)return block('chưa hoàn thành kết nối để kết thúc phục vụ.');
    return { ...s, autoLevel:false, serviceEnded: true, message: 'Đã kết thúc phục vụ. Cửa tàu bay/cabin đóng minh họa; có thể thu canopy.', action: 'Kết thúc phục vụ' };
  }
  if (c.type === 'canopy') {
    if (c.open && (!s.area || !s.authorized)) return block('chưa đủ xác nhận khu vực và tàu bay.');
    if (c.open && (moving(s) || !aligned(s.pose,s.aircraftShift))) return block('cabin phải dừng, sàn cân bằng, khoảng hở 2–3,5 cm, lệch ngang < 5 cm, sàn thấp hơn ngưỡng cửa 15 cm và sai số cao độ < 1 cm.');
    if (!c.open && s.connectedOnce && !s.serviceEnded) return block('hãy xác nhận kết thúc phục vụ trước.');
    return { ...s, jog: null, target: { ...s.pose, canopy: c.open ? 1 : 0 }, serviceEnded: c.open ? false : s.serviceEnded, action: c.open ? 'Triển khai canopy' : 'Thu canopy', message: c.open ? 'Đang mở mái che; cầu bị khóa chuyển động.' : 'Đang thu mái che.' };
  }
  if(s.autoLevel && (c.type==='move'||c.type==='jog'||c.type==='park'))return block('AUTO LEVEL khóa điều khiển chuyển động.');
  if (s.pose.canopy > 0 || s.target.canopy > 0) return block('canopy chưa thu hoàn toàn.');
  if (!s.area || !s.authorized) return block('phải xác nhận khu vực an toàn và tàu bay đã đỗ, được phép tiếp cận.');
  if (c.type === 'park') return { ...s, jog: null, target: { ...s.pose, length: PARK.length, canopy: 0 }, action: 'Về vị trí đỗ', message: 'Đang thu cầu và về vị trí ban đầu.' };
  if (c.type === 'jog') {
    if (s.mode !== 'manual') return block('xoay khóa về THỦ CÔNG để dùng joystick.');
    const axes: Jog = {};
    for (const key of Object.keys(limits) as Axis[]) {
      const value = c.axes[key];
      if (value !== undefined && Number.isFinite(value) && Math.abs(value) > .03) axes[key] = Math.max(-1, Math.min(1, value));
    }
    if (!Object.keys(axes).length) return command(s, { type: 'haltJog' });
    const next = { ...stop(s), jog: axes, action: 'Điều khiển giữ để chạy', message: 'Giữ để chạy • Thả tay để dừng. Joystick: lên/xuống tiến/lùi, trái/phải xoay cầu.' };
    return { ...next, wheelRotation: wheelMotion(next).angle };
  }
  if (c.type === 'move') {
    if (!Number.isFinite(c.value)) return block('mục tiêu không hợp lệ.');
    const [min, max] = limits[c.key], value = Math.max(min, Math.min(max, c.value));
    return { ...s, jog: null, target: { ...s.target, [c.key]: value }, action: { angle: 'Xoay cầu', length: 'Kéo dài / thu cầu', height: 'Nâng / hạ cabin', cabYaw: 'Xoay cabin', floorTilt: 'Cân bằng sàn cabin' }[c.key], message: value !== c.value ? 'Đã chạm giới hạn hành trình.' : 'Đang điều chỉnh. Vùng đỏ báo cabin quá gần thân tàu bay.' };
  }
  return s;
}
function executeStep(s: State, i: number): State {
  let n = { ...s, step: i, dwell: 0, action: steps[i][0], message: steps[i][1] as string };
  switch (i) {
    case 0: n.area = true; break;
    case 1: n.authorized = true; n.power = true; break;
    case 2: n.target = { ...n.pose, ...CONNECTION, length: PARK.length }; break;
    case 3: n.target = { ...CONNECTION }; break;
    case 4: return { ...command(command(n,{type:'autolevel',on:true}), { type: 'canopy', open: true }), step: i };
    case 5: n.paused = true; break;
    case 6: n.autoLevel = false; n.serviceEnded = true; break;
    case 7: return { ...command(n, { type: 'canopy', open: false }), step: i };
    case 8: n.target = { ...n.pose, length: PARK.length }; break;
    case 9: n.target = { ...PARK }; break;
    case 10: n.power = false; n.paused = true; break;
  }
  return n;
}
export function tick(s: State, seconds: number): State {
  if(!Number.isFinite(seconds)||seconds<=0||s.emergency||s.fault)return s;
  // Preserve elapsed time at low frame rates, with bounded collision integration steps.
  let n=s, remaining=seconds*s.speed;
  while(remaining>1e-10){const dt=Math.min(remaining,1/120);n=integrate(n,dt);remaining-=dt;if(n.emergency||n.fault)break;}
  return n;
}
function integrate(s: State, dt: number): State {
  if (s.emergency || s.fault) return s;
  if(s.paused && !(s.autoLevel && s.step===5))return s;
  let n = {...s,elapsed:s.elapsed+dt,actualSpeed:0};
  if(s.power){const contact=collision(s.pose,s.obstacles);if(contact)return latchFault(n,'Vùng bảo vệ bị chiếm: '+contact);}
  if(s.autoLevel && s.power) {
    const error=CONNECTION.height+s.aircraftShift-s.pose.height;
    if(Math.abs(error)>config.autoLevel.maxError)return latchFault(n,'Autolevel không theo kịp: sai lệch vượt ngưỡng giả định');
    if(Math.abs(error)>config.autoLevel.deadband){
      const h=s.pose.height+Math.sign(error)*Math.min(Math.abs(error),config.autoLevel.rate*dt);
      const p={...s.pose,height:h};
      if(h<limits.height[0]||h>limits.height[1]||!geometry(p).valid)return latchFault(n,'Autolevel chạm giới hạn hình học');
      const contact=collision(p,s.obstacles);if(contact)return latchFault(n,'Autolevel / vùng va chạm: '+contact);
      n={...n,pose:p,target:{...s.target,height:h}};
    }
  }
  if (s.power && Math.abs(s.temperature - (s.aux.aircon ? 22 : 27)) > .01) {
    const setpoint = s.aux.aircon ? 22 : 27;
    n = { ...n, temperature: s.temperature + Math.sign(setpoint - s.temperature) * Math.min(Math.abs(setpoint - s.temperature), dt * .12) };
  }
  if (s.power && moving(n) && !s.paused) {
    const p = { ...n.pose };
    const rates: Pose = { ...config.rates };
    if(metrics(p).gap<config.warningDistance)rates.length=config.nearDoorSpeed;
    if (s.jog) {
      // Slower proportional movement for cabin-console precision.
      const jogRates: Record<Axis, number> = { ...config.jogRates };
      if(metrics(p).gap<config.warningDistance)jogRates.length=config.nearDoorSpeed;
      for (const key of Object.keys(s.jog) as Axis[]) p[key] = Math.max(limits[key][0], Math.min(limits[key][1], p[key] + jogRates[key] * s.jog[key]! * dt));
    } else {
      for (const key of Object.keys(p) as (keyof Pose)[]) {
        const d = s.target[key] - p[key];
        p[key] = Math.abs(d) <= rates[key] * dt ? s.target[key] : p[key] + Math.sign(d) * rates[key] * dt;
      }
    }
    const contact=collision(p,s.obstacles);
    if(contact)return latchFault(n,'Va chạm dự đoán: '+contact+' (vùng bảo vệ mô phỏng)');
    if(!geometry(p).valid && !improvesGeometry(s.pose,p))return {...stop(n),message:'Giới hạn độ dốc / chồng lồng (giả định): giảm chênh cao hoặc tăng chiều dài.',action:'Giới hạn hình học'};
    if (metrics(p).clearance < DOCKING.minimumClearance) return { ...stop(n), message: 'Giới hạn an toàn: mép cabin quá gần thân tàu bay. Hãy thu cầu.', action: 'Đã chặn tiếp cận', paused: s.mode === 'guide' };
    if (s.jog && Object.keys(p).every(k => p[k as keyof Pose] === s.pose[k as keyof Pose])) return { ...stop(n), message: 'Đã chạm giới hạn hành trình. Nhả điều khiển rồi chọn hướng khác.', action: 'Giới hạn hành trình' };
    const travel=Math.hypot(p.length-s.pose.length, radians(p.angle-s.pose.angle)*(p.length-config.carriageOffset));
    n = { ...n, actualSpeed:travel/dt, wheelTravel:s.wheelTravel+travel*wheelMotion(s).direction, pose: p, target: s.jog ? { ...p } : s.target, connectedOnce: s.connectedOnce || p.canopy >= .999, wheelRotation: wheelMotion(s).angle };
  }
  if (n.action === 'Về vị trí đỗ' && !moving(n) && !parked(n)) n = { ...n, target: { ...PARK } };
  if (n.mode === 'guide' && n.step >= 0 && n.step !== 5 && n.step < 10 && !moving(n)) {
    n = { ...n, dwell: n.dwell + dt };
    if (n.dwell >= 3) n = executeStep(n, n.step + 1);
  }
  return n;
}


/** Shared kinematics: these positions also drive rendering and validation. */
export function geometry(p: Pose) {
  const slope=Math.atan2(p.height-config.rotundaHeight,p.length)*180/Math.PI;
  const slant=Math.hypot(p.length,p.height-config.rotundaHeight);
  const spacing=(slant-config.tunnelSegment)/2;
  const overlap=config.tunnelSegment-spacing;
  const a=radians(p.angle),r=p.length-config.carriageOffset;
  return {slope,slant,overlap,centres:[5,5+spacing,5+2*spacing],
    wheel:{x:standLayout.rotundaX+r*Math.cos(a),y:0,z:standLayout.rotundaZ+r*Math.sin(a)},
    columnDeckHeight:config.rotundaHeight+(p.height-config.rotundaHeight)*r/p.length,
    valid:Math.abs(slope)<=config.maxSlope && overlap>=config.minimumOverlap};
}
function improvesGeometry(previous:Pose,next:Pose){
  const a=geometry(previous),b=geometry(next);
  return Math.abs(b.slope)<Math.abs(a.slope)&&b.overlap>=config.minimumOverlap;
}
function latchFault(s:State,reason:string):State {
  return {...stop(s),fault:reason,autoLevel:false,power:false,paused:false,step:-1,message:reason+' · Đã dừng; loại bỏ nguyên nhân rồi xác nhận khôi phục.',log:[...s.log,`${s.elapsed.toFixed(1)}s · LỖI · ${reason}`].slice(-80)};
}
export function operationState(s:State){
  if(s.emergency)return 'Dừng khẩn cấp';if(s.fault)return 'Lỗi';
  if(s.step===0||s.step===1)return 'Kiểm tra trước vận hành';
  if(parked(s)&&!s.power)return 'Đỗ an toàn';
  if(s.action==='Về vị trí đỗ'&&moving(s))return 'Trở về vị trí đỗ';
  if(s.serviceEnded)return s.pose.canopy>0?'Chuẩn bị tách cầu':moving(s)?'Tách cầu / trở về đỗ':parked(s)?'Đỗ an toàn':'Tách cầu';
  if(s.pose.canopy>=.999)return s.autoLevel?'Phục vụ / Autolevel':'Kết nối';
  if(!s.area||!s.authorized)return 'Kiểm tra trước vận hành';
  return moving(s)?'Tiếp cận':aligned(s.pose,s.aircraftShift)?'Sẵn sàng kết nối':parked(s)?'Sẵn sàng':'Tiếp cận';
}
