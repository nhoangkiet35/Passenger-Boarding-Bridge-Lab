/** Educational kinematics only. Units: illustrative metres / degrees. */
export type Axis = 'angle' | 'length' | 'height' | 'cabYaw' | 'floorTilt';
export type Pose = Record<Axis, number> & { canopy: number };
export type Aux = 'interior' | 'exterior' | 'aircon' | 'ventilation';
export type Jog = Partial<Record<Axis, number>>;
export type State = {
  pose: Pose; target: Pose; jog: Jog | null;
  power: boolean; emergency: boolean; area: boolean; authorized: boolean;
  serviceEnded: boolean; mode: 'manual' | 'guide'; paused: boolean;
  step: number; speed: number; message: string; action: string; dwell: number;
  connectedOnce: boolean; aux: Record<Aux, boolean>; temperature: number;
};
export const PARK: Pose = { angle: -25, length: 9, height: 3, canopy: 0, cabYaw: 0, floorTilt: 0 };
export const initial = (): State => ({
  pose: { ...PARK }, target: { ...PARK }, jog: null,
  power: false, emergency: false, area: false, authorized: false,
  serviceEnded: false, mode: 'manual', paused: false, step: -1, speed: 1,
  message: 'Kiểm tra khu vực và xác nhận tàu bay trước khi tiếp cận.',
  action: 'Đang đỗ', dwell: 0, connectedOnce: false,
  aux: { interior: false, exterior: false, aircon: false, ventilation: false }, temperature: 27,
});
export const steps = [
  ['Kiểm tra khu vực', 'Quan sát sân đỗ, xác nhận vùng di chuyển thông thoáng. Hướng dẫn tự đánh dấu xác nhận này.'],
  ['Xác nhận tàu bay', 'Xác nhận tàu bay đã dừng, được phép tiếp cận và bật nguồn mô phỏng.'],
  ['Tiếp cận cửa', 'Xoay và kéo dài ống lồng, đưa cabin đến vùng chờ trước cửa trái phía trước.'],
  ['Căn chỉnh cabin', 'Điều chỉnh cao độ và vị trí, giữ khoảng hở minh họa 0,4 m.'],
  ['Triển khai canopy', 'Mở mái che mềm khi cabin đã đúng vị trí. Liên động khóa chuyển động cầu.'],
  ['Đã kết nối', 'Chọn Tách cầu để tiếp tục nửa sau bài học.'],
  ['Kết thúc phục vụ', 'Xác nhận kết thúc phục vụ hành khách trước khi thu canopy.'],
  ['Thu canopy', 'Thu hoàn toàn mái che mềm trước khi di chuyển cabin.'],
  ['Lùi khỏi tàu bay', 'Thu cầu theo hướng tiếp cận để tạo khoảng cách với thân tàu bay.'],
  ['Về vị trí đỗ', 'Thu các đoạn ống, xoay và hạ cầu về vị trí ban đầu.'],
  ['Hoàn tất bài học', 'Cầu đã về vị trí đỗ, nguồn mô phỏng tắt.'],
] as const;
export const limits = { angle: [-35, 12], length: [9, 16.05], height: [2.6, 4.4], cabYaw: [-12, 12], floorTilt: [-3, 3] } as const;
const radians = (degrees: number) => degrees * Math.PI / 180;
export function cabinFrame(p: Pose) {
  const a = radians(p.angle), heading = radians(p.angle + p.cabYaw);
  return { x: -12 + p.length * Math.cos(a), z: p.length * Math.sin(a), heading };
}
/** Fixed camera mount in cabin coordinates. It does not auto-aim at the aircraft. */
export function cabinView(p: Pose) {
  const f = cabinFrame(p), dx = Math.cos(f.heading), dz = Math.sin(f.heading);
  const position: [number, number, number] = [f.x - .68 * dx, p.height + 1.55, f.z - .68 * dz];
  const target: [number, number, number] = [position[0] + 8 * dx, position[1] - 1.2, position[2] + 8 * dz];
  return { position, target };
}
export function metrics(p: Pose) {
  const f = cabinFrame(p), gap = 5 - f.x - Math.cos(f.heading);
  return {
    gap, clearance: gap - 1.375 * Math.abs(Math.sin(f.heading)),
    offset: f.z + Math.sin(f.heading),
    heightError: p.height + Math.sin(radians(p.floorTilt)) - 3.4,
  };
}
export function aligned(p: Pose) {
  const m = metrics(p);
  return m.gap >= .24 && m.gap <= .65 && m.clearance >= .24 && Math.abs(m.offset) < .35 &&
    Math.abs(m.heightError) < .12 && Math.abs(p.angle + p.cabYaw) < 2 && Math.abs(p.floorTilt) < .5;
}
export const moving = (s: State) => s.jog !== null || Object.keys(s.pose).some(k => s.pose[k as keyof Pose] !== s.target[k as keyof Pose]);
export const parked = (s: State) => Object.keys(PARK).every(k => Math.abs(s.pose[k as keyof Pose] - PARK[k as keyof Pose]) < .01) && s.pose.canopy === 0;
export function status(s: State) {
  return s.emergency ? 'DỪNG KHẨN CẤP' : s.step === 10 ? 'HOÀN TẤT · ĐÃ ĐỖ' : s.pose.canopy > .999 ? 'ĐÃ KẾT NỐI' :
    s.paused ? 'ĐÃ TẠM DỪNG' : moving(s) ? 'ĐANG CHUYỂN ĐỘNG' : parked(s) ? 'VỊ TRÍ ĐỖ' : aligned(s.pose) ? 'SẴN SÀNG KẾT NỐI' : 'CHƯA KẾT NỐI';
}
export type Command =
  | { type: 'move'; key: Axis; value: number } | { type: 'jog'; axes: Jog } | { type: 'haltJog' }
  | { type: 'aux'; key: Aux } | { type: 'canopy'; open: boolean } | { type: 'power'; on?: boolean }
  | { type: 'emergency' } | { type: 'resetEmergency' } | { type: 'area'; value: boolean }
  | { type: 'authorize'; value: boolean } | { type: 'park' } | { type: 'service' } | { type: 'reset' }
  | { type: 'mode'; mode: State['mode'] } | { type: 'guide'; departure?: boolean } | { type: 'pause' } | { type: 'speed'; value: number };
