#!/bin/bash

# MakeSlidev Docker Management Script
# This script helps you manage the MakeSlidev Docker containers

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Project info
PROJECT_NAME="MakeSlidev"
COMPOSE_FILE="docker-compose.yml"

# Functions
print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════╗"
    echo "║        🚀 MakeSlidev Docker          ║"
    echo "║    Live Slidev Presentation Editor   ║"
    echo "╚══════════════════════════════════════╝"
    echo -e "${NC}"
}

print_help() {
    echo -e "${YELLOW}Usage: $0 [COMMAND]${NC}"
    echo ""
    echo -e "${BLUE}Commands:${NC}"
    echo -e "  ${GREEN}build${NC}     Build all Docker images"
    echo -e "  ${GREEN}up${NC}        Start all services"
    echo -e "  ${GREEN}down${NC}      Stop all services"
    echo -e "  ${GREEN}restart${NC}   Restart all services"
    echo -e "  ${GREEN}logs${NC}      Show logs from all services"
    echo -e "  ${GREEN}status${NC}    Show status of all services"
    echo -e "  ${GREEN}clean${NC}     Remove all containers, networks, and volumes"
    echo -e "  ${GREEN}shell${NC}     Open shell in backend container"
    echo -e "  ${GREEN}db${NC}        Open MongoDB shell"
    echo -e "  ${GREEN}help${NC}      Show this help message"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo -e "  $0 build && $0 up    # Build and start"
    echo -e "  $0 logs backend      # Show backend logs only"
    echo -e "  $0 restart frontend  # Restart frontend only"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker daemon is not running. Please start Docker first.${NC}"
        exit 1
    fi
}

build_images() {
    echo -e "${BLUE}🔨 Building MakeSlidev Docker images...${NC}"
    docker-compose -f $COMPOSE_FILE build --no-cache
    echo -e "${GREEN}✅ Images built successfully!${NC}"
}

start_services() {
    echo -e "${BLUE}🚀 Starting MakeSlidev services...${NC}"
    docker-compose -f $COMPOSE_FILE up -d
    
    echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
    sleep 10
    
    show_status
    show_access_info
}

stop_services() {
    echo -e "${BLUE}🛑 Stopping MakeSlidev services...${NC}"
    docker-compose -f $COMPOSE_FILE down
    echo -e "${GREEN}✅ Services stopped successfully!${NC}"
}

restart_services() {
    echo -e "${BLUE}🔄 Restarting MakeSlidev services...${NC}"
    docker-compose -f $COMPOSE_FILE restart $1
    echo -e "${GREEN}✅ Services restarted successfully!${NC}"
}

show_logs() {
    if [ -n "$1" ]; then
        echo -e "${BLUE}📋 Showing logs for $1...${NC}"
        docker-compose -f $COMPOSE_FILE logs -f $1
    else
        echo -e "${BLUE}📋 Showing logs for all services...${NC}"
        docker-compose -f $COMPOSE_FILE logs -f
    fi
}

show_status() {
    echo -e "${BLUE}📊 MakeSlidev Service Status:${NC}"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    
    # Check health status
    backend_health=$(docker inspect makeslidev-backend --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
    frontend_health=$(docker inspect makeslidev-frontend --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
    
    echo -e "${BLUE}🏥 Health Status:${NC}"
    echo -e "  Backend:  $(get_health_color $backend_health)$backend_health${NC}"
    echo -e "  Frontend: $(get_health_color $frontend_health)$frontend_health${NC}"
}

get_health_color() {
    case $1 in
        "healthy") echo -e "${GREEN}" ;;
        "unhealthy") echo -e "${RED}" ;;
        "starting") echo -e "${YELLOW}" ;;
        *) echo -e "${PURPLE}" ;;
    esac
}

clean_all() {
    echo -e "${YELLOW}⚠️  This will remove all MakeSlidev containers, networks, and volumes.${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🧹 Cleaning up MakeSlidev...${NC}"
        docker-compose -f $COMPOSE_FILE down -v --remove-orphans
        docker system prune -f
        echo -e "${GREEN}✅ Cleanup completed!${NC}"
    else
        echo -e "${YELLOW}Cleanup cancelled.${NC}"
    fi
}

open_shell() {
    echo -e "${BLUE}🐚 Opening shell in backend container...${NC}"
    docker-compose -f $COMPOSE_FILE exec backend sh
}

open_db_shell() {
    echo -e "${BLUE}🗄️  Opening MongoDB shell...${NC}"
    docker-compose -f $COMPOSE_FILE exec mongodb mongosh -u admin -p makeslidev123 --authenticationDatabase admin makeslidev
}

show_access_info() {
    echo -e "${GREEN}🎉 MakeSlidev is running!${NC}"
    echo ""
    echo -e "${BLUE}📱 Access URLs:${NC}"
    echo -e "  🌐 Frontend:      ${YELLOW}http://localhost:3000${NC}"
    echo -e "  🔗 Slidev Editor: ${YELLOW}http://localhost:3000/slidev${NC}"
    echo -e "  🔧 Backend API:   ${YELLOW}http://localhost:8080${NC}"
    echo -e "  📚 API Docs:      ${YELLOW}http://localhost:8080/api-docs${NC}"
    echo -e "  🗄️  MongoDB:       ${YELLOW}mongodb://admin:makeslidev123@localhost:27017/makeslidev${NC}"
    echo ""
    echo -e "${BLUE}🎯 Demo Instructions:${NC}"
    echo -e "  1. Navigate to ${YELLOW}http://localhost:3000/slidev${NC}"
    echo -e "  2. Click ${YELLOW}'Edit'${NC} on Business Pitch template"
    echo -e "  3. Configure slide blocks in accordion interface"
    echo -e "  4. See live preview panel"
    echo ""
    echo -e "${PURPLE}💡 Tip: Use '$0 logs' to monitor all services${NC}"
}

# Main script logic
print_banner

case "${1:-help}" in
    build)
        check_docker
        build_images
        ;;
    up|start)
        check_docker
        start_services
        ;;
    down|stop)
        check_docker
        stop_services
        ;;
    restart)
        check_docker
        restart_services $2
        ;;
    logs)
        check_docker
        show_logs $2
        ;;
    status)
        check_docker
        show_status
        ;;
    clean)
        check_docker
        clean_all
        ;;
    shell)
        check_docker
        open_shell
        ;;
    db)
        check_docker
        open_db_shell
        ;;
    help|--help|-h)
        print_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        print_help
        exit 1
        ;;
esac
