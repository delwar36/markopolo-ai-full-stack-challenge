#!/bin/bash

# Redis and Kafka Setup Script for Markopolo AI Microservices
# This script sets up Redis and Kafka for the microservices

echo "🔴 Setting up Redis and Kafka for Markopolo AI Microservices..."

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_success "Docker is running"

# Setup Redis
print_status "Setting up Redis..."

# Start Redis container
docker run -d \
    --name redis-markopolo \
    -p 6379:6379 \
    -v redis-markopolo-data:/data \
    redis:7-alpine redis-server --appendonly yes

if [ $? -eq 0 ]; then
    print_success "Redis container started on port 6379"
else
    print_error "Failed to start Redis container"
    exit 1
fi

# Wait for Redis to be ready
print_status "Waiting for Redis to be ready..."
sleep 5

# Test Redis connection
if docker exec redis-markopolo redis-cli ping | grep -q "PONG"; then
    print_success "Redis is ready and responding"
else
    print_error "Redis is not responding"
    exit 1
fi

# Setup Kafka and Zookeeper
print_status "Setting up Kafka and Zookeeper..."

# Start Zookeeper
docker run -d \
    --name zookeeper-markopolo \
    -p 2181:2181 \
    -e ZOOKEEPER_CLIENT_PORT=2181 \
    -e ZOOKEEPER_TICK_TIME=2000 \
    confluentinc/cp-zookeeper:7.4.0

if [ $? -eq 0 ]; then
    print_success "Zookeeper container started on port 2181"
else
    print_error "Failed to start Zookeeper container"
    exit 1
fi

# Wait for Zookeeper to be ready
print_status "Waiting for Zookeeper to be ready..."
sleep 10

# Start Kafka
docker run -d \
    --name kafka-markopolo \
    -p 9092:9092 \
    -e KAFKA_BROKER_ID=1 \
    -e KAFKA_ZOOKEEPER_CONNECT=zookeeper-markopolo:2181 \
    -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
    -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
    -e KAFKA_AUTO_CREATE_TOPICS_ENABLE=true \
    --link zookeeper-markopolo:zookeeper \
    confluentinc/cp-kafka:7.4.0

if [ $? -eq 0 ]; then
    print_success "Kafka container started on port 9092"
else
    print_error "Failed to start Kafka container"
    exit 1
fi

# Wait for Kafka to be ready
print_status "Waiting for Kafka to be ready..."
sleep 15

# Test Kafka connection
if docker exec kafka-markopolo kafka-topics --bootstrap-server localhost:9092 --list > /dev/null 2>&1; then
    print_success "Kafka is ready and responding"
else
    print_error "Kafka is not responding"
    exit 1
fi

# Create Kafka topics for microservices
print_status "Creating Kafka topics for microservices..."

# Define topics for each service
declare -a TOPICS=(
    "user.events"
    "campaign.events"
    "auth.events"
    "notification.events"
    "analytics.events"
    "chat.events"
    "ai.events"
    "file.events"
)

for topic in "${TOPICS[@]}"; do
    print_status "Creating topic: $topic"
    
    docker exec kafka-markopolo kafka-topics \
        --bootstrap-server localhost:9092 \
        --create \
        --topic "$topic" \
        --partitions 3 \
        --replication-factor 1 \
        --if-not-exists
    
    if [ $? -eq 0 ]; then
        print_success "Topic $topic created successfully"
    else
        print_warning "Failed to create topic $topic (might already exist)"
    fi
done

# List all topics
print_status "Listing all Kafka topics..."
docker exec kafka-markopolo kafka-topics --bootstrap-server localhost:9092 --list

# Setup Redis databases for different services
print_status "Setting up Redis databases for different services..."

# Create Redis databases for each service
declare -A REDIS_DBS=(
    ["auth"]="1"
    ["users"]="2"
    ["campaigns"]="3"
    ["chat"]="4"
    ["ai"]="5"
    ["notifications"]="6"
    ["analytics"]="7"
    ["files"]="8"
)

