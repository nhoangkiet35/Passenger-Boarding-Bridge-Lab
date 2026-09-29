# PBB Lab — Mô phỏng cầu ống lồng hành khách

Website React + TypeScript + Three.js qua React Three Fiber. Mô hình tạo bằng hình khối trong code, không cần tải tài nguyên 3D, ảnh hoặc font bên ngoài khi sử dụng. Giao diện tiếng Việt, responsive, có điều khiển chuột và bàn phím.

Xem [README tại gốc repository](../README.md) để có hướng dẫn cài đặt từng bước, chạy production và xử lý lỗi. Nếu dùng gói ZIP chỉ chứa thư mục này, các lệnh bên dưới vẫn đủ để khởi động.

## Cài đặt và chạy

Yêu cầu Node.js 24 LTS và pnpm 11. Nếu chưa có pnpm: `npm install -g pnpm@11.19.0`.

```sh
cd pbb-lab
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev
```

Mở URL được in ở terminal (mặc định http://localhost:5173). Không mở trực tiếp file TSX/HTML từ ổ đĩa. Kích hoạt WebGL và tăng tốc phần cứng trong trình duyệt.

```sh
pnpm test       # Kiểm tra logic chu trình và liên động
pnpm typecheck  # Kiểm tra TypeScript
pnpm build     # Build production
pnpm start     # Phục vụ bản build bằng Wrangler local
```

Lệnh cài đặt bỏ qua lifecycle script; các binary nền tảng cần thiết được cung cấp qua dependency. Cấu hình này đã được kiểm tra build trên Windows x64. Không cần khóa API, cơ sở dữ liệu hay tài khoản cloud để chạy cục bộ. Vinext/Vite cung cấp môi trường React và build; cấu hình Sites có sẵn cho triển khai tùy chọn.

## Chế độ hướng dẫn

Chọn **Chế độ hướng dẫn → Tiếp cận**. Hệ thống lần lượt đánh dấu kiểm tra khu vực và xác nhận tàu bay, bật nguồn, tiếp cận, căn chỉnh, mở canopy và dừng ở trạng thái kết nối. Mỗi bước giữ giải thích 3 giây mô phỏng; nút **Tạm dừng** giữ cả chuyển động và đồng hồ bước. Chọn **Tách cầu** để kết thúc phục vụ, thu canopy, lùi, thu cầu và trở về vị trí đỗ. Tốc độ 0,5× / 1× / 2× áp dụng cho hoạt ảnh lẫn thời gian giải thích.

## Điều khiển thủ công

1. Bật nguồn và đánh dấu cả hai điều kiện tiếp cận.
2. Xoay về **0°**, đặt cao độ sàn **3,40 m**, chiều dài **15,60 m**. Chờ cầu đạt các mục tiêu; khoảng hở thân là **0,40 m**, lệch ngang **0 m**.
3. Chọn **Triển khai**. Khi canopy đạt 100%, mô phỏng đã kết nối.
4. Chọn **Kết thúc phục vụ**, **Thu lại** và chờ canopy về 0%.
5. Chọn **Lùi khỏi cửa**, chờ cabin lùi, sau đó **Về vị trí đỗ**.

Thanh trượt đặt mục tiêu; nút ± thay đổi từng nấc. Có thể dùng Tab để chọn, phím mũi tên điều chỉnh thanh trượt. Bật/tắt nhãn, chọn tổng thể / gần cabin / từ trên cao, kéo chuột để xoay, cuộn để thu phóng, chuột phải để dịch cảnh. Đặt lại camera chỉ đổi góc nhìn; Đặt lại bài học xóa toàn bộ trạng thái và phục hồi camera, tốc độ, nhãn.

## Liên động minh họa

- Chưa bật nguồn hoặc chưa xác nhận khu vực và tàu bay: chặn tiếp cận.
- Canopy chỉ mở khi cabin đã dừng, góc dưới 2°, lệch ngang dưới 0,35 m, lệch cao dưới 0,12 m và khoảng hở 0,24–0,65 m.
- Canopy đang mở, đang thu hoặc đã mở: khóa xoay/nâng/thu và về đỗ.
- Dừng khẩn cấp hủy mục tiêu ngay trên mọi trục. Đặt lại dừng khẩn cấp không tự chạy lại lệnh cũ; cần lệnh mới.
- Tắt nguồn, thu hồi xác nhận hoặc đổi chế độ hủy chuyển động đang chạy. Tạm dừng giữ mục tiêu để tiếp tục.
- Vùng đỏ xuất hiện khi khoảng hở dưới 0,65 m; chặn trước mặt phẳng giới hạn 0,24 m. Đây là mặt phẳng bảo vệ đơn giản, không phải mô phỏng va chạm toàn bộ máy bay.

## Giới hạn mô hình

Dùng để học tập/thuyết trình, không phải hướng dẫn vận hành chính thức và không điều khiển thiết bị thật. Hình học, tốc độ, ngưỡng an toàn không đại diện cho một mẫu PBB/sân bay cụ thể. Canopy giản lược bằng nếp xếp; cabin không xoay độc lập; tiến/lùi được thể hiện bằng thay đổi chiều dài ống. Không mô phỏng cơ khí thủy lực, tải trọng, tự cân bằng, cảm biến, cầu thang, cửa mở, độ quay lốp/góc lái bánh xe hoặc biến dạng thân tàu bay.

## Tổ chức mã nguồn

- `app/page.tsx`: tải ứng dụng ở phía client; `app/globals.css`: giao diện và responsive.
- `components/pbb/Scene.tsx`: sân đỗ, nhà ga, ánh sáng, bóng, camera, vùng cảnh báo.
- `components/pbb/Models.tsx`: hình học máy bay và PBB.
- `components/pbb/Controls.tsx`: nguồn, xác nhận, các trục chuyển động, canopy, dừng khẩn cấp.
- `components/pbb/Guide.tsx`: quy trình, thuật ngữ, hướng dẫn và giản lược.
- `components/pbb/Lab.tsx`: khung ứng dụng, vòng hoạt ảnh, điều phối giao diện.
- `lib/simulation.ts`: mô hình trạng thái, giới hạn, liên động, tiến trình tự động; độc lập với React.
- `scripts/test-simulation.mjs`: các kiểm tra hành vi độc lập.

Không lưu tiến trình sau khi tải lại trang. WebMCP `pbb_status` là phần tùy chọn, chỉ đọc trạng thái trong trình duyệt hỗ trợ; không bắt buộc để dùng website.
