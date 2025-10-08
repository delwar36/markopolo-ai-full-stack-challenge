// Mock data for different data sources
// This simulates real data that would come from actual integrations

export interface DataSourceInsights {
  id: string;
  name: string;
  data: GTMData | FacebookPixelData | GoogleAdsData;
}

// Google Tag Manager Mock Data
export interface GTMData {
  websiteMetrics: {
    totalVisitors: number;
    uniqueVisitors: number;
    pageViews: number;
    avgSessionDuration: string;
    bounceRate: string;
  };
  topPages: Array<{
    page: string;
    views: number;
    avgTime: string;
  }>;
  userBehavior: {
    newVsReturning: {
      new: string;
      returning: string;
    };
    topEvents: Array<{
      event: string;
      count: number;
    }>;
  };
  conversionFunnel: {
    productViews: number;
    addToCart: number;
    checkoutInitiated: number;
    purchases: number;
  };
}

// Facebook Pixel Mock Data
export interface FacebookPixelData {
  audienceInsights: {
    totalReach: number;
    demographics: {
      age: Array<{ range: string; percentage: number }>;
      gender: { male: number; female: number; other: number };
      topLocations: Array<{ city: string; percentage: number }>;
    };
    interests: Array<{
      category: string;
      affinity: number;
    }>;
  };
  pixelEvents: {
    viewContent: number;
    addToCart: number;
    initiateCheckout: number;
    purchase: number;
    purchaseValue: number;
  };
  customAudiences: Array<{
    name: string;
    size: number;
    description: string;
  }>;
}

