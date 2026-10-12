#!/bin/bash
# Check if next-server is running, if not restart it
if ! pgrep -f 'next-server' > /dev/null 2>&1; then
  cd /home/z/my-project
  pkill -f 'next dev' 2>/dev/null
  sleep 1
  NODE_OPTIONS="--max-old-space-size=1400" node node_modules/.bin/next dev --webpack -p 3000 >> dev.log 2>&1 &
fi
