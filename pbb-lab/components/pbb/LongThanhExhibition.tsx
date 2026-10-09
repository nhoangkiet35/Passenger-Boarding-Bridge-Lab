'use client';
import { useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';


const exhibits = [
  { title: 'Sân bay Long Thành dự kiến khai thác thương mại từ 1/12', source: 'VnExpress', date: '2026-07-13', category: 'Khai thác', summary: 'Kế hoạch khai thác và đề xuất chuyển đổi hoạt động giữa hai sân bay, được báo ghi nhận tháng 7/2026.', url: 'https://vnexpress.net/san-bay-long-thanh-du-kien-khai-thac-thuong-mai-tu-1-12-5097034.html' },
  { title: 'Cất cánh Long Thành - chắp cánh tương lai', source: 'VTV', date: '2026-01-06', category: 'Dấu mốc', summary: 'Góc nhìn về hành trình hình thành sân bay và kỳ vọng phát triển hệ sinh thái kinh tế hàng không.', url: 'https://vtv.vn/cat-canh-long-thanh-chap-canh-tuong-lai-100260106091417329.htm' },
  { title: 'Sân bay Long Thành: Hàng nghìn người chạy đua trước giờ G', source: 'VTV', date: '2025-12-02', category: 'Công trường', summary: 'Phóng sự ảnh về công trường và những hạng mục đang được hoàn thiện tại thời điểm bài đăng.', url: 'https://vtv.vn/san-bay-long-thanh-hang-nghin-nguoi-chay-dua-truoc-gio-g-100251202150621774.htm' },
  { title: 'Diện mạo nhà ga hình cánh sen sân bay Long Thành', source: 'VnExpress', date: '2025-11-27', category: 'Kiến trúc', summary: 'Quan sát hình dáng mái nhà ga, không gian bên trong và quá trình lắp đặt trang thiết bị qua phóng sự ảnh.', url: 'https://vnexpress.net/dien-mao-nha-ga-hinh-canh-sen-san-bay-long-thanh-4986592.html' },
  { title: 'Sân bay Long Thành đã hoàn tất các chuyến bay hiệu chuẩn', source: 'VTV', date: '2025-10-31', category: 'Dấu mốc', summary: 'Bài viết giải thích một bước kiểm tra kỹ thuật quan trọng đối với hệ thống dẫn đường và phương thức bay.', url: 'https://vtv.vn/san-bay-long-thanh-da-hoan-tat-cac-chuyen-bay-hieu-chuan-100251031085205403.htm' },
  { title: 'Lộ trình chuyển chuyến bay từ Tân Sơn Nhất sang Long Thành', source: 'VnExpress', date: '2025-09-29', category: 'Khai thác', summary: 'Phương án phân chia chuyến bay được thảo luận tháng 9/2025, đặt trong bối cảnh hạ tầng kết nối lúc đó.', url: 'https://vnexpress.net/lo-trinh-chuyen-chuyen-bay-tu-tan-son-nhat-sang-long-thanh-4944894.html' },
  { title: 'Lợp mái nhà ga sân bay Long Thành', source: 'VnExpress', date: '2025-01-07', category: 'Công trường', summary: 'Một lát cắt của công trường đầu năm 2025: khung thép, mái nhà ga và các hạng mục sân bay.', url: 'https://vnexpress.net/lop-mai-nha-ga-san-bay-long-thanh-4835367.html' },
  { title: 'Diện mạo sân bay Long Thành trong tương lai', source: 'VnExpress', date: '2023-05-21', category: 'Kiến trúc', summary: 'Bộ phối cảnh giới thiệu ý tưởng hoa sen trong kiến trúc nhà ga và quy mô quy hoạch sân bay.', url: 'https://vnexpress.net/dien-mao-san-bay-long-thanh-trong-tuong-lai-4607669.html' },
];
const topics = ['Tất cả', 'Kiến trúc', 'Công trường', 'Dấu mốc', 'Khai thác'];
const formatDate = (date: string) => date.split('-').reverse().join('/');

export default function LongThanhExhibition() {
  const [topic, setTopic] = useState('Tất cả');
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState('newest');
  const normalized = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
  const visible = exhibits.filter(item => (topic === 'Tất cả' || item.category === topic) && normalized(`${item.title} ${item.summary} ${item.source}`).includes(normalized(query))).sort((a, b) => order === 'newest' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  return <section id="exhibition" className="lt-exhibition" aria-labelledby="exhibition-title">
    <div className="about-shell">
      <div className="exhibition-intro"><div><span className="about-kicker">05 / TRIỂN LÃM TƯ LIỆU</span><h2 id="exhibition-title">Long Thành.<br/><em>Qua từng trang báo.</em></h2></div><div><p>Một hành trình từ ý tưởng đến công trường, từ kiến trúc đến những dấu mốc hàng không. Khám phá Long Thành qua các bài báo được tuyển chọn từ nguồn công khai.</p><span className="collection-stamp">08 TƯ LIỆU / 2023 — 2026</span></div></div>
      <a className="exhibition-feature" href={exhibits[7].url} target="_blank" rel="noopener noreferrer"><div className="exhibition-feature-art exhibition-opening"><span className="opening-year">2023</span><strong>Ý tưởng.<br/>Kiến trúc.<br/>Hành trình.</strong><span>LONG THÀNH / TƯ LIỆU MỞ ĐẦU</span></div><div className="exhibition-feature-copy"><span className="about-kicker">TÁC PHẨM MỞ ĐẦU / KIẾN TRÚC</span><h3>Từ một ý tưởng.<br/>Đến một cửa ngõ.</h3><p>Trở về bộ phối cảnh năm 2023 để tìm hiểu ý tưởng hoa sen và hình dung tổng thể sân bay.</p><span className="exhibition-meta">VnExpress · 21/05/2023</span><span className="exhibition-read">Khám phá bài gốc <ArrowUpRight size={18}/></span></div></a>
      <div className="exhibition-toolbar"><div className="exhibition-topics" role="group" aria-label="Lọc chủ đề bài báo">{topics.map(value => <button key={value} type="button" aria-pressed={topic === value} onClick={() => setTopic(value)}>{value}</button>)}</div><label className="exhibition-search"><Search size={17}/><input aria-label="Tìm bài báo" placeholder="Tìm trong triển lãm…" value={query} onChange={event => setQuery(event.target.value)}/></label><select aria-label="Sắp xếp bài báo" value={order} onChange={event => setOrder(event.target.value)}><option value="newest">Mới nhất trước</option><option value="oldest">Theo dòng thời gian</option></select></div>
      <div className="exhibition-results" aria-live="polite">{visible.length} / {exhibits.length} tư liệu <span>TÓM TẮT BIÊN SOẠN BỞI PBB LAB · ĐỌC TOÀN VĂN TẠI NGUỒN</span></div>
      <div className="exhibition-grid">{visible.map(item => <article className={`exhibit-card exhibit-${topics.indexOf(item.category)}`} key={item.url}><a href={item.url} target="_blank" rel="noopener noreferrer"><div className="exhibit-poster" aria-hidden="true"><span>{item.category}</span><strong>{String(exhibits.indexOf(item) + 1).padStart(2, '0')}</strong><svg viewBox="0 0 360 160" fill="none"><path d="M0 130H360M25 130V94L180 30L335 94V130M25 94H335M55 130V102M95 130V102M135 130V102M175 130V102M215 130V102M255 130V102M295 130V102M25 94Q95 82 115 48Q180 100 230 35Q270 84 335 94" stroke="currentColor" strokeWidth="1.2"/></svg><span className="poster-year">{item.date.slice(0, 4)}</span></div><div className="exhibit-body"><div className="exhibition-meta">{item.source} <time dateTime={item.date}>{formatDate(item.date)}</time></div><h3>{item.title}</h3><p>{item.summary}</p><span className="exhibition-read">Đọc tại {item.source} <ArrowUpRight size={17}/></span></div></a></article>)}</div>
      {visible.length === 0 && <div className="exhibition-empty"><p>Chưa có tư liệu phù hợp với tìm kiếm này.</p><button type="button" onClick={() => { setQuery(''); setTopic('Tất cả'); }}>Xem toàn bộ triển lãm</button></div>}
      <p className="about-note">Tư liệu phản ánh thời điểm xuất bản. Lịch trình và phương án trong các bài có thể thay đổi; hãy đọc ngày đăng và đối chiếu bài mới hơn. Các hình đồ họa ở đây là minh họa riêng, không phải ảnh trong bài báo.</p>
    </div>
  </section>;
}
