# Data-Driven Campaign Generation with OpenAI

This document explains how the application uses real mock data from various data sources to generate dynamic, personalized marketing campaigns using OpenAI.

## Overview

The system now integrates realistic mock data for each connected data source and uses OpenAI to generate intelligent, data-driven campaign strategies that reference actual metrics, demographics, and performance indicators.

## Data Sources & Mock Data

### 1. Google Tag Manager (GTM)
**Mock Data Includes:**
- **Website Metrics**
  - Total Visitors: 45,230
  - Unique Visitors: 32,180
  - Page Views: 125,640
  - Average Session Duration: 3m 24s
  - Bounce Rate: 42%

- **Top Pages**
  - /products: 28,450 views (4m 12s avg time)
  - /pricing: 18,920 views (2m 45s avg time)
  - /blog: 15,680 views (3m 30s avg time)

- **User Behavior**
  - New vs Returning: 58% new, 42% returning
  - Top Events: product_view (12,450), add_to_cart (4,280), newsletter_signup (3,120)

- **Conversion Funnel**
  - Product Views: 12,450
  - Add to Cart: 4,280
  - Checkout Initiated: 2,150
  - Purchases: 1,680
  - Conversion Rate: 13.5%

### 2. Facebook Pixel
**Mock Data Includes:**
- **Audience Insights**
  - Total Reach: 125,000 people
  - Primary Age Group: 25-34 (35%)
  - Gender: 52% Female, 45% Male, 3% Other
  - Top Location: New York (18%)

- **Demographics**
  - Age ranges: 18-24 (15%), 25-34 (35%), 35-44 (28%), 45-54 (15%), 55+ (7%)
  - Top Cities: New York, Los Angeles, Chicago, San Francisco

- **Interests**
  - E-commerce: 92% affinity
  - Technology: 88% affinity
  - Fashion: 75% affinity
  - Health & Wellness: 68% affinity

- **Pixel Events**
  - View Content: 45,680
  - Add to Cart: 8,920
  - Initiate Checkout: 3,450
  - Purchase: 2,180
  - Total Purchase Value: $327,000

- **Custom Audiences**
  - Cart Abandoners: 6,740 users
  - High-Value Customers: 3,280 users
  - Engaged Browsers: 12,450 users

### 3. Google Ads Tag
**Mock Data Includes:**
- **Campaign Performance**
  - Impressions: 285,000
  - Clicks: 14,250
  - CTR: 5.0%
  - Average CPC: $2.35
  - Conversions: 1,425
  - Conversion Rate: 10.0%
  - Cost Per Conversion: $23.50

- **Top Keywords**
  - "best online store": 2,700 clicks, 324 conversions
  - "buy products online": 2,280 clicks, 274 conversions
  - "e-commerce platform": 1,920 clicks, 230 conversions

- **Audience Segments**
  - In-Market: E-commerce Shoppers (85,000, High performance)
  - Custom Intent: Product Seekers (42,000, Very High performance)
  - Remarketing: Previous Visitors (28,000, High performance)

- **Device Performance**
  - Mobile: 8,550 clicks, 712 conversions
  - Desktop: 4,275 clicks, 556 conversions
  - Tablet: 1,425 clicks, 157 conversions

## How It Works

### 1. Chat Responses with Data Context

When users connect data sources and chat with the AI:

```typescript
// API: /api/chat
- Collects all connected data sources
- Generates comprehensive data insights summary
- Injects real metrics into system prompt
- OpenAI responds with data-driven recommendations
```

**Example Context Sent to OpenAI:**
```
Connected Data Sources: Google Tag Manager, Facebook Pixel

REAL DATA FROM CONNECTED SOURCES:
- Website Traffic: 45,230 total visitors, 32,180 unique
- Engagement: 3m 24s avg session, 42% bounce rate
- Conversion Rate: 13.5% (1,680 purchases from 12,450 product views)
- Primary Demographic: 25-34 years (35%), Female (52%)
- Top Interest: E-commerce (92% affinity)
- Total Revenue Tracked: $327,000
```

The AI uses this data to provide specific, actionable advice:
- "Your 25-34 age group shows the highest engagement..."
- "With a 13.5% conversion rate and $23.50 cost per conversion..."
- "Focus on your 6,740 cart abandoners..."

### 2. Campaign Generation with OpenAI

When generating campaigns, the system:

```typescript
// API: /api/generate-campaign
1. Collects data from all connected sources
2. Generates detailed insights summary
3. Sends to OpenAI with structured output format
4. Returns complete JSON campaign plan
```

**OpenAI Instructions Include:**
- Use ONLY actual numbers from the data
- Reference specific demographics (age 25-34, locations: New York)
- Calculate budgets using real CPC ($2.35) and conversion costs
- Base projections on current performance metrics
- Create segments reflecting actual audience data
- Use top keywords and interests in content

