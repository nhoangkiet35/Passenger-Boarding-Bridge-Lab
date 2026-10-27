'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import GroundOpsScene, { type Runtime } from './GroundOpsScene';
import KeyHints, { Keycap } from './KeyHints';
import { command, metrics, wheelMotion } from '@/lib/simulation';
import { carrying, consolePosition, finishMission, groundConfig, handover, newMission, objectives, phaseLabels, secureBridge, serviceAction, serviceIds, serviceMount, stage, leaveGroundConsole, toggleStairDoor, wheelCompass, mobileStepsAction, type Point } from '@/lib/groundOps';
import { mobileHandle, mobileReady } from '@/lib/mobileSteps';
import { standLayout } from '@/lib/standLayout';
import './ground-ops.css';
import { groundInteraction as targetFor } from '@/lib/groundInteraction';

export default function GroundOps(){
 const [,update]=useState(0),[ready,setReady]=useState(false),[muted,setMuted]=useState(false),[error,setError]=useState('');
 const r=useRef<Runtime>({mission:newMission(),player:[-12,3,standLayout.rotundaZ],yaw:-Math.PI/2,pitch:0,third:false,operating:false,running:false,keys:new Set(),recovery:0,interact:()=>{}});
 const audio=useRef<AudioContext|null>(null),lastAudio=useRef(0),muteRef=useRef(false);
 const refresh=useCallback(()=>update(v=>v+1),[]);
 const sound=useCallback((kind:'step'|'motor'|'beep')=>{const ctx=audio.current;if(!ctx||muteRef.current||ctx.currentTime-lastAudio.current<(kind==='motor'?.2:.05))return;lastAudio.current=ctx.currentTime;const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=kind==='step'?'triangle':'sine';osc.frequency.value=kind==='step'?90:kind==='motor'?55:660;gain.gain.setValueAtTime(kind==='motor'?.012:.035,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.12);osc.connect(gain).connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.13);},[]);
 useEffect(()=>{r.current.sound=sound;return ()=>{void audio.current?.close();};},[sound]);
 const m=r.current.mission,rt=r.current,step=stage(m),target=targetFor(rt),met=metrics(m.bridge.pose);
 const compass=wheelCompass(m.bridge.pose.angle,m.bridge.wheelRotation),drive=wheelMotion(m.bridge).direction;
 const held=carrying(m),paidOut=held?r.current.cableLengths?.[held]??0:0;
 r.current.exitConsole=()=>{const rt=r.current;rt.mission=leaveGroundConsole(rt.mission);rt.operating=false;rt.keys.clear();refresh();};
 r.current.interact=(pressed='E')=>{
  const rt=r.current,m=rt.mission,t=targetFor(rt);if(m.complete)return;
  if(!t){m.message='Chưa có vật thể trong tầm tương tác. Hãy lại gần cửa hoặc thiết bị đến khi có gợi ý phím.';refresh();return;}
  if(pressed!==('key' in t?t.key:'E')){m.message=`Thao tác tại đây dùng phím ${String('key' in t?t.key:'E')} theo gợi ý trên màn hình.`;refresh();return;}
  const old=m.errors;
  if(t.kind==='mobile'){
    rt.mission=mobileStepsAction(m,t.action,rt.player);
    if(rt.mission.mobileSteps.phase==='pushing'){rt.player=mobileHandle(rt.mission.mobileSteps);rt.yaw=-Math.PI/2-rt.mission.mobileSteps.angle;rt.pitch=-.1;}
  } else if(t.kind==='check'){
    m.checks=[...m.checks];m.checks[t.i]=true;m.message=`Đã kiểm tra: ${groundConfig.checks[t.i].label}`;
    if(m.checks.every(Boolean)){m.bridge=command(m.bridge,{type:'area',value:true});m.bridge=command(m.bridge,{type:'authorize',value:true});m.bridge=command(m.bridge,{type:'power',on:true});}
  } else if(t.kind==='stairDoor'){
    rt.mission=toggleStairDoor(m,rt.player);
  } else if(t.kind==='console'){
    if(!m.checks.every(Boolean)){m.message='Hoàn thành đủ bốn kiểm tra trên lối đi.';m.errors++;}
    else if(m.stairDoorOpen){m.message='Cửa cầu thang đang mở. Đóng cửa bằng E trước khi lái cầu.';}
    else if(m.docked){rt.operating=false;m.message='Đến cửa ống A ngay sau cabin, nhấn E mở cửa rồi xuống cầu thang.';}
    else if(!rt.operating){rt.operating=true;rt.player=consolePosition(m);rt.yaw=-Math.PI/2;rt.pitch=-.12;}
    else if(m.bridge.pose.canopy<.999){m.bridge=command(m.bridge,{type:'haltJog'});m.bridge=command(m.bridge,{type:'canopy',open:true});m.message=m.bridge.message;if(m.bridge.target.canopy===0)m.errors++;}
    else if(!m.bridge.autoLevel){m.bridge=command(m.bridge,{type:'autolevel',on:true});m.message=m.bridge.message;}
    else {rt.mission=secureBridge(m);if(rt.mission.docked)rt.operating=false;}
  } else if(t.kind==='finish'){rt.mission=finishMission(m,rt.player,rt.linesClear===true);if(rt.mission.complete)document.exitPointerLock();}
  else {
    const at=groundConfig.services[t.id].socket;
    const forward=new Vector3(-Math.sin(rt.yaw)*Math.cos(rt.pitch),Math.sin(rt.pitch),-Math.cos(rt.yaw)*Math.cos(rt.pitch));
    const toward=new Vector3(at[0]-rt.player[0],at[1]-rt.player[1]-1.65,at[2]-rt.player[2]).normalize();
    const aiming=forward.dot(toward)>=groundConfig.connectorAim;
    const inserting=t.kind==='socket'&&m.services[t.id]==='carrying'&&aiming&&(t.id!=='PWS'||m.waterPanel);
    if(!inserting||rt.connectCable?.(t.id))rt.mission=serviceAction(m,t.id,t.kind,rt.player,aiming);
  }
  sound('beep');if(rt.mission.errors>old)rt.mission.message='⚠ '+rt.mission.message;refresh();
 };
 const play=()=>{r.current.mission.started=true;setReady(true);setError('');refresh();const canvas=document.querySelector<HTMLCanvasElement>('.ops-viewport canvas');try{const lock=canvas?.requestPointerLock();lock?.catch(()=>setError('Trình duyệt chưa cho khóa chuột. Bấm Chơi bằng kéo chuột để dùng WASD và E.'));if(!audio.current)audio.current=new AudioContext();void audio.current.resume();}catch{setError('Trình duyệt chưa cho khóa chuột. Bấm Chơi bằng kéo chuột để dùng WASD và E.');}};
 const playDrag=()=>{const rt=r.current;rt.mission.started=true;rt.running=true;rt.inputMode='drag';rt.keys.clear();rt.mission.message='Chế độ kéo chuột: giữ nút chuột trái hoặc phải và kéo để nhìn; WASD di chuyển, E tương tác, Esc tạm dừng.';setReady(true);setError('');const canvas=document.querySelector<HTMLCanvasElement>('.ops-viewport canvas');if(canvas){canvas.tabIndex=0;canvas.focus();}if(!audio.current)audio.current=new AudioContext();void audio.current.resume();refresh();};
 const reset=()=>{document.exitPointerLock();r.current={...r.current,mission:newMission(),player:[-12,3,standLayout.rotundaZ],operating:false,running:false,keys:new Set(),recovery:r.current.recovery+1,yaw:-Math.PI/2,pitch:0};setReady(false);refresh();};
 const recover=()=>{document.exitPointerLock();const rt=r.current,id=carrying(rt.mission);if(id){rt.mission.services[id]='inspected';rt.mission.cableRoutes[id]=[];}rt.mission.bridge=command(rt.mission.bridge,{type:'haltJog'});if(rt.mission.bridge.fault)rt.mission.bridge=command(rt.mission.bridge,{type:'resetFault'});rt.player=[-12,3,standLayout.rotundaZ];rt.operating=false;if(rt.mission.mobileSteps.phase==='pushing')rt.mission.mobileSteps.phase='parked';rt.yaw=-Math.PI/2;rt.pitch=0;rt.recovery++;rt.mission.errors++;rt.mission.message='Đã về đầu cầu; đầu nối đang mang đã trả về thiết bị. Tiến độ còn giữ.';refresh();};
 return <main className="ground-ops">
  <header className="ops-top"><a href="/" className="ops-brand">PBB <b>LAB</b><span>/ GROUND OPERATIONS</span></a><div><span className="ops-live">● MÀN CHƠI 01</span><button onClick={()=>{muteRef.current=!muted;setMuted(!muted);}}>{muted?'Bật âm':'Tắt âm'}</button><button onClick={recover}>Gỡ kẹt</button><button onClick={reset}>Chơi lại</button></div></header>
  <div className="ops-viewport"><GroundOpsScene r={r} onUpdate={refresh}/></div>
  <aside className="ops-mission"><small>CA PHỤC VỤ / {groundConfig.stand}</small><h1>Ground Operations<br/><em>Simulator</em></h1><p>VN 268 · Airbus A321 · Đã đỗ</p><div className="ops-objective"><small>{String(Math.min(step,7)).padStart(2,'0')} / 07 · NHIỆM VỤ HIỆN TẠI</small><strong>{objectives[step]}</strong></div>
   <ol>{['Kiểm tra an toàn','Đưa PBB vào phục vụ','Đi xuống sân đỗ','Cấp điện GPU','Cấp khí lạnh PCA','Cấp nước sạch PWS','Kiểm tra bàn giao'].map((label,i)=><li key={label} className={step>i+1?'done':step===i+1?'current':''}><span>{step>i+1?'✓':i+1}</span>{label}</li>)}</ol>
   {step===1&&<div className="ops-checks">{groundConfig.checks.map((c,i)=><p key={c.label}>{m.checks[i]?'☑':'□'} {c.label}</p>)}</div>}
   {step===6&&<div className="ops-checks" aria-label="Tiến độ thang cấp nước">{[
    [Math.abs(m.mobileSteps.travel)>.1,'Lấy và đẩy thang'],
    [mobileReady(m.mobileSteps),'Đưa sàn thang vào khung dưới đuôi'],
    [m.mobileSteps.phase==='locked','Chốt bánh bằng F'],
    [m.mobileSteps.climbed,'Tự leo lên sàn thang'],
    [['connected','locked','active','complete'].includes(m.services.PWS),'Cắm ống nước vào bảng dưới đuôi'],
   ].map(([done,label])=><p key={String(label)}>{done?'☑':'□'} <KeyHints text={String(label)}/></p>)}</div>}
  </aside>
  <aside className="ops-right"><div className="ops-clock"><small>THỜI GIAN PHỤC VỤ</small><b>{Math.floor(m.elapsed/60).toString().padStart(2,'0')}:{Math.floor(m.elapsed%60).toString().padStart(2,'0')}</b></div>
   <div className="ops-services"><small>TRẠNG THÁI THIẾT BỊ</small><p><b>PBB</b><span>{m.docked?'Phục vụ · Auto level':rt.operating?'Đang điều khiển':'Chờ tiếp cận'}</span></p>{serviceIds.map(id=><p key={id}><b style={{color:groundConfig.services[id].color}}>{id}</b><span>{phaseLabels[m.services[id]]}</span></p>)}{m.services.PWS==='active'&&<><progress value={m.water} max={1}/><small>{Math.round(m.water*120)} / 120 L {m.water>=1?'· Trở lại PWS để dừng':''}</small></>}</div>
   <div className="ops-map"><small>G12 / SƠ ĐỒ VỊ TRÍ</small><svg viewBox="0 0 180 260" role="img" aria-label="Sơ đồ vị trí người chơi và thiết bị"><rect x="4" y="5" width="172" height="17" fill="#4e6c7b"/><path d="M125 35 L125 235 M105 130 L145 130" stroke="#92b6c4" strokeWidth="12" strokeLinecap="round"/><path d={`M${(standLayout.rotundaX+25)*3} ${(standLayout.rotundaZ+24)*4} L${(consolePosition(m)[0]+25)*3} ${(consolePosition(m)[2]+24)*4}`} stroke="#e4c674" strokeWidth="5"/>{serviceIds.map(id=><circle key={id} cx={(serviceMount(m,id).anchor[0]+25)*3} cy={(serviceMount(m,id).anchor[2]+24)*4} r="4" fill={groundConfig.services[id].color}/>)}<rect x={(m.mobileSteps.x+25)*3-3} y={(m.mobileSteps.z+24)*4-3} width="6" height="6" fill={m.mobileSteps.phase==='locked'?'#71e5b6':'#86c6ff'}/><circle cx={(rt.player[0]+25)*3} cy={(rt.player[2]+24)*4} r="4" fill="#fff" stroke="#22d6b1" strokeWidth="2"/></svg><span>● Bạn · cam GPU · vàng PCA · xanh PWS</span></div>
  </aside>
  {rt.operating&&<section className="ops-console"><small>PBB / ĐIỀU KHIỂN GIỮ ĐỂ CHẠY</small><div><span>Tốc độ <b>{m.bridge.actualSpeed.toFixed(2)} m/s</b></span><span>Cao độ <b>{m.bridge.pose.height.toFixed(2)} m</b></span><span>Khoảng hở <b>{met.gap.toFixed(2)} m</b></span><span>Lệch cửa <b>{met.offset.toFixed(2)} m</b></span><span>Góc cabin <b>{(m.bridge.pose.angle+m.bridge.pose.cabYaw).toFixed(1)}°</b></span><span>Bánh lái <b>{m.bridge.wheelRotation.toFixed(0)}°</b></span></div><p><KeyHints text="W/S chạy tới/lùi · A/D đánh lái · R/F nâng/hạ · Q/Z xoay cabin · E canopy / xác nhận · Tab rời bàn"/></p><p className="ops-hint">Mục tiêu: hở 0,03–0,50 m · lệch cửa gần 0 · cao độ 3,25 m · góc cabin gần 0°. {met.gap<.65?'TIẾP CẬN CHẬM':''}</p><p><KeyHints text={m.bridge.message}/></p></section>}
  {rt.operating&&<section className="ops-wheel-compass" aria-label="La bàn hướng bánh xe">
   <small>LA BÀN / HƯỚNG BÁNH XE</small>
   <svg viewBox="0 0 220 150" role="img" aria-label={`Góc đánh lái ${compass.steering.toFixed(0)} độ; phương vị ${compass.heading.toFixed(0)} độ`}>
    <path d="M28 110 A82 82 0 0 1 192 110" fill="none" stroke="#52717f" strokeWidth="2"/>
    {[-90,-60,-30,0,30,60,90].map(deg=><g key={deg} transform={`rotate(${deg} 110 110)`}><path d="M110 28 V38" stroke={deg===0?'#ffd167':'#8aa9b6'} strokeWidth="2"/></g>)}
    <text x="18" y="128">−90°</text><text x="110" y="18" textAnchor="middle">0° · DỌC ỐNG</text><text x="177" y="128">+90°</text>
    <g transform={`rotate(${compass.steering} 110 110)`}><path d="M110 111 V48 M100 61 L110 47 L120 61" fill="none" stroke="#72e5c2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><rect x="84" y="88" width="13" height="34" rx="4" fill="#dbe9ed"/><rect x="123" y="88" width="13" height="34" rx="4" fill="#dbe9ed"/></g>
    <circle cx="110" cy="110" r="5" fill="#ffd167"/>
   </svg>
   <div><b>{compass.steering>0?'+':''}{compass.steering.toFixed(0)}°</b><span>{drive>0?'▲ ĐANG TIẾN':drive<0?'▼ ĐANG LÙI':'● DỪNG'}<br/>Phương vị {compass.heading.toFixed(0)}°</span></div>
   <p><KeyHints text="A / D đánh lái · W / S tiến / lùi"/></p>
  </section>}
  {rt.operating&&<div className="ops-camera-label">CAM 02 / TIẾP CẬN CỬA L1</div>}
  {step===6&&!held&&<section className="ops-held ops-mobile-guide"><small>PWS / THANG PHỤC VỤ DI ĐỘNG</small><strong>{m.mobileSteps.phase==='pushing'?'Đang đẩy thang':m.mobileSteps.phase==='locked'?'Đã chốt bánh · lấy ống nước và leo thang':mobileReady(m.mobileSteps)?'Đã vào khung · đến chốt bánh':'Lấy thang ở khu vực bên trái tàu bay'}</strong><p><KeyHints text="E nắm/buông tay đẩy · W/S đẩy/lùi · A/D xoay"/><br/><KeyHints text="F chốt/nhả bánh · tự đi bộ lên từng bậc"/></p></section>}
  {held&&<section className="ops-held" aria-label="Đầu nối đang cầm"><small>ĐANG CẦM / {held}</small><strong>{groundConfig.services[held].description}</strong><div><b>{paidOut.toFixed(1)} m</b> / {groundConfig.services[held].maxLength} m <span>{Math.max(0,groundConfig.services[held].maxLength-paidOut).toFixed(1)} m còn lại</span></div><progress value={paidOut} max={groundConfig.services[held].maxLength}/><p>Đi bộ kéo dây/ống · Ngắm đúng đầu nhận rồi <Keycap>E</Keycap> để cắm.<br/><Keycap>E</Keycap> tại giá trên cầu để trả đầu nối.</p></section>}
  <div className="ops-crosshair" aria-hidden="true">+</div>{rt.running&&rt.inputMode==='drag'&&<div className="ops-drag-hint">Giữ chuột và kéo để nhìn · <Keycap>E</Keycap> tương tác · <Keycap>Esc</Keycap> tạm dừng</div>}
  <footer className="ops-bottom"><div role="status"><KeyHints text={m.message}/>{error&&<p>{error}</p>}</div><strong>{target?<><Keycap>{String('key' in target?target.key:'E')}</Keycap> {target.label}</>:<KeyHints text="WASD di chuyển · Chuột nhìn · V góc nhìn · Esc tạm dừng"/>}</strong><small>Mô phỏng học tập độc lập · vị trí đầu nối và thông số gameplay minh họa · không được chứng nhận huấn luyện</small></footer>
  {!rt.running&&!m.complete&&<div className="ops-pause"><div><small>PBB LAB / INTERACTIVE SIMULATION</small><h2>{!ready?'Một chuyến bay.\nMột ca phục vụ.':'Đã tạm dừng'}</h2><p>Tự lái cầu, đi bộ xuống sân đỗ và kết nối điện, khí điều hòa, nước sạch trong cùng một không gian.</p><p className="ops-instructions"><KeyHints text="WASD di chuyển · Chuột nhìn · E tương tác"/><br/><KeyHints text="V xem nhân vật · Tab rời bàn điều khiển · Esc tạm dừng"/></p>{ready&&<p className="ops-input-help" role={error?"alert":"status"}><KeyHints text={error||m.message}/></p>}<button className="ops-play" onClick={play}>{ready?'Tiếp tục ca phục vụ →':'Nhận VN 268 · Bắt đầu →'}</button>{(error||rt.inputMode==='drag')&&<button className="ops-drag-play" onClick={playDrag}>Chơi bằng kéo chuột</button>}<p className="ops-disclaimer">A321 / vị trí đỗ G12. Bốn kiểm tra an toàn diễn ra trên lối đi cầu. Thứ tự dịch vụ dành riêng cho màn chơi này. PCA là khí điều hòa; PWS là nước sạch, không phải nước thải.</p></div></div>}
  {m.complete&&<div className="ops-pause"><div><small>VN 268 / HOÀN THÀNH PHỤC VỤ</small><h2>Ca phục vụ hoàn tất.</h2><p>PBB ổn định · GPU cấp điện · PCA cấp khí · PWS đã dừng sau khi đủ nước.</p><div className="ops-results"><p>Thời gian <b>{Math.floor(m.elapsed/60)} phút {Math.floor(m.elapsed%60)} giây</b></p><p>Độ chính xác căn chỉnh <b>{m.accuracy.toFixed(0)}%</b></p><p>Lỗi thao tác / gỡ kẹt <b>{m.errors}</b></p><p>Nhiệm vụ <b>7 / 7</b></p></div><button className="ops-play" onClick={reset}>Chơi lại màn này</button><a href="/">Về PBB Lab</a></div></div>}
 </main>;
}
