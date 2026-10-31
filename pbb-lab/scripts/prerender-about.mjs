import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import {createElement,Suspense} from 'react';
import {renderToString} from 'react-dom/server';
import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
// Emit readable About HTML for the standalone Vercel build, including no-JS fallback.
const server=await createServer({configFile:false,plugins:[react()],resolve:{alias:{'@':process.cwd()},dedupe:['react','react-dom']},server:{middlewareMode:true},appType:'custom',logLevel:'error'});
try{
 const {default:About}=await server.ssrLoadModule('/components/pbb/About.tsx');
 const markup=renderToString(createElement(Suspense,{fallback:null},createElement(About)));
 let html=await readFile('dist-vercel/index.html','utf8');
 if(!html.includes('<div id="root"></div>'))throw new Error('Missing root for About HTML.');
 const files=await readdir('dist-vercel/assets');
 const styles=files.filter(f=>/^(About|SiteShell)-.*\.css$/.test(f)).map(f=>`<link rel="stylesheet" href="/assets/${f}">`).join('');
 html=html.replace('<div id="root"></div>',`<div id="root">${markup}</div>`).replace(/<title>.*?<\/title>/,'<title>Về PBB Lab | Long Thành &amp; công nghệ cầu hành khách</title>').replace(/(<meta name="description" content=")[^"]*(")/,'$1Khám phá Long Thành, cấu tạo cầu hành khách ShinMaywa PAXWAY và nền tảng học tập, mô phỏng PBB Lab.$2').replace('</head>',`${styles}<noscript><style>.site-shell--about .site-navigation{display:flex;flex-wrap:wrap}.site-shell--about .site-menu-toggle{display:none}.site-shell--about .site-header-inner{height:auto;flex-wrap:wrap}.site-shell--about .site-navigation{position:static}</style></noscript></head>`);
 await mkdir('dist-vercel/about',{recursive:true});
 await writeFile('dist-vercel/about/index.html',html);
 console.log('PASS: About static HTML rendered.');
}finally{await server.close();}
