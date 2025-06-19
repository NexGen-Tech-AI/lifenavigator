# terraform/modules/document-vault/s3.tf

# Logging bucket (must be created first)
resource "aws_s3_bucket" "logs" {
  count  = var.enable_access_logging ? 1 : 0
  bucket = local.logs_bucket_name
  
  tags = merge(local.common_tags, {
    Name    = "${var.project_name} S3 Logs"
    Purpose = "Access logging"
  })
}

resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  count  = var.enable_access_logging ? 1 : 0
  bucket = aws_s3_bucket.logs[0].id
  
  rule {
    id     = "expire_old_logs"
    status = "Enabled"
    
    expiration {
      days = 90
    }
    
    filter {}
  }
}

# Primary document vault bucket
resource "aws_s3_bucket" "vault" {
  bucket              = local.vault_bucket_name
  object_lock_enabled = var.enable_object_lock
  
  tags = merge(local.common_tags, {
    Name       = "${var.project_name} Document Vault"
    Compliance = "HIPAA,PCI-DSS,SOC2"
    DataClass  = "Sensitive"
  })
}

# Bucket versioning for compliance and recovery
resource "aws_s3_bucket_versioning" "vault" {
  bucket = aws_s3_bucket.vault.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption with KMS
resource "aws_s3_bucket_server_side_encryption_configuration" "vault" {
  bucket = aws_s3_bucket.vault.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.vault.arn
    }
    bucket_key_enabled = true
  }
}

# Block all public access
resource "aws_s3_bucket_public_access_block" "vault" {
  bucket = aws_s3_bucket.vault.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Access logging
resource "aws_s3_bucket_logging" "vault" {
  count  = var.enable_access_logging ? 1 : 0
  bucket = aws_s3_bucket.vault.id
  
  target_bucket = aws_s3_bucket.logs[0].id
  target_prefix = "vault-access-logs/"
}

# CORS configuration for direct browser uploads
resource "aws_s3_bucket_cors_configuration" "vault" {
  bucket = aws_s3_bucket.vault.id
  
  cors_rule {
    id              = "AllowVercelUploads"
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = [
      "ETag",
      "x-amz-server-side-encryption",
      "x-amz-request-id",
      "x-amz-id-2",
      "x-amz-version-id"
    ]
    max_age_seconds = 3600
  }
}

# Lifecycle rules for cost optimization
resource "aws_s3_bucket_lifecycle_configuration" "vault" {
  bucket = aws_s3_bucket.vault.id
  
  rule {
    id     = "intelligent_tiering"
    status = var.enable_intelligent_tiering ? "Enabled" : "Disabled"
    
    transition {
      storage_class = "INTELLIGENT_TIERING"
    }
    
    filter {}
  }
  
  rule {
    id     = "archive_old_versions"
    status = "Enabled"
    
    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }
    
    noncurrent_version_transition {
      noncurrent_days = 90
      storage_class   = "GLACIER_IR"
    }
    
    noncurrent_version_expiration {
      noncurrent_days = var.retention_days
    }
    
    filter {}
  }
  
  rule {
    id     = "delete_incomplete_multipart"
    status = "Enabled"
    
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
    
    filter {}
  }
}

# S3 bucket for temporary document processing
resource "aws_s3_bucket" "processing" {
  bucket = local.processing_bucket_name
  
  tags = merge(local.common_tags, {
    Name    = "${var.project_name} Document Processing"
    Purpose = "Temporary processing storage"
  })
}

# Encryption for processing bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "processing" {
  bucket = aws_s3_bucket.processing.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.vault.arn
    }
  }
}

# Auto-cleanup for processing bucket
resource "aws_s3_bucket_lifecycle_configuration" "processing" {
  bucket = aws_s3_bucket.processing.id
  
  rule {
    id     = "cleanup_temp_files"
    status = "Enabled"
    
    expiration {
      days = 1
    }
    
    filter {}
  }
}

# Bucket policy for secure access
resource "aws_s3_bucket_policy" "vault" {
  bucket = aws_s3_bucket.vault.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DenyInsecureConnections"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:*"
        Resource = [
          aws_s3_bucket.vault.arn,
          "${aws_s3_bucket.vault.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      },
      {
        Sid    = "DenyUnencryptedObjectUploads"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:PutObject"
        Resource = "${aws_s3_bucket.vault.arn}/*"
        Condition = {
          StringNotEquals = {
            "s3:x-amz-server-side-encryption" = "aws:kms"
          }
        }
      },
      {
        Sid    = "RequireKMSEncryption"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:PutObject"
        Resource = "${aws_s3_bucket.vault.arn}/*"
        Condition = {
          StringNotLikeIfExists = {
            "s3:x-amz-server-side-encryption-aws-kms-key-id" = aws_kms_key.vault.arn
          }
        }
      },
      {
        Sid    = "AllowVercelServiceAccount"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_user.vault_service.arn
        }
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObjectVersion",
          "s3:ListBucket",
          "s3:GetObjectTagging",
          "s3:PutObjectTagging"
        ]
        Resource = [
          aws_s3_bucket.vault.arn,
          "${aws_s3_bucket.vault.arn}/*"
        ]
      }
    ]
  })
}

# Object Lock configuration (if enabled)
resource "aws_s3_bucket_object_lock_configuration" "vault" {
  count  = var.enable_object_lock ? 1 : 0
  bucket = aws_s3_bucket.vault.id
  
  rule {
    default_retention {
      mode = "GOVERNANCE"
      days = 7
    }
  }
}