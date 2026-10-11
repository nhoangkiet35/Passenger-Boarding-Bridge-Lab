# Báo cáo quản lý cầu hành khách và phối hợp dịch vụ

**NỘI BỘ — đề xuất quản lý để đối chiếu với tài liệu khai thác của đơn vị.**

## Cấu hình phải quản lý theo từng cầu

Một quy trình chỉ hữu ích khi gắn đúng model và vị trí lắp đặt. Hồ sơ nên có mã cầu, hãng/model, số chế tạo, hành trình, cao độ, giới hạn độ dốc, góc, tốc độ, tải, giới hạn gió, cấu hình neo, vùng đỗ và vùng chuyển động. Mỗi giá trị cần phiên bản tài liệu và người xác nhận. Không lấy một brochure của dòng sản phẩm để xác nhận cấu hình thực tế.

Điều 24 khoản 14 quy định tài liệu kỹ thuật phục vụ quản lý, kiểm tra và giám sát gồm thông số, hướng dẫn sử dụng/bảo trì, lý lịch và hồ sơ cải tạo hoặc thay đổi kiểu loại. Khoản 15 yêu cầu bảo dưỡng theo tài liệu hướng dẫn kỹ thuật. Điều 32 khoản 4 yêu cầu quy trình khai thác phù hợp giới hạn thiết kế trong gió mạnh. Các yêu cầu này cần được thể hiện trong hồ sơ thiết bị và hướng dẫn công việc.

## Phân công và điểm phối hợp — đề xuất nội bộ

| Đầu mối | Nội dung cần thống nhất |
|---|---|
| Người vận hành cầu | Kiểm tra trước phục vụ, điều khiển đúng nhiệm vụ, trực tại cầu, thông báo bất thường |
| Điều phối khai thác | Vị trí đỗ, chuyến/loại tàu bay, thay đổi kế hoạch, phương án thay thế |
| Hãng/đơn vị phục vụ tàu bay | Cửa sử dụng, khoảng cách theo tài liệu hãng, tín hiệu cho phép, tình trạng khách |
| Dịch vụ GPU/PCA/nước | Trạng thái kết nối, điều kiện thu hồi, tuyến cáp/ống, khả năng tiếp tục dịch vụ khi cầu lỗi |
| Kỹ thuật | Đánh giá lỗi, sửa chữa theo phạm vi cho phép, xác nhận tình trạng thiết bị |
| Người khai thác cảng | Vùng an toàn, bộ đàm, dự báo thời tiết, phương án bất thường và điều phối xử lý |

Đây là bảng phân công để thảo luận, không tự gán thẩm quyền pháp lý mới. Danh xưng và trách nhiệm chính thức phải theo tổ chức của đơn vị.

Điều 32 khoản 9 đặt dịch vụ kỹ thuật đồng bộ cùng cầu và yêu cầu thỏa thuận hãng–doanh nghiệp dịch vụ khi cầu có sự cố. Thỏa thuận nên làm rõ ai quyết định phương án, ai kiểm tra điều kiện an toàn, cách thông báo và kiểm soát cáp/ống khi chuyển phương án. Không mặc định mọi dịch vụ phụ trợ đều phải tiếp tục hoặc đều phải ngắt trong mọi loại lỗi.

## Tiêu chí bàn giao và đưa lại vào sử dụng

Điều 24 khoản 12–13 nêu các trường hợp dừng và điều kiện hoạt động trở lại đối với phương tiện thuộc phạm vi quy định. Khi vận dụng cho hồ sơ cầu, cần kiểm tra đúng phạm vi thiết bị và quy trình đơn vị; không coi việc xóa cảnh báo trên màn hình là đã xác định nguyên nhân và hoàn thành khắc phục.

**Đề xuất nội bộ:** bàn giao sau bảo trì ghi lỗi ban đầu, hạng mục đã làm, người thực hiện, tài liệu áp dụng, kết quả kiểm tra chức năng cần thiết và xác nhận của đầu mối được phân công. Chưa có xác nhận thì ghi “chờ xác nhận”, không ghi “đã hoàn thành” để thuận tiện điều phối.

## Theo dõi chất lượng khai thác

**Đề xuất nội bộ:** tổng hợp số lượt phục vụ, thời gian không sẵn sàng, lỗi lặp lại, số lần dừng do gió, bất thường tự cân bằng, sự cố phụ trợ và các kiến nghị còn mở. Tách thời gian chờ tàu bay/khách khỏi thời gian do cầu hỏng để không quy trách nhiệm sai.

Chỉ tính tỷ lệ khi có mẫu số rõ ràng và dữ liệu đã kiểm tra: ví dụ số lượt bị gián đoạn do lỗi cầu chia tổng lượt phục vụ trong kỳ. Không đặt mức mục tiêu hoặc giới hạn chấp nhận khi chưa được đơn vị phê duyệt. Báo cáo xu hướng cần giải thích nguyên nhân đã xác nhận và phần còn đang điều tra.

## Quản lý tài liệu nội bộ

Các báo cáo nhân sự, hồ sơ gói thầu và ghi nhận sự cố được lưu tại máy hoặc repo GitHub private có quyền truy cập phù hợp. Tên file, đường dẫn và trích dẫn nguồn nội bộ cũng không được xuất hiện trên website. Bộ báo cáo trong `docs` không được liên kết từ website, sao chép vào `public` hoặc đưa vào gói triển khai. Không trích nội dung báo cáo nhân sự lên giao diện công khai.

Tài liệu được phép lưu trong repo GitHub private. Cấu hình loại trừ khỏi Vercel và kiểm tra đầu ra giúp tránh đưa tài liệu lên website, nhưng không thay thế kiểm soát truy cập hay xóa dữ liệu đã từng được tải lên nơi khác. Mọi chia sẻ ra ngoài cần được xử lý theo quyền và quy định của đơn vị; lần chỉnh sửa này chỉ xử lý bản dự án tại máy.
