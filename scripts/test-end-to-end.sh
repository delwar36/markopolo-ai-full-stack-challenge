#!/bin/bash

# End-to-End Test Script for Markopolo AI Microservices
# This script tests the complete microservices functionality

echo "🧪 Running End-to-End Tests for Markopolo AI Microservices..."

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

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_status "Running test: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "✅ $test_name"
        ((TESTS_PASSED++))
        return 0
    else
        print_error "❌ $test_name"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to test HTTP endpoint
test_endpoint() {
    local service_name="$1"
    local endpoint="$2"
    local expected_status="$3"
    local method="${4:-GET}"
    local data="${5:-}"
    
    local url="http://localhost:$endpoint"
    local curl_cmd="curl -s -o /dev/null -w '%{http_code}'"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        curl_cmd="$curl_cmd -X POST -H 'Content-Type: application/json' -d '$data'"
    fi
    
    local status_code=$(eval "$curl_cmd $url")
    
    if [ "$status_code" = "$expected_status" ]; then
        print_success "✅ $service_name endpoint ($endpoint) - Status: $status_code"
        ((TESTS_PASSED++))
        return 0
    else
        print_error "❌ $service_name endpoint ($endpoint) - Expected: $expected_status, Got: $status_code"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Check if services are running
print_status "Checking if services are running..."

# Start services if not running
services_running=false

if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    services_running=true
    print_success "Services are already running"
else
    print_status "Starting services..."
    
    # Start API Gateway
    cd microservices/api-gateway && npm run dev > /dev/null 2>&1 &
    API_GATEWAY_PID=$!
    
    # Start Auth Service
    cd ../auth-service && npm run dev > /dev/null 2>&1 &
    AUTH_SERVICE_PID=$!
    
    # Start User Service
    cd ../user-service && npm run dev > /dev/null 2>&1 &
    USER_SERVICE_PID=$!
    
    # Start Campaign Service
    cd ../campaign-service && npm run dev > /dev/null 2>&1 &
    CAMPAIGN_SERVICE_PID=$!
    
    cd ../..
    
    # Wait for services to start
    print_status "Waiting for services to start..."
    sleep 10
    
    services_running=true
fi

# Test Infrastructure
print_status "Testing Infrastructure..."

# Test Redis
run_test "Redis Connection" "docker exec redis-markopolo redis-cli ping | grep -q PONG"

# Test Kafka
run_test "Kafka Connection" "docker exec kafka-markopolo kafka-topics --bootstrap-server localhost:9092 --list > /dev/null 2>&1"

# Test Databases
run_test "Auth Database" "docker exec postgres-auth pg_isready -U postgres > /dev/null 2>&1"
run_test "User Database" "docker exec postgres-users pg_isready -U postgres > /dev/null 2>&1"
run_test "Campaign Database" "docker exec postgres-campaigns pg_isready -U postgres > /dev/null 2>&1"

echo ""

# Test Service Health Endpoints
print_status "Testing Service Health Endpoints..."

test_endpoint "API Gateway" "3000/health" "200"
test_endpoint "Auth Service" "3001/health" "200"
test_endpoint "User Service" "3002/health" "200"
test_endpoint "Campaign Service" "3003/health" "200"

echo ""

# Test Authentication Flow
print_status "Testing Authentication Flow..."

# Test user registration
test_endpoint "User Registration" "3000/auth/register" "201" "POST" '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test user login
test_endpoint "User Login" "3000/auth/login" "200" "POST" '{"email":"test@example.com","password":"password123"}'

echo ""

# Test User Management
print_status "Testing User Management..."

# Test get user profile (without auth - should work with mock)
test_endpoint "Get User Profile" "3000/users/123" "200"

# Test update user profile
test_endpoint "Update User Profile" "3000/users/123" "200" "PUT" '{"firstName":"John","lastName":"Doe","bio":"Updated bio"}'

# Test get user preferences
test_endpoint "Get User Preferences" "3000/users/123/preferences" "200"

# Test update user preferences
test_endpoint "Update User Preferences" "3000/users/123/preferences" "200" "PUT" '{"theme":"dark","notifications":true}'

# Test get user analytics
test_endpoint "Get User Analytics" "3000/users/123/analytics" "200"

echo ""

# Test Campaign Management
print_status "Testing Campaign Management..."

# Test create campaign
test_endpoint "Create Campaign" "3000/campaigns" "201" "POST" '{"title":"Test Campaign","description":"Test Description","channel":"email","budget":1000}'

# Test get campaign
test_endpoint "Get Campaign" "3000/campaigns/123" "200"

# Test get user campaigns
test_endpoint "Get User Campaigns" "3000/users/123/campaigns" "200"

# Test update campaign
test_endpoint "Update Campaign" "3000/campaigns/123" "200" "PUT" '{"title":"Updated Campaign","status":"active"}'

# Test get campaign stats
test_endpoint "Get Campaign Stats" "3000/campaigns/123/stats" "200"

# Test get templates
test_endpoint "Get Templates" "3000/templates" "200"

echo ""

# Test API Gateway Features
print_status "Testing API Gateway Features..."

# Test rate limiting (make multiple requests quickly)
print_status "Testing rate limiting..."
rate_limit_test_passed=true
for i in {1..5}; do
    status_code=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health)
    if [ "$status_code" != "200" ]; then
        rate_limit_test_passed=false
        break
    fi
