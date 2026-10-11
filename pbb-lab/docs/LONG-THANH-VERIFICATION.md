**NỘI BỘ — không công khai hoặc đưa vào gói triển khai.**

# Báo cáo hiệu chỉnh PBB Lab — 11/10/2026

## 1. Thay đổi đã thực hiện

Ứng dụng hiện có được sửa trực tiếp, giữ React 19, Three.js, React Three Fiber, Drei, joystick giữ để chạy, CCTV, camera, giao diện giới thiệu và hai chu trình tiếp cận/tách cầu. Không thay framework hoặc dependency.

- Tập trung giới hạn, tốc độ, hình học, căn chỉnh và Autolevel tại lib/technicalConfig.ts. Thông tin đối chiếu chỉ lưu nội bộ trong docs. Bảng nguồn và PDF đã được gỡ khỏi giao diện và thư mục phục vụ web.
- Tính hình học chung trong geometry(): mét, +Y lên, +X theo hướng cầu khi đỗ, +Z dọc sân đỗ. length là tầm với **ngang** từ tâm rotunda đến khớp cabin; chiều dài nghiêng là hypot(length, cabinHeight − rotundaHeight).
- Bỏ dịch tunnel A 0,6 m gây hở khớp tại rotunda. Ba đoạn dài 10 m, tâm đoạn đầu tại 5 m; tâm cuối bảo đảm mép tunnel đến khớp cabin. Theo dõi phần chồng lồng và chặn miền hình học không hợp lệ.
- Cụm bánh xe nằm lùi 1,9 m so với khớp cabin. Cao độ liên kết cột nâng được nội suy theo độ dốc tunnel; chân bánh luôn tại mặt sân. Hai cột gắn với cụm di chuyển; mô hình vít me bi là nguyên lý nguồn, chưa dựng ren hoặc động cơ chi tiết.
- Lái được suy ra từ chuyển động tiến/lùi và quay cầu, hiển thị chặn ±87,5° theo góc lái trong hồ sơ. Quãng đường tích lũy làm lốp và dấu trên moay-ơ quay; chưa giải phương trình động lực học hai motor hoặc trượt lốp.
- Bumper nhô giả định 2,5 cm để minh họa tiếp xúc nhẹ khi **mép sàn** còn cách mặt phẳng thân 2,5 cm; không coi 2,5 cm là khoảng cách bumper–thân được nhà sản xuất quy định.
- Autolevel có tay/bánh cảm biến minh họa, tự hiệu chỉnh cao độ khi tàu bay thay đổi; khóa lệnh điều khiển cầu. Canopy trong hướng dẫn triển khai sau khi bật Autolevel. Hình tàu bay nâng/hạ phần thân; bánh đáp giữ mặt sân, trụ đáp thay đổi chiều dài minh họa.
- Tích phân theo thời gian với bước tối đa 1/120 s; không cắt mất thời gian của khung hình chậm như giới hạn dt 0,05 s cũ. Chuyển động gần cửa giảm tốc theo giả định.
- Thêm vật cản người/xe có vị trí trong 3D; kiểm tra các thể tích cabin, tunnel, bánh/cột nâng, nhà ga, mặt sân và vùng cánh/động cơ bảo thủ. Khe cabin–thân và góc cạnh cabin vẫn dùng mặt phẳng an toàn. Chặn trước tư thế không an toàn; lỗi hủy mục tiêu và tắt nguồn.
- Thêm lỗi Autolevel, mất điện, Safety hoop, cảnh báo gió, phụ trợ chưa thu và khôi phục có khóa. E-stop cắt nguồn và hủy lệnh; nhả nút không bật nguồn, không tiếp tục lệnh hoặc tự bật Autolevel.
- Bảng kiểm chứng và tình huống huấn luyện đã được gỡ khỏi giao diện. Camera bên hông và CCTV cabin được giữ.

## 2. Thông số và nguồn

Số trang là **trang PDF**, không phải chỉ số trang in. Hồ sơ LTIA chứa hướng dẫn S800106–A, ngày 31/Oct/2025. PBB.pdf là bản hướng dẫn tiếng Việt tham khảo; ưu tiên bản tiếng Anh LTIA khi đối chiếu cơ chế. Báo cáo thử việc cung cấp bối cảnh, không thay thế đặc tính thiết bị.

