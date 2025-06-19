# Vercel Integration with AWS S3 Document Vault

## Overview

This guide explains how to integrate your Vercel-deployed Next.js application with the AWS S3 document vault created by Terraform.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│     Vercel      │  API    │    Supabase      │  Auth   │   AWS S3        │
│   (Next.js)     │────────▶│  (Database)      │────────▶│ (Documents)     │
└─────────────────┘         └──────────────────┘         └─────────────────┘
         │                                                          │
         │                    Direct Upload/Download                │
         └──────────────────────────────────────────────────────────┘
```

## Step 1: Deploy AWS Infrastructure

```bash
cd terraform/environments/pilot
./scripts/init-pilot.sh

# Edit configuration
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# Deploy
terraform plan
terraform apply
```

## Step 2: Get AWS Credentials

```bash
# Get all outputs
terraform output -json > pilot-outputs.json

# Get specific values
terraform output -raw secrets_manager_name

# Retrieve secrets from AWS
aws secretsmanager get-secret-value \
  --secret-id $(terraform output -raw secrets_manager_name) \
  --region us-east-1 \
  | jq -r '.SecretString' | jq
```

## Step 3: Configure Vercel Environment Variables

### Required Environment Variables

```bash
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<from secrets manager>
AWS_SECRET_ACCESS_KEY=<from secrets manager>
AWS_VAULT_BUCKET=<from terraform output>
AWS_KMS_KEY_ID=<from terraform output>

# Public variables (client-side)
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_VAULT_BUCKET=<from terraform output>
```

### Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Set environment variables
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add AWS_VAULT_BUCKET production
vercel env add AWS_KMS_KEY_ID production
```

## Step 4: Implement S3 Integration in Next.js

### Install AWS SDK

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Create S3 Client

```typescript
// lib/aws/s3-client.ts
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const VAULT_BUCKET = process.env.AWS_VAULT_BUCKET!;
export const KMS_KEY_ID = process.env.AWS_KMS_KEY_ID!;
```

### Generate Pre-signed URLs

```typescript
// app/api/documents/upload-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, VAULT_BUCKET, KMS_KEY_ID } from '@/lib/aws/s3-client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  // Authenticate user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { fileName, fileType, category } = await request.json();
  
  // Create S3 key with user isolation
  const key = `users/${user.id}/documents/${category}/${Date.now()}-${fileName}`;
  
  // Generate pre-signed upload URL
  const command = new PutObjectCommand({
    Bucket: VAULT_BUCKET,
    Key: key,
    ContentType: fileType,
    ServerSideEncryption: 'aws:kms',
    SSEKMSKeyId: KMS_KEY_ID,
    Metadata: {
      userId: user.id,
      category: category,
      originalName: fileName,
    },
  });
  
  const uploadUrl = await getSignedUrl(s3Client, command, { 
    expiresIn: 3600 // 1 hour
  });
  
  return NextResponse.json({ 
    uploadUrl,
    key,
    expiresIn: 3600 
  });
}
```

### Client-side Upload

```typescript
// components/document-upload.tsx
'use client';

import { useState } from 'react';

export function DocumentUpload() {
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async (file: File) => {
    setUploading(true);
    
    try {
      // Get pre-signed URL
      const response = await fetch('/api/documents/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          category: 'financial',
        }),
      });
      
      const { uploadUrl } = await response.json();
      
      // Upload directly to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      // Save metadata to Supabase
      await saveDocumentMetadata(file.name, key);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={uploading}
      />
    </div>
  );
}
```

## Step 5: Security Best Practices

### 1. User Isolation

Always prefix S3 keys with user ID:
```typescript
const key = `users/${user.id}/documents/${documentId}`;
```

### 2. Content Type Validation

```typescript
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
];

if (!ALLOWED_TYPES.includes(fileType)) {
  throw new Error('Invalid file type');
}
```

### 3. File Size Limits

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large');
}
```

### 4. Metadata Storage

Store document metadata in Supabase:

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  s3_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  category TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
```

## Step 6: Environment-Specific Configuration

### Development

```env
# .env.local
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_VAULT_BUCKET=life-navigator-vault-pilot-abc123
```

### Production

```env
# Set in Vercel Dashboard
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***
```

## Step 7: Cost Optimization

### 1. Enable S3 Intelligent Tiering
Already configured in Terraform - automatically moves objects between access tiers.

### 2. Set Object Expiration
Temporary files are automatically deleted after 1 day from processing bucket.

### 3. Monitor Usage
```bash
# Check bucket size
aws s3 ls s3://your-bucket --recursive --human-readable --summarize

# Get cost estimate
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE
```

## Troubleshooting

### CORS Errors
Ensure your Vercel domain is in the `allowed_origins` Terraform variable.

### Access Denied
Check IAM permissions and bucket policies.

### Encryption Errors
Ensure KMS key permissions include the service user.

## Migration to Production

When ready to migrate from pilot to full AWS:

1. Update Terraform environment to `production`
2. Enable CloudFront for global distribution
3. Enable WAF for additional security
4. Set up cross-region replication
5. Migrate application from Vercel to AWS ECS

The S3 bucket structure remains the same - only the surrounding infrastructure changes!