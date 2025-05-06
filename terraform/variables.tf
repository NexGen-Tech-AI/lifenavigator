variable "aws_region" {
  description = "The AWS region to create resources in"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "The deployment environment (e.g., dev, staging, production)"
  type        = string
  default     = "dev"
}

variable "rds_instance_type" {
  description = "The instance type for the RDS database"
  type        = string
  default     = "db.t4g.small"
}

variable "domain" {
  description = "The domain name for the application"
  type        = string
  default     = ""
}

variable "app_container_image" {
  description = "The container image to use for the application"
  type        = string
  default     = "latest"
}

variable "app_container_port" {
  description = "The port the application listens on"
  type        = number
  default     = 3000
}

variable "app_container_cpu" {
  description = "The CPU units for the application container"
  type        = number
  default     = 256
}

variable "app_container_memory" {
  description = "The memory for the application container"
  type        = number
  default     = 512
}

variable "app_desired_count" {
  description = "The desired number of application containers"
  type        = number
  default     = 2
}

variable "app_min_count" {
  description = "The minimum number of application containers"
  type        = number
  default     = 1
}

variable "app_max_count" {
  description = "The maximum number of application containers"
  type        = number
  default     = 4
}

variable "enable_autoscaling" {
  description = "Whether to enable autoscaling for the application"
  type        = bool
  default     = true
}

variable "enable_waf" {
  description = "Whether to enable WAF for the application"
  type        = bool
  default     = true
}

variable "enable_monitoring" {
  description = "Whether to enable CloudWatch monitoring for the application"
  type        = bool
  default     = true
}

variable "enable_alarms" {
  description = "Whether to enable CloudWatch alarms for the application"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "The number of days to retain backups for"
  type        = number
  default     = 7
}

variable "ssl_cert_arn" {
  description = "The ARN of the SSL certificate to use for the load balancer"
  type        = string
  default     = ""
}

variable "vpc_cidr" {
  description = "The CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}