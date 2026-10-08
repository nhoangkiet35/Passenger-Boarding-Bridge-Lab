import { cabinFrame, passengerAccess, metrics, type State } from '@/lib/simulation';
import { Grid, Html, Line, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { FixedBridge, VDGS, ServiceRoad } from './Infrastructure';
import { Aircraft, Box, PBB } from './Models';
function Camera({view,reset}:{view:string;reset:number}){const controls=useRef<any>(null);const {camera,size}=useThree();const transition=useRef(0);const dest=useRef(new Vector3());const aim=useRef(new Vector3());
 useEffect(()=>{dest.current.fromArray(view==='cabin'?[-3,10,-10]:view==='top'?[0,40,1]:[-12,25,-30]);if(view!=='cabin'&&size.width/size.height<1.3)dest.current.multiplyScalar(1.35);aim.current.fromArray(view==='cabin'?[4,4,0]:[0,2,5]);transition.current=1;},[view,reset,size.width,size.height]);
 useFrame((_,dt)=>{if(transition.current&&controls.current){camera.position.lerp(dest.current,Math.min(1,dt*5));controls.current.target.lerp(aim.current,Math.min(1,dt*5));controls.current.update();if(camera.position.distanceTo(dest.current)<.02)transition.current=0;}});
 return <OrbitControls ref={controls} makeDefault minDistance={5} maxDistance={65} maxPolarAngle={Math.PI/2-.04} onStart={()=>transition.current=0}/>;
}
export default function Scene({s,labels,view,reset}:{s:State;labels:boolean;view:string;reset:number}){
 const [lost,setLost]=useState(false);return <><Canvas shadows dpr={[1,1.7]} camera={{position:[-24,23,-30],fov:43}} onCreated={({gl})=>{gl.domElement.addEventListener('webglcontextlost',()=>setLost(true));gl.domElement.addEventListener('webglcontextrestored',()=>setLost(false));}}>
  <World s={s} labels={labels}/><Camera view={view} reset={reset}/>
 </Canvas>{lost&&<div className="webgl-error">Kết nối đồ họa bị gián đoạn. Hãy tải lại trang để khôi phục cảnh 3D.</div>}</>;
}



export function World({s,labels=false,cctv=false}:{s:State;labels?:boolean;cctv?:boolean}){return <>
  <color attach="background" args={['#dce7ed']}/><fog attach="fog" args={['#dce7ed',55,115]}/>
  <ambientLight intensity={1.4}/><hemisphereLight args={['#eaf9ff','#738b97',1]}/><directionalLight position={[-10,28,-15]} intensity={2.6} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-35} shadow-camera-right={35} shadow-camera-top={35} shadow-camera-bottom={-35} shadow-normalBias={.03}/>
  <Box at={[0,-.21,0]} size={[130,.4,130]} color="#adbec8"/>
  <Grid position={[0,.004,0]} args={[100,100]} cellSize={4} cellThickness={.45} cellColor="#a5b7c3" sectionSize={20} sectionColor="#9badb9" sectionThickness={.65} fadeDistance={85}/>
  <Box at={[-23,4,0]} size={[11,8,35]} color="#b4c9d7"/>
  {[-1,1].map(side=><Box key={side} at={[-17.45,4.9,side*9.2]} size={[.08,4,15.6]} color="#416576"/>)}
  <Box at={[-17.45,6.4,0]} size={[.08,1,2.8]} color="#416576"/>
  <Box at={[-17.45,2.8,0]} size={[.08,.4,2.8]} color="#416576"/>
  {Array.from({length:18},(_,i)=>{const z=-16.5+i*1.94;return Math.abs(z)>1.4?<Box key={i} at={[-17.3,4.9,z]} size={[.15,4.3,.09]} color="#95b4c5"/>:null;})}
  <Box at={[-23,8.2,0]} size={[11.6,.3,35.5]} color="#e2edf2"/>
  {!cctv&&<Html position={[-17.1,7.1,7]} center zIndexRange={[10,0]}><span className="terminal-label">NHÀ GA · A04</span></Html>}
  <Line points={[[7,.025,-25],[7,.025,26]]} color="#e8bc45" lineWidth={3}/>
  <Line points={[[3,.027,-9],[11,.027,-9]]} color="#e8bc45" lineWidth={3}/>
  <Line points={[[-11,.03,-8],[2.5,.03,-8],[2.5,.03,7],[-11,.03,7],[-11,.03,-8]]} color="#f2dfb2" lineWidth={2} dashed dashSize={.55} gapSize={.4}/>
  <Line points={[[4.6,.035,-3],[4.6,.035,3]]} color={metrics(s.pose).gap<.65?'#e35240':'#dc846a'} lineWidth={6}/>
  {!cctv&&metrics(s.pose).clearance<.65&&<mesh position={[4.6,2.6,0]}><boxGeometry args={[.12,5.2,5]}/><meshBasicMaterial color="#ff654f" transparent opacity={.15} depthWrite={false}/></mesh>}
  <ServiceRoad show={!cctv&&labels}/>
  <FixedBridge show={!cctv&&labels}/><VDGS show={!cctv&&labels} connected={passengerAccess(s)}/>
  <Aircraft labels={labels} annotations={!cctv} doorOpen={passengerAccess(s)} halted={s.emergency}/><PBB pose={s.pose} labels={labels} annotations={!cctv} highlight={!cctv} aux={s.power?s.aux:{interior:false,exterior:false,aircon:false,ventilation:false}}/>
  {!cctv&&<PassengerFlow active={passengerAccess(s)} pose={s.pose}/>}

</>;}

function PassengerFlow({active,pose}:{active:boolean;pose:State['pose']}) {
 const people=useRef<Array<any>>([]), openingTime=useRef(0);
 useFrame(({clock},dt)=>{openingTime.current=active?openingTime.current+dt:0;people.current.forEach((person,i)=>{if(!person)return;const t=(clock.elapsedTime*.075+i*.19)%1;const frame=cabinFrame(pose),cabinX=frame.x,deckY=pose.height;const route=[[5.05,3.4,0],[cabinX,deckY,frame.z],[-12,3.12,0],[-17.4,3.12,0],[-19,3.12,0]];const q=t*(route.length-1),k=Math.min(route.length-2,Math.floor(q)),u=q-k;person.position.set(route[k][0]+(route[k+1][0]-route[k][0])*u,route[k][1]+(route[k+1][1]-route[k][1])*u,route[k][2]+(route[k+1][2]-route[k][2])*u);person.visible=active&&openingTime.current>1.4&&t<.96;person.rotation.y= t<.3?Math.PI:0;});});
 return <group>{Array.from({length:6},(_,i)=><group key={i} ref={el=>{people.current[i]=el;}} visible={false}><mesh position={[0,.38,0]} castShadow><capsuleGeometry args={[.18,.62,4,8]}/><meshStandardMaterial color={['#df805b','#557d9a','#ddbd67','#7e729b','#5c9a85','#cf7181'][i]}/></mesh><mesh position={[0,.88,0]} castShadow><sphereGeometry args={[.16,12,10]}/><meshStandardMaterial color="#e5b99a"/></mesh></group>)}</group>;
}
