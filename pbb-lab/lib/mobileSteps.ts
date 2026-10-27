import type { Point } from './groundOps.ts';

export type MobileSteps = { x:number; z:number; angle:number; phase:'parked'|'pushing'|'locked'; travel:number; climbed:boolean };
export const mobileStepsConfig = {
 park:[-9,0,18] as Point,target:[5.1,0,34] as Point,height:1.5,run:3,steps:10,
 landingHalf:.6,halfWidth:.75,handleX:-4.15,positionTolerance:.55,angleTolerance:12*Math.PI/180,speed:1.25,turnRate:.65,
};
export const initialMobileSteps=():MobileSteps=>({x:mobileStepsConfig.park[0],z:mobileStepsConfig.park[2],angle:0,phase:'parked',travel:0,climbed:false});
export function mobileTreads(){const c=mobileStepsConfig;return [...Array.from({length:c.steps},(_,i)=>({at:[-3.6+(i+.5)*c.run/c.steps,c.height*(i+1)/c.steps-.05,0] as Point,size:[c.run/c.steps,.1,1.4] as Point})),{at:[0,c.height-.06,0] as Point,size:[1.2,.12,1.4] as Point}];}
export function mobileWorld(l:MobileSteps,x:number,y:number,z:number):Point{return [l.x+x*Math.cos(l.angle)-z*Math.sin(l.angle),y,l.z+x*Math.sin(l.angle)+z*Math.cos(l.angle)];}
export function mobileLocal(l:MobileSteps,p:Point){const x=p[0]-l.x,z=p[2]-l.z;return {x:x*Math.cos(l.angle)+z*Math.sin(l.angle),z:-x*Math.sin(l.angle)+z*Math.cos(l.angle)};}
export const mobileHandle=(l:MobileSteps):Point=>mobileWorld(l,mobileStepsConfig.handleX,0,0);
export const mobileBrake=(l:MobileSteps):Point=>mobileWorld(l,-mobileStepsConfig.landingHalf,.25,-mobileStepsConfig.halfWidth-.2);
export function mobileReady(l:MobileSteps){const c=mobileStepsConfig,angle=Math.atan2(Math.sin(l.angle),Math.cos(l.angle));return Math.hypot(l.x-c.target[0],l.z-c.target[2])<=c.positionTolerance&&Math.abs(angle)<=c.angleTolerance;}
export function mobileFloor(l:MobileSteps,p:Point):number|null {
 const q=mobileLocal(l,p),c=mobileStepsConfig;if(l.phase!=='locked'||Math.abs(q.z)>c.halfWidth-.28)return null;
 if(q.x>=-c.landingHalf&&q.x<=c.landingHalf)return c.height;
 if(q.x< -c.landingHalf&&q.x>=-c.landingHalf-c.run)return c.height*Math.ceil((q.x+c.landingHalf+c.run)/(c.run/c.steps))/c.steps;
 return null;
}
export function onMobilePlatform(l:MobileSteps,p:Point){const q=mobileLocal(l,p),c=mobileStepsConfig;return l.phase==='locked'&&p[1]>=c.height-.08&&Math.abs(q.x)<=c.landingHalf&&Math.abs(q.z)<c.halfWidth-.28;}
export function mobilePassable(l:MobileSteps,from:Point,to:Point){
 const q=mobileLocal(l,to),c=mobileStepsConfig,inside=q.x>=-c.landingHalf-c.run&&q.x<=c.landingHalf&&Math.abs(q.z)<c.halfWidth+.2;
 if(!inside)return true;
 const floor=mobileFloor(l,to);return floor!==null&&Math.abs(floor-from[1])<.24;
}
export function moveMobile(l:MobileSteps,forward:number,turn:number,dt:number){
 const c=mobileStepsConfig,angle=l.angle+turn*c.turnRate*dt,step=forward*c.speed*dt;
 return {...l,angle,x:l.x+Math.cos(angle)*step,z:l.z+Math.sin(angle)*step,travel:l.travel+step};
}
export function mobileMoveAllowed(from:MobileSteps,to:MobileSteps,clear:(a:Point,b:Point)=>boolean){
 if(Math.abs(to.x)>=35||to.z<=-18||to.z>=40)return false;
 for(const x of [-4.15,-3.8,-1.5,.8])for(const z of [-1,0,1])for(const y of [.3,1.1,2.45])if(!clear(mobileWorld(from,x,y,z),mobileWorld(to,x,y,z)))return false;
 return true;
}
/** PWS hose passes outside the stair stringer and over the handrail, not through the treads. */
export function mobileHoseGuides(l:MobileSteps,end:Point):Point[]|null {
 const q=mobileLocal(l,end),c=mobileStepsConfig;
 if(l.phase!=='locked'||!mobileReady(l)||end[1]<.8||q.x< -c.landingHalf-c.run-.4||q.x>1.8||Math.abs(q.z)>1.5)return null;
 const railX=Math.min(0,Math.max(-c.landingHalf-c.run,q.x));
 const floor=Math.max(0,Math.min(c.height,c.height*(railX+c.landingHalf+c.run)/c.run));
 return [mobileWorld(l,-c.landingHalf-c.run-.3,.16,-c.halfWidth-.25),mobileWorld(l,railX,Math.max(end[1]+.4,floor+1.2),-c.halfWidth-.25)];
}
