import type { ReactNode } from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import type { SitePage } from './siteNavigation';
import './site-shell.css';

export default function SiteShell({ page, children }: { page: SitePage; children: ReactNode }) {
  return <div id="site-top" className={'site-shell site-shell--' + page}>
    <a className="site-skip-link" href={page === 'about' ? '#about-content' : '#simulation-content'}>Chuyển đến nội dung</a>
    <SiteHeader page={page}/>
    {children}
    <SiteFooter/>
  </div>;
}
