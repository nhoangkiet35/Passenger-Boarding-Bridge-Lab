export type ExploreVideo = {
  id: string;
  title: string;
  originalTitle: string;
  publisher: string;
  url: string;
  sourceUrl: string;
  focus: string;
  scope: string;
};
const sourceUrl = 'https://itwgse.com/product-videos/';
const mediaRoot = 'https://itwgse.com/wp-content/uploads/2025/08/';
export const exploreVideos: Record<string, ExploreVideo[]> = {
 gpu: [
  { id: 'gpu-compact', title: 'GPU tĩnh 400 Hz: nhìn gần thiết bị', originalTitle: 'ITW GSE 2400 Compact GPU', publisher: 'ITW GSE', url: mediaRoot + 'ITW_GSE_2400_feb_2023_Rev_PPT_LOW.mp4', sourceUrl,
    focus: 'Đối chiếu cách bố trí thiết bị và giao diện với các khối đầu vào, chuyển đổi và đầu ra trong chuyên đề GPU.',
    scope: 'Video giới thiệu ITW GSE 2400; mẫu này khác Skywinder Power trong bảng thông số của báo cáo.' },
  { id: 'gpu-coil', title: 'Nguồn điện và bộ cuốn cáp dưới PBB', originalTitle: 'ITW GSE 2400 Power Coil', publisher: 'ITW GSE', url: mediaRoot + 'ITW_GSE_2400_Power_Coil_feb_2023_Rev_LOW.mp4', sourceUrl,
    focus: 'Tìm hiểu cách tích hợp nguồn điện và cơ cấu quản lý cáp trong cùng một cụm thiết bị tại vị trí đỗ.',
    scope: 'Minh họa cấu hình Power Coil của ITW GSE, không xác nhận cấu hình lắp đặt tại Long Thành.' },
 ],
 pca: [
  { id: 'pca-overview', title: 'PCA 3500: tổng quan hệ thống cấp khí', originalTitle: 'ITW GSE PCA 3500', publisher: 'ITW GSE', url: mediaRoot + '14972_ITWGSE_3500_PCA_feb2023_PPT-2.mp4', sourceUrl,
    focus: 'Quan sát bố trí PCA ở sân đỗ hoặc trên cầu hành khách, rồi liên hệ với chuỗi quạt, mô-đun lạnh và tuyến cấp khí.',
    scope: 'Video giới thiệu dòng ITW GSE 3500; cấu hình cụ thể cần đối chiếu tài liệu của từng thiết bị.' },
  { id: 'pca-modules', title: 'Vì sao PCA được thiết kế dạng mô-đun?', originalTitle: 'ITW GSE 3500 PCA — Modular Design', publisher: 'ITW GSE', url: mediaRoot + '11037_ITWGSE_3500_ModularDesign_PPT.mp4', sourceUrl,
    focus: 'Quan sát kết cấu mô-đun và cách tiếp cận cụm làm lạnh; suy nghĩ về ảnh hưởng của thiết kế đến khả năng bảo trì.',
    scope: 'Dùng để tìm hiểu kết cấu và thiết kế; không thay thế hướng dẫn bảo trì được phê duyệt.' },
 ],
 vdgs: [
  { id: 'vdgs-pca-data', title: 'Từ dữ liệu VDGS đến điều chỉnh lưu lượng PCA', originalTitle: 'Automated Aircraft Type Detection', publisher: 'ITW GSE', url: mediaRoot + '14670_ITWGSE_Automated_Aircraft_Type_Detection_PPT.mp4', sourceUrl,
    focus: 'Theo dõi mối liên hệ giữa dữ liệu loại tàu bay từ VDGS/BMS và lựa chọn lưu lượng khí của PCA.',
    scope: 'Video nói về chức năng tích hợp AATD của PCA, không phải hướng dẫn dẫn đỗ hoặc video của hệ thống Safedock.' },
 ],
};
