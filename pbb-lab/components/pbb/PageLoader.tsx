import { Plane } from 'lucide-react';
import './loader.css';

export default function PageLoader({ page = 'simulation', compact = false, label }: {
  page?: 'simulation' | 'explore' | 'vdgs'; compact?: boolean; label?: string;
}) {
  const message = label ?? ({ simulation: 'Đang tải mô phỏng PBB', vdgs: 'Đang tải mô phỏng VDGS', explore: 'Đang tải khu vực quản trị' })[page];
  return <div className={'page-loader' + (compact ? ' page-loader--compact' : '')} role="status" aria-live="polite" aria-busy="true">
    <div className="page-loader-symbol" aria-hidden="true"><span className="page-loader-orbit"/><Plane size={28} strokeWidth={1.6}/></div>
    <strong className="page-loader-brand">PBB <span>LAB</span></strong>
    <p>{message}<span className="page-loader-dots" aria-hidden="true">…</span></p>
  </div>;
}
