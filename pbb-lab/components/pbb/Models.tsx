import { BridgeServices, CabinServices, CabinGPU, MobileCarriage, BridgeBrand } from './Infrastructure';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useEffect, useRef } from 'react';
import { DoubleSide } from 'three';
import { aircraftHull, aircraftSurface } from './aircraftGeometry';
import type { Group } from 'three';
import { metrics, type Pose, type Aux } from '@/lib/simulation';
export function Box({at=[0,0,0],size=[1,1,1],color='#cbd5df',...props}:{at?:[number,number,number];size?:[number,number,number];color?:string;rotation?:[number,number,number]}){return <mesh position={at} castShadow receiveShadow {...props}><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.65}/></mesh>;}
function Label({at,children,visible=true}:{at:[number,number,number];children:React.ReactNode;visible?:boolean}){return <Html position={at} center zIndexRange={[20,0]} style={{pointerEvents:'none',display:visible?'block':'none'}}><span className="part-label">{children}</span></Html>;}
function CabinEquipment({aux}:{aux:Record<Aux,boolean>}) {
  const fan = useRef<Group>(null);
  useFrame((_,dt)=>{if(fan.current && aux.ventilation) fan.current.rotation.y += dt*10;});
  return <>
    {[-.8,.8].map(z=><mesh key={z} position={[0,2.23,z]}><boxGeometry args={[1.45,.04,.07]}/><meshStandardMaterial color={aux.interior?'#fff2bd':'#899799'} emissive="#fff0ab" emissiveIntensity={aux.interior?3:0}/></mesh>)}
    {aux.interior&&<pointLight position={[0,1.95,0]} intensity={18} distance={5} color="#fff0c4"/>}
    <mesh position={[1.04,2.28,0]}><boxGeometry args={[.12,.13,.38]}/><meshStandardMaterial color={aux.exterior?'#faf6d1':'#4c5f69'} emissive="#fff5d2" emissiveIntensity={aux.exterior?4:0}/></mesh>
    {aux.exterior&&<pointLight position={[1.25,1.95,0]} intensity={35} distance={8} color="#fff3cf"/>}
    <Box at={[-.55,2.15,.66]} size={[.65,.13,.65]} color="#60747c"/>
    <group ref={fan} position={[-.55,2.05,.66]}><Box size={[.5,.04,.09]} color="#b0c4c9"/><Box size={[.09,.04,.5]} color="#b0c4c9"/></group>
    <Box at={[-.5,2.14,-.65]} size={[.7,.2,.55]} color={aux.aircon?'#8bcad0':'#7f9299'}/>
    {[-.2,-.1,0,.1,.2].map(x=><Box key={x} at={[-.5+x,2.02,-.65]} size={[.03,.03,.4]} color="#394e58"/>)}
  </>;
}
export function PBB({pose:p,labels,annotations=true,aux={interior:false,exterior:false,aircon:false,ventilation:false},highlight=true}:{pose:Pose;labels:boolean;annotations?:boolean;aux?:Record<Aux,boolean>;highlight?:boolean}){
 const slope=Math.atan2(p.height-3,p.length),len=Math.hypot(p.length,p.height-3);
 return <group position={[-12,0,0]} rotation={[0,-p.angle*Math.PI/180,0]}>
  <mesh position={[0,3,0]}><cylinderGeometry args={[1.6,1.6,.2,32]}/><meshStandardMaterial color="#687d89"/></mesh>
  {[-Math.PI/4,Math.PI*.75].map(a=><mesh key={a} position={[0,4.2,0]} castShadow><cylinderGeometry args={[1.6,1.6,2.4,24,1,true,a,Math.PI/2]}/><meshStandardMaterial color="#b3d2d9" transparent opacity={.5} side={DoubleSide}/></mesh>)}
  <mesh position={[0,1.3,0]} castShadow><cylinderGeometry args={[.65,.85,2.6,16]}/><meshStandardMaterial color="#4e6977"/></mesh>
  <mesh position={[0,5.3,0]} castShadow><cylinderGeometry args={[1.75,1.75,.18,32]}/><meshStandardMaterial color="#229aab"/></mesh>
  {annotations&&<Label visible={labels} at={[0,6.3,0]}>01 · Rotunda</Label>}
  <group position={[0,3,0]} rotation={[0,0,slope]}>
   {[0,1,2].map(i=>{const x=i*(len-6)/2+3;const width=2.65-i*.18;return <group key={i} position={[x,0,0]}>
    {[-1,1].map(side=><group key={side}>
     <Box at={[0,-.32,side*(width/2-.12)]} size={[6,.08,.08]} color="#e5e9e7"/>
     {[-2.25,-.75,.75,2.25].map((x,j)=><Box key={x} at={[x,-.2,side*(width/2-.12)]} size={[1.55,.055,.055]} rotation={[0,0,j%2?.17:-.17]} color="#e5e9e7"/>)}
     {[2.85,3.3].map(y=><Box key={y} at={[0,y,side*(width/2-.05)]} size={[5.95,.045,.045]} color="#d7dedf"/>)}
     {[-2.9,-1.45,0,1.45,2.9].map(x=><Box key={x} at={[x,2.87,side*(width/2-.05)]} size={[.045,.95,.045]} color="#d7dedf"/>)}
    </group>)}
    {[-2.5,0,2.5].map(x=><Box key={x} at={[x,-.22,0]} size={[.08,.18,width]} color="#dce4e3"/>)}
    <Box at={[0,.03,0]} size={[6,.22,width]} color="#687d89"/>
    <Box at={[0,2.35,0]} size={[6,.18,width]} color={i===2?'#dae7eb':'#f4f8f9'}/>
    {[-1,1].map(side=><group key={side}>
     <Box at={[0,.42,side*width/2]} size={[6,.65,.09]} color="#d9e4e9"/>
     <mesh position={[0,1.5,side*width/2]}><boxGeometry args={[5.9,1.5,.045]}/><meshStandardMaterial color="#80baca" transparent opacity={.47} metalness={.15} roughness={.2}/></mesh>
     {[-3,-1.5,0,1.5,3].map(v=><Box key={v} at={[v,1.25,side*width/2]} size={[.07,2.25,.12]} color="#f0f5f6"/>)}
     <Box at={[0,.8,side*width/2]} size={[6,.09,.14]} color="#2795a4"/>
    </group>)}
   </group>;})}
   <BridgeBrand length={len}/>
   <BridgeServices length={len} show={annotations&&labels}/>
   {annotations&&<Label visible={labels} at={[len/2,3.45,0]}>02 · Ống lồng</Label>}
  </group>
  <group position={[p.length,p.height,0]}>
   <CabinServices pose={p} show={annotations&&labels}/>
   <group rotation={[0,-p.cabYaw*Math.PI/180,0]}>
    <group rotation={[0,0,p.floorTilt*Math.PI/180]}>
      <Box at={[0,.04,0]} size={[2,.25,2.75]} color="#556975"/>
      <Box at={[.94,.18,0]} size={[.12,.02,2.55]} color="#e7bb48"/>
    </group>
    <Box at={[0,2.4,0]} size={[2.15,.22,2.85]} color="#ecefeb"/>
    {[-1,1].map(side=><group key={side}>
     <Box at={[0,1.22,side*1.35]} size={[2,2.38,.12]} color="#edf0ec"/>
     <Box at={[-.59,1.09,side*1.418]} size={[.61,1.9,.025]} color="#c5cecb"/>
     <Box at={[-.59,1.09,side*1.435]} size={[.55,1.83,.018]} color="#edf0ec"/>
     <mesh position={[.25,1.55,side*1.425]} scale={[1,1,.18]}><capsuleGeometry args={[.16,.48,6,16]}/><meshStandardMaterial color="#2b4859"/></mesh>
     <Box at={[-.39,1.02,side*1.454]} size={[.045,.16,.03]} color="#77898e"/>
     {Array.from({length:9},(_,i)=><Box key={i} at={[-.98+i*.045,1.2,side*1.425]} size={[.022,2.25,.045]} color={i%2?'#d0d9d7':'#f4f5ef'}/>)}
    </group>)}
    <CabinEquipment aux={aux}/>
    <CabinGPU show={annotations&&labels}/>
    <group position={[1,0,0]}>
     {Array.from({length:12},(_,i)=>{const reach=.06+p.canopy*Math.max(0,metrics(p).gap-.06),step=reach/11,x=.01+i*step;return <group key={i}>
      <Box at={[x,2.25,0]} size={[Math.max(.045,step),.13,2.57]} color={i%2?'#3c4142':'#252c30'}/>
      {[-1,1].map(side=><Box key={side} at={[x,1.13,side*1.24]} size={[Math.max(.045,step),2.25,.12]} color={i%2?'#3c4142':'#252c30'}/>)}
     </group>;})}
     <Box at={[.06+p.canopy*Math.max(0,metrics(p).gap-.06),.14,0]} size={[.1,.12,2.55]} color="#e3b934"/>

    </group>
    {annotations&&<><Label visible={labels} at={[0,3.6,-2]}>03 · Cabin</Label><Label visible={labels} at={[1.4,2.9,2.7]}>04 · Canopy</Label></>}
   </group>
   <MobileCarriage pose={p} show={annotations&&labels}/>
  </group>
  {highlight&&<mesh position={[p.length-1.9,.04,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[1.7,2.05,48]}/><meshBasicMaterial color={metrics(p).clearance<.65?'#ee7655':'#26bdc9'} transparent opacity={.7}/></mesh>}
 </group>;
}
const wingShape=aircraftSurface([[1.5,-1],[5,-.5],[17,8.5],[17,10],[6,6],[1.5,5]]);
export function Aircraft({labels,annotations=true,doorOpen=false,halted=false}:{labels:boolean;annotations?:boolean;doorOpen?:boolean;halted?:boolean}){
 const door=useRef<Group>(null), progress=useRef(0);
 const hull=useMemo(aircraftHull,[]);
 useEffect(()=>()=>hull.dispose(),[hull]);
 useFrame((_,dt)=>{if(!door.current||halted)return;const target=doorOpen?1:0;progress.current+=(target-progress.current)*Math.min(1,dt*3);if(Math.abs(target-progress.current)<.001)progress.current=target;door.current.position.x=-2.04-.12*Math.min(1,progress.current*5);door.current.position.z=-8.47+1.2*Math.max(0,(progress.current-.2)/.8);});
 return <group position={[7,0,8]}>
  <mesh geometry={hull} castShadow receiveShadow><meshStandardMaterial vertexColors side={DoubleSide} roughness={.38}/></mesh>
  <mesh position={[0,4.1,-10.5]} scale={[2,2,4.2]} castShadow><sphereGeometry args={[1,48,32,Math.PI,Math.PI]}/><meshStandardMaterial color="#00869c"/></mesh>
  <mesh position={[0,4.1,25.5]} rotation={[-Math.PI/2,0,0]} castShadow><coneGeometry args={[2,7,48]}/><meshStandardMaterial color="#00869c"/></mesh>
  {[-1,1].map(side=><group key={side}>
   {Array.from({length:38},(_,i)=><mesh key={i} position={[side*1.91,4.7,-6.7+i*.72]}><sphereGeometry args={[.13,12,10]}/><meshStandardMaterial color="#365d75"/></mesh>)}
   <mesh position={[0,3.35,1]} scale={[side,1,1]} rotation={[Math.PI/2,0,0]} castShadow><extrudeGeometry args={[wingShape,{depth:.18,bevelEnabled:false}]}/><meshStandardMaterial color="#c8d9e4" side={DoubleSide}/></mesh>
   <Box at={[side*17,4,10]} size={[.18,1.3,1.7]} color="#299eaf"/>
   <mesh position={[side*4.4,2.55,1]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.83,.75,2.5,32]}/><meshStandardMaterial color="#e6edf0"/></mesh>
   <mesh position={[side*4.4,2.55,-.27]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.64,.64,.05,32]}/><meshStandardMaterial color="#223c4c"/></mesh>
   <Box at={[side*2.6,4.55,24]} size={[5,.15,2]} rotation={[0,-side*.4,0]} color="#bccfdd"/>
  </group>)}
  <Box at={[0,7.2,25]} size={[.25,5.3,3.5]} rotation={[.24,0,0]} color="#218b9e"/>
  <Box at={[0,7.3,25]} size={[.28,.45,3.5]} color="#63d9dc"/>
  <Box at={[-.9,3.38,-8]} size={[2.2,.06,1]} color="#697782"/>
  <Box at={[.3,4.3,-8]} size={[.06,1.8,1]} color="#e6eded"/>
  <Box at={[-.9,5.25,-8]} size={[2.2,.06,1]} color="#ece7d6"/>
  {[-8.53,-7.47].map(z=><Box key={z} at={[-1.94,4.34,z]} size={[.08,1.94,.06]} color="#d4b64b"/>)}
  {doorOpen&&<pointLight position={[-1,4.8,-8]} color="#fff0ce" intensity={8} distance={3}/>}
  {[-1,1].map(side=><group key={side}>
   {[-2,8,19.5].map(z=><group key={z} position={[side*1.99,4.3,z]}><Box size={[.035,1.75,.8]} color="#ddbf51"/><Box at={[side*.025,0,0]} size={[.035,1.65,.7]} color="#00869c"/></group>)}
   {[-.45,0,.45].map(a=><mesh key={a} position={[side*.15,7.8,25]} rotation={[a,0,0]} scale={[.025,1.3,.32]}><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color="#e8c94c"/></mesh>)}
  </group>)}
  <Box at={[-2.1,4.13,-8.2]} size={[.025,.05,.2]} color="#dde8e8"/>
  <group ref={door} position={[-2.045,4.34,-8.47]}>
   <Box at={[-.02,0,.47]} size={[.07,1.88,1]} color="#00869c"/>
   <Box at={[-.04,.46,.47]} size={[.075,.3,.27]} color="#385c71"/>
  </group>
  <Box at={[-2.1,3.43,-8]} size={[.08,.045,.95]} color="#d4a637"/>
  <Box at={[-2.1,4.13,-7.8]} size={[.09,.05,.2]} color="#476777"/>
  <mesh position={[0,4.9,-13.8]} scale={[1.1,.38,.2]}><sphereGeometry args={[1,20,16]}/><meshStandardMaterial color="#315b73"/></mesh>
  {[-7,4].map(z=><group key={z}><Box at={[0,1.4,z]} size={[.18,1.9,.2]} color="#607580"/>{[-.45,.45].map(x=><mesh key={x} position={[x,.5,z]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.5,.5,.35,18]}/><meshStandardMaterial color="#273742"/></mesh>)}</group>)}
  {annotations&&<Label visible={labels} at={[0,7.4,-10]}>{doorOpen?'Cửa trượt mở · Khách vào nhà ga':'A321 · Cửa L1 chờ kết nối'}</Label>}
 </group>;
}
