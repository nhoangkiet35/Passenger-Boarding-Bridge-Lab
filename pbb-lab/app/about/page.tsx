import type { Metadata } from 'next';
import About from '@/components/pbb/About';

export const metadata: Metadata = {
  title: 'Về Long Thành · PBB Lab',
  description: 'Giới thiệu Cảng hàng không quốc tế Long Thành, kiến trúc hoa sen và bối cảnh dự án mô phỏng cầu hành khách PBB Lab.',
};
export default function AboutPage() { return <About/>; }
