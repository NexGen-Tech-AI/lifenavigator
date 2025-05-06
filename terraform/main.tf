terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.37.0"
    }
  }
  
  # Configure remote backend for state management
  backend "s3" {
    bucket         = "lifenavigator-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "lifenavigator-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "LifeNavigator"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Create VPC for the application
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.5.2"

  name = "lifenavigator-vpc-${var.environment}"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway     = true
  single_nat_gateway     = var.environment != "production"
  one_nat_gateway_per_az = var.environment == "production"
  enable_vpn_gateway     = false

  enable_dns_hostnames = true
  enable_dns_support   = true
}

# RDS PostgreSQL for primary database
module "db" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.5.6"

  identifier = "lifenavigator-${var.environment}"

  engine               = "postgres"
  engine_version       = "16.1"
  family               = "postgres16"
  major_engine_version = "16"
  instance_class       = var.rds_instance_type

  allocated_storage     = var.environment == "production" ? 100 : 20
  max_allocated_storage = var.environment == "production" ? 1000 : 100

  db_name  = "lifenavigator"
  username = "lifenavigator_app"
  port     = 5432

  # Use secrets manager for password
  manage_master_user_password = true
  master_user_secret_kms_key_id = aws_kms_key.rds.key_id

  multi_az               = var.environment == "production"
  db_subnet_group_name   = module.vpc.database_subnet_group
  vpc_security_group_ids = [module.security_group_rds.security_group_id]

  maintenance_window              = "Mon:00:00-Mon:03:00"
  backup_window                   = "03:00-06:00"
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  create_cloudwatch_log_group     = true

  backup_retention_period = var.environment == "production" ? 30 : 7
  skip_final_snapshot     = var.environment != "production"
  deletion_protection     = var.environment == "production"

  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  create_monitoring_role                = true
  monitoring_interval                   = 60
  monitoring_role_name                  = "lifenavigator-${var.environment}-rds-monitoring"

  parameters = [
    {
      name  = "autovacuum"
      value = 1
    },
    {
      name  = "client_encoding"
      value = "utf8"
    },
    {
      name  = "shared_preload_libraries"
      value = "pg_stat_statements,pgaudit,pg_cron"
    },
    {
      name  = "pg_stat_statements.track"
      value = "all"
    },
    {
      name  = "pgaudit.log"
      value = "all"
    }
  ]
}

# KMS key for RDS encryption
resource "aws_kms_key" "rds" {
  description             = "KMS key for RDS encryption"
  deletion_window_in_days = 10
  enable_key_rotation     = true
}

# Security group for RDS
module "security_group_rds" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.1.2"

  name        = "lifenavigator-${var.environment}-rds-sg"
  description = "Security group for PostgreSQL RDS"
  vpc_id      = module.vpc.vpc_id

  # Allow PostgreSQL traffic from the app servers
  ingress_with_source_security_group_id = [
    {
      rule                     = "postgresql-tcp"
      source_security_group_id = module.security_group_app.security_group_id
    }
  ]

  egress_rules = ["all-all"]
}

# Security group for application servers
module "security_group_app" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.1.2"

  name        = "lifenavigator-${var.environment}-app-sg"
  description = "Security group for application servers"
  vpc_id      = module.vpc.vpc_id

  ingress_cidr_blocks = ["0.0.0.0/0"]
  ingress_rules       = ["http-80-tcp", "https-443-tcp"]
  egress_rules        = ["all-all"]
}

# ECS for containerized application
module "ecs" {
  source  = "terraform-aws-modules/ecs/aws"
  version = "~> 5.9.1"

  cluster_name = "lifenavigator-${var.environment}"

  cluster_configuration = {
    execute_command_configuration = {
      logging = "OVERRIDE"
      log_configuration = {
        cloud_watch_log_group_name = "/ecs/lifenavigator-${var.environment}"
      }
    }
  }

