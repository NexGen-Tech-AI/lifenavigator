# Database module - RDS and DynamoDB resources
variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "database_subnet_group_name" {
  description = "Name of the database subnet group"
  type        = string
}

variable "database_security_group_id" {
  description = "ID of the database security group"
  type        = string
}

variable "db_master_username" {
  description = "Master username for database"
  type        = string
}

variable "db_master_password" {
  description = "Master password for database"
  type        = string
  sensitive   = true
}

variable "kms_key_arn" {
  description = "ARN of KMS key for encryption"
  type        = string
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.medium"
}

variable "prod_instance_class" {
  description = "RDS instance class for production"
  type        = string
  default     = "db.r6g.large"
}

# Financial domain database (PostgreSQL)
resource "aws_db_instance" "financial_db" {
  identifier           = "lifenavigator-financial-${var.environment}"
  engine               = "postgres"
  engine_version       = "15.3"
  instance_class       = var.environment == "prod" ? var.prod_instance_class : var.db_instance_class
  allocated_storage    = 100
  max_allocated_storage = 1000
  storage_type         = "gp3"
  storage_encrypted    = true
  kms_key_id           = var.kms_key_arn
  
  db_name              = "financial"
  username             = var.db_master_username
  password             = var.db_master_password
  
  multi_az             = var.environment == "prod" ? true : false
  vpc_security_group_ids = [var.database_security_group_id]
  db_subnet_group_name = var.database_subnet_group_name
  
  backup_retention_period = var.environment == "prod" ? 35 : 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:30-sun:05:30"
  
  deletion_protection     = var.environment == "prod" ? true : false
  skip_final_snapshot     = var.environment == "prod" ? false : true
  final_snapshot_identifier = var.environment == "prod" ? "lifenavigator-financial-final-${formatdate("YYYYMMDDhhmmss", timestamp())}" : null
  
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled = true
  performance_insights_kms_key_id = var.kms_key_arn
  performance_insights_retention_period = 7
  
  parameter_group_name = aws_db_parameter_group.postgres15_secure.name
  
  tags = {
    Name = "lifenavigator-${var.environment}-financial-db"
    Domain = "financial"
    Environment = var.environment
  }
}

# Healthcare domain database (PostgreSQL)
resource "aws_db_instance" "healthcare_db" {
  identifier           = "lifenavigator-healthcare-${var.environment}"
  engine               = "postgres"
  engine_version       = "15.3"
  instance_class       = var.environment == "prod" ? var.prod_instance_class : var.db_instance_class
  allocated_storage    = 100
  max_allocated_storage = 1000
  storage_type         = "gp3"
  storage_encrypted    = true
  kms_key_id           = var.kms_key_arn
  
  db_name              = "healthcare"
  username             = var.db_master_username
  password             = var.db_master_password
  
  multi_az             = var.environment == "prod" ? true : false
  vpc_security_group_ids = [var.database_security_group_id]
  db_subnet_group_name = var.database_subnet_group_name
  
  backup_retention_period = var.environment == "prod" ? 35 : 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:30-sun:05:30"
  
  deletion_protection     = var.environment == "prod" ? true : false
  skip_final_snapshot     = var.environment == "prod" ? false : true
  final_snapshot_identifier = var.environment == "prod" ? "lifenavigator-healthcare-final-${formatdate("YYYYMMDDhhmmss", timestamp())}" : null
  
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled = true
  performance_insights_kms_key_id = var.kms_key_arn
  performance_insights_retention_period = 7
  
  parameter_group_name = aws_db_parameter_group.postgres15_secure.name
  
  tags = {
    Name = "lifenavigator-${var.environment}-healthcare-db"
    Domain = "healthcare"
    Environment = var.environment
  }
}

# Career and Education domains database (PostgreSQL)
resource "aws_db_instance" "career_education_db" {
  identifier           = "lifenavigator-career-education-${var.environment}"
  engine               = "postgres"
  engine_version       = "15.3"
  instance_class       = var.environment == "prod" ? var.prod_instance_class : var.db_instance_class
  allocated_storage    = 100
  max_allocated_storage = 1000
  storage_type         = "gp3"
  storage_encrypted    = true
  kms_key_id           = var.kms_key_arn
  
  db_name              = "career_education"
  username             = var.db_master_username
  password             = var.db_master_password
  
  multi_az             = var.environment == "prod" ? true : false
  vpc_security_group_ids = [var.database_security_group_id]
  db_subnet_group_name = var.database_subnet_group_name
  
  backup_retention_period = var.environment == "prod" ? 35 : 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:30-sun:05:30"
  
  deletion_protection     = var.environment == "prod" ? true : false
  skip_final_snapshot     = var.environment == "prod" ? false : true
  final_snapshot_identifier = var.environment == "prod" ? "lifenavigator-career-education-final-${formatdate("YYYYMMDDhhmmss", timestamp())}" : null
  
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled = true
  performance_insights_kms_key_id = var.kms_key_arn
  performance_insights_retention_period = 7
  
  parameter_group_name = aws_db_parameter_group.postgres15_secure.name
  
  tags = {
    Name = "lifenavigator-${var.environment}-career-education-db"
    Domain = "career-education"
    Environment = var.environment
  }
}

