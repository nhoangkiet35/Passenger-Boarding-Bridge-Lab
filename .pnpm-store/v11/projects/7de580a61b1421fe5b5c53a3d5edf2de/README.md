# PBB Lab — Mô phỏng cầu ống lồng hành khách

Website React + TypeScript + Three.js qua React Three Fiber. Mô hình tạo bằng hình khối trong code, không cần tải tài nguyên 3D, ảnh hoặc font bên ngoài khi sử dụng. Giao diện tiếng Việt, responsive, có điều khiển chuột và bàn phím.

Xem [README tại gốc repository](../README.md) để có hướng dẫn cài đặt từng bước, chạy production và xử lý lỗi. Nếu dùng gói ZIP chỉ chứa thư mục này, các lệnh bên dưới vẫn đủ để khởi động.

## Tiếp cận thủ công trong mô phỏng

Giữ khoảng hở mép cabin / thân tàu 2,5–5 cm; sàn thấp hơn ngưỡng cửa 10–20 cm, độ nghiêng sàn tối đa ±2°. Không áp dụng ngưỡng lệch ngang hoặc lệch hướng cố định. Đường mở cửa phải nằm trong vùng trống cabin/canopy theo kiểm tra hình học bảo thủ; bảo vệ va chạm và khóa di chuyển khi mở canopy vẫn có hiệu lực. Thả joystick và chờ cầu dừng trước khi triển khai mái che. Nút tăng/giảm cao độ và chiều dài chỉnh mỗi lần 1 cm; góc cầu chỉnh mỗi lần 0,1°.

MESSAGE hiển thị số đo cảm biến mô phỏng và cảnh báo vận hành, ưu tiên nguy cơ trước. Các trạng thái nguồn, PLC và vị trí đỗ nằm ở chỉ báo riêng. Khi tắt nguồn, không hiển thị số đo như dữ liệu cảm biến đang hoạt động.

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

## Hiệu chỉnh theo hồ sơ LTIA — 11/10/2026

Các giới hạn/ngưỡng chưa xác nhận là **Giả định mô phỏng** tại `lib/technicalConfig.ts`. Bảng kiểm chứng và tình huống huấn luyện đã được gỡ khỏi giao diện. Tài liệu trong docs được phép lưu trong repo GitHub private, nhưng bị loại khỏi gói triển khai website; tên file và trích dẫn nguồn nội bộ không được xuất hiện trên website.

## Chế độ hướng dẫn

Chọn **Chế độ hướng dẫn → Tiếp cận**. Hệ thống lần lượt đánh dấu kiểm tra khu vực và xác nhận tàu bay, bật nguồn, tiếp cận, căn chỉnh, mở canopy và dừng ở trạng thái kết nối. Mỗi bước giữ giải thích 3 giây mô phỏng; nút **Tạm dừng** giữ cả chuyển động và đồng hồ bước. Chọn **Tách cầu** để kết thúc phục vụ, thu canopy, lùi, thu cầu và trở về vị trí đỗ. Tốc độ 0,5× / 1× / 2× áp dụng cho hoạt ảnh lẫn thời gian giải thích.

## Điều khiển thủ công

1. Bật nguồn và đánh dấu cả hai điều kiện tiếp cận.
2. Xoay cầu **38,27°**, cabin **−38,27°**, cao độ sàn **3,25 m**, tầm với ngang **18,07 m**. Chờ cầu dừng. Đây là preset A321 minh họa, không phải preset đã nghiệm thu Long Thành.
3. Thao tác bằng bàn điều khiển hiện có; các chức năng mô phỏng chưa được xác nhận không thay thế quy trình thiết bị thực tế.
4. Chọn **Kết thúc phục vụ**, **Thu lại** và chờ canopy về 0%.
5. Chọn **Lùi khỏi cửa**, chờ cabin lùi, sau đó **Về vị trí đỗ**.

Thanh trượt đặt mục tiêu; nút ± thay đổi từng nấc. Có thể dùng Tab để chọn, phím mũi tên điều chỉnh thanh trượt. Bật/tắt nhãn, chọn tổng thể / gần cabin / từ trên cao, kéo chuột để xoay, cuộn để thu phóng, chuột phải để dịch cảnh. Đặt lại camera chỉ đổi góc nhìn; Đặt lại bài học xóa toàn bộ trạng thái và phục hồi camera, tốc độ, nhãn.

## Liên động và giới hạn mô hình

