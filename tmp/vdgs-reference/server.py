from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
video=Path(r'C:\Users\hkngu\Downloads\Advanced-Visual-Docking-Guidance-System_001_1080p.mp4')
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  if self.path=='/video.mp4':
   size=video.stat().st_size; start=0; end=size-1
   if 'Range' in self.headers:
    parts=self.headers['Range'].split('=')[1].split('-');start=int(parts[0]);end=int(parts[1]) if parts[1] else end
   self.send_response(206 if 'Range' in self.headers else 200);self.send_header('Content-Type','video/mp4');self.send_header('Accept-Ranges','bytes');self.send_header('Content-Length',str(end-start+1));self.send_header('Content-Range',f'bytes {start}-{end}/{size}');self.end_headers()
   with video.open('rb') as f:
    f.seek(start);remaining=end-start+1
    while remaining:
     chunk=f.read(min(1024*1024,remaining));self.wfile.write(chunk);remaining-=len(chunk)
  else:
   data=b'''<html><body style="margin:0;background:#111;color:white;font:16px sans-serif"><video id="v" src="/video.mp4" controls style="width:100%;max-height:80vh"></video><div id="info"></div><div id="buttons"></div><script>v.onloadedmetadata=()=>{info.textContent='Duration: '+v.duration.toFixed(1)+' seconds';for(let t=0;t<v.duration;t+=10){let b=document.createElement('button');b.textContent=t+' s';b.onclick=()=>{v.currentTime=t;v.pause()};buttons.append(b)}};</script></body></html>'''
   self.send_response(200);self.send_header('Content-Type','text/html');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
HTTPServer(('127.0.0.1',4180),Handler).serve_forever()
