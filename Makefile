# makeread.me project Makefile
# This Makefile helps you set up and run the makeread.me project locally

# Project settings
FRONTEND_DIR := frontend
BACKEND_DIR := backend
FRONTEND_PORT := 3000
BACKEND_PORT := 8080

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Default make goal
.DEFAULT_GOAL := help

.PHONY: help
help: ## Show this help message
	@echo "$(BLUE)makeread.me Project Commands$(NC)"
	@echo "============================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

.PHONY: check-yarn
check-yarn: ## Check if yarn is installed
	@command -v yarn >/dev/null 2>&1 || { echo "$(RED)Error: yarn is not installed. Please install yarn first: npm install -g yarn$(NC)"; exit 1; }
	@echo "$(GREEN)✓ Yarn is installed$(NC)"

.PHONY: install
install: check-yarn ## Install dependencies for both frontend and backend
	@echo "$(BLUE)Installing dependencies...$(NC)"
	@echo "$(YELLOW)Installing frontend dependencies...$(NC)"
	@cd $(FRONTEND_DIR) && yarn install
	@echo "$(YELLOW)Installing backend dependencies...$(NC)"
	@cd $(BACKEND_DIR) && yarn install
	@echo "$(GREEN)✓ All dependencies installed successfully$(NC)"

.PHONY: setup-env
setup-env: ## Set up environment files from example files
	@echo "$(BLUE)Setting up environment files...$(NC)"
	@if [ ! -f $(BACKEND_DIR)/.env ]; then \
		cp $(BACKEND_DIR)/.env.example $(BACKEND_DIR)/.env; \
		echo "$(GREEN)✓ Created backend/.env from .env.example$(NC)"; \
	else \
		echo "$(YELLOW)⚠ backend/.env already exists, skipping$(NC)"; \
	fi
	@echo "$(YELLOW)Note: Make sure to update the BASE parameter in frontend/api/generated/readMeGenerator.ts to point to your backend API (http://localhost:$(BACKEND_PORT)/api)$(NC)"

.PHONY: build-contentlayer
build-contentlayer: ## Build contentlayer generated files for frontend
	@echo "$(BLUE)Building contentlayer files...$(NC)"
	@cd $(FRONTEND_DIR) && npx contentlayer2 build
	@echo "$(GREEN)✓ Contentlayer files generated$(NC)"

.PHONY: setup
setup: install setup-env build-contentlayer ## Complete project setup (install dependencies, setup environment, and build contentlayer)
	@echo "$(GREEN)✓ Project setup complete!$(NC)"
	@echo "$(BLUE)Next steps:$(NC)"
	@echo "  1. Update frontend/api/generated/readMeGenerator.ts BASE parameter if needed"
	@echo "  2. Run 'make dev' to start both servers"

.PHONY: dev-backend
dev-backend: ## Start the backend development server
	@echo "$(BLUE)Starting backend development server on port $(BACKEND_PORT)...$(NC)"
	@cd $(BACKEND_DIR) && yarn dev

.PHONY: dev-frontend
dev-frontend: ## Start the frontend development server
	@echo "$(BLUE)Starting frontend development server on port $(FRONTEND_PORT)...$(NC)"
	@cd $(FRONTEND_DIR) && yarn dev

.PHONY: dev
dev: ## Start both frontend and backend development servers concurrently
	@echo "$(BLUE)Starting both frontend and backend servers...$(NC)"
	@echo "$(YELLOW)Backend will run on: http://localhost:$(BACKEND_PORT)$(NC)"
	@echo "$(YELLOW)Frontend will run on: http://localhost:$(FRONTEND_PORT)$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop both servers$(NC)"
	@trap 'kill %1; kill %2' INT; \
	(cd $(BACKEND_DIR) && yarn dev) & \
	(cd $(FRONTEND_DIR) && yarn dev) & \
	wait

.PHONY: build
build: ## Build both frontend and backend for production
	@echo "$(BLUE)Building project for production...$(NC)"
	@echo "$(YELLOW)Building backend...$(NC)"
	@cd $(BACKEND_DIR) && yarn build
	@echo "$(YELLOW)Building frontend...$(NC)"
	@cd $(FRONTEND_DIR) && yarn build
	@echo "$(GREEN)✓ Build complete$(NC)"

