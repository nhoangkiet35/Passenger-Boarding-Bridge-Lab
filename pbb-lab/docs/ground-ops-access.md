# Cửa cầu thang và la bàn trong Ground Operations

- Cầu thang gắn tại đoạn ống ngay sau cabin, lùi 2,8 m so với trục cabin; chiếu nghỉ và cầu thang xoay, co/duỗi và đổi cao độ cùng cầu. Kích thước là giả định gameplay.
- Đã bỏ cầu thang cố định cạnh rotunda trong màn `/ground-ops`; cầu thang trang mô phỏng PBB cũ vẫn dùng cấu hình cũ.
- Sau khi cầu được cố định phục vụ, đi đến cửa ghi “Ống A / sau cabin”, nhấn **E** mở cửa, đi ra chiếu nghỉ rồi xuống thang. Nhấn **E** từ phía trong hoặc ngoài để đóng lại. Không đóng cửa khi người chơi đang ở ngưỡng cửa.
- Cửa đóng chặn lối đi. Bậc thang, chiếu nghỉ và đường đi dùng chung `stairConfig` và `stairFrame` trong `lib/groundOps.ts`.
- Khi điều khiển cầu, HUD hiển thị la bàn bánh xe: kim theo góc đánh lái −90°…+90° tương đối với trục ống; phương vị là hướng thế giới 0° = −Z, 90° = +X. Đây là quy ước sân đỗ ảo, không phải hướng Bắc địa lý đã khảo sát. Tiến/lùi được hiển thị riêng.
- **A/D** đánh lái, **W/S** chạy tiến/lùi. Khi dừng, la bàn giữ hướng bánh hiện tại.

### Sửa thao tác E tại cửa cầu thang

- Cửa mở được khi cầu đã dừng, kể cả đang đỗ trước khi hoàn tất tiếp cận. Mở cửa không bỏ qua chuỗi nhiệm vụ GPU/PCA/PWS.
- Cửa chỉ khóa khi cầu còn chuyển động hoặc có lỗi/dừng khẩn cấp. Nhãn và thông báo chỉ rõ lý do.
- **Tab** dừng điều khiển và rời bàn bất cứ lúc nào. Nếu cầu đã căn chỉnh, canopy và autolevel hoàn tất, game ghi nhận phục vụ ngay khi rời bàn, không cần bước xác nhận ẩn.
- Đến gần cửa trong 2,1 m rồi **E** mở/đóng từ bên trong hoặc chiếu nghỉ. Không đóng đè người đang đứng trên ngưỡng cửa. Cửa đang mở khóa việc vào chế độ lái cầu.
- Nếu trình duyệt không cho Pointer Lock, chọn **Chơi bằng kéo chuột**: giữ chuột trái/phải và kéo để nhìn; WASD/E vẫn hoạt động; Esc tạm dừng. Mất tiêu điểm cũng dừng chuyển động và xóa phím đang giữ.
- URL màn chơi là `/ground-ops`; trang `/` là mô phỏng bàn điều khiển PBB cũ. `scripts/test-ground-door.mjs` kiểm tra lại chọn tương tác E, mở/đóng, dừng/rời bàn và các khóa cửa.

Kiểm tra: `node scripts/test-ground-ops.mjs`, `node scripts/test-simulation.mjs`, `node scripts/test-training.mjs`, TypeScript và build Vite. Kiểm thử logic bao gồm cửa hai chiều, chống đóng đè người, đường đi liên tục xuống thang, vị trí cầu thang theo tư thế cầu và quy đổi góc la bàn.

## Dùng GPU, PCA, PWS gắn trên cầu

Game dùng lại các mô hình có sẵn: GPU dưới cabin, cuộn ống PCA dưới ống cầu và tủ PWS tại trụ nâng. Ba xe dịch vụ rời đã được bỏ khỏi cảnh game. Vị trí neo theo đúng phép biến đổi của các bộ phận này khi cầu xoay, thay đổi chiều dài và cao độ; tủ PWS giữ cao độ theo cụm bánh/trụ.

