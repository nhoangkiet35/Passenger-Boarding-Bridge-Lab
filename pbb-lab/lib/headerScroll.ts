/** Shared by React navigation and server-rendered admin pages. */
export function installHeaderScroll(header: HTMLElement | null) {
  if (!header) return () => {};
  let previous = Math.max(0, window.scrollY), accumulated = 0, frame = 0;
  const show = () => { header.classList.remove('header-hidden'); accumulated = 0; };
  const update = () => {
    frame = 0;
    const y = Math.max(0, window.scrollY), delta = y - previous;
    previous = y;
    if (y < 80 || header.contains(document.activeElement) || header.querySelector('[aria-expanded="true"]')) { show(); return; }
    if (!delta) return;
    accumulated = Math.sign(delta) === Math.sign(accumulated) ? accumulated + delta : delta;
    if (Math.abs(accumulated) >= 10) { header.classList.toggle('header-hidden', accumulated > 0); accumulated = 0; }
  };
  const scroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
  const reset = () => { previous = Math.max(0, window.scrollY); show(); };
  window.addEventListener('scroll', scroll, { passive: true });
  window.addEventListener('pageshow', reset);
  header.addEventListener('focusin', show);
  return () => { window.removeEventListener('scroll', scroll); window.removeEventListener('pageshow', reset); header.removeEventListener('focusin', show); window.cancelAnimationFrame(frame); };
}
