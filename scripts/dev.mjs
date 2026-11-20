import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = path.join(root, 'backend');
const envFile = path.join(backendDir, '.env');
const webPort = Number(process.env.WEB_PORT || 5173);
const apiPort = Number(process.env.API_PORT || 5000);
const apiOrigin = `http://localhost:${apiPort}`;
const databaseUrl = process.env.DATABASE_URL || 'postgresql://boatswain:boatswain_dev_only@127.0.0.1:5432/boatswain?schema=public';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const docker = process.platform === 'win32' ? 'docker.exe' : 'docker';

if (!existsSync(path.join(backendDir, 'node_modules'))) {
  console.error('[Boatswain] Install backend packages first: npm install --prefix backend');
  process.exit(1);
}
if (!existsSync(envFile)) {
  const secret = randomBytes(48).toString('hex');
  await writeFile(envFile, [
    `DATABASE_URL="${databaseUrl}"`, `JWT_SECRET="${secret}"`,
    `CORS_ORIGIN="http://localhost:${webPort}"`, `PORT=${apiPort}`,
    'PASSWORD_RESET_URL="http://localhost:5173/"', ''
  ].join('\n'), { flag: 'wx', mode: 0o600 });
  console.log('[Boatswain] Created backend/.env with a fresh local-only JWT secret.');
}
const existingEnv = await readFile(envFile, 'utf8');
const secretMatch = existingEnv.match(/^JWT_SECRET=(.*)$/m);
const existingSecret = secretMatch?.[1]?.replace(/^["']|["']$/g, '') || '';
if (!existingSecret || existingSecret.includes('replace-with') || existingSecret.length < 32) {
  const freshSecret = randomBytes(48).toString('hex');
  const repairedEnv = secretMatch
    ? existingEnv.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET="${freshSecret}"`)
    : existingEnv + `\nJWT_SECRET="${freshSecret}"\n`;
  await writeFile(envFile, repairedEnv, { mode: 0o600 });
  console.log('[Boatswain] Replaced the example JWT secret with a private local secret.');
}

const localEnv = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  PORT: String(apiPort),
  CORS_ORIGIN: `http://localhost:${webPort}`
};
function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit', env: localEnv, shell: process.platform === 'win32', ...options });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`)));
  });
}

console.log('\n[Boatswain] Starting PostgreSQL on localhost:5432 …');
try { await run(docker, ['compose', 'up', '-d', 'db']); }
catch (error) {
  console.error('\n[Boatswain] Docker Compose could not start PostgreSQL. Install/start Docker Desktop or Docker Engine with Compose v2, then retry.');
  console.error(error.message); process.exit(1);
}
let databaseReady = false;
for (let attempt = 0; attempt < 40; attempt += 1) {
  try {
    await run(docker, ['compose', 'exec', '-T', 'db', 'pg_isready', '-U', 'boatswain', '-d', 'boatswain'], { stdio: 'ignore' });
    databaseReady = true; break;
  } catch { await new Promise(resolve => setTimeout(resolve, 1500)); }
}
if (!databaseReady) { console.error('[Boatswain] PostgreSQL did not become ready. Run: docker compose logs db'); process.exit(1); }

console.log('[Boatswain] Generating Prisma Client and applying migrations …');
try {
  await run(npm, ['run', 'db:generate', '--prefix', 'backend']);
  await run(npm, ['run', 'db:deploy', '--prefix', 'backend']);
} catch (error) {
  console.error('[Boatswain] Database setup failed. Check backend/.env and Prisma migrations.');
  console.error(error.message); process.exit(1);
}

const mimeTypes = {
  '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8','.svg':'image/svg+xml',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp',
  '.ico':'image/x-icon','.txt':'text/plain; charset=utf-8','.woff2':'font/woff2'
};
const webServer = createServer(async (req,res) => {
  try {
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{Allow:'GET, HEAD'}).end('Method not allowed');return;}
    const pathname=decodeURIComponent(new URL(req.url||'/','http://localhost').pathname);
    const segments=pathname.split('/').filter(Boolean);
    const blocked=new Set(['backend','foundation','scripts','docs','android','node_modules','.git','.github']);
    if(segments.some(segment=>segment.startsWith('.')||blocked.has(segment.toLowerCase()))){res.writeHead(404).end('Not found');return;}
    const requested=path.resolve(root,`.${pathname}`);
    if(requested!==root&&!requested.startsWith(root+path.sep)){res.writeHead(403).end('Forbidden');return;}
    let filePath=requested;
    try{if((await stat(filePath)).isDirectory())filePath=path.join(filePath,'index.html');}
    catch{filePath=path.join(root,'index.html');}
    let body=await readFile(filePath);
    const contentType=mimeTypes[path.extname(filePath).toLowerCase()]||'application/octet-stream';
    if(path.basename(filePath)==='index.html'){
      body=Buffer.from(body.toString('utf8').replace(/<meta name="boatswain-api-url" content="[^"]*">/i,`<meta name="boatswain-api-url" content="${apiOrigin}">`));
    }
    res.writeHead(200,{'Content-Type':contentType,'Content-Length':body.length,'Cache-Control':'no-store'});
    if(req.method==='HEAD')res.end();else res.end(body);
  }catch(error){console.error('[web] Request failed:',error);res.writeHead(500).end('Internal server error');}
});
const api=spawn(npm,['run','dev'],{cwd:backendDir,stdio:'inherit',env:localEnv,shell:process.platform==='win32'});
let shuttingDown=false;
function shutdown(code=0){
  if(shuttingDown)return;shuttingDown=true;webServer.close();if(!api.killed)api.kill('SIGTERM');
  const forceExit=setTimeout(()=>process.exit(code),3000);forceExit.unref();api.once('exit',()=>process.exit(code));
}
api.on('error',error=>{console.error('[api] Could not start backend:',error.message);shutdown(1);});
api.on('exit',(code,signal)=>{if(!shuttingDown){console.error(`[api] Backend stopped (code ${code??'null'}, signal ${signal??'none'}). Stopping frontend.`);shutdown(code&&code!==0?code:1);}});
webServer.on('error',error=>{console.error('[web] Could not bind frontend port:',error.message);shutdown(1);});
webServer.listen(webPort,'127.0.0.1',()=>{
  console.log('\nBoatswain Group — full-stack development environment');
  console.log(`  Frontend:  http://localhost:${webPort}`);
  console.log(`  Backend:   ${apiOrigin}`);
  console.log(`  API health:${apiOrigin}/health`);
  console.log('  Database:  localhost:5432 (PostgreSQL 16)');
  console.log('\nPostgreSQL remains running after Ctrl+C. Stop it with: docker compose down');
  console.log('Press Ctrl+C to stop the frontend and API.\n');
});
process.on('SIGINT',()=>shutdown(0));process.on('SIGTERM',()=>shutdown(0));
