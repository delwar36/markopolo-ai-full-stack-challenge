#!/bin/bash

# Markopolo AI Microservices Startup Script
# This script starts the microservices architecture for local development

set -e

echo "🚀 Starting Markopolo AI Microservices Architecture..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from env.example..."
    cp env.example .env
    print_warning "Please edit .env file with your configuration before continuing."
    print_warning "Press Enter to continue after editing .env file..."
    read
fi

# Create logs directory
mkdir -p logs

print_status "Starting infrastructure services..."

# Start infrastructure services first
docker compose up -d zookeeper kafka redis postgres-auth postgres-users postgres-campaigns postgres-chat postgres-ai postgres-notifications clickhouse minio

print_status "Waiting for infrastructure services to be ready..."
sleep 30

# Check if infrastructure services are healthy
print_status "Checking infrastructure services health..."

# Check Redis
if docker compose exec -T redis redis-cli ping | grep -q "PONG"; then
    print_success "Redis is ready"
else
    print_error "Redis is not ready"
    exit 1
fi

# Check Kafka
if docker compose exec -T kafka kafka-topics --bootstrap-server localhost:9092 --list > /dev/null 2>&1; then
    print_success "Kafka is ready"
else
    print_error "Kafka is not ready"
    exit 1
fi

# Check PostgreSQL services
for db in postgres-auth postgres-users postgres-campaigns postgres-chat postgres-ai postgres-notifications; do
    if docker compose exec -T $db pg_isready -U postgres > /dev/null 2>&1; then
        print_success "$db is ready"
    else
        print_error "$db is not ready"
        exit 1
    fi
done

print_status "Starting microservices..."

# Start microservices
docker compose up -d api-gateway auth-service user-service campaign-service chat-service ai-service notification-service analytics-service file-service

print_status "Waiting for microservices to start..."
sleep 20

# Check microservices health
print_status "Checking microservices health..."

services=("api-gateway:3000" "auth-service:3001" "user-service:3002" "campaign-service:3003" "chat-service:3004" "ai-service:3005" "notification-service:3006" "analytics-service:3007" "file-service:3008")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -s http://localhost:$port/health > /dev/null 2>&1; then
        print_success "$name is healthy"
    else
        print_warning "$name is not responding (this might be normal if the service is still starting)"
    fi
done

print_success "Microservices architecture started successfully!"

echo ""
echo "🌐 Service URLs:"
echo "  API Gateway:     http://localhost:3000"
echo "  Auth Service:    http://localhost:3001"
echo "  User Service:    http://localhost:3002"
echo "  Campaign Service: http://localhost:3003"
echo "  Chat Service:    http://localhost:3004"
echo "  AI Service:      http://localhost:3005"
echo "  Notification Service: http://localhost:3006"
echo "  Analytics Service: http://localhost:3007"
echo "  File Service:    http://localhost:3008"
echo ""
echo "📊 Monitoring URLs:"
echo "  Prometheus:      http://localhost:9090"
echo "  Grafana:         http://localhost:3001 (admin/admin123)"
echo "  Jaeger:          http://localhost:16686"
echo "  MinIO Console:   http://localhost:9002 (minioadmin/minioadmin123)"
echo ""
echo "🔧 Management Commands:"
echo "  View logs:       docker-compose logs -f [service-name]"
echo "  Stop services:   docker-compose down"
echo "  Restart service: docker-compose restart [service-name]"
echo "  Scale service:   docker-compose up -d --scale [service-name]=3"
echo ""
echo "📝 Next Steps:"
echo "  1. Test the API Gateway: curl http://localhost:3000/health"
echo "  2. Register a user: curl -X POST http://localhost:3000/api/auth/register -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}'"
echo "  3. Check Grafana dashboards for monitoring"
echo "  4. Review logs if any service is not working properly"
echo ""

print_success "🎉 Markopolo AI Microservices are ready for development!"
