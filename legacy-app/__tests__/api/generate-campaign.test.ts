import { NextRequest } from 'next/server'
import { POST } from '@/app/api/generate-campaign/route'
import OpenAI from 'openai'

// Mock OpenAI
jest.mock('openai', () => {
  const mockCreate = jest.fn()
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
  }
})

// Mock data source utilities
jest.mock('@/utils/dataSourceMockData', () => ({
  generateInsightsSummary: jest.fn(() => 'Mock insights summary'),
}))

describe('/api/generate-campaign', () => {
  let mockOpenAI: jest.Mocked<OpenAI>

  beforeEach(() => {
    jest.clearAllMocks()
    mockOpenAI = new OpenAI() as jest.Mocked<OpenAI>
  })

  it('should generate campaign successfully with valid data', async () => {
    const mockCampaign = {
      id: 'campaign_123',
      name: 'Test Campaign',
      channels: ['Email'],
      dataSources: ['Google Tag Manager'],
      audience: {
        segments: ['High-Value Customers'],
        demographics: {
          ageRange: '25-34',
          gender: 'Mixed',
          income: 'Middle',
          location: 'Urban',
        },
        behaviors: {
          interests: 'Technology',
          purchaseHistory: 'Active',
          engagement: 'High',
        },
      },
      timing: {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T00:00:00.000Z',
        frequency: 'Daily',
        timezone: 'UTC',
      },
      content: {
        body: 'Test message',
        cta: 'Learn More',
        subject: 'Test Subject',
      },
      budget: {
        total: 10000,
        perChannel: {
          Email: 10000,
        },
      },
      metrics: {
        expectedReach: 5000,
        expectedEngagement: '5%',
        expectedConversion: '2%',
      },
    }

    // Mock OpenAI response
    ;(mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(mockCampaign),
          },
        },
      ],
    })

    const requestBody = {
      dataSources: [{ id: 'gtm', name: 'Google Tag Manager' }],
      channels: [{ id: 'email', name: 'Email' }],
    }

    const request = new NextRequest('http://localhost:3000/api/generate-campaign', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockCampaign)
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4o-mini',
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.stringContaining('You are an expert marketing campaign strategist'),
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Generate a comprehensive marketing campaign plan'),
          }),
        ]),
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      })
    )
  })

  it('should return 400 error when dataSources is missing', async () => {
    const requestBody = {
      channels: [{ id: 'email', name: 'Email' }],
    }

    const request = new NextRequest('http://localhost:3000/api/generate-campaign', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({
      error: 'Data sources and channels are required',
    })
  })

  it('should return 400 error when channels is missing', async () => {
    const requestBody = {
      dataSources: [{ id: 'gtm', name: 'Google Tag Manager' }],
    }

    const request = new NextRequest('http://localhost:3000/api/generate-campaign', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({
      error: 'Data sources and channels are required',
    })
  })

  it('should return 400 error when dataSources is empty', async () => {
    const requestBody = {
      dataSources: [],
      channels: [{ id: 'email', name: 'Email' }],
    }

    const request = new NextRequest('http://localhost:3000/api/generate-campaign', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({
      error: 'Data sources and channels are required',
    })
  })

  it('should return 400 error when channels is empty', async () => {
    const requestBody = {
      dataSources: [{ id: 'gtm', name: 'Google Tag Manager' }],
      channels: [],
    }

    const request = new NextRequest('http://localhost:3000/api/generate-campaign', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({
      error: 'Data sources and channels are required',
    })
  })

  it('should return 500 error when OpenAI API fails', async () => {
    // Mock OpenAI API failure
    ;(mockOpenAI.chat.completions.create as jest.Mock).mockRejectedValue(
      new Error('OpenAI API error')
    )

    const requestBody = {
      dataSources: [{ id: 'gtm', name: 'Google Tag Manager' }],
      channels: [{ id: 'email', name: 'Email' }],
    }

    const request = new NextRequest('http://localhost:3000/api/generate-campaign', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      error: 'Failed to generate campaign',
      details: 'OpenAI API error',
    })
  })

  it('should return 500 error when OpenAI returns no content', async () => {
    // Mock OpenAI response with no content
    ;(mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: null,
          },
        },
      ],
    })

    const requestBody = {
      dataSources: [{ id: 'gtm', name: 'Google Tag Manager' }],
      channels: [{ id: 'email', name: 'Email' }],
    }

    const request = new NextRequest('http://localhost:3000/api/generate-campaign', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      error: 'Failed to generate campaign',
      details: 'No campaign plan generated',
    })
  })

  it('should return 500 error when OpenAI returns invalid JSON', async () => {
    // Mock OpenAI response with invalid JSON
    ;(mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Invalid JSON response',
          },
        },
      ],
    })

    const requestBody = {
      dataSources: [{ id: 'gtm', name: 'Google Tag Manager' }],
      channels: [{ id: 'email', name: 'Email' }],
    }

    const request = new NextRequest('http://localhost:3000/api/generate-campaign', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      error: 'Failed to generate campaign',
      details: expect.stringContaining('Unexpected token'),
    })
  })
})
