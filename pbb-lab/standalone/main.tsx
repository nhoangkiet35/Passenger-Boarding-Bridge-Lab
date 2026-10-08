import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import '../app/globals.css';

const Lab = lazy(() => import('../components/pbb/Lab'));
const About = lazy(() => import('../components/pbb/About'));
const isAbout = window.location.pathname.replace(/\/$/, '') === '/about';
document.title = isAbout ? 'Về Long Thành · PBB Lab' : 'PBB Lab · Mô phỏng cầu ống lồng';
createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<div className="loading">Đang tải {isAbout ? 'giới thiệu Long Thành' : 'sân đỗ 3D'}…</div>}>
    {isAbout ? <About/> : <Lab/>}
  </Suspense>,
);