| Hạng mục | Giá trị/đặc điểm | Đơn vị | Model/cấu hình áp dụng | Nguồn và trang | Mức xác nhận |
| --- | --- | --- | --- | --- | --- |
| Dừng khẩn cấp | Dừng cầu và cắt nguồn; nhả nút để khôi phục | — | S800106–A | LTIA-5.10-PMU-43200-ABE-OTH-0660A, gói thầu hệ thống PBB nhà ga T1.pdf — PDF 24 | Xác nhận trong hồ sơ; lệnh cũ bị hủy là bảo vệ mô phỏng |
| Cột nâng | Hai cột, vít me bi; cùng nâng tunnel và cabin | — | S800106–A / hồ sơ LTIA | LTIA-5.10-PMU-43200-ABE-OTH-0660A, gói thầu hệ thống PBB nhà ga T1.pdf — PDF 133 | Xác nhận nguyên lý; kích thước chưa có |
| Giới hạn lái bánh xe | ±87,5 | ° | S800106–A | LTIA-5.10-PMU-43200-ABE-OTH-0660A, gói thầu hệ thống PBB nhà ga T1.pdf — PDF 134 | Xác nhận trong hồ sơ; không phải giới hạn rotunda |
| Bumper | Tiếp xúc nhẹ ở tốc độ tối thiểu | — | S800106–A | LTIA-5.10-PMU-43200-ABE-OTH-0660A, gói thầu hệ thống PBB nhà ga T1.pdf — PDF 41 | Xác nhận nguyên tắc; lực và độ nén chưa có |
| Autolevel | Bánh cảm biến tì thân tàu; duy trì chênh cao ban đầu | — | S800106–A | LTIA-5.10-PMU-43200-ABE-OTH-0660A, gói thầu hệ thống PBB nhà ga T1.pdf — PDF 138 | Xác nhận nguyên lý |
| Khóa điều khiển khi Auto level | Khóa nâng, tiến/lùi, xoay cabin, chỉnh sàn, preset | — | S800106–A | LTIA-5.10-PMU-43200-ABE-OTH-0660A, gói thầu hệ thống PBB nhà ga T1.pdf — PDF 42 | Xác nhận trong hồ sơ |
| Canopy trước di chuyển | Thu hoàn toàn hai bên | — | S800106–A | PBB.pdf — PDF 39 | Xác nhận thông báo 51 |
| Cơ cấu canopy | Hai bên truyền động độc lập; tự dừng theo tiếp xúc | — | S800106–A | LTIA-5.10-PMU-43200-ABE-OTH-0660A, gói thầu hệ thống PBB nhà ga T1.pdf — PDF 136 | Xác nhận nguyên lý; ứng dụng hiện đồng bộ hóa để minh họa |
| Safety hoop | Cảm biến phía trước/sau bánh; có quán tính dừng | — | S800106–A | LTIA-5.10-PMU-43200-ABE-OTH-0660A, gói thầu hệ thống PBB nhà ga T1.pdf — PDF 49 | Xác nhận nguyên lý; mô phỏng dừng ngay là bảo vệ bổ sung |
| Anti-cutting | Cảm biến quang tại phần tunnel chồng lồng | — | S800106–A | LTIA-5.10-PMU-43200-ABE-OTH-0660A, gói thầu hệ thống PBB nhà ga T1.pdf — PDF 50 | Xác nhận trong hồ sơ; chưa mô phỏng riêng cảm biến quang |
| Gió / Autolevel | 97 | km/h | S800106–A | LTIA-5.10-PMU-43200-ABE-OTH-0660A, gói thầu hệ thống PBB nhà ga T1.pdf — PDF 42 | Caution theo tài liệu; chưa có giới hạn khai thác sân bay |
| Chênh sàn trước căn chỉnh | 20–25 cm cửa mở ra ngoài; 5–10 cm mở vào trong | cm | Phân loại cửa trong hướng dẫn | PBB.pdf — PDF 25 | Phụ thuộc sân bay và độ dốc; không áp dụng chung A321 |
| Cao độ, rotunda, cabin, tầm với | 2–5,4 m; ±87,5°; ±65°; 12–28 m | m / ° | Cấu hình bài học hiện có | Không có nguồn số | Giả định mô phỏng; thiếu Specification List |
| Tốc độ | 8°/s; 1,3 m/s; nâng 0,35 m/s; tiếp cận 0,08 m/s | m/s / °/s | Bài học | Không có nguồn số | Giả định mô phỏng |
| Hình học | 3 tunnel × 10 m; chồng ≥0,8 m; dốc ≤12° | m / ° | Bài học | Không có nguồn số | Giả định mô phỏng |
| Bumper và căn chỉnh | Nhô 2,5 cm; mép sàn cách thân 2–3,5 cm; lệch ngang <5 cm | cm | Bài học | Không có nguồn số | Giả định mô phỏng; khe sàn không phải khe bumper |
| Tàu bay | Một mô hình minh họa A321, cửa L1 cao 3,4 m; chênh sàn 15 cm | m | Minh họa, chưa đối chiếu Airbus ACAP | Không có nguồn số | Giả định mô phỏng; không dùng cho A320 |
| Autolevel mô phỏng | 0,08 m/s; deadband 2 mm; lỗi >18 cm; dịch tàu ±30 cm | m / m/s | Bài học | Không có nguồn số | Giả định mô phỏng |
| PAXWAY brochure | Tham khảo hình dáng; không lấy giới hạn theo model | — | Dòng sản phẩm PAXWAY | PAXWAY2024_EN.pdf — PDF 3 | Tham khảo sản phẩm, chưa xác nhận model lắp đặt |
| Bối cảnh khai thác | Quan sát khu vực, căn cabin, theo dõi khi phục vụ | — | Báo cáo thử việc, không phải đặc tính thiết bị | Nguyễn Hữu Hoàng Kiệt_Báo cáo thử việc_Nhân viên vận hành TTB kỹ thuật_TTĐHSB.pdf — PDF 97 | Nguồn bối cảnh, ưu tiên hướng dẫn nhà sản xuất |