1. Sau khi xuống cầu thang, đến đầu nối treo trên giá tại thiết bị đang được giao nhiệm vụ. **E** kiểm tra, **E** lần nữa để cầm đầu nối.
2. Đầu nối và bàn tay xuất hiện trong góc nhìn. Đi bộ để kéo cáp/ống từ thiết bị trên cầu. HUD báo chiều dài đang kéo và chiều dài còn lại.
3. Khi gặp càng bánh hoặc vật cản, đi vòng để tuyến dây giữ lại điểm gấp; khi lùi lại ở nơi thông thoáng, dây thu bớt các điểm gấp. Không cho kéo vượt giới hạn hoặc xuyên mô hình tàu bay.
4. Ngắm đúng đầu nhận dưới thân tàu bay, **E** cắm rồi **E** khóa. Với PWS, **E** mở bảng nước sạch trước khi cắm.
5. Quay lại điểm thao tác của thiết bị trên cầu, **E** khởi động. Với PWS, theo dõi đến đủ lượng nước rồi **E** tại thiết bị để dừng.
6. Nếu chưa cắm, **E** tại giá lấy đầu nối để trả lại. Nút gỡ kẹt trả đầu nối đang cầm về giá và xóa tuyến dây tạm.

GPU dùng đầu điện chữ nhật với chân cắm; PCA dùng đầu ống khí đường kính lớn; PWS dùng khớp nước nhỏ. Các loại không thể dùng thay nhau. Dây/ống dùng hình học ống 3D theo đường cong bo góc, không phải mô phỏng dây mềm toàn phần. Chiều dài GPU 14 m, PCA 26 m, PWS 52 m và vị trí đầu nhận dưới thân là thông số minh họa gameplay, chưa xác minh theo A321 thật.

`lib/groundCable.ts` dùng chung tuyến cong cho hiển thị và kiểm tra va chạm. `node scripts/test-ground-cables.mjs` kiểm tra vị trí neo, giới hạn kéo, hình học thân tàu bay thực tế trong ứng dụng, và giữ điểm gấp khi kéo PWS vòng qua càng chính. Chạy cả nhóm bằng `pnpm test:ground`.

## Vị trí đầu nhận và thang PWS

Bố trí theo yêu cầu riêng của màn chơi: GPU ở đầu tàu bay (z = −5,5 m), PCA ở bụng giữa hai cánh (z = 11,5 m), PWS ở dưới đuôi (z = 34 m, cao 3,25 m). Đây là vị trí minh họa gắn với mô hình hiện có; không khẳng định vị trí kỹ thuật của A321 thật.

Sau PCA, lấy thang có bánh xe ở bên trái sân đỗ. Đến tay đẩy phía sau, **E** để nắm; **W/S** đẩy/lùi, **A/D** xoay hướng. Đẩy sàn thang vào khung PWS dưới đuôi. **E** buông tay, đi tới chốt bánh rồi **F** để cố định. Thang phải đúng vị trí và hướng mới chốt được. Khi chưa chốt, không thể đi lên thang.

Lấy đầu ống PWS từ cầu rồi tự đi lên từng bậc. Chỉ khi đã leo lên sàn thang, đúng vị trí và còn chốt bánh, mới mở bảng/cắm/khóa đầu nhận nước. Ống được dẫn bên ngoài khung thang và qua tay vịn. Xuống thang rồi trở lại tủ PWS trên cầu để khởi động và dừng cấp theo nhiệm vụ. Chốt bánh bị khóa khi đang dùng ống; nếu trạng thái thang mất an toàn, dòng nước mô phỏng bị ngắt.

`lib/mobileSteps.ts` quản lý vị trí, trạng thái đẩy/chốt, các mặt bậc thang và tuyến dẫn ống. `scripts/test-mobile-service-steps.mjs` kiểm tra sai vị trí/hướng, chống đẩy khi đang cầm ống, chống thao tác nước từ mặt đất, leo/xuống liên tục và các liên động bánh–nước. Kiểm thử cáp dùng chung hình học bậc với mô hình 3D để kiểm tra đường ống khi leo.
