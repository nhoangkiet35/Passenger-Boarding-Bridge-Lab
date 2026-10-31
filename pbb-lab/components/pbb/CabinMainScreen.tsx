import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { apronView, cabinView, cctvView, limits, parked, wheelMotion, wheelCommandLights, bridgeMessages, type Pose, type State } from '@/lib/simulation';
import { World } from './Scene';
import { HoldButton, type Send } from './Joystick';
import './cabin-main.css';

function CameraPosition({ pose, apron }: { pose: Pose; apron: boolean }) {
  const { camera } = useThree();
  useFrame(() => {
    const view = apron ? apronView(pose) : cabinView(pose);
    camera.position.set(...view.position);
    camera.up.set(0, 1, 0);
    camera.lookAt(...view.target);
  });
  return null;
}

class CameraBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <span className="cabin-video-error">NO SIGNAL</span> : this.props.children; }
}

function AngleGauge({ value, label }: { value: number; label: string }) {
  return <div className="cabin-angle"><span>{label}</span><strong>{value.toFixed(1)} deg</strong>
    <svg viewBox="0 0 100 48" role="img" aria-label={`${label} ${value.toFixed(1)} degrees`}>
      <path d="M8 43 A42 42 0 0 1 92 43" fill="none" stroke="#ffffff" strokeWidth="9" />
      <text x="3" y="12">L</text><text x="89" y="12">R</text>
      <path d="M50 43 V8" stroke="#ff4040" strokeWidth="2" transform={`rotate(${value} 50 43)`} />
    </svg>
  </div>;
}

function Indicator({ label, value, red = false }: { label: string; value: string; red?: boolean }) {
  return <div className={`cabin-indicator${red ? ' is-red' : ''}${value === 'OFF' ? ' is-off' : ''}${value === 'AUTO' ? ' is-auto' : ''}`} role="status" aria-label={`${label} ${value}`}><span>{label}</span><strong>{value}</strong></div>;
}

function WheelDirection({ s }: { s: State }) {
  const wheel = wheelMotion(s);
  const directionLights = wheelCommandLights(s);
  return <div className="cabin-wheel"><div>WHEEL ROT. <strong>{wheel.angle.toFixed(1)} deg</strong></div><svg viewBox="0 0 160 160" role="img" aria-label={`Wheel steering ${wheel.angle.toFixed(1)} degrees, ${wheel.direction === 0 ? 'stopped' : wheel.direction > 0 ? 'forward drive' : 'reverse drive'}`}><circle cx="80" cy="80" r="65" fill="none" stroke="#00aaff" />{([{key:'forward',x:80,y:10,label:'Tiến · 12 giờ'},{key:'reverse',x:80,y:150,label:'Lùi · 6 giờ'},{key:'left',x:10,y:80,label:'Đánh lái trái · 9 giờ'},{key:'right',x:150,y:80,label:'Đánh lái phải · 3 giờ'}] as const).map(light=>directionLights[light.key]?<circle key={light.key} data-direction={light.key} cx={light.x} cy={light.y} r="6" fill="#ff0000" stroke="#ff8a8a" strokeWidth="2"><title>{light.label}</title></circle>:null)}<text x="80" y="29" textAnchor="middle">F</text><text x="80" y="142" textAnchor="middle">R</text><g transform={`rotate(${wheel.angle} 80 80)`}><rect x="52" y="51" width="16" height="58" rx="8" fill="#000000" /><rect x="94" y="51" width="16" height="58" rx="8" fill="#000000" /><path d="M68 80 H94" stroke="#808080" strokeWidth="15" /><path d="M80 34 L68 49 H92 Z" fill="#ff0000" /></g></svg></div>;
}

