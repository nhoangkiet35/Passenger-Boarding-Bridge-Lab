import type { Metadata } from 'next';
import Vdgs from '@/components/pbb/Vdgs';

export const metadata: Metadata = {
  title: 'Mô phỏng VDGS | PBB Lab',
  description: 'Không gian mô phỏng hệ thống hướng dẫn tàu bay vào vị trí đỗ bằng tín hiệu trực quan.',
};

export default function VdgsPage() { return <Vdgs/>; }
