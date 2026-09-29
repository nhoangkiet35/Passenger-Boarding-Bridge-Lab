import { Canvas,useThree,useFrame } from '@react-three/fiber';
import { OrbitControls,Grid,Line,Html } from '@react-three/drei';
import { useEffect,useRef,useState } from 'react';
import { Vector3 } from 'three';
import { Aircraft,Box,PBB } from './Models';
import { metrics,type State } from '@/lib/simulation';
function Camera({view,reset}:{view:string;reset:number}){const controls=useRef<any>(null);const {camera,size}=useThree();const transition=useRef(0);const dest=useRef(new Vector3());const aim=useRef(new Vector3());
 useEffect(()=>{dest.current.fromArray(view==='cabin'?[-3,10,-10]:view==='top'?[0,40,1]:[-12,25,30]);if(view!=='cabin'&&size.width/size.height<1.3)dest.current.multiplyScalar(1.35);aim.current.fromArray(view==='cabin'?[4,4,0]:[0,2,5]);transition.current=1;},[view,reset,size.width,size.height]);
 useFrame((_,dt)=>{if(transition.current&&controls.current){camera.position.lerp(dest.current,Math.min(1,dt*5));controls.current.target.lerp(aim.current,Math.min(1,dt*5));controls.current.update();if(camera.position.distanceTo(dest.current)<.02)transition.current=0;}});
 return <OrbitControls ref={controls} makeDefault minDistance={5} maxDistance={65} maxPolarAngle={Math.PI/2-.04} onStart={()=>transition.current=0}/>;
}
export default function Scene({s,labels,view,reset}:{s:State;labels:boolean;view:string;reset:number}){
 const [lost,setLost]=useState(false);return <><Canvas shadows dpr={[1,1.7]} camera={{position:[-24,23,30],fov:43}} onCreated={({gl})=>{gl.domElement.addEventListener('webglcontextlost',()=>setLost(true));gl.domElement.addEventListener('webglcontextrestored',()=>setLost(false));}}>
  <color attach="background" args={['#dce7ed']}/><fog attach="fog" args={['#dce7ed',55,115]}/>
  <ambientLight intensity={1.4}/><hemisphereLight args={['#eaf9ff','#738b97',1]}/><directionalLight position={[-10,28,-15]} intensity={2.6} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-35} shadow-camera-right={35} shadow-camera-top={35} shadow-camera-bottom={-35} shadow-normalBias={.03}/>
  <Box at={[0,-.21,0]} size={[130,.4,130]} color="#adbec8"/>
  <Grid position={[0,.004,0]} args={[100,100]} cellSize={4} cellThickness={.45} cellColor="#a5b7c3" sectionSize={20} sectionColor="#9badb9" sectionThickness={.65} fadeDistance={85}/>
  <Box at={[-19,4,0]} size={[11,8,35]} color="#b4c9d7"/>
  <Box at={[-13.45,4.9,0]} size={[.08,4,34]} color="#416576"/>
  {Array.from({length:18},(_,i)=><Box key={i} at={[-13.3,4.9,-16.5+i*1.94]} size={[.15,4.3,.09]} color="#95b4c5"/>)}
  <Box at={[-19,8.2,0]} size={[11.6,.3,35.5]} color="#e2edf2"/>
  <Html position={[-13.1,7.1,7]} center zIndexRange={[10,0]}><span className="terminal-label">NHÀ GA · A04</span></Html>
  <Line points={[[7,.025,-25],[7,.025,26]]} color="#e8bc45" lineWidth={3}/>
  <Line points={[[3,.027,-9],[11,.027,-9]]} color="#e8bc45" lineWidth={3}/>
  <Line points={[[-11,.03,-8],[2.5,.03,-8],[2.5,.03,7],[-11,.03,7],[-11,.03,-8]]} color="#f2dfb2" lineWidth={2} dashed dashSize={.55} gapSize={.4}/>
  <Line points={[[4.6,.035,-3],[4.6,.035,3]]} color={metrics(s.pose).gap<.65?'#e35240':'#dc846a'} lineWidth={6}/>
  {metrics(s.pose).gap<.65&&<mesh position={[4.6,2.6,0]}><boxGeometry args={[.12,5.2,5]}/><meshBasicMaterial color="#ff654f" transparent opacity={.15} depthWrite={false}/></mesh>}
  <Aircraft labels={labels}/><PBB pose={s.pose} labels={labels}/><Camera view={view} reset={reset}/>
 </Canvas>{lost&&<div className="webgl-error">Kết nối đồ họa bị gián đoạn. Hãy tải lại trang để khôi phục cảnh 3D.</div>}</>;
}