  fargate_capacity_providers = {
    FARGATE = {
      default_capacity_provider_strategy = {
        weight = 1
      }
    }
    FARGATE_SPOT = {
      default_capacity_provider_strategy = {
        weight = var.environment == "production" ? 0 : 1
      }
    }
  }
}

# S3 bucket for static assets
resource "aws_s3_bucket" "static_assets" {
  bucket = "lifenavigator-${var.environment}-static"
}

resource "aws_s3_bucket_public_access_block" "static_assets" {
  bucket = aws_s3_bucket.static_assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront distribution for static assets
module "cloudfront" {
  source  = "terraform-aws-modules/cloudfront/aws"
  version = "~> 3.2.3"

  comment             = "LifeNavigator ${var.environment} static assets"
  enabled             = true
  is_ipv6_enabled     = true
  price_class         = "PriceClass_100"
  retain_on_delete    = false
  wait_for_deployment = false

  create_origin_access_identity = true
  origin_access_identities = {
    static_bucket = "LifeNavigator ${var.environment} OAI"
  }

  origin = {
    s3_bucket = {
      domain_name = aws_s3_bucket.static_assets.bucket_regional_domain_name
      s3_origin_config = {
        origin_access_identity = "static_bucket"
      }
    }
  }

  default_cache_behavior = {
    target_origin_id       = "s3_bucket"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]
    compress        = true
    query_string    = true
  }

  viewer_certificate = {
    cloudfront_default_certificate = true
  }
}

# IAM role for ECS tasks
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "lifenavigator-${var.environment}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Secrets Manager for application secrets
resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "lifenavigator/${var.environment}/app"
  description = "LifeNavigator application secrets"
  kms_key_id  = aws_kms_key.secrets.key_id
}

# KMS key for Secrets Manager
resource "aws_kms_key" "secrets" {
  description             = "KMS key for Secrets Manager encryption"
  deletion_window_in_days = 10
  enable_key_rotation     = true
}

# ECR repository for application container images
resource "aws_ecr_repository" "app" {
  name                 = "lifenavigator-${var.environment}-app"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# CloudWatch log group for application logs
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/lifenavigator-${var.environment}-app"
  retention_in_days = var.environment == "production" ? 30 : 7
}

# Load balancer for the application
module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 9.5.1"

  name = "lifenavigator-${var.environment}-alb"

  load_balancer_type = "application"

  vpc_id          = module.vpc.vpc_id
  subnets         = module.vpc.public_subnets
  security_groups = [module.security_group_alb.security_group_id]

  http_tcp_listeners = [
    {
      port               = 80
      protocol           = "HTTP"
      target_group_index = 0
    }
  ]

  target_groups = [
    {
      name             = "lifenavigator-${var.environment}-tg"
      backend_protocol = "HTTP"
      backend_port     = 3000
      target_type      = "ip"
      health_check = {
        enabled             = true
        interval            = 30
        path                = "/api/health"
        port                = "traffic-port"
        healthy_threshold   = 3
        unhealthy_threshold = 3
        timeout             = 6
        protocol            = "HTTP"
        matcher             = "200-399"
      }
    }
  ]
}

# Security group for the ALB
module "security_group_alb" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.1.2"

  name        = "lifenavigator-${var.environment}-alb-sg"
  description = "Security group for the application load balancer"
  vpc_id      = module.vpc.vpc_id

  ingress_cidr_blocks = ["0.0.0.0/0"]
  ingress_rules       = ["http-80-tcp", "https-443-tcp"]
  egress_rules        = ["all-all"]
}

# Route53 zone for the domain
data "aws_route53_zone" "primary" {
  count = var.domain != "" ? 1 : 0
  name  = var.domain
}

# Route53 record for the application
resource "aws_route53_record" "app" {
  count   = var.domain != "" ? 1 : 0
  zone_id = data.aws_route53_zone.primary[0].zone_id
  name    = "${var.environment == "production" ? "" : "${var.environment}."}${var.domain}"
  type    = "A"

  alias {
    name                   = module.alb.lb_dns_name
    zone_id                = module.alb.lb_zone_id
    evaluate_target_health = true
  }
}