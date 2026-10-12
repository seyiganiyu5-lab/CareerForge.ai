#!/bin/bash
# Keep-alive script for Next.js dev server
# Auto-restarts when the server dies due to memory pressure

cd /home/z/my-project

while true; do
  echo "[$(date)] Starting Next.js dev server..."
  rm -rf .next 2>/dev/null
  NODE_OPTIONS="--max-old-space-size=384" npx next dev -p 3000 --turbopack > dev.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code: $EXIT_CODE"
  if [ $EXIT_CODE -eq 0 ]; then
    echo "[$(date)] Clean exit, not restarting"
    break
  fi
  echo "[$(date)] Restarting in 3 seconds..."
  sleep 3
done
