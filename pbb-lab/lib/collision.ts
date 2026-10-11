import type { Pose } from './simulationTypes.ts';
import { standLayout } from './standLayout.ts';
import { technicalConfig as c } from './technicalConfig.ts';
export type Volume = { part:string; centre:[number,number,number]; half:[number,number,number]; yaw:number };
export type Obstacle = { id:string; kind:'person'|'vehicle'; x:number; z:number; radius:number; height:number };
const rad=(v:number)=>v*Math.PI/180;
/** Conservative oriented volumes, simulation assumptions, not certified sensor zones. */
export function bridgeVolumes(p:Pose):Volume[]{
  const a=rad(p.angle),heading=a+rad(p.cabYaw);
  const world=(x:number,y:number,z=0):[number,number,number]=>[standLayout.rotundaX+x*Math.cos(a)-z*Math.sin(a),y,standLayout.rotundaZ+x*Math.sin(a)+z*Math.cos(a)];
  const cabin=world(p.length,p.height);
  const slope=Math.atan2(p.height-c.rotundaHeight,p.length);
  return [
    {part:'Cabin',centre:[cabin[0]+c.cabinOffset*Math.cos(heading),p.height+1.2,cabin[2]+c.cabinOffset*Math.sin(heading)],half:[1,1.3,1.375],yaw:heading},
    {part:'Cụm bánh xe / cột nâng',centre:world(p.length-c.carriageOffset,(p.height+2.8)/2),half:[.8,(p.height+2.8)/2,1.8],yaw:a},
    ...Array.from({length:12},(_,i)=>{
      const x=p.length*(i+.5)/12;
      return {part:'Tunnel',centre:world(x,c.rotundaHeight+x*Math.tan(slope)+1.2),half:[p.length/24+.1,1.45,1.325] as [number,number,number],yaw:a};
    }),
  ];
}
function bounds(v:Volume){
  const x=Math.abs(Math.cos(v.yaw))*v.half[0]+Math.abs(Math.sin(v.yaw))*v.half[2];
  const z=Math.abs(Math.sin(v.yaw))*v.half[0]+Math.abs(Math.cos(v.yaw))*v.half[2];
  return {min:[v.centre[0]-x,v.centre[1]-v.half[1],v.centre[2]-z],max:[v.centre[0]+x,v.centre[1]+v.half[1],v.centre[2]+z]};
}
export function obstacleContact(v:Volume,o:Obstacle){
  if(v.centre[1]-v.half[1]>o.height)return false;
  const dx=o.x-v.centre[0],dz=o.z-v.centre[2];
  const x=dx*Math.cos(v.yaw)+dz*Math.sin(v.yaw),z=-dx*Math.sin(v.yaw)+dz*Math.cos(v.yaw);
  return Math.hypot(Math.max(0,Math.abs(x)-v.half[0]),Math.max(0,Math.abs(z)-v.half[2]))<=o.radius;
}
export function collision(p:Pose,obstacles:Obstacle[]):string|null{
  for(const v of bridgeVolumes(p)){
    const b=bounds(v);
    if(b.min[1]<-.02)return v.part+' / mặt sân';
    if(b.min[2]<standLayout.terminalFaceZ)return v.part+' / nhà ga';
    for(const o of obstacles)if(obstacleContact(v,o))return v.part+' / '+o.kind+' '+o.id;
    // Wing/engine envelopes for the single illustrative aircraft, conservatively bounded.
    if(b.max[0]>-10.9&&b.min[0]<24.9&&b.max[2]>7.8&&b.min[2]<19.2&&b.max[1]>2.9&&b.min[1]<3.7)return v.part+' / vùng cánh minh họa';
    if(b.max[0]>1.2&&b.min[0]<3.2&&b.max[2]>7.5&&b.min[2]<10.9&&b.max[1]>1.1&&b.min[1]<3.2)return v.part+' / vùng động cơ minh họa';
  }
  return null;
}