// Google Ads Mock Data
export interface GoogleAdsData {
  campaignPerformance: {
    impressions: number;
    clicks: number;
    ctr: string;
    avgCpc: number;
    conversions: number;
    conversionRate: string;
    costPerConversion: number;
  };
  topKeywords: Array<{
    keyword: string;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
  audienceSegments: Array<{
    segment: string;
    performance: string;
    size: number;
  }>;
  devicePerformance: {
    mobile: { clicks: number; conversions: number };
    desktop: { clicks: number; conversions: number };
    tablet: { clicks: number; conversions: number };
  };
}

// Generate mock data for each data source
export function generateMockData(dataSourceId: string): DataSourceInsights | null {
  switch (dataSourceId) {
    case 'gtm':
      return {
        id: 'gtm',
        name: 'Google Tag Manager',
        data: {
          websiteMetrics: {
            totalVisitors: 45230,
            uniqueVisitors: 32180,
            pageViews: 125640,
            avgSessionDuration: '3m 24s',
            bounceRate: '42%',
          },
          topPages: [
            { page: '/products', views: 28450, avgTime: '4m 12s' },
            { page: '/pricing', views: 18920, avgTime: '2m 45s' },
            { page: '/blog', views: 15680, avgTime: '3m 30s' },
          ],
          userBehavior: {
            newVsReturning: {
              new: '58%',
              returning: '42%',
            },
            topEvents: [
              { event: 'product_view', count: 12450 },
              { event: 'add_to_cart', count: 4280 },
              { event: 'newsletter_signup', count: 3120 },
            ],
          },
          conversionFunnel: {
            productViews: 12450,
            addToCart: 4280,
            checkoutInitiated: 2150,
            purchases: 1680,
          },
        },
      };

    case 'facebook-pixel':
      return {
        id: 'facebook-pixel',
        name: 'Facebook Pixel',
        data: {
          audienceInsights: {
            totalReach: 125000,
            demographics: {
              age: [
                { range: '18-24', percentage: 15 },
                { range: '25-34', percentage: 35 },
                { range: '35-44', percentage: 28 },
                { range: '45-54', percentage: 15 },
                { range: '55+', percentage: 7 },
              ],
              gender: { male: 45, female: 52, other: 3 },
              topLocations: [
                { city: 'New York', percentage: 18 },
                { city: 'Los Angeles', percentage: 14 },
                { city: 'Chicago', percentage: 12 },
                { city: 'San Francisco', percentage: 10 },
              ],
            },
            interests: [
              { category: 'E-commerce', affinity: 92 },
              { category: 'Technology', affinity: 88 },
              { category: 'Fashion', affinity: 75 },
              { category: 'Health & Wellness', affinity: 68 },
            ],
          },
          pixelEvents: {
            viewContent: 45680,
            addToCart: 8920,
            initiateCheckout: 3450,
            purchase: 2180,
            purchaseValue: 327000,
          },
          customAudiences: [
            {
              name: 'Cart Abandoners',
              size: 6740,
              description: 'Users who added items but didn\'t complete purchase',
            },
            {
              name: 'High-Value Customers',
              size: 3280,
              description: 'Customers with purchase value >$150',
            },
            {
              name: 'Engaged Browsers',
              size: 12450,
              description: 'Users who viewed 3+ products in last 30 days',
            },
          ],
        },
      };

    case 'google-ads-tag':
      return {
        id: 'google-ads-tag',
        name: 'Google Ads Tag',
        data: {
          campaignPerformance: {
            impressions: 285000,
            clicks: 14250,
            ctr: '5.0%',
            avgCpc: 2.35,
            conversions: 1425,
            conversionRate: '10.0%',
            costPerConversion: 23.5,
          },
          topKeywords: [
            {
              keyword: 'best online store',
              impressions: 45000,
              clicks: 2700,
              conversions: 324,
            },
            {
              keyword: 'buy products online',
              impressions: 38000,
              clicks: 2280,
              conversions: 274,
            },
            {
              keyword: 'e-commerce platform',
              impressions: 32000,
              clicks: 1920,
              conversions: 230,
            },
          ],
          audienceSegments: [
            {
              segment: 'In-Market: E-commerce Shoppers',
              performance: 'High',
              size: 85000,
            },
            {
              segment: 'Custom Intent: Product Seekers',
              performance: 'Very High',
              size: 42000,
            },
            {
              segment: 'Remarketing: Previous Visitors',
              performance: 'High',
              size: 28000,
            },
          ],
          devicePerformance: {
            mobile: { clicks: 8550, conversions: 712 },
            desktop: { clicks: 4275, conversions: 556 },
            tablet: { clicks: 1425, conversions: 157 },
          },
        },
      };

    default:
      return null;
  }
}

// Generate comprehensive insights summary for AI
export function generateInsightsSummary(dataSources: Array<{ id: string; name: string }>): string {
  const insights: string[] = [];

  dataSources.forEach((ds) => {
    const mockData = generateMockData(ds.id);
    if (!mockData) return;

    switch (ds.id) {
      case 'gtm':
        {
          const data = mockData.data as GTMData;
          insights.push(`
**${mockData.name} Insights:**
- Website Traffic: ${data.websiteMetrics.totalVisitors.toLocaleString()} total visitors, ${data.websiteMetrics.uniqueVisitors.toLocaleString()} unique
- Engagement: ${data.websiteMetrics.avgSessionDuration} avg session, ${data.websiteMetrics.bounceRate} bounce rate
- Top Performing Page: ${data.topPages[0].page} (${data.topPages[0].views.toLocaleString()} views)
- User Split: ${data.userBehavior.newVsReturning.new} new users, ${data.userBehavior.newVsReturning.returning} returning
- Conversion Funnel: ${data.conversionFunnel.productViews.toLocaleString()} views → ${data.conversionFunnel.purchases.toLocaleString()} purchases (${((data.conversionFunnel.purchases / data.conversionFunnel.productViews) * 100).toFixed(1)}% conversion rate)
          `);
        }
        break;

      case 'facebook-pixel':
        {
          const data = mockData.data as FacebookPixelData;
          const topAge = data.audienceInsights.demographics.age.reduce((max, curr) =>
            curr.percentage > max.percentage ? curr : max
          );
          insights.push(`
**${mockData.name} Insights:**
- Audience Reach: ${data.audienceInsights.totalReach.toLocaleString()} people
- Primary Demographic: ${topAge.range} years (${topAge.percentage}%), ${data.audienceInsights.demographics.gender.female > data.audienceInsights.demographics.gender.male ? 'Female' : 'Male'} dominant (${Math.max(data.audienceInsights.demographics.gender.female, data.audienceInsights.demographics.gender.male)}%)
- Top Location: ${data.audienceInsights.demographics.topLocations[0].city}
- Top Interest: ${data.audienceInsights.interests[0].category} (${data.audienceInsights.interests[0].affinity}% affinity)
- Pixel Events: ${data.pixelEvents.viewContent.toLocaleString()} content views → ${data.pixelEvents.purchase.toLocaleString()} purchases
- Total Revenue Tracked: $${data.pixelEvents.purchaseValue.toLocaleString()}
- Key Audience: ${data.customAudiences[0].name} (${data.customAudiences[0].size.toLocaleString()} users)
          `);
        }
        break;

      case 'google-ads-tag':
        {
          const data = mockData.data as GoogleAdsData;
          insights.push(`
**${mockData.name} Insights:**
- Campaign Performance: ${data.campaignPerformance.impressions.toLocaleString()} impressions, ${data.campaignPerformance.clicks.toLocaleString()} clicks (${data.campaignPerformance.ctr} CTR)
- Cost Efficiency: $${data.campaignPerformance.avgCpc} avg CPC, $${data.campaignPerformance.costPerConversion} per conversion
- Conversions: ${data.campaignPerformance.conversions.toLocaleString()} total (${data.campaignPerformance.conversionRate} rate)
- Top Keyword: "${data.topKeywords[0].keyword}" (${data.topKeywords[0].conversions} conversions)
- Best Performing Segment: ${data.audienceSegments[1].segment} (${data.audienceSegments[1].performance} performance)
- Device Leader: Mobile (${data.devicePerformance.mobile.clicks.toLocaleString()} clicks, ${data.devicePerformance.mobile.conversions} conversions)
          `);
        }
        break;
    }
  });

  return insights.join('\n');
}

