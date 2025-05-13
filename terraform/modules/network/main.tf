# Network module - VPC, subnets, security groups
variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "5.1.1"
  
  name = "lifenavigator-${var.environment}-vpc"
  cidr = var.vpc_cidr
  
  # Create subnets across AZs for high availability
  azs             = var.availability_zones
  private_subnets = [for i, az in var.availability_zones : cidrsubnet(var.vpc_cidr, 8, i)]
  public_subnets  = [for i, az in var.availability_zones : cidrsubnet(var.vpc_cidr, 8, i + length(var.availability_zones))]
  database_subnets = [for i, az in var.availability_zones : cidrsubnet(var.vpc_cidr, 8, i + 2*length(var.availability_zones))]
  
  # NAT Gateway in each AZ for fault tolerance
  enable_nat_gateway = true
  single_nat_gateway = var.environment != "prod"
  
  # Enable VPC endpoints for enhanced security
  enable_s3_endpoint = true
  enable_dynamodb_endpoint = true
  
  # Advanced networking features
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  # Create a dedicated subnet group for RDS instances
  create_database_subnet_group = true
  create_database_subnet_route_table = true
  
  # Flow logs for network monitoring and security analysis
  enable_flow_log = true
  flow_log_destination_type = "cloud-watch-logs"
  
  tags = {
    Environment = var.environment
    Project     = "lifenavigator"
    ManagedBy   = "Terraform"
  }
}

# Security groups
resource "aws_security_group" "database_sg" {
  name        = "database-security-group-${var.environment}"
  description = "Security group for RDS instances"
  vpc_id      = module.vpc.vpc_id
  
  # No direct ingress from internet - only from application tier
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
    description     = "PostgreSQL access from application services"
  }
  
  # No direct egress to internet
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
    description = "Allow all outbound traffic within VPC only"
  }
  
  tags = {
    Name = "lifenavigator-${var.environment}-db-sg"
    Environment = var.environment
  }
}

# Application tier security group
resource "aws_security_group" "app_sg" {
  name        = "application-security-group-${var.environment}"
  description = "Security group for application services"
  vpc_id      = module.vpc.vpc_id
  
  # Allow inbound only from load balancer
  ingress {
    from_port       = 8000
    to_port         = 8080 
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
    description     = "API access from load balancer"
  }
  
  # Restricted outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
  
  tags = {
    Name = "lifenavigator-${var.environment}-app-sg"
    Environment = var.environment
  }
}

# Load balancer security group
resource "aws_security_group" "alb_sg" {
  name        = "alb-security-group-${var.environment}"
  description = "Security group for application load balancer"
  vpc_id      = module.vpc.vpc_id
  
  # Allow HTTPS inbound only
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS from internet"
  }
  
  # HTTP for redirect only
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP from internet (for redirect)"
  }
  
  # Outbound to application tier only
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
  
  tags = {
    Name = "lifenavigator-${var.environment}-alb-sg"
    Environment = var.environment
  }
}

# Document Vault security group
resource "aws_security_group" "document_vault_sg" {
  name        = "document-vault-security-group-${var.environment}"
  description = "Security group for Document Vault service"
  vpc_id      = module.vpc.vpc_id
  
  # Allow inbound only from application tier
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
    description     = "Access from application services"
  }
  
  # Restricted outbound to database and S3 VPC endpoints
  egress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.database_sg.id]
    description     = "PostgreSQL access"
  }
  
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS egress"
  }
  
  tags = {
    Name = "lifenavigator-${var.environment}-document-vault-sg"
    Environment = var.environment
  }
}

# Outputs
output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "List of IDs of private subnets"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "List of IDs of public subnets"
  value       = module.vpc.public_subnets
}

output "database_subnets" {
  description = "List of IDs of database subnets"
  value       = module.vpc.database_subnets
}

output "database_subnet_group_name" {
  description = "Name of database subnet group"
  value       = module.vpc.database_subnet_group
}

output "database_security_group_id" {
  description = "ID of database security group"
  value       = aws_security_group.database_sg.id
}

output "app_security_group_id" {
  description = "ID of application security group"
  value       = aws_security_group.app_sg.id
}

output "alb_security_group_id" {
  description = "ID of ALB security group"
  value       = aws_security_group.alb_sg.id
}

output "document_vault_security_group_id" {
  description = "ID of document vault security group"
  value       = aws_security_group.document_vault_sg.id
}