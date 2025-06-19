# terraform/modules/document-vault/kms.tf

# Master encryption key for document vault
resource "aws_kms_key" "vault" {
  description             = "${var.project_name} Document Vault Encryption Key - ${var.environment}"
  deletion_window_in_days = var.environment == "production" ? 30 : 7
  enable_key_rotation     = true
  multi_region           = var.enable_cross_region_replication
  
  tags = merge(local.common_tags, {
    Name    = "${var.project_name}-vault-key-${var.environment}"
    Purpose = "Document encryption"
  })
}

# Human-readable alias for the key
resource "aws_kms_alias" "vault" {
  name          = "alias/${var.project_name}-vault-${var.environment}"
  target_key_id = aws_kms_key.vault.key_id
}

# Key policy allowing necessary services
resource "aws_kms_key_policy" "vault" {
  key_id = aws_kms_key.vault.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Id      = "vault-key-policy"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow S3 to use the key"
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey",
          "kms:CreateGrant",
          "kms:DescribeKey"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "kms:ViaService" = [
              "s3.${data.aws_region.current.name}.amazonaws.com"
            ]
          }
        }
      },
      {
        Sid    = "Allow CloudFront to use the key"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = "*"
      },
      {
        Sid    = "Allow Lambda to use the key"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = "*"
      },
      {
        Sid    = "Allow Vercel service account"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_user.vault_service.arn
        }
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey",
          "kms:DescribeKey"
        ]
        Resource = "*"
      }
    ]
  })
}

# Additional key for field-level encryption
resource "aws_kms_key" "field_encryption" {
  description             = "${var.project_name} Field-level Encryption Key - ${var.environment}"
  deletion_window_in_days = var.environment == "production" ? 30 : 7
  enable_key_rotation     = true
  
  tags = merge(local.common_tags, {
    Name    = "${var.project_name}-field-key-${var.environment}"
    Purpose = "Field-level encryption"
  })
}

resource "aws_kms_alias" "field_encryption" {
  name          = "alias/${var.project_name}-field-${var.environment}"
  target_key_id = aws_kms_key.field_encryption.key_id
}