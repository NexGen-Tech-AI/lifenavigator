#!/bin/bash

# Deploy to Vercel script
# This script helps deploy LifeNavigator to Vercel

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}      LifeNavigator Vercel Deployment                    ${NC}"
echo -e "${BLUE}=========================================================${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
  npm install -g vercel
else
  echo -e "${GREEN}✓ Vercel CLI is installed${NC}"
fi

# Check if logged in to Vercel
echo -e "\n${YELLOW}Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
  echo -e "${YELLOW}Not logged in to Vercel. Please log in:${NC}"
  vercel login
else
  echo -e "${GREEN}✓ Logged in to Vercel${NC}"
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "vercel.json" ]; then
  echo -e "${RED}Error: package.json or vercel.json not found.${NC}"
  echo -e "${RED}Please run this script from the project root directory.${NC}"
  exit 1
fi

# Generate Prisma client
echo -e "\n${YELLOW}Generating Prisma client...${NC}"
npx prisma generate

# Deploy to Vercel
echo -e "\n${YELLOW}Deploying to Vercel...${NC}"
echo -e "${YELLOW}This will use settings from vercel.json${NC}"

# Ask if this should be a production deployment
read -p "Deploy to production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Deploying to production...${NC}"
  DEPLOYMENT_URL=$(vercel --prod)
else
  echo -e "${YELLOW}Deploying to preview environment...${NC}"
  DEPLOYMENT_URL=$(vercel)
fi

echo -e "\n${GREEN}=========================================================${NC}"
echo -e "${GREEN}      Deployment initiated!                              ${NC}"
echo -e "${GREEN}=========================================================${NC}"
echo -e "${BLUE}Deployment URL: $DEPLOYMENT_URL${NC}"
echo -e ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Check the deployment logs in the Vercel dashboard"
echo -e "2. Verify your application is working correctly"
echo -e "3. Set up a custom domain in the Vercel dashboard if needed"
echo -e ""
echo -e "${YELLOW}Note: To update environment variables, use the Vercel dashboard or run:${NC}"
echo -e "  vercel env add"