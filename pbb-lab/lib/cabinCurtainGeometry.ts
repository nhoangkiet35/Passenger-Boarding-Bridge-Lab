/** The outer envelope of both entrances keeps pleats out of the passenger passage. */
export function cabinCurtainPanels(yaw:number){
 const a=yaw*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 const rotate=(x:number,z:number):[number,number]=>[x*c-z*s,x*s+z*c];
 const points:[[number,number],...Array<[number,number]>]=[[-1.7,-1.27],[-1.7,1.27],[0,-1.27],[0,1.27],...([.785,1.785].flatMap(x=>[-1.39,1.39].map(z=>rotate(x,z))))];
 points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const cross=(o:number[],a:number[],b:number[])=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 const lower:Array<[number,number]>=[],upper:Array<[number,number]>=[];
 for(const p of points){while(lower.length>=2&&cross(lower.at(-2)!,lower.at(-1)!,p)<=0)lower.pop();lower.push(p);}
 for(const p of [...points].reverse()){while(upper.length>=2&&cross(upper.at(-2)!,upper.at(-1)!,p)<=0)upper.pop();upper.push(p);}
 const hull=[...lower.slice(0,-1),...upper.slice(0,-1)],panels=[];
 const local=(p:number[]):[number,number]=>[p[0]*c+p[1]*s,-p[0]*s+p[1]*c];
 for(let k=0;k<hull.length;k++){const from=local(hull[k]),to=local(hull[(k+1)%hull.length]);
  if(Math.abs(hull[k][0]+1.7)<1e-8&&Math.abs(hull[(k+1)%hull.length][0]+1.7)<1e-8)continue;
  if(Math.abs(from[0]-1.785)<1e-8&&Math.abs(to[0]-1.785)<1e-8)continue;
  for(let i=0;i<8;i++){const p=(u:number):[number,number]=>[from[0]+(to[0]-from[0])*u,from[1]+(to[1]-from[1])*u];panels.push({from:p(i/8),to:p((i+1)/8),index:i});}
 }
 return panels;
}
