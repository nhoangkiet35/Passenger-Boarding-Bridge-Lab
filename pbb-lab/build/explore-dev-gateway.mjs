import { build } from 'vite';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { handleExplore } from '../server/explore-handler.mjs';
import { handleAdmin } from '../server/admin-handler.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const sensitive = ['/.private-explore/', '/private/', '/server/', '/lib/exploreData.', '/lib/exploreVideos.', '/lib/serviceCycles.', '/lib/equipmentProcedures.', '/components/pbb/Explore.', '/components/pbb/ExploreVideos.', '/components/pbb/EquipmentProcedures.', '/components/pbb/VdgsCoordination.'];
function latestSourceChange(directory) {
 if (!existsSync(directory)) return 0;
 if (!statSync(directory).isDirectory()) return statSync(directory).mtimeMs;
 return Math.max(0,...readdirSync(directory,{withFileTypes:true}).map(entry => {
  if(entry.isSymbolicLink()) return 0;
  const path=join(directory,entry.name);
  return entry.isDirectory() || /\.(tsx?|css|mjs)$/.test(entry.name) ? latestSourceChange(path) : 0;
 }));
}
export function exploreDevGateway() {
 return { name: 'explore-development-auth', enforce: 'pre',
  async configureServer(server) {
   if (existsSync(join(root,'.env.local'))) process.loadEnvFile(join(root,'.env.local'));
   const outputs=[join(root,'.private-explore/explore.js'),join(root,'.private-explore/style.css')];
   const newestSource=Math.max(...['components/pbb','lib','private','app/globals.css','vite.explore.config.ts'].map(path=>latestSourceChange(join(root,path))));
   if(outputs.some(path=>!existsSync(path)||statSync(path).mtimeMs<newestSource)) {
    server.config.logger.info('Preparing protected Explore content…');
    await build({ root, configFile: join(root,'vite.explore.config.ts'), logLevel: 'error' });
   }
   server.middlewares.use(async (req,res,next) => {
    try {
     const protocol = req.socket.encrypted ? 'https' : 'http';
     const url = new URL(req.url || '/', protocol + '://' + (req.headers.host || 'localhost'));
     const path = decodeURIComponent(url.pathname).replaceAll('\\','/');
     if (sensitive.some(fragment => path.toLowerCase().includes(fragment.toLowerCase()))) {res.writeHead(404);res.end();return;}
     if (!(path === '/admin' || path.startsWith('/admin/') || path === '/api/admin' || path === '/api/admin/' || ['/explore','/explore/','/api/explore','/api/explore/'].includes(path))) { next(); return; }
     let body = Buffer.alloc(0);
     for await (const chunk of req) {
      body = Buffer.concat([body,chunk]);
      if(body.length>4096){res.writeHead(413);res.end();return;}
     }
     const handler = path === '/explore' || path === '/explore/' || path.startsWith('/api/explore') ? handleExplore : handleAdmin;
     const result = await handler(new Request(url, {
      method: req.method, headers: req.headers,
      ...(['GET','HEAD'].includes(req.method || 'GET') ? {} : {body}),
     }));
     res.writeHead(result.status, Object.fromEntries(result.headers));
     res.end(Buffer.from(await result.arrayBuffer()));
    } catch (error) {console.error('Explore development gateway failed:', error.name);res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end('Không thể xử lý yêu cầu đăng nhập.');}
   });
  },
 };
}
