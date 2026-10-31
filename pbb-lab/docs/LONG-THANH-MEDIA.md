# Thư viện bài viết và slideshow Long Thành

- Nội dung tuyển chọn: `lib/longThanhMedia.ts`, ngày đối chiếu 31/10/2026. Sáu bài từ Báo Điện tử Chính phủ và VnExpress; URL, tiêu đề, ngày đăng và ảnh lấy từ các trang nguồn đã mở kiểm tra. Tóm tắt được viết lại ngắn gọn, không lưu toàn văn.
- Bốn ảnh slideshow: ảnh tổng quan do người dùng cung cấp (phối cảnh), ảnh công trường/nhà ga trong bài Chính phủ ngày 29/6/2026, ảnh nhà ga hình cánh sen trong bài VnExpress ngày 27/11/2025, ảnh khu bay trong bài Chính phủ ngày 29/6/2026. Ngày trên slide là ngày đăng bài nguồn, không gán làm ngày chụp.
- Ảnh nguồn được dẫn trực tiếp qua URL CDN, có chú thích, liên kết bài gốc và dự phòng nếu ảnh không tải; không tải hoặc đóng gói ảnh báo vào public. Ảnh địa phương do người dùng cung cấp vẫn ở public như cũ.
- Component `LongThanhMedia.tsx`: slideshow thay ảnh tĩnh mục 01; thư viện đứng sau phần giới thiệu Long Thành, có liên kết trong mục lục nội trang.
- Tự chuyển mỗi 6,5 giây, chỉ khi slideshow trong vùng nhìn, tab hiện, không hover/focus, không mở ảnh lớn. Mặc định dừng khi hệ thống yêu cầu giảm chuyển động; tương tác chọn ảnh dừng tự chuyển. Có nút bật/tắt, chọn ảnh, phím trái/phải, xem ảnh lớn và Escape/trả focus.
- Thư viện có lọc chủ đề, tìm không dấu, xóa từ khóa, sắp xếp ngày đăng và trạng thái rỗng. Toàn bộ bài vẫn được SSR/prerender; noscript hiển thị các ảnh và bỏ điều khiển cần JS.
- Không bổ sung lịch tự cập nhật. Những mốc khai thác dự kiến chỉ là nội dung bài nguồn tại ngày đăng; ghi chú trên giao diện phân biệt với tình trạng khai thác hiện tại.

Kiểm chứng: TypeScript, build production, kiểm tra tài liệu nội bộ và bảo vệ Explore qua. Trình duyệt desktop và mobile 390px không tràn ngang; cả sáu ảnh bài và bốn ảnh slide tải được. Lọc Kiến trúc còn một bài; tìm hieu chuan trả về bài hiệu chuẩn; tìm không có kết quả hiển thị nút đặt lại; thứ tự cũ nhất bắt đầu 20/10/2025. Lightbox chuyển bằng phím, Escape đóng và trả focus; căn giữa desktop; console không có lỗi ứng dụng. Chưa phát hành production.
