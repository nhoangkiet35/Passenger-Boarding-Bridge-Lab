# PBB Lab — Mô phỏng cầu ống lồng hành khách 3D

**PBB Lab** là website tương tác bằng tiếng Việt giúp tìm hiểu cấu tạo, nguyên lý chuyển động và trình tự tiếp cận/tách **Passenger Boarding Bridge (PBB)** khỏi tàu bay tại sân đỗ.

Dự án phục vụ học tập và thuyết trình. Đây **không phải phần mềm điều khiển thiết bị thật hoặc quy trình vận hành chính thức của sân bay**. Mô hình và các ngưỡng liên động chỉ mang tính minh họa.

## Tính năng

- Cảnh 3D gồm nhà ga, sân đỗ, tàu bay, rotunda, các đoạn ống lồng, cabin, canopy và cụm bánh xe.
- Xoay, nâng/hạ, kéo dài/thu cầu với hoạt ảnh và giới hạn hành trình.
- Điều khiển thủ công và hướng dẫn tự động cho cả tiếp cận lẫn tách cầu.
- Liên động xác nhận tàu bay, khóa di chuyển khi canopy chưa thu và dừng khẩn cấp.
- Camera xoay/thu phóng, góc tổng thể/gần cabin/từ trên cao, bật/tắt nhãn bộ phận.
- Tạm dừng, thay đổi tốc độ, đặt lại bài học; giao diện responsive, ưu tiên máy tính.

Mô hình được dựng bằng hình khối trong mã nguồn; không cần mô hình 3D trả phí.

## Công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Giao diện | React 19, TypeScript |
| Đồ họa 3D | Three.js, React Three Fiber, Drei |
| Điều khiển giao diện | Radix UI, Tailwind CSS, Lucide |
| Phát triển và build | Vinext, Vite |
| Chạy bản build trên máy | Wrangler local |
| Quản lý gói | pnpm 11.19.0 và `pnpm-lock.yaml` |

## Yêu cầu máy tính

- **Node.js 24** (khuyến nghị cho toàn bộ lệnh chạy và kiểm tra). Khai báo trong `package.json` yêu cầu tối thiểu Node.js 22.13.0.
- **pnpm 11.19.0**.
- Trình duyệt hỗ trợ WebGL, bật tăng tốc phần cứng nếu cảnh 3D không xuất hiện.
- Kết nối Internet cho lần tải thư viện đầu tiên.

Không cần khóa API, cơ sở dữ liệu, tài khoản Cloudflare hay plugin Codex để chạy mô phỏng cục bộ. Cấu hình đã được chạy thử trên Windows x64; chưa kiểm tra đầy đủ trên mọi hệ điều hành/GPU.

## Cài đặt và chạy

### 1. Chuẩn bị công cụ

Cài Node.js, mở Terminal hoặc PowerShell, rồi kiểm tra:

```sh
node --version
npm --version
```

Cài đúng phiên bản pnpm được khai báo trong dự án:

```sh
npm install --global pnpm@11.19.0
pnpm --version
```

### 2. Mở thư mục ứng dụng và cài thư viện

Tải/clone mã nguồn hoặc giải nén dự án. Từ thư mục chứa README này, chạy:

```sh
cd pbb-lab
pnpm install --frozen-lockfile --ignore-scripts
```

Nếu terminal đã ở thư mục `pbb-lab` có `package.json`, bỏ qua lệnh `cd`.

`--frozen-lockfile` giữ đúng các phiên bản đã khóa. `--ignore-scripts` bỏ qua lifecycle script của dependency; cấu hình này đã được kiểm tra cài đặt và build trên Windows x64. Không dùng lẫn npm/yarn để cài dependency của cùng bản checkout.

### 3. Khởi động website

```sh
pnpm dev
```

