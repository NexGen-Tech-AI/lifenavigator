# Development environment variables
variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_master_username" {
  description = "Master username for database"
  type        = string
  default     = "lifenavigator_admin"
}

variable "db_master_password" {
  description = "Master password for database"
  type        = string
  sensitive   = true
  # In production, use AWS Secrets Manager or similar
  # For development, set this via environment variable TF_VAR_db_master_password
}