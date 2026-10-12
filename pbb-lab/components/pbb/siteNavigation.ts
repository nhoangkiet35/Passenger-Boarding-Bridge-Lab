import { BookOpen, Box, SlidersHorizontal, type LucideIcon } from 'lucide-react';

export type SitePage = 'simulation' | 'about' | 'explore';
export const navigation: { href: string; label: string; icon: LucideIcon; page?: SitePage }[] = [
  { href: '/', label: 'Mô phỏng 3D', icon: Box, page: 'simulation' },
  { href: '/#operator-console', label: 'Bàn điều khiển', icon: SlidersHorizontal },
  { href: '/explore', label: 'Khám phá PBB', icon: BookOpen, page: 'explore' },
  { href: '/about', label: 'Giới thiệu', icon: BookOpen, page: 'about' },
];
