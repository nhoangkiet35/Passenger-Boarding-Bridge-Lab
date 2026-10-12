from pathlib import Path
from pypdf import PdfReader
import json
root=Path(r'C:/Users/hkngu/Desktop/Tài liệu Cầu ống dẫn khách')
out=Path('tmp/research')
index=[]
for path in root.glob('*.pdf'):
    reader=PdfReader(path)
    pages=[p.extract_text() or '' for p in reader.pages]
    target=out/(path.stem+'.txt')
    target.write_text('\n'.join(f'\n=== PDF PAGE {i+1} ===\n{t}' for i,t in enumerate(pages)),encoding='utf-8')
    index.append({'file':path.name,'pages':len(pages),'chars':sum(map(len,pages))})
(out/'index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(index,ensure_ascii=False))
