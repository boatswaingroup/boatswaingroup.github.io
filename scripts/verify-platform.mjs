import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.join(root, 'backend');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const docker = process.platform === 'win32' ? 'docker.exe' : 'docker';
const failures = [];

function run(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: root, stdio: 'inherit', shell: process.platform === 'win32',
      ...options
    });
    child.once('error', error => {
      console.error(`[verify] Cannot run ${command}: ${error.message}`);
      resolve(1);
    });
    child.once('exit', code => resolve(code ?? 1));
  });
}

async function requireFile(file, label) {
  try { await access(path.join(root, file)); return true; }
  catch { console.error(`[verify] Missing ${label}: ${file}`); failures.push(label); return false; }
}

async function main() {
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 22) {
    console.error(`[verify] Node.js 22+ required; found ${process.versions.node}`);
    process.exitCode = 1;
    return;
  }

  const required = [
    ['package.json', 'root package manifest'],
    ['backend/package.json', 'API package manifest'],
    ['backend/prisma/schema.prisma', 'database schema'],
    ['docker-compose.yml', 'Docker Compose file'],
    ['index.html', 'web entry point']
  ];
  for (const [file, label] of required) await requireFile(file, label);
  if (failures.length) { process.exitCode = 1; return; }

  console.log('\n[verify] Checking Docker Compose configuration…');
  if (await run(docker, ['compose', 'config', '--quiet']) !== 0) {
    console.error('[verify] Docker Compose is unavailable or its configuration is invalid.');
    process.exitCode = 1;
    return;
  }

  console.log('\n[verify] Installing backend dependencies…');
  if (await run(npm, ['install', '--prefix', 'backend']) !== 0) {
    console.error('[verify] Dependency installation failed.');
    process.exitCode = 1;
    return;
  }

  console.log('\n[verify] Building API…');
  if (await run(npm, ['run', 'build:api']) !== 0) failures.push('API build');
  console.log('\n[verify] Running API tests…');
  if (await run(npm, ['run', 'test:api']) !== 0) failures.push('API tests');

  if (failures.length) {
    console.error(`\n[verify] FAILED: ${failures.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  console.log('\n[verify] PASS: required files, Docker Compose config, API build, and API tests.');
  console.log('[verify] This does not certify production readiness or validate live payment, payout, market, or cadastral integrations.');
}

main().catch(error => {
  console.error('[verify] Unexpected failure:', error);
  process.exitCode = 1;
});
