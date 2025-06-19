#!/bin/bash

echo "Testing authentication redirect flow..."

# Start the dev server in background
echo "Starting dev server..."
npm run dev &
DEV_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 10

# Test 1: Check if login page is accessible
echo -e "\n1. Testing login page..."
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/auth/login)
echo "Login page status: $LOGIN_STATUS"

# Test 2: Try to access dashboard without auth (should redirect)
echo -e "\n2. Testing dashboard access without auth..."
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L http://localhost:3000/dashboard)
DASHBOARD_REDIRECT=$(curl -s -I http://localhost:3000/dashboard | grep -i location || echo "No redirect")
echo "Dashboard status: $DASHBOARD_STATUS"
echo "Dashboard redirect: $DASHBOARD_REDIRECT"

# Test 3: Check middleware response
echo -e "\n3. Checking middleware logs..."
curl -s http://localhost:3000/dashboard 2>&1 | grep -E "Supabase|auth|middleware" | head -5 || echo "No middleware logs found"

# Clean up
echo -e "\nStopping dev server..."
kill $DEV_PID 2>/dev/null

echo -e "\nTest complete!"