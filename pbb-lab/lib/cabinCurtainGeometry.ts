/** Cylindrical bellows centred on the vertical pivot; rear edges attach to the
 * fixed tunnel and front edges follow yaw. Coordinates are in the cabin frame. */
export const CABIN_SWIVEL_RADIUS=1.82;
export function cabinCurtainPanels(yaw:number){
 const a=yaw*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 const front=Math.asin(1.39/CABIN_SWIVEL_RADIUS),rear=Math.PI-Math.asin(1.27/CABIN_SWIVEL_RADIUS),panels=[];
 const local=(theta:number,r:number):[number,number]=>{
  const x=r*Math.cos(theta),z=r*Math.sin(theta);
  return [x*c+z*s,-x*s+z*c];
 };
 for(const side of [-1,1]){
  const start=a+side*front,end=side*rear;
  const point=(i:number)=>local(start+(end-start)*i/32,CABIN_SWIVEL_RADIUS+(i%2?.035:0));
  for(let i=0;i<32;i++)panels.push({from:point(i),to:point(i+1),index:i});
 }
 return panels;
}
