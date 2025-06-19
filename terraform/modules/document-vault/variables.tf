# terraform/modules/document-vault/variables.tf

variable "environment" {
  description = "Environment name (pilot, production)"
  type        = string
  
  validation {
    condition     = contains(["pilot", "production", "staging"], var.environment)
    error_message = "Environment must be pilot, production, or staging."
  }
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "life-navigator"
}

variable "allowed_origins" {
  description = "Allowed CORS origins for S3 bucket"
  type        = list(string)
  
  validation {
    condition     = length(var.allowed_origins) > 0
    error_message = "At least one allowed origin must be specified."
  }
}

variable "enable_cloudfront" {
  description = "Enable CloudFront distribution for global content delivery"
  type        = bool
  default     = false
}

variable "enable_waf" {
  description = "Enable AWS WAF for additional security"
  type        = bool
  default     = false
}

variable "enable_intelligent_tiering" {
  description = "Enable S3 Intelligent Tiering for cost optimization"
  type        = bool
  default     = true
}

variable "enable_cross_region_replication" {
  description = "Enable cross-region replication for disaster recovery"
  type        = bool
  default     = false
}

variable "replication_region" {
  description = "AWS region for cross-region replication"
  type        = string
  default     = "us-west-2"
}

variable "enable_object_lock" {
  description = "Enable S3 Object Lock for compliance"
  type        = bool
  default     = false
}

variable "enable_macie" {
  description = "Enable AWS Macie for data discovery and protection"
  type        = bool
  default     = false
}

variable "retention_days" {
  description = "Default retention period in days for objects"
  type        = number
  default     = 2555 # 7 years for financial compliance
}

variable "enable_access_logging" {
  description = "Enable S3 access logging"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}