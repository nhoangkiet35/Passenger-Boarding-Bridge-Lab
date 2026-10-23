export function installAdminMenu() {
 const toggle = document.getElementById('admin-menu-toggle');
 const menu = document.getElementById('admin-menu');
 const close = document.getElementById('admin-menu-close');
 if (!toggle || !menu || !close) return;
 let previousOverflow = '';
 let closeTimer = 0;
 const requestClose = () => {
  if (!menu.open || menu.classList.contains('is-closing')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { menu.close(); return; }
  menu.classList.add('is-closing');
  // Keep the dialog modal until its exit animation completes.
  closeTimer = window.setTimeout(() => menu.close(), 260);
 };
 menu.addEventListener('animationend', event => {
  if (event.target === menu && event.animationName === 'admin-menu-exit') menu.close();
 });
 menu.addEventListener('cancel', event => { event.preventDefault(); requestClose(); });
 toggle.addEventListener('click', () => {
  if (menu.open) { requestClose(); return; }
  previousOverflow = document.body.style.overflow;
  menu.showModal();
  document.body.style.overflow = 'hidden';
  toggle.setAttribute('aria-expanded', 'true');
  close.focus();
 });
 close.addEventListener('click', requestClose);
 menu.addEventListener('click', event => {
  const bounds = menu.getBoundingClientRect();
  if (event.target === menu && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) requestClose();
 });
 menu.addEventListener('click', event => {
  // Close same-page anchor navigation as well as links to other admin modules.
  if (event.target.closest('a')) requestClose();
 });
 menu.addEventListener('close', () => {
  window.clearTimeout(closeTimer);
  menu.classList.remove('is-closing');
  document.body.style.overflow = previousOverflow;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.focus({ preventScroll: true });
 });
}

export const adminMenuStyles = `
.admin-layout{grid-template-columns:minmax(0,1fr)}.admin-content{border-left:0}.admin-header-start{display:flex;align-items:center;gap:14px}.admin-menu-toggle,.admin-menu-close{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;min-width:44px;border:1px solid #53717e;border-radius:8px;cursor:pointer;font:inherit}.admin-menu-toggle{padding:8px 12px;background:#244857;color:#ecf5f7;font-size:13px}.admin-menu-toggle svg{width:20px;height:20px}.admin-menu.admin-sidebar{position:fixed;inset:0 auto 0 0;margin:0;width:min(320px,calc(100vw - 48px));height:100dvh;max-height:100dvh;max-width:none;box-sizing:border-box;border:0;border-right:1px solid #d5e2e7;padding:24px;background:#fff;color:#183649;overflow-y:auto;box-shadow:12px 0 48px #102e3e30}.admin-menu:not([open]){display:none}.admin-menu[open]{display:block;animation:admin-menu-enter .2s ease-out}.admin-menu::backdrop{background:rgb(15 23 32 / 62%);backdrop-filter:blur(4px)}.admin-menu-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:28px}.admin-menu-heading h2{font-size:20px;margin:0}.admin-menu-close{background:#f1f6f8;color:#183649;font-size:24px}.admin-menu.admin-sidebar>p,.admin-menu.admin-sidebar>small{display:block}.admin-menu.admin-sidebar nav{display:grid}.admin-menu-toggle:focus-visible,.admin-menu-close:focus-visible,.admin-menu a:focus-visible{outline:3px solid #26a6b8;outline-offset:3px}@keyframes admin-menu-enter{from{transform:translateX(-100%)}to{transform:translateX(0)}}@media(max-width:760px){.admin-header-start{gap:10px}.admin-menu-toggle{padding:8px}.admin-menu-toggle span{display:none}.admin-menu.admin-sidebar{padding:20px}}@media(prefers-reduced-motion:reduce){.admin-menu[open]{animation:none}}
.admin-header{animation:admin-header-reveal .35s ease-out;box-shadow:0 3px 18px #102e3e14}
.admin-menu-toggle,.admin-menu-close,.admin-header-actions button{transition:background-color .18s ease,border-color .18s ease,scale .15s ease}
.admin-menu-toggle:hover,.admin-header-actions button:hover{background:#315b6b;border-color:#7aa5b5}
.admin-menu-close:hover{background:#dceff0;border-color:#137e8b}
.admin-menu-toggle:active,.admin-menu-close:active,.admin-header-actions button:active{scale:.95}
.admin-menu-toggle svg{transition:rotate .25s ease}
.admin-menu-toggle[aria-expanded="true"] svg{rotate:90deg}
.admin-brand span{transition:color .2s ease}.admin-brand:hover span{color:#b5f3ed}
.admin-menu[open]{animation:admin-menu-enter .28s cubic-bezier(.22,1,.36,1) both}
.admin-menu[open]::backdrop{animation:admin-backdrop-enter .24s ease-out both}
.admin-menu[open].is-closing{animation:admin-menu-exit .18s ease-in both}
.admin-menu[open].is-closing::backdrop{animation:admin-backdrop-exit .18s ease-in both}
.admin-menu nav a{transition:transform .18s ease,background-color .18s ease,color .18s ease}
.admin-menu nav a:hover{transform:translateX(4px)}
.admin-menu[open]:not(.is-closing) nav a{animation:admin-menu-item .3s ease-out var(--menu-item-delay,0s) both}
.admin-menu nav a:nth-child(1){--menu-item-delay:.04s}.admin-menu nav a:nth-child(2){--menu-item-delay:.07s}.admin-menu nav a:nth-child(3){--menu-item-delay:.10s}.admin-menu nav a:nth-child(4){--menu-item-delay:.13s}
@keyframes admin-header-reveal{from{opacity:0;translate:0 -8px}to{opacity:1;translate:0 0}}
@keyframes admin-menu-enter{from{transform:translateX(-100%)}to{transform:translateX(0)}}
@keyframes admin-menu-exit{from{transform:translateX(0)}to{transform:translateX(-100%)}}
@keyframes admin-backdrop-enter{from{opacity:0}to{opacity:1}}
@keyframes admin-backdrop-exit{from{opacity:1}to{opacity:0}}
@keyframes admin-menu-item{from{opacity:0;translate:-8px 0}to{opacity:1;translate:0 0}}
@media(prefers-reduced-motion:reduce){.admin-header,.admin-menu[open],.admin-menu[open]::backdrop,.admin-menu[open].is-closing,.admin-menu[open].is-closing::backdrop,.admin-menu[open]:not(.is-closing) nav a{animation:none}.admin-menu-toggle,.admin-menu-close,.admin-header-actions button,.admin-menu-toggle svg,.admin-brand span,.admin-menu nav a{transition:none}.admin-menu nav a:hover{transform:none}.admin-menu-toggle:active,.admin-menu-close:active,.admin-header-actions button:active{scale:1}}
`;
