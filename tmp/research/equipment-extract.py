from pathlib import Path
from pypdf import PdfReader
root=Path(r'C:/Users/hkngu/Desktop/Tài liệu Cầu ống dẫn khách')
for name in ['PBB.pdf','PCA.pdf','PWS.pdf','PAXWAY2024_EN.pdf','VN_Skywinder Power Operating and Maintenance Manual Rev A.en.vi (1).pdf']:
 p=root/name;r=PdfReader(p); texts=[f'\n=== PDF PAGE {i+1} ===\n'+(x.extract_text() or '') for i,x in enumerate(r.pages)]
 Path('tmp/research',p.stem+'.txt').write_text('\n'.join(texts),encoding='utf-8');print(name,len(r.pages),flush=True)
