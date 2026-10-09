import type { Pose } from '@/lib/simulation';
import { standLayout } from '@/lib/standLayout';
import { Html } from '@react-three/drei';
import { useEffect, useMemo, useState } from 'react';
import { CanvasTexture, CatmullRomCurve3, Quaternion, SRGBColorSpace, TubeGeometry, Vector3 } from 'three';

function Block({at=[0,0,0],size=[1,1,1],color='#dce5e9'}:{at?:[number,number,number];size?:[number,number,number];color?:string}) {
 return <mesh position={at} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.65}/></mesh>;
}
function Annotation({at,show,children}:{at:[number,number,number];show:boolean;children:React.ReactNode}) {
 return show?<Html position={at} center style={{pointerEvents:'none'}} zIndexRange={[20,0]}><span className="part-label">{children}</span></Html>:null;
}
// Physical lettering appears on the equipment even when annotation overlays are hidden.
function Plate({at,text,width=1,color='#eff7fb',background='#183747'}:{at:[number,number,number];text:string;width?:number;color?:string;background?:string}) {
 const [texture,setTexture]=useState<CanvasTexture|null>(null);
 useEffect(()=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=192;const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.fillStyle=background;ctx.fillRect(0,0,512,192);ctx.fillStyle=color;ctx.font='bold 72px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,96,480);
  const map=new CanvasTexture(canvas);map.colorSpace=SRGBColorSpace;setTexture(map);return()=>map.dispose();
 },[text,color,background]);
 return <mesh position={at}><planeGeometry args={[width,width*.375]}/><meshBasicMaterial map={texture} color={texture?'white':background} toneMapped={false}/></mesh>;
}
function AirSupplyHose({pose}:{pose:Pose}) {
 const hoses=useMemo(()=>{
  const slope=Math.atan2(pose.height-3,pose.length),c=Math.cos(slope),sn=Math.sin(slope);
  // Match the two sockets on PCA's aircraft-facing (+x) end, including tunnel slope.
  const x=-.48*pose.length+1.54*c+.93*sn,y=1.44-.48*pose.height-.93*c+1.54*sn;
  return [-1,1].map(side=>{
   const z=side*.48,end=new Vector3(-1.82,-.68,side*.65-.565);
   const curve=new CatmullRomCurve3([new Vector3(x,y,z),new Vector3(x+.2,y-.15,z),new Vector3((x-1.82)/2,Math.min(y,-.78)-.55,side*1.18),new Vector3(-2.15,-1.15,end.z),end]);
   return {geometry:new TubeGeometry(curve,48,.12,12,false),ribs:Array.from({length:28},(_,i)=>{const t=i/27;return {point:curve.getPointAt(t),rotation:new Quaternion().setFromUnitVectors(new Vector3(0,0,1),curve.getTangentAt(t))};})};
  });
 },[pose.length,pose.height]);
 useEffect(()=>()=>hoses.forEach(h=>h.geometry.dispose()),[hoses]);
 return <group>{hoses.map((hose,i)=><group key={i}>
  <mesh geometry={hose.geometry} castShadow><meshStandardMaterial color="#e9ac29" roughness={.85}/></mesh>
  {hose.ribs.map(({point,rotation},j)=><mesh key={j} position={point} quaternion={rotation}><torusGeometry args={[.121,.012,6,16]}/><meshStandardMaterial color="#785b29"/></mesh>)}
 </group>)}</group>;
}
function HoseReels({show}:{show:boolean}) {
 return <group position={[-1.7,-.78,0]}>
  {/* Side-by-side across the bridge; both horizontal reel axes point across the bridge, with the outlet faces toward the left side. */}
  {[-.65,.65].map(z=><group key={z} position={[0,0,z]} rotation={[0,Math.PI,0]}>
   <Block at={[0,.58,0]} size={[.12,.3,.7]} color="#ced6d8"/>
   <mesh rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.4,.4,.55,40]}/><meshStandardMaterial color="#ec6c21" roughness={.8}/></mesh>
   {[-.32,.32].map(z=><group key={z}>
    <mesh position={[0,0,z]}><ringGeometry args={[.2,.5,40]}/><meshStandardMaterial color="#c6cfd0" metalness={.65} roughness={.4} side={2}/></mesh>
    <mesh position={[0,0,z]}><torusGeometry args={[.49,.025,8,40]}/><meshStandardMaterial color="#d4dddf" metalness={.6}/></mesh>
   </group>)}
   {Array.from({length:9},(_,i)=><mesh key={i} position={[0,0,-.25+i*.062]}><torusGeometry args={[.38,.038,8,32]}/><meshStandardMaterial color={i%2?'#ef8d31':'#c85a19'} roughness={.8}/></mesh>)}
   <Block at={[.12,.06,.36]} size={[.4,.43,.055]} color="#e2e7e6"/>
   <mesh position={[.12,.1,.47]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.16,.16,.19,24,1,true]}/><meshStandardMaterial color="#e0e3df" side={2} metalness={.5}/></mesh>
   <mesh position={[-.2,-.26,.38]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.13,.13,.18,24]}/><meshStandardMaterial color="#e1a52d"/></mesh>
   <mesh position={[-.2,-.26,.48]}><torusGeometry args={[.11,.022,8,24]}/><meshStandardMaterial color="#222c32"/></mesh>
  </group>)}
  <Annotation at={[0,-.1,-1.55]} show={show}>Ống khí</Annotation>
 </group>;
}
export function BridgeServices({length,show}:{length:number;show:boolean}) {
 return <group position={[length*.52,-.78,0]}>
  <group rotation={[0,Math.PI,0]}>
   <Block size={[2.9,1.15,1.8]} color="#d4d9d7"/>
   {/* Separate air sockets on the end facing the aircraft, rather than the side label panel. */}
   {[-.48,.48].map(z=><group key={z} position={[-1.49,-.15,z]}>
    <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.16,.16,.1,24,1,true]}/><meshStandardMaterial color="#bcc9cb" metalness={.65} side={2}/></mesh>
    <mesh position={[-.045,0,0]} rotation={[0,Math.PI/2,0]}><torusGeometry args={[.145,.022,8,24]}/><meshStandardMaterial color="#7d8d94" metalness={.6}/></mesh>
   </group>)}

   {[-.97,.97].map(x=><group key={x}>
    <Block at={[x,0,.914]} size={[.93,1.03,.04]} color="#192833"/>
    {[-.46,.46].map(y=><Block key={y} at={[x,y,.943]} size={[.88,.035,.02]} color="#354a56"/>)}
    {[-.41,.41].map(dx=><Block key={dx} at={[x+dx,0,.943]} size={[.035,.98,.02]} color="#354a56"/>)}
   </group>)}
   <Block at={[0,0,.924]} size={[.84,1.01,.025]} color="#e1e2dc"/>
   <Plate at={[0,.29,.943]} text="ITW GSE" width={.7} color="#1f7099" background="#e1e2dc"/>
   <Plate at={[0,-.02,.943]} text="3500" width={.72} color="#27313a" background="#e1e2dc"/>
   <Plate at={[0,-.32,.943]} text="PCA" width={.4} color="#27313a" background="#e1e2dc"/>
   {[-1.2,1.2].map(x=><Block key={x} at={[x,.68,0]} size={[.12,.25,2]} color="#dce3e2"/>)}
   {Array.from({length:12},(_,i)=><Block key={i} at={[-.55+i*.1,-.59,0]} size={[.025,.025,1.4]} color="#41505a"/>)}
   <Annotation at={[0,-1,1.75]} show={show}>PCA</Annotation>
  </group>
  <Block at={[-2.8,.48,-1.25]} size={[2.4,.16,.18]} color="#394e5b"/>
  {Array.from({length:12},(_,i)=><Block key={i} at={[-3.9+i*.2,.56,-1.25]} size={[.035,.14,.24]} color="#192f3b"/>)}
 </group>;
}
export function CabinGPU({show}:{show:boolean}) {
 return <group position={[.25,-.65,.7]} rotation={[0,Math.PI,0]}>
  {[-.5,.5].map(x=><Block key={x} at={[x,.56,0]} size={[.1,.25,.85]} color="#98aab0"/>)}
  <Block size={[1.35,.95,.83]} color="#edf0ec"/>
  <Block at={[0,0,.431]} size={[1.19,.81,.025]} color="#f5f5ef"/>
  <Plate at={[0,.2,.45]} text="SAS" width={.97} color="#2c3234" background="#f5f5ef"/>
  <Plate at={[0,-.14,.45]} text="ZERO" width={.88} color="#363c3e" background="#f5f5ef"/>
  <Plate at={[0,-.34,.45]} text="GPU" width={.4} color="#363c3e" background="#f5f5ef"/>
  <Block at={[-.65,-.24,0]} size={[.025,.38,.69]} color="#2b3740"/>
  {[-.35,-.23,-.11].map(y=><Block key={y} at={[-.669,y,0]} size={[.018,.026,.62]} color="#899a9f"/>)}
  <mesh position={[-.58,-.61,0]}><cylinderGeometry args={[.04,.04,.29,12]}/><meshStandardMaterial color="#ef841d"/></mesh>
  <mesh position={[-.58,-.85,0]}><cylinderGeometry args={[.045,.045,.2,12]}/><meshStandardMaterial color="#27343c"/></mesh>
  <Block at={[-.58,-1.04,0]} size={[.1,.23,.09]} color="#34414a"/>
  <Block at={[-.58,-1.16,0]} size={[.085,.035,.08]} color="#596a9b"/>
  <Annotation at={[0,-1.4,.7]} show={show}>GPU</Annotation>
 </group>;
}