function CameraAuxControls({ s, send }: { s: State; send: Send }) {
  const [selected, setSelected] = useState<'canopy' | 'cabYaw' | 'height' | null>(null);
  const disabled = !s.power || s.mode !== 'manual' || s.emergency || !!s.fault || s.paused;
  return <div className="camera-aux-controls" aria-label="Điều khiển cabin trên camera">
    {([['canopy', 'CANOPY'], ['cabYaw', 'CAB ROT'], ['height', 'TUNNEL']] as const).map(([key, label]) => <div className="camera-aux-group" key={key}>
      <button type="button" className="camera-aux-tab" aria-expanded={selected === key} aria-controls={`camera-aux-${key}`} onClick={() => setSelected(value => value === key ? null : key)}>{label}</button>
      {selected === key && <div className="camera-aux-actions" id={`camera-aux-${key}`}>
        {key === 'canopy' ? <>
          <button type="button" disabled={disabled} onClick={() => send({type:'canopy', open:false})} aria-label="Thu canopy trên camera">↑ Thu</button>
          <button type="button" disabled={disabled} onClick={() => send({type:'canopy', open:true})} aria-label="Mở canopy trên camera">↓ Mở</button>
          <span>{Math.round(s.pose.canopy * 100)}%</span>
        </> : <>
          <HoldButton send={send} running={!!s.jog} disabled={disabled} axes={{[key]:-1}} label={key === 'cabYaw' ? 'Giữ xoay cabin trái trên camera' : 'Giữ hạ cầu trên camera'}>{key === 'cabYaw' ? '← Trái' : '↓ Hạ'}</HoldButton>
          <HoldButton send={send} running={!!s.jog} disabled={disabled} axes={{[key]:1}} label={key === 'cabYaw' ? 'Giữ xoay cabin phải trên camera' : 'Giữ nâng cầu trên camera'}>{key === 'cabYaw' ? 'Phải →' : '↑ Nâng'}</HoldButton>
          <span>{key === 'cabYaw' ? `${s.pose.cabYaw.toFixed(1)}°` : `${s.pose.height.toFixed(2)} m`}</span>
        </>}
      </div>}
    </div>)}
  </div>;
}

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const clock = now ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(now).replaceAll('-', '/') : '—';
  return <div className="cabin-clock"><span>GATE No. XX</span><time>{clock}</time></div>;
}

