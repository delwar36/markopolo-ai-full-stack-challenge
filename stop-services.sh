#!/bin/bash

# Stop all microservices
echo "Stopping Markopolo AI Microservices..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to stop a service
stop_service() {
    local service_name=$1
    local pid_file="/tmp/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 $pid 2>/dev/null; then
            echo -e "${YELLOW}Stopping $service_name (PID: $pid)...${NC}"
            kill $pid
            sleep 1
            
            # Force kill if still running
            if kill -0 $pid 2>/dev/null; then
                kill -9 $pid
            fi
            
            echo -e "${GREEN}✓ $service_name stopped${NC}"
        else
            echo -e "${RED}✗ $service_name was not running${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${RED}✗ PID file not found for $service_name${NC}"
    fi
}

# Stop services in reverse order
echo -e "${YELLOW}Stopping microservices...${NC}"

stop_service "api-gateway"
stop_service "ai-service"
stop_service "chat-service"
stop_service "campaign-service"
stop_service "user-service"
stop_service "auth-service"

# Clean up any remaining processes
echo -e "${YELLOW}Cleaning up remaining processes...${NC}"
pkill -f "ts-node-dev.*microservices" 2>/dev/null || true
pkill -f "node.*microservices" 2>/dev/null || true

echo -e "${GREEN}All services stopped!${NC}"
