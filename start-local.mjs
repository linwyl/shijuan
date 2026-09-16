import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const directory = path.dirname(fileURLToPath(import.meta.url));
const candidates = [path.join(directory,'拾卷.html'),path.join(directory,'拾卷_离线版.html'),path.resolve(directory,'../dist/index.html')];
let htmlPath;
for (const candidate of candidates) { try { await fs.access(candidate); htmlPath = candidate; break; } catch {} }
if (!htmlPath) { console.error('找不到拾卷 HTML，请完整解压文件；源码请先运行 pnpm build。'); process.exit(1); }
const port = 17839;
const url = `http://127.0.0.1:${port}/`;
function openPage() {
  if (process.argv.includes('--no-open')) return;
  const child = process.platform === 'win32'
    ? spawn('cmd.exe',['/d','/c','start','',url],{windowsHide:true,stdio:'ignore'})
    : spawn(process.platform === 'darwin' ? 'open' : 'xdg-open',[url],{stdio:'ignore'});
  child.on('error',()=>console.log('请在浏览器打开：'+url));
  child.unref();
}
const server = http.createServer(async (request,response) => {
  if (request.headers.host !== `127.0.0.1:${port}`) { response.writeHead(403); response.end(); return; }
  if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405,{Allow:'GET, HEAD'}); response.end(); return; }
  const pathname = new URL(request.url,url).pathname;
  response.setHeader('Cache-Control','no-store');
  response.setHeader('X-Content-Type-Options','nosniff');
  response.setHeader('Cross-Origin-Resource-Policy','same-origin');
  if (pathname === '/__paper_cards_status__') {
    response.writeHead(200,{'Content-Type':'application/json'});
    response.end(request.method === 'HEAD' ? '' : JSON.stringify({app:'paper-cards',protocol:1})); return;
  }
  if (pathname !== '/' && pathname !== '/index.html') { response.writeHead(404); response.end(); return; }
  try {
    const bytes = await fs.readFile(htmlPath);
    response.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Length':bytes.length});
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch { response.writeHead(500); response.end('Please rebuild or restore the HTML file.'); }
});
server.on('error',async error => {
  if (error.code === 'EADDRINUSE') {
    try {
      const response = await fetch(url+'__paper_cards_status__',{signal:AbortSignal.timeout(2000)});
      const result = await response.json();
      if (result.app === 'paper-cards' && result.protocol === 1) { console.log('拾卷已经启动：'+url); openPage(); return; }
    } catch {}
    console.error('本地入口被其他程序占用，请关闭占用 17839 端口的程序后重试。为保持保存记录的位置，不自动更换地址。');
  } else console.error('拾卷启动失败：'+error.message);
  process.exitCode = 1;
});
server.listen(port,'127.0.0.1',()=>{
  console.log('拾卷已启动：'+url+'\n请固定使用这个地址和同一个浏览器。关闭此窗口可停止服务，已保存记录仍保留。');
  openPage();
});
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>process.exit(0)));
