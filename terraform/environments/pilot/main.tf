# terraform/environments/pilot/main.tf

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # Backend configuration will be provided via CLI
  backend "s3" {}
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "pilot"
      ManagedBy   = "terraform"
      CostCenter  = "pilot-program"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Document vault module - production-ready security from day one
module "document_vault" {
  source = "../../modules/document-vault"
  
  environment  = "pilot"
  project_name = var.project_name
  
  # CORS configuration for Vercel
  allowed_origins = concat(
    var.allowed_origins,
    [
      "https://${var.project_name}.vercel.app",
      "https://${var.project_name}-*.vercel.app",  # Preview deployments
    ]
  )
  
  # Cost optimizations for pilot
  enable_cloudfront               = false  # Use Vercel's CDN instead
  enable_waf                      = false  # Enable when scaling
  enable_intelligent_tiering      = true   # Automatic cost optimization
  enable_cross_region_replication = false  # Enable for production
  enable_macie                    = false  # Enable for compliance
  
  tags = {
    Phase = "pilot"
  }
}

# Secrets Manager for storing sensitive configuration
resource "aws_secretsmanager_secret" "app_secrets" {
  name_prefix = "${var.project_name}-pilot-secrets-"
  description = "Application secrets for pilot environment"
  
  # Rotation disabled for pilot, enable in production
  rotation_rules {
    automatically_after_days = 0
  }
  
  tags = {
    Name        = "${var.project_name} Pilot Secrets"
    Environment = "pilot"
  }
}

# Store all sensitive values
resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  
  secret_string = jsonencode({
    # AWS Configuration
    aws_access_key_id     = module.document_vault.service_access_key_id
    aws_secret_access_key = module.document_vault.service_secret_access_key
    aws_region           = var.aws_region
    vault_bucket_name    = module.document_vault.vault_bucket_name
    vault_kms_key_id     = module.document_vault.kms_key_id
    
    # Supabase Configuration
    supabase_url         = var.supabase_url
    supabase_anon_key    = var.supabase_anon_key
    supabase_service_key = var.supabase_service_key
    
    # Integration Keys
    plaid_client_id      = var.plaid_client_id
    plaid_secret         = var.plaid_secret
    plaid_env           = var.plaid_env
    google_client_id     = var.google_client_id
    google_client_secret = var.google_client_secret
    
    # Additional integrations (optional)
    coinbase_api_key     = var.coinbase_api_key
    coinbase_api_secret  = var.coinbase_api_secret
    stripe_secret_key    = var.stripe_secret_key
    stripe_webhook_secret = var.stripe_webhook_secret
  })
  
  lifecycle {
    ignore_changes = [secret_string]
  }
}

# CloudWatch Log Group for application logs
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/${var.project_name}/pilot"
  retention_in_days = 7  # Short retention for pilot
  
  tags = {
    Name        = "${var.project_name} Pilot Logs"
    Environment = "pilot"
  }
}

# SNS Topic for alerts (optional)
resource "aws_sns_topic" "alerts" {
  count = var.enable_alerts ? 1 : 0
  
  name_prefix = "${var.project_name}-pilot-alerts-"
  
  tags = {
    Name        = "${var.project_name} Pilot Alerts"
    Environment = "pilot"
  }
}

resource "aws_sns_topic_subscription" "alerts_email" {
  count = var.enable_alerts && var.alert_email != "" ? 1 : 0
  
  topic_arn = aws_sns_topic.alerts[0].arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# Budget alert for cost monitoring
resource "aws_budgets_budget" "pilot" {
  count = var.enable_budget_alert ? 1 : 0
  
  name         = "${var.project_name}-pilot-budget"
  budget_type  = "COST"
  limit_amount = var.budget_limit
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  
  cost_types {
    include_credit             = false
    include_discount           = false
    include_other_subscription = false
    include_recurring          = false
    include_refund            = false
    include_subscription       = true
    include_support           = false
    include_tax               = false
    include_upfront           = false
    use_blended               = false
  }
  
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 80
    threshold_type           = "PERCENTAGE"
    notification_type        = "FORECASTED"
    subscriber_email_addresses = [var.alert_email]
  }
}