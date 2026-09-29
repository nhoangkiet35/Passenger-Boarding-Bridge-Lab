"use client";
import dynamic from 'next/dynamic';
const Lab = dynamic(() => import('@/components/pbb/Lab'), { ssr: false, loading: () => <div className="loading">Đang khởi tạo sân đỗ 3D…</div> });
export default function Home(){ return <Lab/>; }
