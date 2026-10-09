'use client';

import { useState } from 'react';

const parts = [
  { name: 'Rotunda', vi: 'Khớp xoay phía nhà ga', description: 'Liên kết cầu cố định với ống lồng. Trụ đỡ tạo điểm tựa cho thân cầu xoay để thay đổi hướng tiếp cận.', x: 155, y: 156 },
  { name: 'Tunnel', vi: 'Các đoạn ống lồng', description: 'Tạo lối đi cho hành khách. Các đoạn ống thu vào hoặc duỗi ra để thay đổi tầm với từ nhà ga tới cửa tàu bay.', x: 345, y: 151 },
  { name: 'Drive column', vi: 'Cơ cấu nâng', description: 'Nâng và hạ ống lồng cùng cabin để điều chỉnh cao độ sàn. Chuyển động này phối hợp với vị trí và hướng của cầu.', x: 510, y: 237 },
  { name: 'Wheel carriage', vi: 'Cụm bánh xe', description: 'Di chuyển cụm đỡ trên sân đỗ, giúp đưa thân cầu tới vị trí tiếp cận. Trong PBB Lab, cơ cấu lái bánh xe được giản lược.', x: 497, y: 317 },
  { name: 'Cabin', vi: 'Đầu cầu tại cửa tàu bay', description: 'Là khu vực nối cầu với tàu bay và đặt bàn điều khiển. Góc quay cabin hỗ trợ căn chỉnh đầu cầu theo cửa tàu bay.', x: 620, y: 170 },
  { name: 'Canopy', vi: 'Mái che mềm', description: 'Mái che tại đầu cabin. Trong PBB Lab, canopy có trạng thái thu và triển khai để người học quan sát.', x: 689, y: 137 },
  { name: 'Bumper', vi: 'Đệm tiếp giáp', description: 'Đệm ở mép trước sàn cabin tại vùng tiếp xúc với thân tàu bay. Trong mô hình, bộ phận này được biểu diễn tại đầu cabin.', x: 690, y: 212 },
];

export default function BridgeExplorer() {
  const [selected, setSelected] = useState(0);
  const part = parts[selected];
  return <div className="bridge-explorer">
    <div className="bridge-drawing">
      <div className="drawing-heading"><span>SƠ ĐỒ CẤU TẠO / PBB</span><span>MINH HỌA · KHÔNG THEO TỶ LỆ</span></div>
      <svg viewBox="0 0 800 390" role="img" aria-label={`Sơ đồ cầu hành khách, đang chọn ${part.name}: ${part.vi}`}>
        <defs><pattern id="bridge-grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#214151" strokeWidth=".5"/></pattern></defs>
        <rect width="800" height="390" fill="url(#bridge-grid)"/>
        <path d="M25 336H775" stroke="#54717d" strokeWidth="2"/>
        <g stroke="#8aa9b5" strokeWidth="2" fill="#163444">
          <path d="M30 95H104V285H30Z"/><path d="M35 112H98M35 145H98M35 178H98M35 211H98"/>
          <path d="M103 150H157V212H103Z" fill="#264a5b"/>
          <path d="M138 135Q159 120 181 135V215Q159 230 138 215Z" fill={selected === 0 ? '#1f6a7d' : '#315361'}/>
          <path d="M155 230V335M149 335H164"/>
          <path d="M181 137L347 142V211L181 214Z" fill={selected === 1 ? '#1f6a7d' : '#26495b'}/>
          <path d="M320 142L475 148V207L320 211Z" fill={selected === 1 ? '#216075' : '#244351'}/>
          <path d="M449 149L583 154V203L449 207Z" fill={selected === 1 ? '#235a6a' : '#203b49'}/>
          {Array.from({length: 10}, (_, i) => <path key={i} d={`M${196+i*36} 150v46`} stroke="#6d98a7"/>)}
          <path d="M183 174L579 177" stroke="#5e8a99"/>
          <path d="M481 204H517V310H481Z" fill={selected === 2 ? '#1f6a7d' : '#325b6b'}/>
          <path d="M489 215V294M509 215V294" stroke="#b4c9ce" strokeWidth="5"/>
          <path d="M462 308H541V327H462Z" fill={selected === 3 ? '#1f6a7d' : '#416270'}/>
          <circle cx="477" cy="322" r="15" fill="#081c28"/><circle cx="529" cy="322" r="15" fill="#081c28"/>
          <path d="M581 149Q606 135 634 149V210Q606 222 581 210Z" fill={selected === 4 ? '#1f6a7d' : '#355666'}/>
          <path d="M627 146H667V215H627Z" fill={selected === 4 ? '#1f6a7d' : '#2c4d5d'}/>
          <path d="M636 157H659V183H636Z" fill="#55909f"/>
          <path d="M668 143Q680 132 699 145V213H668Z" fill={selected === 5 ? '#208599' : '#496773'}/>
          <path d="M674 143V207M681 139V207M688 140V207" stroke="#789ca7"/>
          <path d="M669 214H700" stroke={selected === 6 ? '#ffcf78' : '#c49a55'} strokeWidth="8"/>
          <path d="M743 66Q705 84 705 160V245Q709 291 758 300H785V66Z" fill="#23404e"/>
          <path d="M727 139H756V215H727Z" fill="#284b5b"/>
        </g>
        <path d="M218 255H437M218 250V260M437 250V260" stroke="#55c9d6" strokeDasharray="5 4"/>
        <text x="326" y="279" textAnchor="middle" fill="#8fabb6" fontSize="12">THU / DUỖI</text>
        <text x="61" y="362" textAnchor="middle" fill="#8fabb6" fontSize="12">NHÀ GA</text>
        <text x="746" y="362" textAnchor="middle" fill="#8fabb6" fontSize="12">TÀU BAY</text>
        {parts.map((p,i) => <g key={p.name} className={selected === i ? 'drawing-marker selected' : 'drawing-marker'} transform={`translate(${p.x},${p.y})`}><circle r="15"/><text textAnchor="middle" dy="4">{String(i+1).padStart(2,'0')}</text></g>)}
      </svg>
      <div className="part-selector" role="group" aria-label="Chọn bộ phận cầu hành khách">{parts.map((p,i) => <button key={p.name} type="button" aria-pressed={selected === i} aria-controls="bridge-part-detail" onClick={() => setSelected(i)}><span>{String(i+1).padStart(2,'0')}</span>{p.name}</button>)}</div>
    </div>
    <div id="bridge-part-detail" className="part-detail" aria-live="polite" aria-atomic="true"><span className="part-number">{String(selected+1).padStart(2,'0')} / 07</span><h3>{part.name}</h3><p className="part-subtitle">{part.vi}</p><p>{part.description}</p><small>Minh họa bộ phận trong mô hình PBB Lab.</small><span className="part-hint">Chọn tên bộ phận để khám phá cấu tạo.</span></div>
  </div>;
}
