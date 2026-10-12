#!/bin/bash
set -e

# Kill old processes
pkill -f "next" 2>/dev/null || true
sleep 2

# Start dev server
cd /home/z/my-project
bun run dev &

# Wait for server to be ready
for i in $(seq 1 30); do
  sleep 1
  if ss -tlnp 2>/dev/null | rg -q 3000; then
    echo "Server ready at ${i}s"
    break
  fi
done

# Give extra time for compilation
sleep 5

echo "=== Navigating to login ==="
agent-browser open "http://localhost:3000/login" 2>&1
agent-browser wait --load networkidle 2>&1
sleep 5

echo "=== Clicking Create Account ==="
agent-browser find text "Create Account" click 2>&1
sleep 8

echo "=== Filling signup form ==="
agent-browser snapshot -i 2>&1 > /tmp/snapshot.txt
FIRST=$(rg -o 'textbox "First Name" \[ref=(e[0-9]+)\]' /tmp/snapshot.txt | rg -o 'e[0-9]+' || echo "")
LAST=$(rg -o 'textbox "Last Name" \[ref=(e[0-9]+)\]' /tmp/snapshot.txt | rg -o 'e[0-9]+' || echo "")
EMAIL=$(rg -o 'textbox "Email" \[ref=(e[0-9]+)\]' /tmp/snapshot.txt | rg -o 'e[0-9]+' || echo "")
PASS=$(rg -o 'textbox "Password" \[ref=(e[0-9]+)\]' /tmp/snapshot.txt | head -1 | rg -o 'e[0-9]+' || echo "")
CONF=$(rg -o 'textbox "Confirm Password" \[ref=(e[0-9]+)\]' /tmp/snapshot.txt | rg -o 'e[0-9]+' || echo "")
CHECK=$(rg -o 'checkbox \[checked=false, ref=(e[0-9]+)\]' /tmp/snapshot.txt | rg -o 'e[0-9]+' || echo "")
CREATE=$(rg -o 'button "Create Account" \[ref=(e[0-9]+)\]' /tmp/snapshot.txt | rg -o 'e[0-9]+' || echo "")

echo "Refs: First=$FIRST Last=$LAST Email=$EMAIL Pass=$PASS Conf=$CONF Check=$CHECK Create=$CREATE"

agent-browser fill "@$FIRST" "Preview" 2>&1 || true
agent-browser fill "@$LAST" "Test" 2>&1 || true
agent-browser fill "@$EMAIL" "pt-$(date +%s)@test.com" 2>&1 || true
agent-browser fill "@$PASS" "TestPass123!" 2>&1 || true
agent-browser fill "@$CONF" "TestPass123!" 2>&1 || true
agent-browser check "@$CHECK" 2>&1 || true
sleep 1
agent-browser click "@$CREATE" 2>&1 || true

echo "=== Signup submitted, waiting ==="
sleep 15

echo "=== Current URL: $(agent-browser get url 2>&1) ==="

echo "=== Navigating to cover-letters/edit ==="
agent-browser open "http://localhost:3000/cover-letters/edit" 2>&1
sleep 10
echo "=== URL now: $(agent-browser get url 2>&1) ==="

agent-browser screenshot /home/z/my-project/screenshot-final-preview.png 2>&1
echo "=== Screenshot saved ==="

echo "=== Server: $(ss -tlnp 2>/dev/null | rg -c 3000 || echo 0) ==="

# Don't kill the server
echo "=== DONE ==="
