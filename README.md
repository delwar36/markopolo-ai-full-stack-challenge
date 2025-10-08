# Markopolo Chats

A modern chat interface similar to Perplexity that allows users to connect to various data sources and channels to create targeted marketing campaigns.

## Features

- **Chat Interface**: Interactive chat interface with message bubbles and real-time responses
- **Data Source Integration**: Connect to multiple data sources including:
  - Google Tag Manager (GTM)
  - Facebook Pixel
  - Google Ads Tag
- **Multi-Channel Support**: Select from various communication channels:
  - Email
  - SMS
  - Push Notifications
  - WhatsApp
- **Campaign Generation**: Automatically generates structured JSON payloads for executable campaigns
- **Real-time Simulation**: Simulates streaming JSON output with campaign recommendations

## Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **OpenAI API** - AI-powered chat responses
- **Prisma** - Type-safe database ORM
- **Supabase** - Backend and authentication
- **React Hooks** - State management and side effects

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An OpenAI API account ([sign up here](https://platform.openai.com))
- A Supabase account ([sign up here](https://supabase.com))
- PostgreSQL database (or use Supabase's built-in PostgreSQL)

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env.local` file in the project root with the following variables:
   
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/markopolo_chats"
   DIRECT_URL="postgresql://user:password@localhost:5432/markopolo_chats"
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   
   # OpenAI
   OPENAI_API_KEY="sk-your-openai-api-key"
   
   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```
   
   **Getting Your API Keys:**
   
   - **OpenAI API Key**: 
     - Go to [OpenAI Platform](https://platform.openai.com)
     - Navigate to API Keys section
     - Create a new secret key
     - Copy it to `OPENAI_API_KEY`
   
   - **Supabase Credentials**: 
     - Go to your [Supabase Dashboard](https://app.supabase.com)
     - Select your project (or create a new one)
     - Go to Settings > API
     - Copy the `Project URL` to `NEXT_PUBLIC_SUPABASE_URL`
     - Copy the `anon` `public` key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Copy the `service_role` `secret` key to `SUPABASE_SERVICE_ROLE_KEY`
   
   - **Database Credentials**:
     - If using Supabase's database: Go to Settings > Database > Connection String
     - Copy the connection string (with password) to both `DATABASE_URL` and `DIRECT_URL`
     - Or use your own PostgreSQL database connection string

3. **Set Up Database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # Optional: Seed the database
   npx prisma db seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Connect Data Sources**: Click the "Data Sources" button to connect to your marketing data sources
2. **Select Channels**: Click the "Channels" button to choose your communication channels
3. **Generate Campaign**: Click "Generate Campaign" to create a targeted campaign strategy
4. **View Output**: The system will generate a structured JSON payload with:
   - Audience segments
   - Content recommendations
   - Timing optimization
   - Budget allocation
   - Performance metrics

## Key Components

### ChatInterface
Main container component that manages the overall chat experience, data source connections, and channel selections.

### DataSourceSelector
Handles connection to various data sources with visual status indicators and connection management.

### ChannelSelector
Manages selection of communication channels with multi-select functionality.

### CampaignOutput
Displays the generated campaign JSON payload with expandable sections and copy functionality.

### CampaignGenerator
Utility function that simulates AI-powered campaign generation based on connected data sources and selected channels.

## Features in Detail

### Data Source Integration
- **Google Tag Manager**: Tracks website interactions and user behavior
- **Facebook Pixel**: Monitors conversions and optimizes ad delivery
- **Google Ads Tag**: Tracks Google Ads performance and conversions

### Channel Management
- **Email**: Targeted email campaigns with subject line optimization
- **SMS**: Text message notifications with character optimization
- **Push Notifications**: Mobile and web push notifications
- **WhatsApp**: Business messaging integration

### Campaign Output
The generated JSON payload includes:
- **Audience Targeting**: Segments based on data source insights
- **Content Strategy**: Channel-specific messaging and CTAs
- **Timing Optimization**: Start/end dates and frequency
- **Budget Allocation**: Per-channel budget distribution
- **Performance Metrics**: Expected reach, engagement, and conversion rates

## Development

The application is built with modern React patterns and TypeScript for type safety. The UI is responsive and follows modern design principles with Tailwind CSS.

### Adding New Data Sources
1. Add the data source to the `availableDataSources` array in `DataSourceSelector.tsx`
2. Update the `generateAudienceSegments` function in `campaignGenerator.ts`
3. Add any specific logic for the new data source

### Adding New Channels
1. Add the channel to the `availableChannels` array in `ChannelSelector.tsx`
2. Update the `generateContent` function in `campaignGenerator.ts`
3. Add channel-specific content generation logic

## License

This project is created for demonstration purposes.
