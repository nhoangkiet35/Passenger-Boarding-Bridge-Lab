import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'PBB Lab · Mô phỏng cầu ống lồng',description:'Khám phá cấu tạo, chuyển động và trình tự tiếp cận, tách cầu ống lồng hành khách trong không gian 3D.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="vi"><body>{children}</body></html>;}
