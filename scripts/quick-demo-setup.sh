#!/bin/bash

# Quick demo setup script
echo "Creating demo user in Supabase..."

# Your Supabase credentials
SUPABASE_URL="https://oxtivjctfyemoegxepzw.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dGl2amN0ZnllbW9lZ3hlcHp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDUyMjM1MCwiZXhwIjoyMDY2MDk4MzUwfQ.-4gnYNO45OxlTrujGfcvBQDtJHIWGMgpF2zBE9-aD9g"

# Create user via Supabase Admin API
curl -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@lifenavigator.tech",
    "password": "DemoPassword123",
    "email_confirm": true,
    "user_metadata": {
      "full_name": "Demo User"
    }
  }'

echo ""
echo "Demo user creation attempted!"
echo "Email: demo@lifenavigator.tech"
echo "Password: DemoPassword123"