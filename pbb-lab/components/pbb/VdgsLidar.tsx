import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { BufferGeometry, Float32BufferAttribute, type ShaderMaterial } from 'three';
import { aircraftHull } from './aircraftGeometry';
import type { VdgsState } from '@/lib/vdgsSimulation';

function Cloud({ s, running }: { s: VdgsState; running: boolean }) {
  const material = useRef<ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const hull = aircraftHull(), source = hull.getAttribute('position'), vertices: number[] = [];
    for (let i = 0; i < source.count; i += 18) vertices.push(source.getX(i), source.getY(i), source.getZ(i));
    hull.dispose();
    for (const side of [-1,1]) {
      for (let x = 1.5; x < 18; x += .3) for (let chord = 0; chord < 4; chord += .35) vertices.push(side*x,3.15+x*.045,1+x*.48+chord);
      for (let z = -0.4; z < 2.9; z += .16) for (let a = 0; a < Math.PI*2; a += .12) vertices.push(side*4.8+Math.cos(a)*.94,2.15+Math.sin(a)*.94,z);
    }
    for (let z=20;z<28;z+=.25) for(let y=5;y<9-(z-20)*.3;y+=.25) vertices.push(0,y,z);
    const g = new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));return g;
  }, []);
  const ground = useMemo(() => {
    const vertices:number[]=[];
    for(let z=-3;z<100;z+=1.1)for(let x=-26;x<26;x+=.65)vertices.push(x,0,z);
    const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));return g;
  }, []);
  const uniforms=useMemo(()=>({phase:{value:0}}),[]);
  useFrame((_,dt)=>{if(running&&material.current)material.current.uniforms.phase.value+=dt;});
  useEffect(()=>()=>{geometry.dispose();ground.dispose();},[geometry,ground]);
  return <><points geometry={ground}><pointsMaterial size={.08} color="#76943e" transparent opacity={.42} sizeAttenuation/></points>
    <points geometry={geometry} position={[s.offset,0,s.distance+7]}><shaderMaterial ref={material} uniforms={uniforms} transparent depthWrite={false}
      vertexShader={'varying float h; varying float z; void main(){h=position.y;z=position.z;vec4 p=modelViewMatrix*vec4(position,1.0);gl_PointSize=clamp(95.0/-p.z,1.0,4.0);gl_Position=projectionMatrix*p;}'}
      fragmentShader={'uniform float phase; varying float h; varying float z; void main(){if(length(gl_PointCoord-.5)>.5)discard;float band=.5+.5*sin(h*3.0+z*.3-phase*3.0);vec3 c=mix(vec3(.9,.25,.06),vec3(.35,1.0,.35),band);gl_FragColor=vec4(c,.85);}'}
    /></points>
  </>;
}
export default function VdgsLidar({s,running}:{s:VdgsState;running:boolean}) {
  return <div className="vdgs-lidar" aria-label="Đám mây điểm LiDAR mô phỏng"><span>LiDAR · QUÉT 3D {running?'●':'Ⅱ'}</span><Canvas dpr={[1,1.3]} camera={{position:[0,9,-23],fov:48,far:200}} onCreated={({camera})=>camera.lookAt(0,3,20)}><color attach="background" args={['#030606']}/><Cloud s={s} running={running}/></Canvas><small>Dữ liệu điểm tạo từ mô hình 3D</small></div>;
}
