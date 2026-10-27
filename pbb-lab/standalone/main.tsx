import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import '../app/globals.css';
import PageLoader from '../components/pbb/PageLoader';

const Lab = lazy(() => import('../components/pbb/Lab'));
const GroundOps = lazy(() => import('../components/pbb/GroundOps'));
const About = lazy(() => import('../components/pbb/About'));
const Vdgs = lazy(() => import('../components/pbb/Vdgs'));
const Explore = lazy(() => import('../components/pbb/ExploreAccess'));
const path = window.location.pathname.replace(/\/$/, '');
const isExplore = path === '/explore' || path.startsWith('/admin');
const isAbout = window.location.pathname.replace(/\/$/, '') === '/about';
const isVdgs = path === '/vdgs';
const isGroundOps = path === '/ground-ops';
document.title = isExplore ? 'Quản trị · PBB Lab' : isAbout ? 'About · Long Thành & công nghệ cầu hành khách | PBB Lab' : 'PBB Lab · Mô phỏng cầu ống lồng';
if (isGroundOps) document.title = 'Ground Operations Simulator | PBB Lab';
if (isVdgs) {
 document.title = 'Mô phỏng VDGS | PBB Lab';
 document.querySelector('meta[name="description"]')?.setAttribute('content', 'Không gian mô phỏng hệ thống hướng dẫn tàu bay vào vị trí đỗ bằng tín hiệu trực quan.');
}
if (isExplore) {
 document.querySelector('meta[name="description"]')?.setAttribute('content', 'Khu vực quản trị PBB Lab dành cho người được cấp quyền.');
}
if (isAbout) {
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'Khám phá Cảng HKQT Long Thành, cấu tạo cầu hành khách ShinMaywa PAXWAY và trải nghiệm học tập trong nền tảng mô phỏng độc lập PBB Lab.');
}
createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<PageLoader page={isExplore ? 'explore' : isAbout ? 'about' : isVdgs ? 'vdgs' : 'simulation'}/>}>
    {isGroundOps ? <GroundOps/> : isExplore ? <Explore/> : isAbout ? <About/> : isVdgs ? <Vdgs/> : <Lab/>}
  </Suspense>,
);
