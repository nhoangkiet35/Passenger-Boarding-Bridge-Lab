import { useId } from 'react';
import { Power,MoveHorizontal,RotateCw,ArrowUpDown,Octagon,Home,Check,ShieldCheck,ChevronUp,ChevronDown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { limits,type Command,type State } from '@/lib/simulation';
export default function Controls({s,send,collapsed,onToggle}:{s:State;send:(c:Command)=>State;collapsed:boolean;onToggle:()=>void}){
 const manual=s.mode==='manual';
 const contentId=useId();
 return <aside className={'control-panel'+(collapsed?' is-collapsed':'')}>
  <div className="panel-heading"><div><span className="eyebrow">PBB / 01</span><h2>Bảng điều khiển</h2></div><div className="control-panel-actions"><span className={'power-dot '+(s.power?'on':'')} role="img" aria-label={s.power?'Nguồn đang bật':'Nguồn đang tắt'}/><button type="button" className="control-panel-toggle" aria-expanded={!collapsed} aria-controls={contentId} aria-label={collapsed?'Mở rộng bảng điều khiển':'Thu gọn bảng điều khiển'} onClick={onToggle}>{collapsed?'Mở rộng':'Thu gọn'}{collapsed?<ChevronDown size={16} aria-hidden="true"/>:<ChevronUp size={16} aria-hidden="true"/>}</button></div></div>
  <div id={contentId} hidden={collapsed}>
  <label className="power-row"><span><Power size={18}/>Nguồn mô phỏng</span><Switch aria-label="Nguồn mô phỏng" checked={s.power} onCheckedChange={()=>send({type:'power'})}/></label>
  <div className="checks"><p><ShieldCheck size={15}/> Điều kiện tiếp cận</p>
   <label><Checkbox checked={s.area} disabled={!manual} onCheckedChange={v=>send({type:'area',value:v===true})}/>Khu vực di chuyển thông thoáng</label>
   <label><Checkbox checked={s.authorized} disabled={!manual} onCheckedChange={v=>send({type:'authorize',value:v===true})}/>Tàu bay đã đỗ & được phép tiếp cận</label>
  </div>
  <fieldset disabled={!manual} className="motion-controls"><legend className="sr-only">Điều khiển thủ công</legend>
   {([{key:'angle',name:'Xoay cầu',unit:'°',step:1,icon:RotateCw},{key:'height',name:'Độ cao sàn cabin',unit:' m',step:.05,icon:ArrowUpDown},{key:'length',name:'Chiều dài cầu',unit:' m',step:.1,icon:MoveHorizontal}] as const).map(({key,name,unit,step,icon:Icon})=><div className="axis" key={key}>
    <div className="axis-title"><label id={'label-'+key}><Icon size={16}/>{name}</label><output>{s.pose[key].toFixed(key==='angle'?1:2)}<small>{unit}</small></output></div>
    <div className="axis-input"><button aria-label={'Giảm '+name} onClick={()=>send({type:'move',key,value:s.target[key]-step})}>−</button><Slider aria-labelledby={'label-'+key} min={limits[key][0]} max={limits[key][1]} step={step} value={[s.target[key]]} disabled={!manual} onValueChange={([value])=>send({type:'move',key,value})}/><button aria-label={'Tăng '+name} onClick={()=>send({type:'move',key,value:s.target[key]+step})}>+</button></div>
    <div className="range-label"><span>{limits[key][0]}{unit}</span><label>Mục tiêu <input key={s.target[key]} aria-label={'Mục tiêu '+name} type="number" step={step} min={limits[key][0]} max={limits[key][1]} defaultValue={s.target[key].toFixed(key==='angle'?0:2)} onBlur={e=>{const value=e.currentTarget.valueAsNumber;if(Number.isFinite(value))e.currentTarget.value=String(send({type:'move',key,value}).target[key]);else e.currentTarget.value=String(s.target[key]);}} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}}/>{unit}</label><span>{limits[key][1]}{unit}</span></div>
   </div>)}
   <div className="two-buttons"><button onClick={()=>send({type:'move',key:'length',value:s.target.length+.3})}>Tiến gần cửa</button><button onClick={()=>send({type:'move',key:'length',value:s.target.length-.3})}>Lùi khỏi cửa</button></div>
   <div className="canopy-row"><span>Canopy <small>{Math.round(s.pose.canopy*100)}%</small></span><button onClick={()=>send({type:'canopy',open:true})}>Triển khai</button><button onClick={()=>send({type:'canopy',open:false})}>Thu lại</button></div>
   <div className="two-buttons secondary"><button onClick={()=>send({type:'service'})}><Check size={15}/>Kết thúc phục vụ</button><button onClick={()=>send({type:'park'})}><Home size={15}/>Về vị trí đỗ</button></div>
  </fieldset>
  {!manual&&<p className="muted mode-note">Hướng dẫn đang điều khiển cầu. Chọn Thủ công để tự thao tác.</p>}
  <button className="emergency" onClick={()=>send({type:'emergency'})}><Octagon size={22}/><span>DỪNG KHẨN CẤP<small>Dừng ngay mọi chuyển động</small></span></button>
  {s.emergency&&<button className="reset-emergency" onClick={()=>send({type:'resetEmergency'})}>Đặt lại dừng khẩn cấp</button>}
  </div>
 </aside>;
}

