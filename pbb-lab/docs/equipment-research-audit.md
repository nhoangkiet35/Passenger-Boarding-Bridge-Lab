# Nghiên cứu kỹ thuật cho admin — 13/10/2026

Nội dung biên soạn nằm ở `private/explore/researchData.ts`, hiển thị bởi `EquipmentResearch.tsx`. Chỉ entry riêng của admin nhập các tệp này. Không xuất bản file PDF hoặc ảnh render nguồn.

## Phần đã đọc và sử dụng

- PBB.pdf: phần vận hành, kiểm tra xung quanh, chức năng panel, preset/autolevel, tiếp xúc cabin, kết thúc, cảnh báo. Số trang PDF tương ứng nhãn 1-x trong manual. Bản dịch chưa có model/revision rõ ở đầu tài liệu.
- GPU Skywinder Rev A bản tiếng Việt: PDF 5, 7, 9–10, 35, 38–55, 58–59, 63. Phân biệt nguồn 400 Hz, phản hồi interlock, reel, EPO và bước bảo trì. Không chuyển bảng sửa chữa kỹ sư thành checklist vận hành.
- PCA ITW GSE 3500: 572.610BB, 01/2025; PDF 5, 20–23, 47–49, 56, 65–66. Đối chiếu cấu hình AEF, CE/UL, môi chất, thông số và log. Không gán tham số của video cho cấu hình thực tế.
- PWS: specification 20337 tại PDF 39–48, chủ yếu 40–42; đối chiếu phần compliance PDF 11–12. Specification chưa thay manual vận hành/vệ sinh.
- Honeywell VDGS datasheet October 2022: PDF 1–4, nhất là cấu hình MCB, IP theo bộ phận, hiệu năng tại stop point và tùy chọn an toàn.
- MCB v3 guide: trang in 6, 8–16, 18–25; trang PDF = trang in +4 trong phần nội dung. Không đưa passcode mặc định vào trang học tập.
- TMan Issue 1.0 guide: chương 8–9, PDF/trang 76–95; dùng chi tiết 76–87 và E-STOP 84–85.
- IASS SCADA: PDF 3, 7–17; có khác biệt ngày/version trên bìa và bảng version. Phân tích alarm/trend là diễn giải nghiên cứu.
- Website chính thức ShinMaywa PAXWAY và Honeywell Automated Airside Operations: đối chiếu phạm vi chức năng, không thay hồ sơ nghiệm thu thiết bị sân bay.

## Đối chiếu ảnh nguồn

Đã render và xem bảng PCA PDF 49, PWS PDF 42 và GPU PDF 63 bằng PDFium. Hình render chỉ là tài liệu kiểm tra local dưới `tmp/research`, được .vercelignore loại khỏi upload.

## Điểm chưa thống nhất

1. PCA 150: 150 kg/min không tương đương 280 lb/min. Đây là bất nhất có trong ảnh bảng gốc, không phải lỗi extraction. Không tự sửa giá trị nhà sản xuất; giữ ghi chú và yêu cầu xác nhận.
2. GPU: trang 5 ghi 360–480 V, trang 63 ghi 400–480 V danh nghĩa/dung sai, và 315 V ở tải 30 kVA. Chưa gộp thành một giới hạn chung. Một số lỗi dịch tên alarm/đơn vị cần đối chiếu bản tiếng Anh.
3. PWS: compliance có 80 PSI, 0–75 PSI; spec 20337 nêu 500 kPa. Không nhầm giới hạn van RPZ/ống với áp suất cấp tàu bay. Lọc 50 micron tự nó không chứng minh chất lượng vi sinh hoặc loại bỏ chlorine.
4. VDGS: thuật ngữ Parked/In-block/OnBlock khác theo tài liệu. HW Activated và Sys Activated không giải phóng bằng TMan. Mọi sửa trạng thái phải đối chiếu hiện trường và quyền.
5. PBB: bản dịch có lỗi từ và câu. Không dùng giới hạn gió/safety recovery thiếu cấu hình làm SOP chung.

## Phạm vi chưa hoàn tất

Không tuyên bố đã thẩm định toàn bộ thư mục tài liệu. Các ConOps, ICD IASS, bộ hồ sơ gói thầu lớn đã được lập chỉ mục/trích xuất phục vụ nghiên cứu tiếp; chưa được dùng làm căn cứ cho ngưỡng hoặc tính năng lắp đặt trong bản này. PAXWAY2024_EN là PDF ít văn bản trích xuất; dùng trang chính thức để đối chiếu chức năng.

Đây là nội dung đào tạo/nghiên cứu, chưa chứng nhận model, commissioning, SOP hiện hành, tiêu chuẩn hiện hành hoặc chất lượng nguồn nước. Danh mục nguồn trên admin nêu phạm vi sử dụng và hồ sơ cần bổ sung cho từng thiết bị.
