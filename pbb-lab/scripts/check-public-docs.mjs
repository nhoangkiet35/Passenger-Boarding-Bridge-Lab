import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

// Runs only in Node during build; never import this into application code.
const root = resolve(import.meta.dirname, '..');
const target = resolve(root, process.argv[2] || 'dist-vercel');
if (!target.startsWith(root + '\\') && !target.startsWith(root + '/')) throw new Error('Target must be inside app.');
if (!existsSync(target)) throw new Error('Missing output directory.');
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Unexpected symlink in public output.');
    return entry.isDirectory() ? files(path) : [path];
  });
}
const docs = join(root, 'docs');
const names = existsSync(docs) ? files(docs).map(path => path.split(/[\\/]/).pop()).filter(name => name !== 'README.md') : [];
const forbidden = /(?:(?<![A-Za-z0-9.])\/docs\/|\/references\/|van-hanh-cau-hanh-khach|LONG-THANH-VERIFICATION|LTIA[- _]|Nguyễn Hữu|PAXWAY2024_EN|PBB\.pdf|PCA\.pdf|PWS\.pdf|VN_Skywinder Power|Specification List|theo hồ sơ)/i;
const violations = [];
for (const path of files(target)) {
  const name = relative(target, path).replaceAll('\\', '/');
  if (/(?:^|\/)(?:docs|references)(?:\/|$)|\.(?:pdf|docx?|xlsx?|pptx?|md|zip|map)$/i.test(name)) violations.push(name);
  const text = readFileSync(path).toString('utf8');
  if (forbidden.test(text) || names.some(value => text.includes(value) || text.includes(encodeURIComponent(value)))) violations.push(name);
}
if (violations.length) throw new Error(`Internal document exposure detected in: ${[...new Set(violations)].join(', ')}`);
console.log('PASS: no internal documents, filenames or source citations in public output.');
