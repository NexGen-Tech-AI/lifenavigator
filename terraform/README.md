# LifeNavigator Infrastructure as Code

## Overview

This Terraform configuration supports a two-phase deployment strategy:

1. **Pilot Phase**: Vercel (Frontend) + Supabase (Database/Auth) + AWS S3 (Document Vault)
2. **Production Phase**: Full AWS deployment with ECS, RDS, CloudFront, etc.

The document vault (S3) is production-ready from day one and remains unchanged during migration.

## Architecture Phases

### Pilot Architecture (Current)
```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│   Vercel    │────▶│   Supabase   │     │   AWS S3       │
│  (Next.js)  │     │  (Database)  │     │ (Documents)    │
└─────────────┘     └──────────────┘     └────────────────┘
       │                                          │
       └──────────────────────────────────────────┘
                     Direct S3 Access
```

### Production Architecture (Future)
```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│ CloudFront  │────▶│   AWS ECS    │────▶│   AWS RDS      │
│    (CDN)    │     │  (Next.js)   │     │  + Supabase    │
└─────────────┘     └──────────────┘     └────────────────┘
       │                                          │
       └──────────────────────────────────────────┘
                     ┌────────────────┐
                     │   AWS S3       │
                     │ (Documents)    │
                     └────────────────┘
```

## Quick Start

### Prerequisites
- AWS CLI configured with credentials
- Terraform >= 1.5.0
- Supabase project created
- Vercel project created

### Step 1: Initialize State Backend
```bash
cd terraform/global/state-bucket
terraform init
terraform apply
```

### Step 2: Deploy Pilot Infrastructure
```bash
cd terraform/environments/pilot
./scripts/init-pilot.sh
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform plan
terraform apply
```

### Step 3: Configure Vercel
Add these environment variables to your Vercel project:
```bash
# From terraform output
terraform output -json | jq -r '.environment_variables.value'
```

## Directory Structure
```
terraform/
├── environments/
│   ├── pilot/          # Current deployment
│   └── production/     # Future full AWS
├── modules/
│   ├── document-vault/ # S3 + KMS (shared)
│   └── full-aws-stack/ # ECS, RDS, etc (future)
├── global/
│   └── state-bucket/   # Terraform state
└── scripts/
    └── init-*.sh       # Setup scripts
```

## Security Features

- **Encryption**: AES-256-GCM at rest, TLS 1.3 in transit
- **Access Control**: IAM policies, S3 bucket policies
- **Compliance**: HIPAA, PCI-DSS, SOC2 ready
- **Monitoring**: CloudWatch, AWS GuardDuty ready

## Cost Optimization

### Pilot Phase (~$50-200/month)
- S3 Intelligent Tiering
- No CloudFront (use Vercel CDN)
- Minimal AWS services

### Production Phase
- Reserved Instances for ECS
- S3 lifecycle policies
- CloudFront caching
- Auto-scaling policies

## Migration Path

When ready to migrate from pilot to production:

1. Run production terraform
2. Export data from Supabase
3. Import to AWS RDS
4. Update DNS records
5. Gradually shift traffic

See `docs/MIGRATION_GUIDE.md` for detailed steps.