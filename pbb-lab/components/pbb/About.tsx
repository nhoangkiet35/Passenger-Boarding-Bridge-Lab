"use client";
/* Shared with the standalone Vite build, which has no Next router or image server. */
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import { ArrowRight, ArrowUpRight, MapPin } from 'lucide-react';
import { useState } from 'react';
import SiteHeader from './SiteHeader';
import './about.css';

const vnexpress = 'https://vnexpress.net/dien-mao-san-bay-long-thanh-trong-tuong-lai-4607669.html';
const vtv = 'https://vtv.vn/san-bay-long-thanh-hang-nghin-nguoi-chay-dua-truoc-gio-g-100251202150621774.htm';
const panorama = 'https://i1-vnexpress.vnecdn.net/2023/05/21/Anh-1-1684637666.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=YjeuYOQri7XHLzMMsNCjdg';
const terminal = 'https://cdn-images.vtv.vn/66349b6076cb4dee98746cf1/2025/12/02/dji-0031-2479-7509-26233946999421542541397.jpg';

function PressImage({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className="press-image-fallback"><PlaneMark/><span>Ảnh từ nguồn báo chí</span><small>Mở bài gốc bên dưới để xem hình ảnh.</small></div> : <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)}/>;
}
function PlaneMark() { return <span aria-hidden="true" className="airport-mark">LT</span>; }

export default function About() {
  return <main className="about-page">
    <SiteHeader page="about"/>
    <section className="about-hero" aria-labelledby="about-title">
      <div className="about-hero-copy"><div className="eyebrow">VỀ DỰ ÁN / LONG THÀNH, VIỆT NAM</div><h1 id="about-title">Một cửa ngõ mới.<br/><span>Một hành trình kết nối.</span></h1><p>PBB Lab lấy bối cảnh Cảng hàng không quốc tế Long Thành để khám phá cách cầu hành khách nối nhà ga với tàu bay — mắt xích nhỏ trong một hệ thống hàng không rộng lớn.</p><div className="about-location"><MapPin size={17}/>Long Thành, Đồng Nai</div><a className="about-button" href="/">Khám phá mô phỏng 3D <ArrowRight size={18}/></a></div>
      <figure className="about-hero-image"><PressImage src={panorama} alt="Phối cảnh nhà ga Long Thành với mái lấy cảm hứng từ hoa sen, do ACV cung cấp trên VnExpress" eager/><figcaption>PHỐI CẢNH KIẾN TRÚC · Ảnh: ACV / <a href={vnexpress} target="_blank" rel="noopener noreferrer">VnExpress ↗</a> · 21/05/2023</figcaption></figure>
    </section>
    <section className="about-stats" aria-label="Quy mô theo thiết kế"><div><strong>5.000 <small>ha</small></strong><span>Diện tích toàn dự án</span></div><div><strong>25 <small>triệu</small></strong><span>Hành khách/năm · giai đoạn 1</span></div><div><strong>1,2 <small>triệu tấn</small></strong><span>Hàng hóa/năm · giai đoạn 1</span></div><div><strong>100 <small>triệu</small></strong><span>Hành khách/năm · hoàn thiện toàn dự án</span></div></section>
    <p className="about-source-note">Quy mô theo thiết kế được nêu trong <a href={vtv} target="_blank" rel="noopener noreferrer">bài VTV ngày 02/12/2025</a>; các số liệu này không biểu thị sản lượng khai thác thực tế.</p>
    <section className="about-story" id="overview"><div><div className="eyebrow">01 / CẢNG HÀNG KHÔNG QUỐC TẾ LONG THÀNH</div><h2>Kiến trúc mang dấu ấn Việt Nam</h2></div><div><p>Đặt tại Đồng Nai, Long Thành được quy hoạch thành cảng hàng không quy mô lớn, phát triển qua ba giai đoạn. Nhà ga hành khách có thiết kế lấy cảm hứng từ hoa sen, với ngôn ngữ kiến trúc xuất hiện từ hệ mái đến không gian bên trong.</p><p>Đối với PBB Lab, sân bay là bối cảnh để tìm hiểu sự kết nối giữa nhà ga, sân đỗ và tàu bay. Từ rotunda đến cabin tiếp cận cửa tàu bay, mỗi bộ phận góp phần tạo nên một lối đi liên tục cho hành khách.</p><a className="about-text-link" href={vnexpress} target="_blank" rel="noopener noreferrer">Tìm hiểu thiết kế trên VnExpress <ArrowUpRight size={16}/></a></div></section>
    <section className="about-press" id="press"><div className="about-section-heading"><div><div className="eyebrow">02 / GÓC NHÌN BÁO CHÍ</div><h2>Long Thành qua những khung hình</h2></div><span>Tư liệu có nguồn · Đọc bài gốc</span></div><div className="about-press-grid">
      <article className="press-card"><a href={vnexpress} target="_blank" rel="noopener noreferrer" aria-label="Xem phối cảnh Long Thành trên VnExpress"><PressImage src={panorama} alt="Phối cảnh tổng thể nhà ga sân bay Long Thành, ảnh ACV trên VnExpress"/></a><div className="press-card-copy"><span className="press-meta">VNEXPRESS · 21/05/2023 · ẢNH: ACV</span><h3>Phối cảnh sân bay trong tương lai</h3><p>Tư liệu giới thiệu ý tưởng kiến trúc hoa sen và không gian nhà ga theo thiết kế.</p><a className="about-text-link" href={vnexpress} target="_blank" rel="noopener noreferrer">Đọc bài gốc <ArrowUpRight size={16}/></a></div></article>
      <article className="press-card"><a href={vtv} target="_blank" rel="noopener noreferrer" aria-label="Xem hình ảnh công trường Long Thành trên VTV"><PressImage src={terminal} alt="Ảnh công trường sân bay Long Thành được đăng trong phóng sự ảnh VTV ngày 2 tháng 12 năm 2025"/></a><div className="press-card-copy"><span className="press-meta">VTV · 02/12/2025</span><h3>Nhà ga dần thành hình</h3><p>Phóng sự ảnh ghi lại công trường, hệ thống kết nối và quá trình hoàn thiện nhà ga tại thời điểm đăng bài.</p><a className="about-text-link" href={vtv} target="_blank" rel="noopener noreferrer">Đọc bài gốc <ArrowUpRight size={16}/></a></div></article>
    </div><p className="about-source-note">Ảnh hiển thị từ website nguồn; bản quyền thuộc chủ sở hữu tương ứng. Phối cảnh và ảnh công trường được ghi rõ theo thời điểm xuất bản.</p></section>
    <section className="about-project"><div><div className="eyebrow">03 / TỪ BỐI CẢNH ĐẾN TRẢI NGHIỆM</div><h2>Tìm hiểu cầu hành khách tại sân đỗ</h2><p>Mô phỏng minh họa cấu tạo, chuyển động và chu trình tiếp cận – phục vụ – tách cầu trong bối cảnh Long Thành. Hình học, vị trí đỗ và ngưỡng điều khiển được giản lược cho học tập, không phải bản sao kỹ thuật được sân bay xác nhận.</p><p>Đây là dự án học tập độc lập; không đại diện cho ACV hay Cảng hàng không quốc tế Long Thành và không dùng để điều khiển thiết bị thật.</p></div><a className="about-button" href="/">Vào không gian 3D <ArrowRight size={18}/></a></section>
    <footer><span>PBB LAB · BỐI CẢNH LONG THÀNH</span><a className="about-text-link" href="#about-title">Về đầu trang ↑</a></footer>
  </main>;
}
