import { Box, Radar, SlidersHorizontal, Info, type LucideIcon } from 'lucide-react';
export type SitePage = 'simulation' | 'vdgs' | 'explore' | 'ground-ops' | 'about';
export const navigation: { href: string; label: string; icon: LucideIcon; page?: SitePage; showInHeader?: boolean }[] = [
 { href: '/', label: 'Mô phỏng PBB', icon: Box, page: 'simulation' },
 { href: '/vdgs', label: 'Mô phỏng VDGS', icon: Radar, page: 'vdgs' },
 { href: '/ground-ops', label: 'Ground Operations', icon: Box, page: 'ground-ops' },
 { href: '/about', label: 'Về PBB Lab', icon: Info, page: 'about' },
 { href: '/#operator-console', label: 'Bàn điều khiển', icon: SlidersHorizontal, showInHeader: false },
];
export const headerNavigation = navigation.filter(item => item.showInHeader !== false);
