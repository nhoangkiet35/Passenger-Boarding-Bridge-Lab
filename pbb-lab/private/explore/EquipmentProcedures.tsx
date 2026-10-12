import { equipmentProcedures } from '@/lib/equipmentProcedures';
export default function EquipmentProcedures({ equipmentId, name }: { equipmentId: string; name: string }) {
 const data = equipmentProcedures[equipmentId];
 return <section className="equipment-procedures" aria-labelledby={'procedures-'+equipmentId}>
  <h3 id={'procedures-'+equipmentId}>Quy trình phục vụ & kiểm tra hằng ngày</h3>
  <div className="procedure-status"><strong>Bản tham khảo để đào tạo · Chưa phải SOP được phê duyệt</strong><p>Nhân viên phải tuân thủ nghiêm ngặt quy trình còn hiệu lực của đơn vị khai thác, hướng dẫn đúng model và yêu cầu tàu bay. Chỉ người được đào tạo, cấp quyền và phân công mới thực hiện thao tác trong phạm vi trách nhiệm.</p></div>
  <p className="procedure-daily-scope">{data.dailyScope}</p>
  <div className="procedure-sections">{data.procedures.map((procedure,index)=><details key={procedure.title} open={index===0}><summary><span>{String(index+1).padStart(2,'0')}</span>{procedure.title}</summary><ol>{procedure.steps.map(step=><li key={step.action}><p>{step.action}</p><div><strong>Điều kiện đạt:</strong> {step.acceptance}</div></li>)}</ol><aside className="procedure-stop"><strong>Điểm dừng / giới hạn áp dụng</strong><p>{procedure.stop}</p></aside><div className="procedure-record"><strong>Xác nhận & ghi nhận</strong><p>{procedure.completion}</p></div></details>)}</div>
  <p className="procedure-record-guide">Phiếu kiểm tra thực tế cần ghi: ngày/giờ, ca, mã thiết bị hoặc vị trí đỗ, người kiểm tra, từng hạng mục đạt/không đạt/không áp dụng, mã lỗi, biện pháp và người tiếp nhận. Kiểm tra đầu ngày/đầu ca không thay thế kiểm tra trước mỗi lượt phục vụ. Hạng mục không đạt phải báo cáo và xử lý trước khi xác nhận sẵn sàng.</p>
  <p className="explore-service-source"><a href="#explore-sources">[1] {name} · {data.source}</a></p>
 </section>;
}
