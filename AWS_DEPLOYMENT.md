# AWS Deployment Guide for LifeNavigator

This document outlines the steps required to deploy the LifeNavigator application to AWS using Terraform and GitHub Actions.

## Prerequisites

Before proceeding with the deployment, ensure you have the following:

1. AWS account with appropriate permissions
2. GitHub repository with the LifeNavigator code
3. GitHub Actions enabled on your repository
4. AWS CLI installed and configured locally (for testing)

## Setting up AWS credentials

### 1. Create an IAM user for deployments

1. Log into the AWS Management Console
2. Navigate to IAM > Users > Add User
3. Enter a username like `lifenavigator-deploy`
4. Select "Programmatic access" for Access type
5. Attach the `AdministratorAccess` policy (for simplicity) or use a more restrictive policy based on your security needs
6. Complete the user creation process
7. Save the Access Key ID and Secret Access Key for later use

### 2. Add AWS credentials to GitHub repository secrets

1. Navigate to your GitHub repository
2. Go to Settings > Secrets and variables > Actions
3. Click "New repository secret" and add the following secrets:
   - `AWS_ACCESS_KEY_ID`: Your AWS Access Key ID
   - `AWS_SECRET_ACCESS_KEY`: Your AWS Secret Access Key
   - `AWS_REGION`: Your preferred AWS region (e.g., `us-east-1`)

## Terraform State Setup

Our Terraform configuration uses S3 for remote state storage and DynamoDB for state locking. You need to create these resources first:

```bash
# Create S3 bucket for Terraform state
aws s3api create-bucket \
  --bucket lifenavigator-terraform-state \
  --region us-east-1

# Enable versioning on the bucket
aws s3api put-bucket-versioning \
  --bucket lifenavigator-terraform-state \
  --versioning-configuration Status=Enabled

# Enable encryption for the bucket
aws s3api put-bucket-encryption \
  --bucket lifenavigator-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }'

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name lifenavigator-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Environment Configuration

The application uses environment variables for configuration. Create a Secret in AWS Secrets Manager for the application:

```bash
aws secretsmanager create-secret \
  --name lifenavigator/dev/app \
  --description "LifeNavigator application secrets" \
  --secret-string '{
    "DATABASE_URL": "postgresql://lifenavigator_app:<generated_password>@<rds_endpoint>:5432/lifenavigator",
    "NEXTAUTH_SECRET": "<generate_random_string>",
    "NEXTAUTH_URL": "https://<your_domain_or_load_balancer_dns>"
  }'
```

Note: Replace placeholder values with your actual values after RDS is provisioned by Terraform.

## Deployment Process

The deployment is fully automated through GitHub Actions. Here's what happens when you push to the main branch:

1. **CI Workflow**: Runs tests, linting, and type checking
2. **Build**: Builds the Next.js application
3. **Docker**: Builds and pushes the Docker image to GitHub Container Registry
4. **Terraform Plan**: Creates an execution plan for AWS infrastructure
5. **Terraform Apply**: Applies the infrastructure changes and deploys the application

The workflow is configured in `.github/workflows/ci.yml`.

## Manual Deployment (if needed)

If you need to run a manual deployment, follow these steps:

1. Clone the repository
2. Build the Docker image:
   ```bash
   docker build -t lifenavigator:latest .
   ```
3. Tag and push to GitHub Container Registry:
   ```bash
   docker tag lifenavigator:latest ghcr.io/your-username/lifenavigator:latest
   docker push ghcr.io/your-username/lifenavigator:latest
   ```
4. Apply Terraform configuration:
   ```bash
   cd terraform
   terraform init
   terraform plan
   terraform apply
   ```

## Accessing the Deployed Application

After successful deployment, you can access the application through:

1. The Load Balancer DNS name (available in Terraform outputs)
2. If you've configured a custom domain, through that domain

To get the Load Balancer DNS name:

```bash
cd terraform
terraform output alb_dns_name
```

## Monitoring and Logs

- **CloudWatch Logs**: All application logs are available in CloudWatch Logs
  - Log Group: `/ecs/lifenavigator-<env>-app`
- **CloudWatch Metrics**: Application metrics are available in CloudWatch Metrics
  - Namespace: `AWS/ECS`
  - Dimensions: ClusterName=lifenavigator-<env>, ServiceName=lifenavigator-<env>-app

## Updating the Application

To update the application:

1. Make your changes and push to the main branch
2. GitHub Actions will automatically build, test, and deploy the changes
3. Monitor the deployment in the "Actions" tab of your GitHub repository

## Rollback

If you need to roll back to a previous version:

1. Find the commit SHA of the version you want to roll back to
2. Update the `app_container_image` variable in Terraform to that SHA:
   ```bash
   cd terraform
   terraform apply -var="app_container_image=<commit-sha>"
   ```

## Security Considerations

- Database passwords and application secrets are stored in AWS Secrets Manager
- RDS instance is only accessible from the application servers
- Application servers are in private subnets
- All sensitive data is encrypted at rest and in transit
- WAF is enabled for the load balancer to protect against common web exploits

## Troubleshooting

1. **Deployment fails**: Check GitHub Actions logs for details
2. **Application doesn't start**: Check ECS task logs in CloudWatch
3. **Database connection issues**: Verify RDS security group allows traffic from ECS tasks
4. **Authentication issues**: Check NEXTAUTH_SECRET and NEXTAUTH_URL in Secrets Manager

For additional help, refer to the issue tracker in the GitHub repository.