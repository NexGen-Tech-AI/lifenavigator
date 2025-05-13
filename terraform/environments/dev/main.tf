# Development environment Terraform configuration
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "LifeNavigator"
      Environment = "dev"
      ManagedBy   = "Terraform"
    }
  }
}

# Use local state for dev environment
terraform {
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
  
  required_version = ">= 1.3.0"
}

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  environment = "dev"
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 2) # Use 2 AZs for dev
}

# Security resources
module "security" {
  source = "../../modules/security"
  
  environment        = local.environment
  region             = var.aws_region
  db_master_username = var.db_master_username
  db_master_password = var.db_master_password
}

# Network resources
module "network" {
  source = "../../modules/network"
  
  environment       = local.environment
  vpc_cidr          = var.vpc_cidr
  availability_zones = local.availability_zones
}

# Database resources
module "database" {
  source = "../../modules/database"
  
  environment               = local.environment
  vpc_id                    = module.network.vpc_id
  database_subnet_group_name = module.network.database_subnet_group_name
  database_security_group_id = module.network.database_security_group_id
  db_master_username        = var.db_master_username
  db_master_password        = var.db_master_password
  kms_key_arn               = module.security.database_key_arn
  db_instance_class         = "db.t4g.medium"
}

# Service resources will be added next

# Output the API endpoint and other useful information
output "environment" {
  value = local.environment
}

output "vpc_id" {
  value = module.network.vpc_id
}

output "financial_db_endpoint" {
  value = module.database.financial_db_endpoint
}

output "healthcare_db_endpoint" {
  value = module.database.healthcare_db_endpoint
}

output "career_education_db_endpoint" {
  value = module.database.career_education_db_endpoint
}

output "document_vault_db_endpoint" {
  value = module.database.document_vault_db_endpoint
}