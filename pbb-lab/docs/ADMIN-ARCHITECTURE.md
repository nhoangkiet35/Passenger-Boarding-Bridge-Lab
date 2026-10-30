# Client / Admin

## Client

Menu public: `/` (Mô phỏng PBB), `/vdgs` (Mô phỏng VDGS), `/ground-ops` (Ground Operations), `/#operator-console` (Bàn điều khiển). Trang Giới thiệu đã được gỡ; footer có lối vào Quản trị.

## Admin

- `/admin`: tổng quan sau đăng nhập.
- `/admin/login`: đăng nhập quản trị.
- `/admin/explore`: thư viện kỹ thuật Khám phá PBB.
- `/api/admin`: endpoint server chung, kiểm tra mật khẩu/phiên cho mọi module.
- `/explore` và GET `/api/explore`: chuyển hướng đến `/admin/explore`.

`server/admin-handler.mjs` quản lý xác thực và phản hồi riêng tư. `server/admin-layout.mjs` định nghĩa menu/module và bố cục admin. Module hiện có là Explore; chưa có chức năng chỉnh sửa nội dung hoặc quản lý người dùng. Sau này thêm module vào registry và route server, luôn qua kiểm tra phiên. Không import nội dung admin vào entry client.

Gói `.private-explore` chỉ được đưa vào Vercel Function, không xuất bản thành static. Mật khẩu và biến môi trường hiện có giữ nguyên; tên cookie cũ được giữ để tương thích phiên. Các route admin dùng no-store/noindex. Bản dev và preview protected dùng cùng handler với Vercel. Đăng xuất chuyển đến `/admin/login` và xóa cookie.
