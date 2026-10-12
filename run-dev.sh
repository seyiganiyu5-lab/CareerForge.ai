#!/bin/bash
cd /home/z/my-project
export NODE_OPTIONS="--max-old-space-size=1400"
exec node node_modules/.bin/next dev --webpack -p 3000 >> /home/z/my-project/dev.log 2>&1
