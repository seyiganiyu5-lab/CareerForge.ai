#!/bin/bash
cd /home/z/my-project

while true; do
  echo "[$(date)] Starting minimal server..." >> dev.log
  bun run minimal-server.ts >> dev.log 2>&1
  EXIT=$?
  echo "[$(date)] Exited: $EXIT" >> dev.log
  [ $EXIT -eq 0 ] && break
  sleep 1
done
