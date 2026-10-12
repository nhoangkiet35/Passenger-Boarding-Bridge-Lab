from pathlib import Path
import re
for name,needles in [('PCA.txt',['5.1 Input','5.0 Technical','Technical Specifications','Aircraft Selection','5.2 Output','Black Box']),('VN_Skywinder Power Operating and Maintenance Manual Rev A.en.vi (1).txt',['=== PDF PAGE 50','=== PDF PAGE 51','=== PDF PAGE 52','=== PDF PAGE 53'])]:
 t=Path('tmp/research',name).read_text(encoding='utf-8')
 pages=re.split(r'\n=== PDF PAGE (\d+) ===\n',t)
 print('\nDOCUMENT',name)
 for i in range(1,len(pages),2):
  if (name=='PCA.txt' and any(n.lower() in pages[i+1].lower() for n in needles)) or (name!='PCA.txt' and pages[i] in ['50','51','52','53']):
   print('PDF PAGE',pages[i],pages[i+1][:4200])
