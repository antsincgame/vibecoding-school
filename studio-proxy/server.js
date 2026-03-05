const http = require('http');
const fs = require('fs');
const url = require('url');

const USERNAME = 'supabase';
const PASSWORD = '445c338942e85589cbbc98dbb49247f2';
const STUDIO_HOST = 'supabase-studio';
const STUDIO_PORT = 3000;
const SESSION_COOKIE = 'studio_auth';

const loginHtml = fs.readFileSync('/opt/studio-proxy/login.html', 'utf8');

function checkCookie(req) {
  return (req.headers.cookie || '').includes(`${SESSION_COOKIE}=ok`);
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);

  if (parsed.pathname === '/login' && req.method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const user = params.get('username');
      const pass = params.get('password');
      if (user === USERNAME && pass === PASSWORD) {
        res.writeHead(302, { 'Set-Cookie': `${SESSION_COOKIE}=ok; Path=/; HttpOnly`, 'Location': '/project/default' });
        res.end();
      } else {
        res.writeHead(302, { 'Location': '/?error=1' });
        res.end();
      }
    });
    return;
  }

  if (parsed.pathname === '/logout') {
    res.writeHead(302, { 'Set-Cookie': `${SESSION_COOKIE}=; Path=/; Max-Age=0`, 'Location': '/' });
    res.end();
    return;
  }

  if (parsed.pathname === '/' && !checkCookie(req)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(loginHtml);
    return;
  }

  const options = {
    hostname: STUDIO_HOST,
    port: STUDIO_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: STUDIO_HOST, authorization: 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64') }
  };

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxy.on('error', () => { res.writeHead(502); res.end('Bad Gateway'); });
  req.pipe(proxy);
});

server.listen(4000, () => console.log('Studio proxy running on port 4000'));
