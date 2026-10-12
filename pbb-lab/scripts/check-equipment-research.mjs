import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// Read source data independently of the browser build; cross-check every citation.
function sourceExports(path) {
 const output = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
 const exports = {};
 vm.runInNewContext(output, { exports, require: specifier => {
  if (!specifier.startsWith('.')) return require(specifier);
  const base = resolve(dirname(path), specifier);
  const target = [base + '.ts', base + '.tsx'].find(existsSync);
  assert(target, 'Missing research import: ' + specifier);
  return sourceExports(target);
 } });
 return exports;
}
const { equipmentResearch, researchSources } = sourceExports('private/explore/researchData.ts');
const { equipment } = sourceExports('lib/exploreData.ts');
assert.deepEqual(Object.keys(equipmentResearch).sort(), Array.from(equipment, item => item.id).sort());
const sourceIds = new Set(researchSources.map(source => source.id));
assert.equal(sourceIds.size, researchSources.length, 'Source identifiers must be unique');
for (const [id, item] of Object.entries(equipmentResearch)) {
 assert(item.model && item.introduction, id + ': missing scope');
 for (const record of [...item.topics, ...item.technical, ...item.scenarios]) {
  assert(sourceIds.has(record.sourceId), id + ': unresolved citation ' + record.sourceId);
  assert(record.pages, id + ': missing page reference');
 }
 assert(item.discrepancies.length && item.gaps.length, id + ': unresolved scope must be explicit');
}
for (const source of researchSources) {
 if (source.url) assert(/^https:\/\/(www\.shinmaywa\.co\.jp|www\.honeywell\.com)\//.test(source.url), 'External reference must use a reviewed official source');
}
const { default: EquipmentResearch, ResearchSources } = sourceExports('private/explore/EquipmentResearch.tsx');
const catalog = renderToStaticMarkup(React.createElement(ResearchSources));
for (const item of equipment) {
 const html = renderToStaticMarkup(React.createElement(EquipmentResearch, { equipmentId: item.id, name: item.name }));
 assert(html.includes('research-' + item.id), 'Missing rendered equipment dossier');
 for (const [, sourceId] of html.matchAll(/href="#source-([^"]+)"/g)) assert(catalog.includes('id="source-' + sourceId + '"'), 'Rendered citation does not have a catalog target');
 assert(html.includes('Đọc thông số theo đúng cấu hình') && html.includes('Tình huống để phân tích'), 'Missing research sections');
}
console.log('PASS: five rendered equipment dossiers, source identifiers, page citations and official reference domains.');
