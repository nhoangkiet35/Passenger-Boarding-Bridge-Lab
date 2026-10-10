import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { apronView, cabinView, cctvView, CONNECTION, PARK, limits, moving, parked, wheelMotion, type Pose, type State } from '@/lib/simulation';
import { World } from './Scene';
import type { Send } from './Joystick';
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

function ScreenWindow({ kind, s, send, close }: { kind: 'maintenance' | 'preset'; s: State; send: Send; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState('');
  const [departure, setDeparture] = useState(false);
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => { node?.close(); }; }, []);
  const target = departure ? PARK : CONNECTION;
  return <dialog className="cabin-window" ref={dialog} aria-labelledby="cabin-window-title" onCancel={close}>
    <header><strong id="cabin-window-title">{kind === 'maintenance' ? 'MAINTENANCE' : 'PRESET'}</strong><button type="button" aria-label="Close window" onClick={close}>×</button></header>
    {kind === 'maintenance' ? <form onSubmit={event => { event.preventDefault(); event.currentTarget.reset(); setError('SERVICE AUTHENTICATION NOT CONFIGURED. ACCESS DENIED.'); }}>
      <p>SERVICE PERSONNEL ONLY</p><label htmlFor="cabin-service-password">PASSWORD</label><input id="cabin-service-password" type="password" required autoComplete="off" />
      {error ? <p className="cabin-window-error" role="alert">{error}</p> : null}<div className="cabin-window-actions"><button type="button" onClick={close}>CANCEL</button><button type="submit">LOGIN</button></div>
    </form> : <div>
      <label htmlFor="cabin-preset-position">PRESET POSITION</label><select id="cabin-preset-position" value={departure ? 'departure' : 'approach'} onChange={event => setDeparture(event.target.value === 'departure')}><option value="approach">AIRCRAFT / APPROACH</option><option value="departure">PARK / DEPARTURE</option></select>
      <dl><dt>HEIGHT</dt><dd>{target.height.toFixed(3)} m</dd><dt>LENGTH</dt><dd>{target.length.toFixed(3)} m</dd><dt>CAB ROT.</dt><dd>{target.cabYaw.toFixed(1)} deg</dd><dt>ROTUNDA ROT.</dt><dd>{target.angle.toFixed(1)} deg</dd></dl>
      {error ? <p className="cabin-window-error" role="alert">{error}</p> : null}
      <div className="cabin-window-actions"><button type="button" onClick={close}>CLOSE</button><button type="button" disabled={!s.power || s.emergency} onClick={() => { const result = send({ type: 'guide', departure }); if (result.message.startsWith('Thao tác bị chặn:')) { setError(departure ? 'COMPLETE CONNECTION BEFORE DEPARTURE.' : 'RETURN TO PARK BEFORE APPROACH.'); } else close(); }}>START</button></div>
    </div>}
  </dialog>;
}

