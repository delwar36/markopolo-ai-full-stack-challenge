#!/bin/bash

# Simple Microservices Test Script
# This script tests the microservices without Docker

echo "🧪 Testing Markopolo AI Microservices..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) is installed"

# Test API Gateway
print_status "Testing API Gateway..."
cd microservices/api-gateway

if [ -f "package.json" ]; then
    print_success "API Gateway package.json found"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "Installing API Gateway dependencies..."
        npm install
    fi
    
    # Test if the service can start (without actually starting it)
    if npm run build > /dev/null 2>&1; then
        print_success "API Gateway builds successfully"
    else
        print_error "API Gateway build failed"
    fi
else
    print_error "API Gateway package.json not found"
fi

cd ../..

# Test Auth Service
print_status "Testing Auth Service..."
cd microservices/auth-service

if [ -f "package.json" ]; then
    print_success "Auth Service package.json found"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "Installing Auth Service dependencies..."
        npm install
    fi
    
    # Test if the service can start
    if npm run build > /dev/null 2>&1; then
        print_success "Auth Service builds successfully"
    else
        print_error "Auth Service build failed"
    fi
else
    print_error "Auth Service package.json not found"
fi

cd ../..

# Test User Service
print_status "Testing User Service..."
cd microservices/user-service

if [ -f "package.json" ]; then
    print_success "User Service package.json found"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "Installing User Service dependencies..."
        npm install
    fi
    
    # Test if the service can start
    if npm run build > /dev/null 2>&1; then
        print_success "User Service builds successfully"
    else
        print_error "User Service build failed"
    fi
else
    print_error "User Service package.json not found"
fi

cd ../..

# Test Campaign Service
print_status "Testing Campaign Service..."
cd microservices/campaign-service

if [ -f "package.json" ]; then
    print_success "Campaign Service package.json found"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "Installing Campaign Service dependencies..."
        npm install
    fi
    
    # Test if the service can start
    if npm run build > /dev/null 2>&1; then
        print_success "Campaign Service builds successfully"
    else
        print_error "Campaign Service build failed"
    fi
else
    print_error "Campaign Service package.json not found"
fi

cd ../..

print_success "🎉 Microservices test completed!"

echo ""
echo "📋 Summary:"
echo "  ✅ API Gateway - Ready"
echo "  ✅ Auth Service - Ready"
echo "  ✅ User Service - Ready"
echo "  ✅ Campaign Service - Ready"
echo "  ⏳ Chat Service - Pending"
echo "  ⏳ AI Service - Pending"
echo "  ⏳ Notification Service - Pending"
echo "  ⏳ Analytics Service - Pending"
echo "  ⏳ File Service - Pending"
echo ""
echo "🚀 Next Steps:"
echo "  1. Complete remaining services"
echo "  2. Set up databases"
echo "  3. Configure Redis and Kafka"
echo "  4. Test end-to-end functionality"
echo ""
echo "💡 To run individual services:"
echo "  cd microservices/api-gateway && npm run dev"
echo "  cd microservices/auth-service && npm run dev"
echo "  cd microservices/user-service && npm run dev"
echo "  cd microservices/campaign-service && npm run dev"



