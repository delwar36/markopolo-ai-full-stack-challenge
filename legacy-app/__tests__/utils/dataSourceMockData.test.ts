import { generateMockData, generateInsightsSummary } from '@/utils/dataSourceMockData'
import { generateCampaignPayload } from '@/utils/campaignGenerator'
import { DataSource, Channel } from '@/types'

describe('dataSourceMockData', () => {
  describe('generateMockData', () => {
    it('should generate GTM data for gtm source', () => {
      const result = generateMockData('gtm')
      
      expect(result).toBeTruthy()
      expect(result?.id).toBe('gtm')
      expect(result?.name).toBe('Google Tag Manager')
      expect(result?.data).toHaveProperty('websiteMetrics')
      expect(result?.data).toHaveProperty('topPages')
      expect(result?.data).toHaveProperty('userBehavior')
      expect(result?.data).toHaveProperty('conversionFunnel')
    })

    it('should generate Facebook Pixel data for facebook-pixel source', () => {
      const result = generateMockData('facebook-pixel')
      
      expect(result).toBeTruthy()
      expect(result?.id).toBe('facebook-pixel')
      expect(result?.name).toBe('Facebook Pixel')
      expect(result?.data).toHaveProperty('audienceInsights')
      expect(result?.data).toHaveProperty('pixelEvents')
      expect(result?.data).toHaveProperty('customAudiences')
    })

    it('should generate Google Ads data for google-ads-tag source', () => {
      const result = generateMockData('google-ads-tag')
      
      expect(result).toBeTruthy()
      expect(result?.id).toBe('google-ads-tag')
      expect(result?.name).toBe('Google Ads Tag')
      expect(result?.data).toHaveProperty('campaignPerformance')
      expect(result?.data).toHaveProperty('topKeywords')
      expect(result?.data).toHaveProperty('audienceSegments')
      expect(result?.data).toHaveProperty('devicePerformance')
    })

    it('should return null for unknown data source', () => {
      const result = generateMockData('unknown-source')
      expect(result).toBeNull()
    })
  })

  describe('generateInsightsSummary', () => {
    it('should generate insights summary for multiple data sources', () => {
      const dataSources = [
        { id: 'gtm', name: 'Google Tag Manager' },
        { id: 'facebook-pixel', name: 'Facebook Pixel' },
        { id: 'google-ads-tag', name: 'Google Ads Tag' }
      ]

      const summary = generateInsightsSummary(dataSources)
      
      expect(summary).toContain('Google Tag Manager Insights')
      expect(summary).toContain('Facebook Pixel Insights')
      expect(summary).toContain('Google Ads Tag Insights')
      expect(summary).toContain('Website Traffic')
      expect(summary).toContain('Audience Reach')
      expect(summary).toContain('Campaign Performance')
    })

    it('should handle empty data sources array', () => {
      const summary = generateInsightsSummary([])
      expect(summary).toBe('')
    })

    it('should handle unknown data sources gracefully', () => {
      const dataSources = [
        { id: 'unknown-source', name: 'Unknown Source' }
      ]

      const summary = generateInsightsSummary(dataSources)
      expect(summary).toBe('')
    })
  })
})

