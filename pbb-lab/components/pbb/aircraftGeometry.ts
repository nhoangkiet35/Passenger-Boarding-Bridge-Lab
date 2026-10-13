import { BufferGeometry, Float32BufferAttribute, Shape } from 'three';
import { technicalConfig } from '@/lib/technicalConfig';

// Local z points aft. Preserve the existing L1 sill and docking plane.
export function aircraftHull() {
  const geometry = new BufferGeometry(), vertices: number[] = [], colors: number[] = [], normals: number[] = [];
  const door=technicalConfig.aircraftDoor;
  const low = Math.asin((door.sill-4.1) / 2), high = Math.asin((door.sill+door.height-4.1) / 2);
  // Sample the entire circle: the doorway must not flatten the full length of the fuselage.
  const angles = [...Array.from({length:129},(_,i)=>low+i*Math.PI*2/128),high,
    Math.asin(-.32),Math.asin(-.26)].sort((a,b)=>a-b);
  const stations = [-15,-14.8,-14,-13,-12,-10.5,-8-door.width/2,-8+door.width/2,22,23.5,25.5,27.5,29.5];
  const radii = [.015,.35,.95,1.5,1.8,2,2,2,2,1.82,1.25,.65,.015];
  for (let j = 0; j < stations.length - 1; j++) for(let slice=0;slice<12;slice++) for (let i = 0; i < angles.length - 1; i++) {
    if (j === 6 && angles[i]>=low && angles[i+1]<=high) continue;
    const span=stations[j+1]-stations[j],delta=radii[j+1]-radii[j];
    const profile=(t:number)=>({radius:radii[j]+delta*t*t*(3-2*t),slope:delta*6*t*(1-t)/span});
    const front = stations[j]+span*slice/12,back=stations[j]+span*(slice+1)/12;
    const a = angles[i], b = angles[i + 1];
    const points = [[a, front], [b, front], [b, back], [a, front], [b, back], [a, back]];
    for (const [angle, z] of points) {
      const {radius,slope}=profile(z===front?slice/12:(slice+1)/12);
      vertices.push(-radius * Math.cos(angle), 4.1 + radius * Math.sin(angle), z);
      const normalLength=Math.hypot(1,slope);
      normals.push(-Math.cos(angle)/normalLength,Math.sin(angle)/normalLength,-slope/normalLength);
      const y = Math.sin(angle);
      colors.push(...(y < -.32 ? [.94, .93, .87] : y < -.26 ? [.88, .72, .19] : [0, .43, .52]));
    }
  }
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.setAttribute('normal',new Float32BufferAttribute(normals,3));
  return geometry;
}

/** A complete, equal-width yellow surround following the curved left-side skin. */
export function aircraftDoorFrame() {
  const door=technicalConfig.aircraftDoor,border=.055;
  const vertices:number[]=[],left=-door.width/2,right=door.width/2,top=door.sill+door.height;
  const strips=[
    [left-border,right+border,door.sill-border,door.sill],
    [left-border,right+border,top,top+border],
    [left-border,left,door.sill,top],
    [right,right+border,door.sill,top],
  ];
  for(const [z0,z1,y0,y1] of strips)for(let i=0;i<48;i++){
    const a=y0+(y1-y0)*i/48,b=y0+(y1-y0)*(i+1)/48;
    for(const [z,y] of [[z0,a],[z1,a],[z1,b],[z0,a],[z1,b],[z0,b]])
      vertices.push(-Math.sqrt(4-(y-4.1)**2)-.025,y,z-8);
  }
  const geometry=new BufferGeometry();
  geometry.setAttribute('position',new Float32BufferAttribute(vertices,3));
  geometry.computeVertexNormals();
  return geometry;
}
export function aircraftSurface(points: [number, number][]) {
  const shape = new Shape();
  points.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
  shape.closePath();
  return shape;
}
