/* eslint-disable @next/next/no-html-link-for-pages */
import { ArrowUp, ArrowUpRight, Plane } from 'lucide-react';
import { navigation } from './siteNavigation';

export default function SiteFooter() {
  return <footer className="site-footer"><div className="site-footer-inner">
    <div className="site-footer-grid">
      <div className="site-footer-intro"><a className="site-brand" href="/" aria-label="PBB Lab — trang mô phỏng"><span className="site-brand-icon"><Plane size={23} aria-hidden="true"/></span><span className="site-brand-copy"><strong>PBB <span>LAB</span></strong><small>PASSENGER BOARDING BRIDGE</small></span></a><p>Từ nhà ga đến cửa tàu bay.<br/>Khám phá công nghệ cầu hành khách qua trải nghiệm trực quan.</p><span className="site-footer-tag">Không gian học tập độc lập · Long Thành</span></div>
      <nav aria-label="Khám phá PBB Lab"><h2>Khám phá</h2>{navigation.map(item => <a key={item.href} href={item.href}>{item.label}<ArrowUpRight size={14} aria-hidden="true"/></a>)}</nav>
      <nav aria-label="Tài nguyên học tập"><h2>Tìm hiểu thêm</h2><a href="/about#shinmaywa">Cấu tạo & công nghệ<ArrowUpRight size={14} aria-hidden="true"/></a><a href="/about#exhibition">Triển lãm Long Thành<ArrowUpRight size={14} aria-hidden="true"/></a><a href="/about#sources">Nguồn thông tin công khai<ArrowUpRight size={14} aria-hidden="true"/></a></nav>
    </div>
    <div className="site-footer-bottom"><p>Chỉ dùng để học tập và thuyết trình. Không thay thế tài liệu hoặc quy trình vận hành được phê duyệt. Không đại diện cho ACV, Cảng HKQT Long Thành hay ShinMaywa.</p><a href="#site-top">Về đầu trang<ArrowUp size={16} aria-hidden="true"/></a></div>
  </div></footer>;
}
