# ECS task definition for the application
resource "aws_ecs_task_definition" "app" {
  family                   = "lifenavigator-${var.environment}-app"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.app_container_cpu
  memory                   = var.app_container_memory

  container_definitions = jsonencode([
    {
      name      = "app"
      image     = "${aws_ecr_repository.app.repository_url}:${var.app_container_image}"
      essential = true
      portMappings = [
        {
          containerPort = var.app_container_port
          hostPort      = var.app_container_port
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "PORT"
          value = toString(var.app_container_port)
        }
      ]
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:DATABASE_URL::"
        },
        {
          name      = "NEXTAUTH_SECRET"
          valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:NEXTAUTH_SECRET::"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:${var.app_container_port}/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])
}

# IAM role for ECS tasks
resource "aws_iam_role" "ecs_task_role" {
  name = "lifenavigator-${var.environment}-ecs-task-role"

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

# Policy to allow ECS tasks to access S3
resource "aws_iam_policy" "ecs_task_s3" {
  name        = "lifenavigator-${var.environment}-ecs-task-s3"
  description = "Allow ECS tasks to access S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Effect = "Allow"
        Resource = [
          aws_s3_bucket.static_assets.arn,
          "${aws_s3_bucket.static_assets.arn}/*"
        ]
      }
    ]
  })
}

# Attach S3 policy to ECS task role
resource "aws_iam_role_policy_attachment" "ecs_task_s3" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_task_s3.arn
}

# Policy to allow ECS tasks to access Secrets Manager
resource "aws_iam_policy" "ecs_task_secrets" {
  name        = "lifenavigator-${var.environment}-ecs-task-secrets"
  description = "Allow ECS tasks to access Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Effect = "Allow"
        Resource = [
          aws_secretsmanager_secret.app_secrets.arn
        ]
      }
    ]
  })
}

# Attach Secrets Manager policy to ECS task execution role
resource "aws_iam_role_policy_attachment" "ecs_task_execution_secrets" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ecs_task_secrets.arn
}

# ECS service for the application
resource "aws_ecs_service" "app" {
  name            = "lifenavigator-${var.environment}-app"
  cluster         = module.ecs.cluster_id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.app_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [module.security_group_app.security_group_id]
  }

  load_balancer {
    target_group_arn = module.alb.target_group_arns[0]
    container_name   = "app"
    container_port   = var.app_container_port
  }

  depends_on = [
    module.alb
  ]

  lifecycle {
    ignore_changes = [desired_count]
  }
}

# Auto Scaling for ECS service
resource "aws_appautoscaling_target" "app" {
  count              = var.enable_autoscaling ? 1 : 0
  service_namespace  = "ecs"
  resource_id        = "service/${module.ecs.cluster_id}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = var.app_min_count
  max_capacity       = var.app_max_count
}

# Auto Scaling policy for CPU utilization
resource "aws_appautoscaling_policy" "app_cpu" {
  count              = var.enable_autoscaling ? 1 : 0
  name               = "lifenavigator-${var.environment}-app-cpu"
  policy_type        = "TargetTrackingScaling"
  service_namespace  = aws_appautoscaling_target.app[0].service_namespace
  resource_id        = aws_appautoscaling_target.app[0].resource_id
  scalable_dimension = aws_appautoscaling_target.app[0].scalable_dimension

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# Auto Scaling policy for memory utilization
resource "aws_appautoscaling_policy" "app_memory" {
  count              = var.enable_autoscaling ? 1 : 0
  name               = "lifenavigator-${var.environment}-app-memory"
  policy_type        = "TargetTrackingScaling"
  service_namespace  = aws_appautoscaling_target.app[0].service_namespace
  resource_id        = aws_appautoscaling_target.app[0].resource_id
  scalable_dimension = aws_appautoscaling_target.app[0].scalable_dimension

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value       = 70
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}