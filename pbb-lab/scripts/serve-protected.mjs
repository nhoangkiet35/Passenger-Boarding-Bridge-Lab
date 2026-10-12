import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { handleExplore } from '../server/explore-handler.mjs';
import { handleAdmin } from '../server/admin-handler.mjs';
process.loadEnvFile('.env.local');
const root = resolve('dist-vercel');
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
createServer(async(req,res)=>{
 try {
  const url = new URL(req.url,'http://127.0.0.1:5174');
  if (url.pathname === '/admin' || url.pathname.startsWith('/admin/') || url.pathname === '/api/admin' || ['/explore','/explore/','/api/explore'].includes(url.pathname)) {
   const chunks=[];for await(const chunk of req){chunks.push(chunk);if(Buffer.concat(chunks).length>4096){res.writeHead(413);res.end();return;}}
   const handler = url.pathname === '/explore' || url.pathname === '/explore/' || url.pathname === '/api/explore' ? handleExplore : handleAdmin;
   const result=await handler(new Request(url,{method:req.method,headers:req.headers,body:req.method==='POST'?Buffer.concat(chunks):undefined}));
   res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));return;
  }
  const path = resolve(root,'.'+decodeURIComponent(url.pathname==='/'||url.pathname==='/about'||url.pathname==='/about/'?'/index.html':url.pathname));
  if (!path.startsWith(root+sep)) {res.writeHead(404);res.end();return;}
  const body=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(body);
 }catch{res.writeHead(404);res.end();}
}).listen(5174,'127.0.0.1',()=>console.log('Protected preview: http://127.0.0.1:5174/explore'));
