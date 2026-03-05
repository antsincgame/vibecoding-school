const http = require('http');
const fs = require('fs');
const url = require('url');

const USERS = {
  'supabase': '445c338942e85589cbbc98dbb49247f2',
  'Graf.arlou@ya.ru': 'vmXA9GVyxKiYik5'
};
const STUDIO_HOST = '10.0.2.8';
const STUDIO_PORT = 3000;
const SESSION_COOKIE = 'studio_auth';
const loginHtml = fs.readFileSync('/opt/studio-proxy/login.html', 'utf8');
const LOGOUT_INJECT = '<script>(function(){function a(){var b=document.querySelector(\'button[aria-controls="command-menu-dialog-content"]\');if(!b)return setTimeout(a,500);var c=document.createElement(\'button\');c.innerText=\'Выйти\';c.style.cssText=\'margin-right:8px;padding:4px 12px;background:#ef4444;color:white;border:none;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;height:30px;flex-shrink:0\';c.onclick=function(){fetch(\'/logout\').then(function(){location.href=\'/\'})};b.parentNode.insertBefore(c,b)}a()})();<\/script>';

function checkCookie(req) {
  return (req.headers.cookie || '').includes(SESSION_COOKIE + '=ok');
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
      if (USERS[user] && USERS[user] === pass) {
        res.writeHead(302, { 'Set-Cookie': SESSION_COOKIE + '=ok; Path=/; HttpOnly', 'Location': '/project/default' });
        res.end();
      } else {
        res.writeHead(302, { 'Location': '/?error=1' });
        res.end();
      }
    });
    return;
  }

  if (parsed.pathname === '/logout') {
    res.writeHead(302, { 'Set-Cookie': SESSION_COOKIE + '=; Path=/; Max-Age=0', 'Location': '/' });
    res.end();
    return;
  }

  if (parsed.pathname === '/' && !checkCookie(req)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(loginHtml);
    return;
  }

  const options = {
    hostname: STUDIO_HOST, port: STUDIO_PORT, path: req.url, method: req.method,
    headers: { ...req.headers, host: STUDIO_HOST, authorization: 'Basic ' + Buffer.from('supabase:445c338942e85589cbbc98dbb49247f2').toString('base64') }
  };

  const proxy = http.request(options, (proxyRes) => {
    const ct = proxyRes.headers['content-type'] || '';
    if (ct.includes('text/html')) {
      const headers = { ...proxyRes.headers };
      delete headers['content-length'];
      res.writeHead(proxyRes.statusCode, headers);
      let body = '';
      proxyRes.on('data', chunk => body += chunk);
      proxyRes.on('end', () => { res.end(body.replace('</head>', LOGOUT_INJECT + '</head>')); });
    } else {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }
  });

  proxy.on('error', () => { res.writeHead(502); res.end('Bad Gateway'); });
  req.pipe(proxy);
});

server.listen(4000, '0.0.0.0', () => console.log('Studio proxy running on port 4000'));
