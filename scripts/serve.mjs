import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../app/',import.meta.url)));
const port=Number(process.argv[2]||process.env.PORT||18089);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.mp3':'audio/mpeg','.png':'image/png','.webmanifest':'application/manifest+json'};
http.createServer((req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
 res.setHeader('Cache-Control','no-cache');
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname.includes('\\')||pathname.includes('\0'))throw new Error();
  const target=path.resolve(root,`.${pathname==='/'?'/index.html':pathname}`);
  if(!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile())throw new Error();
  const size=fs.statSync(target).size;res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');res.setHeader('Accept-Ranges','bytes');
  const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  if(range){const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):size-1,size-1);if(start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});if(req.method==='HEAD')res.end();else fs.createReadStream(target,{start,end}).pipe(res);}
  else{res.writeHead(200,{'Content-Length':size});if(req.method==='HEAD')res.end();else fs.createReadStream(target).pipe(res);}
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('找不到檔案');}
}).listen(port,'127.0.0.1',()=>console.log(`日和第二版：http://127.0.0.1:${port}/`));
