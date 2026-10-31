export const mediaReviewDate = '2026-10-31';
const government = 'Báo Điện tử Chính phủ';
const juneStory = 'https://baochinhphu.vn/san-bay-long-thanh-se-hoan-thanh-dua-vao-su-dung-trong-thang-12-2026-102260629150205109.htm';
const architectureStory = 'https://vnexpress.net/dien-mao-nha-ga-hinh-canh-sen-san-bay-long-thanh-4986592.html';
const images = {
 terminal: 'https://vcdn1-vnexpress.vnecdn.net/2025/11/26/DJI-20251126101825-0288-D-1764172264-1764172277.jpg?dpr=2&fit=crop&h=0&q=100&s=YwatB4sgPc5-hREBHcfPxA&w=1200',
 interior: 'https://vcdn1-vnexpress.vnecdn.net/2026/09/25/820525483-2323870515098819-6906405390797354751-n-1790305183.jpg?dpr=2&fit=crop&h=0&q=100&s=2JkJJB7CYkst7_GxCfGWEw&w=1200',
 juneTerminal: 'https://bcp.cdnchinhphu.vn/thumb_w/777/334894974524682240/2026/6/29/dji202512111755340147d0b2d0b19304a-1782719431640371454571.jpg',
 airfield: 'https://bcp.cdnchinhphu.vn/thumb_w/777/334894974524682240/2026/6/29/contentda7fba6cf5f6-1782719609874739850000.jpg',
 october: 'https://bcp.cdnchinhphu.vn/thumb_w/777/334894974524682240/2026/10/30/17933559330581502017584250765363873750563331553399434b90c295cff1c59d3dfac46da2f7085-17933559564661733013420.jpg',
 trial: 'https://bcp.cdnchinhphu.vn/thumb_w/777/334894974524682240/2026/7/28/178522705777215020175842507653638737505633315533994f0a92313e19ca3331d95fc66861f7ea5-1785227962882342174004.jpg',
 calibration: 'https://bcp.cdnchinhphu.vn/thumb_w/777/334894974524682240/2025/10/20/img6391-17607077541111100654948-17609512148901872191109.jpg',
};
export type AirportSlide = {id:string;image:string;alt:string;title:string;description:string;kind:'Phối cảnh'|'Ảnh tư liệu';source:string;sourceUrl:string;publishedAt?:string};
export const airportSlides:AirportSlide[] = [
 {id:'masterplan',image:'/images/long-thanh-overview.jpg',alt:'Phối cảnh toàn cảnh dự án Long Thành, nhà ga, sân đỗ và hệ thống đường lăn',title:'Long Thành, từ góc nhìn tổng thể.',description:'Nhà ga, sân đỗ và các tuyến kết nối trong ảnh phối cảnh tổng quan dự án do người dùng cung cấp.',kind:'Phối cảnh',source:'Ảnh do người dùng cung cấp',sourceUrl:'/images/long-thanh-overview.jpg'},
 {id:'construction',image:images.juneTerminal,alt:'Ảnh tư liệu nhà ga Long Thành trong bài báo về tiến độ dự án',title:'Nhịp xây dựng một cửa ngõ.',description:'Góc nhìn về công trường và nhà ga qua tư liệu trong bài báo đăng tháng 6/2026.',kind:'Ảnh tư liệu',source:government,sourceUrl:juneStory,publishedAt:'2026-06-29'},
 {id:'lotus',image:images.terminal,alt:'Ảnh chụp từ trên cao của nhà ga Long Thành với mái hình cánh sen',title:'Hình hài những cánh sen.',description:'Kiến trúc mái nhà ga qua phóng sự ảnh đăng tháng 11/2025.',kind:'Ảnh tư liệu',source:'VnExpress',sourceUrl:architectureStory,publishedAt:'2025-11-27'},
 {id:'airfield',image:images.airfield,alt:'Ảnh tư liệu khu bay Long Thành trong bài báo của Báo Điện tử Chính phủ',title:'Từ nhà ga, mở ra khu bay.',description:'Đường cất hạ cánh, đường lăn và sân đỗ trong tư liệu về các hạng mục của dự án.',kind:'Ảnh tư liệu',source:government,sourceUrl:juneStory,publishedAt:'2026-06-29'},
];
export const articleCategories = ['Tất cả','Kiến trúc','Nhà ga','Tiến độ','Bay & vận hành'] as const;
export type LongThanhArticle = {id:string;title:string;summary:string;category:typeof articleCategories[number];source:string;date:string;url:string;image:string;alt:string};
// Summaries are original editorial descriptions; full text stays at the publisher.
export const longThanhArticles:LongThanhArticle[] = [
 {id:'opening-plan',title:'Dự kiến đưa sân bay Long Thành vào khai thác từ 0h ngày 24/12',summary:'Bản tin về mốc khai thác dự kiến và công tác phối hợp chuẩn bị, theo thông tin được công bố cuối tháng 10/2026.',category:'Tiến độ',source:government,date:'2026-10-30',url:'https://baochinhphu.vn/du-kien-dua-san-bay-long-thanh-vao-khai-thac-tu-0h-ngay-24-12-102261030172738282.htm',image:images.october,alt:'Ảnh Long Thành trong bản tin về kế hoạch khai thác tháng 10/2026'},
 {id:'inside-terminal',title:'Bên trong nhà ga sân bay Long Thành sắp vận hành thử',summary:'Phóng sự ảnh ghi nhận không gian nhà ga và các hạng mục phục vụ hành khách đang được hoàn thiện trong tháng 9/2026.',category:'Nhà ga',source:'VnExpress',date:'2026-09-25',url:'https://vnexpress.net/ben-trong-nha-ga-san-bay-long-thanh-sap-van-hanh-thu-5124543.html',image:images.interior,alt:'Ảnh nhà ga trong phóng sự về chuẩn bị vận hành thử của VnExpress'},
 {id:'trial-plan',title:'Vận hành thử nghiệm sân bay Long Thành từ tháng 9/2026',summary:'Tìm hiểu kế hoạch thử nghiệm hệ thống và những điều kiện cần chuẩn bị trước khai thác, trong bối cảnh bản tin tháng 7/2026.',category:'Bay & vận hành',source:government,date:'2026-07-28',url:'https://baochinhphu.vn/van-hanh-thu-nghiem-san-bay-long-thanh-tu-thang-9-2026-102260728154207159.htm',image:images.trial,alt:'Ảnh tư liệu Long Thành trong bài báo về công tác vận hành thử nghiệm'},
 {id:'construction-progress',title:'Sân bay Long Thành sẽ hoàn thành, đưa vào sử dụng trong tháng 12/2026',summary:'Một lát cắt về thi công nhà ga, khu bay và hạ tầng kỹ thuật qua báo cáo tiến độ được báo đăng tháng 6/2026.',category:'Tiến độ',source:government,date:'2026-06-29',url:juneStory,image:images.juneTerminal,alt:'Ảnh công trường và nhà ga Long Thành trong bài báo tiến độ tháng 6/2026'},
 {id:'lotus-architecture',title:'Diện mạo nhà ga hình cánh sen sân bay Long Thành',summary:'Quan sát mái nhà ga và các không gian đang hình thành qua góc chụp trên cao tại thời điểm tháng 11/2025.',category:'Kiến trúc',source:'VnExpress',date:'2025-11-27',url:architectureStory,image:images.terminal,alt:'Toàn cảnh nhà ga hình cánh sen qua phóng sự ảnh của VnExpress'},
 {id:'calibration',title:'Chuẩn bị bay hiệu chuẩn lần 2 tại Cảng hàng không quốc tế Long Thành',summary:'Bài viết về kế hoạch bay kiểm tra các hệ thống hỗ trợ hoạt động bay và công việc chuẩn bị trong tháng 10/2025.',category:'Bay & vận hành',source:government,date:'2025-10-20',url:'https://baochinhphu.vn/chuan-bi-bay-hieu-chuan-lan-2-tai-cang-hang-khong-quoc-te-long-thanh-102251020161201093.htm',image:images.calibration,alt:'Ảnh tư liệu trong bài báo về chuẩn bị bay hiệu chuẩn tại Long Thành'},
];
export const displayMediaDate=(date:string)=>date.split('-').reverse().join('/');
