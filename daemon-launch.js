const { spawn } = require('child_process');
const fs = require('fs');

function startServer() {
  const child = spawn('node', ['node_modules/.bin/next', 'dev', '--webpack', '-p', '3000'], {
    cwd: '/home/z/my-project',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=1400' },
    stdio: ['ignore', fs.openSync('/home/z/my-project/dev.log', 'a'), fs.openSync('/home/z/my-project/dev.log', 'a')],
    detached: true
  });
  child.unref();
  fs.writeFileSync('/home/z/my-project/.next-dev.pid', String(child.pid));
  console.log('Server PID:', child.pid);
}

startServer();
// Keep this process alive
setInterval(() => {}, 60000);
