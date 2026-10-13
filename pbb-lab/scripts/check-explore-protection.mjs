import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
function files(dir) { return readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(join(dir,x.name)):[join(dir,x.name)]); }
const markers = ['Danh mục đầu ngày/đầu ca','Chênh cao sàn · cửa mở ngoài','MCB & TMan: phối hợp','Gợi ý quan sát:','Ngắt điện trước, tháo đầu nối sau','HỒ SƠ NGHIÊN CỨU / MANUAL & ĐỐI CHIẾU','572.610BB','Specification 20337','MCB v3 — User’s Guide'];
const privateScript = readFileSync('.private-explore/explore.js', 'utf8');
if (/\bprocess\.env\b/.test(privateScript)) throw new Error('Private Explore browser bundle contains a Node.js environment reference.');
if (/\bjsxDEV\b/.test(privateScript)) throw new Error('Private Explore production React bundle contains development JSX calls.');
for (const file of files('dist-vercel')) {
 const text=readFileSync(file,'utf8');
 if (/Explore-[\w-]+\.js/.test(file)||markers.some(x=>text.includes(x))) throw new Error('Private Explore content in public output: '+file);
}
console.log('PASS: Explore content is excluded from public static output.');
