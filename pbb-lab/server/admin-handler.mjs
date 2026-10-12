import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminLayout, adminDashboard } from './admin-layout.mjs';
const COOKIE = 'pbb_explore_session';
const TTL = 2 * 60 * 60;
// This cache adds per-instance throttling; production perimeter limits belong in the WAF.
const attempts = new Map();
const digest = (value, secret) => createHmac('sha256', secret).update(value).digest('base64url');
function equal(a, b) {
 const x = Buffer.from(a), y = Buffer.from(b);
 return x.length === y.length && timingSafeEqual(x, y);
}
function configuration() {
 const passwordHash = process.env.EXPLORE_PASSWORD_HASH;
 const secret = process.env.EXPLORE_SESSION_SECRET;
 if (!passwordHash || !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(passwordHash) || !secret || secret.length < 32) return null;
 return { passwordHash, secret };
}
function cookie(request, name) {
 return (request.headers.get('cookie') || '').split(';').map(x => x.trim()).find(x => x.startsWith(name + '='))?.slice(name.length + 1) || '';
}
function signed(value, secret) { return value + '.' + digest(value, secret); }
function verify(value, secret) {
 const dot = value.lastIndexOf('.');
 if (dot < 0) return null;
 const body = value.slice(0, dot);
 return equal(digest(body, secret), value.slice(dot + 1)) ? body : null;
}
function authenticated(request, secret, hash) {
 const payload = verify(cookie(request, COOKIE), secret);
 if (!payload) return false;
 const [expiry, nonce, version] = payload.split(':');
 return /^\d+$/.test(expiry) && Number(expiry) > Date.now() && Number(expiry) <= Date.now() + TTL * 1000 && !!nonce && version === digest(hash, secret).slice(0, 16);
}
function response(body, status = 200, extra = {}) {
 return new Response(body, { status, headers: {
 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store, max-age=0',
 'CDN-Cache-Control': 'no-store', 'Vercel-CDN-Cache-Control': 'no-store', 'Vary': 'Cookie',
 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'X-Content-Type-Options': 'nosniff',
 'Referrer-Policy': 'same-origin', 'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'self'; form-action 'self'", ...extra } });
}
function sessionCookie(request, value, age) {
 return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
function page(content) {
 return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Đăng nhập quản trị · PBB Lab</title><style>body{margin:0;background:#eef4f6;color:#173647;font:16px Arial,sans-serif;min-height:100vh;display:grid;place-items:center}main{width:min(420px,calc(100% - 72px));background:white;padding:32px;border:1px solid #d1dfe4;border-radius:16px}h1{font-size:28px}p{line-height:1.7;color:#526c7b}label{display:block;margin:20px 0 8px;font-weight:bold}input{box-sizing:border-box;width:100%;padding:14px;border:1px solid #9cb9c4;border-radius:7px;font:inherit}button{margin-top:18px;width:100%;padding:14px;background:#137e8b;color:white;border:0;border-radius:7px;font:inherit;cursor:pointer}a{color:#137e8b}input:focus,button:focus,a:focus{outline:3px solid #26a6b8;outline-offset:3px}.error{color:#9c3423}</style></head><body><main>${content}</main></body></html>`;
}
function requestedView(request) {
 const url = new URL(request.url);
 const path = url.pathname.replace(/\/$/, '');
 if (path === '/admin/explore' || path === '/explore' || path === '/api/explore') return 'explore';
 if (path === '/admin/login') return 'login';
 if (path.startsWith('/admin/') && path !== '/admin/explore') return null;
 const view = (url.searchParams.get('view') || 'home').replace(/\/$/,'');
 return ['home','explore','login'].includes(view) ? view : null;
}
function safeDestination(value) { return ['/admin','/admin/explore'].includes(value) ? value : '/admin'; }
function login(request, secret, message = '', status = 200, destination = requestedView(request) === 'explore' ? '/admin/explore' : '/admin') {
 const csrf = signed(`${Date.now() + 15*60*1000}:${randomBytes(24).toString('hex')}`, secret);
 return response(page(`<a href="/">← PBB Lab</a><h1>Đăng nhập quản trị</h1><p>Khu vực admin dành cho người được cấp quyền truy cập.</p>${message ? `<p class="error" role="alert">${message}</p>` : ''}<form method="post" action="/api/admin"><input type="hidden" name="csrf" value="${csrf}"><input type="hidden" name="returnTo" value="${destination}"><label for="password">Mật khẩu</label><input id="password" type="password" name="password" autocomplete="current-password" maxlength="128" required autofocus><button type="submit">Đăng nhập</button></form>`), status);
}
export async function handleAdmin(request) {
 const view = requestedView(request);
 if (!view) return response(page('<h1>Không tìm thấy chức năng</h1><a href="/admin">Về quản trị</a>'),404);
 const config = configuration();
 if (!config) return response(page('<h1>Nội dung đang được bảo vệ</h1><p>Máy chủ chưa hoàn tất cấu hình truy cập. Vui lòng liên hệ người quản lý.</p><a href="/">Về trang chủ</a>'), 503);
 const { passwordHash, secret } = config;
 if (!['GET','POST'].includes(request.method)) return response('', 405, { Allow: 'GET, POST' });
 if (request.method === 'POST') {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return response(page('<h1>Yêu cầu không hợp lệ</h1>'), 403);
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 4096 || !request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) return response('', 400);
  const body = await request.text();
  if (body.length > 4096) return response('', 413);
  const form = new URLSearchParams(body);
  const destination = safeDestination(form.get('returnTo') || (view === 'explore' ? '/admin/explore' : '/admin'));
  const token = verify(form.get('csrf') || '', secret);
  const expiry = Number(token?.split(':')[0]);
  const tokenLifetime = form.get('action') === 'logout' ? TTL*1000 : 15*60*1000;
  if (!token || !Number.isFinite(expiry) || expiry < Date.now() || expiry > Date.now() + tokenLifetime) return login(request, secret, 'Phiên biểu mẫu đã hết hạn. Vui lòng thử lại.', 403, destination);
  if (form.get('action') === 'logout') return response('', 303, { Location: '/admin/login', 'Set-Cookie': sessionCookie(request, '', 0) });
  const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'local';
  const key = digest(ip, secret);
  const now = Date.now();
  for (const [k,v] of attempts) if (v.until < now) attempts.delete(k);
  const state = attempts.get(key) || { count: 0, until: now + 15*60*1000 };
  if (state.count >= 5 || attempts.size >= 10000) return login(request, secret, 'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.', 429, destination);
  state.count++; attempts.set(key, state);
  const value = form.get('password') || '';
  const [salt, expected] = passwordHash.split(':');
  const actual = scryptSync(value, salt, 64).toString('hex');
  if (value.length > 128 || !equal(actual, expected)) return login(request, secret, 'Mật khẩu không đúng.', 401, destination);
  const version = digest(passwordHash, secret).slice(0,16);
  const session = signed(`${Date.now()+TTL*1000}:${randomBytes(24).toString('hex')}:${version}`, secret);
  return response('', 303, { Location: destination, 'Set-Cookie': sessionCookie(request, session, TTL) });
 }
 if (!authenticated(request, secret, passwordHash)) return login(request, secret);
 if (view === 'login') return response('',303,{Location:'/admin'});
 try {
  const directories = [join(process.cwd(), '.private-explore'), join(process.cwd(), 'pbb-lab', '.private-explore'), fileURLToPath(new URL('../.private-explore/', import.meta.url))];
  let payload;
  for (const dir of directories) {
   try { payload = await Promise.all([readFile(join(dir,'explore.js'),'utf8'),readFile(join(dir,'style.css'),'utf8')]); break; }
   catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  if (!payload) throw new Error('PRIVATE_PAYLOAD_MISSING');
  const [script, css] = payload;
  const csrf = signed(`${Date.now()+TTL*1000}:${randomBytes(24).toString('hex')}`, secret);
  const content = view === 'explore' ? '<div id="root"></div>' : adminDashboard();
  const html = adminLayout({active:view,csrf,content});
  const javascript = view === 'explore' ? `<script>${script.replaceAll('</script', '<\\/script')}</script>` : '';
  return response(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${view==='explore'?'Khám phá PBB':'Tổng quan quản trị'} · PBB Lab Admin</title><style>${css}</style></head><body>${html}${javascript}</body></html>`);
 } catch (error) { console.error('Explore private payload unavailable:', error.code || error.message); return response(page('<h1>Nội dung chưa sẵn sàng</h1><p>Vui lòng liên hệ người quản lý.</p>'),503); }
}
