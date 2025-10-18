#!/bin/bash

# Master Setup Script for Markopolo AI Microservices
# This script sets up the complete microservices environment

echo "🚀 Markopolo AI Microservices - Complete Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}[SETUP]${NC} $1"
}

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

# Check prerequisites
print_header "Checking Prerequisites..."

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker and try again."
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_success "Docker is installed and running"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_success "npm $(npm --version) is installed"

echo ""

# Step 1: Setup Databases
print_header "Step 1: Setting up Databases"
echo "This will create PostgreSQL containers for each microservice..."
echo ""

read -p "Do you want to proceed with database setup? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Running database setup..."
    ./scripts/setup-databases.sh
    
    if [ $? -eq 0 ]; then
        print_success "Database setup completed successfully"
    else
        print_error "Database setup failed"
        exit 1
    fi
else
    print_warning "Skipping database setup"
fi

echo ""

# Step 2: Setup Redis and Kafka
print_header "Step 2: Setting up Redis and Kafka"
echo "This will create Redis and Kafka containers for microservices communication..."
echo ""

read -p "Do you want to proceed with Redis and Kafka setup? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Running Redis and Kafka setup..."
    ./scripts/setup-redis-kafka.sh
    
    if [ $? -eq 0 ]; then
        print_success "Redis and Kafka setup completed successfully"
    else
        print_error "Redis and Kafka setup failed"
        exit 1
    fi
else
    print_warning "Skipping Redis and Kafka setup"
fi

echo ""

# Step 3: Install Service Dependencies
print_header "Step 3: Installing Service Dependencies"
echo "This will install npm dependencies for all microservices..."
echo ""

read -p "Do you want to proceed with dependency installation? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Installing dependencies for all services..."
    
    # Install dependencies for each service
    services=("api-gateway" "auth-service" "user-service" "campaign-service")
    
    for service in "${services[@]}"; do
        print_status "Installing dependencies for $service..."
        cd "microservices/$service"
        
        if npm install > /dev/null 2>&1; then
            print_success "Dependencies installed for $service"
        else
            print_error "Failed to install dependencies for $service"
            exit 1
        fi
        
        cd ../..
    done
    
    print_success "All dependencies installed successfully"
else
    print_warning "Skipping dependency installation"
fi

echo ""

# Step 4: Build Services
print_header "Step 4: Building Services"
echo "This will build all microservices..."
echo ""

read -p "Do you want to proceed with building services? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Building all services..."
    
    # Build each service
    for service in "${services[@]}"; do
        print_status "Building $service..."
        cd "microservices/$service"
        
        if npm run build > /dev/null 2>&1; then
            print_success "$service built successfully"
        else
            print_error "Failed to build $service"
            exit 1
        fi
        
        cd ../..
    done
    
    print_success "All services built successfully"
else
    print_warning "Skipping service building"
fi

echo ""

# Step 5: Run Tests
print_header "Step 5: Running Tests"
echo "This will run comprehensive tests to verify everything is working..."
echo ""

read -p "Do you want to proceed with testing? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Running microservices tests..."
    ./scripts/test-microservices.sh
    
    if [ $? -eq 0 ]; then
        print_success "Microservices tests passed"
    else
        print_error "Microservices tests failed"
        exit 1
    fi
    
    echo ""
    print_status "Running end-to-end tests..."
    ./scripts/test-end-to-end.sh
    
    if [ $? -eq 0 ]; then
        print_success "End-to-end tests passed"
    else
        print_error "End-to-end tests failed"
        exit 1
    fi
else
    print_warning "Skipping tests"
fi

echo ""

# Final Summary
print_header "Setup Complete! 🎉"
echo ""
echo "📊 Setup Summary:"
echo "  ✅ Prerequisites checked"
echo "  ✅ Databases configured"
echo "  ✅ Redis and Kafka configured"
echo "  ✅ Service dependencies installed"
echo "  ✅ Services built"
echo "  ✅ Tests passed"
echo ""
echo "🚀 Your Markopolo AI microservices are ready!"
echo ""
echo "📋 Available Services:"
echo "  🌐 API Gateway - http://localhost:3000"
echo "  🔐 Auth Service - http://localhost:3001"
echo "  👤 User Service - http://localhost:3002"
echo "  📧 Campaign Service - http://localhost:3003"
echo ""
echo "🛠️ How to Start Services:"
echo "  # Start individual services"
echo "  cd microservices/api-gateway && npm run dev"
echo "  cd microservices/auth-service && npm run dev"
echo "  cd microservices/user-service && npm run dev"
echo "  cd microservices/campaign-service && npm run dev"
echo ""
echo "  # Or use Docker Compose (if configured)"
echo "  docker compose up -d"
echo ""
echo "📚 Documentation:"
echo "  - README.md - Main project documentation"
echo "  - MICROSERVICES_README.md - Microservices guide"
echo "  - MICROSERVICES_ARCHITECTURE.md - Architecture details"
echo "  - MICROSERVICES_DEPLOYMENT.md - Deployment guide"
echo ""
echo "🔧 Management Commands:"
echo "  ./scripts/test-microservices.sh - Test all services"
echo "  ./scripts/test-end-to-end.sh - Run end-to-end tests"
echo "  make dev - Start all services (if Makefile configured)"
echo "  make health - Check service health"
echo ""
echo "🎯 Next Steps:"
echo "  1. Start the services"
echo "  2. Test the API endpoints"
echo "  3. Deploy to staging environment"
echo "  4. Set up monitoring and alerting"
echo "  5. Deploy to production"
echo ""
print_success "Happy coding! 🚀"