for service in "${!REDIS_DBS[@]}"; do
    db_num="${REDIS_DBS[$service]}"
    print_status "Setting up Redis database $db_num for $service service"
    
    # Test database selection
    docker exec redis-markopolo redis-cli -n "$db_num" ping > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "Redis database $db_num is ready for $service service"
    else
        print_error "Failed to setup Redis database $db_num for $service service"
    fi
done

# Create environment file for services
print_status "Creating environment configuration file..."

cat > .env << EOF
# Database Configuration
AUTH_DB_HOST=localhost
AUTH_DB_PORT=5432
AUTH_DB_NAME=markopolo_auth
AUTH_DB_USER=postgres
AUTH_DB_PASSWORD=markopolo123

USER_DB_HOST=localhost
USER_DB_PORT=5433
USER_DB_NAME=markopolo_users
USER_DB_USER=postgres
USER_DB_PASSWORD=markopolo123

CAMPAIGN_DB_HOST=localhost
CAMPAIGN_DB_PORT=5434
CAMPAIGN_DB_NAME=markopolo_campaigns
CAMPAIGN_DB_USER=postgres
CAMPAIGN_DB_PASSWORD=markopolo123

CHAT_DB_HOST=localhost
CHAT_DB_PORT=5435
CHAT_DB_NAME=markopolo_chat
CHAT_DB_USER=postgres
CHAT_DB_PASSWORD=markopolo123

AI_DB_HOST=localhost
AI_DB_PORT=5436
AI_DB_NAME=markopolo_ai
AI_DB_USER=postgres
AI_DB_PASSWORD=markopolo123

NOTIFICATION_DB_HOST=localhost
NOTIFICATION_DB_PORT=5437
NOTIFICATION_DB_NAME=markopolo_notifications
NOTIFICATION_DB_USER=postgres
NOTIFICATION_DB_PASSWORD=markopolo123

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB_AUTH=1
REDIS_DB_USERS=2
REDIS_DB_CAMPAIGNS=3
REDIS_DB_CHAT=4
REDIS_DB_AI=5
REDIS_DB_NOTIFICATIONS=6
REDIS_DB_ANALYTICS=7
REDIS_DB_FILES=8

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=markopolo-microservices
KAFKA_GROUP_ID=markopolo-group

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
CAMPAIGN_SERVICE_URL=http://localhost:3003
CHAT_SERVICE_URL=http://localhost:3004
AI_SERVICE_URL=http://localhost:3005
NOTIFICATION_SERVICE_URL=http://localhost:3006
ANALYTICS_SERVICE_URL=http://localhost:3007
FILE_SERVICE_URL=http://localhost:3008

# API Gateway Configuration
API_GATEWAY_PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Environment
NODE_ENV=development
LOG_LEVEL=info
EOF

print_success "Environment configuration file created (.env)"

print_success "🎉 Redis and Kafka setup completed!"

echo ""
echo "📊 Infrastructure Summary:"
echo "  ✅ Redis - Port 6379 (8 databases for different services)"
echo "  ✅ Zookeeper - Port 2181"
echo "  ✅ Kafka - Port 9092 (8 topics for different services)"
echo ""
echo "🔧 Connection Details:"
echo "  Redis: redis://localhost:6379"
echo "  Kafka: localhost:9092"
echo "  Zookeeper: localhost:2181"
echo ""
echo "📋 Kafka Topics Created:"
for topic in "${TOPICS[@]}"; do
    echo "  ✅ $topic"
done
echo ""
echo "🗄️ Redis Databases:"
for service in "${!REDIS_DBS[@]}"; do
    echo "  ✅ Database ${REDIS_DBS[$service]}: $service service"
done
echo ""
echo "💡 To test Redis:"
echo "  docker exec redis-markopolo redis-cli ping"
echo "  docker exec redis-markopolo redis-cli -n 1 ping"
echo ""
echo "💡 To test Kafka:"
echo "  docker exec kafka-markopolo kafka-topics --bootstrap-server localhost:9092 --list"
echo ""
echo "🛠️ To stop Redis and Kafka:"
echo "  docker stop redis-markopolo zookeeper-markopolo kafka-markopolo"
echo ""
echo "🧹 To remove Redis and Kafka:"
echo "  docker rm redis-markopolo zookeeper-markopolo kafka-markopolo"
echo "  docker volume rm redis-markopolo-data"



