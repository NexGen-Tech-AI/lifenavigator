# terraform/environments/pilot/variables.tf

# AWS Configuration
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "life-navigator"
}

# Vercel Configuration
variable "allowed_origins" {
  description = "Additional allowed CORS origins"
  type        = list(string)
  default     = [
    "http://localhost:3000",
    "http://localhost:3001"
  ]
}

# Supabase Configuration
variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
  sensitive   = true
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "supabase_service_key" {
  description = "Supabase service role key"
  type        = string
  sensitive   = true
}

# Plaid Configuration
variable "plaid_client_id" {
  description = "Plaid client ID"
  type        = string
  sensitive   = true
}

variable "plaid_secret" {
  description = "Plaid secret key"
  type        = string
  sensitive   = true
}

variable "plaid_env" {
  description = "Plaid environment"
  type        = string
  default     = "sandbox"
  
  validation {
    condition     = contains(["sandbox", "development", "production"], var.plaid_env)
    error_message = "Plaid environment must be sandbox, development, or production."
  }
}

# Google OAuth Configuration
variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
  sensitive   = true
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
  default     = ""
}

# Optional Integration Configuration
variable "coinbase_api_key" {
  description = "Coinbase API key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "coinbase_api_secret" {
  description = "Coinbase API secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "stripe_secret_key" {
  description = "Stripe secret key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook secret"
  type        = string
  sensitive   = true
  default     = ""
}

# Monitoring Configuration
variable "enable_alerts" {
  description = "Enable SNS alerts"
  type        = bool
  default     = false
}

variable "alert_email" {
  description = "Email address for alerts"
  type        = string
  default     = ""
}

variable "enable_budget_alert" {
  description = "Enable AWS budget alerts"
  type        = bool
  default     = true
}

variable "budget_limit" {
  description = "Monthly budget limit in USD"
  type        = string
  default     = "100"
}