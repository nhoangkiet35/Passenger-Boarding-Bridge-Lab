import { useEffect, useMemo } from 'react';
import { DoubleSide, Quaternion, TubeGeometry, Vector3 } from 'three';
import { pcaReelLayout as layout, reelFabricGeometry, reelOutletCurve } from '@/lib/pcaHoseGeometry';

function MetalBar({at,size}:{at:[number,number,number];size:[number,number,number]}){return <mesh position={at} castShadow><boxGeometry args={size}/><meshStandardMaterial color="#b9c1c1" metalness={.65} roughness={.45}/></mesh>;}

export default function PCAHoseReels(){
 const parts=useMemo(()=>{
  const curve=reelOutletCurve();return {fabric:reelFabricGeometry(),neck:new TubeGeometry(curve,32,.118,12,false),ribs:Array.from({length:13},(_,i)=>{const t=i/14;return {at:curve.getPointAt(t),rotation:new Quaternion().setFromUnitVectors(new Vector3(0,0,1),curve.getTangentAt(t))};})};
 },[]);
 useEffect(()=>()=>{parts.fabric.dispose();parts.neck.dispose();},[parts]);
 return <group name="pca-twin-hose-reels" position={[...layout.mount]}>
  {[-layout.spacing,layout.spacing].map(z=><group key={z} position={[0,0,z]}>
   <MetalBar at={[0,.65,0]} size={[1.12,.09,.85]}/>
   <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.17,.17,.56,24]}/><meshStandardMaterial color="#626b6f" metalness={.55}/></mesh>
   <mesh geometry={parts.fabric} castShadow><meshStandardMaterial color="#f46c27" roughness={.95} side={DoubleSide}/></mesh>
   {[-.30,.30].map(side=><group key={side} position={[0,0,side]}>
    <mesh rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.51,.51,.025,48]}/><meshStandardMaterial color="#bdc3c2" metalness={.65} roughness={.48}/></mesh>
    <mesh><torusGeometry args={[.51,.018,8,48]}/><meshStandardMaterial color="#e1e5e2" metalness={.7} roughness={.3}/></mesh>
    <mesh position={[0,0,side<0?-.025:.025]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.09,.09,.045,20]}/><meshStandardMaterial color="#818d90" metalness={.7}/></mesh>
   </group>)}
   {[-.40,.40].map(x=><MetalBar key={x} at={[x,.20,-.38]} size={[.055,.85,.065]}/>)}
   <MetalBar at={[0,-.21,-.38]} size={[.85,.06,.065]}/>
   <mesh position={[0,.09,-.43]} castShadow><boxGeometry args={[.49,.52,.18]}/><meshStandardMaterial color="#e4e4da" metalness={.25} roughness={.65}/></mesh>
   <mesh position={[.26,.12,-.41]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.085,.085,.15,16]}/><meshStandardMaterial color="#a0aaa9" metalness={.6}/></mesh>
   {[-.20,.20].flatMap(x=>[-.12,.30].map(y=><mesh key={`${x}-${y}`} position={[x,y,-.529]}><sphereGeometry args={[.012,6,6]}/><meshStandardMaterial color="#687274" metalness={.8}/></mesh>))}
   <MetalBar at={[-.12,.06,.36]} size={[.20,.18,.12]}/>
   <mesh geometry={parts.neck} castShadow><meshStandardMaterial color="#e7b12b" roughness={.88} side={DoubleSide}/></mesh>
   {parts.ribs.map(({at,rotation},i)=><mesh key={i} position={at} quaternion={rotation}><torusGeometry args={[.119,.010,6,20]}/><meshStandardMaterial color="#39362a" roughness={.8}/></mesh>)}
   <group name="pca-downward-connector" position={[...layout.outlet]}>
    <mesh><cylinderGeometry args={[.142,.142,.18,28,1,true]}/><meshStandardMaterial color="#e5b633" roughness={.5} metalness={.3} side={DoubleSide}/></mesh>
    <mesh><cylinderGeometry args={[.148,.148,.083,28,1,true]}/><meshStandardMaterial color="#252c2c" roughness={.65} side={DoubleSide}/></mesh>
    <mesh position={[0,-layout.lipDrop,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.125,.018,8,28]}/><meshStandardMaterial color="#e8b52b" metalness={.4}/></mesh>
    <mesh rotation={[Math.PI/2,0,0]} position={[0,.045,0]}><circleGeometry args={[.119,24]}/><meshStandardMaterial color="#18201f" side={DoubleSide}/></mesh>
    {[-1,1].map(side=><MetalBar key={side} at={[side*.152,.015,0]} size={[.035,.09,.07]}/>)}
   </group>
  </group>)}
 </group>;
}