Mở [http://localhost:5173](http://localhost:5173). Nếu terminal in địa chỉ khác, dùng địa chỉ đó. Giữ terminal đang chạy; nhấn **Ctrl+C** để dừng máy chủ.

Đổi cổng khi cần:

```sh
pnpm dev --port 3000
```

Không mở trực tiếp file `.tsx` từ ổ đĩa; website cần được phục vụ qua máy chủ cục bộ.

## Tạo và chạy bản production

Thực hiện trong thư mục `pbb-lab`:

```sh
pnpm build
pnpm start
```

Mở địa chỉ do Wrangler in trong terminal. `pnpm start` phục vụ bản build bằng môi trường Cloudflare mô phỏng trên máy; lệnh này không tự xuất bản lên Internet. Chạy lại `pnpm build` sau khi thay đổi mã nguồn trước khi thử bản production.

## Kiểm tra dự án

```sh
pnpm test
pnpm typecheck
```

- `pnpm test`: kiểm tra hành vi của hai chu trình và các liên động, gồm dừng khẩn cấp, canopy, quyền tiếp cận, tạm dừng và giới hạn hành trình.
- `pnpm typecheck`: kiểm tra TypeScript mà không tạo file JavaScript.
- `pnpm build`: kiểm tra khả năng tạo bản production.

Chi tiết lần kiểm tra ứng dụng được ghi trong [TESTING.md](pbb-lab/TESTING.md).

## Sử dụng nhanh

### Chế độ hướng dẫn

1. Chọn **Chế độ hướng dẫn → Tiếp cận**.
2. Quan sát kiểm tra khu vực, xác nhận tàu bay, tiếp cận, căn chỉnh và triển khai canopy.
3. Dùng **Tạm dừng/Tiếp tục** để đọc giải thích, hoặc đổi tốc độ 0,5× / 1× / 2×.
4. Khi đã kết nối, chọn **Tách cầu** để kết thúc phục vụ, thu canopy, lùi cabin và đưa cầu về đỗ.

### Chế độ thủ công

1. Bật **Nguồn mô phỏng** và xác nhận cả hai điều kiện tiếp cận.
2. Đặt góc xoay **0°**, cao độ sàn **3,40 m**, chiều dài **15,60 m**; chờ chuyển động hoàn tất.
3. Chọn **Triển khai** canopy để kết nối.
4. Khi tách cầu: **Kết thúc phục vụ → Thu lại**, chờ canopy về **0%**, rồi **Lùi khỏi cửa → Về vị trí đỗ**.

Ô nhập mục tiêu nhận lệnh khi nhấn Enter hoặc rời ô. Kéo chuột để xoay cảnh, cuộn để thu phóng và dùng chuột phải để dịch chuyển. Sau dừng khẩn cấp, cần **Đặt lại dừng khẩn cấp** rồi phát lệnh mới.

Các ngưỡng minh họa và giản lược cơ khí được giải thích trong website và [hướng dẫn chi tiết](pbb-lab/README.md).

## Cấu trúc mã nguồn

```text
.
├── README.md                 # Giới thiệu và hướng dẫn khởi động
├── .gitignore                # Quy tắc bỏ qua file trên toàn repository
└── pbb-lab/
    ├── app/                  # Trang chính, metadata, giao diện responsive
    ├── components/pbb/
    │   ├── Scene.tsx         # Cảnh 3D, ánh sáng và camera
    │   ├── Models.tsx        # Hình học PBB và máy bay
    │   ├── Controls.tsx      # Bảng điều khiển
    │   ├── Guide.tsx         # Quy trình và giải thích thuật ngữ
    │   └── Lab.tsx           # Điều phối ứng dụng và vòng hoạt ảnh
    ├── lib/simulation.ts     # Trạng thái, chuyển động và liên động
    ├── scripts/              # Lệnh chạy, build và kiểm tra
    ├── build/                # Mã nguồn plugin Vite; cần đưa vào Git
    ├── public/               # Tài nguyên tĩnh
    ├── package.json
    └── pnpm-lock.yaml        # Khóa phiên bản dependency; cần đưa vào Git
```

## Khắc phục lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| Không nhận lệnh `node`, `npm` hoặc `pnpm` | Cài công cụ tương ứng, đóng và mở lại terminal để cập nhật PATH. |
| Báo không tìm thấy `package.json` | Chuyển vào thư mục `pbb-lab` trước khi chạy lệnh. |
| PowerShell chặn script `pnpm.ps1` | Dùng `pnpm.cmd` thay cho `pnpm`, ví dụ `pnpm.cmd dev`; không cần đổi Execution Policy. |
| Cổng đang được sử dụng | Chạy `pnpm dev --port 3000` hoặc chọn một cổng trống khác. |
| Thiếu thư viện hoặc cài đặt bị ngắt | Kiểm tra mạng và chạy lại lệnh cài đặt ở trên. |
| Lockfile không khớp `package.json` | Kiểm tra hai file thuộc cùng phiên bản mã nguồn. Chỉ chạy `pnpm install --ignore-scripts` để cập nhật lockfile khi bạn chủ động thay dependency. |
| Cảnh 3D trống hoặc mất WebGL | Bật tăng tốc đồ họa, cập nhật trình duyệt/driver đồ họa và tải lại trang. |
| Thao tác di chuyển bị chặn | Đọc thông báo: kiểm tra nguồn, hai xác nhận tiếp cận, trạng thái canopy và dừng khẩn cấp. |
| `pnpm start` thiếu file trong `dist` | Chạy `pnpm build` thành công trước. |

## Quy ước Git

`.gitignore` bỏ qua thư viện đã cài, bộ nhớ đệm, bản build, log, dữ liệu runtime, file môi trường và gói ZIP sinh cục bộ. Mã nguồn trong `build/`, cấu hình `.openai/hosting.json`, `package.json` và `pnpm-lock.yaml` vẫn được theo dõi. File môi trường mẫu như `.env.example` được phép đưa vào Git.

Quy tắc ignore chỉ áp dụng cho file chưa được Git theo dõi; không tự xóa file đã commit khỏi lịch sử.
