"use client";
import dynamic from 'next/dynamic';
import PageSkeleton from '@/components/pbb/PageSkeleton';
const Lab = dynamic(() => import('@/components/pbb/Lab'), { ssr: false, loading: () => <PageSkeleton/> });
export default function Home(){ return <Lab/>; }
