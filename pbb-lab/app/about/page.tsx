import type { Metadata } from 'next';
import About from '@/components/pbb/About';

export const metadata: Metadata = {
  title: 'About · Long Thành & công nghệ cầu hành khách | PBB Lab',
  description: 'Khám phá Cảng HKQT Long Thành, cấu tạo cầu hành khách ShinMaywa PAXWAY và trải nghiệm học tập trong nền tảng mô phỏng độc lập PBB Lab.',
  openGraph: {
    title: 'PBB Lab — Nơi công nghệ kết nối những hành trình.',
    description: 'Từ sân bay Long Thành đến cầu hành khách ShinMaywa và không gian mô phỏng 3D.',
    locale: 'vi_VN',
    type: 'website',
  },
};
export default function AboutPage() { return <About/>; }
