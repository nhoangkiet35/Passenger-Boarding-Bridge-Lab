import { collision } from './collision.ts';
import { technicalConfig as config } from './technicalConfig.ts';
import { metrics, aircraftDoorClear, geometry, DOCKING, GEOMETRY_EPSILON } from './bridgeGeometry.ts';
import type { State } from './simulationTypes.ts';
export type BridgeMessage = {
    text: string;
    alarm: boolean;
};
/** Live simulated sensor readings and operating hazards, rather than equipment mode lamps. */
export function bridgeMessages(s: State): BridgeMessage[] {
    const result: BridgeMessage[] = [];
    const add = (text: string, alarm = false) => result.push({ text, alarm });
    const m = metrics(s.pose, s.aircraftShift);
    if (s.emergency)
        add('DỪNG KHẨN CẤP: mọi chuyển động đã bị khóa.', true);
    if (s.fault)
        add('BẢO VỆ CẦU: ' + s.fault, true);
    if (!s.power) {
        add('Cảm biến mô phỏng chưa hoạt động: bật nguồn để theo dõi.');
        return result;
    }
    const contact = collision(s.pose, s.obstacles);
    if (contact)
        add('VÙNG VA CHẠM: ' + contact, true);
    if (!s.area)
        add('Chưa xác nhận sân đỗ thông thoáng; kiểm tra người và xe.', true);
    if (!s.authorized)
        add('Chưa xác nhận tàu bay dừng và được phép tiếp cận.', true);
    if (s.message.startsWith('Thao tác bị chặn:') || s.message.startsWith('Giới hạn'))
        add(s.message, true);
    const tooClose = m.clearance < DOCKING.minimumClearance - GEOMETRY_EPSILON;
    add(`Cảm biến mép cabin: ${(m.clearance * 100).toFixed(1)} cm đến thân tàu.`, tooClose);
    if (tooClose)
        add('NGUY CƠ CHẠM THÂN TÀU: thu cầu, không tiến thêm.', true);
    else if (m.gap < config.warningDistance && s.pose.canopy === 0)
        add('Gần thân tàu: di chuyển chậm, thả joystick để dừng.');
    if (m.gap < config.warningDistance) {
        const clear = aircraftDoorClear(s.pose, s.aircraftShift);
        add(clear ? 'Đường mở cửa tàu bay: đủ khoảng trống trong mô hình.' : 'Đường mở cửa vướng vùng cabin / canopy: chỉnh vị trí trước khi mở.', !clear);
        add(`Cảm biến cao độ: sàn thấp hơn ngưỡng cửa ${((DOCKING.floorDrop - m.heightError) * 100).toFixed(1)} cm.`, Math.abs(m.heightError) > config.alignment.heightTolerance + GEOMETRY_EPSILON);
        add(`Cảm biến nghiêng sàn: ${s.pose.floorTilt.toFixed(1)}°; cho phép ±${config.alignment.floorTolerance}°.`, Math.abs(s.pose.floorTilt) > config.alignment.floorTolerance);
    }
    if (s.pose.canopy > 0)
        add('Mái che đã triển khai: khóa di chuyển cầu; kết thúc phục vụ rồi thu mái che.');
    if (s.autoLevel)
        add(`Cảm biến bám cao độ: sai số ${(m.heightError * 100).toFixed(1)} cm.`);
    if (!geometry(s.pose).valid)
        add('Giới hạn cơ khí: độ dốc / chồng lồng chưa phù hợp.', true);
    return result.sort((a, b) => Number(b.alarm) - Number(a.alarm));
}
