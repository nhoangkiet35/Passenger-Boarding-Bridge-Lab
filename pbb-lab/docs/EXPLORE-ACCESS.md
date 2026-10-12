# Truy cập riêng tư Explore

Admin gồm `/admin` (tổng quan), `/admin/login` và `/admin/explore` (Khám phá PBB), được phục vụ bởi `/api/admin`. `/explore` cũ chuyển hướng sang `/admin/explore`. Vercel Node Function quản trị kiểm tra mật khẩu và phiên trước khi trả HTML/JS/CSS nội dung. Payload `.private-explore/` chỉ được đưa vào bundle Function qua includeFiles; tuyệt đối không sao chép vào public hoặc dist-vercel.

## Cấu hình

Hai biến chỉ dành cho máy chủ: `EXPLORE_PASSWORD_HASH` (salt hex 16 byte + dấu hai chấm + scrypt 64 byte dạng hex), `EXPLORE_SESSION_SECRET` (bí mật ngẫu nhiên ít nhất 32 ký tự). Cấu hình máy này nằm trong `.env.local` bị Git bỏ qua. Không dùng tiền tố VITE_ hoặc NEXT_PUBLIC_. Production thiếu cấu hình sẽ trả 503 và không cung cấp nội dung.

## Chạy và kiểm tra

- `npm run build:vercel`: tạo payload riêng, build công khai và kiểm tra không rò nội dung.
- `npm run test:auth`: kiểm tra đăng nhập, CSRF, cookie, hết hạn, đăng xuất, giới hạn thử và thiếu cấu hình.
- `npm run preview:protected`: xem bản bảo vệ tại http://127.0.0.1:5174/explore.
- `npm run dev` trên Windows dùng Vite standalone giống bản Vercel, có gateway Node `/api/explore`, build payload riêng khi khởi động nếu nguồn mới hơn đầu ra, dùng `.env.local` và chặn URL nguồn riêng.
- `preview:vercel` chỉ phục vụ static; dùng `preview:protected` để kiểm tra auth bản build. Cloudflare production chưa được hỗ trợ bởi gateway dev; không dùng bản đó cho nội dung riêng.

## Triển khai

Cần cấu hình hai biến bí mật trên Vercel rồi triển khai bản mới. Bản triển khai cũ vẫn chứa nội dung công khai cũ; không coi nó đã được bảo vệ. Mật khẩu chung cho phép mọi người biết mật khẩu truy cập, không xác minh danh tính nhân viên.

Cookie HttpOnly, SameSite=Strict, Secure trên HTTPS, hết hạn sau hai giờ. Nội dung và phản hồi xác thực dùng no-store và noindex. Đăng xuất xóa cookie; thay hash/bí mật vô hiệu hóa các phiên cũ. Giới hạn năm lần thử trong 15 phút là theo instance: production đã bổ sung quy tắc WAF “Explore password attempts”, giới hạn 5 POST vào các đường dẫn admin và Explore cũ mỗi 600 giây theo IP. Quy tắc WAF áp dụng qua các instance; giới hạn theo IP không phải hạn mức toàn bộ các nguồn tấn công. Người đã được cấp quyền có thể sao chép nội dung; nội dung đã công khai trước đây không thể thu hồi khỏi bản sao của người khác.
