import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const port = process.env.SMOKE_PORT ?? '3107';
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', port], {
  env: { ...process.env, NEXTAUTH_URL: base, NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'local-smoke-only-secret-not-for-deployment' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', (chunk: Buffer) => { serverLog = (serverLog + chunk.toString()).slice(-12_000); });
}

async function routeFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? routeFiles(filename) : entry.name === 'route.ts' ? [filename] : [];
  }));
  return files.flat();
}

async function main() {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (child.exitCode !== null) throw new Error(`Server exited before readiness: ${serverLog}`);
    try {
      const response = await fetch(`${base}/api/auth/session`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) { ready = true; break; }
    } catch { /* Server has not started listening yet. */ }
    await delay(100);
  }
  assert.ok(ready, `Server readiness timed out: ${serverLog}`);

  let publicPages = 0;
  for (const route of ['/', '/login', '/register', '/forgotPassword']) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 200, `${route} public page`);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.match(await response.text(), /WeTrack/);
    publicPages += 1;
  }

  const redirect = await fetch(`${base}/projects`, { redirect: 'manual' });
  assert.equal(redirect.status, 307);
  assert.equal(new URL(redirect.headers.get('location')!, base).pathname, '/login');

  let deniedMethods = 0;
  const publicAuth = new Set(['/api/auth/login', '/api/auth/register', '/api/auth/user/reset-password']);
  for (const filename of await routeFiles('app/api')) {
    if (filename.includes('[...nextauth]')) continue;
    const route = `/${filename.replace(/\\/g, '/').replace(/^app\//, '').replace(/\/route\.ts$/, '').replace(/\[[^\]]+\]/g, 'smoke-resource')}`;
    if (publicAuth.has(route)) continue;
    const source = await readFile(filename, 'utf8');
    const methods = [...source.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/g)].map((match) => match[1]);
    for (const method of methods) {
      const response = await fetch(`${base}${route}`, {
        method,
        ...(method === 'GET' ? {} : { body: '{invalid', headers: { 'Content-Type': 'application/json' } }),
        redirect: 'manual',
      });
      assert.equal(response.status, 401, `${method} ${route} must authenticate before parsing input`);
      assert.match(response.headers.get('content-type') ?? '', /application\/json/);
      deniedMethods += 1;
    }
  }

  for (const origin of ['https://attacker.example', `http://sibling.localhost:${port}`]) {
    const response = await fetch(`${base}/api/project`, { method: 'POST', headers: { Origin: origin }, body: '{}' });
    assert.equal(response.status, 403, 'cross-origin mutation must be denied');
  }
  for (const route of ['/api/auth/login', '/api/auth/register']) {
    const response = await fetch(`${base}${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.ok(response.status >= 400 && response.status < 500, `${route} invalid input should be a client error`);
  }
  const reset = await fetch(`${base}/api/auth/user/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"email":"invalid"}' });
  assert.equal(reset.status, 200);
  assert.match(await reset.text(), /If the account exists/);

  console.info(JSON.stringify({ publicPages, deniedUnauthenticatedMethods: deniedMethods, crossOriginMutationsDenied: 2, invalidCredentialRequestsRejected: 2, passwordResetEnumerationSafe: true }));
}

main().catch((error: unknown) => {
  console.error(error);
  console.error(serverLog);
  process.exitCode = 1;
}).finally(() => { child.kill('SIGTERM'); });
