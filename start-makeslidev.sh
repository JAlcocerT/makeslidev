#!/bin/bash

# MakeSlidev Startup Script
# This script starts both backend and frontend servers

echo "🚀 Starting MakeSlidev..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo -e "${RED}Error: yarn is not installed. Please install yarn first.${NC}"
    exit 1
fi

# Create environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}Creating backend .env file...${NC}"
    cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env.local ]; then
    echo -e "${YELLOW}Creating frontend .env.local file...${NC}"
    echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8080" > frontend/.env.local
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
cd backend && yarn install --silent && cd ..
cd frontend && yarn install --silent && cd ..

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}🎯 Now run the following commands in separate terminals:${NC}"
echo ""
echo -e "${YELLOW}Terminal 1 (Backend):${NC}"
echo "cd $(pwd)/backend && yarn dev"
echo ""
echo -e "${YELLOW}Terminal 2 (Frontend):${NC}"
echo "cd $(pwd)/frontend && yarn dev"
echo ""
echo -e "${BLUE}📱 Then access:${NC}"
echo "   🔗 Slidev Editor: http://localhost:3000/slidev"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔧 Backend API: http://localhost:8080"
echo ""
echo -e "${GREEN}Happy presenting! 🚀${NC}"
