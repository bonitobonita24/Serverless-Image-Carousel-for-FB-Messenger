/**
 * Simple local development server with SPA routing for /clients/* paths.
 * Use this when Wrangler is not available.
 * 
 * Usage: node server.js [port]
 * Default port: 8080
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2]) || 8080;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.json': 'application/json',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
};

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];

  // SPA routing: /clients/<name> → index.html (mimics _redirects behavior)
  if (/^\/clients\/[^/]+\/?$/.test(url) && !path.extname(url)) {
    url = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, url);

  // Security: prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + req.url);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'X-Frame-Options': 'ALLOWALL',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  Gallery dev server running at http://localhost:${PORT}`);
  console.log(`  Visit: http://localhost:${PORT}/clients/lushcamp\n`);
});
