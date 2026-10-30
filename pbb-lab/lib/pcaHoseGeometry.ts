import { CatmullRomCurve3, CubicBezierCurve3, TubeGeometry, Vector3 } from 'three';

export const pcaReelLayout={mount:[-1.7,-.78,0] as const,spacing:.65,outlet:[.25,-.86,-.46] as const,lipDrop:.10};
/** The last control points share x/z, making the connector point vertically down. */
export function reelOutletCurve(){return new CubicBezierCurve3(new Vector3(.25,-.38,0),new Vector3(.25,-.70,-.02),new Vector3(.25,-.60,-.46),new Vector3(...pcaReelLayout.outlet));}

/** A broad fabric duct wound around the drum, with soft irregular folds. */
export function reelFabricGeometry(){
 const path=new CatmullRomCurve3(Array.from({length:97},(_,i)=>{
  const t=i/96,a=-Math.PI/2+t*Math.PI*3.6,r=.285+.012*Math.sin(a*3);
  return new Vector3(Math.cos(a)*r,Math.sin(a)*r,-.16+t*.32);
 }));
 const geometry=new TubeGeometry(path,144,.14,12,false),vertices=geometry.attributes.position;
 for(let i=0;i<=144;i++){
  const center=path.getPointAt(i/144);
  for(let j=0;j<=12;j++){
   const index=i*13+j,v=new Vector3().fromBufferAttribute(vertices,index).sub(center);
   v.multiplyScalar(1+.09*Math.sin(i*.92+j*.55)+.035*Math.sin(i*2.1-j*1.7)).add(center);
   vertices.setXYZ(index,v.x,v.y,v.z);
  }
 }
 geometry.computeVertexNormals();geometry.computeBoundingBox();return geometry;
}
