import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = path.join(root, 'backend');
const envFile = path.join(backendDir, '.env');
const webPort = Number(process.env.WEB_PORT || 5173);
const apiPort = Number(process.env.PORT || 4000);
const apiOrigin = `http://localhost:${apiPort}`;

if (!existsSync(envFile)) {
  console.error('\n[Boatswain] Missing backend/.env');
  console.error('Create it from the example, then add your local PostgreSQL DATABASE_URL and a private JWT_SECRET:');
  console.error(process.platform === 'win32'
    ? '  Copy-Item backend/.env.example backend/.env'
    : '  cp backend/.env.example backend/.env');
  process.exit(1);
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2'
};

const webServer = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
    let requested = path.resolve(root, `.${pathname}`);
    if (requested !== root && !requested.startsWith(root + path.sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    let filePath = requested;
    try {
      const info = await stat(filePath);
      if (info.isDirectory()) filePath = path.join(filePath, 'index.html');
    } catch {
      filePath = path.join(root, 'index.html');
    }

    let body = await readFile(filePath);
    const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    if (path.basename(filePath) === 'index.html') {
      let html = body.toString('utf8');
      html = html.replace(
        /<meta name="boatswain-api-url" content="[^"]*">/i,
        `<meta name="boatswain-api-url" content="${apiOrigin}">`
      );
      body = Buffer.from(html);
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': body.length,
      'Cache-Control': 'no-store'
    });
    if (req.method === 'HEAD') res.end();
    else res.end(body);
  } catch (error) {
    console.error('[web] Request failed:', error);
    res.writeHead(500).end('Internal server error');
  }
});

const api = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: backendDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: String(apiPort),
    CORS_ORIGIN: `http://localhost:${webPort}`
  }
});

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  webServer.close();
  if (!api.killed) api.kill('SIGTERM');
  setTimeout(() => {
    if (!api.killed) api.kill('SIGKILL');
    process.exit(code);
  }, 1500).unref();
}

api.on('error', error => {
  console.error('[api] Could not start backend:', error.message);
  shutdown(1);
});
api.on('exit', (code, signal) => {
  if (!shuttingDown) {
    console.error(`[api] Backend stopped (code ${code ?? 'null'}, signal ${signal ?? 'none'}). Stopping frontend.`);
    shutdown(code && code !== 0 ? code : 1);
  }
});

webServer.listen(webPort, '127.0.0.1', () => {
  console.log('\nBoatswain Group development servers');
  console.log(`  Frontend: http://localhost:${webPort}`);
  console.log(`  Backend:  ${apiOrigin}`);
  console.log(`  Health:   ${apiOrigin}/health`);
  console.log('\nPress Ctrl+C to stop both servers.\n');
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
