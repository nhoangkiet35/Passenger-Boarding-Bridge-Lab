import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { employees } from '../../pbb-lab/server/employees.mjs';
const require = createRequire('C:/Users/hkngu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/loader.cjs');
const { Workbook, SpreadsheetFile } = await import(pathToFileURL(require.resolve('@oai/artifact-tool')).href);
const workbook = Workbook.create();
const sheet = workbook.worksheets.add('Nhan vien');
sheet.showGridLines = false;
sheet.tabColor = '#137E8B';
sheet.getRange('A1:A1000').setNumberFormat('@');
sheet.getRange('A1:B16').values = [['ID','Name'], ...employees.map(e=>["'"+e.id,e.name])];
sheet.getRange('A1:B16').format.font = { name:'Arial', size:11, color:'#183649' };
sheet.getRange('A1:B16').format.rowHeight = 27;
sheet.getRange('A1:B16').format.verticalAlignment = 'center';
sheet.getRange('A1:A1000').setNumberFormat('@');
sheet.getRange('A1:A1000').format.columnWidth = 16;
sheet.getRange('B1:B1000').format.columnWidth = 38;
sheet.getRange('A1:B1').format.fill = '#102E3E';
sheet.getRange('A1:B1').format.font = { name:'Arial', size:11, bold:true, color:'#FFFFFF' };
sheet.getRange('A1:B1').format.rowHeight = 32;
for(let row=2;row<=16;row++) if(row%2===0) sheet.getRange(`A${row}:B${row}`).format.fill='#EDF7F7';
sheet.tables.add('A1:B16',true,'NhanVienPBB');
sheet.freezePanes.freezeRows(1);
workbook.recalculate();
console.log((await workbook.inspect({kind:'table',range:'Nhan vien!A1:B16',include:'values',tableMaxRows:17,tableMaxCols:2,maxChars:2500})).ndjson);
await fs.mkdir(new URL('../../pbb-lab/server/data/',import.meta.url),{recursive:true});
const file=await SpreadsheetFile.exportXlsx(workbook);
await file.save(fileURLToPath(new URL('../../pbb-lab/server/data/nhan-vien-pbb.xlsx',import.meta.url)));
// Normalize namespace spelling for readers that require the default OpenXML namespace.
execFileSync('C:/Users/hkngu/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',['-c',`import zipfile,io,re,sys,posixpath
p=sys.argv[1]
source=zipfile.ZipFile(p)
out=io.BytesIO()
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as dest:
 for name in source.namelist():
  content=source.read(name)
  if name.endswith('.xml'):
   content=content.replace(b'xmlns:x=',b'xmlns=').replace(b'<x:',b'<').replace(b'</x:',b'</')
   content=re.sub(rb"(<v>)'(0[0-9]{5})(</v>)",lambda m:m[1]+m[2]+m[3],content)
  if name.endswith('.rels'):
   owner=posixpath.dirname(posixpath.dirname(name))
   content=re.sub(rb'Target="/([^\"]+)"',lambda m:b'Target="'+posixpath.relpath(m[1].decode(),owner or '.').encode()+b'"',content)
  dest.writestr(name,content)
source.close()
open(p,'wb').write(out.getvalue())`,fileURLToPath(new URL('../../pbb-lab/server/data/nhan-vien-pbb.xlsx',import.meta.url))]);
const preview=await workbook.render({sheetName:'Nhan vien',range:'A1:B16',scale:1.5,format:'png'});
await fs.writeFile(new URL('../../output/nhan-vien-excel-preview.png',import.meta.url),new Uint8Array(await preview.arrayBuffer()));