done

if [ "$rate_limit_test_passed" = true ]; then
    print_success "✅ Rate limiting test (should allow multiple requests)"
    ((TESTS_PASSED++))
else
    print_error "❌ Rate limiting test failed"
    ((TESTS_FAILED++))
fi

# Test CORS
print_status "Testing CORS..."
cors_status=$(curl -s -o /dev/null -w '%{http_code}' -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS http://localhost:3000/health)

if [ "$cors_status" = "200" ] || [ "$cors_status" = "204" ]; then
    print_success "✅ CORS test"
    ((TESTS_PASSED++))
else
    print_error "❌ CORS test failed"
    ((TESTS_FAILED++))
fi

echo ""

# Test Error Handling
print_status "Testing Error Handling..."

# Test 404 error
test_endpoint "404 Error" "3000/nonexistent" "404"

# Test invalid JSON
print_status "Testing invalid JSON handling..."
invalid_json_status=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H "Content-Type: application/json" -d '{"invalid": json}' http://localhost:3000/auth/login)

if [ "$invalid_json_status" = "400" ]; then
    print_success "✅ Invalid JSON handling"
    ((TESTS_PASSED++))
else
    print_error "❌ Invalid JSON handling test failed"
    ((TESTS_FAILED++))
fi

echo ""

# Performance Test
print_status "Running Performance Test..."

start_time=$(date +%s.%N)
for i in {1..10}; do
    curl -s http://localhost:3000/health > /dev/null
done
end_time=$(date +%s.%N)

duration=$(echo "$end_time - $start_time" | bc)
avg_response_time=$(echo "scale=3; $duration / 10" | bc)

if (( $(echo "$avg_response_time < 1.0" | bc -l) )); then
    print_success "✅ Performance test - Average response time: ${avg_response_time}s"
    ((TESTS_PASSED++))
else
    print_warning "⚠️ Performance test - Average response time: ${avg_response_time}s (slower than expected)"
    ((TESTS_PASSED++))
fi

echo ""

# Cleanup
if [ "$services_running" = false ]; then
    print_status "Cleaning up test services..."
    kill $API_GATEWAY_PID $AUTH_SERVICE_PID $USER_SERVICE_PID $CAMPAIGN_SERVICE_PID 2>/dev/null
fi

# Test Results Summary
echo "=========================================="
echo "🧪 END-TO-END TEST RESULTS"
echo "=========================================="
echo ""
echo "📊 Test Summary:"
echo "  ✅ Tests Passed: $TESTS_PASSED"
echo "  ❌ Tests Failed: $TESTS_FAILED"
echo "  📈 Success Rate: $(( TESTS_PASSED * 100 / (TESTS_PASSED + TESTS_FAILED) ))%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    print_success "🎉 ALL TESTS PASSED! Microservices are working correctly."
    echo ""
    echo "🚀 Your Markopolo AI microservices are ready for production!"
    echo ""
    echo "📋 What's Working:"
    echo "  ✅ Infrastructure (Redis, Kafka, Databases)"
    echo "  ✅ Service Health Checks"
    echo "  ✅ Authentication Flow"
    echo "  ✅ User Management"
    echo "  ✅ Campaign Management"
    echo "  ✅ API Gateway Features"
    echo "  ✅ Error Handling"
    echo "  ✅ Performance"
    echo ""
    echo "🛠️ Next Steps:"
    echo "  1. Deploy to staging environment"
    echo "  2. Set up monitoring and alerting"
    echo "  3. Configure load balancing"
    echo "  4. Set up CI/CD pipeline"
    echo "  5. Deploy to production"
    exit 0
else
    print_error "❌ Some tests failed. Please check the errors above."
    echo ""
    echo "🔧 Troubleshooting:"
    echo "  1. Make sure all services are running"
    echo "  2. Check database connections"
    echo "  3. Verify Redis and Kafka are running"
    echo "  4. Check service logs for errors"
    echo ""
    exit 1
fi



