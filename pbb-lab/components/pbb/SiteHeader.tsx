'use client';
/* Native links also support the standalone Vite build without a Next router. */
/* eslint-disable @next/next/no-html-link-for-pages */
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, Plane, X } from 'lucide-react';
import { navigation, type SitePage } from './siteNavigation';

export default function SiteHeader({ page }: { page: SitePage }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    };
    const desktop = window.matchMedia('(min-width: 761px)');
    const resize = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener('keydown', escape);
    desktop.addEventListener('change', resize);
    return () => { document.removeEventListener('keydown', escape); desktop.removeEventListener('change', resize); };
  }, [open]);
  return <header className="site-header">
    <div className="site-header-inner">
      <a className="site-brand" href="/" aria-label="PBB Lab — trang mô phỏng"><span className="site-brand-icon"><Plane size={23} aria-hidden="true"/></span><span className="site-brand-copy"><strong>PBB <span>LAB</span></strong><small>KHÁM PHÁ · HỌC TẬP · MÔ PHỎNG</small></span></a>
      <button ref={toggleRef} type="button" className="site-menu-toggle" aria-expanded={open} aria-controls="site-navigation" aria-label={open ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'} onClick={() => setOpen(value => !value)}>{open ? <X size={21} aria-hidden="true"/> : <Menu size={21} aria-hidden="true"/>}<span>Menu</span></button>
      <nav id="site-navigation" className={'site-navigation' + (open ? ' is-open' : '')} aria-label="Điều hướng chính">
        {navigation.map(item => <a key={item.href} href={item.href} aria-current={item.page === page ? 'page' : undefined} onClick={() => setOpen(false)}><item.icon size={17} aria-hidden="true"/>{item.label}</a>)}
        <a className="site-nav-cta" href="/about#shinmaywa" onClick={() => setOpen(false)}>Khám phá cấu tạo<ArrowUpRight size={16} aria-hidden="true"/></a>
      </nav>
    </div>
  </header>;
}