PAXWAY2024_EN.pdf là brochure quét hình ảnh, đã xem các trang sản phẩm/công nghệ và tùy chọn. PDF 4 nêu cấu hình A380 có hành trình 4,3–8,2 m: **không áp dụng** cho cầu minh họa này. PDF 5 nêu hệ thống docking hoàn toàn tự động là tùy chọn: **không coi chế độ Hướng dẫn của ứng dụng là hệ thống này**. PDF 8 nêu nhiều phụ trợ/tùy chọn: chưa xác nhận đủ cấu hình lắp đặt Long Thành nên không kích hoạt chức năng thiết bị thật từ brochure.

## 3. Giả định còn dùng và giới hạn

Các giá trị số không được bảng đánh dấu xác nhận đều là **Giả định mô phỏng**, sửa tại lib/technicalConfig.ts. Không gán ±87,5° của **wheel steering** sang rotunda; giới hạn rotunda ±87,5° hiện giữ từ bài học cũ và vẫn là giả định.

- Cấu hình ba tunnel 10 m, bề rộng/vỏ cầu, offset cabin 1,785 m, offset bánh 1,9 m, sàn rotunda 3 m, độ dốc tối đa 12°, overlap tối thiểu 0,8 m và dừng tức thì chưa phải số đo thiết bị. Cầu thang, lan can, nhãn, hệ phụ trợ và bố trí sân đỗ tiếp tục là minh họa.
- Tốc độ mục tiêu, jog, tốc độ 0,08 m/s gần cửa và điều chỉnh Autolevel, deadband 2 mm, ngưỡng lỗi 18 cm, dịch tàu ±30 cm đều là giả định.
- Một A321 minh họa với cửa L1 cố định; chưa có lựa chọn A320 hoặc preset chia sẻ vị trí cửa. Hình thân/cánh/cửa và chuyển động mở cửa hiện có chưa đối chiếu tài liệu Airbus, không dùng để huấn luyện trình tự mở cửa thật.
- Chênh sàn 15 cm giữ từ bài học cũ, không khẳng định là yêu cầu Long Thành. Tài liệu phân biệt 20–25 cm/5–10 cm trước căn sàn và nói phụ thuộc điều kiện sân bay. Cơ cấu sàn nghiêng ±3° đang minh họa tùy chọn chưa xác nhận theo model.
- Canopy hai bên trong nguồn là độc lập; ứng dụng đồng bộ hai bên, chưa mô phỏng lực tiếp xúc hoặc công tắc độc lập. Bumper và thân dùng mặt phẳng bảo thủ, không tính đàn hồi hay lực ép. Safety shoe có hình minh họa, chưa mô phỏng riêng hành vi hạ khẩn của nó.
- Kiểm tra va chạm dùng hộp định hướng/các lát tunnel và phong bì cánh/động cơ, không phải giao cắt mesh chính xác. Chưa có vùng cửa mở, sensor anti-cutting độc lập, va chạm PBB L1/L2 hoặc ràng buộc dây/ống mềm. Cáp GPU/PCA/PWS giữ dạng thu gọn; tình huống chưa thu là tín hiệu huấn luyện, không mô phỏng giao tiếp IASS.
- Cảnh báo gió 97 km/h là Caution về khả năng theo dõi Autolevel trong tài liệu, **không phải** giới hạn vận hành/đóng sân đỗ đã xác nhận. Khóa toàn mô hình khi tiêm tình huống gió là bảo vệ bổ sung mô phỏng.
- Dừng trước va chạm và dừng ngay Safety hoop là bảo vệ bổ sung. Nguồn LTIA PDF 49 mô tả quán tính và khoảng dừng phụ thuộc sân/lốp (khoảng 150 mm hoặc nhỏ hơn); không dùng số này làm khoảng dừng cố định trong mô phỏng.
- Không mô phỏng tải trọng, phanh, lực, truyền động hai motor, trượt bánh, nguồn điện dự phòng, tiếng còi thật hoặc logic PLC. Chiều lái hiển thị ở giới hạn ±87,5° chưa giải mô hình điều khiển motor tương ứng cho chuyển động thuần ngang.
- Nhật ký nằm trong phiên và có giới hạn 80 mục; không phải log thiết bị có chứng nhận. Phân loại nguy hiểm không tự gán như nguồn: bảng huấn luyện ghi rõ cảnh báo mô phỏng, riêng gió giữ Caution được tài liệu xác nhận.

