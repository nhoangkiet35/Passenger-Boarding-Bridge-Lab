import { createRoot, hydrateRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import '../app/globals.css';
import PageLoader from '../components/pbb/PageLoader';

const About = lazy(() => import('../components/pbb/About'));
const Lab = lazy(() => import('../components/pbb/Lab'));
const GroundOps = lazy(() => import('../components/pbb/GroundOps'));
const Vdgs = lazy(() => import('../components/pbb/Vdgs'));
const Explore = lazy(() => import('../components/pbb/ExploreAccess'));
const path = window.location.pathname.replace(/\/$/, '');
const isExplore = path === '/explore' || path.startsWith('/admin');
const isAbout = path === '/about';
const isVdgs = path === '/vdgs';
const isGroundOps = path === '/ground-ops';
document.title = isExplore ? 'Quản trị · PBB Lab' : 'PBB Lab · Mô phỏng cầu ống lồng';
if (isAbout) { document.title = 'Về PBB Lab | Long Thành & công nghệ cầu hành khách'; document.querySelector('meta[name="description"]')?.setAttribute('content', 'Khám phá Long Thành, cấu tạo cầu hành khách ShinMaywa PAXWAY và nền tảng học tập, mô phỏng PBB Lab.'); }
if (isGroundOps) document.title = 'Ground Operations Simulator | PBB Lab';
if (isVdgs) {
 document.title = 'Mô phỏng VDGS | PBB Lab';
 document.querySelector('meta[name="description"]')?.setAttribute('content', 'Không gian mô phỏng hệ thống hướng dẫn tàu bay vào vị trí đỗ bằng tín hiệu trực quan.');
}
if (isExplore) {
 document.querySelector('meta[name="description"]')?.setAttribute('content', 'Khu vực quản trị PBB Lab dành cho người được cấp quyền.');
}
const application = (
  <Suspense fallback={<PageLoader label={isAbout ? 'Đang tải Về PBB Lab' : undefined} page={isExplore ? 'explore' : isVdgs ? 'vdgs' : 'simulation'}/>}>
    {isAbout ? <About/> : isGroundOps ? <GroundOps/> : isExplore ? <Explore/> : isVdgs ? <Vdgs/> : <Lab/>}
  </Suspense>
);

const root = document.getElementById('root')!;
if(isAbout && root.hasChildNodes()) hydrateRoot(root,application);
else createRoot(root).render(application);
