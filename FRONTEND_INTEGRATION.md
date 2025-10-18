# Frontend Configuration for Event-Driven Architecture

## Overview
The Next.js legacy app has been updated to use the event-driven API Gateway instead of direct database calls.

## Updated API Routes
- `/api/campaigns` - Now forwards to API Gateway `/campaigns`
- `/api/auth/login` - Now forwards to API Gateway `/auth/login`
- `/api/auth/register` - Now forwards to API Gateway `/auth/register`
- `/api/generate-campaign` - Now forwards to API Gateway `/generate-campaign`
- `/api/chat` - Now forwards to API Gateway `/chat`

## Environment Variables
Set these in your `.env.local` file:

```bash
# API Gateway Configuration
API_GATEWAY_URL=http://localhost:3000

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-key
```

## Architecture Flow
```
Frontend (Next.js) → API Routes → API Gateway (Event-Driven) → Microservices
```

## Benefits
1. **Event-Driven**: All requests now go through Kafka events
2. **Scalable**: Services can scale independently
3. **Fault Tolerant**: Better error handling and retry mechanisms
4. **Observable**: Full request tracing with correlation IDs

## Testing
1. Start the API Gateway: `cd microservices/api-gateway && npm run dev` (port 3000)
2. Start the microservices: `cd microservices/campaign-service && npm run dev` (port 3003)
3. Start the frontend: `cd legacy-app && npm run dev` (port 3006)
4. Access the app at `http://localhost:3006`

The frontend will now use the event-driven architecture through the API Gateway!