describe('campaignGenerator', () => {
  const mockDataSources: DataSource[] = [
    { id: 'gtm', name: 'Google Tag Manager', description: 'Track website interactions', icon: '🏷️', connected: true },
    { id: 'facebook-pixel', name: 'Facebook Pixel', description: 'Track conversions', icon: '📘', connected: false },
    { id: 'google-ads-tag', name: 'Google Ads Tag', description: 'Track Google Ads performance', icon: '🎯', connected: true }
  ]

  const mockChannels: Channel[] = [
    { id: 'email', name: 'Email', description: 'Send targeted email campaigns', icon: '📧', enabled: true },
    { id: 'sms', name: 'SMS', description: 'Send text message notifications', icon: '📱', enabled: false },
    { id: 'push', name: 'Push Notifications', description: 'Send mobile and web push notifications', icon: '🔔', enabled: true },
    { id: 'whatsapp', name: 'WhatsApp', description: 'Send WhatsApp business messages', icon: '💬', enabled: true }
  ]

  describe('generateCampaignPayload', () => {
    it('should generate campaign payload with correct structure', async () => {
      const campaign = await generateCampaignPayload(mockDataSources, mockChannels)

      expect(campaign).toHaveProperty('id')
      expect(campaign).toHaveProperty('name')
      expect(campaign).toHaveProperty('channels')
      expect(campaign).toHaveProperty('dataSources')
      expect(campaign).toHaveProperty('audience')
      expect(campaign).toHaveProperty('timing')
      expect(campaign).toHaveProperty('content')
      expect(campaign).toHaveProperty('budget')
      expect(campaign).toHaveProperty('metrics')
    })

    it('should only include connected data sources', async () => {
      const campaign = await generateCampaignPayload(mockDataSources, mockChannels)

      expect(campaign.dataSources).toContain('Google Tag Manager')
      expect(campaign.dataSources).toContain('Google Ads Tag')
      expect(campaign.dataSources).not.toContain('Facebook Pixel')
    })

    it('should only include enabled channels', async () => {
      const campaign = await generateCampaignPayload(mockDataSources, mockChannels)

      expect(campaign.channels).toContain('Email')
      expect(campaign.channels).toContain('Push Notifications')
      expect(campaign.channels).toContain('WhatsApp')
      expect(campaign.channels).not.toContain('SMS')
    })

    it('should generate valid audience segments', async () => {
      const campaign = await generateCampaignPayload(mockDataSources, mockChannels)

      expect(campaign.audience.segments).toBeInstanceOf(Array)
      expect(campaign.audience.segments.length).toBeGreaterThan(0)
      expect(campaign.audience).toHaveProperty('demographics')
      expect(campaign.audience).toHaveProperty('behaviors')
    })

    it('should generate valid timing information', async () => {
      const campaign = await generateCampaignPayload(mockDataSources, mockChannels)

      expect(campaign.timing).toHaveProperty('startDate')
      expect(campaign.timing).toHaveProperty('endDate')
      expect(campaign.timing).toHaveProperty('frequency')
      expect(campaign.timing).toHaveProperty('timezone')
      
      const startDate = new Date(campaign.timing.startDate)
      const endDate = new Date(campaign.timing.endDate)
      expect(endDate.getTime()).toBeGreaterThan(startDate.getTime())
    })

    it('should distribute budget evenly across enabled channels', async () => {
      const campaign = await generateCampaignPayload(mockDataSources, mockChannels)

      expect(campaign.budget?.total).toBe(10000)
      expect(Object.keys(campaign.budget?.perChannel ?? {})).toHaveLength(3) // Email, Push, WhatsApp
      
      const channelBudgets = Object.values(campaign.budget?.perChannel ?? {})
      const expectedBudgetPerChannel = 10000 / 3
      channelBudgets.forEach(budget => {
        expect(budget).toBe(Math.floor(expectedBudgetPerChannel))
      })
    })

    it('should generate valid metrics', async () => {
      const campaign = await generateCampaignPayload(mockDataSources, mockChannels)

      expect(campaign.metrics).toHaveProperty('expectedReach')
      expect(campaign.metrics).toHaveProperty('expectedEngagement')
      expect(campaign.metrics).toHaveProperty('expectedConversion')
      
      expect(typeof campaign.metrics.expectedReach).toBe('number')
      expect(typeof campaign.metrics.expectedEngagement).toBe('number')
      expect(typeof campaign.metrics.expectedConversion).toBe('number')
    })

    it('should handle empty data sources and channels', async () => {
      const campaign = await generateCampaignPayload([], [])

      expect(campaign.dataSources).toEqual([])
      expect(campaign.channels).toEqual([])
      expect(campaign.budget?.perChannel).toEqual({})
    })
  })
})