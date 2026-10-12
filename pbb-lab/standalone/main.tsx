import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import '../app/globals.css';
import PageSkeleton from '../components/pbb/PageSkeleton';

const Lab = lazy(() => import('../components/pbb/Lab'));
const About = lazy(() => import('../components/pbb/About'));
const Explore = lazy(() => import('../components/pbb/Explore'));
const isExplore = window.location.pathname.replace(/\/$/, '') === '/explore';
const isAbout = window.location.pathname.replace(/\/$/, '') === '/about';
document.title = isExplore ? 'Khám phá PBB · Thiết bị & nguyên lý | PBB Lab' : isAbout ? 'About · Long Thành & công nghệ cầu hành khách | PBB Lab' : 'PBB Lab · Mô phỏng cầu ống lồng';
if (isExplore) {
 document.querySelector('meta[name="description"]')?.setAttribute('content', 'Tra cứu học thuật về PBB, GPU, PCA, PWS và VDGS: chức năng, nguyên lý, cấu tạo và thông số kỹ thuật.');
}
if (isAbout) {
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'Khám phá Cảng HKQT Long Thành, cấu tạo cầu hành khách ShinMaywa PAXWAY và trải nghiệm học tập trong nền tảng mô phỏng độc lập PBB Lab.');
}
createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<PageSkeleton page={isExplore ? 'explore' : isAbout ? 'about' : 'simulation'}/>}>
    {isExplore ? <Explore/> : isAbout ? <About/> : <Lab/>}
  </Suspense>,
);