export function MobileCarriage({pose,show}:{pose:Pose;show:boolean}) {
 const ground=-pose.height;
 return <group position={[-1.9,0,0]}>
  {/* Two outboard lift columns; the single two-wheel carriage is centered between them. */}
  {[-1,1].map(side=><group key={side} position={[0,0,side*1.55]}>
   <Block at={[0,ground+1.95,0]} size={[.38,2.1,.38]} color="#738995"/>
   {side===-1&&<group position={[0,ground+1.38,-.56]} rotation={[0,Math.PI,0]}>
    {/* Compact stainless two-door cabinet, based on the supplied photograph. */}
    {[-.34,.34].map(y=><Block key={y} at={[0,y,-.34]} size={[.36,.07,.22]} color="#7f8e94"/>)}
    <mesh castShadow receiveShadow><boxGeometry args={[.9,1.05,.52]}/><meshStandardMaterial color="#aaa99b" metalness={.65} roughness={.48}/></mesh>
    {[-1,1].map(side=><mesh key={side} position={[side*.211,0,.269]} castShadow><boxGeometry args={[.412,.946,.018]}/><meshStandardMaterial color="#b8b6a7" metalness={.6} roughness={.5}/></mesh>)}
    <Block at={[0,0,.282]} size={[.009,.95,.009]} color="#555952"/>
    {[-.493,.493].map(y=><Block key={y} at={[0,y,.28]} size={[.9,.045,.04]} color="#c3c2b5"/>)}
    {[-.438,.438].map(x=><Block key={x} at={[x,0,.28]} size={[.025,1,.04]} color="#c3c2b5"/>)}
    <Block at={[0,.543,0]} size={[.95,.035,.57]} color="#c3c2b5"/>
    <Plate at={[-.211,.24,.283]} text="DRINKING" width={.38} color="#252823" background="#b8b6a7"/>
    <Plate at={[.211,.24,.283]} text="WATER" width={.36} color="#252823" background="#b8b6a7"/>
    <Plate at={[.211,.12,.283]} text="ONLY" width={.3} color="#252823" background="#b8b6a7"/>
    <mesh position={[.085,-.08,.3]}><torusGeometry args={[.043,.009,8,24]}/><meshStandardMaterial color="#d4d8d6" metalness={.85} roughness={.25}/></mesh>
    <mesh position={[.085,-.08,.295]}><circleGeometry args={[.034,20]}/><meshStandardMaterial color="#535b5c" metalness={.7}/></mesh>
    <Block at={[.085,-.08,.309]} size={[.048,.013,.012]} color="#bfc8c8"/>
    {[-.34,.34].map(y=><Block key={y} at={[.429,y,.29]} size={[.025,.075,.027]} color="#adb5b5"/>)}
    <Annotation at={[0,.05,.65]} show={show}>PWS</Annotation>
   </group>}
   <Block at={[0,(ground+2+2.65)/2,0]} size={[.25,pose.height+.65,.25]} color="#b7c7cf"/>
   <Block at={[0,.05,0]} size={[.68,.24,.52]} color="#637b89"/>
   <Block at={[0,2.72,0]} size={[.5,.18,.52]} color="#607785"/>
   <Block at={[0,3.02,0]} size={[.27,.44,.3]} color="#304a5b"/>
   {[-.09,.09].map(z=><Block key={z} at={[.15,3.02,z]} size={[.035,.37,.025]} color="#9babb3"/>)}
  </group>)}
  <Block at={[0,2.63,0]} size={[.2,.16,3.3]} color="#9bafb9"/>
  <Block at={[0,ground+.99,0]} size={[.62,.24,3.5]} color="#556e7e"/>
  <mesh position={[0,ground+.75,0]} castShadow><cylinderGeometry args={[.34,.34,.25,24]}/><meshStandardMaterial color="#8297a3" metalness={.5}/></mesh>
  <mesh position={[0,ground+.45,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.1,.1,1.65,16]}/><meshStandardMaterial color="#8fa4af" metalness={.6}/></mesh>
  <Block at={[0,ground+.5,0]} size={[.46,.4,.6]} color="#8e9f9f"/>
  {[-1,1].map(side=><group key={side} position={[0,ground+.32,side*1.15]}>
   <Block size={[1.35,.09,.14]} color="#d5bb4b"/>
   {[-.5,-.25,0,.25,.5].map(x=><Block key={x} at={[x,0,side*.08]} size={[.12,.1,.02]} color="#263238"/>)}
  </group>)}
  {/* Front and rear sensor guards complete the four-sided protective perimeter. */}
  {[-1,1].map(side=><group key={side} position={[side*.675,ground+.32,0]} rotation={[0,Math.PI/2,0]}>
   <Block size={[2.44,.09,.14]} color="#d5bb4b"/>
   {Array.from({length:9},(_,i)=>-1+i*.25).map(x=><mesh key={x} position={[x,0,side*.08]}><boxGeometry args={[.085,.105,.02]}/><meshStandardMaterial color="#20262a"/></mesh>)}
  </group>)}
  <Block at={[.12,ground+1.15,0]} size={[.2,.23,.3]} color="#8c9e9d"/>
  {[-1,1].map(side=><group key={side} position={[0,ground+.45,side*.72]}>
   <mesh rotation={[Math.PI/2,0,0]} castShadow receiveShadow><cylinderGeometry args={[.45,.45,.34,32]}/><meshStandardMaterial color="#202a31" roughness={.9}/></mesh>
   <mesh position={[0,0,side*.175]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.22,.22,.025,24]}/><meshStandardMaterial color="#9cafb9" metalness={.55}/></mesh>
  </group>)}
  <Annotation at={[0,ground+.45,-2.25]} show={show}>05 · Trục nâng hạ</Annotation>
 </group>;
}

