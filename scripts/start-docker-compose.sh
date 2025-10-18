#!/bin/bash

# Start Core Microservices with Docker Compose
# This script starts only the essential services

echo "🚀 Starting Core Markopolo AI Microservices with Docker Compose..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Start only the core services
print_status "Starting core services..."

# Start infrastructure first
docker compose up -d redis zookeeper kafka

# Wait for infrastructure to be ready
print_status "Waiting for infrastructure to be ready..."
sleep 10

# Start core microservices
docker compose up -d api-gateway auth-service user-service campaign-service

print_status "Waiting for services to start..."
sleep 15

# Test services
print_status "Testing services..."

services=(
    "api-gateway:3000"
    "auth-service:3001"
    "user-service:3002"
    "campaign-service:3003"
)

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    
    if curl -s http://localhost:$port/health > /dev/null 2>&1; then
        print_success "$name is healthy"
    else
        print_status "$name is starting..."
    fi
done

echo ""
print_success "🎉 Core microservices started!"
echo ""
echo "📊 Service Status:"
echo "  🌐 API Gateway - http://localhost:3000"
echo "  🔐 Auth Service - http://localhost:3001"
echo "  👤 User Service - http://localhost:3002"
echo "  📧 Campaign Service - http://localhost:3003"
echo ""
echo "🧪 Test the services:"
echo "  curl http://localhost:3000/health"
echo "  curl http://localhost:3001/health"
echo "  curl http://localhost:3002/health"
echo "  curl http://localhost:3003/health"
echo ""
echo "🛠️ Management commands:"
echo "  docker compose ps - Check service status"
echo "  docker compose logs -f [service] - View logs"
echo "  docker compose down - Stop all services"