.PHONY: start
start: ## Start both frontend and backend in production mode
	@echo "$(BLUE)Starting production servers...$(NC)"
	@echo "$(YELLOW)Backend will run on: http://localhost:$(BACKEND_PORT)$(NC)"
	@echo "$(YELLOW)Frontend will run on: http://localhost:$(FRONTEND_PORT)$(NC)"
	@trap 'kill %1; kill %2' INT; \
	(cd $(BACKEND_DIR) && yarn start) & \
	(cd $(FRONTEND_DIR) && yarn start) & \
	wait

.PHONY: lint
lint: ## Run linting for both frontend and backend
	@echo "$(BLUE)Running linting...$(NC)"
	@echo "$(YELLOW)Linting backend...$(NC)"
	@cd $(BACKEND_DIR) && yarn lint
	@echo "$(YELLOW)Linting frontend...$(NC)"
	@cd $(FRONTEND_DIR) && yarn lint
	@echo "$(GREEN)✓ Linting complete$(NC)"

.PHONY: lint-fix
lint-fix: ## Fix linting issues for both frontend and backend
	@echo "$(BLUE)Fixing linting issues...$(NC)"
	@echo "$(YELLOW)Fixing backend linting...$(NC)"
	@cd $(BACKEND_DIR) && yarn lint:fix
	@echo "$(YELLOW)Fixing frontend linting...$(NC)"
	@cd $(FRONTEND_DIR) && yarn lint:fix
	@echo "$(GREEN)✓ Linting fixes applied$(NC)"

.PHONY: format
format: ## Format code for both frontend and backend
	@echo "$(BLUE)Formatting code...$(NC)"
	@echo "$(YELLOW)Formatting backend...$(NC)"
	@cd $(BACKEND_DIR) && yarn format
	@echo "$(YELLOW)Formatting frontend...$(NC)"
	@cd $(FRONTEND_DIR) && yarn format:write
	@echo "$(GREEN)✓ Code formatting complete$(NC)"

.PHONY: clean
clean: ## Clean build artifacts and node_modules
	@echo "$(BLUE)Cleaning project...$(NC)"
	@echo "$(YELLOW)Cleaning backend...$(NC)"
	@cd $(BACKEND_DIR) && yarn clean && rm -rf node_modules
	@echo "$(YELLOW)Cleaning frontend...$(NC)"
	@cd $(FRONTEND_DIR) && rm -rf .next node_modules
	@echo "$(GREEN)✓ Project cleaned$(NC)"

