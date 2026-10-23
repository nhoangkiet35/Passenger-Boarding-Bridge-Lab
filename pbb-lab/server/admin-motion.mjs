export function installAdminMotion() {
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 const animated = new WeakSet();
 let frame = 0;
 let loading = null;
 let loadingTimer = 0;
 const busyElements = new Set();
 const animate = (element, delay = 0) => {
  if (reduced.matches || !element.animate) return;
  element.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], {
   duration: 420, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards',
  });
 };
 const reveal = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  for (const entry of entries) {
   if (!entry.target.isConnected) { reveal.unobserve(entry.target); continue; }
   if (entry.isIntersecting) { animate(entry.target); reveal.unobserve(entry.target); }
  }
 }, { rootMargin: '0px 0px -24px 0px', threshold: 0 }) : null;
 const stages = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  for (const entry of entries) {
   if (!entry.target.isConnected) { stages.unobserve(entry.target); continue; }
   entry.target.classList.toggle('is-current-stage', entry.isIntersecting);
  }
 }, { rootMargin: '-20% 0px -35% 0px', threshold: 0.05 }) : null;
 const heroes = '.admin-dashboard > .admin-kicker, .admin-dashboard > h1, .admin-dashboard > .admin-intro, .explore-hero > div, .explore-hero > aside, .quiz-hero > div, body > main > h1';
 function enhance() {
  frame = 0;
  document.querySelectorAll(heroes).forEach((element, index) => {
   if (animated.has(element)) return;
   animated.add(element);
   animate(element, Math.min(index, 3) * 65);
  });
  document.querySelectorAll('.admin-module, .explore-cards > a, .explore-article > header, .explore-article > section, .quiz-results, .quiz-review > details').forEach(element => {
   if (animated.has(element)) return;
   animated.add(element);
   reveal?.observe(element);
  });
  document.querySelectorAll('.explore-service-stages > li').forEach(element => {
   if (animated.has(element)) return;
   animated.add(element);
   stages?.observe(element);
  });
 }
 const observer = new MutationObserver(() => {
  if (!frame) frame = window.requestAnimationFrame(enhance);
 });
 const content = document.querySelector('.admin-content');
 if (content) observer.observe(content, { childList: true, subtree: true });
 enhance();
 const resetLoading = () => {
  window.clearTimeout(loadingTimer);
  loading?.remove(); loading = null;
  for (const element of busyElements) {
   element.removeAttribute('aria-busy');
   element.classList.remove('admin-is-loading');
  }
  busyElements.clear();
 };
 const startLoading = element => {
  if (!loading) {
   loading = document.createElement('div');
   loading.className = 'admin-route-progress';
   loading.setAttribute('role', 'status');
   loading.innerHTML = '<span class="admin-route-progress-bar" aria-hidden="true"></span><span class="admin-motion-sr-only">Đang tải, vui lòng chờ.</span>';
   document.body.append(loading);
  }
  if (element) {
   element.setAttribute('aria-busy', 'true');
   element.classList.add('admin-is-loading');
   busyElements.add(element);
  }
  // Restore controls if navigation is interrupted or a download stays on this page.
  window.clearTimeout(loadingTimer);
  loadingTimer = window.setTimeout(resetLoading, 15000);
 };
 document.addEventListener('submit', event => {
  if (event.defaultPrevented || event.target.method.toLowerCase() !== 'post') return;
  if (event.target.getAttribute('aria-busy') === 'true') { event.preventDefault(); return; }
  startLoading(event.target);
  if (event.submitter) startLoading(event.submitter);
 });
 document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  const link = event.target.closest('a[href]');
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  const target = new URL(link.href, window.location.href);
  if (target.origin !== window.location.origin || target.searchParams.has('download')) return;
  if (target.pathname === window.location.pathname && target.search === window.location.search) return;
  startLoading(link);
 });
 window.addEventListener('pageshow', resetLoading);
 reduced.addEventListener('change', () => {
  if (reduced.matches) document.querySelectorAll(heroes).forEach(element => element.getAnimations?.().forEach(animation => animation.cancel()));
 });
}

export const adminMotionStyles = `
.admin-dashboard{background-image:radial-gradient(ellipse at top right,#137e8b12,transparent 56%)}
.admin-module,.explore-cards>a{transition:translate .2s ease,box-shadow .2s ease,border-color .2s ease}
@media(hover:hover) and (pointer:fine){.admin-module:hover,.explore-cards>a:hover{translate:0 -3px;box-shadow:0 10px 26px #18364912}}
.admin-content button,.admin-content select{transition:background-color .16s ease,border-color .16s ease,box-shadow .16s ease}
.admin-content button:active:not(:disabled){scale:.98}.admin-content a:not(.admin-module):not(.explore-cards>a){transition:color .16s ease,background-color .16s ease}
.explore-service-stages>li{transition:border-color .3s ease,box-shadow .3s ease,background-color .3s ease}
.explore-service-stages>li.is-current-stage{border-color:#8dc6cd;box-shadow:0 0 0 2px #137e8b12;background-color:#f5fbfb}
.explore-service-stages>li .explore-stage-heading>span{transition:background-color .3s ease,color .3s ease}
.explore-service-stages>li.is-current-stage .explore-stage-heading>span{background:#137e8b;color:#fff}
.admin-route-progress{position:fixed;inset:0 0 auto;height:3px;z-index:10000;overflow:hidden;background:#a9d8dd;pointer-events:none}
.admin-route-progress-bar{display:block;width:40%;height:100%;background:#137e8b;animation:admin-route-loading 1.1s ease-in-out infinite}
button.admin-is-loading::after{content:'';display:inline-block;width:12px;height:12px;margin-left:8px;vertical-align:middle;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:admin-button-loading .7s linear infinite}
.admin-is-loading{cursor:progress}.admin-motion-sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
@keyframes admin-route-loading{from{transform:translateX(-100%)}to{transform:translateX(350%)}}
@keyframes admin-button-loading{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.admin-module,.explore-cards>a,.admin-content button,.admin-content select,.admin-content a,.explore-service-stages>li,.explore-service-stages>li .explore-stage-heading>span{transition:none}.admin-module:hover,.explore-cards>a:hover{translate:none}.admin-content button:active:not(:disabled){scale:1}.admin-route-progress-bar,button.admin-is-loading::after{animation:none}.admin-route-progress-bar{width:100%}}
`;
