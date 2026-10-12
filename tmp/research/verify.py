from pathlib import Path
import re
p=Path('tmp/research/VN_Skywinder Power Operating and Maintenance Manual Rev A.en.vi (1).txt');t=p.read_text(encoding='utf-8');parts=re.split(r'\n=== PDF PAGE (\d+) ===\n',t)
for i in range(1,len(parts),2):
 if parts[i] in ['45','46','47','48','49','50','51','52','53','54','55']: print('PDF PAGE',parts[i],parts[i+1][:3500])
import fitz
root=Path(r'C:/Users/hkngu/Desktop/Tài liệu Cầu ống dẫn khách')
for name,n in [('PCA.pdf',49),('PWS.pdf',42),('12-05-2026 VDGS Datasheet.pdf',2)]:
 d=fitz.open(root/name);d[n-1].get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save(Path('tmp/research',name.replace('.pdf','')+f'-{n}.png'))
