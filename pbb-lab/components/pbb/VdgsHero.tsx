'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import type Hls from 'hls.js';

const VIDEO_URL = 'https://d105emv5h26k8d.cloudfront.net/elevator/segment/fc3520f646b74672aa988f06479ba078/hls/1700213255753/fc3520f646b74672aa988f06479ba078.m3u8';
const IMAGE_URL = '/images/vdgs-equipment-primary.png';
export default function VdgsHero() {
 const videoRef=useRef<HTMLVideoElement>(null);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{
  const video=videoRef.current;if(!video)return;
  let player:Hls|undefined,cancelled=false;
  video.autoplay=true;video.muted=true;video.defaultMuted=true;video.playsInline=true;
  const play=()=>{if(!cancelled)void video.play().catch(()=>{});};
  video.addEventListener('canplay',play);
  const nativeError=()=>setFailed(true);
  video.addEventListener('error',nativeError);
  if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=VIDEO_URL;video.addEventListener('loadedmetadata',play);}
  else void import('hls.js').then(({default:Hls})=>{
   if(cancelled)return;
   if(!Hls.isSupported()){setFailed(true);return;}
   player=new Hls({capLevelToPlayerSize:true,maxBufferLength:20});
   player.on(Hls.Events.MANIFEST_PARSED,play);
   player.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal)setFailed(true);});
   player.loadSource(VIDEO_URL);player.attachMedia(video);
  }).catch(()=>{if(!cancelled)setFailed(true);});
  return()=>{cancelled=true;video.removeEventListener('canplay',play);video.removeEventListener('error',nativeError);video.removeEventListener('loadedmetadata',play);player?.destroy();video.pause();video.removeAttribute('src');video.load();};
 },[]);
 return <>
  <section className="vdgs-hero" aria-labelledby="vdgs-hero-title">
   <video ref={videoRef} className="canto-video canto-inline canto-autoplay vdgs-hero-video" data-video-id={VIDEO_URL} data-autoplay="true" data-controls="false" preload="auto" width="100%" height="100%" autoPlay loop playsInline muted poster={IMAGE_URL} aria-hidden="true" controls={false}>
    <track kind="captions" src="https://airportsolutions.tkelevator.com/media/multimedia/video_captions/default_captions.vtt" srcLang="en" label="Default Captions"/>
   </video>
   <div className="vdgs-hero-shade"/>
   <div className="vdgs-hero-copy"><span className="vdgs-hero-eyebrow">PBB LAB / AIRSIDE EXPERIENCE</span><h1 id="vdgs-hero-title">Mô phỏng <span>VDGS</span></h1><p>Từ tín hiệu dẫn hướng đến điểm dừng chính xác. Khám phá cách tàu bay tiếp cận vị trí đỗ qua mô phỏng 3D trực quan.</p><a className="vdgs-hero-cta" href="#vdgs-simulator">Trải nghiệm mô phỏng <ArrowDown size={17}/></a></div>
   <span className="vdgs-hero-credit">VIDEO · TK ELEVATOR AIRPORT SOLUTIONS</span>
   {failed&&<a className="vdgs-hero-fallback" href="https://airportsolutions.tkelevator.com/global-en/products/digital-solutions/max-monitor-and-control/" target="_blank" rel="noopener noreferrer">Xem video tại TK Elevator <ArrowUpRight size={14}/></a>}
  </section>
  <figure className="vdgs-feature-image vdgs-feature-image-only"><img src="/images/vdgs-equipment-primary.png" alt="Sơ đồ kết nối thiết bị sân bay với các chi tiết màu xanh primary của PBB Lab" loading="lazy" width={1330} height={1183}/><figcaption className="vdgs-compliance"><span className="vdgs-kicker">TK ELEVATOR · A-VDGS</span><h2>Tuân thủ Phụ ước 14 của ICAO và EASA CD ADR-DSN.M.760</h2><blockquote lang="vi"><p>Hệ thống hướng dẫn đỗ tàu bay bằng tín hiệu trực quan (VDGS) là thiết bị an toàn quan trọng tại vị trí đỗ, đáp ứng các yêu cầu cao về độ chính xác, tính an toàn và độ tin cậy. Giải pháp dẫn đỗ của TK Elevator tuân thủ các mục 5.3.25 và 5.3.26 thuộc Phụ ước 14 của Tổ chức Hàng không Dân dụng Quốc tế (ICAO), cũng như EASA CD ADR-DSN.M.760.</p></blockquote><a href="https://airportsolutions.tkelevator.com/global-en/products/advanced-visual-docking-guidance-systems-a-vdgs/" target="_blank" rel="noopener noreferrer">Thông tin sản phẩm từ TK Elevator <ArrowUpRight size={15}/></a></figcaption></figure>
 </>;
}
