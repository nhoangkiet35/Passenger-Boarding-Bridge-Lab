import assert from 'node:assert/strict';
import { randomBytes, createHmac } from 'node:crypto';
import { handleAdmin } from '../server/admin-handler.mjs';
import { handleExplore } from '../server/explore-handler.mjs';
import { employees, employeeSessionVersion } from '../server/employees.mjs';
const password='020514';
process.env.EXPLORE_SESSION_SECRET=randomBytes(32).toString('hex');
const url='https://pbb.test/admin/explore';
const get=(cookie='')=>handleAdmin(new Request(url,{headers:{cookie}}));
const csrf=html=>html.match(/name="csrf" value="([^"]+)"/)[1];
const post=(form,ip='test')=>handleAdmin(new Request('https://pbb.test/api/admin',{method:'POST',headers:{origin:'https://pbb.test','content-type':'application/x-www-form-urlencoded','x-vercel-forwarded-for':ip},body:new URLSearchParams({returnTo:'/admin/explore',...form})}));
let r=await get();const loginHtml=await r.text();assert.equal(r.status,200);assert(!loginHtml.includes('Nguyên lý hoạt động'));assert.match(r.headers.get('cache-control'),/no-store/);
const token=csrf(loginHtml);
r=await post({password:'incorrect',csrf:token});assert.equal(r.status,401);assert(!r.headers.has('set-cookie'));
r=await post({password,csrf:'forged'});assert.equal(r.status,403);
r=await handleAdmin(new Request('https://pbb.test/api/admin',{method:'POST',headers:{origin:'https://attacker.test','content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password,csrf:token})}));assert.equal(r.status,403);
r=await get('pbb_explore_session=forged');assert(!(await r.text()).includes('Nguyên lý hoạt động'));
r=await post({password,csrf:token},'valid-user');assert.equal(r.status,303);const c=r.headers.get('set-cookie');assert.match(c,/HttpOnly/);assert.match(c,/Secure/);assert.match(c,/SameSite=Strict/);assert.equal(r.headers.get('location'),'/admin/explore');
const session=c.split(';')[0];r=await get(session);assert.equal(r.status,200);const content=await r.text();assert(content.includes('Nguyên lý hoạt động'));assert(content.includes('MCB & TMan'));assert(content.includes('Đăng xuất'));
assert(loginHtml.includes('type="checkbox" name="remember" value="1"'));
assert.match(c,/Max-Age=7200/);
assert(content.includes('id="admin-menu"'));
assert(content.includes('aria-haspopup="dialog"'));
const rememberedLogin=await post({password,csrf:token,remember:'1'},'remember-user');
assert.equal(rememberedLogin.status,303);
const rememberedCookie=rememberedLogin.headers.get('set-cookie');
assert.match(rememberedCookie,/Max-Age=604800/);assert.match(rememberedCookie,/HttpOnly/);assert.match(rememberedCookie,/Secure/);assert.match(rememberedCookie,/SameSite=Strict/);
const rememberedSession=rememberedCookie.split(';')[0];
const realNow=Date.now;
try {
 const initial=realNow();
 Date.now=()=>initial+3*60*60*1000;
 assert((await (await get(session)).text()).includes('name="password"'),'Ordinary session must expire after 2 hours');
 assert((await (await get(rememberedSession)).text()).includes('Nguyên lý hoạt động'),'Remembered session must survive beyond 2 hours');
 Date.now=()=>initial+8*24*60*60*1000;
 assert((await (await get(rememberedSession)).text()).includes('name="password"'),'Remembered session must expire after 7 days');
} finally {Date.now=realNow;}
const rememberedPage=await get(rememberedSession);
const rememberedLogout=await post({action:'logout',csrf:csrf(await rememberedPage.text())});
assert.match(rememberedLogout.headers.get('set-cookie'),/Max-Age=0/);
console.log('PASS: optional 7-day remembered session, 2-hour ordinary session, expiry and logout cookie clearing.');
for (const path of ['/admin/quiz','/admin/quiz/','/api/admin?view=quiz']) {
 const endpoint='https://pbb.test'+path;
 const locked=await handleAdmin(new Request(endpoint));const lockedHtml=await locked.text();
 assert.equal(locked.status,200);assert(lockedHtml.includes('name="password"'));
 assert(lockedHtml.includes('value="/admin/quiz"'));assert(!lockedHtml.includes('isCorrect'));
 const quiz=await handleAdmin(new Request(endpoint,{headers:{cookie:session}}));const quizHtml=await quiz.text();
 assert.equal(quiz.status,200);assert.match(quiz.headers.get('cache-control'),/no-store/);
 assert(quizHtml.includes('id="pbb-quiz"'));assert(quizHtml.includes('Câu 100:'));
 assert(quizHtml.includes('data:image/jpeg;base64,'));assert(!quizHtml.includes('cdn.tailwindcss.com'));
 assert(quizHtml.includes('href="/admin/quiz" aria-current="page"'));
 assert(!quizHtml.includes('href="/admin/explore" aria-current="page"'));
}
r=await post({password,csrf:token,returnTo:'/admin/quiz'},'quiz-user');assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/admin/quiz');
const originalDirectory=process.cwd();process.chdir('..');r=await get(session);assert.equal(r.status,200);assert((await r.text()).includes('Nguyên lý hoạt động'));process.chdir(originalDirectory);
r=await handleAdmin(new Request('https://pbb.test/admin',{headers:{cookie:session}}));assert.equal(r.status,200);const dashboard=await r.text();assert(dashboard.includes('Tổng quan quản trị'));assert(dashboard.includes('href="/admin/explore"'));assert(!dashboard.includes('Nguyên lý hoạt động'));
for (const path of ['/admin','/admin/login','/api/admin?view=home','/api/admin?view=explore']) {r=await handleAdmin(new Request('https://pbb.test'+path));assert.equal(r.status,200);assert((await r.text()).includes('name="password"'));}
r=await handleAdmin(new Request('https://pbb.test/admin/unknown',{headers:{cookie:session}}));assert.equal(r.status,404);
r=await handleExplore(new Request('https://pbb.test/explore'));assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/admin/explore');
r=await post({password,csrf:token,returnTo:'https://attacker.test'},'redirect-user');assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/admin');
const logoutToken=csrf(content);r=await post({action:'logout',csrf:logoutToken});assert.equal(r.status,303);assert.match(r.headers.get('set-cookie'),/Max-Age=0/);
const expired=Date.now()-10000;const body=expired+':nonce:'+createHmac('sha256',process.env.EXPLORE_SESSION_SECRET).update(employeeSessionVersion).digest('base64url').slice(0,16);const signature=createHmac('sha256',process.env.EXPLORE_SESSION_SECRET).update(body).digest('base64url');r=await get('pbb_explore_session='+body+'.'+signature);assert(!(await r.text()).includes('Nguyên lý hoạt động'));
for(let i=0;i<5;i++) {r=await post({password:'wrong',csrf:token},'limited-user');assert.equal(r.status,401);}
r=await post({password,csrf:token},'limited-user');assert.equal(r.status,429);
const secret=process.env.EXPLORE_SESSION_SECRET;delete process.env.EXPLORE_SESSION_SECRET;r=await get(session);assert.equal(r.status,503);assert(!(await r.text()).includes('Nguyên lý hoạt động'));process.env.EXPLORE_SESSION_SECRET=secret;

assert.equal(employees.length,15);assert.equal(new Set(employees.map(e=>e.id)).size,15);
for(const employee of employees) {
 const loggedIn=await post({password:employee.id,csrf:token},'employee-'+employee.id);
 assert.equal(loggedIn.status,303);
 const employeeCookie=loggedIn.headers.get('set-cookie').split(';')[0];
 const home=await handleAdmin(new Request('https://pbb.test/admin',{headers:{cookie:employeeCookie}}));
 const html=await home.text();assert(html.includes(employee.name));assert(html.includes('ID '+employee.id));
 const directory=await handleAdmin(new Request('https://pbb.test/admin/employees',{headers:{cookie:employeeCookie}}));
 assert.equal(directory.status,200);const list=await directory.text();for(const e of employees){assert(list.includes(e.id));assert(list.includes(e.name));}
 assert(list.includes('href="/admin/employees" aria-current="page"'));
 if(employee.id==='020514') {
  const tampered=employeeCookie.replace('020514','020513');
  const invalid=await handleAdmin(new Request('https://pbb.test/admin',{headers:{cookie:tampered}}));
  assert((await invalid.text()).includes('name="password"'));
 }
}
for(const bad of ['20514','020516','020514 ',' 020514','0205140','abcdef','']) {
 const invalid=await post({password:bad,csrf:token},'invalid-'+bad);
 assert.equal(invalid.status,401);assert(!invalid.headers.has('set-cookie'));
}
for(const path of ['/admin/employees','/api/admin?view=employees']) {
 const unauth=await handleAdmin(new Request('https://pbb.test'+path));const html=await unauth.text();
 assert(html.includes('value="/admin/employees"'));assert(!html.includes('Lê Sỹ Vương'));assert(!html.includes('020513'));
}
const oldPayload=Date.now()+3600000+':oldnonce:'+createHmac('sha256',process.env.EXPLORE_SESSION_SECRET).update(employeeSessionVersion).digest('base64url').slice(0,16);
const oldCookie='pbb_explore_session='+oldPayload+'.'+createHmac('sha256',process.env.EXPLORE_SESSION_SECRET).update(oldPayload).digest('base64url');
assert((await (await get(oldCookie)).text()).includes('name="password"'));
console.log('PASS: all 15 employee IDs, names, private directory, leading zero, invalid IDs, signed identity and legacy session rejection.');

console.log('PASS: admin dashboard, protected module, canonical/legacy routes, safe redirect, unauthorized, incorrect password, CSRF/origin, forged/expired cookie, valid login, logout, throttling and fail-closed configuration.');