const stop = (s: State): State => ({ ...s, target: { ...s.pose }, jog: null });
export function command(s: State, c: Command): State {
  const block = (message: string) => ({ ...s, message: 'Thao tác bị chặn: ' + message });
  if (c.type === 'reset') return initial();
  if (c.type === 'haltJog') return s.jog ? { ...stop(s), action: 'Đã nhả điều khiển', message: 'Đã thả điều khiển; cầu dừng tại vị trí hiện tại.' } : s;
  if (c.type === 'emergency') return { ...stop(s), emergency: true, paused: true, action: 'Dừng khẩn cấp', message: 'Mọi chuyển động đã dừng. Đặt lại dừng khẩn cấp rồi phát lệnh mới.' };
  if (c.type === 'resetEmergency') return s.emergency ? { ...s, emergency: false, paused: false, step: -1, action: 'Chờ lệnh mới', message: 'Đã đặt lại. Chuyển động cũ không tự tiếp tục.' } : s;
  if (c.type === 'speed') return { ...s, speed: Math.max(.5, Math.min(2, c.value)) };
  if (c.type === 'mode') return { ...stop(s), mode: c.mode, paused: false, step: -1, message: 'Đã đổi chế độ; chuyển động cũ được hủy.' };
  if (c.type === 'pause') return { ...(s.jog ? stop(s) : s), paused: !s.paused };
  if (c.type === 'power') {
    const power = c.on ?? !s.power;
    if (power === s.power) return s;
    return { ...stop(s), power, step: -1, action: 'Chờ lệnh', message: power ? 'Nguồn mô phỏng đã bật.' : 'Đã tắt nguồn; chuyển động dừng.' };
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
  if (c.type === 'service') return { ...s, serviceEnded: true, message: 'Đã kết thúc phục vụ. Có thể thu canopy.', action: 'Kết thúc phục vụ' };
  if (c.type === 'canopy') {
    if (c.open && (!s.area || !s.authorized)) return block('chưa đủ xác nhận khu vực và tàu bay.');
    if (c.open && (moving(s) || !aligned(s.pose))) return block('cabin phải dừng, sàn cân bằng, cách cửa 0,24–0,65 m, lệch ngang < 0,35 m và lệch cao < 0,12 m.');
    if (!c.open && s.connectedOnce && !s.serviceEnded) return block('hãy xác nhận kết thúc phục vụ trước.');
    return { ...s, jog: null, target: { ...s.pose, canopy: c.open ? 1 : 0 }, serviceEnded: c.open ? false : s.serviceEnded, action: c.open ? 'Triển khai canopy' : 'Thu canopy', message: c.open ? 'Đang mở mái che; cầu bị khóa chuyển động.' : 'Đang thu mái che.' };
  }
  if (s.pose.canopy > 0 || s.target.canopy > 0) return block('canopy chưa thu hoàn toàn.');
  if (c.type === 'park') return { ...s, jog: null, target: { ...PARK }, action: 'Về vị trí đỗ', message: 'Đang thu cầu và về vị trí ban đầu.' };
  if (!s.area || !s.authorized) return block('phải xác nhận khu vực an toàn và tàu bay đã đỗ, được phép tiếp cận.');
  if (c.type === 'jog') {
    if (s.mode !== 'manual') return block('xoay khóa về THỦ CÔNG để dùng joystick.');
    const axes: Jog = {};
    for (const key of Object.keys(limits) as Axis[]) {
      const value = c.axes[key];
      if (value !== undefined && Number.isFinite(value) && Math.abs(value) > .03) axes[key] = Math.max(-1, Math.min(1, value));
    }
    if (!Object.keys(axes).length) return command(s, { type: 'haltJog' });
    return { ...stop(s), jog: axes, action: 'Điều khiển giữ để chạy', message: 'Giữ để chạy • Thả tay để dừng. Joystick: lên/xuống tiến/lùi, trái/phải xoay cầu.' };
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
    case 2: n.target = { ...n.pose, angle: 0, length: 14.4 }; break;
    case 3: n.target = { ...PARK, angle: 0, length: 15.6, height: 3.4 }; break;
    case 4: return { ...command(n, { type: 'canopy', open: true }), step: i };
    case 5: n.paused = true; break;
    case 6: n.serviceEnded = true; break;
    case 7: return { ...command(n, { type: 'canopy', open: false }), step: i };
    case 8: n.target = { ...n.pose, length: 14 }; break;
    case 9: n.target = { ...PARK }; break;
    case 10: n.power = false; n.paused = true; break;
  }
  return n;
}
export function tick(s: State, seconds: number): State {
  if (s.emergency || s.paused) return s;
  const dt = Math.min(seconds, .05) * s.speed;
  let n = s;
  if (s.power && Math.abs(s.temperature - (s.aux.aircon ? 22 : 27)) > .01) {
    const setpoint = s.aux.aircon ? 22 : 27;
    n = { ...n, temperature: s.temperature + Math.sign(setpoint - s.temperature) * Math.min(Math.abs(setpoint - s.temperature), dt * .12) };
  }
  if (s.power && moving(s)) {
    const p = { ...s.pose };
    const rates: Pose = { angle: 8, length: 1.3, height: .35, canopy: .65, cabYaw: 5, floorTilt: 1.5 };
    if (s.jog) {
      // Slower proportional movement for cabin-console precision.
      const jogRates: Record<Axis, number> = { angle: 2, length: .45, height: .15, cabYaw: 3, floorTilt: 1 };
      for (const key of Object.keys(s.jog) as Axis[]) p[key] = Math.max(limits[key][0], Math.min(limits[key][1], p[key] + jogRates[key] * s.jog[key]! * dt));
    } else {
      for (const key of Object.keys(p) as (keyof Pose)[]) {
        const d = s.target[key] - p[key];
        p[key] = Math.abs(d) <= rates[key] * dt ? s.target[key] : p[key] + Math.sign(d) * rates[key] * dt;
      }
    }
    if (metrics(p).clearance < .24) return { ...stop(n), message: 'Giới hạn an toàn: mép cabin quá gần thân tàu bay. Hãy thu cầu.', action: 'Đã chặn tiếp cận', paused: s.mode === 'guide' };
    if (s.jog && Object.keys(p).every(k => p[k as keyof Pose] === s.pose[k as keyof Pose])) return { ...stop(n), message: 'Đã chạm giới hạn hành trình. Nhả điều khiển rồi chọn hướng khác.', action: 'Giới hạn hành trình' };
    n = { ...n, pose: p, target: s.jog ? { ...p } : s.target, connectedOnce: s.connectedOnce || p.canopy >= .999 };
  }
  if (n.mode === 'guide' && n.step >= 0 && n.step !== 5 && n.step < 10 && !moving(n)) {
    n = { ...n, dwell: n.dwell + dt };
    if (n.dwell >= 3) n = executeStep(n, n.step + 1);
  }
  return n;
}

