'use client';
import PageLoader from './PageLoader';
import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { vdgsInitial, vdgsSignal, vdgsTick, type VdgsScenario } from '@/lib/vdgsSimulation';
import SiteShell from './SiteShell';
import VdgsHero from './VdgsHero';
import { VdgsDisplay, VdgsStageGuide } from './VdgsDisplay';
import './vdgs.css';
const Scene=lazy(()=>import('./VdgsScene'));
const Lidar=lazy(()=>import('./VdgsLidar'));
class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<div className="vdgs-scene-message">Không thể mở cảnh 3D. Hãy bật tăng tốc đồ họa rồi tải lại trang.</div>:this.props.children;}}
export default function Vdgs(){
 const [scenario,setScenario]=useState<VdgsScenario>('normal'),[s,setState]=useState(()=>vdgsInitial('normal')),[running,setRunning]=useState(false),[rate,setRate]=useState(1),[ready,setReady]=useState(false);
 const live=useRef(s),signal=vdgsSignal(s),blocked=s.distance===0||s.emergency||s.obstacle;
 useEffect(()=>setReady(true),[]);
 useEffect(()=>{if(!running)return;let frame=0,last=performance.now();const animate=(now:number)=>{const next=vdgsTick(live.current,(now-last)/1000*rate,scenario);last=now;live.current=next;setState(next);if((next.distance===0&&next.stoppedFor>=2)||next.obstacle||next.emergency){setRunning(false);return;}frame=requestAnimationFrame(animate);};frame=requestAnimationFrame(animate);const pause=()=>setRunning(false);window.addEventListener('blur',pause);return()=>{cancelAnimationFrame(frame);window.removeEventListener('blur',pause);};},[running,rate,scenario]);
 const reset=(choice=scenario)=>{setRunning(false);setScenario(choice);live.current=vdgsInitial(choice);setState(live.current);};
 const emergency=()=>{setRunning(false);live.current={...live.current,emergency:true,speed:0};setState(live.current);};
 return <SiteShell page="vdgs"><main id="simulation-content" className="vdgs-page"><VdgsHero/><section id="vdgs-simulator" aria-labelledby="vdgs-simulator-title"><span className="vdgs-kicker">PBB LAB · VISUAL DOCKING GUIDANCE SYSTEM</span><h2 id="vdgs-simulator-title" className="vdgs-simulator-title">Trải nghiệm dẫn tàu bay vào vị trí đỗ</h2><p className="vdgs-intro">Theo dõi tàu bay lăn vào vị trí đỗ từ góc nhìn trực diện cố định. VDGS quét, hướng dẫn căn tim, cảnh báo và ra hiệu STOP.</p>
 <div className="vdgs-toolbar"><label>Tình huống<select value={scenario} onChange={e=>reset(e.target.value as VdgsScenario)}><option value="normal">Tiếp cận bình thường</option><option value="offset">Lệch tim · Căn chỉnh</option><option value="obstacle">Vật cản trong sân đỗ</option></select></label><label>Tốc độ mô phỏng<select value={rate} onChange={e=>setRate(Number(e.target.value))}><option value={1}>1×</option><option value={2}>2×</option></select></label><button onClick={()=>setRunning(!running)} disabled={blocked}>{running?<Pause size={17}/>:<Play size={17}/>} {running?'Tạm dừng':s.elapsed?'Tiếp tục':'Bắt đầu'}</button><button onClick={()=>reset()}><RotateCcw size={17}/>Đặt lại</button><button className="vdgs-emergency" onClick={emergency} disabled={blocked}>Dừng khẩn cấp</button></div>
 <div className="vdgs-workspace"><section className="vdgs-viewport" aria-label="Cảnh 3D tàu bay tiến vào vị trí đỗ"><div className="vdgs-camera-label">CAM 01 · TRỰC DIỆN · GÓC NHÌN CỐ ĐỊNH</div><SceneBoundary>{ready?<Suspense fallback={<PageLoader compact label="Đang tải cảnh 3D"/>}><Scene s={s} running={running}/><Lidar s={s} running={running}/></Suspense>:<PageLoader compact label="Đang tải cảnh 3D"/>}</SceneBoundary></section>
 <aside className="vdgs-panel"><span className="vdgs-panel-label">VDGS · VỊ TRÍ ĐỖ A04</span><VdgsDisplay s={s}/><p className="vdgs-status" role="status" aria-live="polite">{signal.text}</p><dl className="vdgs-metrics"><div><dt>Tốc độ tàu bay</dt><dd>{running?s.speed.toFixed(1):'0.0'} m/s</dd></div><div><dt>Độ lệch tim</dt><dd>{Math.abs(s.offset).toFixed(2)} m</dd></div><div><dt>Quét cảm biến</dt><dd>{running?'Đang quét':blocked?'Đã dừng':'Chờ / tạm dừng'}</dd></div></dl>{s.obstacle&&<button className="vdgs-clear" onClick={()=>{live.current={...live.current,obstacle:false};setState(live.current);}}>Xác nhận đã dọn vật cản</button>}<p className="vdgs-legend">Cửa sổ LiDAR minh họa đám mây điểm quét 3D như video tham chiếu. Mũi tên căn tim hiển thị theo góc nhìn phi công.</p></aside></div>
 <ol className="vdgs-steps">{['Quét & nhận dạng','Theo dõi & căn tim','Giảm tốc','STOP · Dừng tàu bay'].map((text,i)=><li key={text} className={(s.distance===0?3:s.distance<10?2:s.elapsed>=3?1:0)===i?'is-current':''}><span>0{i+1}</span>{text}</li>)}</ol><p className="vdgs-note">Mô phỏng học tập: vùng quét, tốc độ và ngưỡng cảnh báo là giả định minh họa.</p><VdgsStageGuide s={s}/></section></main></SiteShell>;
}
