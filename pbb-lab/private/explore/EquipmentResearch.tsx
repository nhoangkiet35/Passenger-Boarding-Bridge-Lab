import { equipmentResearch, researchSources } from './researchData';

export function ResearchReference({ sourceId, pages }: { sourceId: string; pages: string }) {
 const source = researchSources.find(item => item.id === sourceId)!;
 return <a className="research-reference" href={'#source-' + sourceId}>{source.title} · {pages}</a>;
}

export default function EquipmentResearch({ equipmentId, name }: { equipmentId: string; name: string }) {
 const data = equipmentResearch[equipmentId];
 return <section className="equipment-research" aria-labelledby={'research-' + equipmentId}>
  <div className="research-heading"><p className="explore-kicker">HỒ SƠ NGHIÊN CỨU / MANUAL & ĐỐI CHIẾU</p><h3 id={'research-' + equipmentId}>Nghiên cứu chuyên sâu · {name}</h3><p className="research-model">{data.model}</p><p>{data.introduction}</p></div>
  <div className="research-topics">{data.topics.map(topic => <details key={topic.title} open><summary>{topic.title}</summary><div>{topic.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<ResearchReference sourceId={topic.sourceId} pages={topic.pages}/></div></details>)}</div>
  <h4>Đọc thông số theo đúng cấu hình</h4>
  <div className="explore-table-wrap" tabIndex={0} role="region" aria-label={'Thông số đối chiếu manual ' + name}><table><caption>{data.model} · thông số từ tài liệu được cung cấp, chưa xác nhận cấu hình tại từng gate</caption><thead><tr><th scope="col">Đại lượng</th><th scope="col">Dữ liệu nguồn</th><th scope="col">Điều kiện & cách đọc</th></tr></thead><tbody>{data.technical.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.value}</td><td>{row.reading}<ResearchReference sourceId={row.sourceId} pages={row.pages}/></td></tr>)}</tbody></table></div>
  <h4>Tình huống để phân tích</h4><p className="research-context">Các tình huống giúp nhận diện và báo cáo bất thường. Phần diễn giải không thay thế SOP, quyền thao tác hoặc hướng dẫn bảo trì đúng thiết bị.</p>
  <div className="research-scenarios">{data.scenarios.map(scenario => <details key={scenario.symptom}><summary>{scenario.symptom}</summary><div><dl><dt>Cách hiểu</dt><dd>{scenario.interpretation}</dd><dt>Phối hợp & ghi nhận</dt><dd>{scenario.response}</dd></dl><ResearchReference sourceId={scenario.sourceId} pages={scenario.pages}/></div></details>)}</div>
  <aside className="research-discrepancies"><h4>Điểm chưa thống nhất trong tài liệu</h4><ul>{data.discrepancies.map(item => <li key={item}>{item}</li>)}</ul></aside>
  <div className="research-checks"><section><h4>Dữ liệu nên ghi nhận khi phục vụ</h4><ul>{data.records.map(item => <li key={item}>{item}</li>)}</ul></section><section><h4>Hồ sơ cần bổ sung để xác nhận khai thác</h4><ul>{data.gaps.map(item => <li key={item}>{item}</li>)}</ul></section></div>
 </section>;
}

export function ResearchSources() {
 return <section className="research-library" aria-labelledby="research-library-title"><p className="explore-kicker">DANH MỤC TÀI LIỆU NỘI BỘ</p><h3 id="research-library-title">Nguồn đã đọc & phạm vi đối chiếu</h3><p>Nội dung dưới đây được biên soạn từ tài liệu chủ dự án cung cấp và nguồn chính thức. Tên file chỉ để đối chiếu tại chỗ; không có đường tải PDF công khai. Số trang PDF và số trang in được ghi riêng khi khác nhau.</p><p>Thứ tự đối chiếu khi có khác biệt: hồ sơ đúng model và cấu hình đã nghiệm thu, manual được ban hành, specification tương ứng, rồi báo cáo học tập. Hồ sơ đề xuất, brochure và mô phỏng chưa chứng minh một chức năng đã được lắp đặt.</p><div>{researchSources.map(source => <details id={'source-' + source.id} key={source.id}><summary>{source.title}</summary><dl><dt>Phiên bản / tài liệu</dt><dd>{source.edition}</dd><dt>Nhận diện nguồn</dt><dd>{source.location}</dd><dt>Phạm vi đã dùng</dt><dd>{source.scope}</dd></dl>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">Mở nguồn chính thức ↗</a> : <p className="research-source-private">Tài liệu do chủ dự án cung cấp · nội dung tham khảo trong khu vực admin.</p>}</details>)}</div><p className="research-context">Đối chiếu ngày 13/10/2026. Các manual/specification không tự thay thế SOP đang có hiệu lực của đơn vị. Những câu chưa rõ do dịch hoặc khác phiên bản được giữ trong mục cần xác nhận.</p></section>;
}
