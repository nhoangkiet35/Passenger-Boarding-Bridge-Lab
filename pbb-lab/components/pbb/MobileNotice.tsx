'use client';

import { useEffect, useState } from 'react';
import { Monitor, X } from 'lucide-react';
import './mobile-notice.css';

export default function MobileNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Include phones held sideways without showing the notice on larger tablets.
    const phone = window.matchMedia('(max-width: 767px), (pointer: coarse) and (max-height: 500px) and (max-width: 1000px)');
    if (!phone.matches) return;

    const show = window.setTimeout(() => setVisible(true), 0);
    const hide = window.setTimeout(() => setVisible(false), 5000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  return (
    <aside className="mobile-notice-region" aria-live="polite" aria-atomic="true">
      {visible && (
        <div className="mobile-notice">
          <span className="mobile-notice-icon"><Monitor size={21} aria-hidden="true" /></span>
          <p>Để trải nghiệm <strong>PBB Lab</strong> tốt hơn, hãy sử dụng máy tính bảng hoặc laptop.</p>
          <button type="button" aria-label="Đóng thông báo" onClick={() => setVisible(false)}><X size={17} aria-hidden="true" /></button>
        </div>
      )}
    </aside>
  );
}