# MakeSlidev Commands
.PHONY: spin-slidev-editor
spin-slidev-editor: ## 🚀 Start the complete MakeSlidev application (backend + frontend)
	@echo "$(BLUE)🚀 Starting MakeSlidev - Live Slidev Presentation Editor$(NC)"
	@echo "$(YELLOW)Setting up MakeSlidev environment...$(NC)"
	@echo ""
	@echo "$(BLUE)📋 Requirements Check:$(NC)"
	@$(MAKE) check-yarn
	@echo ""
	@echo "$(BLUE)📦 Installing Dependencies:$(NC)"
	@echo "$(YELLOW)Installing backend dependencies...$(NC)"
	@cd $(BACKEND_DIR) && yarn install --silent
	@echo "$(GREEN)✓ Backend dependencies installed$(NC)"
	@echo "$(YELLOW)Installing frontend dependencies...$(NC)"
	@cd $(FRONTEND_DIR) && yarn install --silent
	@echo "$(GREEN)✓ Frontend dependencies installed$(NC)"
	@echo ""
	@echo "$(BLUE)🔧 Environment Setup:$(NC)"
	@if [ ! -f $(BACKEND_DIR)/.env ]; then \
		echo "$(YELLOW)Creating backend .env file...$(NC)"; \
		cp $(BACKEND_DIR)/.env.example $(BACKEND_DIR)/.env; \
		echo "$(GREEN)✓ Backend .env created$(NC)"; \
	else \
		echo "$(GREEN)✓ Backend .env exists$(NC)"; \
	fi
	@if [ ! -f $(FRONTEND_DIR)/.env.local ]; then \
		echo "$(YELLOW)Creating frontend .env.local file...$(NC)"; \
		echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:$(BACKEND_PORT)" > $(FRONTEND_DIR)/.env.local; \
		echo "$(GREEN)✓ Frontend .env.local created$(NC)"; \
	else \
		echo "$(GREEN)✓ Frontend .env.local exists$(NC)"; \
	fi
	@echo ""
	@echo "$(BLUE)🎯 Starting MakeSlidev Services:$(NC)"
	@echo "$(YELLOW)Starting backend server on port $(BACKEND_PORT)...$(NC)"
	@cd $(BACKEND_DIR) && yarn dev > ../backend.log 2>&1 & echo $$! > ../backend.pid
	@sleep 3
	@echo "$(GREEN)✓ Backend server started$(NC)"
	@echo "$(YELLOW)Starting frontend server on port $(FRONTEND_PORT)...$(NC)"
	@cd $(FRONTEND_DIR) && yarn dev > ../frontend.log 2>&1 & echo $$! > ../frontend.pid
	@sleep 3
	@echo "$(GREEN)✓ Frontend server started$(NC)"
	@echo ""
	@echo "$(GREEN)🎉 MakeSlidev is now running!$(NC)"
	@echo ""
	@echo "$(BLUE)📱 Access your application:$(NC)"
	@echo "   🌐 Frontend: $(YELLOW)http://localhost:$(FRONTEND_PORT)$(NC)"
	@echo "   🔗 Slidev Editor: $(YELLOW)http://localhost:$(FRONTEND_PORT)/slidev$(NC)"
	@echo "   🔧 Backend API: $(YELLOW)http://localhost:$(BACKEND_PORT)$(NC)"
	@echo "   📚 API Docs: $(YELLOW)http://localhost:$(BACKEND_PORT)/api-docs$(NC)"
	@echo ""
	@echo "$(BLUE)🎯 Demo Instructions:$(NC)"
	@echo "   1. Navigate to $(YELLOW)http://localhost:$(FRONTEND_PORT)/slidev$(NC)"
	@echo "   2. Click $(YELLOW)'Edit'$(NC) on Business Pitch template"
	@echo "   3. Configure slide blocks in accordion interface"
	@echo "   4. See live preview panel"
	@echo ""
	@echo "$(BLUE)🛑 To stop MakeSlidev:$(NC)"
	@echo "   Run: $(YELLOW)make stop-slidev-editor$(NC)"
	@echo ""
	@echo "$(GREEN)Happy presenting! 🚀$(NC)"

.PHONY: stop-slidev-editor
stop-slidev-editor: ## 🛑 Stop the MakeSlidev application
	@echo "$(BLUE)🛑 Stopping MakeSlidev...$(NC)"
	@if [ -f backend.pid ]; then \
		echo "$(YELLOW)Stopping backend server...$(NC)"; \
		kill `cat backend.pid` 2>/dev/null || true; \
		rm -f backend.pid; \
		echo "$(GREEN)✓ Backend stopped$(NC)"; \
	else \
		echo "$(YELLOW)Backend not running$(NC)"; \
	fi
	@if [ -f frontend.pid ]; then \
		echo "$(YELLOW)Stopping frontend server...$(NC)"; \
		kill `cat frontend.pid` 2>/dev/null || true; \
		rm -f frontend.pid; \
		echo "$(GREEN)✓ Frontend stopped$(NC)"; \
	else \
		echo "$(YELLOW)Frontend not running$(NC)"; \
	fi
	@rm -f backend.log frontend.log
	@echo "$(GREEN)✓ MakeSlidev stopped$(NC)"