# Document Vault database (PostgreSQL)
resource "aws_db_instance" "document_vault_db" {
  identifier           = "lifenavigator-document-vault-${var.environment}"
  engine               = "postgres"
  engine_version       = "15.3"
  instance_class       = var.environment == "prod" ? var.prod_instance_class : var.db_instance_class
  allocated_storage    = 100
  max_allocated_storage = 1000
  storage_type         = "gp3"
  storage_encrypted    = true
  kms_key_id           = var.kms_key_arn
  
  db_name              = "document_vault"
  username             = var.db_master_username
  password             = var.db_master_password
  
  multi_az             = var.environment == "prod" ? true : false
  vpc_security_group_ids = [var.database_security_group_id]
  db_subnet_group_name = var.database_subnet_group_name
  
  backup_retention_period = var.environment == "prod" ? 35 : 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:30-sun:05:30"
  
  deletion_protection     = var.environment == "prod" ? true : false
  skip_final_snapshot     = var.environment == "prod" ? false : true
  final_snapshot_identifier = var.environment == "prod" ? "lifenavigator-document-vault-final-${formatdate("YYYYMMDDhhmmss", timestamp())}" : null
  
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled = true
  performance_insights_kms_key_id = var.kms_key_arn
  performance_insights_retention_period = 7
  
  parameter_group_name = aws_db_parameter_group.postgres15_secure.name
  
  tags = {
    Name = "lifenavigator-${var.environment}-document-vault-db"
    Domain = "document-vault"
    Environment = var.environment
  }
}

# User activity DynamoDB table
resource "aws_dynamodb_table" "user_activity" {
  name         = "lifenavigator-user-activity-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"
  range_key    = "timestamp"
  
  attribute {
    name = "user_id"
    type = "S"
  }
  
  attribute {
    name = "timestamp"
    type = "N"
  }
  
  attribute {
    name = "activity_type"
    type = "S"
  }
  
  global_secondary_index {
    name               = "ActivityTypeIndex"
    hash_key           = "activity_type"
    range_key          = "timestamp"
    projection_type    = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }
  
  tags = {
    Name = "lifenavigator-${var.environment}-user-activity"
    Environment = var.environment
  }
}

# Document access audit log (WORM - cannot be altered)
resource "aws_dynamodb_table" "document_access_logs" {
  name         = "lifenavigator-document-access-logs-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "document_id"
  range_key    = "timestamp"
  
  attribute {
    name = "document_id"
    type = "S"
  }
  
  attribute {
    name = "timestamp"
    type = "N"
  }
  
  attribute {
    name = "user_id"
    type = "S"
  }
  
  global_secondary_index {
    name               = "UserAccessIndex"
    hash_key           = "user_id"
    range_key          = "timestamp"
    projection_type    = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }
  
  tags = {
    Name = "lifenavigator-${var.environment}-document-access-logs"
    Environment = var.environment
  }
}

# Secure DB Parameter Group with enhanced security settings
resource "aws_db_parameter_group" "postgres15_secure" {
  name   = "lifenavigator-postgres15-secure-${var.environment}"
  family = "postgres15"
  
  parameter {
    name  = "log_connections"
    value = "1"
  }
  
  parameter {
    name  = "log_disconnections"
    value = "1"
  }
  
  parameter {
    name  = "log_duration"
    value = "1"
  }
  
  parameter {
    name  = "log_statement"
    value = "ddl"
  }
  
  parameter {
    name  = "log_min_error_statement"
    value = "error"
  }
  
  parameter {
    name  = "ssl"
    value = "1"
  }
  
  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }
  
  tags = {
    Name = "lifenavigator-${var.environment}-postgres15-secure"
    Environment = var.environment
  }
}

# Outputs
output "financial_db_endpoint" {
  description = "Endpoint of the Financial database"
  value       = aws_db_instance.financial_db.endpoint
}

output "healthcare_db_endpoint" {
  description = "Endpoint of the Healthcare database"
  value       = aws_db_instance.healthcare_db.endpoint
}

output "career_education_db_endpoint" {
  description = "Endpoint of the Career/Education database"
  value       = aws_db_instance.career_education_db.endpoint
}

output "document_vault_db_endpoint" {
  description = "Endpoint of the Document Vault database"
  value       = aws_db_instance.document_vault_db.endpoint
}

output "user_activity_table_name" {
  description = "Name of the user activity DynamoDB table"
  value       = aws_dynamodb_table.user_activity.name
}

output "document_access_logs_table_name" {
  description = "Name of the document access logs DynamoDB table"
  value       = aws_dynamodb_table.document_access_logs.name
}