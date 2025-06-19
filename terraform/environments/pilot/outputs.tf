# terraform/environments/pilot/outputs.tf

# S3 Configuration
output "vault_bucket_name" {
  value       = module.document_vault.vault_bucket_name
  description = "Name of the document vault S3 bucket"
}

output "vault_bucket_region" {
  value       = module.document_vault.vault_bucket_region
  description = "Region of the document vault S3 bucket"
}

# Secrets Manager
output "secrets_manager_arn" {
  value       = aws_secretsmanager_secret.app_secrets.arn
  description = "ARN of the Secrets Manager secret containing app configuration"
}

output "secrets_manager_name" {
  value       = aws_secretsmanager_secret.app_secrets.name
  description = "Name of the Secrets Manager secret"
}

# Environment Variables for Vercel
output "vercel_environment_variables" {
  value = {
    # Public variables (safe to expose)
    NEXT_PUBLIC_AWS_REGION        = var.aws_region
    NEXT_PUBLIC_VAULT_BUCKET      = module.document_vault.vault_bucket_name
    NEXT_PUBLIC_ENVIRONMENT       = "pilot"
    
    # Sensitive variables (add manually to Vercel)
    # AWS_ACCESS_KEY_ID           = "Add from Secrets Manager"
    # AWS_SECRET_ACCESS_KEY       = "Add from Secrets Manager"
    # AWS_KMS_KEY_ID              = "Add from Secrets Manager"
  }
  description = "Environment variables to configure in Vercel"
}

# AWS CLI Commands
output "setup_commands" {
  value = {
    get_secrets = "aws secretsmanager get-secret-value --secret-id ${aws_secretsmanager_secret.app_secrets.name} --region ${var.aws_region} | jq -r '.SecretString' | jq"
    test_s3_access = "aws s3 ls s3://${module.document_vault.vault_bucket_name}/ --region ${var.aws_region}"
    create_test_file = "echo 'test' | aws s3 cp - s3://${module.document_vault.vault_bucket_name}/test.txt --region ${var.aws_region} --sse aws:kms --sse-kms-key-id ${module.document_vault.kms_key_id}"
  }
  description = "Useful AWS CLI commands for testing"
}

# Integration endpoints
output "integration_config" {
  value = {
    plaid_env = var.plaid_env
    supabase_url = var.supabase_url
    document_processor_role = module.document_vault.lambda_processor_role_arn
  }
  description = "Configuration for external integrations"
  sensitive   = true
}

# Cost tracking
output "monthly_budget" {
  value       = var.enable_budget_alert ? var.budget_limit : "Not configured"
  description = "Monthly AWS budget limit"
}

# Next steps
output "next_steps" {
  value = [
    "1. Copy the sensitive values from Secrets Manager to Vercel environment variables",
    "2. Configure CORS settings in Vercel if needed",
    "3. Test S3 upload/download from your application",
    "4. Set up CloudWatch alarms for monitoring",
    "5. Configure backup strategy for critical documents"
  ]
  description = "Recommended next steps after deployment"
}