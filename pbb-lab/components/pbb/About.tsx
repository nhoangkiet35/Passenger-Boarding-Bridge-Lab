'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import {animate} from 'motion';
import {ArrowDown,ArrowRight,ArrowUpRight,Compass,Layers,ShieldCheck,MoveUpRight} from 'lucide-react';
import SiteShell from './SiteShell';
import AboutBridge from './AboutBridge';
import LongThanhLibrary,{AirportSlideshow} from './LongThanhMedia';
import {about} from '@/lib/aboutContent';
import './about.css';
function Reveal({children,className=''}:{children:ReactNode;className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const node=ref.current;if(!node||!('IntersectionObserver'in window))return;const media=window.matchMedia('(prefers-reduced-motion: reduce)');if(media.matches)return;const observer=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;observer.disconnect();if(!media.matches)animate(node,{opacity:[.4,1],y:[20,0]},{duration:.65,ease:'easeOut'});},{threshold:.1});observer.observe(node);return()=>observer.disconnect();},[]);
 return <div ref={ref} className={className}>{children}</div>;
}
const featureIcons=[Compass,MoveUpRight,Layers,ShieldCheck];
export default function About(){return <SiteShell page="about"><main className="about-page" id="about-content" tabIndex={-1}>
 <section className="a-hero" aria-labelledby="a-title">
  <img className="a-hero-image" src={about.hero.image} width="1672" height="941" alt="Minh họa AI: nhà ga, tàu bay và cầu hành khách dưới ánh hoàng hôn" fetchPriority="high"/>
  <div className="a-hero-shade"/>
  <div className="a-wrap a-hero-content"><span className="a-overline a-enter">PBB LAB / ABOUT</span><h1 id="a-title" className="a-enter">{about.hero.title[0]}<br/>{about.hero.title[1]}<br/><em>{about.hero.title[2]}</em></h1><p className="a-enter">{about.hero.description}</p><div className="a-actions a-enter"><a href="/" className="a-button">Khám phá mô phỏng <ArrowUpRight size={18}/></a><a href="#shinmaywa" className="a-text-link">Tìm hiểu công nghệ <ArrowDown size={17}/></a></div></div>
  <div className="a-hero-side" aria-hidden="true"><span>NHÀ GA</span><i/><span>CẦU HÀNH KHÁCH</span><i/><span>TÀU BAY</span></div>
  <div className="a-hero-foot a-wrap"><a href="#long-thanh"><ArrowDown size={17}/> KHÁM PHÁ ĐIỂM KẾT NỐI</a><small>{about.hero.caption}</small></div>
 </section>
 <nav className="a-route a-wrap" aria-label="Các phần trong trang"><a href="#long-thanh"><span>01</span> Bối cảnh Long Thành <ArrowRight size={15}/></a><a href="#thu-vien-long-thanh"><span>↗</span> Thư viện bài viết <ArrowRight size={15}/></a><a href="#shinmaywa"><span>02</span> Công nghệ cầu hành khách <ArrowRight size={15}/></a><a href="#pbb-lab"><span>03</span> Trải nghiệm PBB Lab <ArrowRight size={15}/></a></nav>
 <section className="a-section a-airport a-wrap" id="long-thanh" aria-labelledby="a-airport-title">
  <Reveal className="a-section-top"><span className="a-overline">01 / LONG THÀNH</span><span className="a-section-label">BỐI CẢNH CỦA NHỮNG KẾT NỐI</span></Reveal>
  <Reveal className="a-intro-grid"><h2 id="a-airport-title">Một cửa ngõ lớn.<br/><em>Những kết nối cụ thể.</em></h2><p>{about.airport.intro}</p></Reveal>
  <Reveal><AirportSlideshow/></Reveal>
  <div className="a-airport-story">{about.airport.chapters.map(([label,title,text],i)=><Reveal key={label}><article><span className="a-story-label">0{i+1} / {label}</span><h3>{title}</h3><p>{text}</p></article></Reveal>)}</div>
 </section>
 <LongThanhLibrary/>
 <section className="a-tech a-section" id="shinmaywa" aria-labelledby="a-tech-title"><div className="a-wrap">
  <Reveal className="a-section-top"><span className="a-overline">02 / CÔNG NGHỆ TẠI ĐIỂM KẾT NỐI</span><span className="a-section-label">CẤU TẠO → CHUYỂN ĐỘNG → CĂN CHỈNH</span></Reveal>
  <Reveal className="a-intro-grid"><h2 id="a-tech-title">ShinMaywa<br/><em>Passenger Boarding Bridge.</em></h2><div><p>{about.technology.intro}</p><a className="a-source" href={about.technology.source} target="_blank" rel="noopener noreferrer">Tìm hiểu PAXWAY tại ShinMaywa <ArrowUpRight size={15}/></a></div></Reveal>
  <Reveal><AboutBridge/></Reveal><p className="a-technical-note">{about.technology.note}</p>
 </div></section>
 <section className="a-section a-learning a-wrap" id="pbb-lab" aria-labelledby="a-lab-title">
  <Reveal className="a-section-top"><span className="a-overline">03 / TRẢI NGHIỆM PBB LAB</span><span className="a-section-label">KHÁM PHÁ · QUAN SÁT · THỰC HÀNH</span></Reveal>
  <Reveal className="a-intro-grid"><h2 id="a-lab-title">Biến kiến thức<br/><em>thành trải nghiệm.</em></h2><p>{about.learning.intro}</p></Reveal>
  <Reveal className="a-lab-visual"><div className="a-lab-visual-head"><span><i/> PBB LAB / KHÔNG GIAN MÔ PHỎNG</span><span>3D · TƯƠNG TÁC</span></div><div className="a-lab-visual-body"><figure className="a-lab-screenshot"><a href="/" aria-label="Mở mô phỏng cầu hành khách"><img src="/images/about-simulator.jpg" width="1520" height="722" loading="lazy" alt="Ảnh chụp PBB Lab: mô hình 3D cầu hành khách, nhà ga và tàu bay"/></a><figcaption>ẢNH CHỤP TỪ PBB LAB · MÔ HÌNH MINH HỌA</figcaption></figure><div><span className="a-overline">TỪ GÓC NHÌN ĐẾN THAO TÁC</span><h3>Hiểu điều đang diễn ra.<br/>Không chỉ nhìn chuyển động.</h3><p>Quan sát cầu trong không gian 3D, thử điều khiển và đọc phản hồi của mô phỏng.</p><a className="a-button" href="/">Mở mô phỏng PBB <ArrowUpRight size={17}/></a></div></div><div className="a-lab-tags"><span>GÓC NHÌN 3D</span><span>BÀN ĐIỀU KHIỂN</span><span>CCTV MÔ PHỎNG</span><span>CHU TRÌNH HƯỚNG DẪN</span></div></Reveal>
  <div className="a-features">{about.learning.features.map(([title,text],i)=>{const Icon=featureIcons[i];return <Reveal key={title}><article><span className="a-feature-number">0{i+1}</span><Icon size={24} strokeWidth={1.3}/><h3>{title}</h3><p>{text}</p></article></Reveal>;})}</div>
  <Reveal className="a-scope"><ShieldCheck size={24}/><p>{about.learning.scope}</p></Reveal>
 </section>
 <section className="a-philosophy a-section"><div className="a-wrap"><Reveal className="a-section-top"><span className="a-overline">04 / TRIẾT LÝ XÂY DỰNG</span><span className="a-section-label">CÁCH CHÚNG TÔI TIẾP CẬN</span></Reveal><Reveal><h2>Dễ tiếp cận.<br/><em>Rõ căn cứ. Hiểu giới hạn.</em></h2></Reveal><div className="a-principles">{about.philosophy.map(([title,text],i)=><Reveal key={title}><article><span>0{i+1}</span><h3>{title}</h3><p>{text}</p></article></Reveal>)}</div></div></section>
 <section className="a-closing"><div className="a-wrap"><Reveal><span className="a-overline">HÀNH TRÌNH TIẾP THEO / CỦA BẠN</span><h2>Bước vào<br/><em>không gian vận hành.</em></h2><p>{about.closing}</p><div className="a-actions"><a href="/" className="a-button">Khám phá mô phỏng <ArrowUpRight size={18}/></a><a href="/#operator-console" className="a-text-link">Đến bàn điều khiển <ArrowRight size={17}/></a></div></Reveal><div className="a-closing-note"><p>{about.disclaimer}</p><p>Không đại diện cho ACV, Cảng HKQT Long Thành hoặc ShinMaywa.</p></div></div></section>
 </main></SiteShell>;}
