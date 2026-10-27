import { Line } from '@react-three/drei';
import { Box } from './Models';
import KeyHints from './KeyHints';
import { Html } from '@react-three/drei';
import { mobileStepsConfig as c, mobileReady, mobileTreads, type MobileSteps } from '@/lib/mobileSteps';

export default function MobileServiceSteps({steps:l}:{steps:MobileSteps}) {
 const ready=mobileReady(l),locked=l.phase==='locked';
 return <>
  <Line points={[[c.target[0]-.75,.025,c.target[2]-1],[c.target[0]+.75,.025,c.target[2]-1],[c.target[0]+.75,.025,c.target[2]+1],[c.target[0]-.75,.025,c.target[2]+1],[c.target[0]-.75,.025,c.target[2]-1]]} color={ready?'#71e5b6':'#86c6ff'} lineWidth={3} dashed dashSize={.25} gapSize={.12}/>
  <Html position={[c.target[0],.12,c.target[2]+1.5]} center style={{pointerEvents:'none'}}><span className="ops-marker">PWS · ĐỖ SÀN THANG TẠI ĐÂY →</span></Html>
  <group name="mobile-pws-service-stairs" position={[l.x,0,l.z]} rotation={[0,-l.angle,0]}>
   {[-1,1].map(s=><group key={s}>
    <Box at={[-1.5,.35,s*.78]} size={[4.2,.12,.1]} color="#527384"/>
    <Line points={[[-3.6,.18,s*.65],[-.6,c.height-.15,s*.65],[.6,c.height-.15,s*.65]]} color="#5c7b8b" lineWidth={8}/>
    <Line points={[[-3.6,1.05,s*c.halfWidth],[-.6,c.height+1.05,s*c.halfWidth],[.6,c.height+1.05,s*c.halfWidth]]} color="#ffd167" lineWidth={4}/>
    {[-3.35,.3].map(x=><group key={x} position={[x,.2,s*.84]}>
     <group rotation={[0,locked?0:l.angle*.3,0]}><mesh rotation={[Math.PI/2,0,l.travel/.18]}><cylinderGeometry args={[.18,.18,.13,16]}/><meshStandardMaterial color="#233b49"/></mesh></group>
     <Box at={[0,.18,0]} size={[.08,.16,.1]} color="#a1b7c3"/>
     <Box at={[0,locked?-.15:.08,s*.14]} size={[.24,.06,.2]} color={locked?'#ef9d50':'#c4d2db'}/>
    </group>)}
    {[-3.6,-2.6,-1.6,-.6,.6].map(x=>{const h=x<=-.6?c.height*(x+3.6)/3:c.height;return <Box key={x} at={[x,h+.5,s*c.halfWidth]} size={[.04,1.05,.04]} color="#e0edf0"/>;})}
    <Box at={[.35,c.height/2,s*.65]} size={[.08,c.height,.08]} color="#69899a"/>
   </group>)}
   {mobileTreads().map((t,i)=><group key={i}><Box at={t.at} size={t.size} color={i===c.steps?'#7d9fac':'#c3d6dd'}/>{i<c.steps&&<Box at={[t.at[0]-.13,t.at[1]+.057,0]} size={[.04,.015,1.4]} color="#f2cc70"/>}</group>)}
   <Line points={[[-4.15,.25,-.5],[-4.15,1,-.5],[-4.15,1,.5],[-4.15,.25,.5]]} color="#ffd167" lineWidth={5}/>
   <Box at={[-4.15,.95,0]} size={[.07,.09,.75]} color="#244856"/>
   <Box at={[-.6,.3,-.96]} size={[.28,.1,.26]} color={locked?'#6bdfad':'#f8bd68'}/>
   <Html position={[-3.4,1.8,0]} center style={{pointerEvents:'none'}}><span className="ops-marker"><KeyHints text={l.phase==='pushing'?'E · BUÔNG TAY ĐẨY':locked?'THANG ĐÃ CHỐT BÁNH · LEO LÊN':'E · LẤY THANG / F · CHỐT BÁNH'}/></span></Html>
  </group>
 </>;
}
