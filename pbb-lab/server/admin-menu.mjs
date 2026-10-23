export function installAdminMenu() {
 const toggle = document.getElementById('admin-menu-toggle');
 const menu = document.getElementById('admin-menu');
 const close = document.getElementById('admin-menu-close');
 if (!toggle || !menu || !close) return;
 let previousOverflow = '';
 toggle.addEventListener('click', () => {
  if (menu.open) { menu.close(); return; }
  previousOverflow = document.body.style.overflow;
  menu.showModal();
  document.body.style.overflow = 'hidden';
  toggle.setAttribute('aria-expanded', 'true');
  close.focus();
 });
 close.addEventListener('click', () => menu.close());
 menu.addEventListener('click', event => {
  const bounds = menu.getBoundingClientRect();
  if (event.target === menu && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) menu.close();
 });
 menu.addEventListener('click', event => {
  // Close same-page anchor navigation as well as links to other admin modules.
  if (event.target.closest('a')) menu.close();
 });
 menu.addEventListener('close', () => {
  document.body.style.overflow = previousOverflow;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.focus({ preventScroll: true });
 });
}

export const adminMenuStyles = `
.admin-layout{grid-template-columns:minmax(0,1fr)}.admin-content{border-left:0}.admin-header-start{display:flex;align-items:center;gap:14px}.admin-menu-toggle,.admin-menu-close{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;min-width:44px;border:1px solid #53717e;border-radius:8px;cursor:pointer;font:inherit}.admin-menu-toggle{padding:8px 12px;background:#244857;color:#ecf5f7;font-size:13px}.admin-menu-toggle svg{width:20px;height:20px}.admin-menu.admin-sidebar{position:fixed;inset:0 auto 0 0;margin:0;width:min(320px,calc(100vw - 48px));height:100dvh;max-height:100dvh;max-width:none;box-sizing:border-box;border:0;border-right:1px solid #d5e2e7;padding:24px;background:#fff;color:#183649;overflow-y:auto;box-shadow:12px 0 48px #102e3e30}.admin-menu:not([open]){display:none}.admin-menu[open]{display:block;animation:admin-menu-enter .2s ease-out}.admin-menu::backdrop{background:rgb(15 23 32 / 62%);backdrop-filter:blur(4px)}.admin-menu-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:28px}.admin-menu-heading h2{font-size:20px;margin:0}.admin-menu-close{background:#f1f6f8;color:#183649;font-size:24px}.admin-menu.admin-sidebar>p,.admin-menu.admin-sidebar>small{display:block}.admin-menu.admin-sidebar nav{display:grid}.admin-menu-toggle:focus-visible,.admin-menu-close:focus-visible,.admin-menu a:focus-visible{outline:3px solid #26a6b8;outline-offset:3px}@keyframes admin-menu-enter{from{transform:translateX(-100%)}to{transform:translateX(0)}}@media(max-width:760px){.admin-header-start{gap:10px}.admin-menu-toggle{padding:8px}.admin-menu-toggle span{display:none}.admin-menu.admin-sidebar{padding:20px}}@media(prefers-reduced-motion:reduce){.admin-menu[open]{animation:none}}
`;
