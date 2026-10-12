// Daemon process that serves static files - completely detached from terminal
import { spawn } from "child_process";
import { existsSync, writeFileSync, appendFileSync } from "fs";
import { join } from "path";

const LOG = join(process.cwd(), "server.log");

function log(msg: string) {
  appendFileSync(LOG, `[${new Date().toISOString()}] ${msg}\n`);
}

// Detach from parent
try {
  const pid = process.pid;
  
  // Fork a child that becomes the actual server
  const child = spawn(
    "bun",
    ["run", "minimal-server.ts"],
    {
      cwd: process.cwd(),
      detached: true,
      stdio: "ignore",
      env: { ...process.env },
    }
  );

  // Parent exits immediately
  child.unref();
  log(`Daemon started: child PID=${child.pid}, parent PID=${pid}`);
  process.exit(0);
} catch (e) {
  log(`Daemon error: ${e}`);
  process.exit(1);
}
