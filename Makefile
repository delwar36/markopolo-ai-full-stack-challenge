# Markopolo AI Microservices - Makefile
# Common commands for development and deployment

.PHONY: help dev dev-logs dev-down dev-clean build start test lint k8s-deploy k8s-delete k8s-status k8s-logs cleanup

# Default target
help: ## Show this help message
	@echo "Markopolo AI Microservices - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
dev: ## Start all services in development mode
	@echo "🚀 Starting Markopolo AI Microservices..."
	docker compose up -d
	@echo "✅ Services started. Check logs with 'make dev-logs'"

dev-logs: ## Show logs for all services
	docker compose logs -f

dev-down: ## Stop all services
	@echo "🛑 Stopping all services..."
	docker compose down
	@echo "✅ Services stopped"

dev-clean: ## Stop all services and remove volumes
	@echo "🧹 Cleaning up all services and volumes..."
	docker compose down -v --remove-orphans
	@echo "✅ Cleanup completed"

build: ## Build all Docker images
	@echo "🔨 Building all Docker images..."
	docker compose build
	@echo "✅ Build completed"

start: ## Start services using the startup script
	@echo "🚀 Starting services with startup script..."
	./scripts/start-microservices.sh

# Testing commands
test: ## Run tests (placeholder - run in individual services)
	@echo "🧪 Running tests in individual services..."
	@echo "To run tests for a specific service:"
	@echo "  cd microservices/[service-name] && npm test"

# Linting commands
lint: ## Run linting (placeholder - run in individual services)
	@echo "🔍 Running linting in individual services..."
	@echo "To run linting for a specific service:"
	@echo "  cd microservices/[service-name] && npm run lint"

# Kubernetes commands
k8s-deploy: ## Deploy to Kubernetes
	@echo "🚀 Deploying to Kubernetes..."
	kubectl apply -f infrastructure/kubernetes/namespace.yaml
	kubectl apply -f infrastructure/kubernetes/configmap.yaml
	kubectl apply -f infrastructure/kubernetes/secrets.yaml
	kubectl apply -f infrastructure/kubernetes/
	@echo "✅ Kubernetes deployment completed"

k8s-delete: ## Delete from Kubernetes
	@echo "🗑️ Deleting from Kubernetes..."
	kubectl delete -f infrastructure/kubernetes/
	@echo "✅ Kubernetes deletion completed"

k8s-status: ## Show Kubernetes pod status
	@echo "📊 Kubernetes pod status:"
	kubectl get pods -n markopolo-ai

k8s-logs: ## Show logs for API Gateway in Kubernetes
	@echo "📋 API Gateway logs:"
	kubectl logs -f -l app=api-gateway -n markopolo-ai

# Utility commands
cleanup: ## Clean up Docker system
	@echo "🧹 Cleaning up Docker system..."
	docker system prune -f
	docker volume prune -f
	@echo "✅ Docker cleanup completed"

# Service-specific commands
auth-logs: ## Show logs for auth service
	docker compose logs -f auth-service

user-logs: ## Show logs for user service
	docker compose logs -f user-service

campaign-logs: ## Show logs for campaign service
	docker compose logs -f campaign-service

chat-logs: ## Show logs for chat service
	docker compose logs -f chat-service

ai-logs: ## Show logs for AI service
	docker compose logs -f ai-service

notification-logs: ## Show logs for notification service
	docker compose logs -f notification-service

analytics-logs: ## Show logs for analytics service
	docker compose logs -f analytics-service

file-logs: ## Show logs for file service
	docker compose logs -f file-service

# Health check commands
health: ## Check health of all services
	@echo "🏥 Checking service health..."
	@echo "API Gateway:"
	@curl -s http://localhost:3000/health | jq . || echo "❌ API Gateway not responding"
	@echo "Auth Service:"
	@curl -s http://localhost:3001/health | jq . || echo "❌ Auth Service not responding"
	@echo "User Service:"
	@curl -s http://localhost:3002/health | jq . || echo "❌ User Service not responding"
	@echo "Campaign Service:"
	@curl -s http://localhost:3003/health | jq . || echo "❌ Campaign Service not responding"
	@echo "Chat Service:"
	@curl -s http://localhost:3004/health | jq . || echo "❌ Chat Service not responding"
	@echo "AI Service:"
	@curl -s http://localhost:3005/health | jq . || echo "❌ AI Service not responding"
	@echo "Notification Service:"
	@curl -s http://localhost:3006/health | jq . || echo "❌ Notification Service not responding"
	@echo "Analytics Service:"
	@curl -s http://localhost:3007/health | jq . || echo "❌ Analytics Service not responding"
	@echo "File Service:"
	@curl -s http://localhost:3008/health | jq . || echo "❌ File Service not responding"

# Database commands
db-migrate: ## Run database migrations
	@echo "🗄️ Running database migrations..."
	@echo "This would run migrations for each service database"
	@echo "Individual service migrations should be run in each service directory"

# Monitoring commands
monitor: ## Open monitoring dashboards
	@echo "📊 Opening monitoring dashboards..."
	@echo "Grafana: http://localhost:3001 (admin/admin123)"
	@echo "Prometheus: http://localhost:9090"
	@echo "Jaeger: http://localhost:16686"
	@echo "MinIO Console: http://localhost:9002 (minioadmin/minioadmin123)"

# Development setup
setup: ## Initial setup for development
	@echo "🛠️ Setting up development environment..."
	@if [ ! -f .env ]; then \
		cp env.example .env; \
		echo "✅ Created .env file from template"; \
		echo "⚠️  Please edit .env file with your configuration"; \
	else \
		echo "✅ .env file already exists"; \
	fi
	@chmod +x scripts/start-microservices.sh
	@echo "✅ Made startup script executable"
	@echo "✅ Development setup completed"

# Production commands
prod-deploy: ## Deploy to production (placeholder)
	@echo "🚀 Production deployment..."
	@echo "This would deploy to production environment"
	@echo "Please implement production deployment pipeline"

# Backup commands
backup: ## Backup data (placeholder)
	@echo "💾 Creating backup..."
	@echo "This would create backups of all databases and data"
	@echo "Please implement backup strategy"

# Restore commands
restore: ## Restore data (placeholder)
	@echo "🔄 Restoring data..."
	@echo "This would restore from backups"
	@echo "Please implement restore strategy"
