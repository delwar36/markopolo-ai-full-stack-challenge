# Port Configuration Summary

## 🚀 **Event-Driven Architecture Ports**

### **Microservices (Backend)**
- **Port 3000**: API Gateway (Event-driven)
- **Port 3001**: Auth Service (Legacy HTTP)
- **Port 3002**: User Service (Legacy HTTP)  
- **Port 3003**: Campaign Service (Event-driven)
- **Port 3004**: Chat Service (Legacy HTTP)
- **Port 3005**: AI Service (Event-driven)

### **Infrastructure**
- **Port 9092**: Kafka Broker

### **Frontend**
- **Port 3006**: Next.js Frontend Application

## 🔄 **Architecture Flow**

```
Frontend (3006) → API Gateway (3000) → Kafka Events → Microservices (3001-3005)
```

## 📋 **Startup Commands**

```bash
# 1. Start Infrastructure
docker-compose up -d  # Kafka + Zookeeper

# 2. Start Microservices
cd microservices/api-gateway && npm run dev      # Port 3000
cd microservices/campaign-service && npm run dev  # Port 3003
cd microservices/ai-service && npm run dev       # Port 3005

# 3. Start Frontend
cd legacy-app && npm run dev                     # Port 3006
```

## ✅ **Benefits**

1. **No Port Conflicts**: Each service runs on its dedicated port
2. **Event-Driven**: API Gateway and Campaign/AI services use Kafka
3. **Legacy Support**: Auth, User, and Chat services maintain HTTP
4. **Scalable**: Services can scale independently
5. **Frontend Integration**: Next.js app routes through API Gateway

## 🎯 **Access Points**

- **Frontend**: http://localhost:3006
- **API Gateway**: http://localhost:3000
- **Health Checks**: All services have `/health` endpoints
