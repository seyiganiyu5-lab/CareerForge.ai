#!/bin/bash
cd /home/z/my-project
while true; do
  NODE_OPTIONS="--max-old-space-size=1400" node node_modules/.bin/next dev --webpack -p 3000
  echo "$(date): Restarting..." >> /home/z/my-project/dev.log
  sleep 3
done