### 3. Campaign Output Format

The output maintains the same JSON structure but with data-driven values:

```json
{
  "id": "campaign_1234567890",
  "name": "High-Value E-commerce Retargeting Campaign",
  "channels": ["Email", "SMS", "WhatsApp"],
  "dataSources": ["Google Tag Manager", "Facebook Pixel", "Google Ads Tag"],
  "audience": {
    "segments": [
      "Cart Abandoners (6,740 users)",
      "High-Value Customers (3,280 users)",
      "25-34 Age Group Female Shoppers",
      "E-commerce Enthusiasts (92% affinity)"
    ],
    "demographics": {
      "ageRange": "25-34",
      "gender": "Female-dominant (52%)",
      "income": "Middle to High (based on $150 avg order value)",
      "location": "Urban: New York, Los Angeles, Chicago"
    },
    "behaviors": {
      "interests": "E-commerce (92%), Technology (88%), Fashion (75%)",
      "purchaseHistory": "High-Value: 3,280 users with >$150 purchases",
      "engagement": "High (3m 24s avg session, 58% new visitors)"
    }
  },
  "timing": {
    "startDate": "2025-10-08T00:00:00.000Z",
    "endDate": "2025-11-07T00:00:00.000Z",
    "frequency": "Daily for cart abandoners, 2-3x weekly for others",
    "timezone": "UTC"
  },
  "content": {
    "body": "Complete your purchase! Based on your interest in our products, we've reserved your cart items. Use code COMPLETE15 for 15% off.",
    "cta": "Complete Purchase Now",
    "subject": "Your Cart is Waiting - Complete Purchase & Save 15%"
  },
  "budget": {
    "total": 35000,
    "perChannel": {
      "Email": 15000,
      "SMS": 12000,
      "WhatsApp": 8000
    }
  },
  "metrics": {
    "expectedReach": 22470,
    "expectedEngagement": 0.18,
    "expectedConversion": 0.12
  }
}
```

## Key Features

### ✅ Data-Driven Recommendations
- All AI responses reference actual metrics
- Budget calculations based on real CPC and conversion costs
- Audience targeting uses actual demographic data
- Content suggestions based on top-performing keywords

### ✅ Intelligent Segmentation
- Identifies high-value customer segments
- Targets cart abandoners with specific user counts
- Prioritizes best-performing audience groups
- Uses real affinity scores for interest targeting

### ✅ Performance Projections
- Based on current conversion rates (13.5% from GTM)
- Uses actual engagement metrics (3m 24s sessions)
- References real CTR (5.0% from Google Ads)
- Calculates ROI using true cost per conversion ($23.50)

### ✅ Multi-Source Intelligence
- Combines insights from all connected sources
- Cross-references data for comprehensive view
- Identifies patterns across platforms
- Provides holistic campaign strategy

## Technical Implementation

### Files Created/Modified

1. **`src/utils/dataSourceMockData.ts`** (New)
   - Defines data structures for each source
   - Generates realistic mock data
   - Creates insights summaries for AI context

2. **`src/app/api/chat/route.ts`** (Modified)
   - Integrates data insights into system prompt
   - Provides comprehensive data context to OpenAI
   - Ensures AI references actual metrics

3. **`src/app/api/generate-campaign/route.ts`** (New)
   - Dedicated endpoint for campaign generation
   - Uses structured JSON output from OpenAI
   - Enforces data-driven campaign creation

4. **`src/components/sections/ChatInterface.tsx`** (Modified)
   - Calls new campaign generation API
   - Maintains streaming JSON output
   - Handles errors gracefully

## Usage

1. **Connect Data Sources**: Select GTM, Facebook Pixel, and/or Google Ads Tag
2. **Select Channels**: Choose Email, SMS, Push, and/or WhatsApp
3. **Chat with AI**: Ask about campaign strategies
   - AI will reference your actual data
   - Provides specific recommendations using real metrics
4. **Generate Campaign**: Request campaign generation
   - AI creates comprehensive plan based on data
   - Output includes specific numbers from your sources
   - Maintains consistent JSON format

## Benefits

- **Personalized**: Every campaign is unique based on actual data
- **Specific**: References real metrics, not generic advice
- **Actionable**: Budget and targeting based on performance data
- **Realistic**: Projections grounded in current performance
- **Comprehensive**: Leverages all available data sources
- **Intelligent**: AI identifies patterns and opportunities in data

## Example AI Responses

**Without Data:**
> "Consider targeting millennial audiences with email campaigns..."

**With Data:**
> "Your Facebook Pixel shows 35% of your audience is aged 25-34, with 92% affinity for e-commerce. With 6,740 users who abandoned carts and a $23.50 cost per conversion, I recommend targeting this segment with personalized email campaigns offering 15% off to complete purchases..."

The difference: **Specific, actionable, data-driven recommendations** vs. generic advice.

