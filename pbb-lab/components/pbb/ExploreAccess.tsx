/* eslint-disable @next/next/no-html-link-for-pages */
import SiteShell from './SiteShell';
export default function ExploreAccess() {
 return <SiteShell page="explore"><main id="explore-content" style={{padding:'64px 24px',maxWidth:700}}><h1>Khu vực quản trị</h1><p style={{margin:'20px 0',lineHeight:1.8}}>Nội dung dành cho người được cấp quyền truy cập.</p><a href="/api/admin?view=login" style={{display:'inline-block',padding:'14px 20px',background:'#137e8b',color:'white',borderRadius:8}}>Đăng nhập quản trị</a></main></SiteShell>;
}
