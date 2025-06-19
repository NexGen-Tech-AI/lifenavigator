# terraform/modules/document-vault/outputs.tf

# S3 Bucket outputs
output "vault_bucket_name" {
  value       = aws_s3_bucket.vault.id
  description = "Name of the document vault S3 bucket"
}

output "vault_bucket_arn" {
  value       = aws_s3_bucket.vault.arn
  description = "ARN of the document vault S3 bucket"
}

output "vault_bucket_region" {
  value       = aws_s3_bucket.vault.region
  description = "Region of the document vault S3 bucket"
}

output "processing_bucket_name" {
  value       = aws_s3_bucket.processing.id
  description = "Name of the document processing S3 bucket"
}

# KMS outputs
output "kms_key_id" {
  value       = aws_kms_key.vault.id
  description = "ID of the KMS key for document encryption"
}

output "kms_key_arn" {
  value       = aws_kms_key.vault.arn
  description = "ARN of the KMS key for document encryption"
}

output "kms_key_alias" {
  value       = aws_kms_alias.vault.name
  description = "Alias of the KMS key"
}

output "field_encryption_key_id" {
  value       = aws_kms_key.field_encryption.id
  description = "ID of the KMS key for field-level encryption"
}

# IAM outputs
output "service_user_arn" {
  value       = aws_iam_user.vault_service.arn
  description = "ARN of the service user for programmatic access"
}

output "service_user_name" {
  value       = aws_iam_user.vault_service.name
  description = "Name of the service user"
}

output "service_access_key_id" {
  value       = aws_iam_access_key.vault_service.id
  description = "Access key ID for the service user"
  sensitive   = true
}

output "service_secret_access_key" {
  value       = aws_iam_access_key.vault_service.secret
  description = "Secret access key for the service user"
  sensitive   = true
}

output "lambda_processor_role_arn" {
  value       = aws_iam_role.lambda_processor.arn
  description = "ARN of the Lambda processor role"
}

output "lambda_processor_role_name" {
  value       = aws_iam_role.lambda_processor.name
  description = "Name of the Lambda processor role"
}

# Environment configuration for application
output "environment_config" {
  value = {
    AWS_REGION                = data.aws_region.current.name
    AWS_VAULT_BUCKET         = aws_s3_bucket.vault.id
    AWS_PROCESSING_BUCKET    = aws_s3_bucket.processing.id
    AWS_KMS_KEY_ID          = aws_kms_key.vault.id
    AWS_FIELD_ENCRYPTION_KEY_ID = aws_kms_key.field_encryption.id
  }
  description = "Environment variables for application configuration"
}

# Pre-signed URL configuration
output "presigned_url_config" {
  value = {
    upload_expiry   = 3600  # 1 hour
    download_expiry = 900   # 15 minutes
    allowed_content_types = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
  }
  description = "Configuration for pre-signed URLs"
}