export default function CabinMainScreen({ s, send }: { s: State; send: Send }) {
  const [selectedCamera, setSelectedCamera] = useState<'apron' | 'cabin' | null>(null);
  const apron = cctvView(s, selectedCamera) === 'apron';
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const [help, setHelp] = useState(false);
  const [lost, setLost] = useState(false);
  const [screenWindow, setScreenWindow] = useState<'maintenance' | 'preset' | null>(null);
  const lastTouch = useRef(0);
  const lastTouchToggle = useRef(-1000);
  const isMoving = moving(s);
  const isParked = parked(s);
  const plcRun = s.power && !s.emergency;
  const slope = Math.atan2(s.pose.height - 3, s.pose.length) * 180 / Math.PI;
  const wheel = wheelMotion(s);
  const blocked = s.message.startsWith('Thao tác bị chặn:');
  const messages = page === 0 ? [
    s.emergency ? 'EMERGENCY STOP' : blocked ? 'CONTROL COMMAND REJECTED' : isMoving ? 'BRIDGE MOVING' : s.pose.canopy >= .999 ? 'CANOPY DEPLOYED' : 'BRIDGE READY',
    plcRun ? 'PLC RUN' : 'PLC STOP',
    isParked ? 'PARK IN' : 'PARK OUT',
    s.mode === 'manual' ? 'MANUAL MODE' : 'PRESET MODE',
    s.area ? 'AREA CLEAR' : 'CHECK MOVEMENT AREA',
  ] : [
    s.authorized ? 'AIRCRAFT ACCESS AUTHORIZED' : 'AWAITING AIRCRAFT AUTHORIZATION',
    `VENTILATOR ${s.power && s.aux.ventilation ? 'ON' : 'OFF'}`,
    `AIR-CON ${s.power && s.aux.aircon ? 'ON' : 'OFF'}`,
    `INT. LIGHT ${s.power && s.aux.interior ? 'ON' : 'OFF'}`,
    `EXT. LIGHT ${s.power && s.aux.exterior ? 'ON' : 'OFF'}`,
  ];
  const toggleExpanded = () => setExpanded(value => !value);
  return <div className={`cabin-main${expanded ? ' camera-expanded' : ''}`} aria-label="Cabin main screen">
    <div className="cabin-main-grid">
      <div className="cabin-camera-frame">
        <div className="cabin-camera" role="button" tabIndex={0} aria-label="Camera: double-click or double-tap to expand or restore" aria-pressed={expanded}
          onDoubleClick={() => { if (performance.now() - lastTouchToggle.current > 600) toggleExpanded(); }}
          onPointerUp={event => { if (event.pointerType !== 'touch') return; const now = performance.now(); if (lastTouch.current > 0 && now - lastTouch.current < 350) { toggleExpanded(); lastTouch.current = 0; lastTouchToggle.current = now; } else lastTouch.current = now; }}
          onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleExpanded(); } else if (event.key === 'Escape') setExpanded(false); }}>
          <CameraBoundary><Canvas dpr={[1, 1.25]} camera={{ fov: apron ? 95 : 100, near: .03, far: 150 }} frameloop={s.power ? 'always' : 'demand'}
            onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', () => setLost(true)); gl.domElement.addEventListener('webglcontextrestored', () => setLost(false)); }}>
            <World s={s} cctv /><CameraPosition pose={s.pose} apron={apron} />
          </Canvas></CameraBoundary>
          {!s.power ? <div className="cabin-video-off" /> : lost ? <span className="cabin-video-error">NO SIGNAL</span> : null}
        </div>
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
      <div className="cabin-message-panel"><table aria-label="Bridge messages"><thead><tr><th scope="col">NO.</th><th scope="col">MESSAGE</th></tr></thead><tbody>{messages.map((message, index) => <tr key={index}><td>{page * 5 + index + 1}</td><td className={page === 0 && index === 0 && (s.emergency || blocked) ? 'is-alarm' : ''}>{message}</td></tr>)}</tbody></table>
        <div className="cabin-message-controls"><button type="button" aria-expanded={help} onClick={() => setHelp(value => !value)}>HELP</button><button type="button" aria-label="Previous messages" disabled={page === 0} onClick={() => setPage(0)}>▲</button><button type="button" aria-label="Next messages" disabled={page === 1} onClick={() => setPage(1)}>▼</button><button type="button" className="cabin-camera-select" onClick={() => setSelectedCamera(apron ? 'cabin' : 'apron')}>CAMERA<br />{apron ? '2' : '1'}</button></div>
        {help ? <div className="cabin-help" role="status">CAMERA: DOUBLE-TAP TO EXPAND / RESTORE.<br />L: − / R: +. DOWN SLOPE: −.</div> : null}
      </div>
      <div className="cabin-wheel"><div>WHEEL ROT. <strong>{wheel.angle.toFixed(1)} deg</strong></div><svg viewBox="0 0 160 160" role="img" aria-label={`Wheel steering ${wheel.angle.toFixed(1)} degrees, ${wheel.direction === 0 ? 'stopped' : wheel.direction > 0 ? 'forward drive' : 'reverse drive'}`}><circle cx="80" cy="80" r="65" fill="none" stroke="#00aaff" /><text x="80" y="29" textAnchor="middle">F</text><text x="80" y="142" textAnchor="middle">R</text><g transform={`rotate(${wheel.angle} 80 80)`}><rect x="52" y="51" width="16" height="58" rx="8" fill="#000000" /><rect x="94" y="51" width="16" height="58" rx="8" fill="#000000" /><path d="M68 80 H94" stroke="#808080" strokeWidth="15" />{wheel.direction > 0 ? <path d="M80 34 L68 49 H92 Z" fill="#ff0000" /> : wheel.direction < 0 ? <path d="M80 126 L68 111 H92 Z" fill="#ff0000" /> : null}</g></svg></div>
    </div>
    <div className="cabin-indicators" aria-label="Indicator lamps">
      <button type="button" className="cabin-mode-lamp" aria-label="MAINTENANCE: open service password window" aria-haspopup="dialog" onClick={() => setScreenWindow('maintenance')}><i aria-hidden="true" /><span>MAIN-<br />TENANCE</span></button>
      <button type="button" className="cabin-mode-lamp" aria-label="PRESET: open preset window" aria-haspopup="dialog" onClick={() => setScreenWindow('preset')}><i className={s.mode === 'guide' ? 'active' : ''} aria-hidden="true" /><span>PRESET</span></button>
      <Indicator label="PARK" value={isParked ? 'IN' : 'OUT'} red={!isParked} />
      <Indicator label="OPERATION" value={!s.power || s.emergency || s.paused ? 'OFF' : s.mode === 'guide' ? 'AUTO' : 'ON'} />
      <Indicator label="VENTILATOR" value={s.power && s.aux.ventilation ? 'ON' : 'OFF'} />
      <Indicator label="POWER" value={s.power ? 'ON' : 'OFF'} />
      <Indicator label="AIR-CON" value={s.power && s.aux.aircon ? 'ON' : 'OFF'} />
      <Indicator label="INT. LIGHT" value={s.power && s.aux.interior ? 'ON' : 'OFF'} />
      <Indicator label="EXT. LIGHT" value={s.power && s.aux.exterior ? 'ON' : 'OFF'} />
    </div>
    {screenWindow ? <ScreenWindow kind={screenWindow} s={s} send={send} close={() => setScreenWindow(null)} /> : null}
  </div>;
}
