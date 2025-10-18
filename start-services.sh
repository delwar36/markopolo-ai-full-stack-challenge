#!/bin/bash

# Start all microservices
echo "Starting Markopolo AI Microservices..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to start a service
start_service() {
    local service_name=$1
    local port=$2
    local directory=$3
    
    echo -e "${BLUE}Starting $service_name on port $port...${NC}"
    
    cd "$directory"
    
    # Start service in background
    npm run dev > "/tmp/${service_name}.log" 2>&1 &
    local pid=$!
    
    # Wait a moment for service to start
    sleep 2
    
    # Check if service is running
    if kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✓ $service_name started successfully (PID: $pid)${NC}"
        echo $pid > "/tmp/${service_name}.pid"
    else
        echo -e "${RED}✗ Failed to start $service_name${NC}"
        echo "Check logs: /tmp/${service_name}.log"
        return 1
    fi
}

# Create logs directory
mkdir -p /tmp/markopolo-logs

# Start services
echo -e "${YELLOW}Starting microservices...${NC}"

start_service "auth-service" "3001" "/home/delwar36/Projects/Personal/markopolo-ai-full-stack-challenge/microservices/auth-service"
start_service "user-service" "3002" "/home/delwar36/Projects/Personal/markopolo-ai-full-stack-challenge/microservices/user-service"
start_service "campaign-service" "3003" "/home/delwar36/Projects/Personal/markopolo-ai-full-stack-challenge/microservices/campaign-service"
start_service "chat-service" "3004" "/home/delwar36/Projects/Personal/markopolo-ai-full-stack-challenge/microservices/chat-service"
start_service "ai-service" "3005" "/home/delwar36/Projects/Personal/markopolo-ai-full-stack-challenge/microservices/ai-service"

# Wait a moment for all services to start
sleep 3

# Start API Gateway last
start_service "api-gateway" "3000" "/home/delwar36/Projects/Personal/markopolo-ai-full-stack-challenge/microservices/api-gateway"

echo -e "\n${GREEN}All services started!${NC}"
echo -e "${YELLOW}Service URLs:${NC}"
echo "  API Gateway:    http://localhost:3000"
echo "  Auth Service:    http://localhost:3001"
echo "  User Service:    http://localhost:3002"
echo "  Campaign Service: http://localhost:3003"
echo "  Chat Service:    http://localhost:3004"
echo "  AI Service:      http://localhost:3005"

echo -e "\n${YELLOW}To stop all services, run: ./stop-services.sh${NC}"
echo -e "${YELLOW}To view logs, check: /tmp/*.log${NC}"
echo -e "${YELLOW}To test APIs, run: ./test-api-integration.sh${NC}"
