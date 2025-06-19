# terraform/modules/document-vault/main.tf

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Random suffix for unique naming
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# Local variables
locals {
  common_tags = merge(
    {
      Module      = "document-vault"
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    },
    var.tags
  )
  
  vault_bucket_name      = "${var.project_name}-vault-${var.environment}-${random_string.suffix.result}"
  processing_bucket_name = "${var.project_name}-processing-${var.environment}-${random_string.suffix.result}"
  logs_bucket_name       = "${var.project_name}-logs-${var.environment}-${random_string.suffix.result}"
}