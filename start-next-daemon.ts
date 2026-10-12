// Daemon process for Next.js production server with strict memory limit
// Creates a truly detached process that survives parent exit
import { spawn } from "child_process";
import { appendFileSync } from "fs";
import { join } from "path";

const LOG = join(process.cwd(), "server.log");

function log(msg: string) {
  appendFileSync(LOG, `[${new Date().toISOString()}] ${msg}\n`);
}

try {
  const pid = process.pid;

  // Fork a child that becomes the actual Next.js server
  const child = spawn(
    "node",
    ["node_modules/next/dist/bin/next", "start", "-p", "3000"],
    {
      cwd: process.cwd(),
      detached: true,
      stdio: ["ignore", "ignore", "ignore"],
      env: {
        ...process.env,
        NODE_OPTIONS: "--max-old-space-size=128",
      },
    }
  );

  // Parent exits immediately - child continues as orphan
  child.unref();
  log(`Next.js daemon started: child PID=${child.pid}, parent PID=${pid}`);
  process.exit(0);
} catch (e) {
  log(`Daemon error: ${e}`);
  process.exit(1);
}
