#!/bin/bash

# Database Setup Script for Markopolo AI Microservices
# This script sets up all required databases for the microservices

echo "🗄️ Setting up Markopolo AI Microservices Databases..."

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

# Database configuration
declare -A DATABASES=(
    ["auth"]="markopolo_auth:5432"
    ["users"]="markopolo_users:5433"
    ["campaigns"]="markopolo_campaigns:5434"
    ["chat"]="markopolo_chat:5435"
    ["ai"]="markopolo_ai:5436"
    ["notifications"]="markopolo_notifications:5437"
)

# Start PostgreSQL containers for each service
print_status "Starting PostgreSQL containers..."

for service in "${!DATABASES[@]}"; do
    IFS=':' read -r db_name port <<< "${DATABASES[$service]}"
    
    print_status "Starting PostgreSQL for $service service (port $port)..."
    
    docker run -d \
        --name "postgres-$service" \
        -e POSTGRES_DB="$db_name" \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=markopolo123 \
        -p "$port:5432" \
        -v "postgres-$service-data:/var/lib/postgresql/data" \
        postgres:15-alpine
    
    if [ $? -eq 0 ]; then
        print_success "PostgreSQL container for $service started on port $port"
    else
        print_error "Failed to start PostgreSQL container for $service"
    fi
done

# Wait for databases to be ready
print_status "Waiting for databases to be ready..."
sleep 10

# Test database connections
print_status "Testing database connections..."

for service in "${!DATABASES[@]}"; do
    IFS=':' read -r db_name port <<< "${DATABASES[$service]}"
    
    if docker exec "postgres-$service" pg_isready -U postgres > /dev/null 2>&1; then
        print_success "Database $service is ready"
    else
        print_error "Database $service is not ready"
    fi
done

# Create database schemas
print_status "Creating database schemas..."

# Auth service schema
print_status "Creating auth service schema..."
docker exec -i postgres-auth psql -U postgres -d markopolo_auth << 'EOF'
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_accessed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
EOF

if [ $? -eq 0 ]; then
    print_success "Auth service schema created"
else
    print_error "Failed to create auth service schema"
fi

# User service schema
print_status "Creating user service schema..."
docker exec -i postgres-users psql -U postgres -d markopolo_users << 'EOF'
CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    company VARCHAR(100),
    job_title VARCHAR(100),
    location VARCHAR(100),
    website TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'auto',
    notifications BOOLEAN DEFAULT TRUE,
    email_frequency VARCHAR(20) DEFAULT 'weekly',
    data_sharing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_analytics (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    campaign_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    total_session_time INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
EOF

if [ $? -eq 0 ]; then
    print_success "User service schema created"
else
    print_error "Failed to create user service schema"
fi

# Campaign service schema
print_status "Creating campaign service schema..."
docker exec -i postgres-campaigns psql -U postgres -d markopolo_campaigns << 'EOF'
CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    channel VARCHAR(50) NOT NULL,
    data_source VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft',
    target_audience TEXT,
    budget DECIMAL(10,2),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_stats (
    id VARCHAR(255) PRIMARY KEY,
    campaign_id VARCHAR(255) UNIQUE NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    total_sent INTEGER DEFAULT 0,
    delivered INTEGER DEFAULT 0,
    opened INTEGER DEFAULT 0,
    clicked INTEGER DEFAULT 0,
    converted INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,4) DEFAULT 0,
    open_rate DECIMAL(5,4) DEFAULT 0,
    click_rate DECIMAL(5,4) DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_templates (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    channel VARCHAR(50) NOT NULL,
    template_data JSONB,
    is_public BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_stats_campaign_id ON campaign_stats(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_channel ON campaign_templates(channel);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_is_public ON campaign_templates(is_public);
EOF

if [ $? -eq 0 ]; then
    print_success "Campaign service schema created"
else
    print_error "Failed to create campaign service schema"
fi

print_success "🎉 Database setup completed!"

echo ""
echo "📊 Database Summary:"
echo "  ✅ Auth Service DB (markopolo_auth) - Port 5432"
echo "  ✅ User Service DB (markopolo_users) - Port 5433"
echo "  ✅ Campaign Service DB (markopolo_campaigns) - Port 5434"
echo "  ✅ Chat Service DB (markopolo_chat) - Port 5435"
echo "  ✅ AI Service DB (markopolo_ai) - Port 5436"
echo "  ✅ Notification Service DB (markopolo_notifications) - Port 5437"
echo ""
echo "🔧 Database Connection Details:"
echo "  Host: localhost"
echo "  Username: postgres"
echo "  Password: markopolo123"
echo ""
echo "💡 To connect to a specific database:"
echo "  psql -h localhost -p 5432 -U postgres -d markopolo_auth"
echo "  psql -h localhost -p 5433 -U postgres -d markopolo_users"
echo "  psql -h localhost -p 5434 -U postgres -d markopolo_campaigns"
echo ""
echo "🛠️ To stop all databases:"
echo "  docker stop postgres-auth postgres-users postgres-campaigns postgres-chat postgres-ai postgres-notifications"
echo ""
echo "🧹 To remove all databases:"
echo "  docker rm postgres-auth postgres-users postgres-campaigns postgres-chat postgres-ai postgres-notifications"
echo "  docker volume rm postgres-auth-data postgres-users-data postgres-campaigns-data postgres-chat-data postgres-ai-data postgres-notifications-data"



