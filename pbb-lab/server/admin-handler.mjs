import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminLayout, adminDashboard } from './admin-layout.mjs';
import { quizPage } from './quiz-page.mjs';
import { findEmployee, employeeSessionVersion, employeePage, employeeStyles, employeeEditStyles } from './employees.mjs';
import { readRoster,canWriteRoster } from './employee-store.mjs';
import { writeEmployeeWorkbook,RosterError } from './employee-workbook.mjs';
import { employeeAction } from './employee-actions.mjs';
import { installHeaderScroll } from '../lib/headerScroll.ts';
import { installAdminMenu, adminMenuStyles } from './admin-menu.mjs';
import { installAdminMotion, adminMotionStyles } from './admin-motion.mjs';
const COOKIE = 'pbb_explore_session';
const TTL = 2 * 60 * 60;
const REMEMBER_TTL = 7 * 24 * 60 * 60;
// This cache adds per-instance throttling; production perimeter limits belong in the WAF.
const attempts = new Map();
const digest = (value, secret) => createHmac('sha256', secret).update(value).digest('base64url');
function equal(a, b) {
 const x = Buffer.from(a), y = Buffer.from(b);
 return x.length === y.length && timingSafeEqual(x, y);
}
function configuration() {
 const secret = process.env.EXPLORE_SESSION_SECRET;
 if (!secret || secret.length < 32) return null;
 return { secret };
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
function authenticated(request, secret, employees) {
 const payload = verify(cookie(request, COOKIE), secret);
 if (!payload) return false;
 const [expiry, nonce, version, employeeId, persistence, extra] = payload.split(':');
 const lifetime = persistence === 'remember' ? REMEMBER_TTL : TTL;
 if (extra !== undefined || (persistence !== undefined && persistence !== 'remember') || !/^\d+$/.test(expiry) || Number(expiry) <= Date.now() || Number(expiry) > Date.now() + lifetime * 1000 || !nonce || version !== digest(employeeSessionVersion, secret).slice(0, 16)) return null;
 return findEmployee(employeeId,employees);
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
 return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Đăng nhập quản trị · PBB Lab</title><style>body{margin:0;background:#eef4f6;color:#173647;font:16px Arial,sans-serif;min-height:100vh;display:grid;place-items:center}main{width:min(420px,calc(100% - 72px));background:white;padding:32px;border:1px solid #d1dfe4;border-radius:16px}h1{font-size:28px}p{line-height:1.7;color:#526c7b}label{display:block;margin:20px 0 8px;font-weight:bold}input{box-sizing:border-box;width:100%;padding:14px;border:1px solid #9cb9c4;border-radius:7px;font:inherit}button{margin-top:18px;width:100%;padding:14px;background:#137e8b;color:white;border:0;border-radius:7px;font:inherit;cursor:pointer}a{color:#137e8b}input:focus,button:focus,a:focus{outline:3px solid #26a6b8;outline-offset:3px}.error{color:#9c3423}.login-remember{display:flex;align-items:flex-start;gap:10px;font-size:14px;font-weight:400;cursor:pointer;min-height:44px}.login-remember input{width:18px;height:18px;padding:0;flex-shrink:0;margin:1px 0;accent-color:#137e8b}.login-remember small{display:block;color:#526c7b;font-size:12px;line-height:1.6;margin-top:4px}${adminMotionStyles}</style></head><body><main>${content}</main><script>(${installAdminMotion.toString()})();</script></body></html>`;
}
function requestedView(request) {
 const url = new URL(request.url);
 const path = url.pathname.replace(/\/$/, '');
 if (path === '/admin/explore' || path === '/explore' || path === '/api/explore') return 'explore';
 if (path === '/admin/quiz') return 'quiz';
 if (path === '/admin/employees') return 'employees';
 if (path === '/admin/login') return 'login';
 if (path.startsWith('/admin/') && path !== '/admin/explore') return null;
 const view = (url.searchParams.get('view') || 'home').replace(/\/$/,'');
 return ['home','explore','quiz','employees','login'].includes(view) ? view : null;
}
function safeDestination(value) { return ['/admin','/admin/explore','/admin/quiz','/admin/employees'].includes(value) ? value : '/admin'; }
function login(request, secret, message = '', status = 200, destination = ['explore','quiz','employees'].includes(requestedView(request)) ? '/admin/' + requestedView(request) : '/admin') {
 const csrf = signed(`${Date.now() + 15*60*1000}:${randomBytes(24).toString('hex')}`, secret);
 return response(page(`<a href="/">← PBB Lab</a><h1>Đăng nhập quản trị</h1><p>Nhập ID nhân viên của bạn vào ô mật khẩu để đăng nhập.</p>${message ? `<p class="error" role="alert">${message}</p>` : ''}<form method="post" action="/api/admin"><input type="hidden" name="csrf" value="${csrf}"><input type="hidden" name="returnTo" value="${destination}"><label for="password">Mật khẩu (ID nhân viên)</label><input id="password" type="password" name="password" autocomplete="current-password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" required autofocus><label class="login-remember"><input type="checkbox" name="remember" value="1"><span>Ghi nhớ mật khẩu<small>Duy trì đăng nhập trên thiết bị này trong 7 ngày.</small></span></label><button type="submit">Đăng nhập</button></form>`), status);
}
export async function handleAdmin(request) {
 const view = requestedView(request);
 if (!view) return response(page('<h1>Không tìm thấy chức năng</h1><a href="/admin">Về quản trị</a>'),404);
 const config = configuration();
 if (!config) return response(page('<h1>Nội dung đang được bảo vệ</h1><p>Máy chủ chưa hoàn tất cấu hình truy cập. Vui lòng liên hệ người quản lý.</p><a href="/">Về trang chủ</a>'), 503);
 const { secret } = config;
 if (!['GET','POST'].includes(request.method)) return response('', 405, { Allow: 'GET, POST' });
 let roster;
 try {roster=await readRoster();}catch(error){console.error('Employee roster unavailable:',error.name);return response(page('<h1>Danh sách nhân viên chưa sẵn sàng</h1><p>Không đọc được danh sách. Vui lòng liên hệ người quản lý.</p>'),503);}
 const employee=authenticated(request,secret,roster.employees);
 let employeeResult=null;
 if (request.method === 'POST') {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return response(page('<h1>Yêu cầu không hợp lệ</h1>'), 403);
  const length = Number(request.headers.get('content-length') || 0);
  const maximum=view==='employees'?1100000:4096;
  if(length>maximum)return response(page('<h1>File quá lớn</h1><a href="/admin/employees">Về danh sách nhân viên</a>'),413);
  const contentType=request.headers.get('content-type')||'';
  if(!contentType.startsWith('application/x-www-form-urlencoded')&&!(view==='employees'&&contentType.startsWith('multipart/form-data')))return response('',400);
  let bytes=0;const chunks=[];
  for await(const chunk of request.body||[]){bytes+=chunk.length;if(bytes>maximum)return response('',413);chunks.push(chunk);}
  const body=Buffer.concat(chunks);
  let form;
  try {form=contentType.startsWith('multipart/form-data')?await new Request(request.url,{method:'POST',headers:request.headers,body}).formData():new URLSearchParams(body.toString('utf8'));}catch{return response('',400);}
  const destination = safeDestination(form.get('returnTo') || (['explore','quiz','employees'].includes(view) ? '/admin/' + view : '/admin'));
  const token = verify(typeof form.get('csrf')==='string'?form.get('csrf'):'', secret);
  const expiry = Number(token?.split(':')[0]);
  const tokenLifetime = form.get('action') === 'logout' || String(form.get('action')||'').startsWith('employee-') ? TTL*1000 : 15*60*1000;
  if (!token || !Number.isFinite(expiry) || expiry < Date.now() || expiry > Date.now() + tokenLifetime) return login(request, secret, 'Phiên biểu mẫu đã hết hạn. Vui lòng thử lại.', 403, destination);
  if (form.get('action') === 'logout') return response('', 303, { Location: '/admin/login', 'Set-Cookie': sessionCookie(request, '', 0) });
  if(view==='employees') {
   if(!employee)return login(request,secret,'Vui lòng đăng nhập trước khi chỉnh sửa danh sách.',401,'/admin/employees');
   try {employeeResult=await employeeAction(form,roster,employee);}
   catch(error){employeeResult={error:error instanceof RosterError?error.message:'Không lưu được danh sách. Chưa xác nhận lưu thành công; hãy tải lại và kiểm tra.',status:error.status||503};}
   if(employeeResult.saved)return response('',303,{Location:'/admin/employees?saved=1'});
  } else {
  const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'local';
  const key = digest(ip, secret);
  const now = Date.now();
  for (const [k,v] of attempts) if (v.until < now) attempts.delete(k);
  const state = attempts.get(key) || { count: 0, until: now + 15*60*1000 };
  if (state.count >= 5 || attempts.size >= 10000) return login(request, secret, 'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.', 429, destination);
  state.count++; attempts.set(key, state);
  const value = form.get('password') || '';
  const loginEmployee = /^\d{6}$/.test(value) ? findEmployee(value,roster.employees) : null;
  if (!loginEmployee) return login(request, secret, 'ID nhân viên không hợp lệ.', 401, destination);
  attempts.delete(key);
  const version = digest(employeeSessionVersion, secret).slice(0,16);
  const remember = form.get('remember') === '1';
  const lifetime = remember ? REMEMBER_TTL : TTL;
  const session = signed(`${Date.now()+lifetime*1000}:${randomBytes(24).toString('hex')}:${version}:${loginEmployee.id}${remember ? ':remember' : ''}`, secret);
  return response('', 303, { Location: destination, 'Set-Cookie': sessionCookie(request, session, lifetime) });
  }
 }
 if (!employee) return login(request, secret);
 if (view === 'login') return response('',303,{Location:'/admin'});
 if(view==='employees'&&new URL(request.url).searchParams.get('download')==='xlsx')return response(await writeEmployeeWorkbook(roster.employees),200,{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':'attachment; filename="nhan-vien-pbb.xlsx"'});
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
  const quiz = view === 'quiz' ? quizPage() : null;
  const content = quiz ? quiz.content : view === 'employees' ? employeePage({list:roster.employees,version:roster.version,csrf,writable:canWriteRoster(),message:new URL(request.url).searchParams.get('saved')==='1'?'Đã lưu danh sách nhân viên. ID mới có thể đăng nhập ngay.':'',...employeeResult}) : view === 'explore' ? '<div id="root"></div>' : adminDashboard();
  const html = adminLayout({active:view,csrf,content,employee});
  const headerScript = `<script>(${installHeaderScroll.toString()})(document.querySelector('.admin-header'));(${installAdminMenu.toString()})();(${installAdminMotion.toString()})();</script>`;
  const javascript = headerScript + (quiz ? '<script>' + quiz.script + '</script>' : view === 'explore' ? `<script>${script.replaceAll('</script', '<\\/script')}</script>` : '');
  return response(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${view==='employees'?'Danh sách nhân viên':view==='quiz'?'Quiz vận hành PBB':view==='explore'?'Khám phá PBB':'Tổng quan quản trị'} · PBB Lab Admin</title><style>${css}${adminMenuStyles}${adminMotionStyles}${employeeStyles}${employeeEditStyles}${quiz?.css || ''}</style></head><body>${html}${javascript}</body></html>`,employeeResult?.status||200);
 } catch (error) { console.error('Explore private payload unavailable:', error.code || error.message); return response(page('<h1>Nội dung chưa sẵn sàng</h1><p>Vui lòng liên hệ người quản lý.</p>'),503); }
}
