export type ProcedureStep = { action: string; acceptance: string };
export type EquipmentProcedure = { title: string; steps: ProcedureStep[]; stop: string; completion: string };
export type ProcedureSet = { source: string; dailyScope: string; procedures: EquipmentProcedure[] };
export const equipmentProcedures: Record<string, ProcedureSet> = {
  "pbb": {
    "source": "IV.1.4, 2.5–2.9, 9–10 · trang in 82–85, 104–109, 142–145",
    "dailyScope": "Danh mục đầu ngày/đầu ca được tổng hợp từ kiểm tra trước khai thác. Thử chức năng chỉ trong phạm vi được phân công, theo phiếu kiểm tra đúng model.",
    "procedures": [
      {
        "title": "Tiếp cận vào tàu bay",
        "steps": [
          {
            "action": "Nhận nhiệm vụ; xác định chuyến bay, vị trí đỗ, cầu, loại tàu bay và cửa phục vụ.",
            "acceptance": "Thông tin khớp kế hoạch và xác nhận điều hành; cửa phục vụ đúng phương án."
          },
          {
            "action": "Kiểm tra vị trí chờ, khu vực dưới cầu, bánh xe, PBB lân cận và các tuyến cáp/ống.",
            "acceptance": "Vùng chuyển động không có người, phương tiện, FOD hoặc vật cản; thiết bị phụ trợ thu gọn."
          },
          {
            "action": "Phối hợp xác nhận tàu bay dừng đúng vị trí, động cơ tắt, chèn bánh và khu vực tiếp cận an toàn.",
            "acceptance": "Đã nhận xác nhận rõ ràng từ đơn vị có trách nhiệm; không suy đoán từ On Block."
          },
          {
            "action": "Kiểm tra nguồn, trạng thái điều khiển, camera, đèn/còi và cảnh báo trước khi phát lệnh.",
            "acceptance": "Thiết bị đủ điều kiện vận hành; không có lỗi hoặc liên động ngăn di chuyển."
          },
          {
            "action": "Điều chỉnh sơ bộ cao độ, hướng rotunda và chiều dài; tiếp cận có quan sát liên tục.",
            "acceptance": "Hướng đi phù hợp, không vượt giới hạn; giảm tốc khi cabin gần thân tàu bay."
          },
          {
            "action": "Căn góc cabin và cao độ sàn; đưa bumper đến vị trí tiếp xúc phù hợp.",
            "acceptance": "Đúng quan hệ sàn–cửa theo tài liệu áp dụng; không ép đệm vào vỏ tàu bay."
          },
          {
            "action": "Triển khai canopy, kích hoạt autoleveler và phối hợp xác nhận sẵn sàng phục vụ.",
            "acceptance": "Cabin, sàn và tiếp giáp ổn định; bảo vệ hoạt động và không có cảnh báo ảnh hưởng an toàn."
          },
          {
            "action": "Duy trì giám sát trong thời gian phục vụ hành khách.",
            "acceptance": "Theo dõi cao độ, autoleveler, safety shoe và vùng tiếp giáp; có bàn giao hợp lệ nếu đổi người giám sát."
          }
        ],
        "stop": "Có người/vật cản, chuyển động sai lệnh, lỗi tự cân bằng, tiếp xúc bất thường hoặc cảnh báo an toàn: dừng, thông báo và xử lý theo quy trình; không bỏ qua liên động.",
        "completion": "Ghi giờ kết nối, cầu/cửa phục vụ, trạng thái kết nối và bất thường trong nhật ký."
      },
      {
        "title": "Rời khỏi tàu bay",
        "steps": [
          {
            "action": "Nhận yêu cầu tách cầu và xác nhận đã kết thúc phục vụ hành khách.",
            "acceptance": "Các bên liên quan thống nhất thời điểm; không còn người trong khu vực cần giải phóng."
          },
          {
            "action": "Phối hợp kiểm tra cửa tàu bay, khu vực cabin và tuyến kết nối phụ trợ.",
            "acceptance": "Cửa tàu bay đã đóng, được xác nhận an toàn; GPU/PCA/PWS đã ngừng, tháo và thu hồi."
          },
          {
            "action": "Ngừng autoleveler và thu canopy theo trình tự thiết bị.",
            "acceptance": "Cơ cấu tiếp giáp, sàn nối nếu có và cảm biến ở trạng thái cho phép tách."
          },
          {
            "action": "Kiểm tra lại vùng di chuyển trước khi cấp lệnh.",
            "acceptance": "Không có người, phương tiện, vật cản hoặc PBB lân cận trong vùng nguy hiểm."
          },
          {
            "action": "Tách cabin khỏi thân tàu bay, đưa cầu về vị trí chờ quy định.",
            "acceptance": "Chuyển động được kiểm soát, không va chạm; không thao tác nếu chưa giải phóng kết nối."
          },
          {
            "action": "Đối chiếu vị trí thực tế và trạng thái PARK IN/tương đương, kiểm tra toàn bộ khu vực.",
            "acceptance": "Cabin, tunnel, độ cao và hướng bánh xe đúng vị trí chờ; cáp/ống thu gọn, khu vực giải phóng."
          }
        ],
        "stop": "Chưa xác nhận cửa đóng, thiết bị còn nối với tàu bay, canopy chưa thu hoặc vùng di chuyển chưa an toàn: không tách/di chuyển cầu.",
        "completion": "Ghi giờ tách, vị trí đỗ cuối, lỗi phát sinh và thông tin bàn giao; kết thúc nguồn/chế độ theo quy trình áp dụng."
      },
      {
        "title": "Quy trình kiểm tra hằng ngày",
        "steps": [
          {
            "action": "Nhận bàn giao, xem nhật ký và danh sách lỗi hoặc thiết bị bị cô lập.",
            "acceptance": "Không có tồn tại chưa rõ; xác định đúng cầu và quyền vận hành."
          },
          {
            "action": "Kiểm tra vùng hoạt động, FOD, mặt sân và vị trí chờ.",
            "acceptance": "Cầu không xâm phạm vùng an toàn; điều kiện thời tiết/mặt sân đủ để kiểm tra."
          },
          {
            "action": "Quan sát tunnel, sàn chuyển tiếp, cửa cabin, tay vịn, cầu thang, canopy và bumper.",
            "acceptance": "Không có hư hỏng hoặc vật cản nhìn thấy ảnh hưởng phục vụ."
          },
          {
            "action": "Kiểm tra cáp/ống và các cụm quay, nâng, bánh xe bằng quan sát bên ngoài.",
            "acceptance": "Không thấy hư hỏng, mắc kẹt hoặc dấu hiệu bất thường; không mở cụm bảo vệ."
          },
          {
            "action": "Kiểm tra nguồn, PLC, màn hình, camera, đèn/còi và trạng thái dừng khẩn cấp.",
            "acceptance": "Trạng thái bình thường; thử chức năng bảo vệ chỉ theo phiếu kiểm tra và trong vùng an toàn."
          },
          {
            "action": "Kiểm tra trạng thái autoleveler, safety shoe, chống va chạm và giới hạn hành trình.",
            "acceptance": "Không có cảnh báo chưa xử lý; không tác động/đấu tắt bảo vệ để thử."
          },
          {
            "action": "Thực hiện thử chuyển động khi phiếu kiểm tra cho phép; ghi kết quả và bàn giao.",
            "acceptance": "Không có người/tàu bay trong vùng thử; chuyển động đúng lệnh, không rung/tiếng lạ; trở lại vị trí chờ."
          }
        ],
        "stop": "Bất kỳ hạng mục không đạt: không đưa cầu vào phục vụ; báo phụ trách, gắn cảnh báo/cô lập theo thẩm quyền và chuyển kỹ thuật.",
        "completion": "Ghi từng hạng mục đạt/không đạt/không áp dụng, mã cầu, thời gian, người kiểm tra, mã lỗi và đơn vị tiếp nhận."
      }
    ]
  },
  "gpu": {
    "source": "IV.1.4, 4.4, 9–10 · trang in 82–85, 127–129, 142–145",
    "dailyScope": "Kiểm tra đầu ngày/đầu ca và lặp lại kiểm tra liên quan trước mỗi lượt. Không mở tủ hoặc đo phần mang điện ngoài nhiệm vụ kỹ thuật.",
    "procedures": [
      {
        "title": "Tiếp cận và kết nối vào tàu bay",
        "steps": [
          {
            "action": "Nhận yêu cầu cấp điện; xác nhận đúng tàu bay và vị trí đỗ.",
            "acceptance": "Có phối hợp với tổ bay, vận hành PBB và đơn vị phục vụ; khu vực triển khai an toàn."
          },
          {
            "action": "Kiểm tra nguồn, nối đất theo hạng mục được phép, cáp, phích và tuyến cáp.",
            "acceptance": "Không có hư hỏng hoặc điều kiện mất an toàn; không triển khai qua đường phương tiện."
          },
          {
            "action": "Khởi tạo GPU theo điều khiển đúng model và chờ tự kiểm tra.",
            "acceptance": "Trạng thái sẵn sàng, không có cảnh báo ngăn cấp điện; đầu ra chưa cấp khi chưa kết nối."
          },
          {
            "action": "Đưa cáp đến tàu bay và lắp đầu nối hoàn toàn vào ổ điện ngoài.",
            "acceptance": "Cáp đủ chiều dài, không căng/xoắn hoặc kéo ổ cắm; đầu nối đúng và chắc chắn."
          },
          {
            "action": "Nhận xác nhận cấp nguồn, cho phép đầu ra và kiểm tra liên động.",
            "acceptance": "Điều kiện liên động đáp ứng; nguồn đầu ra ổn định."
          },
          {
            "action": "Theo dõi điện áp, tần số, dòng điện, tải và cảnh báo; thông báo trạng thái cấp điện.",
            "acceptance": "Thông số trong giới hạn của tài liệu áp dụng; duy trì giám sát khi đang phục vụ."
          }
        ],
        "stop": "Mất liên động, hỏng cáp/phích, thông số hoặc trạng thái bất thường: không cấp/tiếp tục cấp điện; xử lý theo quy trình.",
        "completion": "Ghi giờ cấp điện, trạng thái đầu ra và cảnh báo."
      },
      {
        "title": "Rời khỏi tàu bay và thu hồi cáp",
        "steps": [
          {
            "action": "Nhận xác nhận ngừng cấp điện từ tổ bay/đơn vị có trách nhiệm.",
            "acceptance": "Thời điểm ngừng đã được phối hợp."
          },
          {
            "action": "Ngắt đầu ra bằng chức năng đúng model.",
            "acceptance": "Công tắc tơ đầu ra mở; đèn 400 Hz tắt và hiển thị ngừng cấp."
          },
          {
            "action": "Chỉ tháo phích khi đầu ra đã được xác nhận tắt.",
            "acceptance": "Không tháo đầu nối còn mang điện."
          },
          {
            "action": "Thu hồi cáp theo hệ thống quản lý cáp, kiểm tra phích sau sử dụng.",
            "acceptance": "Cáp không mắc hoặc kéo căng, đầu nối về vị trí bảo quản."
          },
          {
            "action": "Xác nhận GPU đã giải phóng khỏi tàu bay và vùng di chuyển PBB.",
            "acceptance": "Không còn tuyến kết nối vướng tàu bay; thiết bị về trạng thái chờ/kết thúc theo quy trình."
          }
        ],
        "stop": "Đèn và màn hình không thống nhất hoặc chưa xác nhận đầu ra tắt: không tháo phích; báo phụ trách.",
        "completion": "Ghi giờ ngừng cấp, kết quả thu hồi và hư hỏng phát hiện."
      },
      {
        "title": "Quy trình kiểm tra hằng ngày",
        "steps": [
          {
            "action": "Xem bàn giao, cảnh báo và tình trạng sẵn sàng của GPU.",
            "acceptance": "Không còn lỗi/cô lập chưa được giải quyết."
          },
          {
            "action": "Quan sát vỏ, nguồn và dấu hiệu bất thường bên ngoài.",
            "acceptance": "Không có hư hỏng ảnh hưởng an toàn; không tự mở tủ điện."
          },
          {
            "action": "Kiểm tra toàn tuyến cáp, phích và phần tiếp xúc nhìn thấy.",
            "acceptance": "Không có đứt, nứt, biến dạng, dấu quá nhiệt hoặc nhiễm bẩn ảnh hưởng kết nối."
          },
          {
            "action": "Kiểm tra bộ thu cáp và vị trí bảo quản.",
            "acceptance": "Không mắc, xoắn hoặc cản trở vùng di chuyển."
          },
          {
            "action": "Kiểm tra hiển thị, cảnh báo, thông gió và trạng thái bảo vệ theo phiếu kiểm tra.",
            "acceptance": "Không có lỗi; không che đường làm mát; chỉ thử chức năng khi được phép."
          },
          {
            "action": "Khởi tạo/thử theo danh mục được duyệt và ghi kết quả.",
            "acceptance": "Thiết bị sẵn sàng; không tự cấp điện vào tàu bay hoặc bỏ qua liên động để thử."
          }
        ],
        "stop": "Cáp, nguồn, nối đất hoặc bảo vệ không đủ điều kiện: ngừng sử dụng và báo đơn vị kỹ thuật.",
        "completion": "Ghi mã GPU, ngày/ca, hạng mục không đạt và người/đơn vị xử lý."
      }
    ]
  },
  "pca": {
    "source": "IV.1.4, 3.2–3.4, 9–10 · trang in 82–85, 110–120, 142–145",
    "dailyScope": "Danh mục quan sát và sẵn sàng đầu ngày/đầu ca; sửa chữa mạch lạnh, vệ sinh bên trong và thay mô-đun thuộc phạm vi bảo trì.",
    "procedures": [
      {
        "title": "Tiếp cận và kết nối vào tàu bay",
        "steps": [
          {
            "action": "Nhận yêu cầu; xác định loại tàu bay và cấu hình một/hai PCA.",
            "acceptance": "Dữ liệu hiển thị khớp tàu bay thực tế; nhu cầu cấp khí được xác nhận."
          },
          {
            "action": "Kiểm tra vùng triển khai, ống mềm và đầu nối trước khi kéo ống.",
            "acceptance": "Tàu bay dừng, động cơ tắt, vùng tiếp cận an toàn; không có hỏng hoặc vật lạ ở đầu nối."
          },
          {
            "action": "Triển khai tuyến ống và khóa đầu nối vào cửa nhận khí đúng chiều.",
            "acceptance": "Ống không gập/xoắn/kéo căng hoặc bị chặn; kết nối hoàn tất trước khởi động."
          },
          {
            "action": "Đặt cảm biến nhiệt độ khoang khi cấu hình có sử dụng.",
            "acceptance": "Vị trí đo đại diện, tránh khí cấp/nguồn nhiệt; dây không bị chèn ép."
          },
          {
            "action": "Kiểm tra loại tàu bay, chế độ, nhiệt độ đặt và liên động.",
            "acceptance": "Thiết lập đúng yêu cầu; không có cảnh báo ngăn khởi động."
          },
          {
            "action": "Phối hợp khởi động và theo dõi quạt, mô-đun lạnh, ống cấp khí.",
            "acceptance": "Trạng thái hoạt động bình thường; ống ổn định, không rung giật/rò khí bất thường."
          }
        ],
        "stop": "Ống chưa nối, bị chặn/gập, liên động không đạt hoặc chọn sai tàu bay: không khởi động; không chọn tàu bay lớn hơn để tăng lưu lượng.",
        "completion": "Ghi cấu hình, chế độ, giờ cấp khí và bất thường."
      },
      {
        "title": "Rời khỏi tàu bay và thu hồi ống khí",
        "steps": [
          {
            "action": "Nhận xác nhận ngừng cấp khí và phối hợp với đơn vị phục vụ.",
            "acceptance": "Thời điểm kết thúc được thống nhất."
          },
          {
            "action": "Dừng PCA bằng chức năng đúng model; chờ quạt và dòng khí dừng.",
            "acceptance": "Đèn/trạng thái về chờ và xác nhận không còn cấp khí."
          },
          {
            "action": "Tháo khóa, rút đầu nối và phối hợp đóng cửa nhận khí.",
            "acceptance": "PCA đã dừng hoàn toàn trước thao tác tại đầu nối."
          },
          {
            "action": "Kiểm tra, thu hồi ống và cảm biến khoang nếu có.",
            "acceptance": "Ống không kéo lê, xoắn hoặc mắc; cảm biến về nơi bảo quản."
          },
          {
            "action": "Xác nhận tuyến PCA đã giải phóng và thiết bị về chờ.",
            "acceptance": "Không còn ống/dây cảm biến cản trở tàu bay hoặc PBB."
          }
        ],
        "stop": "Quạt hoặc dòng khí còn hoạt động: không tháo đầu nối hoặc thu cuốn tuyến đang cấp khí.",
        "completion": "Ghi giờ ngừng, tình trạng ống/cảm biến và kết quả thu hồi."
      },
      {
        "title": "Quy trình kiểm tra hằng ngày",
        "steps": [
          {
            "action": "Xem bàn giao, lỗi tồn tại và trạng thái PCA trên điều khiển/IASS nếu có.",
            "acceptance": "Không có lỗi chưa xử lý ảnh hưởng khai thác."
          },
          {
            "action": "Quan sát vỏ và khu vực cửa hút/xả bên ngoài.",
            "acceptance": "Không có hư hỏng hoặc vật cản nhìn thấy; không mở cụm đang vận hành."
          },
          {
            "action": "Kiểm tra ống, lớp bọc, đầu nối và cơ cấu thu hồi.",
            "acceptance": "Không rách, gập, biến dạng hoặc vật lạ; tuyến đủ điều kiện triển khai."
          },
          {
            "action": "Kiểm tra cảm biến khoang, dây và giá bảo quản nếu có.",
            "acceptance": "Không hỏng, bị kẹt/chèn; cảm biến được bảo quản đúng."
          },
          {
            "action": "Quan sát dấu hiệu rò rỉ/nước ngưng bất thường và trạng thái quạt/mô-đun trên giao diện.",
            "acceptance": "Không có cảnh báo hoặc dấu hiệu bất thường cần chuyển kỹ thuật."
          },
          {
            "action": "Kiểm tra điều khiển, liên động và bảo vệ theo phiếu đúng model.",
            "acceptance": "Chỉ thử trong cấu hình được phê duyệt; không chạy tự do với đầu ống chưa nối để thử."
          },
          {
            "action": "Ghi nhận kết quả, trả thiết bị về trạng thái chờ.",
            "acceptance": "Ống và dây thu gọn; thiết bị đủ điều kiện cho lượt tiếp theo."
          }
        ],
        "stop": "Ống, cảm biến, quạt hoặc bảo vệ không đạt: không phục vụ; báo phụ trách, chuyển bảo trì.",
        "completion": "Ghi ngày/ca, mã PCA, các hạng mục và lỗi; vệ sinh/bảo trì định kỳ theo kế hoạch riêng."
      }
    ]
  },
  "pws": {
    "source": "IV.1.4, 5.1–5.3, 9–10 · trang in 82–85, 129–134, 142–145",
    "dailyScope": "Danh mục vệ sinh và sẵn sàng đầu ngày/đầu ca. Chu kỳ lấy mẫu nước, súc rửa, khử trùng và thay lọc cần kế hoạch được duyệt; không mặc định thực hiện mỗi ngày.",
    "procedures": [
      {
        "title": "Tiếp cận và kết nối vào tàu bay",
        "steps": [
          {
            "action": "Nhận yêu cầu cấp nước và xác định đúng cửa nước sạch.",
            "acceptance": "Có nhu cầu phục vụ và khu vực an toàn; phân biệt rõ hệ nước sạch với nước thải."
          },
          {
            "action": "Kiểm tra điều kiện nguồn, van, điều áp, chống chảy ngược, lọc và đo lưu lượng.",
            "acceptance": "Hệ thống đủ điều kiện theo danh mục áp dụng; không có rò rỉ/nhiễm bẩn."
          },
          {
            "action": "Kiểm tra ống và đầu nối trước triển khai.",
            "acceptance": "Đầu nối sạch, nguyên vẹn; các phần tiếp xúc nước được bảo vệ."
          },
          {
            "action": "Kéo ống theo tuyến phù hợp, kết nối vào cửa nước sạch tàu bay.",
            "acceptance": "Ống không xoắn/gập; tránh đất, dầu mỡ, hóa chất và nước thải."
          },
          {
            "action": "Cho phép cấp nước theo yêu cầu tàu bay và theo dõi áp suất/lưu lượng.",
            "acceptance": "Kết nối an toàn, không rò rỉ; áp suất/lưu lượng phù hợp quy trình thực tế."
          }
        ],
        "stop": "Nghi nhiễm bẩn, sai đầu nối, rò rỉ hoặc điều kiện nguồn chưa xác nhận: không cấp nước; báo đơn vị có trách nhiệm.",
        "completion": "Ghi thời điểm cấp, dữ liệu lượng nước nếu hệ thống cung cấp và bất thường."
      },
      {
        "title": "Rời khỏi tàu bay và thu hồi ống nước",
        "steps": [
          {
            "action": "Nhận tín hiệu kết thúc từ đơn vị phục vụ tàu bay.",
            "acceptance": "Yêu cầu ngừng đã được xác nhận."
          },
          {
            "action": "Đóng van cấp và xả áp suất còn lại theo quy trình.",
            "acceptance": "Tuyến đã ngừng cấp và được xác nhận hết áp trước tháo."
          },
          {
            "action": "Tháo đầu nối, bảo vệ đầu nối và phối hợp đóng cửa nhận nước.",
            "acceptance": "Không thao tác khi tuyến còn áp; giữ đầu nối tránh nhiễm bẩn."
          },
          {
            "action": "Thu hồi ống bằng cơ cấu bộ cuốn theo điều khiển đúng model.",
            "acceptance": "Ống cuốn đều, không gập/mắc; giới hạn thu hoạt động đúng."
          },
          {
            "action": "Đậy nắp, đặt đầu nối đúng vị trí và xác nhận giải phóng tuyến.",
            "acceptance": "Ống thu gọn; không còn kết nối với tàu bay hoặc cản trở di chuyển PBB."
          }
        ],
        "stop": "Chưa ngừng cấp/hết áp hoặc cơ cấu cuốn mắc kẹt: dừng thao tác, không cưỡng bức thu ống.",
        "completion": "Ghi giờ kết thúc, tình trạng vệ sinh, rò rỉ và kết quả thu hồi."
      },
      {
        "title": "Quy trình kiểm tra hằng ngày",
        "steps": [
          {
            "action": "Xem bàn giao và tình trạng nguồn nước theo tài liệu kiểm soát đang áp dụng.",
            "acceptance": "Không có cảnh báo chất lượng nước hoặc yêu cầu cách ly chưa giải quyết."
          },
          {
            "action": "Kiểm tra vệ sinh vỏ, khu vực bảo quản, ống và đầu nối.",
            "acceptance": "Đầu nối có nắp; không tiếp xúc chất bẩn; không dùng chung với thiết bị nước thải."
          },
          {
            "action": "Quan sát ống, van, các mối nối và dấu hiệu rò rỉ.",
            "acceptance": "Không hư hỏng, nứt, rò hoặc biến dạng nhìn thấy."
          },
          {
            "action": "Kiểm tra hiển thị áp suất/lưu lượng và trạng thái cụm điều áp, lọc, chống chảy ngược theo phiếu.",
            "acceptance": "Không có bất thường; không tự chỉnh áp hoặc tháo linh kiện để kiểm tra."
          },
          {
            "action": "Kiểm tra bộ cuốn, dẫn hướng, điều khiển và giới hạn thu theo phạm vi cho phép.",
            "acceptance": "Thu hồi an toàn; tuyến không mắc/xoắn; không có lỗi."
          },
          {
            "action": "Đối chiếu lịch súc rửa, khử trùng, thay lọc và ghi kết quả.",
            "acceptance": "Hạng mục đến hạn được chuyển đơn vị chịu trách nhiệm; thiết bị chỉ phục vụ khi đủ điều kiện."
          }
        ],
        "stop": "Nguồn nước chưa xác nhận, đầu nối nhiễm bẩn hoặc bảo vệ không đạt: ngừng sử dụng; xử lý theo quy trình vệ sinh và báo phụ trách.",
        "completion": "Ghi ngày/ca, mã PWS, hạng mục đạt/không đạt và yêu cầu xử lý; không tự đặt liều hóa chất hoặc chu kỳ lấy mẫu."
      }
    ]
  },
  "vdgs": {
    "source": "IV.1.4, 6–7, 9–10 · trang in 82–85, 134–140, 142–145",
    "dailyScope": "Kiểm tra sẵn sàng đầu ngày/đầu ca; hiệu chuẩn cảm biến, thử thuật toán và chỉnh điểm dừng thuộc thẩm quyền kỹ thuật theo tài liệu model.",
    "procedures": [
      {
        "title": "Dẫn tàu bay tiếp cận vào vị trí đỗ",
        "steps": [
          {
            "action": "Nhận kế hoạch; đối chiếu chuyến bay, tim/vị trí đỗ và loại tàu bay trên TMan, MCB với kế hoạch chính thức.",
            "acceptance": "Dữ liệu phù hợp kế hoạch chính thức; xác định đúng cấu hình vị trí đỗ."
          },
          {
            "action": "Kiểm tra vùng dẫn đỗ, tầm quan sát và trạng thái thiết bị.",
            "acceptance": "Không có vật cản; cảm biến/PDU không che khuất; không có lỗi ảnh hưởng dẫn đỗ."
          },
          {
            "action": "Xác nhận quyền Remote/Local và kết nối MCB–DC/trung tâm; kích hoạt dẫn đỗ trên giao diện được phân quyền.",
            "acceptance": "Đúng vị trí và loại tàu bay; hệ thống chuyển Active chờ phát hiện."
          },
          {
            "action": "Theo dõi phát hiện, đối chiếu tàu bay và quá trình Docking trên MCB/TMan theo nhiệm vụ được giao, kết hợp quan sát vùng dẫn đỗ.",
            "acceptance": "Loại tàu bay, lệch tim, khoảng cách và trạng thái nhất quán."
          },
          {
            "action": "Giám sát quá trình tiếp cận, sẵn sàng dừng khi có nguy cơ.",
            "acceptance": "Không có người/phương tiện/vật cản hoặc cảnh báo làm mất điều kiện dẫn đỗ."
          },
          {
            "action": "Xác nhận kết quả dừng và trạng thái On Block.",
            "acceptance": "Tàu bay dừng đúng vị trí; các xác nhận chèn bánh, động cơ và khu vực an toàn được phối hợp riêng trước phục vụ thiết bị khác."
          }
        ],
        "stop": "Sai dữ liệu tàu bay, mất kết nối, che khuất hoặc nguy cơ an toàn: ngừng dẫn đỗ/chuyển phương án được phê duyệt; không coi STOP đơn lẻ là đỗ đúng.",
        "completion": "Ghi kết quả dẫn đỗ, thời điểm, cảnh báo và phương án dự phòng nếu có."
      },
      {
        "title": "Kết thúc dẫn đỗ và phối hợp tàu bay rời vị trí",
        "steps": [
          {
            "action": "Ghi nhận hoàn tất dẫn đỗ, đối chiếu kết quả trên MCB/TMan và đồng bộ trạng thái vị trí đỗ theo quy trình.",
            "acceptance": "On Block phù hợp thực tế; không đặt Free khi tàu bay còn tại vị trí."
          },
          {
            "action": "Khôi phục Remote nếu đã thao tác Local theo phân quyền.",
            "acceptance": "Remote được khôi phục theo quy trình; xác nhận kết nối và quyền điều khiển trung tâm trên MCB/TMan."
          },
          {
            "action": "Trước khởi hành, phối hợp kiểm tra trạng thái thiết bị và giải phóng vị trí đỗ.",
            "acceptance": "PWS/PCA/GPU đã ngừng, thu hồi; PBB ở vị trí an toàn; vùng hoạt động đã giải phóng theo quy trình phối hợp."
          },
          {
            "action": "Sau khi tàu bay rời vị trí, đối chiếu dữ liệu quản lý và thực tế trước cập nhật trạng thái.",
            "acceptance": "Chỉ xác nhận trống khi có căn cứ hợp lệ theo quy trình khai thác; không tự suy đoán hoặc chỉnh trạng thái để xóa lỗi."
          }
        ],
        "stop": "VDGS không thực hiện thao tác rút thiết bị khỏi tàu bay và không thay thế quy trình đẩy lùi/dẫn tàu bay rời vị trí của lực lượng có thẩm quyền.",
        "completion": "Báo cáo quy định các trạng thái nhưng chưa đủ chi tiết một SOP khởi hành; trình tự cập nhật sau rời đỗ cần đối chiếu quy trình sân bay và model."
      },
      {
        "title": "Quy trình kiểm tra hằng ngày",
        "steps": [
          {
            "action": "Xem bàn giao, lịch sử/cảnh báo trên TMan, thiết bị bị cô lập và kế hoạch vị trí đỗ.",
            "acceptance": "Tồn tại được làm rõ; cấu hình phục vụ xác định đúng."
          },
          {
            "action": "Quan sát vùng dẫn đỗ và cụm cảm biến/PDU từ vị trí an toàn.",
            "acceptance": "Không bị vật cản, bụi bẩn che khuất, sai lệch hoặc hư hỏng nhìn thấy."
          },
          {
            "action": "Kiểm tra nguồn, màn hình MCB, kết nối MCB–DC và tình trạng kết nối trung tâm/TMan.",
            "acceptance": "Đúng vị trí đỗ, trạng thái và dữ liệu; không có cảnh báo truyền thông."
          },
          {
            "action": "Đối chiếu chế độ MCB Remote/Local/Maintenance, quyền tài khoản TMan và thông tin loại tàu bay theo kế hoạch.",
            "acceptance": "Không duy trì Maintenance hoặc Local ngoài yêu cầu được phân quyền."
          },
          {
            "action": "Kiểm tra trạng thái dừng khẩn cấp và thực hiện thử chức năng nếu danh mục cho phép.",
            "acceptance": "Thử trong phạm vi được duyệt, không trong lượt dẫn đỗ đang phục vụ; không chỉnh cảm biến/điểm dừng."
          },
          {
            "action": "Ghi kết quả và xác nhận sẵn sàng hoặc báo không đủ điều kiện.",
            "acceptance": "Chỉ kích hoạt phục vụ khi lỗi ảnh hưởng dẫn đỗ đã được xử lý."
          }
        ],
        "stop": "Che khuất, sai vị trí/dữ liệu, lỗi hiển thị hoặc kết nối: không đưa vào dẫn đỗ; báo phụ trách và dùng phương án dự phòng được phê duyệt.",
        "completion": "Ghi ngày/ca, vị trí đỗ, chế độ, lỗi và người tiếp nhận; vệ sinh/hiệu chuẩn do đúng đơn vị thực hiện."
      }
    ]
  }
};
