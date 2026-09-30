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

Dùng để học tập/thuyết trình, không phải hướng dẫn vận hành chính thức và không điều khiển thiết bị thật. Hình học, tốc độ, ngưỡng an toàn không đại diện cho một mẫu PBB/sân bay cụ thể. Canopy giản lược bằng nếp xếp, đóng/mở đồng bộ; cabin xoay độc lập ±12°, sàn nghiêng ±3° theo mô hình minh họa; tiến/lùi được thể hiện bằng thay đổi chiều dài ống. Không mô phỏng cơ khí thủy lực, tải trọng, tự cân bằng, cảm biến, cầu thang, cửa mở, độ quay lốp/góc lái bánh xe hoặc biến dạng thân tàu bay.

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

## Bàn điều khiển cabin và CCTV

Bàn điều khiển mới nằm dưới cảnh tổng thể; nhấn **Bàn điều khiển cabin ↓** ở đầu trang để chuyển đến đó. Bố cục tham khảo hình người dùng cung cấp, không mô phỏng chính xác phần cứng hay tiêu chuẩn của một nhà sản xuất.

- **Khóa TẮT / THỦ CÔNG / TỰ ĐỘNG** đồng bộ với nguồn và chế độ bài học. **POWER ON/OFF** cấp/ngắt nguồn mô phỏng.
- **Joystick**: kéo lên/xuống để tiến/lùi; kéo trái/phải để xoay cầu. Độ lệch cần quyết định tốc độ. Có thể focus joystick bằng Tab rồi giữ phím mũi tên; bốn nút hướng bên dưới cũng là nút giữ để chạy.
- **Thả chuột/phím, mất pointer capture, đổi cửa sổ, tạm dừng, ngắt nguồn hoặc dừng khẩn cấp** đều hủy lệnh giữ. Cầu không tự tiếp tục cho tới khi có lệnh mới.
- **TUNNEL UP/DOWN**, **CAB ROTATION** và **LEVEL FLOOR** là nút giữ để nâng/hạ, xoay cabin và nghiêng sàn. Phạm vi cabin ±12°, sàn ±3° chỉ là giá trị minh họa. Khi chuẩn bị kết nối, đưa sàn gần 0° và hướng cabin thẳng với cửa.
- **CANOPY** dùng hai nút thu/triển khai; không có cơ cấu rèm trái/phải độc lập trong mô hình.
- **PRESET START** chạy tiếp cận ở chế độ TỰ ĐỘNG; sau khi kết nối, nút này chuyển sang chu trình tách cầu.
- **Đèn trong / đèn ngoài** bật nguồn sáng tại cabin trong cả hai cảnh. **Thông gió** quay quạt 3D. **Điều hòa** thay đổi nhiệt độ minh họa về 22 °C; đây không phải mô hình nhiệt động lực học.
- **EMRG. STOP** dừng mọi trục cầu; **RESET** giải chốt khẩn cấp, không tự phục hồi lệnh cũ.

CCTV dùng camera 3D gắn cố định trong cabin, cùng dữ liệu hình học và trạng thái với cảnh tổng thể. Camera đi theo góc cầu, độ cao và góc xoay cabin, nhìn hơi chếch xuống để quan sát cửa và mép sàn. Không tự bám cửa, không dùng webcam, không xin quyền truy cập camera thật. Màn hình mất hình khi ngắt nguồn; dừng khẩn cấp vẫn giữ CCTV nếu nguồn còn bật. Dấu ngắm chỉ là mốc cố định trên hình, không phải nhận dạng cửa bằng cảm biến.

Các chỉ số khoảng hở, lệch ngang ΔZ và lệch sàn ΔH giúp so sánh hình ảnh với vị trí hình học. Liên động bảo vệ tính cả mép cabin khi xoay, không chỉ tâm đầu cầu. Bài kiểm tra console/camera nằm ở `scripts/test-console.mjs` và được chạy cùng `pnpm test`.

Các file bổ sung: `components/pbb/OperatorConsole.tsx`, `CctvMonitor.tsx`, `Joystick.tsx` và `console.css`.
## Triển khai lên Vercel

Bản production: https://passenger-boarding-bridge.vercel.app

Ứng dụng có bản build tĩnh riêng dùng chung mô phỏng 3D, bàn điều khiển và CCTV. Không cần database hay biến môi trường.

Chạy trong thư mục `pbb-lab`:

```powershell
pnpm install --frozen-lockfile --ignore-scripts
pnpm test
pnpm typecheck
pnpm build:vercel
pnpm preview:vercel --port 4173
```

Đăng nhập và triển khai lại từ **thư mục gốc repository** (cấp cha của `pbb-lab`), vì dự án Vercel đã đặt Root Directory là `pbb-lab`:

```powershell
npx vercel login
cd ..
npx vercel link --project passenger-boarding-bridge
npx vercel --prod
```

Nếu import Git trên Vercel, chọn Root Directory `pbb-lab`. File `vercel.json` đã đặt framework Vite, build command `pnpm build:vercel` và output `dist-vercel`. Địa chỉ production mong muốn là `passenger-boarding-bridge.vercel.app`, tùy tình trạng tên miền trên tài khoản Vercel. Không tự thêm `www` trước tên miền được Vercel cấp.

`pnpm dev` vẫn sử dụng cấu hình phát triển hiện có. Không dùng output Cloudflare `dist/server` cho Vercel.

Vercel đã liên kết repository GitHub. Cần commit/push các file cấu hình Vercel và mã nguồn mới trước khi dùng auto-deploy qua Git. Lần phát hành hiện tại được tải trực tiếp từ máy local.
