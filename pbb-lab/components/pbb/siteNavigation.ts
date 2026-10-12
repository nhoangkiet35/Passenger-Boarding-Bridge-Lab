import { BookOpen, Box, Layers, SlidersHorizontal, type LucideIcon } from 'lucide-react';
export type SitePage = 'simulation' | 'about' | 'explore';
export const navigation: { href: string; label: string; icon: LucideIcon; page?: SitePage }[] = [
 { href: '/', label: 'Mô phỏng 3D', icon: Box, page: 'simulation' },
 { href: '/#operator-console', label: 'Bàn điều khiển', icon: SlidersHorizontal },
 { href: '/about', label: 'Giới thiệu', icon: BookOpen, page: 'about' },
 { href: '/about/#shinmaywa', label: 'Khám phá cấu tạo', icon: Layers },
];
