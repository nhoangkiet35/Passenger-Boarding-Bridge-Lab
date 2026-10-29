/** Wheel steering relative to the bridge, independent of its world heading. */
export default function WheelRotation({angle}:{angle:number}) {
 const rotation=Math.max(-90,Math.min(90,angle));
 return <section className="ops-wheel-rot" aria-label="Wheel rotation">
  <div className="ops-wheel-rot-title"><span>WHEEL ROT.</span><output aria-label="Góc xoay bánh xe">{rotation.toFixed(1)} deg</output></div>
  <svg viewBox="0 0 160 160" role="img" aria-label={`Góc xoay bánh xe ${rotation.toFixed(1)} độ`}>
   <circle cx="80" cy="80" r="67" fill="none" stroke="currentColor" strokeWidth="1"/>
   <text x="80" y="27" textAnchor="middle">F</text>
   <text x="80" y="142" textAnchor="middle">R</text>
   <g transform={`rotate(${rotation} 80 80)`}>
    <path d="M80 33 L67 49 H93 Z" fill="#ff1717"/>
    <rect x="57" y="73" width="46" height="15" fill="#808080"/>
    <rect x="50" y="51" width="16" height="59" rx="8" fill="#000"/>
    <rect x="94" y="51" width="16" height="59" rx="8" fill="#000"/>
   </g>
  </svg>
 </section>;
}
