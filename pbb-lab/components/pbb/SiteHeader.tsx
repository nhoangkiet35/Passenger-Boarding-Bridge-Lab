'use client';
/* Native links also support the standalone Vite build without a Next router. */
/* eslint-disable @next/next/no-html-link-for-pages */
import { useEffect, useRef, useState } from 'react';
import { Menu, Plane, X } from 'lucide-react';
import { headerNavigation, type SitePage } from './siteNavigation';
import { installHeaderScroll } from '@/lib/headerScroll';

export default function SiteHeader({ page }: { page: SitePage }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => installHeaderScroll(headerRef.current), []);
  useEffect(() => {
    if (!open) return;
    headerRef.current?.classList.remove('header-hidden');
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const siblings=Array.from(headerRef.current?.parentElement?.children??[])
      .filter((node):node is HTMLElement=>node instanceof HTMLElement&&node!==headerRef.current&&!node.classList.contains('site-skip-link'))
      .map(node=>({node,inert:node.inert}));
    siblings.forEach(({node})=>{node.inert=true;});
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
      if(event.key==='Tab'){
        const items=Array.from(headerRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]):not([tabindex="-1"])')??[]).filter(node=>node.getClientRects().length>0);
        const first=items[0],last=items.at(-1);
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
    };
    const desktop = window.matchMedia('(min-width: 761px)');
    const resize = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener('keydown', escape);
    desktop.addEventListener('change', resize);
    return () => { document.body.style.overflow=overflow;siblings.forEach(({node,inert})=>{node.inert=inert;});document.removeEventListener('keydown', escape); desktop.removeEventListener('change', resize); };
  }, [open]);
  return <header ref={headerRef} className={'site-header'+(open?' menu-open':'')}>
    {open&&<button type="button" className="site-menu-backdrop" aria-label="Đóng menu và trở về trang" tabIndex={-1} onClick={()=>{setOpen(false);toggleRef.current?.focus();}}/>}
    <div className="site-header-inner">
      <a className="site-brand" href="/" onClick={()=>setOpen(false)} aria-label="PBB Lab — trang mô phỏng"><span className="site-brand-icon"><Plane size={23} aria-hidden="true"/></span><span className="site-brand-copy"><strong>PBB <span>LAB</span></strong><small>KHÁM PHÁ · HỌC TẬP · MÔ PHỎNG</small></span></a>
      <button ref={toggleRef} type="button" className="site-menu-toggle" aria-expanded={open} aria-controls="site-navigation" aria-label={open ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'} onClick={() => setOpen(value => !value)}>{open ? <X size={21} aria-hidden="true"/> : <Menu size={21} aria-hidden="true"/>}<span>{open?'Đóng':'Menu'}</span></button>
      <nav id="site-navigation" className={'site-navigation' + (open ? ' is-open' : '')} aria-label="Điều hướng chính">
        {headerNavigation.map(item => <a key={item.href} href={item.href} aria-current={item.page === page ? 'page' : undefined} onClick={() => setOpen(false)}><item.icon size={17} aria-hidden="true"/>{item.label}</a>)}
      </nav>
    </div>
  </header>;
}