export function CabinServices({pose,show}:{pose:Pose;show:boolean}) {
 const stairRun=4.5, rise=pose.height-.3, count=12;
 return <>
  <HoseReels show={show}/>
  <AirSupplyHose pose={pose}/>
  {/* Service stair is outside the passenger corridor, beside the lifting column. */}
  <group position={[0,0,2.15]}>
   <Block at={[-.35,.01,0]} size={[1.3,.12,1]} color="#6b7f88"/>
   {Array.from({length:count},(_,i)=>{const u=(i+1)/count;return <group key={i} position={[-.8-stairRun*u,-rise*u,0]}>
    <Block size={[stairRun/count,.07,.9]} color="#91a1a9"/>
    {[-.48,.48].map(z=><Block key={z} at={[0,.5,z]} size={[.035,1.02,.035]} color="#d4dde1"/>)}
   </group>;})}
   {[-.48,.48].map(z=><group key={z} position={[-.8-stairRun/2,.85-rise/2,z]} rotation={[0,0,Math.atan2(rise,stairRun)]}>
    <Block size={[Math.hypot(stairRun,rise),.05,.05]} color="#d4dde1"/>
   </group>)}
  </group>
 </>;
}
export function FixedBridge({show}:{show:boolean}) {
 return <group position={[-12,3,standLayout.bridgeCenterZ]} rotation={[0,-Math.PI/2,0]}>
  <Block at={[0,-.11,0]} size={[standLayout.bridgeLength,.22,2.7]} color="#677d89"/>
  <Block at={[0,2.45,0]} size={[standLayout.bridgeLength,.18,2.85]} color="#eaf0f1"/>
  {[-1,1].map(side=><group key={side}>
   <Block at={[0,.42,side*1.32]} size={[standLayout.bridgeLength,.65,.1]}/>
   <mesh position={[0,1.5,side*1.32]}><boxGeometry args={[standLayout.bridgeLength,1.5,.04]}/><meshStandardMaterial color="#84b9c8" transparent opacity={.4}/></mesh>
   {[-.5,-.25,0,.25,.5].map(t=>{const x=t*standLayout.bridgeLength;return <Block key={x} at={[x,1.3,side*1.32]} size={[.07,2.3,.12]} color="#f0f4f5"/>;})}
   <Block at={[0,.8,side*1.32]} size={[standLayout.bridgeLength,.08,.12]} color="#2795a4"/>
  </group>)}
  {[-3,3].map(x=>[-1,1].map(z=><Block key={`${x}:${z}`} at={[x,-1.55,z]} size={[.38,2.9,.38]} color="#738994"/>))}
  <Annotation at={[0,3.25,0]} show={show}>06 · Cầu cố định</Annotation>
 </group>;
}
export function VDGS({show,connected}:{show:boolean;connected:boolean}) {
 // Aircraft nose is at world z=-7. The screen normal is +z toward the pilot.
 return <group position={[7,0,standLayout.terminalFaceZ+.45]}>
  <Block at={[-.9,5.35,-.23]} size={[.12,.2,.55]} color="#738b98"/>
  <Block at={[.9,5.35,-.23]} size={[.12,.2,.55]} color="#738b98"/>
  <Block at={[0,5.35,0]} size={[2.6,1.85,.35]} color="#1b2c38"/>
  <Plate at={[0,5.77,.181]} text="A321" width={2.3} color="#ffc454" background="#071820"/>
  <Plate at={[0,5.25,.184]} text="STOP" width={2.3} color="#ff6259" background="#071820"/>
  <Plate at={[0,4.77,.185]} text={connected?'PBB OK':'ON BLOCK'} width={1.75} color="#6ef0b2" background="#071820"/>
  <Block at={[0,4.14,.18]} size={[.58,.3,.22]} color="#263d4d"/>
  <mesh position={[0,4.14,.3]}><circleGeometry args={[.1,16]}/><meshBasicMaterial color="#6391a9"/></mesh>
  <Annotation at={[0,7,0]} show={show}>VDGS</Annotation>
 </group>;
}

