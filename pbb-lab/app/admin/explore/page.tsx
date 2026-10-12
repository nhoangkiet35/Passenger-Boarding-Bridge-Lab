import type { Metadata } from 'next';
import ExploreAccess from '@/components/pbb/ExploreAccess';
export const metadata: Metadata = { title: 'Quản trị · PBB Lab', robots: { index: false, follow: false } };
export default function AdminPage() { return <ExploreAccess/>; }
