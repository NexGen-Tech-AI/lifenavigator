#!/bin/bash

# Check if demo user exists
echo "Checking for demo user in Supabase..."

SUPABASE_URL="https://oxtivjctfyemoegxepzw.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dGl2amN0ZnllbW9lZ3hlcHp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDUyMjM1MCwiZXhwIjoyMDY2MDk4MzUwfQ.-4gnYNO45OxlTrujGfcvBQDtJHIWGMgpF2zBE9-aD9g"

# Check for user via REST API
echo "Checking auth.users for demo@lifenavigator.ai..."
curl -X GET "${SUPABASE_URL}/rest/v1/rpc/get_user_by_email" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@lifenavigator.ai"}'