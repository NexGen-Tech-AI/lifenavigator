# Security module - KMS keys, secrets, WAF

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "db_master_username" {
  description = "Database master username"
  type        = string
  default     = "lifenavigator_admin"
}

variable "db_master_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

data "aws_caller_identity" "current" {}

# Master key for managing other keys
resource "aws_kms_key" "master_key" {
  description             = "Master key for managing other encryption keys"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  is_enabled              = true
  key_usage               = "ENCRYPT_DECRYPT"
  multi_region            = true
  
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid = "Enable IAM User Permissions",
        Effect = "Allow",
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        },
        Action = "kms:*",
        Resource = "*"
      }
    ]
  })
  
  tags = {
    Name = "lifenavigator-${var.environment}-master-key"
    Purpose = "key-management"
    Environment = var.environment
  }
}

# Alias for the master key
resource "aws_kms_alias" "master_key" {
  name          = "alias/lifenavigator-${var.environment}-master-key"
  target_key_id = aws_kms_key.master_key.key_id
}

# Document Vault encryption key with strict access controls
resource "aws_kms_key" "document_vault_key" {
  description             = "Key for encrypting Document Vault data"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  is_enabled              = true
  key_usage               = "ENCRYPT_DECRYPT"
  
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid = "Enable IAM User Permissions",
        Effect = "Allow",
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        },
        Action = "kms:*",
        Resource = "*"
      },
      {
        Sid = "Deny key deletion",
        Effect = "Deny",
        Principal = {
          AWS = "*"
        },
        Action = [
          "kms:ScheduleKeyDeletion",
          "kms:DeleteCustomKeyStore"
        ],
        Resource = "*"
      }
    ]
  })
  
  tags = {
    Name = "lifenavigator-${var.environment}-document-vault-key"
    Purpose = "document-encryption"
    Environment = var.environment
  }
}

# Alias for document vault key
resource "aws_kms_alias" "document_vault_key" {
  name          = "alias/lifenavigator-${var.environment}-document-vault-key"
  target_key_id = aws_kms_key.document_vault_key.key_id
}

# Database encryption key
resource "aws_kms_key" "database_key" {
  description             = "Key for RDS database encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  is_enabled              = true
  key_usage               = "ENCRYPT_DECRYPT"
  
  tags = {
    Name = "lifenavigator-${var.environment}-database-key"
    Purpose = "database-encryption"
    Environment = var.environment
  }
}

# Alias for database key
resource "aws_kms_alias" "database_key" {
  name          = "alias/lifenavigator-${var.environment}-database-key"
  target_key_id = aws_kms_key.database_key.key_id
}

# CloudWatch Logs encryption key
resource "aws_kms_key" "logs_key" {
  description             = "Key for CloudWatch Logs encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  is_enabled              = true
  key_usage               = "ENCRYPT_DECRYPT"
  
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "logs.${var.region}.amazonaws.com"
        },
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ],
        Resource = "*",
        Condition = {
          ArnLike = {
            "kms:EncryptionContext:aws:logs:arn": "arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:*"
          }
        }
      },
      {
        Effect = "Allow",
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        },
        Action = "kms:*",
        Resource = "*"
      }
    ]
  })
  
  tags = {
    Name = "lifenavigator-${var.environment}-logs-key"
    Purpose = "logs-encryption"
    Environment = var.environment
  }
}

# Alias for logs key
resource "aws_kms_alias" "logs_key" {
  name          = "alias/lifenavigator-${var.environment}-logs-key"
  target_key_id = aws_kms_key.logs_key.key_id
}

# JWT Secret
resource "aws_secretsmanager_secret" "jwt_secret" {
  name        = "lifenavigator/${var.environment}/jwt-secret"
  description = "JWT Secret for authentication"
  kms_key_id  = aws_kms_key.master_key.arn
  
  recovery_window_in_days = 7
  
  tags = {
    Name = "lifenavigator-${var.environment}-jwt-secret"
    Environment = var.environment
  }
}

# Generate a random JWT secret
resource "random_password" "jwt_secret" {
  length           = 64
  special          = true
  override_special = "!@#$%^&*()_+"
}

# Store JWT secret value
resource "aws_secretsmanager_secret_version" "jwt_secret_value" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt_secret.result
}

# Database password
resource "aws_secretsmanager_secret" "db_password" {
  name        = "lifenavigator/${var.environment}/db-password"
  description = "PostgreSQL database master password"
  kms_key_id  = aws_kms_key.master_key.arn
  
  recovery_window_in_days = 7
  
  tags = {
    Name = "lifenavigator-${var.environment}-db-password"
    Environment = var.environment
  }
}

# Use the password from variables
resource "aws_secretsmanager_secret_version" "db_password_value" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_master_password
}

# WAF Web ACL for API Protection
resource "aws_wafv2_web_acl" "api_protection" {
  name        = "lifenavigator-api-protection-${var.environment}"
  description = "WAF ACL for API protection"
  scope       = "REGIONAL"
  
  default_action {
    allow {}
  }
  
  # AWS Managed Core ruleset (OWASP Top 10)
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 10
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-AWSManagedRulesCommonRuleSet"
      sampled_requests_enabled   = true
    }
  }
  
  # SQL Injection Protection
  rule {
    name     = "AWS-AWSManagedRulesSQLiRuleSet"
    priority = 20
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWS-AWSManagedRulesSQLiRuleSet"
      sampled_requests_enabled   = true
    }
  }
  
  # Rate Limiting Rule
  rule {
    name     = "RateLimitRule"
    priority = 40
    
    action {
      block {}
    }
    
    statement {
      rate_based_statement {
        limit              = 1000
        aggregate_key_type = "IP"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRule"
      sampled_requests_enabled   = true
    }
  }
  
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "lifenavigator-api-protection"
    sampled_requests_enabled   = true
  }
  
  tags = {
    Name = "lifenavigator-${var.environment}-api-protection"
    Environment = var.environment
  }
}

# Outputs
output "master_key_arn" {
  description = "ARN of the master KMS key"
  value       = aws_kms_key.master_key.arn
}

output "document_vault_key_arn" {
  description = "ARN of the document vault KMS key"
  value       = aws_kms_key.document_vault_key.arn
}

output "database_key_arn" {
  description = "ARN of the database KMS key"
  value       = aws_kms_key.database_key.arn
}

output "logs_key_arn" {
  description = "ARN of the logs KMS key"
  value       = aws_kms_key.logs_key.arn
}

output "jwt_secret_arn" {
  description = "ARN of the JWT secret"
  value       = aws_secretsmanager_secret.jwt_secret.arn
}

output "db_password_arn" {
  description = "ARN of the database password secret"
  value       = aws_secretsmanager_secret.db_password.arn
}

output "waf_web_acl_arn" {
  description = "ARN of the WAF Web ACL"
  value       = aws_wafv2_web_acl.api_protection.arn
}