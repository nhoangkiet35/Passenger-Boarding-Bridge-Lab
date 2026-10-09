import { cabinCurtainPanels } from '@/lib/cabinCurtainGeometry';
import { APRON_CAMERA_MOUNT, CABIN_OFFSET, cabinFrame, metrics, type Aux, type Pose } from '@/lib/simulation';
import { standLayout } from '@/lib/standLayout';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Group } from 'three';
import { BufferGeometry, Float32BufferAttribute, DoubleSide, Path, Shape } from 'three';
import { aircraftHull, aircraftSurface } from './aircraftGeometry';
import { BridgeBrand, BridgeServices, CabinGPU, CabinServices, MobileCarriage } from './Infrastructure';
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
function ConformingCanopy({pose}:{pose:Pose}) {
 const geometry=useMemo(()=>{
  const frame=cabinFrame(pose),vertices:number[]=[],colors:number[]=[];
  const reach=(y:number,z:number)=>{
   const worldY=pose.height+y,skinX=7-Math.sqrt(Math.max(.01,4-(worldY-4.1)**2));
   const contact=(skinX-frame.x+z*Math.sin(frame.heading))/Math.max(.25,Math.cos(frame.heading))-1;
   return .005+pose.canopy*Math.max(0,contact+.012-.005);
  };
  const point=(y:number,z:number,t:number):number[]=>[.005+t*reach(y,z),y,z];
  const surfaces=[{a:[.14,-1.24],b:[2.25,-1.24]},{a:[.14,1.24],b:[2.25,1.24]},{a:[2.25,-1.24],b:[2.25,1.24]}];
  for(const surface of surfaces)for(let row=0;row<32;row++)for(let fold=0;fold<12;fold++){
   const yz=(u:number)=>surface.a.map((v,i)=>v+(surface.b[i]-v)*u);
   const a=yz(row/32),b=yz((row+1)/32),t0=fold/12,t1=(fold+1)/12;
   const q=[point(a[0],a[1],t0),point(a[0],a[1],t1),point(b[0],b[1],t1),point(b[0],b[1],t0)];
   for(const i of [0,1,2,0,2,3]){vertices.push(...q[i]);const color=fold%2?.19:.12;colors.push(color,color+.015,color+.02);}
  }
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));g.setAttribute('color',new Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
 },[pose.height,pose.angle,pose.length,pose.cabYaw,pose.canopy]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial vertexColors side={DoubleSide} roughness={.95}/></mesh>;
}
function SwivelCurtain({yaw}:{yaw:number}) {
 const panels=useMemo(()=>cabinCurtainPanels(yaw).map(({from,to,index})=>{
  const dx=to[0]-from[0],dz=to[1]-from[1],angle=-Math.atan2(dz,dx),width=Math.hypot(dx,dz)+.012;
  const at:[number,number,number]=[(from[0]+to[0])/2,1.18,(from[1]+to[1])/2];
  const shape=new Shape();shape.moveTo(-width/2,-1.14);shape.lineTo(width/2,-1.14);shape.lineTo(width/2,1.14);shape.lineTo(-width/2,1.14);shape.closePath();
  const glazed=(index===3||index===4)&&width>.12;
  if(glazed){const hole=new Path();hole.absellipse(0,.27,Math.min(.105,width*.35),.25,0,Math.PI*2,true,0);shape.holes.push(hole);}
  const glass=new Shape();glass.absellipse(0,.27,Math.min(.105,width*.35),.25,0,Math.PI*2,false,0);
  return {angle,width,shape,glass,glazed,at};
 }),[yaw]);
 return <><Box at={[.85,2.37,0]} size={[.75,.12,2.7]} color="#dce4e2"/>{panels.map(({angle,width,shape,glass,glazed,at},i)=><group key={i} position={at} rotation={[0,angle,0]}>
  <mesh castShadow><shapeGeometry args={[shape]}/><meshStandardMaterial color={i%2?'#bbc5c3':'#d2d9d5'} side={DoubleSide} roughness={.85}/></mesh>
  {[-1,1].map(side=><Box key={side} at={[side*width/2,0,.012]} size={[.025,2.28,.035]} color="#9ca9a7"/>)}
  {glazed&&<mesh position={[0,0,.006]}><shapeGeometry args={[glass]}/><meshStandardMaterial color="#6eabbc" transparent opacity={.55} metalness={.12} roughness={.15} side={DoubleSide}/></mesh>}
 </group>)}</>;
}
// Looking from inside toward +x: left is -z, right is +z.
function CabinFront({open,floorTilt}:{open:boolean;floorTilt:number}) {
 const leaves=useRef<Array<Group|null>>([]);
 useFrame((_,dt)=>{leaves.current.forEach((leaf,i)=>{if(leaf){const target=open?(i===0?-1.35:1.35):0;leaf.rotation.y+=(target-leaf.rotation.y)*Math.min(1,dt*4);}});});
 return <>
  {[-1,1].map((side,i)=><group key={side}>
   <group ref={el=>{leaves.current[i]=el;}} position={[.1,1.14,side===-1?-.28:1.29]}>
    <mesh position={[0,0,-side*.3925]}><boxGeometry args={[.025,2.24,.785]}/><meshStandardMaterial color="#77aab8" transparent opacity={.5} metalness={.15} roughness={.17}/></mesh>
    {[-1.12,1.12].map(y=><Box key={y} at={[0,y,-side*.3925]} size={[.045,.045,.785]} color="#b6c6cd"/>)}
    {[0,-side*.785].map(z=><Box key={z} at={[0,0,z]} size={[.045,2.28,.045]} color="#b6c6cd"/>)}
    <Box at={[-.035,-.04,-side*.68]} size={[.035,.22,.04]} color="#778e99"/>
   </group>
   {side===-1&&<group rotation={[0,0,floorTilt*Math.PI/180]}><group position={[-.35,.58,-.94]}>
    <Box at={[0,-.1,0]} size={[.56,.96,.44]} color="#d0dcdf"/>
    <Box at={[0,.46,0]} size={[.61,.16,.51]} rotation={[0,0,.22]} color="#3a5363"/>
    <mesh position={[0,.55,0]} rotation={[-Math.PI/2,0,.22]}><planeGeometry args={[.36,.25]}/><meshBasicMaterial color="#498fa8"/></mesh>
    {[-.13,0,.13].map((x,j)=><mesh key={x} position={[x,.55,.17]}><sphereGeometry args={[.028,10,8]}/><meshStandardMaterial color={j===2?'#dc514b':'#71cda8'}/></mesh>)}
   </group></group>}
   <mesh position={[.97,-.19,side*1.05]} rotation={[0,Math.PI/2,0]}><cylinderGeometry args={[.04,.04,.07,16]}/><meshStandardMaterial color="#b94b3c"/></mesh>
   <mesh position={[.77,-.25,side*.68]} rotation={[0,Math.PI/2,0]}><sphereGeometry args={[.065,12,10]}/><meshStandardMaterial color="#dfe8e8" emissive="#fff0bf" emissiveIntensity={.6}/></mesh>
  </group>)}
  {/* Fixed glazing in front of the left console shares the recessed door plane. */}
  <mesh position={[.1,1.14,-.79]}><boxGeometry args={[.025,2.24,1.02]}/><meshStandardMaterial color="#77aab8" transparent opacity={.5} metalness={.15} roughness={.17}/></mesh>
  {[-1.12,1.12].map(y=><Box key={y} at={[.1,1.14+y,-.79]} size={[.045,.045,1.02]} color="#b6c6cd"/>)}
  {[-1.3,-.28,1.29].map(z=><Box key={z} at={[.1,1.14,z]} size={[.065,2.28,.065]} color="#b6c6cd"/>)}
  {/* Continuous jambs, header and sill seal the partition against the cabin shell. */}
  {[-1,1].map(side=><Box key={side} at={[.1,1.14,side*1.325]} size={[.09,2.28,.09]} color="#c5cecb"/>)}
  {[.025,2.275].map(y=><Box key={y} at={[.1,y,0]} size={[.09,.05,2.75]} color="#b6c6cd"/>)}
  <Box at={[1,-.085,0]} size={[.1,.03,.55]} color="#ebb94d"/>
  <Box at={[.84,-.16,0]} size={[.26,.13,.16]} color="#58727f"/>
 </>;
}
export function PBB({pose:p,labels,annotations=true,aux={interior:false,exterior:false,aircon:false,ventilation:false},highlight=true}:{pose:Pose;labels:boolean;annotations?:boolean;aux?:Record<Aux,boolean>;highlight?:boolean}){
 const slope=Math.atan2(p.height-3,p.length),len=Math.hypot(p.length,p.height-3);
 return <group position={[standLayout.rotundaX,0,standLayout.rotundaZ]} rotation={[0,-p.angle*Math.PI/180,0]}>
  <group rotation={[0,p.angle*Math.PI/180,0]}>
  <mesh position={[0,2.9,0]}><cylinderGeometry args={[1.6,1.6,.2,32]}/><meshStandardMaterial color="#687d89"/></mesh>
  {/* Fixed entry and rotating tunnel edge bound two independently expanding curtains. */}
  {[0,1].map(side=>{const tunnel=Math.PI/2-p.angle*Math.PI/180;
   const start=side===0?tunnel+.65:Math.PI+.65,end=side===0?Math.PI-.65:tunnel-.65+Math.PI*2;
   const sweep=end-start;
   return <group key={side}>{Array.from({length:32},(_,i)=>{const theta=start+(i+.5)*sweep/32,width=2*1.6*Math.sin(sweep/64)+.018;
    return <group key={i} position={[Math.sin(theta)*1.6,4.2,Math.cos(theta)*1.6]} rotation={[0,theta,0]}>
     <Box size={[width,2.4,.03]} color={i%2?'#c3cdc7':'#dce2db'}/>
     <Box at={[-width/2,0,.025]} size={[.022,2.4,.055]} color="#9daea6"/>
    </group>;
   })}</group>;
  })}
  <mesh position={[0,1.3,0]} castShadow><cylinderGeometry args={[.65,.85,2.6,16]}/><meshStandardMaterial color="#4e6977"/></mesh>
  <mesh position={[0,5.3,0]} castShadow><cylinderGeometry args={[1.75,1.75,.18,32]}/><meshStandardMaterial color="#229aab"/></mesh>
  {annotations&&<Label visible={labels} at={[0,6.3,0]}>01 · Rotunda</Label>}
   {/* Separate short, sealed interface from the fixed bridge to the rotunda. */}
   <group position={[0,3,-1.7]}>
    <Box at={[0,-.11,0]} size={[2.5,.22,.7]} color="#70838a"/>
    <Box at={[0,2.38,0]} size={[2.6,.16,.7]} color="#dce3df"/>
    {[-1,1].map(side=><group key={side}>
     <Box at={[side*1.25,1.18,0]} size={[.06,2.36,.7]} color="#aebcb8"/>
     {[-.32,-.16,0,.16,.32].map(z=><Box key={z} at={[side*1.29,1.18,z]} size={[.04,2.36,.035]} color="#7b8f8d"/>)}
    </group>)}
   </group>
  </group>
  <group position={[0,3,0]} rotation={[0,0,slope]}>
   {[0,1,2].map(i=>{const x=i*(len-10)/2+5+(i===0?.6:0); // Move tunnel A forward, retaining overlap with rotunda and tunnel B.
const width=2.65-i*.18;return <group key={i} position={[x,0,0]}>
    {[-1,1].map(side=><group key={side}>
     <Box at={[0,-.32,side*(width/2-.12)]} size={[10,.08,.08]} color="#e5e9e7"/>
     {[-3.75,-1.25,1.25,3.75].map((x,j)=><Box key={x} at={[x,-.2,side*(width/2-.12)]} size={[2.55,.055,.055]} rotation={[0,0,j%2?.17:-.17]} color="#e5e9e7"/>)}
     {[2.85,3.3].map(y=><Box key={y} at={[0,y,side*(width/2-.05)]} size={[9.95,.045,.045]} color="#d7dedf"/>)}
     {[-4.9,-2.45,0,2.45,4.9].map(x=><Box key={x} at={[x,2.87,side*(width/2-.05)]} size={[.045,.95,.045]} color="#d7dedf"/>)}
    </group>)}
    {[-4.5,0,4.5].map(x=><Box key={x} at={[x,-.22,0]} size={[.08,.18,width]} color="#dce4e3"/>)}
    <Box at={[0,-.11,0]} size={[10,.22,width]} color="#687d89"/>
    <Box at={[0,2.35,0]} size={[10,.18,width]} color={i===2?'#dae7eb':'#f4f8f9'}/>
    {[-1,1].map(side=><group key={side}>
     <Box at={[0,.42,side*width/2]} size={[10,.65,.09]} color="#d9e4e9"/>
     <mesh position={[0,1.5,side*width/2]}><boxGeometry args={[9.9,1.5,.045]}/><meshStandardMaterial color="#80baca" transparent opacity={.47} metalness={.15} roughness={.2}/></mesh>
     {[-5,-2.5,0,2.5,5].map(v=><Box key={v} at={[v,1.25,side*width/2]} size={[.07,2.25,.12]} color="#f0f5f6"/>)}
     <Box at={[0,.8,side*width/2]} size={[10,.09,.14]} color="#2795a4"/>
    </group>)}
   </group>;})}
   <BridgeBrand length={len}/>
   {annotations&&<group position={[...APRON_CAMERA_MOUNT]} rotation={[0,0,-.35]}><Box at={[0,.16,0]} size={[.08,.25,.08]} color="#647b89"/><Box size={[.32,.16,.18]} color="#dce4e8"/><Box at={[.17,0,0]} size={[.015,.1,.12]} color="#172e40"/></group>}
   <BridgeServices length={len} show={annotations&&labels}/>
   {annotations&&<Label visible={labels} at={[len/2,3.45,0]}>02 · Ống lồng</Label>}
  </group>
  <group position={[p.length,p.height,0]}>
   <CabinServices pose={p} show={annotations&&labels}/>
   <mesh position={[0,-.2,0]}><cylinderGeometry args={[1.38,1.38,.3,64]}/><meshStandardMaterial color="#c6d3d9" metalness={.35}/></mesh>
   {/* Tunnel-side interfaces stay in the bridge frame, independently of cabin yaw. */}
   <group name="cabin-fixed-tunnel-interfaces">
    {[-1,1].map(side=>{const from=[-1.7,side*1.27],to=[-1.3,side*1.27],dx=to[0]-from[0],dz=to[1]-from[1],length=Math.hypot(dx,dz);return <group key={side}>
     <group position={[(from[0]+to[0])/2,1.18,(from[1]+to[1])/2]} rotation={[0,-Math.atan2(dz,dx),0]}>
      <Box size={[length+.025,2.28,.045]} color="#c5ceca"/>
      {[-.4,-.2,0,.2,.4].map(t=><Box key={t} at={[length*t,0,.025]} size={[.018,2.28,.035]} color="#a2aeab"/>)}
     </group>
     <Box at={[from[0],1.18,from[1]]} size={[.07,2.28,.07]} color="#819691"/>
     <Box at={[to[0],1.18,to[1]]} size={[.06,2.28,.06]} color="#819691"/>
    </group>;})}
   </group>
   <group rotation={[0,-p.cabYaw*Math.PI/180,0]}>
    {/* Vertical cylindrical swivel at the existing cabin yaw axis; rear opening leads into the tunnel. */}
    <group>
     {[-.02,2.37].map(y=><mesh key={y} position={[0,y,0]} castShadow><cylinderGeometry args={[1.39,1.39,.12,64]}/><meshStandardMaterial color="#dce4e2" metalness={.3} roughness={.4}/></mesh>)}
     <group name="cabin-moving-curtain"><SwivelCurtain yaw={p.cabYaw}/></group>
    </group>
    <group position={[CABIN_OFFSET,0,0]}>
    <group rotation={[0,0,p.floorTilt*Math.PI/180]}>
      <Box at={[0,-.1,0]} size={[2,.2,2.75]} color="#556975"/>
      <Box at={[.95,-.04,0]} size={[.1,.08,2.55]} color="#e7bb48"/>
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
    <CabinFront open={p.canopy>=.999} floorTilt={p.floorTilt}/>
    <CabinEquipment aux={aux}/>
    <CabinGPU show={annotations&&labels}/>
    <group position={[1,0,0]}>
     <ConformingCanopy pose={p}/>
     <Box at={[.005+p.canopy*Math.max(0,metrics(p).gap-.005),.14,0]} size={[.1,.12,2.55]} color="#e3b934"/>

    </group>
    {annotations&&<><Label visible={labels} at={[0,3.6,-2]}>03 · Cabin</Label><Label visible={labels} at={[1.4,2.9,2.7]}>04 · Canopy</Label></>}
    </group>
   </group>
   <MobileCarriage pose={p} show={annotations&&labels}/>
  </group>
  {highlight&&<mesh position={[p.length-1.9,.04,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[1.7,2.05,48]}/><meshBasicMaterial color={metrics(p).clearance<.65?'#ee7655':'#26bdc9'} transparent opacity={.7}/></mesh>}
 </group>;
}
const wingShape=aircraftSurface([[1.6,-1.2],[4.5,-.3],[17.9,9],[17.9,10.2],[6.5,6.4],[1.6,5.5]]);
const tailplaneShape=aircraftSurface([[0,0],[2,.2],[6.4,3.6],[6.4,5],[1.2,3.8],[0,3.4]]);
const finShape=aircraftSurface([[0,0],[4.2,6.7],[6.5,6.7],[5.8,0]]);
export function Aircraft({labels,annotations=true,doorOpen=false,halted=false}:{labels:boolean;annotations?:boolean;doorOpen?:boolean;halted?:boolean}){
 const door=useRef<Group>(null), progress=useRef(0);
 const hull=useMemo(aircraftHull,[]);
 useEffect(()=>()=>hull.dispose(),[hull]);
 useFrame((_,dt)=>{if(!door.current||halted)return;const target=doorOpen?1:0;progress.current+=(target-progress.current)*Math.min(1,dt*3);if(Math.abs(target-progress.current)<.001)progress.current=target;door.current.position.x=-2.04-.12*Math.min(1,progress.current*5);door.current.position.z=-8.47-1.2*Math.max(0,(progress.current-.2)/.8);});
 return <group position={[7,0,8]}>
  <mesh geometry={hull} castShadow receiveShadow><meshStandardMaterial vertexColors side={DoubleSide} roughness={.38}/></mesh>
  {[-1,1].map(side=><group key={side}>
   {Array.from({length:38},(_,i)=><mesh key={i} position={[side*1.95,4.53,-6.7+i*.72]}><sphereGeometry args={[.13,12,10]}/><meshStandardMaterial color="#365d75"/></mesh>)}
   <mesh position={[0,3.15,1]} scale={[side,1,1]} rotation={[Math.PI/2,0,side*.045]} castShadow><extrudeGeometry args={[wingShape,{depth:.18,bevelEnabled:false}]}/><meshStandardMaterial color="#c8d9e4" side={DoubleSide}/></mesh>
   <Box at={[side*17.82,4.45,10.2]} size={[.12,1.85,1.45]} rotation={[0,side*.35,-side*.18]} color="#00869c"/>
   {[-.2,1,2.2].map(z=><Box key={z} at={[side*7.4,3.31,4.4+z]} size={[4.7,.035,.07]} rotation={[0,-side*.34,0]} color="#899ca7"/>)}
   <Box at={[side*4.8,2.86,1.6]} size={[.2,.8,2]} color="#b9cad1"/>
   <mesh position={[side*4.8,2.15,1.25]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.96,.82,3.2,48,1,true]}/><meshStandardMaterial color="#00869c" side={DoubleSide}/></mesh>
   <mesh position={[side*4.8,2.15,-.37]}><torusGeometry args={[.87,.085,12,48]}/><meshStandardMaterial color="#d0dadf" metalness={.7} roughness={.28}/></mesh>
   <mesh position={[side*4.8,2.15,-.23]}><circleGeometry args={[.79,40]}/><meshStandardMaterial color="#182832" side={DoubleSide}/></mesh>
   <group position={[side*4.8,2.15,-.25]}>
    {Array.from({length:18},(_,i)=><group key={i} rotation={[0,0,i*Math.PI/9]}><Box at={[0,.43,0]} size={[.09,.52,.035]} rotation={[0,0,.25]} color="#82939d"/></group>)}
    <mesh scale={[.2,.2,.25]}><sphereGeometry args={[1,20,16]}/><meshStandardMaterial color="#bdcbd2" metalness={.7}/></mesh>
   </group>
   <mesh position={[0,4.63,22]} scale={[side,1,1]} rotation={[Math.PI/2,0,0]} castShadow><extrudeGeometry args={[tailplaneShape,{depth:.12,bevelEnabled:false}]}/><meshStandardMaterial color="#c9d5dc" side={DoubleSide}/></mesh>

  </group>)}
  <mesh position={[-.09,5.1,21.5]} rotation={[0,-Math.PI/2,0]} castShadow><extrudeGeometry args={[finShape,{depth:.18,bevelEnabled:false}]}/><meshStandardMaterial color="#00869c" side={DoubleSide}/></mesh>
  <Box at={[-.9,3.38,-8]} size={[2.2,.06,1]} color="#697782"/>
  <Box at={[.3,4.3,-8]} size={[.06,1.8,1]} color="#e6eded"/>
  <Box at={[-.9,5.25,-8]} size={[2.2,.06,1]} color="#ece7d6"/>
  {[-8.53,-7.47].map(z=><Box key={z} at={[-1.94,4.34,z]} size={[.08,1.94,.06]} color="#d4b64b"/>)}
  {doorOpen&&<pointLight position={[-1,4.8,-8]} color="#fff0ce" intensity={8} distance={3}/>}
  {[-1,1].map(side=><group key={side}>
   {[-2,8,19.5].map(z=><group key={z} position={[side*1.99,4.3,z]}><Box size={[.035,1.75,.8]} color="#ddbf51"/><Box at={[side*.025,0,0]} size={[.035,1.65,.7]} color="#00869c"/></group>)}
   {[-.45,0,.45].map(a=><mesh key={a} position={[side*.11,8.6,26.5]} rotation={[a,0,0]} scale={[.025,1.3,.32]}><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color="#e8c94c"/></mesh>)}
  </group>)}
  <Box at={[-2.1,4.13,-8.2]} size={[.025,.05,.2]} color="#dde8e8"/>
  <group ref={door} position={[-2.045,4.34,-8.47]}>
   <Box at={[-.02,0,.47]} size={[.07,1.88,1]} color="#00869c"/>
   <Box at={[-.04,.46,.47]} size={[.075,.3,.27]} color="#385c71"/>
  </group>
  <Box at={[-2.1,3.43,-8]} size={[.08,.045,.95]} color="#d4a637"/>
  <Box at={[-2.1,4.13,-7.8]} size={[.09,.05,.2]} color="#476777"/>
  {[-1,1].map(side=><group key={side}>
   <Box at={[side*.68,4.89,-13.48]} size={[.69,.36,.04]} rotation={[0,side*.47,-side*.1]} color="#213f52"/>
   <Box at={[side*1.2,4.82,-12.96]} size={[.48,.34,.04]} rotation={[0,side*.9,0]} color="#213f52"/>
  </group>)}
  <mesh position={[0,4.06,-14.92]} scale={[.09,.09,.14]}><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color="#3f6372"/></mesh>
  <Box at={[0,1.54,-11.2]} size={[.15,1.95,.17]} color="#91a6b1"/>
  {[-.22,.22].map(x=><mesh key={x} position={[x,.35,-11.2]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.35,.35,.22,24]}/><meshStandardMaterial color="#26343c"/></mesh>)}
  {[-1,1].map(side=><group key={side} position={[side*2.4,0,7.1]}>
   <Box at={[0,1.45,0]} size={[.22,1.75,.24]} color="#91a6b1"/>
   <Box at={[side*-.4,2.18,-.12]} size={[1.1,.17,.45]} rotation={[0,0,side*.18]} color="#91a6b1"/>
   {[-.31,.31].map(x=><group key={x} position={[x,.52,0]}>
    <mesh rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.52,.52,.32,28]}/><meshStandardMaterial color="#26343c"/></mesh>
    <mesh position={[Math.sign(x)*.17,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.24,.24,.025,24]}/><meshStandardMaterial color="#a7b9c2" metalness={.6}/></mesh>
   </group>)}
  </group>)}
  {annotations&&<Label visible={labels} at={[0,7.4,-10]}>{doorOpen?'Cửa trượt mở · Khách vào nhà ga':'A321 · Cửa L1 chờ kết nối'}</Label>}
 </group>;
}
