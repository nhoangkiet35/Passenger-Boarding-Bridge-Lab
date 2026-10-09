/* Native links also support the standalone Vite build without a Next router. */
/* eslint-disable @next/next/no-html-link-for-pages */
import { Plane } from 'lucide-react';

export default function SiteHeader({ page }: { page: 'simulation' | 'about' }) {
  return <header className="topbar site-header">
    <a className="brand" href="/" aria-label="PBB Lab — trang mô phỏng"><span className="brand-icon"><Plane size={24}/></span><b>PBB<span>LAB</span></b><span className="brand-divider"/><span className="brand-caption">LONG THÀNH · KHÔNG GIAN HỌC TẬP</span></a>
    <nav className="site-nav" aria-label="Điều hướng chính">
      <a href="/" aria-current={page === 'simulation' ? 'page' : undefined}>Mô phỏng 3D</a>
      <a href="/about" aria-current={page === 'about' ? 'page' : undefined}>Giới thiệu</a>
      <a href="/#operator-console">Bàn điều khiển</a>
    </nav>
  </header>;
}