.PHONY: status-slidev-editor
status-slidev-editor: ## 📊 Check MakeSlidev application status
	@echo "$(BLUE)📊 MakeSlidev Status:$(NC)"
	@if [ -f backend.pid ] && kill -0 `cat backend.pid` 2>/dev/null; then \
		echo "   Backend: $(GREEN)✓ Running$(NC) (PID: `cat backend.pid`)"; \
	else \
		echo "   Backend: $(RED)✗ Not running$(NC)"; \
	fi
	@if [ -f frontend.pid ] && kill -0 `cat frontend.pid` 2>/dev/null; then \
		echo "   Frontend: $(GREEN)✓ Running$(NC) (PID: `cat frontend.pid`)"; \
	else \
		echo "   Frontend: $(RED)✗ Not running$(NC)"; \
	fi
	@echo ""
	@if [ -f backend.pid ] && kill -0 `cat backend.pid` 2>/dev/null && [ -f frontend.pid ] && kill -0 `cat frontend.pid` 2>/dev/null; then \
		echo "$(GREEN)🎉 MakeSlidev is fully operational!$(NC)"; \
		echo "   🔗 Access: $(YELLOW)http://localhost:$(FRONTEND_PORT)/slidev$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  MakeSlidev is not fully running$(NC)"; \
		echo "   Run: $(YELLOW)make spin-slidev-editor$(NC) to start"; \
	fi

.PHONY: swagger
swagger: ## Generate Swagger documentation for backend
	@echo "$(BLUE)Generating Swagger documentation...$(NC)"
	@cd $(BACKEND_DIR) && yarn swagger
	@echo "$(GREEN)✓ Swagger documentation generated$(NC)"

.PHONY: status
status: ## Check the status of running processes
	@echo "$(BLUE)Checking process status...$(NC)"
	@echo "$(YELLOW)Processes running on port $(BACKEND_PORT) (backend):$(NC)"
	@lsof -ti:$(BACKEND_PORT) | head -5 || echo "No processes found"
	@echo "$(YELLOW)Processes running on port $(FRONTEND_PORT) (frontend):$(NC)"
	@lsof -ti:$(FRONTEND_PORT) | head -5 || echo "No processes found"

.PHONY: stop
stop: ## Stop any processes running on the default ports
	@echo "$(BLUE)Stopping processes on ports $(BACKEND_PORT) and $(FRONTEND_PORT)...$(NC)"
	@lsof -ti:$(BACKEND_PORT) | xargs kill -9 2>/dev/null || echo "No backend processes to stop"
	@lsof -ti:$(FRONTEND_PORT) | xargs kill -9 2>/dev/null || echo "No frontend processes to stop"
	@echo "$(GREEN)✓ Processes stopped$(NC)"

# Docker Production Commands
.PHONY: docker-build docker-up docker-down docker-restart docker-logs docker-status docker-clean
docker-build: ## 🐳 Build Docker images for production
	@echo "$(BLUE)🐳 Building MakeSlidev Docker images...$(NC)"
	@./docker-makeslidev.sh build

docker-up: ## 🚀 Start MakeSlidev in Docker (production mode)
	@echo "$(BLUE)🚀 Starting MakeSlidev with Docker...$(NC)"
	@./docker-makeslidev.sh up

docker-down: ## 🛑 Stop MakeSlidev Docker containers
	@echo "$(BLUE)🛑 Stopping MakeSlidev Docker containers...$(NC)"
	@./docker-makeslidev.sh down

docker-restart: ## 🔄 Restart MakeSlidev Docker containers
	@./docker-makeslidev.sh restart

docker-logs: ## 📋 Show Docker container logs
	@./docker-makeslidev.sh logs

docker-status: ## 📊 Check Docker container status
	@./docker-makeslidev.sh status

docker-clean: ## 🧹 Clean up Docker containers and volumes
	@./docker-makeslidev.sh clean

.PHONY: docker-deploy
docker-deploy: ## 📦 Full Docker deployment (build + up)
	@echo "$(BLUE)📦 Deploying MakeSlidev with Docker...$(NC)"
	@$(MAKE) docker-build
	@$(MAKE) docker-up
	@echo "$(GREEN)🎉 MakeSlidev deployed successfully!$(NC)"
	@echo "$(YELLOW)Access your application at: http://localhost:3000/slidev$(NC)"
