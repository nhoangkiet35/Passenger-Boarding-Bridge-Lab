from pathlib import Path
import pypdfium2 as pdfium
root=Path(r'C:/Users/hkngu/Desktop/Tài liệu Cầu ống dẫn khách')
for name,n in [('PCA.pdf',49),('PWS.pdf',42),('12-05-2026 VDGS Datasheet.pdf',2),('VN_Skywinder Power Operating and Maintenance Manual Rev A.en.vi (1).pdf',63)]:
 doc=pdfium.PdfDocument(root/name);doc[n-1].render(scale=1.4).to_pil().save(Path('tmp/research',name[:12]+f'-{n}.png'))
