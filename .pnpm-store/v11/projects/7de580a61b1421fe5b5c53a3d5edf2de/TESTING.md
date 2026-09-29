# Kết quả kiểm tra

- Cài đặt dependency: pnpm 11.19.0, frozen lockfile, bỏ qua lifecycle script; thành công.
- Logic: 18 tình huống chu trình/liên động và 1 hồi quy canopy còn sai số nhỏ; tất cả đạt.
- TypeScript: tsc --noEmit đạt.
- Build production: Vinext/Vite đạt; có cảnh báo bundle Three.js lớn hơn 500 kB (không chặn chạy).
- Trình duyệt: đã chạy tiếp cận → canopy 100% → kết thúc phục vụ → thu canopy → về đỗ và tắt nguồn bằng chế độ hướng dẫn.
- Thủ công: đã đặt góc 0°, cao độ 3,40 m, chiều dài 15,60 m, mở canopy; xác minh thông báo chặn di chuyển khi canopy đang mở.
- Đã kiểm tra chặn tiếp cận khi thiếu xác nhận, đặt lại dừng khẩn cấp, tạm dừng/tiếp tục, bật/tắt nhãn và đổi camera.
- Responsive: kiểm tra desktop 1440 × 1080 và mobile 390 × 844; không tràn ngang tài liệu.
- WebMCP tùy chọn: pbb_status đọc đúng pose/trạng thái; input không đúng schema bị từ chối.

Lưu ý: quá trình thay mã nóng trong lúc phát triển từng gây lỗi tháo nhãn DOM; tải lại trang đã khôi phục. Kiểm tra bật/tắt nhãn trên lần tải sạch không tái hiện lỗi. Chưa kiểm tra trên mọi GPU/trình duyệt; WebGL cần tăng tốc phần cứng.

Chưa triển khai lên Internet: lần đăng ký Sites lỗi kết nối; truy vấn tiếp theo không ghi nhận site đã tạo. Mã nguồn và bản chạy cục bộ vẫn đầy đủ.
