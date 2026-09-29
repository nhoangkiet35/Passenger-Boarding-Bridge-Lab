import { Html } from '@react-three/drei';
import type { Pose } from '@/lib/simulation';
import { metrics } from '@/lib/simulation';
export function Box({at=[0,0,0],size=[1,1,1],color='#cbd5df',...props}:{at?:[number,number,number];size?:[number,number,number];color?:string;rotation?:[number,number,number]}){return <mesh position={at} castShadow receiveShadow {...props}><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.65}/></mesh>;}
function Label({at,children,visible=true}:{at:[number,number,number];children:React.ReactNode;visible?:boolean}){return <Html position={at} center zIndexRange={[20,0]} style={{pointerEvents:'none',display:visible?'block':'none'}}><span className="part-label">{children}</span></Html>;}
export function PBB({pose:p,labels}:{pose:Pose;labels:boolean}){
 const slope=Math.atan2(p.height-3,p.length),len=Math.hypot(p.length,p.height-3);
 return <group position={[-12,0,0]} rotation={[0,-p.angle*Math.PI/180,0]}>
  <mesh position={[0,3.9,0]} castShadow><cylinderGeometry args={[1.6,1.6,2.7,32]}/><meshStandardMaterial color="#e4ebee"/></mesh>
  <mesh position={[0,1.3,0]} castShadow><cylinderGeometry args={[.65,.85,2.6,16]}/><meshStandardMaterial color="#4e6977"/></mesh>
  <mesh position={[0,5.3,0]} castShadow><cylinderGeometry args={[1.75,1.75,.18,32]}/><meshStandardMaterial color="#229aab"/></mesh>
  <Label visible={labels} at={[0,6.3,0]}>01 · Rotunda</Label>
  <group position={[0,3,0]} rotation={[0,0,slope]}>
   {[0,1,2].map(i=>{const x=i*(len-6)/2+3;const width=2.65-i*.18;return <group key={i} position={[x,0,0]}>
    <Box at={[0,.03,0]} size={[6,.22,width]} color="#687d89"/>
    <Box at={[0,2.35,0]} size={[6,.18,width]} color={i===2?'#dae7eb':'#f4f8f9'}/>
    {[-1,1].map(side=><group key={side}>
     <Box at={[0,.42,side*width/2]} size={[6,.65,.09]} color="#d9e4e9"/>
     <mesh position={[0,1.5,side*width/2]}><boxGeometry args={[5.9,1.5,.045]}/><meshStandardMaterial color="#80baca" transparent opacity={.47} metalness={.15} roughness={.2}/></mesh>
     {[-3,-1.5,0,1.5,3].map(v=><Box key={v} at={[v,1.25,side*width/2]} size={[.07,2.25,.12]} color="#f0f5f6"/>)}
     <Box at={[0,.8,side*width/2]} size={[6,.09,.14]} color="#2795a4"/>
    </group>)}
   </group>;})}
   <Label visible={labels} at={[len/2,3.45,0]}>02 · Ống lồng</Label>
  </group>
  <group position={[p.length,p.height,0]}>
   <Box at={[0,.04,0]} size={[2,.25,2.75]} color="#556975"/>
   <Box at={[0,2.4,0]} size={[2.15,.22,2.85]} color="#1d9eb0"/>
   {[-1,1].map(side=><group key={side}><Box at={[0,.45,side*1.35]} size={[2,.65,.12]} color="#eaf0f2"/><mesh position={[0,1.55,side*1.35]}><boxGeometry args={[1.9,1.5,.08]}/><meshStandardMaterial color="#84baca" transparent opacity={.6}/></mesh>{[-.96,.9].map(x=><Box key={x} at={[x,1.3,side*1.35]} size={[.1,2.5,.12]} color="#d9e2e6"/>)}</group>)}
   <Box at={[0,-p.height/2,0]} size={[.7,p.height,1.3]} color="#718591"/>
   <Box at={[0,-p.height+.6,0]} size={[1.7,.35,3.3]} color="#344a58"/>
   {[-1,1].map(side=>[-.5,.5].map(x=><mesh key={`${side}${x}`} position={[x,-p.height+.4,side*1.5]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.4,.4,.28,20]}/><meshStandardMaterial color="#202f39"/></mesh>))}
   <group position={[1,0,0]}>
    {Array.from({length:6},(_,i)=>{const x=.01+i*(.01+p.canopy*(metrics(p).gap-.06)/5);return <group key={i}><Box at={[x,2.2,0]} size={[.055,.22,2.55]} color={i%2?'#485561':'#293b46'}/>{[-1,1].map(side=><Box key={side} at={[x,1.15,side*1.2]} size={[.055,2.2,.18]} color={i%2?'#485561':'#293b46'}/>)}</group>;})}
   </group>
   <><Label visible={labels} at={[0,3.6,-2]}>03 · Cabin</Label><Label visible={labels} at={[1.4,2.9,2.7]}>04 · Canopy</Label><Label visible={labels} at={[0,-p.height+.4,2.7]}>05 · Cụm di chuyển</Label></>
  </group>
  <mesh position={[p.length,.04,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[1.7,2.05,48]}/><meshBasicMaterial color={metrics(p).gap<.65?'#ee7655':'#26bdc9'} transparent opacity={.7}/></mesh>
 </group>;
}
export function Aircraft({labels}:{labels:boolean}){
 return <group position={[7,0,8]}>
  <mesh position={[0,4.1,0]} rotation={[Math.PI/2,0,0]} castShadow receiveShadow><cylinderGeometry args={[2,2,21,48]}/><meshStandardMaterial color="#eff4f6" roughness={.4}/></mesh>
  <mesh position={[0,4.1,-10.5]} scale={[2,2,4.2]} castShadow><sphereGeometry args={[1,36,24]}/><meshStandardMaterial color="#edf3f5"/></mesh>
  <mesh position={[0,4.1,13.4]} rotation={[Math.PI/2,0,0]} castShadow><coneGeometry args={[2,6,36]}/><meshStandardMaterial color="#d8e5ed"/></mesh>
  {[-1,1].map(side=><group key={side}>
   {Array.from({length:17},(_,i)=><mesh key={i} position={[side*1.91,4.7,-8+i*.94]}><sphereGeometry args={[.17,10,10]}/><meshStandardMaterial color="#365d75"/></mesh>)}
   <Box at={[side*5.3,3.35,3.2]} size={[9,.22,3.8]} rotation={[0,side*-.32,0]} color="#c8d9e4"/>
   <Box at={[side*9.6,3.9,4.6]} size={[.18,1.3,1.7]} color="#299eaf"/>
   <mesh position={[side*4.4,2.55,1]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.83,.75,2.5,32]}/><meshStandardMaterial color="#e6edf0"/></mesh>
   <mesh position={[side*4.4,2.55,-.27]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.64,.64,.05,32]}/><meshStandardMaterial color="#223c4c"/></mesh>
   <Box at={[side*2.6,4.55,13]} size={[5,.15,2]} rotation={[0,-side*.4,0]} color="#bccfdd"/>
  </group>)}
  <Box at={[0,6.8,12.8]} size={[.25,5.3,3.5]} rotation={[.24,0,0]} color="#218b9e"/>
  <Box at={[0,6.9,12.5]} size={[.28,.45,3.5]} color="#63d9dc"/>
  <Box at={[-2.018,4.34,-8]} size={[.055,1.88,.95]} color="#218ea0"/>
  <Box at={[-2.055,4.36,-8]} size={[.06,1.65,.72]} color="#e4f0f2"/>
  <Box at={[-2.09,4.82,-8]} size={[.065,.3,.27]} color="#385c71"/>
  <mesh position={[0,4.9,-13.8]} scale={[1.1,.38,.2]}><sphereGeometry args={[1,20,16]}/><meshStandardMaterial color="#315b73"/></mesh>
  {[-7,4].map(z=><group key={z}><Box at={[0,1.4,z]} size={[.18,1.9,.2]} color="#607580"/>{[-.45,.45].map(x=><mesh key={x} position={[x,.5,z]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.5,.5,.35,18]}/><meshStandardMaterial color="#273742"/></mesh>)}</group>)}
  <Label visible={labels} at={[0,7.4,-10]}>Cửa trước bên trái</Label>
 </group>;
}




