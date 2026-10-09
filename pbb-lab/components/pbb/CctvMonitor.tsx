import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useState, type ReactNode } from 'react';
import { Video, VideoOff } from 'lucide-react';
import { aligned, apronView, cabinView, cctvView, type Pose, type State } from '@/lib/simulation';
import { World } from './Scene';
function MonitorCamera({ pose, apron }: { pose: Pose; apron: boolean }) {
  const { camera } = useThree();
  useFrame(() => {
    const view = apron ? apronView(pose) : cabinView(pose);
    camera.position.set(...view.position);
    camera.up.set(0, 1, 0);
    camera.lookAt(...view.target);
  });
  return null;
}
class VideoBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="cctv-off"><VideoOff/><b>CCTV không khả dụng</b><span>WebGL không khởi tạo được. Hãy tải lại trang.</span></div> : this.props.children; }
}
export default function CctvMonitor({ s }: { s: State }) {
  const [lost, setLost] = useState(false);
  const [selected, setSelected] = useState<'apron' | 'cabin' | null>(null);
  const apron = cctvView(s, selected) === 'apron', ready = aligned(s.pose);
  return <div className="monitor-frame">
    <div className="monitor-top"><span><Video size={14}/> CCTV / {apron ? 'APRON · TUNNEL A' : 'CABIN FRONT'}</span><span className={s.power?'video-live':'video-standby'}>{s.power?'● LIVE 3D':'○ STANDBY'}</span></div>
    <div className="cctv-source-controls" role="group" aria-label="Chọn camera CCTV"><button type="button" aria-pressed={apron} onClick={()=>setSelected('apron')}>Sân đỗ · Ống A</button><button type="button" aria-pressed={!apron} disabled={!s.area} onClick={()=>setSelected('cabin')}>Cửa tàu bay · Cabin</button><button type="button" aria-pressed={selected===null} onClick={()=>setSelected(null)}>Tự chuyển</button></div>
    <div className={'cctv-screen '+(s.emergency?'cctv-emergency':'')} role="region" aria-label={apron ? 'CCTV quan sát sân đỗ dưới ống A' : 'CCTV trực tiếp từ cabin'}>
      <VideoBoundary><Canvas dpr={[1,1.25]} camera={{ fov: apron ? 95 : 100, near: .03, far: 150 }} frameloop={s.power?'always':'demand'}
        onCreated={({gl})=>{gl.domElement.addEventListener('webglcontextlost',()=>setLost(true));gl.domElement.addEventListener('webglcontextrestored',()=>setLost(false));}}>
        <World s={s} cctv/><MonitorCamera pose={s.pose} apron={apron}/>
      </Canvas></VideoBoundary>
      {s.power&&!lost&&<><div className="cctv-camera-id">{apron ? 'CAM 02' : 'CAM 01'} <span>{apron ? 'DƯỚI ỐNG A · SÁT ROTUNDA' : 'TRONG CABIN · SAU KÍNH'}</span></div>
        {!apron&&<><div className={'cctv-reticle '+(ready?'aligned':'')} aria-hidden="true"><i/><i/><i/><i/><span>+</span></div><div className="cctv-attitude">CAB {s.pose.cabYaw.toFixed(1)}°<br/>SÀN {s.pose.floorTilt.toFixed(1)}°</div><div className="cctv-floor-guide" aria-hidden="true"><span>TRỤC CAMERA</span></div></>}
        <div className={'cctv-caption '+(s.emergency?'alarm':'')}>{s.emergency?'DỪNG KHẨN CẤP • CAMERA VẪN HOẠT ĐỘNG':apron ? (s.area ? 'QUAN SÁT SÂN ĐỖ · THANG · BÁNH XE · TRỤ NÂNG' : 'KIỂM TRA NGƯỜI & VẬT CẢN TRƯỚC KHI DI CHUYỂN') : s.pose.canopy===1?'CANOPY ĐÃ TRIỂN KHAI':ready?'CABIN ĐÃ CĂN CHỈNH':s.paused?'MÔ PHỎNG TẠM DỪNG':'QUAN SÁT CỬA & MÉP SÀN'}</div></>}
      {(!s.power||lost)&&<div className="cctv-off"><VideoOff size={32}/><b>{lost?'MẤT TÍN HIỆU WEBGL':'CAMERA CHƯA CẤP NGUỒN'}</b><span>{lost?'Tải lại trang để kết nối camera.':'Bật POWER ON để xem hình trực tiếp.'}</span></div>}
    </div>
    <div className="monitor-foot"><span>{apron ? 'Dưới ống A sát rotunda · xoay theo cầu' : 'Góc rộng trong cabin · bảng điều khiển, cửa & sàn'}</span><span className={(apron?s.area:ready)?'ready':''}>{apron ? (s.area ? 'ĐÃ XÁC NHẬN' : 'CHƯA KIỂM TRA') : ready?'ALIGNED':'ALIGNMENT'}</span></div>
  </div>;
}