export default function CabinMainScreen({ s, send, mobileControls }: { s: State; send: Send; mobileControls?: ReactNode }) {
  const [selectedCamera, setSelectedCamera] = useState<'apron' | 'cabin' | null>(null);
  const apron = cctvView(s, selectedCamera) === 'apron';
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const [help, setHelp] = useState(false);
  const [lost, setLost] = useState(false);
  const lastTouch = useRef(0);
  const lastTouchToggle = useRef(-1000);
  const isParked = parked(s);
  const plcRun = s.power && !s.emergency;
  const slope = Math.atan2(s.pose.height - 3, s.pose.length) * 180 / Math.PI;
  const allMessages = bridgeMessages(s);
  const messagesPerPage = mobileControls ? 2 : 3;
  const lastPage = Math.max(0, Math.ceil(allMessages.length / messagesPerPage) - 1);
  const visiblePage = Math.min(page, lastPage);
  const messages = Array.from({ length: messagesPerPage }, (_, index) => allMessages[visiblePage * messagesPerPage + index] ?? { text: '', alarm: false });
  useEffect(() => { setPage(0); }, [s.fault, s.emergency, s.message, messagesPerPage]);
  const toggleExpanded = () => setExpanded(value => !value);
  return <div className={`cabin-main${expanded ? ' camera-expanded' : ''}`} aria-label="Cabin main screen">
    <div className="cabin-main-grid">
      <div className="cabin-camera-frame">
        <div className="cabin-camera" role="button" tabIndex={0} aria-label="Camera: double-click or double-tap to expand or restore" aria-pressed={expanded}
          onDoubleClick={() => { if (performance.now() - lastTouchToggle.current > 600) toggleExpanded(); }}
          onPointerUp={event => { if (event.pointerType !== 'touch') return; const now = performance.now(); if (lastTouch.current > 0 && now - lastTouch.current < 350) { toggleExpanded(); lastTouch.current = 0; lastTouchToggle.current = now; } else lastTouch.current = now; }}
          onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleExpanded(); } else if (event.key === 'Escape') setExpanded(false); }}>
          <CameraBoundary><Canvas style={{position:'absolute',inset:0}} resize={{offsetSize:true}} dpr={[1, 1.25]} camera={{ fov: apron ? 95 : 100, near: .03, far: 150 }} frameloop={s.power ? 'always' : 'demand'}
            onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', () => setLost(true)); gl.domElement.addEventListener('webglcontextrestored', () => setLost(false)); }}>
            <World s={s} cctv /><CameraPosition pose={s.pose} apron={apron} />
          </Canvas></CameraBoundary>
          {!s.power ? <div className="cabin-video-off" /> : lost ? <span className="cabin-video-error">NO SIGNAL</span> : null}
        </div>
        {mobileControls && <>
          <div className="camera-touch-toolbar">
            <span>{s.power ? '● CAMERA 3D' : 'CAMERA · TẮT NGUỒN'}</span>
            <button type="button" onClick={() => setSelectedCamera(apron ? 'cabin' : 'apron')} aria-label="Đổi camera theo dõi cầu">{apron ? 'Sân đỗ' : 'Cabin'} ↔</button>
            <button type="button" onClick={toggleExpanded} aria-pressed={expanded} aria-label={expanded ? 'Thu nhỏ camera' : 'Phóng lớn camera'}>{expanded ? 'Thu nhỏ' : 'Phóng lớn'}</button>
          </div>
          <CameraAuxControls s={s} send={send}/>
          <div className="camera-drive-controls"><WheelDirection s={s}/>{mobileControls}</div>
        </>}
      </div>
      <div className="cabin-instruments">
        <div className="cabin-top"><Clock /><span className={`cabin-plc ${plcRun ? 'is-run' : ''}`}>PLC {plcRun ? 'RUN' : 'STOP'}</span></div>
        <div className="cabin-metrics">
          <div className="cabin-height"><span>HEIGHT</span><strong>{s.pose.height.toFixed(3)} m</strong>
            <div className="cabin-height-scale"><div className="cabin-aircraft"><span className="cabin-height-b777">B777</span><span className="cabin-height-b767">B767</span><span className="cabin-height-b737">B737</span><span className="cabin-height-md90">MD90</span></div><div className="cabin-height-track"><div style={{ height: `${Math.max(0, Math.min(100, (s.pose.height - limits.height[0]) / (limits.height[1] - limits.height[0]) * 100))}%` }} /></div><div className="cabin-aircraft"><span className="cabin-height-b747">B747</span><span className="cabin-height-a340">A340</span><span className="cabin-height-a320">A320</span></div></div>
          </div>
          <div className="cabin-length"><span>LENGTH <strong>{s.pose.length.toFixed(3)} m</strong></span><div className="cabin-length-labels"><span>RET</span><span>EXT</span></div><div className="cabin-length-track"><div style={{ width: `${Math.max(0, Math.min(100, (s.pose.length - limits.length[0]) / (limits.length[1] - limits.length[0]) * 100))}%` }} /></div></div>
          <div className="cabin-cab-rotation"><AngleGauge value={s.pose.cabYaw} label="CAB ROT." /></div>
          <div className="cabin-rotunda-rotation"><AngleGauge value={s.pose.angle} label="ROTUNDA ROT." /></div>
          <div className="cabin-slope"><span>SLOPE</span><strong>{slope.toFixed(2)} deg</strong></div>
          <div className="cabin-drive"><span>DRIVE COLUMN</span><div><strong>{s.pose.height.toFixed(3)} m</strong><strong>{s.pose.height.toFixed(3)} m</strong></div></div>
        </div>
      </div>
      <div className="cabin-message-panel"><table aria-label="Cảm biến và cảnh báo vận hành cầu"><thead><tr><th scope="col">NO.</th><th scope="col">MESSAGE</th></tr></thead><tbody>{messages.map((message, index) => <tr key={index}><td>{visiblePage * messagesPerPage + index + 1}</td><td className={message.alarm ? 'is-alarm' : ''}>{message.text}</td></tr>)}</tbody></table>
        <div className="cabin-message-controls"><button type="button" aria-expanded={help} onClick={() => setHelp(value => !value)}>HELP</button><button type="button" aria-label="Previous messages" disabled={visiblePage === 0} onClick={() => setPage(visiblePage-1)}>▲</button><button type="button" aria-label="Next messages" disabled={visiblePage === lastPage} onClick={() => setPage(visiblePage+1)}>▼</button><button type="button" className="cabin-camera-select" onClick={() => setSelectedCamera(apron ? 'cabin' : 'apron')}>CAMERA<br />{apron ? '2' : '1'}</button></div>
        {help ? <div className="cabin-help" role="status">Tiếp cận chậm, giữ khe 2,5–5 cm. Sàn thấp hơn cửa 10–20 cm, nghiêng tối đa ±2°. Thả joystick trước khi mở mái che. Cảnh báo đỏ cần xử lý trước.<br />Nhấn đúp camera để phóng lớn.</div> : null}
      </div>
      <div className="cabin-wheel-desktop"><WheelDirection s={s}/></div>
    </div>
    <div className="cabin-indicators" aria-label="Indicator lamps">
      {/* Maintenance stays off until a maintenance mode exists in the simulator. */}
      <Indicator label="MAINTENANCE" value="OFF" />
      <Indicator label="PRESET" value={s.power && !s.emergency && (s.mode === 'guide' || s.presetPark) ? 'ON' : 'OFF'} />
      <Indicator label="PARK" value={isParked ? 'IN' : 'OUT'} red={!isParked} />
      <Indicator label="OPERATION" value={s.autoLevel ? 'AUTO' : !s.power || s.emergency || s.paused ? 'OFF' : 'ON'} />
      <Indicator label="VENTILATOR" value={s.power && s.aux.ventilation ? 'ON' : 'OFF'} />
      <Indicator label="POWER" value={s.power ? 'ON' : 'OFF'} />
      <Indicator label="AIR-CON" value={s.power && s.aux.aircon ? 'ON' : 'OFF'} />
      <Indicator label="INT. LIGHT" value={s.power && s.aux.interior ? 'ON' : 'OFF'} />
      <Indicator label="EXT. LIGHT" value={s.power && s.aux.exterior ? 'ON' : 'OFF'} />
    </div>
  </div>;
}
