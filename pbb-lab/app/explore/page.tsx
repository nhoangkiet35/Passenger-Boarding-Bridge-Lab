import type { Metadata } from 'next';
import Explore from '@/components/pbb/Explore';
export const metadata: Metadata = { title: 'Khám phá PBB · Thiết bị & nguyên lý | PBB Lab', description: 'Tra cứu học thuật về PBB, GPU, PCA, PWS và VDGS: chức năng, nguyên lý, cấu tạo và thông số kỹ thuật theo tài liệu nguồn.' };
export default function ExplorePage() { return <Explore/>; }
