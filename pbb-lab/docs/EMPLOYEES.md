# Quản lý nhân viên bằng Excel

- Admin → Danh sách nhân viên → **Thêm nhân viên** lưu một ID/Name mới. ID mới đăng nhập được ngay sau khi lưu thành công.
- **Tải danh sách Excel** xuất danh sách hiện tại. Cột A là ID (Text, đúng 6 chữ số), cột B là Name. Giữ tiêu đề ở dòng 1; thêm hoặc sửa các dòng tiếp theo. Không dùng công thức trong hai cột này.
- **Xem trước thay đổi** đọc file .xlsx tối đa 1 MB, kiểm tra ID trùng/sai, hiển thị các ID thêm, đổi tên hoặc loại bỏ. Chỉ **Xác nhận lưu danh sách** mới thay thế toàn bộ danh sách. File phải giữ lại ID đang đăng nhập.
- File tải về là bản sao. Chỉnh bản sao trên máy không tự đồng bộ website: phải nhập lại và xác nhận lưu.

## Lưu dữ liệu

Trên máy phát triển, website đọc/ghi `server/data/nhan-vien-pbb.xlsx`. Có thể đặt `EMPLOYEE_WORKBOOK_PATH` để dùng một bản Excel khác. Lưu dùng khóa file và thay file nguyên tử, không ghi đè khi phiên bản đã thay đổi. Thêm nhân viên không làm đăng xuất người đang dùng; nhân viên bị loại khỏi danh sách không thể tiếp tục dùng phiên cũ. Đổi tên hiển thị ngay từ lần truy cập tiếp theo.

Trên Vercel, file hệ thống của Function không lưu bền vững. Cần kết nối Vercel Blob store **private** với `BLOB_STORE_ID` (OIDC) hoặc `BLOB_READ_WRITE_TOKEN` phía máy chủ. Danh sách được lưu ở `pbb/nhan-vien-pbb.xlsx`, đọc mới và ghi có điều kiện ETag để tránh ghi đè đồng thời. Lần đầu kho trống dùng 15 nhân viên từ file gốc; lần lưu đầu tạo workbook riêng tư.

Khi chưa kết nối kho trên Vercel, trang thông báo rõ và khóa nút ghi. Tải Excel và đăng nhập bằng danh sách gốc vẫn hoạt động. Không ghi tạm vào /tmp hoặc báo thành công khi dữ liệu chưa được lưu bền vững.

Ngày 23/10/2026, sau khi chủ dự án phê duyệt, kho Blob **private** `pbb-employees` đã được tạo và kết nối với môi trường **production** của `passenger-boarding-bridge`. Production đã được triển khai lại để nhận cấu hình. Đã lưu danh sách 15 nhân viên hiện có và đọc lại khớp hoàn toàn; không thay đổi thành viên. Preview và development chưa được kết nối kho này.

## Kiểm tra

`pnpm test:auth` kiểm tra đăng nhập và toàn bộ luồng Excel/thêm/nhập/xuất trên bản sao tạm, không sửa danh sách thật. Bao gồm ID mới đăng nhập, ID bị loại mất quyền truy cập, ID trùng, công thức, file hỏng, xem trước chưa lưu, ghi đồng thời, thiếu kho đám mây và file tải về giữ số 0 đầu.
