# About — Long Thành, ShinMaywa và PBB Lab

## Cấu trúc

- `/about`: route Next/Vinext; `standalone/main.tsx`: tuyến Vite; cấu hình Vercel phục vụ HTML tại `about/index.html`.
- Nội dung: `lib/aboutContent.ts`; giao diện: `components/pbb/About.tsx`, `AboutBridge.tsx`, `about.css`.
- Sơ đồ SVG nguyên lý, bảy bộ phận và năm nội dung chuyển động. Không dựng lại logo hãng; không tải engine 3D trên About.
- Dùng Motion có sẵn để reveal một lần; nội dung hiển thị mặc định, tôn trọng reduced motion. Bản Vercel prerender HTML và thêm nội dung noscript cho toàn bộ nguyên lý cơ cấu.

## Đối chiếu nội dung (nội bộ, không triển khai)

- `PAXWAY2024_EN.pdf`: xem bản render PDF trang 3–4 (trang in 04–07); xác nhận dòng PAXWAY, vai trò cầu và các biến thể khác nhau. Không lấy thông số A380 hay số lượng cung cấp làm cấu hình Long Thành.
- `PBB.pdf`: đọc hướng dẫn tiếng Việt, cấu tạo và vận hành tổng quan.
- `LTIA-5.10-PMU-43200-ABE-OTH-0660A, gói thầu hệ thống PBB nhà ga T1.pdf`: PDF trang 26 về các bộ phận; 41–42 về tiếp giáp và tự cân bằng; phần mô tả cột nâng/vít me bi. Không công khai tên hồ sơ trên website, không lấy giá trị giới hạn để suy rộng cho toàn sân bay.
- Báo cáo thử việc Nguyễn Hữu Hoàng Kiệt: bối cảnh nhà ga, sân đỗ và phối hợp phục vụ.
- Sơ đồ mặt bằng tổng thể sân bay (phụ lục 1): đối chiếu bố trí tổng quan qua phần trích xuất; sơ đồ nhà ga hành khách (phụ lục 7): render trang đầu và xem bố cục. Không suy ra trạng thái khai thác từ bản vẽ.
- Trang sản phẩm công khai ShinMaywa: https://www.shinmaywa.co.jp/english/products/paxway/introduction.html — liên kết tham khảo trên giao diện; các tùy chọn như AI docking không được coi là tính năng mô phỏng hay lắp đặt tại Long Thành.
- `Lab.tsx`, `Controls.tsx`, `OperatorConsole.tsx`, `Guide.tsx`, `Scene.tsx`: đối chiếu góc nhìn, thủ công/hướng dẫn, CCTV, trạng thái thiết bị, dừng khẩn và phản hồi mô phỏng.

## Giới hạn và ảnh

Chưa đưa thẻ số liệu vì chưa xác nhận đủ giai đoạn, phạm vi và dữ liệu công khai để trích nguồn. Cần bổ sung tài liệu công bố được phép sử dụng nếu muốn thêm công suất thiết kế, quy mô và tình trạng khai thác.

Ảnh hero AI có sẵn được ghi nhãn; ảnh Long Thành dùng đúng URL Sforum người dùng đã cung cấp trước đó, ghi rõ phối cảnh và nguồn. Không trình bày ảnh phối cảnh là ảnh chụp thực tế. Các ảnh tài liệu PDF không được đưa vào public. Cần ảnh thực tế đã xác nhận quyền sử dụng để thay ảnh hero nếu muốn.

Không có trang tài liệu công khai hiện hữu, nên CTA trỏ đến mô phỏng và bàn điều khiển hiện có; không tạo liên kết đến hồ sơ nội bộ.

Ảnh minh họa trải nghiệm: public/images/about-simulator.jpg được chụp trực tiếp từ bản mô phỏng hiện có trong phiên này; không phải ảnh thiết bị thực tế.

## Kiểm chứng

TypeScript qua với --noEmit --incremental false. Build production và kiểm tra tài liệu nội bộ/Explore qua. Trình duyệt kiểm tra desktop, tablet 768px và mobile 390px; không tràn ngang, ảnh tải đúng; bảy lựa chọn bộ phận và năm chuyển động phản hồi; Enter và Escape trong menu hoạt động; console không có lỗi ứng dụng. Reduced motion tắt animation hero. HTML dự phòng có sáu phần và 12 bài giải thích bộ phận/chuyển động. Chưa triển khai lên production.

Sơ đồ cầu được vẽ lại bằng SVG tại BridgePrincipleDrawing.tsx theo hai ảnh tham khảo người dùng cung cấp: góc nhìn bên, ống lồng kính có giằng, trụ rotunda riêng, cột nâng, bánh xe, cầu thang và cabin/canopy. Bố cục mang tính nguyên lý, không xác nhận model hay kích thước thực tế từ ảnh tham khảo.

Theo yêu cầu mới, đã gỡ toàn bộ khối Hiểu chuyển động, năm nút chuyển động, dữ liệu và nội dung noscript tương ứng. Sơ đồ và lựa chọn bảy bộ phận vẫn được giữ.

Ảnh mục 01 / LONG THÀNH đã thay bằng ảnh tong_quan_du_an_san_bay_long_thanh.jpg do người dùng cung cấp, lưu tại public/images/long-thanh-overview.jpg. Gỡ liên kết và chú thích nguồn Sforum cũ, ghi rõ ảnh phối cảnh.