## 4. Mô hình trạng thái và thao tác

Đây là trạng thái **suy ra của phần mềm**, không khẳng định là tên chế độ trên thiết bị. Các guard trong command()/tick() thực thi khóa chung; không có nút bỏ qua liên động. Các xác nhận tự đặt trong Hướng dẫn chỉ phục vụ bài học, không thay kiểm tra sân đỗ thật.

| Trạng thái | Thao tác/điều kiện | Khóa |
| --- | --- | --- |
| Đỗ an toàn | Cầu đúng PARK, canopy thu, nguồn tắt; kiểm tra và bật nguồn | Chuyển động khi chưa có nguồn/xác nhận |
| Kiểm tra trước vận hành | Quan sát vùng và xác nhận tàu bay; bước 0–1 bài học | Di chuyển khi thiếu một xác nhận |
| Sẵn sàng | Nguồn và hai xác nhận đủ; cầu ở đỗ | Canopy khi chưa căn chỉnh |
| Tiếp cận | Manual move/jog hoặc Hướng dẫn; kiểm tra va chạm/giới hạn mỗi bước | Canopy khi cầu đang chạy; mọi chuyển động nếu canopy chưa thu |
| Sẵn sàng kết nối | Dừng, phù hợp cửa/cao độ/góc theo ngưỡng giả định | Autolevel/canopy khi lệch |
| Kết nối | Bật Autolevel; triển khai canopy; đạt 100% và căn chỉnh để mở luồng khách minh họa | Lệnh move/jog/park trong Autolevel hoặc canopy triển khai |
| Phục vụ/Autolevel | Theo dõi dịch cao độ; duy trì chênh ban đầu; operator tiếp tục quan sát | Điều khiển cầu và preset khi Auto level; lỗi theo dõi khóa nguồn |
| Chuẩn bị tách | Kết thúc phục vụ sau kết nối; đóng cửa/luồng khách minh họa; ngừng Autolevel và thu canopy | Thu canopy trước kết thúc phục vụ; di chuyển khi canopy còn >0 |
| Tách cầu | Canopy thu hết, nguồn và xác nhận còn đủ; thu cầu khỏi cửa | Va chạm hoặc giới hạn |
| Trở về đỗ | Thu trước, rồi quay/hạ về PARK; hình học liên tục | Thu làm dốc vượt ngưỡng: cần giảm chênh cao |
| Lỗi/dừng khẩn | Hủy mục tiêu, dừng, cắt nguồn, ngừng Autolevel | Lệnh điều khiển và tự khởi động lại |

