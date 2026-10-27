import { BookOpen, Box, Layers, Radar, SlidersHorizontal, type LucideIcon } from 'lucide-react';
export type SitePage = 'simulation' | 'vdgs' | 'about' | 'explore' | 'ground-ops';
export const navigation: { href: string; label: string; icon: LucideIcon; page?: SitePage; showInHeader?: boolean }[] = [
 { href: '/', label: 'Mô phỏng PBB', icon: Box, page: 'simulation' },
 { href: '/vdgs', label: 'Mô phỏng VDGS', icon: Radar, page: 'vdgs' },
 { href: '/ground-ops', label: 'Ground Operations', icon: Box, page: 'ground-ops' },
 { href: '/#operator-console', label: 'Bàn điều khiển', icon: SlidersHorizontal, showInHeader: false },
 { href: '/about', label: 'Giới thiệu', icon: BookOpen, page: 'about' },
 { href: '/about/#shinmaywa', label: 'Khám phá cấu tạo', icon: Layers, showInHeader: false },
];
export const headerNavigation = navigation.filter(item => item.showInHeader !== false);
