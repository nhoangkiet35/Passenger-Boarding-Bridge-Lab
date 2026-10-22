import { readEmployeeWorkbook,validateEmployees,RosterError,MAX_WORKBOOK_BYTES } from './employee-workbook.mjs';
import { saveRoster } from './employee-store.mjs';
export async function employeeAction(form,roster,employee) {
 const action=form.get('action');
 if(form.get('version')!==roster.version)throw new RosterError('Danh sách đã thay đổi. Hãy tải lại trang trước khi cập nhật.',409);
 if(action==='employee-add') {
  const id=form.get('id'),name=form.get('name');
  if(roster.employees.some(e=>e.id===id))throw new RosterError('ID đã tồn tại trong danh sách. Hãy nhập ID khác.');
  await saveRoster([...roster.employees,{id,name}],roster.version);
  return {saved:true};
 }
 let rows;
 if(action==='employee-import-preview') {
  const file=form.get('file');
  if(!file||typeof file.arrayBuffer!=='function'||!file.name.toLowerCase().endsWith('.xlsx'))throw new RosterError('Vui lòng chọn file Excel .xlsx.');
  if(file.size>MAX_WORKBOOK_BYTES)throw new RosterError('File Excel vượt quá 1 MB.',413);
  rows=await readEmployeeWorkbook(await file.arrayBuffer());
 } else if(action==='employee-import-save') {
  try {rows=validateEmployees(JSON.parse(form.get('rows')));}catch(error){if(error instanceof RosterError)throw error;throw new RosterError('Dữ liệu nhập không hợp lệ. Vui lòng nhập lại file Excel.');}
 } else throw new RosterError('Thao tác danh sách nhân viên không hợp lệ.');
 if(!rows.some(e=>e.id===employee.id))throw new RosterError('File Excel cần giữ lại ID đang đăng nhập để bạn tiếp tục quản lý danh sách.');
 if(action==='employee-import-preview')return {preview:rows};
 await saveRoster(rows,roster.version);
 return {saved:true};
}
