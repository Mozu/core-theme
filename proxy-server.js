const http = require('http');
const https = require('https');
const url = require('url');

const REMOTE_HOST = 'https://t100046-s100072.sb.gdev01.gcp.kibocommerce.com';
const PORT = 3001;

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Only proxy Amazon Pay requests
  if (!req.url.includes('/amazonpay/')) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const targetUrl = REMOTE_HOST + req.url;
  console.log(`Proxying: ${req.method} ${targetUrl}`);

  const parsedUrl = url.parse(targetUrl);
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 443,
    path: parsedUrl.path,
    method: req.method,
    headers: {
      ...req.headers,
      host: parsedUrl.hostname
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    // Copy status and headers
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500);
    res.end('Proxy Error');
  });

  // Forward request body
  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying Amazon Pay requests to: ${REMOTE_HOST}`);
});