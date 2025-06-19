# terraform/modules/document-vault/iam.tf

# Service user for Vercel application
resource "aws_iam_user" "vault_service" {
  name = "${var.project_name}-vault-service-${var.environment}"
  path = "/service/"
  
  tags = merge(local.common_tags, {
    Name    = "${var.project_name} Vault Service User"
    Purpose = "Programmatic access from Vercel"
  })
}

# Access key for service user
resource "aws_iam_access_key" "vault_service" {
  user = aws_iam_user.vault_service.name
}

# Policy for vault operations
resource "aws_iam_policy" "vault_operations" {
  name        = "${var.project_name}-vault-operations-${var.environment}"
  description = "Policy for document vault operations from Vercel"
  path        = "/service/"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ListBucket"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation",
          "s3:GetBucketVersioning",
          "s3:ListBucketVersions",
          "s3:GetBucketCORS"
        ]
        Resource = [
          aws_s3_bucket.vault.arn,
          aws_s3_bucket.processing.arn
        ]
      },
      {
        Sid    = "ReadWriteObjects"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetObjectVersionTagging",
          "s3:GetObjectTagging",
          "s3:PutObject",
          "s3:PutObjectTagging",
          "s3:DeleteObject",
          "s3:DeleteObjectVersion",
          "s3:RestoreObject"
        ]
        Resource = [
          "${aws_s3_bucket.vault.arn}/*",
          "${aws_s3_bucket.processing.arn}/*"
        ]
      },
      {
        Sid    = "KMSOperations"
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey",
          "kms:GenerateDataKeyWithoutPlaintext",
          "kms:DescribeKey"
        ]
        Resource = [
          aws_kms_key.vault.arn,
          aws_kms_key.field_encryption.arn
        ]
      },
      {
        Sid    = "GeneratePresignedUrls"
        Effect = "Allow"
        Action = [
          "s3:GetObjectAcl",
          "s3:GetObjectVersionAcl"
        ]
        Resource = [
          "${aws_s3_bucket.vault.arn}/*"
        ]
      }
    ]
  })
  
  tags = local.common_tags
}

# Attach policy to user
resource "aws_iam_user_policy_attachment" "vault_operations" {
  user       = aws_iam_user.vault_service.name
  policy_arn = aws_iam_policy.vault_operations.arn
}

# Role for Lambda document processor
resource "aws_iam_role" "lambda_processor" {
  name = "${var.project_name}-lambda-processor-${var.environment}"
  path = "/service/"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
  
  tags = merge(local.common_tags, {
    Name    = "${var.project_name} Lambda Processor Role"
    Purpose = "Document processing functions"
  })
}

# Policy for Lambda processor
resource "aws_iam_role_policy" "lambda_processor" {
  name = "document-processing"
  role = aws_iam_role.lambda_processor.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.vault.arn}/*",
          "${aws_s3_bucket.processing.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.vault.arn,
          aws_s3_bucket.processing.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = [
          aws_kms_key.vault.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "textract:DetectDocumentText",
          "textract:AnalyzeDocument",
          "textract:GetDocumentAnalysis"
        ]
        Resource = "*"
      }
    ]
  })
}

# Attach AWS managed policy for Lambda basic execution
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_processor.name
}

# Role for cross-region replication (if enabled)
resource "aws_iam_role" "replication" {
  count = var.enable_cross_region_replication ? 1 : 0
  name  = "${var.project_name}-s3-replication-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
      }
    ]
  })
  
  tags = merge(local.common_tags, {
    Name    = "${var.project_name} S3 Replication Role"
    Purpose = "Cross-region replication"
  })
}

resource "aws_iam_role_policy" "replication" {
  count = var.enable_cross_region_replication ? 1 : 0
  role  = aws_iam_role.replication[0].id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetReplicationConfiguration",
          "s3:ListBucket"
        ]
        Resource = aws_s3_bucket.vault.arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObjectVersionForReplication",
          "s3:GetObjectVersionAcl",
          "s3:GetObjectVersionTagging"
        ]
        Resource = "${aws_s3_bucket.vault.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ReplicateObject",
          "s3:ReplicateDelete",
          "s3:ReplicateTags"
        ]
        Resource = "${aws_s3_bucket.vault_replica[0].arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = aws_kms_key.vault.arn
      },
      {
        Effect = "Allow"
        Action = [
          "kms:GenerateDataKey",
          "kms:CreateGrant"
        ]
        Resource = aws_kms_key.vault_replica[0].arn
      }
    ]
  })
}