"use client";
import dynamic from 'next/dynamic';
import PageLoader from '@/components/pbb/PageLoader';
const Lab = dynamic(() => import('@/components/pbb/Lab'), { ssr: false, loading: () => <PageLoader/> });
export default function Home(){ return <Lab/>; }
