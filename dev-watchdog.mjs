import { spawn } from 'child_process';
import http from 'http';

const MAX_RETRIES = 100;
const CHECK_INTERVAL = 5000;
const START_DELAY = 3000;

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => { req.destroy(); resolve(false); });
  });
}

async function startServer() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [
      'node_modules/.bin/next', 'dev', '--webpack', '-p', '3000'
    ], {
      cwd: '/home/z/my-project',
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=1400' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    child.stdout.on('data', (d) => {
      output += d.toString();
    });
    child.stderr.on('data', (d) => {
      output += d.toString();
    });

    child.on('exit', (code) => {
      reject(new Error(`Server exited with code ${code}`));
    });

    // Wait for "Ready" message
    const checkReady = () => {
      if (output.includes('Ready in')) {
        resolve(child);
      } else {
        child.once('data', checkReady);
      }
    };
    child.stdout.on('data', checkReady);

    // Timeout after 60s
    setTimeout(() => reject(new Error('Timeout waiting for server')), 60000);
  });
}

let retries = 0;

while (retries < MAX_RETRIES) {
  try {
    console.log(`[${new Date().toISOString()}] Starting server (attempt ${retries + 1})...`);
    const server = await startServer();
    console.log(`[${new Date().toISOString()}] Server started, monitoring...`);

    // Monitor server health
    while (true) {
      await new Promise(r => setTimeout(r, CHECK_INTERVAL));
      const alive = await checkServer();
      if (!alive) {
        console.log(`[${new Date().toISOString()}] Server unresponsive, restarting...`);
        try { server.kill(); } catch(e) {}
        break;
      }
    }
  } catch (e) {
    console.log(`[${new Date().toISOString()}] Error: ${e.message}`);
  }
  retries++;
  await new Promise(r => setTimeout(r, START_DELAY));
}
