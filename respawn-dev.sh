#!/bin/bash
cd /home/z/my-project
while true; do
  NODE_OPTIONS="--max-old-space-size=1400" node node_modules/.bin/next dev --webpack -p 3000 >> dev.log 2>&1
  echo "$(date): Server exited, restarting in 3s..." >> dev.log
  sleep 3
done