Phản ứng và khôi phục **mô phỏng**: tắt tình huống/thu hồi vật cản, xác nhận khôi phục, bật nguồn, phát lệnh mới. Khi tiếp xúc hình học còn tồn tại, khôi phục bị chặn. Quy trình thực tế khác theo lỗi: Autolevel xem LTIA PDF 43 và 52; mất điện khi Autolevel xem PDF 53; E-stop xem PDF 24/51. Không đưa quy trình kéo cầu, nhả phanh hoặc bypass nguồn vào thao tác thông thường. Khóa đèn/quạt và dừng hoạt ảnh cửa khi nguồn bị cắt là cách tổ chức minh họa, chưa khẳng định sơ đồ nguồn phụ trợ thật.

## 5. Kiểm chứng

- Bộ kiểm tra hành vi hiện có: tiếp cận/tách, canopy, joystick, CCTV/camera, quyền tiếp cận, giới hạn mục tiêu/jog và E-stop tiếp tục chạy qua; sửa kỳ vọng để yêu cầu bật nguồn sau reset E-stop.
- scripts/test-training.mjs: 38 kiểm tra mới qua, gồm 297 tư thế hình học (33 mức chiều dài × 3 cao độ × 3 góc), endpoint/chồng tunnel, chân bánh mặt sân, cao độ cột nâng, góc dốc, vùng nhà ga, vật cản người ở 15 FPS, Autolevel, lỗi và không tiếp tục lệnh cũ.
- Tích phân cùng lệnh một giây tại 15/30/60/144 FPS cho chiều dài 13,3 m, sai khác <1e-9 m.
- TypeScript: pnpm typecheck qua khi chạy với quyền đọc đầy đủ các junction thư viện pnpm. Các lỗi kiểu thư viện trong sandbox không tái hiện ở kiểm tra này.
- Build chính Vinext (node scripts/run-framework.mjs build) và build tĩnh Vite --config vite.vercel.config.ts đều qua khi quyền đọc thư viện đầy đủ; còn cảnh báo chunk Three.js >500 kB. Không deploy.
- Kiểm tra Chrome cục bộ: giao diện 3D tải, chu trình tiếp cận đạt canopy 100%, trạng thái Phục vụ/Autolevel, thay đổi cao độ tàu 5 cm có phản ứng. Có cảnh báo React về unmount trong lúc HMR thay mã. Trên bản build chạy riêng (cổng 5176), chu trình tiếp cận → Phục vụ/Autolevel → tách → Đỗ an toàn hoàn tất; console error rỗng. Thử lỗi Autolevel chặn khôi phục khi nguyên nhân còn bật.

Các kiểm tra xác nhận tính nhất quán toán học/hành vi của **cấu hình mô phỏng**, không chứng minh số đo cơ khí, năng lực dừng hoặc chứng nhận an toàn của thiết bị.

## 6. Dữ liệu còn thiếu

1. Boarding Bridge Specification List theo từng model/serial/sân đỗ: kích thước min–max, hành trình cột, quay rotunda/cabin, slope, tốc độ và dải gió cho từng trạng thái.
2. Bản vẽ bố trí/as-built PBB, cấu hình L1/L2, rotunda, ba tunnel, chiều dài/overlap tối thiểu, cột nâng và axle/wheel; mốc tọa độ sân đỗ.
3. Bảng preset cửa theo loại/biến thể Airbus/Boeing và tài liệu ACAP: vị trí L1/L2, cao độ theo tải, vùng cửa mở và phần nhô.
4. PLC/interlock cause-and-effect, threshold Autolevel/safety shoe/cab-touch/closure-touch, timing/phanh và quy trình phục hồi được phê duyệt.
5. Xác nhận loại canopy, sàn leveling, camera và phụ trợ lắp đặt; giao tiếp PCA/GPU/PWS/VDGS/IASS nếu cần mô phỏng hoạt động thật.

Mức đạt được: minh họa cơ khí và trình tự có đối chiếu nguyên lý trong tài liệu LTIA, minh bạch dữ liệu thiếu. Chưa đủ căn cứ gọi mô hình là bản sao chính xác của PBB Long Thành.

