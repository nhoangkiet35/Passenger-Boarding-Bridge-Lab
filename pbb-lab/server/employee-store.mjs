import { readFile,writeFile,rename,open,unlink } from 'node:fs/promises';
import { createHash,randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { RosterError,readEmployeeWorkbook,writeEmployeeWorkbook,validateEmployees } from './employee-workbook.mjs';
export const seedWorkbookPath=fileURLToPath(new URL('./data/nhan-vien-pbb.xlsx',import.meta.url));
const blobPath='pbb/nhan-vien-pbb.xlsx';
const version=rows=>createHash('sha256').update(JSON.stringify(rows)).digest('hex');
const remote=()=>!process.env.EMPLOYEE_WORKBOOK_PATH&&!!(process.env.BLOB_STORE_ID||process.env.BLOB_READ_WRITE_TOKEN);
const localPath=()=>process.env.EMPLOYEE_WORKBOOK_PATH?resolve(process.env.EMPLOYEE_WORKBOOK_PATH):seedWorkbookPath;
export const canWriteRoster=()=>remote()||!process.env.VERCEL;
export async function readRoster() {
 let bytes,etag=null;
 if(remote()) {
  const {get}=await import('@vercel/blob');
  const result=await get(blobPath,{access:'private',useCache:false});
  if(result?.statusCode===200){bytes=Buffer.from(await new Response(result.stream).arrayBuffer());etag=result.blob.etag;}
 }
 if(!bytes)bytes=await readFile(remote()?seedWorkbookPath:localPath());
 const employees=await readEmployeeWorkbook(bytes);
 return {employees,version:version(employees),etag};
}
export async function saveRoster(rows,expectedVersion) {
 if(!canWriteRoster())throw new RosterError('Chưa kết nối kho lưu trữ riêng tư trên Vercel. Chưa có thay đổi nào được lưu.',503);
 const next=validateEmployees(rows);
 let lock;
 const path=localPath(),lockPath=path+'.lock',temporary=path+'.'+randomBytes(8).toString('hex')+'.tmp';
 try {
  if(!remote()) {
   try {lock=await open(lockPath,'wx');}catch(error){if(error.code==='EEXIST')throw new RosterError('Có người đang lưu danh sách. Vui lòng tải lại rồi thử lại.',409);throw error;}
  }
  const current=await readRoster();
  if(current.version!==expectedVersion)throw new RosterError('Danh sách đã thay đổi từ lúc mở trang. Hãy tải lại và kiểm tra trước khi lưu.',409);
  const buffer=await writeEmployeeWorkbook(next);
  if(remote()) {
   const {put}=await import('@vercel/blob');
   try {await put(blobPath,buffer,{access:'private',addRandomSuffix:false,contentType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',...(current.etag?{allowOverwrite:true,ifMatch:current.etag}:{allowOverwrite:false})});}
   catch(error){if(['BlobPreconditionFailedError','BlobAlreadyExistsError'].includes(error.name))throw new RosterError('Danh sách vừa được cập nhật bởi người khác. Hãy tải lại rồi thử lại.',409);throw error;}
  } else {await writeFile(temporary,buffer,{flag:'wx'});await rename(temporary,path);}
  return next;
 } finally {
  if(lock){await lock.close();await unlink(lockPath).catch(()=>{});}
  await unlink(temporary).catch(()=>{});
 }
}