- Cần nguồn và hai xác nhận trước di chuyển, kể cả về đỗ. Canopy chỉ triển khai khi cầu dừng và căn chỉnh đủ. Canopy đang triển khai khóa điều khiển cầu.
- AUTO LEVEL khóa move/jog/park; chỉ tự hiệu chỉnh cao độ. Sau kết thúc phục vụ, Autolevel ngừng và canopy được phép thu.
- Dừng khẩn cấp cắt nguồn và hủy lệnh. Nhả nút cần bật nguồn và phát lệnh mới. Lỗi cần loại bỏ nguyên nhân, xác nhận khôi phục và bật nguồn; không tự chạy lại.
- Bumper minh họa nhô 2,5 cm: mép sàn còn khe 2,5 cm, bumper chạm nhẹ mặt phẳng thân. Ngưỡng căn chỉnh là giả định. Vùng đỏ cảnh báo dưới 0,65 m; khe mép sàn nhỏ hơn 0,02 m bị chặn.
- Tích phân theo thời gian, có bước nhỏ kiểm tra collision; vật cản, nhà ga, mặt sân, cabin/tunnel/bánh và phong bì cánh/động cơ được kiểm tra bảo thủ. Đây không phải kiểm tra mesh hoặc cảm biến thật.
- Ba đoạn tunnel nối liên tục với rotunda/cabin; cột nâng theo dốc; bánh chạm sân. Kích thước, overlap, slope, tốc độ và động lực học còn giả định. Cabin ±65°, rotunda ±87,5°, sàn ±3° chưa có Specification List. Riêng lái bánh ±87,5° có trong hướng dẫn LTIA PDF 134.
- Tàu bay/cửa A321, canopy hai bên đồng bộ, sàn leveling và safety shoe tiếp tục minh họa; chưa xác nhận đầy đủ cấu hình. Cáp/ống và VDGS chưa có giao tiếp vận hành.
- Gió 97 km/h là Caution của nguồn về Autolevel; khóa toàn bài học là bảo vệ bổ sung. Không coi đó là giới hạn khai thác sân bay đã xác nhận.

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

- **Khóa TẮT / THỦ CÔNG / HƯỚNG DẪN** đồng bộ với nguồn và chế độ bài học. **POWER ON/OFF** cấp/ngắt nguồn mô phỏng.
- **Joystick**: kéo lên/xuống để tiến/lùi; kéo trái/phải để xoay cầu. Độ lệch cần quyết định tốc độ. Có thể focus joystick bằng Tab rồi giữ phím mũi tên; bốn nút hướng bên dưới cũng là nút giữ để chạy.
- **Thả chuột/phím, mất pointer capture, đổi cửa sổ, tạm dừng, ngắt nguồn hoặc dừng khẩn cấp** đều hủy lệnh giữ. Cầu không tự tiếp tục cho tới khi có lệnh mới.
- **TUNNEL UP/DOWN**, **CAB ROTATION** và **LEVEL FLOOR** là nút giữ để nâng/hạ, xoay cabin và nghiêng sàn. Phạm vi cabin ±65°, sàn ±3° chỉ là giá trị minh họa. Khi chuẩn bị kết nối, đưa sàn gần 0° và hướng cabin thẳng với cửa.
- **CANOPY** dùng hai nút thu/triển khai; không có cơ cấu rèm trái/phải độc lập trong mô hình.
- **PRESET START** chạy tiếp cận ở chế độ HƯỚNG DẪN; sau khi kết nối, nút này chuyển sang chu trình tách cầu.
- **Đèn trong / đèn ngoài** bật nguồn sáng tại cabin trong cả hai cảnh. **Thông gió** quay quạt 3D. **Điều hòa** thay đổi nhiệt độ minh họa về 22 °C; đây không phải mô hình nhiệt động lực học.
- **EMRG. STOP** dừng mọi trục cầu; **RESET** giải chốt khẩn cấp, không tự phục hồi lệnh cũ.

CCTV dùng camera 3D gắn cố định trong cabin, cùng dữ liệu hình học và trạng thái với cảnh tổng thể. Camera đi theo góc cầu, độ cao và góc xoay cabin, nhìn hơi chếch xuống để quan sát cửa và mép sàn. Không tự bám cửa, không dùng webcam, không xin quyền truy cập camera thật. Màn hình mất hình khi ngắt nguồn; dừng khẩn cấp cắt nguồn mô phỏng và CCTV chuyển về màn hình tắt. Dấu ngắm chỉ là mốc cố định trên hình, không phải nhận dạng cửa bằng cảm biến.

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


## Bảo vệ tài liệu nội bộ khi phát hành

Thư mục docs được lưu trong repo private. Lệnh build và build:vercel kiểm tra thư mục public và đầu ra bằng scripts/check-public-docs.mjs, dừng phát hành nếu phát hiện tài liệu, tên file hoặc trích dẫn nguồn nội bộ. Không bật source map công khai. Các quy tắc .vercelignore loại docs khỏi gói tải lên CLI; build từ Git chỉ phát hành thư mục đầu ra đã kiểm tra.