export function BridgeBrand({length}:{length:number}) {
 return <group position={[length*.48,1.45,-1.43]} rotation={[0,Math.PI,0]}>
  <Block size={[2.8,.68,.06]} color="#f4f7f8"/>
  <Plate at={[0,.05,.035]} text="ShinMaywa" width={2.6} color="#234f87" background="#f4f7f8"/>
  <Plate at={[0,-.24,.036]} text="PAXWAY" width={1.25} color="#516b82" background="#f4f7f8"/>
 </group>;
}
export function ServiceRoad({show}:{show:boolean}) {
 return <group position={[0,0,standLayout.roadCenterZ]} rotation={[0,Math.PI/2,0]}>
  <Block at={[0,.014,0]} size={[3.8,.02,56]} color="#58626b"/>
  {[-1.8,1.8].map(x=><Block key={x} at={[x,.03,0]} size={[.06,.015,56]} color="#e5e8e5"/>)}
  {Array.from({length:20},(_,i)=><Block key={i} at={[0,.032,-27+i*2.8]} size={[.055,.014,1.35]} color="#e5e8e5"/>)}
  {[-1,1].map(lane=>[-17,-7,7,17].map(z=><group key={lane+':'+z} position={[lane*.9,.043,z]} rotation={[0,lane===-1?0:Math.PI,0]}>
   <Block at={[0,0,0]} size={[.09,.014,.9]} color="#f0f1e9"/>
   {[-1,1].map(side=><mesh key={side} position={[side*.12,0,.3]} rotation={[0,side*.65,0]}><boxGeometry args={[.07,.014,.4]}/><meshBasicMaterial color="#f0f1e9"/></mesh>)}
  </group>))}

  <Annotation at={[0,.4,12]} show={show}>Đường công vụ</Annotation>
 </group>;
}
