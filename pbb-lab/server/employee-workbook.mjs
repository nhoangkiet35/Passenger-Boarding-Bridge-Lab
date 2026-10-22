import ExcelJS from 'exceljs';

export class RosterError extends Error {
 constructor(message, status=400) { super(message); this.status=status; }
}
export const MAX_WORKBOOK_BYTES=1024*1024;
export function validateEmployees(rows) {
 if (!Array.isArray(rows)||rows.length<1||rows.length>1000) throw new RosterError('Danh sách cần có từ 1 đến 1.000 nhân viên.');
 const seen=new Set();
 return rows.map((row,i)=>{
  const id=typeof row.id==='string'?row.id:'';
  const name=typeof row.name==='string'?row.name.trim().normalize('NFC'):'';
  if(!/^\d{6}$/.test(id))throw new RosterError(`Dòng ${i+2}: ID phải gồm đúng 6 chữ số, giữ nguyên số 0 đầu.`);
  if(!name||name.length>120||/[\u0000-\u001f\u007f]/.test(name))throw new RosterError(`Dòng ${i+2}: Name cần có từ 1 đến 120 ký tự hợp lệ.`);
  if(seen.has(id))throw new RosterError(`ID ${id} bị trùng. Mỗi ID chỉ được xuất hiện một lần.`);
  seen.add(id);return {id,name};
 }).sort((a,b)=>a.id.localeCompare(b.id));
}
function checkZip(buffer) {
 if(buffer.length>MAX_WORKBOOK_BYTES)throw new RosterError('File Excel vượt quá 1 MB.',413);
 let end=-1;
 for(let i=buffer.length-22;i>=Math.max(0,buffer.length-65557);i--)if(buffer.readUInt32LE(i)===0x06054b50){end=i;break;}
 if(end<0)throw new RosterError('File không phải định dạng Excel .xlsx hợp lệ.');
 const entries=buffer.readUInt16LE(end+10);let cursor=buffer.readUInt32LE(end+16),total=0;
 if(entries>200)throw new RosterError('File Excel có quá nhiều thành phần.');
 for(let i=0;i<entries;i++) {
  if(cursor+46>buffer.length||buffer.readUInt32LE(cursor)!==0x02014b50)throw new RosterError('Cấu trúc file Excel không hợp lệ.');
  if(buffer.readUInt16LE(cursor+8)&1)throw new RosterError('Không hỗ trợ file Excel được mã hóa.');
  total+=buffer.readUInt32LE(cursor+24);
  if(total>8*1024*1024)throw new RosterError('Nội dung file Excel quá lớn sau giải nén.');
  const len=buffer.readUInt16LE(cursor+28);
  const name=buffer.subarray(cursor+46,cursor+46+len).toString();
  if(/vbaProject|externalLinks/i.test(name))throw new RosterError('Vui lòng dùng file .xlsx không có macro hoặc liên kết ngoài.');
  cursor+=46+len+buffer.readUInt16LE(cursor+30)+buffer.readUInt16LE(cursor+32);
 }
}
export async function readEmployeeWorkbook(input) {
 const buffer=Buffer.from(input);checkZip(buffer);
 const workbook=new ExcelJS.Workbook();
 try { await workbook.xlsx.load(buffer); } catch { throw new RosterError('Không đọc được file Excel. Hãy lưu lại dưới dạng .xlsx rồi thử lại.'); }
 const sheet=workbook.getWorksheet('Nhan vien')||workbook.worksheets[0];
 if(!sheet||sheet.rowCount>1001)throw new RosterError('File cần có một bảng tối đa 1.000 nhân viên.');
 if(String(sheet.getCell('A1').value).trim().toLowerCase()!=='id'||String(sheet.getCell('B1').value).trim().toLowerCase()!=='name')throw new RosterError('Dòng đầu tiên phải là ID ở cột A và Name ở cột B.');
 const rows=[];
 for(let i=2;i<=sheet.rowCount;i++) {
  const id=sheet.getCell(i,1),name=sheet.getCell(i,2);
  if(id.value==null&&name.value==null)continue;
  if(typeof id.value==='object'||typeof name.value==='object')throw new RosterError(`Dòng ${i}: chỉ nhập văn bản, không dùng công thức hoặc liên kết.`);
  let code=id.value;
  if(typeof code==='number'&&Number.isInteger(code)&&code>=0&&code<1000000&&id.numFmt==='000000')code=String(code).padStart(6,'0');
  rows.push({id:code,name:name.value});
 }
 return validateEmployees(rows);
}
export async function writeEmployeeWorkbook(rows) {
 const list=validateEmployees(rows),workbook=new ExcelJS.Workbook();
 workbook.creator='PBB Lab';
 const sheet=workbook.addWorksheet('Nhan vien',{views:[{state:'frozen',ySplit:1,showGridLines:false}]});
 sheet.columns=[{header:'ID',key:'id',width:16,style:{numFmt:'@'}},{header:'Name',key:'name',width:38}];
 sheet.addRows(list);
 sheet.addTable({name:'NhanVienPBB',ref:'A1',headerRow:true,style:{theme:'TableStyleMedium2',showRowStripes:true},columns:[{name:'ID'},{name:'Name'}],rows:list.map(e=>[e.id,e.name])});
 sheet.eachRow((row,i)=>{row.height=i===1?32:27;row.eachCell(cell=>{cell.font={name:'Arial',size:11,color:{argb:i===1?'FFFFFFFF':'FF183649'},bold:i===1};cell.alignment={vertical:'middle',horizontal:'left'};});});
 return Buffer.from(await workbook.xlsx.writeBuffer());
}
