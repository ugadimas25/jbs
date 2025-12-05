#!/bin/bash

# JBS App First-Time Setup Script for VPS
# Run this script after uploading the project to VPS for the first time

set -e  # Exit on error

echo "🎯 Starting JBS App First-Time Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}Please create .env file from .env.example and configure it.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production

echo -e "${YELLOW}🗄️  Setting up database schema...${NC}"
npm run db:push

echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

echo -e "${YELLOW}📂 Creating logs directory...${NC}"
mkdir -p logs

echo -e "${YELLOW}🚀 Starting application with PM2...${NC}"
pm2 start ecosystem.config.cjs

echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save

echo -e "${YELLOW}⚙️  Setting up PM2 startup script...${NC}"
echo -e "${YELLOW}Run the command that PM2 suggests below:${NC}"
pm2 startup

echo ""
echo -e "${GREEN}✅ First-time setup completed!${NC}"
echo ""
echo -e "${YELLOW}📊 Application Status:${NC}"
pm2 status

echo ""
echo -e "${YELLOW}📝 Useful commands:${NC}"
echo "  pm2 logs jbs_app    - View logs"
echo "  pm2 restart jbs_app - Restart app"
echo "  pm2 stop jbs_app    - Stop app"
echo "  pm2 monit           - Monitor resources"
