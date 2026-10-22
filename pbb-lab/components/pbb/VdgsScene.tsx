import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DoubleSide, type Group } from 'three';
import { vdgsSignal, type VdgsState } from '@/lib/vdgsSimulation';
import { Aircraft, Box } from './Models';
import { aircraftHull } from './aircraftGeometry';
function Scan({active}:{active:boolean}) {
 const scan=useRef<Group>(null),phase=useRef(0);
 useFrame((_,dt)=>{if(active)phase.current+=dt;if(scan.current)scan.current.rotation.y=Math.sin(phase.current*1.7)*.18;});
 return <group ref={scan} position={[6,6,-15]} visible={active}><mesh rotation={[Math.PI/2,0,0]} position={[0,-5.95,0]}><circleGeometry args={[88,50,Math.PI/2-.2,.4]}/><meshBasicMaterial color="#34e6d8" transparent opacity={.13} side={DoubleSide} depthWrite={false}/></mesh><Line points={[[0,0,0],[-10,-5.9,85]]} color="#52e9db"/><Line points={[[0,0,0],[10,-5.9,85]]} color="#52e9db"/></group>;
}
export default function VdgsScene({s,running}:{s:VdgsState;running:boolean}) {
 const hull=useMemo(aircraftHull,[]); useEffect(()=>()=>hull.dispose(),[hull]);
 const [lost,setLost]=useState(false),signal=vdgsSignal(s);
 const color=signal.tone==='red'?'#ff5757':signal.tone==='amber'?'#ffc95c':'#65edba';
 return <><Canvas shadows dpr={[1,1.5]} camera={{position:[0,10,-29],fov:55,far:220}} onCreated={({camera,gl})=>{camera.lookAt(0,3,24);gl.domElement.addEventListener('webglcontextlost',()=>setLost(true));gl.domElement.addEventListener('webglcontextrestored',()=>setLost(false));}}>
 <color attach="background" args={['#c9dce7']}/><fog attach="fog" args={['#c9dce7',105,200]}/><ambientLight intensity={1.7}/><hemisphereLight args={['#e9f8ff','#667f8d',1]}/><directionalLight position={[-25,40,-15]} intensity={2.5} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-50} shadow-camera-right={50} shadow-camera-top={100} shadow-camera-bottom={-30}/>
 <Box at={[0,-.22,60]} size={[160,.4,200]} color="#99adb9"/><Line points={[[0,.025,-7],[0,.025,140]]} color="#ffce48" lineWidth={4}/><Line points={[[-5,.03,0],[5,.03,0]]} color="#ffce48" lineWidth={5}/>
 {[-1,1].map(side=><Line key={side} points={[[side*23,.02,-2],[side*23,.02,70]]} color="#e9eff1" lineWidth={2}/>)}
 <group position={[s.offset,0,s.distance+7]}><group position={[-7,0,-8]}><Aircraft labels={false} annotations={false} wheelTravel={65-s.distance} whiteLivery/>{running&&<mesh geometry={hull} position={[7,0,8]}><meshBasicMaterial color="#39e4ed" wireframe transparent opacity={.12} depthWrite={false}/></mesh>}</group></group>
 <group position={[6,0,-15]}><Box at={[0,3,0]} size={[.35,6,.35]} color="#526c7b"/><Box at={[0,6,0]} size={[3,2.3,.3]} color="#152a36"/><Box at={[0,6,.18]} size={[2.6,.1,.04]} color={color}/></group>
 <Scan active={running&&s.distance>0}/><group position={[21,0,5]}><Box at={[0,2,0]} size={[3,4,3]} color="#879aaa"/><Box at={[-4,4.2,0]} size={[8,2.3,2.7]} color="#a9c4d0"/><Box at={[-4,4.4,-1.38]} size={[7.5,1.4,.05]} color="#557d8c"/><Box at={[-8.5,4.2,0]} size={[1.2,2.7,3]} color="#4b626d"/></group>{s.obstacle&&<Box at={[0,.6,13]} size={[2,1.2,2]} color="#f28044"/>}
 </Canvas>{lost&&<div className="vdgs-scene-message">Mất kết nối đồ họa. Hãy tải lại trang.</div>}</>;
}

