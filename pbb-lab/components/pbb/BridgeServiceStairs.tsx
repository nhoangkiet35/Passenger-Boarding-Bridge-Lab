import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Html,Line} from '@react-three/drei';
import type {Group} from 'three';
import type {Pose} from '@/lib/simulation';
import {stairConfig,stairFrame} from '@/lib/groundOps';
import {Box} from './Models';
import KeyHints from './KeyHints';

export default function BridgeServiceStairs({pose,open=false,label,blocked=false}:{pose:Pose;open?:boolean;label?:string;blocked?:boolean}) {
 const f=stairFrame({bridge:{pose}}),c=stairConfig,door=useRef<Group>(null);
 useFrame((_,dt)=>{if(door.current)door.current.rotation.y+=( (open?-Math.PI/2:0)-door.current.rotation.y)*Math.min(1,dt*9);});
 return <group name="service-stair-tunnel-A" position={[f.x,0,f.z]} rotation={[0,-f.a,0]}>
  <Box at={[0,f.height-.09,(.7+c.side+c.halfWidth)/2]} size={[2,.18,c.side+c.halfWidth-.7]} color="#617b8a"/>
  {[-1,1].map(side=><group key={side}>
   <Box at={[side,f.height+1.05,side===-1?1.25:2.1]} size={[.05,.06,side===-1?.65:1.9]} color="#ffd167"/>
   <Box at={[side,f.height+.5,3.03]} size={[.05,1,.05]} color="#ffd167"/>
  </group>)}
  <Box at={[0,f.height+1.05,3.06]} size={[2,.06,.05]} color="#ffd167"/>
  <Box at={[0,f.height+.52,3.06]} size={[2,.05,.05]} color="#d7e3e8"/>
  {[-1,1].map(s=><Box key={s} at={[s*c.halfDoor,f.height+1.12,c.doorSide]} size={[.07,2.24,.12]} color="#dbe8ea"/>)}
  <Box at={[0,f.height+2.26,c.doorSide]} size={[1.18,.08,.12]} color="#ffd167"/>
  <group ref={door} position={[-c.halfDoor,f.height,c.doorSide]}>
   <Box at={[c.halfDoor,1.1,0]} size={[1.1,2.2,.065]} color="#dbe8e7"/>
   <Box at={[c.halfDoor,1.43,-.04]} size={[.67,.77,.025]} color="#3f7787"/>
   <Box at={[.91,.93,-.075]} size={[.16,.055,.08]} color="#efc44c"/>
   <Box at={[.91,.93,.075]} size={[.16,.055,.08]} color="#efc44c"/>
  </group>
  {Array.from({length:c.steps},(_,i)=>{const tread=c.run/c.steps,x=-c.landingBack-(i+.5)*tread,y=f.height*(1-i/c.steps);return <group key={i}>
   <Box at={[x,y-.055,c.side]} size={[tread,.11,c.halfWidth*2]} color="#bdced6"/>
   <Box at={[x-tread/2+.025,y+.006,c.side]} size={[.045,.016,c.halfWidth*2]} color="#f5cb61"/>
   {i%4===0&&[-1,1].map(s=><Box key={s} at={[x,y+.5,c.side+s*c.halfWidth]} size={[.04,1.05,.04]} color="#dbe8ea"/>)}
  </group>;})}
  {[-1,1].map(s=><group key={s}>
   <Line points={[[-c.landingBack,f.height+1.05,c.side+s*c.halfWidth],[-c.landingBack-c.run,1.05,c.side+s*c.halfWidth]]} color="#ffd167" lineWidth={4}/>
   <Line points={[[-c.landingBack,f.height-.14,c.side+s*.54],[-c.landingBack-c.run,-.14,c.side+s*.54]]} color="#4d6778" lineWidth={8}/>
  </group>)}
  <Html position={[0,f.height+2.6,c.doorSide]} center zIndexRange={[15,0]} style={{pointerEvents:'none',display:label?'block':'none'}}><span className="part-label ops-marker" style={{borderColor:blocked?'#f3a576':'#ffd167'}}><KeyHints text={label??''}/></span></Html>
 </group>;
}
