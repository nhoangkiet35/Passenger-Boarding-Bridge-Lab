import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Command, Jog, State } from '@/lib/simulation';
import { joystickAxes } from '@/lib/joystick';
export type Send = (command: Command) => State;

/** A dead-man control: losing pointer capture, focus or key release cancels jogging. */
export function HoldButton({ axes = {}, preset = false, className = '', send, running, disabled, label, children }: {
  axes?: Jog; preset?: boolean; className?: string; send: Send; running: boolean; disabled?: boolean; label: string; children: ReactNode;
}) {
  const [held, setHeld] = useState(false);
  const ownHold = useRef(false);
  const latestSend = useRef(send); latestSend.current = send;
  const release = () => { if (ownHold.current) latestSend.current({ type: preset ? 'haltPresetPark' : 'haltJog' }); ownHold.current = false; setHeld(false); };
  const start = () => { if (ownHold.current) return; const result = send(preset ? { type: 'park', held: true } : { type: 'jog', axes }); ownHold.current = preset ? result.presetPark : !!result.jog; setHeld(ownHold.current); };
  useEffect(() => { if (!running) { ownHold.current = false; setHeld(false); } }, [running]);
  useEffect(() => () => { if (ownHold.current) latestSend.current({ type: preset ? 'haltPresetPark' : 'haltJog' }); }, [preset]);
  return <button type="button" className={'hardware-button hold-button ' + className} aria-label={label} aria-pressed={held} disabled={disabled}
    onPointerDown={e => { if (e.button !== 0) return; e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); start(); }}
    onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} onBlur={release}
    onKeyDown={e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); } }}
    onKeyUp={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); release(); } }}
  >{children}</button>;
}

export default function Joystick({ s, send }: { s: State; send: Send }) {
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const pointer = useRef<number | null>(null);
  const keys = useRef(new Set<string>());
  const latestSend = useRef(send); latestSend.current = send;
  const unavailable = s.mode !== 'manual' ? 'Chọn VẬN HÀNH để dùng joystick.'
    : s.emergency ? 'Đặt lại dừng khẩn cấp trước khi điều khiển.'
    : s.fault ? 'Khôi phục sự cố trước khi điều khiển.'
    : !s.power ? 'Bật nguồn để dùng joystick.'
    : s.paused ? 'Tiếp tục mô phỏng trước khi điều khiển.'
    : s.autoLevel ? 'AUTO LEVEL đang khóa chuyển động.'
    : s.pose.canopy > 0 || s.target.canopy > 0 ? 'Thu hoàn toàn canopy trước khi di chuyển.'
    : !s.area || !s.authorized ? 'Xác nhận khu vực và quyền tiếp cận trước khi di chuyển.' : '';
  const enabled = !unavailable;
  const apply = (x: number, y: number) => {
    const length = Math.hypot(x, y);
    if (length > 1) { x /= length; y /= length; }
    if (length < .10) { x = 0; y = 0; }
    const result = send({ type: 'jog', axes: joystickAxes(x, y) });
    setPoint(result.jog ? { x, y } : { x: 0, y: 0 });
  };
  const release = () => { pointer.current = null; keys.current.clear(); setPoint({ x: 0, y: 0 }); send({ type: 'haltJog' }); };
  const keyboard = () => apply(Number(keys.current.has('ArrowRight')) - Number(keys.current.has('ArrowLeft')), Number(keys.current.has('ArrowDown')) - Number(keys.current.has('ArrowUp')));
  useEffect(() => { if (!s.jog) { setPoint({ x: 0, y: 0 }); keys.current.clear(); } }, [s.jog]);
  useEffect(() => () => { latestSend.current({ type: 'haltJog' }); }, []);
  return <div className="joystick-block">
    <div className="hardware-label">JOYSTICK</div>
    <div className="joystick-label top">TIẾN / F</div>
    <div className="joystick-line"><span className="joystick-label">L</span>
      <div className={'joystick-surface ' + (!enabled ? 'locked' : '')} role="group" tabIndex={enabled ? 0 : -1}
        aria-label="Joystick điều khiển cầu: kéo hoặc giữ phím mũi tên, thả để dừng" aria-disabled={!enabled}
        onPointerDown={e => {
          if (!enabled || e.button !== 0) return;
          e.preventDefault(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); pointer.current = e.pointerId;
          const r = e.currentTarget.getBoundingClientRect(); apply((e.clientX - r.left - r.width / 2) / (r.width * .35), (e.clientY - r.top - r.height / 2) / (r.height * .35));
        }}
        onPointerMove={e => { if (pointer.current !== e.pointerId) return; const r = e.currentTarget.getBoundingClientRect(); apply((e.clientX - r.left - r.width / 2) / (r.width * .35), (e.clientY - r.top - r.height / 2) / (r.height * .35)); }}
        onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} onBlur={release}
        onKeyDown={e => { if (!enabled) return; if (e.key === 'Escape') release(); if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return; e.preventDefault(); if (e.repeat) return; keys.current.add(e.key); keyboard(); }}
        onKeyUp={e => { if (!keys.current.has(e.key)) return; e.preventDefault(); keys.current.delete(e.key); keyboard(); }}
      ><span className="joystick-rings"/><span className="joystick-stick" style={{ transform: `translate(${point.x * 45}px,${point.y * 45}px)` }}><span/></span></div>
      <span className="joystick-label">R</span>
    </div>
    <div className="joystick-label bottom">LÙI / R</div>
    <div className="joystick-nudges">
      <HoldButton send={send} running={!!s.jog} disabled={!enabled} axes={{angle:-1}} label="Giữ đánh lái bánh xe trái">←</HoldButton>
      <HoldButton send={send} running={!!s.jog} disabled={!enabled} axes={{length:1}} label="Giữ tiến cầu">↑</HoldButton>
      <HoldButton send={send} running={!!s.jog} disabled={!enabled} axes={{length:-1}} label="Giữ lùi cầu">↓</HoldButton>
      <HoldButton send={send} running={!!s.jog} disabled={!enabled} axes={{angle:1}} label="Giữ đánh lái bánh xe phải">→</HoldButton>
    </div>
    <p className="hardware-help">11–1h: tiến lên · 5–7h: lùi xuống.<br/>2–4h: bánh lái sang phải · 8–10h: bánh lái sang trái.</p>
    {unavailable && unavailable !== 'Bật nguồn để dùng joystick.' && <p className="hardware-help">{unavailable}</p>}
  </div>;
}
