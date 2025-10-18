#!/bin/bash

# Monitoring script for microservices
echo "Markopolo AI Microservices Monitoring Dashboard"
echo "=============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check service health
check_service() {
    local service_name=$1
    local port=$2
    local url=$3
    
    echo -n "Checking $service_name on port $port... "
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ HEALTHY${NC}"
        return 0
    else
        echo -e "${RED}✗ UNHEALTHY${NC}"
        return 1
    fi
}

# Function to get service stats
get_service_stats() {
    local service_name=$1
    local pid_file="/tmp/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            local memory=$(ps -o rss= -p $pid 2>/dev/null | awk '{print $1/1024 " MB"}')
            local cpu=$(ps -o %cpu= -p $pid 2>/dev/null | awk '{print $1 "%"}')
            echo "  PID: $pid | Memory: $memory | CPU: $cpu"
        else
            echo "  Process not running"
        fi
    else
        echo "  No PID file found"
    fi
}

echo -e "${BLUE}Service Health Status:${NC}"
echo "========================"

# Check all services
check_service "API Gateway" "3000" "http://localhost:3000/health"
check_service "Auth Service" "3001" "http://localhost:3001/health"
check_service "User Service" "3002" "http://localhost:3002/health"
check_service "Campaign Service" "3003" "http://localhost:3003/health"
check_service "Chat Service" "3004" "http://localhost:3004/health"
check_service "AI Service" "3005" "http://localhost:3005/health"

echo ""
echo -e "${BLUE}Service Statistics:${NC}"
echo "===================="

get_service_stats "api-gateway"
get_service_stats "auth-service"
get_service_stats "user-service"
get_service_stats "campaign-service"
get_service_stats "chat-service"
get_service_stats "ai-service"

echo ""
echo -e "${BLUE}Recent Logs:${NC}"
echo "============="

# Show recent logs from each service
for service in api-gateway auth-service user-service campaign-service chat-service ai-service; do
    if [ -f "/tmp/${service}.log" ]; then
        echo -e "${YELLOW}--- $service ---${NC}"
        tail -3 "/tmp/${service}.log" 2>/dev/null || echo "No recent logs"
        echo ""
    fi
done

echo -e "${BLUE}Quick Actions:${NC}"
echo "=============="
echo "• View logs: tail -f /tmp/[service-name].log"
echo "• Restart services: ./stop-services.sh && ./start-services.sh"
echo "• Test APIs: ./test-api-integration.sh"
echo "• Stop all: ./stop-services.sh"
