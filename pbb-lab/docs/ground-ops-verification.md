# Ground Operations — kiểm tra nhiệm vụ

Ngày kiểm tra: 27/10/2026. Route: /ground-ops.

## Kết quả kiểm tra

| Nhiệm vụ | Bằng chứng |
| --- | --- |
| 1. Bốn điều kiện an toàn | Đi bộ và nhấn E hoàn thành cả bốn điểm trong trình duyệt; HUD chuyển sang nhiệm vụ 2. |
| 2. Căn cầu | Trình duyệt: vào console bằng E, thử D, la bàn đổi 0° → +3°. Kiểm tra tự động: tích phân chuyển động, canopy, auto level, xác nhận kết nối. |
| 3. Xuống sân đỗ | Kiểm tra tự động: cửa E, khóa khi cầu chạy, ngưỡng cửa, mặt sàn liên tục qua chiếu nghỉ và toàn bộ bậc. |
| 4. GPU | Kiểm tra tự động: kiểm tra → lấy → kéo → cắm → khóa → quay về thiết bị để bật. |
| 5. PCA | Kiểm tra tự động: trình tự dịch vụ, vị trí ổ nhận, tuyến ống và chiều dài. |
| 6. PWS | Kiểm tra tự động: lấy/đẩy xe thang, căn vị trí/hướng, chốt bánh, leo sàn, mở bảng, cắm/khóa, cấp đủ nước và dừng. Kiểm tra tuyến ống với thân máy bay, càng và bậc thang thực tế. |
| 7. Bàn giao | Kiểm tra tự động: chỉ hoàn tất khi cầu, dịch vụ, thang và tuyến ống đạt điều kiện. |

Các bài kiểm tra trạng thái không thay thế một lượt chơi hoàn chỉnh bằng bàn phím và chuột. Chưa xác nhận toàn bộ bảy nhiệm vụ trong cùng một lượt chơi trực tiếp trên trình duyệt. Pointer Lock chưa được kiểm tra đầy đủ; chế độ kéo chuột đã dùng để kiểm tra thực tế.

## Sửa trong đợt kiểm tra

- Gợi ý lấy thiết bị dùng cùng độ cao tay và phạm vi với hàm thực hiện thao tác.
- Phân biệt rõ cắm, khóa tại tàu bay, và quay về thiết bị trên cầu để khởi động.
- Hướng dẫn theo trạng thái hiện tại, có khoảng cách và điểm mục tiêu trên sơ đồ.
- Luôn có nút chơi bằng kéo chuột.
- HUD gọn, biển 3D chỉ hiện cho nhiệm vụ đang làm; camera tiếp cận không đè lên sơ đồ.

Chạy lại: npm test; node node_modules/typescript/bin/tsc --noEmit --incremental false; node node_modules/vite/bin/vite.js build --config vite.vercel.config.ts.
