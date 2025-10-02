import { DataSource, Channel, CampaignPayload } from '@/types';

export async function generateCampaignPayload(
  dataSources: DataSource[],
  channels: Channel[]
): Promise<CampaignPayload> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const connectedSources = dataSources.filter(ds => ds.connected);
  const selectedChannels = channels.filter(ch => ch.enabled);

  // Generate audience segments based on data sources
  const audienceSegments = generateAudienceSegments(connectedSources);
  
  // Generate content based on channels and data sources
  const content = generateContent(selectedChannels);
  
  // Calculate metrics based on data sources and channels
  const metrics = calculateMetrics(connectedSources, selectedChannels);

  const campaign: CampaignPayload = {
    id: `campaign_${Date.now()}`,
    name: `Multi-Channel Campaign - ${new Date().toLocaleDateString()}`,
    channels: selectedChannels.map(ch => ch.name),
    dataSources: connectedSources.map(ds => ds.name),
    audience: {
      segments: audienceSegments,
      demographics: {
        ageRange: '25-45',
        gender: 'All',
        income: 'Middle to High',
        location: 'Urban Areas'
      },
      behaviors: {
        interests: 'Technology, E-commerce, Digital Marketing',
        purchaseHistory: 'High Value Customers',
        engagement: 'Active Users'
      }
    },
    timing: {
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      frequency: 'Daily',
      timezone: 'UTC'
    },
    content: content,
    budget: {
      total: 10000,
      perChannel: selectedChannels.reduce((acc, ch) => {
        acc[ch.name] = Math.floor(10000 / selectedChannels.length);
        return acc;
      }, {} as Record<string, number>)
    },
    metrics: metrics
  };

  return campaign;
}

function generateAudienceSegments(dataSources: DataSource[]): string[] {
  const segments = ['High-Value Customers', 'Recent Visitors', 'Cart Abandoners'];
  
  if (dataSources.some(ds => ds.id === 'facebook-pixel')) {
    segments.push('Facebook Engaged Users', 'Lookalike Audiences');
  }
  
  if (dataSources.some(ds => ds.id === 'google-ads-tag')) {
    segments.push('Google Ads Converters', 'Search Intent Users');
  }
  
  if (dataSources.some(ds => ds.id === 'gtm')) {
    segments.push('Website Engagers', 'Product Viewers');
  }
  
  return segments;
}

function generateContent(channels: Channel[]): {
  body: string;
  cta: string;
  subject?: string;
} {
  const baseContent: {
    body: string;
    cta: string;
    subject?: string;
  } = {
    body: "Discover our latest products and exclusive offers! Don't miss out on this limited-time opportunity.",
    cta: "Shop Now"
  };

  if (channels.some(ch => ch.id === 'email')) {
    baseContent.subject = "🎉 Exclusive Offer Just for You!";
  }

  if (channels.some(ch => ch.id === 'whatsapp')) {
    baseContent.body = "Hi! 👋 We have something special for you. Check out our latest deals!";
  }

  if (channels.some(ch => ch.id === 'sms')) {
    baseContent.body = "Flash Sale! 50% off everything. Use code FLASH50. Ends today!";
  }

  if (channels.some(ch => ch.id === 'push')) {
    baseContent.body = "New products just dropped! Be the first to see them.";
  }

  return baseContent;
}

function calculateMetrics(dataSources: DataSource[], channels: Channel[]): {
  expectedReach: number;
  expectedEngagement: number;
  expectedConversion: number;
} {
  const baseReach = 10000;
  const baseEngagement = 0.15;
  const baseConversion = 0.03;

  // Increase reach based on data sources
  let reachMultiplier = 1;
  if (dataSources.some(ds => ds.id === 'facebook-pixel')) reachMultiplier += 0.5;
  if (dataSources.some(ds => ds.id === 'google-ads-tag')) reachMultiplier += 0.3;
  if (dataSources.some(ds => ds.id === 'gtm')) reachMultiplier += 0.2;

  // Adjust engagement based on channels
  let engagementMultiplier = 1;
  if (channels.some(ch => ch.id === 'email')) engagementMultiplier += 0.2;
  if (channels.some(ch => ch.id === 'whatsapp')) engagementMultiplier += 0.3;
  if (channels.some(ch => ch.id === 'push')) engagementMultiplier += 0.1;

  return {
    expectedReach: Math.floor(baseReach * reachMultiplier),
    expectedEngagement: Math.round((baseEngagement * engagementMultiplier) * 100) / 100,
    expectedConversion: Math.round((baseConversion * engagementMultiplier) * 100) / 100
  };
}
