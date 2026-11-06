const http=require('http'),fs=require('fs'),path=require('path'),root=path.join(__dirname,'dist');http.createServer((req,res)=>{
 if (new URL(req.url, 'http://localhost').pathname === '/cover.jpg') {
  return fs.readFile(__dirname + '/cover.jpg', (error, cover) => {
   res.writeHead(error ? 404 : 200, {'Content-Type': error ? 'text/plain' : 'image/jpeg'});
   res.end(error ? 'Not found' : cover);
  });
 }
 let name;try{name=decodeURIComponent(req.url.split('?')[0])}catch{res.writeHead(400);return res.end()}const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}fs.readFile(file,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':({'html':'text/html; charset=utf-8','js':'text/javascript; charset=utf-8','css':'text/css; charset=utf-8'})[file.split('.').pop()]||'application/octet-stream','Cache-Control':'no-store'});res.end(e?'Not found':b)})}).listen(8792,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:8792/'));
