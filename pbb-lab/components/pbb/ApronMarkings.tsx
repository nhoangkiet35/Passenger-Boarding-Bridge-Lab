import {apronAlignment,apronPlateLefts} from '@/lib/apronAlignment';
import { useEffect, useState } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { bridgeParkingZone } from '@/lib/bridgeParkingZone';
import { standLayout } from '@/lib/standLayout';

type XY=[number,number];
const edge=standLayout.roadCenterZ+standLayout.roadWidth/2;
const width=standLayout.roadLength,near=standLayout.roadCenterZ-standLayout.roadWidth/2-.2,far=48;
const center=apronAlignment.center;
const red='#ac3b2d',white='#f1efe3',yellow='#f2ce38';

/** Ground paint follows the supplied stand photograph; all marks remain flat scenery. */
export default function ApronMarkings(){
 const [texture,setTexture]=useState<CanvasTexture|null>(null);
 useEffect(()=>{
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=2048;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.scale(canvas.width/width,canvas.height/(far-near));ctx.translate(width/2,-near);
  ctx.lineJoin='round';ctx.lineCap='butt';
  const path=(points:XY[],color:string,lineWidth=.09,close=false)=>{
   ctx.beginPath();points.forEach(([x,z],i)=>i?ctx.lineTo(x,z):ctx.moveTo(x,z));if(close)ctx.closePath();ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.stroke();
  };
  const label=(text:string,x:number,z:number,size=.6,color=red)=>{ctx.fillStyle=color;ctx.font=`bold ${size}px Arial, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x,z);};
  const box=(x:number,z:number,w:number,h:number,color:string,lineWidth=.09)=>path([[x,z],[x+w,z],[x+w,z+h],[x,z+h]],color,lineWidth,true);
  const hatch=(points:XY[],color:string,spacing=1.2)=>{
   ctx.save();ctx.beginPath();points.forEach(([x,z],i)=>i?ctx.lineTo(x,z):ctx.moveTo(x,z));ctx.closePath();ctx.clip();
   for(let x=-width*2;x<width*2;x+=spacing)path([[x,near],[x+far-near,far]],color,.07);
   ctx.restore();path(points,color,.12,true);
  };
  // Concrete joints stop at the road edge, rather than crossing the asphalt.
  for(let x=-42;x<=42;x+=6)path([[x,edge+.2],[x,far]],'#8c9692',.025);
  for(let z=edge+.2;z<=far;z+=6)path([[-42,z],[42,z]],'#8c9692',.025);
  // Lead-in and the aircraft envelope: white outer line, red inner line.
  path([[center,edge+3],[center,far]],yellow,.13);
  const envelope:XY[]=[[center-21,31],[center-21,7],[center-apronAlignment.noseHalfWidth,-4],[center-apronAlignment.noseHalfWidth,edge+3],[center+apronAlignment.noseHalfWidth,edge+3],[center+apronAlignment.noseHalfWidth,-4],[center+21,7],[center+21,31]];
  path(envelope,white,.30);path(envelope,red,.12);
  // Restore the tapered apron parking bay, away from the service road.
  hatch(bridgeParkingZone,red,1.15);
  hatch([[center+.7,4],[center+2.7,5],[center+2.7,35],[center+.7,34]],red,1.5);
  // Aircraft-type stop-position plates, matching the visual arrangement of the photo.
  [['A330','A340'],['B777 / B787','B767'],['A380','B747']].forEach((row,i)=>row.forEach((text,j)=>{
   const x=apronPlateLefts[j],w=apronAlignment.plateWidth,z=edge+4.1+i*2.05;
   ctx.fillStyle=yellow;ctx.fillRect(x,z,w,1.3);box(x,z,w,1.3,'#292d29',.07);label(text,x+w/2,z+.65,text.length>6?.40:.58,'#202621');
  }));
  // Equipment parking bays on the right-hand side.
  box(16,edge+1.1,12,5.3,white,.10);
  for(let i=1;i<6;i++)path([[16+i*2,edge+1.1],[16+i*2,edge+6.4]],white,.08);
  for(const [x,z] of [[-5,13],[20,9],[16,19]] as XY[]){
   ctx.fillStyle=red;ctx.fillRect(x-.6,z-.6,1.2,1.2);ctx.fillStyle='#414c49';ctx.beginPath();ctx.arc(x,z,.28,0,Math.PI*2);ctx.fill();label('Fuel',x,z+1.1,.58);
  }
  ctx.fillStyle=yellow;ctx.fillRect(center-1.5,43,3,1.4);box(center-1.5,43,3,1.4,'#282e29',.08);label('G12',center,43.7,.65,'#202621');
  // Pedestrian crossing and opposing STOP markings on the service road.
  for(let z=standLayout.roadCenterZ-standLayout.roadWidth/2+.35;z<edge-.2;z+=.6){ctx.fillStyle=white;ctx.fillRect(21.6,z,1.5,.30);}
  for(const [x,z,direction] of [[20.1,standLayout.roadCenterZ+1.9,-1],[24.6,standLayout.roadCenterZ-1.9,1]]){
   ctx.save();ctx.translate(x,z);ctx.rotate(direction*Math.PI/2);ctx.beginPath();
   for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4;const px=Math.cos(a)*.86,pz=Math.sin(a)*.86;i?ctx.lineTo(px,pz):ctx.moveTo(px,pz);}ctx.closePath();ctx.fillStyle=red;ctx.fill();ctx.strokeStyle=white;ctx.lineWidth=.07;ctx.stroke();label('STOP',0,0,.46,white);ctx.restore();
  }
  const map=new CanvasTexture(canvas);map.colorSpace=SRGBColorSpace;map.anisotropy=8;setTexture(map);
  return ()=>map.dispose();
 },[]);
 if(!texture)return null;
 return <mesh name="reference-apron-ground-markings" position={[0,.055,(near+far)/2]} rotation={[-Math.PI/2,0,0]}>
  <planeGeometry args={[width,far-near]}/>
  {/* Paint is an opaque cutout: render before the cabin glazing, discard unpainted pixels,
      and keep depth testing so aircraft/equipment still occlude the ground correctly. */}
  <meshBasicMaterial map={texture} alphaTest={.05} toneMapped={false}/>
 </mesh>;
}
