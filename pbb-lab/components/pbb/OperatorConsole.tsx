import { Checkbox } from '@/components/ui/checkbox';
import { useSyncExternalStore } from 'react';
import { metrics, status, type Aux, type Axis, type State } from '@/lib/simulation';
import { ArrowDown, ArrowUp, Check, Fan, Home, Lightbulb, Pause, Play, RotateCcw, RotateCw, ShieldCheck, Snowflake, Sun } from 'lucide-react';
import CabinMainScreen from './CabinMainScreen';
import './console.css';
import Joystick, { HoldButton, type Send } from './Joystick';
const mobileQuery = '(max-width: 600px)';
const subscribeMobile = (notify: () => void) => {
  const query = window.matchMedia(mobileQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};
const getMobileSnapshot = () => window.matchMedia(mobileQuery).matches;
const getServerMobileSnapshot = () => false;
function Rocker({s,send,axis,title,caption,left,right}:{s:State;send:Send;axis:Axis;title:string;caption:string;left:React.ReactNode;right:React.ReactNode}) {
  return <div className="rocker-row"><div><b>{title}</b><span>{caption}</span></div><div className="rocker-buttons"><HoldButton send={send} running={!!s.jog} disabled={s.mode!=='manual'} axes={{[axis]:-1}} label={'Giữ giảm '+title}>{left}</HoldButton><HoldButton send={send} running={!!s.jog} disabled={s.mode!=='manual'} axes={{[axis]:1}} label={'Giữ tăng '+title}>{right}</HoldButton></div></div>;
}
export default function OperatorConsole({s,send}:{s:State;send:Send}) {
  const mobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, getServerMobileSnapshot);
  const mode=!s.power?'off':s.mode;
  const setKey=(value:'off'|'manual'|'guide')=>{if(value==='off')send({type:'power',on:false});else {send({type:'mode',mode:value});send({type:'power',on:true});}};
  const auxControls:[Aux,string,string,typeof Lightbulb][]=[['interior','Đèn trong','INT. LIGHT',Lightbulb],['exterior','Đèn ngoài','EXT. LIGHT',Sun],['aircon','Điều hòa','AIR-CON',Snowflake],['ventilation','Thông gió','VENTILATOR',Fan]];
  const m=metrics(s.pose,s.aircraftShift);
  return <section id="operator-console" className="operator-section" aria-labelledby="console-heading">
    <div className="console-heading"><div><div className="eyebrow">CABIN OPERATOR STATION</div><h2 id="console-heading">Bàn điều khiển cabin</h2></div></div>
    <div className="operator-console" onContextMenu={event => {
      // Long presses on touch controls must not open the browser's context menu.
      if (event.target instanceof Element && event.target.closest('button, .joystick-surface')) event.preventDefault();
    }}>
      <i className="panel-screw screw-tl"/><i className="panel-screw screw-tr"/><i className="panel-screw screw-bl"/><i className="panel-screw screw-br"/>
      <div className="console-left">
        <div className="estop-housing"><div className="hardware-label">EMERGENCY STOP</div><button className={'mushroom-stop '+(s.emergency?'latched':'')} aria-label="Dừng khẩn cấp trên bàn điều khiển" aria-pressed={s.emergency} onClick={()=>send({type:'emergency'})}><span>EMRG.<br/>STOP</span></button><span className="estop-caption">DỪNG KHẨN CẤP</span></div>
        <div className="key-switch"><div className="hardware-label">KHÓA CHẾ ĐỘ</div><div className="key-dial" aria-hidden="true"><span style={{transform:`rotate(${mode==='off'?-45:mode==='manual'?0:45}deg)`}}/></div><div className="key-options">{([['off','TẮT'],['manual','VẬN HÀNH'],['guide','AUTO']] as const).map(([value,label])=><button key={value} aria-pressed={mode===value} onClick={()=>setKey(value)}>{label}</button>)}</div></div>
        <div className="power-buttons"><button className={'hardware-button power-on '+(s.power?'lit':'')} aria-pressed={s.power} onClick={()=>send({type:'power',on:true})}>I <span>POWER ON</span></button><button className="hardware-button power-off" aria-pressed={!s.power} onClick={()=>send({type:'power',on:false})}>O <span>POWER OFF</span></button></div>
        <div className="console-rockers"><div className="rocker-row"><div><b>CANOPY</b><span>MÁI CHE ĐỒNG BỘ</span></div><div className="rocker-buttons"><button className="hardware-button" disabled={s.mode!=='manual'} aria-label="Thu canopy trên bàn điều khiển" onClick={()=>send({type:'canopy',open:false})}><ArrowUp size={19}/></button><button className="hardware-button" disabled={s.mode!=='manual'} aria-label="Triển khai canopy trên bàn điều khiển" onClick={()=>send({type:'canopy',open:true})}><ArrowDown size={19}/></button></div></div>
          <Rocker s={s} send={send} axis="floorTilt" title="CAB FLOOR" caption={'GÓC SÀN CABIN · '+s.pose.floorTilt.toFixed(1)+'°'} left={<ArrowDown size={19}/>} right={<ArrowUp size={19}/>}/>
          <Rocker s={s} send={send} axis="cabYaw" title="CAB ROTATION" caption={'XOAY CABIN · '+s.pose.cabYaw.toFixed(1)+'°'} left={<RotateCcw size={18}/>} right={<RotateCw size={18}/>}/>
          <Rocker s={s} send={send} axis="height" title="TUNNEL UP / DOWN" caption={'CAO ĐỘ · '+s.pose.height.toFixed(2)+' m'} left={<ArrowDown size={19}/>} right={<ArrowUp size={19}/>}/>
        </div>
        <HoldButton preset className="preset-button" send={send} running={s.presetPark} disabled={!s.power||s.emergency||!!s.fault} label="Giữ PRESET START để về Park, thả để dừng"><Play size={16}/><span>PRESET START<small>CHU TRÌNH VỀ PARK · GIỮ ĐỂ CHẠY</small></span></HoldButton>
      </div>
      <div className="console-center"><CabinMainScreen s={s} send={send} mobileControls={mobile ? <Joystick s={s} send={send} compact/> : null}/><div className="console-confirmations"><label><Checkbox checked={s.area} disabled={s.mode!=='manual'} onCheckedChange={v=>send({type:'area',value:v===true})}/>Khu vực thông thoáng</label><label><Checkbox checked={s.authorized} disabled={s.mode!=='manual'} onCheckedChange={v=>send({type:'authorize',value:v===true})}/>Tàu bay đã đỗ · được phép tiếp cận</label></div>
        <div className="console-status-strip"><ShieldCheck size={16}/><span>{status(s)}</span><span className={m.clearance<.4?'amber':''}>CANOPY {Math.round(s.pose.canopy*100)}%</span></div>
        <div className="console-message" role="status" aria-live="polite">{s.message}</div>
        <div className="console-service"><button disabled={s.mode!=='manual'} onClick={()=>send({type:'service'})}><Check size={16}/>Kết thúc phục vụ</button><button disabled={s.mode!=='manual'} onClick={()=>send({type:'park'})}><Home size={16}/>Về vị trí đỗ</button><button onClick={()=>send({type:'pause'})}>{s.paused?<Play size={16}/>:<Pause size={16}/>} {s.paused?'Tiếp tục':'Tạm dừng'}</button></div>
      </div>
      <div className="console-right"><div className="aux-switches">{auxControls.map(([key,label,english,Icon])=><button key={key} className={'aux-button '+(s.power&&s.aux[key]?'lit':'')} aria-pressed={s.power&&s.aux[key]} onClick={()=>send({type:'aux',key})}><span className="aux-lamp"/><Icon size={20}/><b>{label}</b><small>{english}</small></button>)}</div>
        <div className="climate-readout"><Fan size={15} className={s.power&&s.aux.ventilation?'fan-running':''}/><span>{s.power?s.temperature.toFixed(1):'—'} °C</span><small>NHIỆT ĐỘ MÔ PHỎNG</small></div>
        <div className="reset-housing"><button className="hardware-button reset-switch" disabled={!s.emergency} onClick={()=>send({type:'resetEmergency'})}><RotateCcw size={16}/>RESET</button><span>Khôi phục dừng khẩn cấp</span></div>
        {!mobile && <Joystick s={s} send={send}/>}
      </div>
      <div className="console-nameplate"><b>PBB LAB <span>/ OPERATOR CONSOLE</span></b><span>SIMULATION ONLY · 01</span></div>
    </div>
    <p className="console-disclaimer">Bố cục lấy cảm hứng từ ảnh tham khảo, không phải bản sao hay giao diện được chứng nhận của nhà sản xuất. Canopy đóng/mở đồng bộ; cần điều khiển mô phỏng tiến/lùi và xoay cầu. CCTV là camera 3D trong cùng mô hình, không dùng webcam.</p>
  </section>;
}

