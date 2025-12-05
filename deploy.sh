#!/bin/bash

# JBS App Deployment Script for VPS
# This script helps automate the deployment process

set -e  # Exit on error

echo "🚀 Starting JBS App Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/jbs_app"
APP_NAME="jbs_app"

echo -e "${YELLOW}📂 Navigating to application directory...${NC}"
cd $APP_DIR

# Check if git is available and pull latest changes
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Pulling latest changes from Git...${NC}"
    git pull origin main || git pull origin master
else
    echo -e "${YELLOW}⚠️  Not a git repository. Skipping git pull...${NC}"
fi

echo -e "${YELLOW}📦 Installing/Updating dependencies...${NC}"
npm install --production

echo -e "${YELLOW}🗄️  Updating database schema...${NC}"
npm run db:push

echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

echo -e "${YELLOW}🔄 Restarting application with PM2...${NC}"
pm2 restart $APP_NAME || pm2 start ecosystem.config.cjs

echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📊 Application Status:${NC}"
pm2 status $APP_NAME

echo ""
echo -e "${YELLOW}📝 To view logs, run:${NC}"
echo "pm2 logs $APP_NAME"
