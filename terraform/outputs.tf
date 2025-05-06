output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_public_subnets" {
  description = "The IDs of the public subnets"
  value       = module.vpc.public_subnets
}

output "vpc_private_subnets" {
  description = "The IDs of the private subnets"
  value       = module.vpc.private_subnets
}

output "rds_endpoint" {
  description = "The endpoint of the RDS instance"
  value       = module.db.db_instance_endpoint
}

output "rds_port" {
  description = "The port of the RDS instance"
  value       = module.db.db_instance_port
}

output "rds_username" {
  description = "The username for the RDS instance"
  value       = module.db.db_instance_username
}

output "rds_secret_arn" {
  description = "The ARN of the secret for the RDS instance password"
  value       = module.db.db_instance_master_user_secret_arn
}

output "ecr_repository_url" {
  description = "The URL of the ECR repository"
  value       = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  description = "The name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_cluster_id" {
  description = "The ID of the ECS cluster"
  value       = module.ecs.cluster_id
}

output "alb_dns_name" {
  description = "The DNS name of the load balancer"
  value       = module.alb.lb_dns_name
}

output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution"
  value       = module.cloudfront.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution"
  value       = module.cloudfront.cloudfront_distribution_domain_name
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket"
  value       = aws_s3_bucket.static_assets.bucket
}

output "app_url" {
  description = "The URL of the application"
  value       = var.domain != "" ? "https://${var.environment == "production" ? "" : "${var.environment}."}${var.domain}" : module.alb.lb_dns_name
}

output "app_secrets_arn" {
  description = "The ARN of the application secrets"
  value       = aws_secretsmanager_secret.app_secrets.arn
}

output "log_group_name" {
  description = "The name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.app.name
}