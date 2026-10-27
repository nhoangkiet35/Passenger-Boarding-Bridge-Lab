import { CurvePath, LineCurve3, QuadraticBezierCurve3, Raycaster, Vector3, type Object3D } from 'three';
import { cableControlPoints, cableFreeEnd, distance, groundConfig, serviceMount, type Mission, type Point, type ServiceId } from './groundOps.ts';

/** Rounded polyline, not a soft-body solver. The same curve drives tube rendering and collision. */
export function cableCurve(points:Point[]) {
 const pts=points.filter((p,i)=>!i||distance(p,points[i-1])>.015).map(p=>new Vector3(...p));
 const curve=new CurvePath<Vector3>();let previous=pts[0];
 for(let i=1;i<pts.length-1;i++){
  const corner=pts[i],next=pts[i+1],radius=Math.min(.09,corner.distanceTo(previous)*.2,corner.distanceTo(next)*.2);
  const entry=corner.clone().lerp(previous,radius/Math.max(.001,corner.distanceTo(previous))),exit=corner.clone().lerp(next,radius/Math.max(.001,corner.distanceTo(next)));
  curve.add(new LineCurve3(previous,entry));curve.add(new QuadraticBezierCurve3(entry,corner,exit));previous=exit;
 }
 curve.add(new LineCurve3(previous,pts[pts.length-1]??previous));return curve;
}
export type SegmentClear=(from:Point,to:Point)=>boolean;
export function clearCableSegment(from:Point,to:Point,solids:Object3D|Object3D[]|null,ray:Raycaster,radius:number){
 const start=new Vector3(...from),delta=new Vector3(...to).sub(start),length=delta.length();if(length<.001)return true;
 delta.normalize();ray.far=length;
 const side=new Vector3(-delta.z,0,delta.x).normalize().multiplyScalar(radius);
 const offsets=[side.clone().negate(),new Vector3(),side,new Vector3(0,radius,0),new Vector3(0,-radius,0)];
 for(const offset of offsets){ray.set(start.clone().add(offset),delta);if(solids&&(Array.isArray(solids)?ray.intersectObjects(solids,false):ray.intersectObject(solids,true)).length)return false;}
 return true;
}
/** Keep bends around obstacles, and reel in old bends when there is a clear direct path. */
export function pullCableRoute(previous:Point[],guide:Point,end:Point,clear:SegmentClear):Point[]|null {
 const target:Point=[end[0],.16,end[2]],path=previous.length?previous:[guide];
 for(let i=0;i<path.length;i++)if(clear(path[i],target))return [...path.slice(0,i+1),target];
 return null;
}
export function planCable(m:Mission,id:ServiceId,end:Point,clear:SegmentClear) {
 const mount=serviceMount(m,id),route=pullCableRoute(m.cableRoutes[id],mount.guide,cableFreeEnd(m,id,end),clear);
 if(!route||route.length>128)return null;
 const curve=cableCurve(cableControlPoints(m,id,end,route));
 if(curve.getLength()>groundConfig.services[id].maxLength)return null;
 const points=curve.getSpacedPoints(64);
 // Fixed lead from the bridge housing to its fairlead is fitted to the existing model.
 // Test the free portion after the guide, including the rising connector in the player's hand.
 const prefix=cableCurve([mount.anchor,mount.pickup,mount.guide]).getLength();
 let travelled=0;
 for(let i=1;i<points.length;i++){
  travelled+=points[i].distanceTo(points[i-1]);
  if(travelled>prefix+.18&&!clear(points[i-1].toArray() as Point,points[i].toArray() as Point))return null;
 }
 return {route,curve,length:curve.getLength()};
}
