import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useState, type ReactNode } from 'react';
import { Video, VideoOff } from 'lucide-react';
import { aligned, cabinView, metrics, type Pose, type State } from '@/lib/simulation';
import { World } from './Scene';
function CabinCamera({ pose }: { pose: Pose }) {
  const { camera } = useThree();
  useFrame(() => {
    const view = cabinView(pose);
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
  const m = metrics(s.pose), ready = aligned(s.pose);
  return <div className="monitor-frame">
    <div className="monitor-top"><span><Video size={14}/> CCTV / CABIN FRONT</span><span className={s.power?'video-live':'video-standby'}>{s.power?'● LIVE 3D':'○ STANDBY'}</span></div>
    <div className={'cctv-screen '+(s.emergency?'cctv-emergency':'')} role="region" aria-label="CCTV trực tiếp từ cabin">
      <VideoBoundary><Canvas dpr={[1,1.25]} camera={{ fov: 70, near: .03, far: 150 }} frameloop={s.power?'always':'demand'}
        onCreated={({gl})=>{gl.domElement.addEventListener('webglcontextlost',()=>setLost(true));gl.domElement.addEventListener('webglcontextrestored',()=>setLost(false));}}>
        <World s={s} cctv/><CabinCamera pose={s.pose}/>
      </Canvas></VideoBoundary>
      {s.power&&!lost&&<><div className="cctv-camera-id">CAM 01 <span>GẮN CỐ ĐỊNH TRÊN CABIN</span></div>
        <div className={'cctv-reticle '+(ready?'aligned':'')} aria-hidden="true"><i/><i/><i/><i/><span>+</span></div>
        <div className="cctv-attitude">CAB {s.pose.cabYaw.toFixed(1)}°<br/>SÀN {s.pose.floorTilt.toFixed(1)}°</div>
        <div className="cctv-floor-guide" aria-hidden="true"><span>TRỤC CAMERA</span></div>
        <div className={'cctv-caption '+(s.emergency?'alarm':'')}>{s.emergency?'DỪNG KHẨN CẤP • CAMERA VẪN HOẠT ĐỘNG':s.pose.canopy===1?'CANOPY ĐÃ TRIỂN KHAI':ready?'CABIN ĐÃ CĂN CHỈNH':s.paused?'MÔ PHỎNG TẠM DỪNG':'QUAN SÁT CỬA & MÉP SÀN'}</div></>}
      {(!s.power||lost)&&<div className="cctv-off"><VideoOff size={32}/><b>{lost?'MẤT TÍN HIỆU WEBGL':'CAMERA CHƯA CẤP NGUỒN'}</b><span>{lost?'Tải lại trang để kết nối camera.':'Bật POWER ON để xem hình trực tiếp.'}</span></div>}
    </div>
    <div className="monitor-foot"><span>Góc nhìn từ bên trong cabin · không tự bám cửa</span><span className={ready?'ready':''}>{ready?'ALIGNED':'ALIGNMENT'}</span></div>
  </div>;
}
