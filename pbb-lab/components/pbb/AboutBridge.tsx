'use client';
import {useState} from 'react';
import BridgePrincipleDrawing from './BridgePrincipleDrawing';
import {bridgeParts} from '@/lib/aboutContent';
export default function AboutBridge(){
 const [selected,setSelected]=useState(0);
 const part=bridgeParts[selected];
 const choose=(index:number)=>{setSelected(index);};
 return <div className="a-bridge-explorer">
  <div className="a-drawing" data-part={part.id}>
   <div className="a-drawing-meta"><span>PBB / KẾT CẤU & CHUYỂN ĐỘNG</span><span>SƠ ĐỒ NGUYÊN LÝ</span></div>
   <div className="a-drawing-stage">
    <BridgePrincipleDrawing/>
    {bridgeParts.map((item,index)=><button key={item.id} className={'a-hotspot'+(selected===index?' is-active':'')} style={{left:item.position[0]+'%',top:item.position[1]+'%'}} onClick={()=>choose(index)} aria-label={`Khám phá ${item.name}: ${item.vi}`} aria-pressed={selected===index} aria-controls="a-part-detail">{String(index+1).padStart(2,'0')}</button>)}
   </div>
   <p className="a-drawing-hint">Chọn điểm trên hình hoặc tên bộ phận bên dưới.</p>
  </div>
  <div className="a-part-choices" role="group" aria-label="Chọn bộ phận cầu hành khách">{bridgeParts.map((item,index)=><button key={item.id} onClick={()=>choose(index)} aria-pressed={selected===index} aria-controls="a-part-detail"><span>0{index+1}</span>{item.name}</button>)}</div>
  <div className="a-part-detail" id="a-part-detail" aria-live="polite" aria-atomic="true"><span className="a-part-number">0{selected+1}</span><div><span className="a-overline">{part.name}</span><h3>{part.vi}</h3></div><p>{part.text}</p></div>
 <noscript><div className="a-noscript-parts">{bridgeParts.map(item=><article key={item.id}><h3>{item.name} · {item.vi}</h3><p>{item.text}</p></article>)}</div></noscript>
 </div>;
}
