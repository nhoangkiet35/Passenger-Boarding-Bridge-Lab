import { cabinFrame, DOCKING, metrics, passengerAccess, type State } from '@/lib/simulation';
import { standClearances, standLayout } from '@/lib/standLayout';
import { Grid, Html, Line, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { FixedBridge, ServiceRoad, VDGS } from './Infrastructure';
import { Aircraft, Box, PBB } from './Models';
function Camera({view,reset}:{view:string;reset:number}){const controls=useRef<any>(null);const {camera,size}=useThree();const transition=useRef(0);const dest=useRef(new Vector3());const aim=useRef(new Vector3());
 useEffect(()=>{dest.current.fromArray(view==='cabin'?[-3,10,-10]:view==='top'?[0,40,1]:[-30,27,30]);if(view!=='cabin'&&size.width/size.height<1.3)dest.current.multiplyScalar(1.35);aim.current.fromArray(view==='cabin'?[4,4,0]:[0,2,5]);transition.current=1;},[view,reset,size.width,size.height]);
 useFrame((_,dt)=>{if(transition.current&&controls.current){camera.position.lerp(dest.current,Math.min(1,dt*5));controls.current.target.lerp(aim.current,Math.min(1,dt*5));controls.current.update();if(camera.position.distanceTo(dest.current)<.02)transition.current=0;}});
 return <OrbitControls ref={controls} makeDefault minDistance={5} maxDistance={65} maxPolarAngle={Math.PI/2-.04} onStart={()=>transition.current=0}/>;
}
export default function Scene({s,labels,view,reset}:{s:State;labels:boolean;view:string;reset:number}){
 const [lost,setLost]=useState(false);return <><Canvas shadows dpr={[1,1.7]} camera={{position:[-30,27,30],fov:43}} onCreated={({gl})=>{gl.domElement.addEventListener('webglcontextlost',()=>setLost(true));gl.domElement.addEventListener('webglcontextrestored',()=>setLost(false));}}>
  <World s={s} labels={labels}/><Camera view={view} reset={reset}/>
 </Canvas>{lost&&<div className="webgl-error">Kết nối đồ họa bị gián đoạn. Hãy tải lại trang để khôi phục cảnh 3D.</div>}</>;
}



export function World({s,labels=false,cctv=false}:{s:State;labels?:boolean;cctv?:boolean}){return <>
  <color attach="background" args={['#dce7ed']}/><fog attach="fog" args={['#dce7ed',55,115]}/>
  <ambientLight intensity={1.4}/><hemisphereLight args={['#eaf9ff','#738b97',1]}/><directionalLight position={[-10,28,-15]} intensity={2.6} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-35} shadow-camera-right={35} shadow-camera-top={35} shadow-camera-bottom={-35} shadow-normalBias={.03}/>
  <Box at={[0,-.21,0]} size={[130,.4,130]} color="#adbec8"/>
  <Grid position={[0,.004,0]} args={[100,100]} cellSize={4} cellThickness={.45} cellColor="#a5b7c3" sectionSize={20} sectionColor="#9badb9" sectionThickness={.65} fadeDistance={85}/>
  <Box at={[0,4,standLayout.terminalFaceZ-5.5]} size={[70,8,11]} color="#b4c9d7"/>
  <Box at={[0,4.9,standLayout.terminalFaceZ+.05]} size={[70,4,.08]} color="#416576"/>
  {Array.from({length:36},(_,i)=><Box key={i} at={[-34+i*1.94,4.9,standLayout.terminalFaceZ+.15]} size={[.08,4.3,.15]} color="#95b4c5"/>)}
  <Box at={[0,8.2,standLayout.terminalFaceZ-5.5]} size={[71,.3,11.6]} color="#e2edf2"/>
  <Box at={[-12,4.3,standLayout.terminalFaceZ+.22]} size={[2.7,2.4,.1]} color="#a6c7d2"/>
  {!cctv&&<Html position={[-5,7.2,standLayout.terminalFaceZ+.5]} center zIndexRange={[10,0]}><span className="terminal-label">NHÀ GA · TẦNG 1 · A04</span></Html>}
  <Line points={[[7,.025,standLayout.roadCenterZ+standLayout.roadWidth/2+.8],[7,.025,40]]} color="#e8bc45" lineWidth={3}/>
  <Line points={[[3,.027,-9],[11,.027,-9]]} color="#e8bc45" lineWidth={3}/>
  <Line points={[[-11,.03,-8],[2.5,.03,-8],[2.5,.03,7],[-11,.03,7],[-11,.03,-8]]} color="#f2dfb2" lineWidth={2} dashed dashSize={.55} gapSize={.4}/>
  <Line points={[[4.6,.035,-3],[4.6,.035,3]]} color={metrics(s.pose).gap<.65?'#e35240':'#dc846a'} lineWidth={6}/>
  {!cctv&&metrics(s.pose).clearance<.65&&<mesh position={[4.6,2.6,0]}><boxGeometry args={[.12,5.2,5]}/><meshBasicMaterial color="#ff654f" transparent opacity={.15} depthWrite={false}/></mesh>}
  {!cctv&&labels&&<>
   <Line points={[[13,.05,standLayout.aircraftNoseZ],[13,.05,standLayout.roadCenterZ+standLayout.roadWidth/2]]} color="#59a1b7" lineWidth={2}/>
   {[standLayout.aircraftNoseZ,standLayout.roadCenterZ+standLayout.roadWidth/2].map(z=><Line key={z} points={[[12.6,.05,z],[13.4,.05,z]]} color="#59a1b7" lineWidth={2}/>)}
   <Html position={[13,.6,(standLayout.aircraftNoseZ+standLayout.roadCenterZ+standLayout.roadWidth/2)/2]} center><span className="part-label">Khoảng cách: {standClearances.noseToRoad.toFixed(1)} m</span></Html>
  </>}
  <ServiceRoad show={!cctv&&labels}/>
  <FixedBridge show={!cctv&&labels}/><VDGS show={!cctv&&labels} connected={passengerAccess(s)}/>
  <Aircraft labels={labels} annotations={!cctv} doorOpen={passengerAccess(s)} halted={s.emergency}/><PBB pose={s.pose} labels={labels} annotations={!cctv} highlight={!cctv} aux={s.power?s.aux:{interior:false,exterior:false,aircon:false,ventilation:false}}/>
  {!cctv&&<PassengerFlow active={passengerAccess(s)} pose={s.pose}/>}

</>;}

