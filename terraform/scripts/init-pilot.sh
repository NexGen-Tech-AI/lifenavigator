#!/bin/bash
# terraform/scripts/init-pilot.sh
# Initialize Terraform for pilot environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Initializing Life Navigator Pilot Infrastructure${NC}"
echo "=================================================="

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    echo "   Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check Terraform
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform not found. Please install it first.${NC}"
    echo "   Visit: https://www.terraform.io/downloads"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${RED}❌ AWS credentials not configured.${NC}"
    echo "   Run: aws configure"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"

# Get AWS account info
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=${AWS_DEFAULT_REGION:-us-east-1}

echo -e "\n${BLUE}AWS Account ID: ${ACCOUNT_ID}${NC}"
echo -e "${BLUE}AWS Region: ${REGION}${NC}"

# Check if state bucket exists
STATE_BUCKET="life-navigator-terraform-state-${ACCOUNT_ID}"
echo -e "\n${YELLOW}Checking for Terraform state bucket...${NC}"

if ! aws s3api head-bucket --bucket "${STATE_BUCKET}" 2>/dev/null; then
    echo -e "${YELLOW}State bucket not found. Creating it now...${NC}"
    
    # Navigate to state bucket directory
    cd "$(dirname "$0")/../global/state-bucket"
    
    # Initialize and apply
    terraform init
    terraform apply -auto-approve
    
    echo -e "${GREEN}✅ State bucket created${NC}"
else
    echo -e "${GREEN}✅ State bucket already exists${NC}"
fi

# Navigate to pilot environment
cd "$(dirname "$0")/../environments/pilot"

# Initialize backend
echo -e "\n${YELLOW}Initializing Terraform backend...${NC}"

terraform init \
    -backend-config="bucket=${STATE_BUCKET}" \
    -backend-config="key=pilot/terraform.tfstate" \
    -backend-config="region=${REGION}" \
    -backend-config="dynamodb_table=life-navigator-terraform-locks" \
    -backend-config="encrypt=true"

echo -e "${GREEN}✅ Terraform initialized successfully${NC}"

# Check for terraform.tfvars
if [ ! -f "terraform.tfvars" ]; then
    echo -e "\n${YELLOW}Creating terraform.tfvars from example...${NC}"
    cp terraform.tfvars.example terraform.tfvars
    echo -e "${GREEN}✅ terraform.tfvars created${NC}"
    echo -e "${YELLOW}⚠️  Please edit terraform.tfvars with your configuration values${NC}"
fi

# Validate configuration
echo -e "\n${YELLOW}Validating Terraform configuration...${NC}"
if terraform validate; then
    echo -e "${GREEN}✅ Configuration is valid${NC}"
else
    echo -e "${RED}❌ Configuration validation failed${NC}"
    exit 1
fi

# Success message
echo -e "\n${GREEN}🎉 Pilot environment initialized successfully!${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo "1. Edit terraform.tfvars with your configuration:"
echo "   cd terraform/environments/pilot"
echo "   nano terraform.tfvars"
echo ""
echo "2. Review the infrastructure plan:"
echo "   terraform plan"
echo ""
echo "3. Deploy the infrastructure:"
echo "   terraform apply"
echo ""
echo "4. Get the outputs for Vercel configuration:"
echo "   terraform output -json"
echo ""
echo -e "${YELLOW}💡 Tip: Run 'terraform plan' to see what will be created${NC}"