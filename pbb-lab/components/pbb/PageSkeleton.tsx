import './skeleton.css';

export default function PageSkeleton({ page = 'simulation' }: { page?: 'about' | 'simulation' | 'explore' }) {
  const about = page !== 'simulation';
  const label = page === 'explore' ? 'Đang tải thư viện kỹ thuật' : about ? 'Đang tải trang giới thiệu' : 'Đang tải không gian mô phỏng';
  return <div className={`page-skeleton ${about ? 'skeleton-about' : 'skeleton-simulation'}`} role="status" aria-busy="true" aria-label={label}>
    <span className="sr-only">{label}…</span>
    <div aria-hidden="true">
      <div className="skeleton-header"><div className="skeleton-block skeleton-brand"/><div className="skeleton-nav"><i className="skeleton-block"/><i className="skeleton-block"/><i className="skeleton-block"/></div></div>
      {about ? <><div className="skeleton-hero"><div className="skeleton-copy"><div className="skeleton-block skeleton-kicker"/><div className="skeleton-block skeleton-heading"/><div className="skeleton-block skeleton-heading short"/><div className="skeleton-block skeleton-heading"/><div className="skeleton-block skeleton-line"/><div className="skeleton-block skeleton-line short"/><div className="skeleton-block skeleton-button"/></div><div className="skeleton-block skeleton-hero-image"/></div><div className="skeleton-stat-grid">{[0, 1, 2].map(i => <div key={i}><div className="skeleton-block skeleton-heading"/><div className="skeleton-block skeleton-line"/></div>)}</div></> : <><div className="skeleton-title"><div className="skeleton-block skeleton-kicker"/><div className="skeleton-block skeleton-heading"/><div className="skeleton-block skeleton-line"/></div><div className="skeleton-workspace"><div className="skeleton-panel"><div className="skeleton-toolbar"><div className="skeleton-block skeleton-button"/><div className="skeleton-block skeleton-kicker"/></div><div className="skeleton-block skeleton-viewport"/><div className="skeleton-stat-grid">{[0, 1, 2].map(i => <div className="skeleton-block skeleton-line" key={i}/>)}</div></div><div className="skeleton-panel skeleton-controls"><div className="skeleton-block skeleton-heading"/>{[0, 1, 2, 3].map(i => <div className="skeleton-control" key={i}><div className="skeleton-block skeleton-line"/><div className="skeleton-block skeleton-slider"/></div>)}<div className="skeleton-block skeleton-button"/></div></div></>}
    </div>
  </div>;
}
