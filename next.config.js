{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "outputDirectory": ".next",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "ignoreCommand": "echo 'Force deploy from Vercel'",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(self), interest-cohort=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors 'self' https://yourwebsite.com"
        }
      ]
    }
  ],
  "env": {
    "SKIP_ENV_VALIDATION": "true",
    "ENABLE_FIELD_ENCRYPTION": "false",
    "USE_MOCK_DB": "false",
    "NEXT_PUBLIC_APP_URL": "${VERCEL_URL}",
    "NEXTAUTH_URL": "https://${VERCEL_URL}",
    "APP_ENV": "production"
  },
  "build": {
    "env": {
      "NODE_OPTIONS": "--max-old-space-size=4096",
      "NEXTAUTH_URL": "https://${VERCEL_URL}"
    }
  }
}