function PassengerFlow({active,pose}:{active:boolean;pose:State['pose']}) {
 const people=useRef<Array<any>>([]), openingTime=useRef(0);
 useFrame(({clock},dt)=>{openingTime.current=active?openingTime.current+dt:0;people.current.forEach((person,i)=>{if(!person)return;const t=(clock.elapsedTime*.075+i*.19)%1;const frame=cabinFrame(pose),cabinX=frame.x,deckY=pose.height;const passage=(x:number)=>[cabinX+x*Math.cos(frame.heading)-DOCKING.cabinPassageOffset*Math.sin(frame.heading),deckY,frame.z+x*Math.sin(frame.heading)+DOCKING.cabinPassageOffset*Math.cos(frame.heading)];const route=[[5.05,3.4,0],passage(1),passage(.1),passage(-.9),[standLayout.rotundaX,3.0,standLayout.rotundaZ],[-12,3.0,standLayout.terminalFaceZ+.3],[-12,3.0,standLayout.terminalFaceZ-2]];const q=t*(route.length-1),k=Math.min(route.length-2,Math.floor(q)),u=q-k;person.position.set(route[k][0]+(route[k+1][0]-route[k][0])*u,route[k][1]+(route[k+1][1]-route[k][1])*u,route[k][2]+(route[k+1][2]-route[k][2])*u);person.visible=active&&openingTime.current>1.4&&t<.96;person.rotation.y= t<.3?Math.PI:0;});});
 return <group>{Array.from({length:6},(_,i)=><group key={i} ref={el=>{people.current[i]=el;}} visible={false}><mesh position={[0,.38,0]} castShadow><capsuleGeometry args={[.18,.62,4,8]}/><meshStandardMaterial color={['#df805b','#557d9a','#ddbd67','#7e729b','#5c9a85','#cf7181'][i]}/></mesh><mesh position={[0,.88,0]} castShadow><sphereGeometry args={[.16,12,10]}/><meshStandardMaterial color="#e5b99a"/></mesh></group>)}</group>;
}
