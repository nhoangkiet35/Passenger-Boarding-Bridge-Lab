import { Plane } from 'lucide-react';
import { vdgsDistance, vdgsStage, vdgsStages, type VdgsState } from '@/lib/vdgsSimulation';

export function VdgsDisplay({s}:{s:VdgsState}) {
 const stage=vdgsStage(s),stopped=stage==='stop',parked=stage==='parked',standby=stage==='standby',detected=stage==='detected';
 const stemHeight=stopped||parked?10:detected?85:Math.max(8,Math.min(85,s.distance/30*85));
 return <div className="vdgs-reference-display" role="img" aria-label={`VDGS A321 · ${stopped?'STOP':parked?'OK':standby?'Chờ':detected?'Phát hiện tàu bay':vdgsDistance(s.distance)}`}>
  <div className="vdgs-led-copy"><strong>A321</strong><strong className={stopped?'is-stop':''}>{stopped?'STOP':parked?'OK':standby||detected?'\u00a0':vdgsDistance(s.distance)}</strong></div>
  <div className={'vdgs-reference-guidance'+(standby?' is-standby':'')+(detected?' is-detected':'')+(stopped||parked?' is-finished':'')} aria-hidden="true">
   {!standby&&<><i className="vdgs-reference-bar"/><i className="vdgs-reference-stem" style={{height:stemHeight}}/></>}
   <Plane className="vdgs-reference-plane" size={16} style={{left:`${50+Math.max(-28,Math.min(28,s.offset*9))}%`,top:standby?100:stemHeight+5}}/>
   {!standby&&!detected&&!stopped&&!parked&&Math.abs(s.offset)>.35&&<span className="vdgs-reference-correction">{s.offset>0?'→':'←'}</span>}
  </div>
 </div>;
}
export function VdgsStageGuide({s}:{s:VdgsState}) {
 const current=vdgsStage(s);
 return <section className="vdgs-stage-guide" aria-labelledby="vdgs-guide-title">
  <h2 id="vdgs-guide-title">Quá trình tàu bay lăn vào vị trí đỗ</h2>
  <p>Diễn giải đầy đủ 8 giai đoạn theo sơ đồ A321, từ khi chờ và kích hoạt hệ thống đến khi tàu bay dừng hoàn toàn và xác nhận đã đỗ. Giai đoạn hiện tại của mô phỏng được tô sáng.</p>
  <div className="vdgs-process-table-wrap" role="region" aria-label="Bảng diễn giải 8 giai đoạn dẫn tàu bay vào vị trí đỗ" tabIndex={0}>
   <table className="vdgs-process-table">
    <thead><tr><th scope="col">Giai đoạn</th><th scope="col">Nội dung trên màn hình</th><th scope="col">Diễn giải hoạt động</th></tr></thead>
    <tbody>{vdgsStages.map((stage,i)=><tr key={stage.id} className={stage.id===current?'is-current':''} aria-current={stage.id===current?'step':undefined}>
     <th scope="row"><span className="vdgs-process-stage">{i+1}. {stage.label}</span>{stage.id===current&&<span className="vdgs-process-current">Đang mô phỏng</span>}</th>
     <td><strong className={'vdgs-process-screen'+(stage.id==='stop'?' is-stop':stage.id==='parked'?' is-parked':'')}>{stage.screen}</strong></td>
     <td>{stage.detail}</td>
    </tr>)}</tbody>
   </table>
  </div>
 </section>;
}
