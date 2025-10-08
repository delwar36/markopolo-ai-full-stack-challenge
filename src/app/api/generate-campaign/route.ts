import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { generateInsightsSummary } from '@/utils/dataSourceMockData'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { dataSources, channels } = await req.json()

    if (!dataSources || !channels || dataSources.length === 0 || channels.length === 0) {
      return NextResponse.json(
        { error: 'Data sources and channels are required' },
        { status: 400 }
      )
    }

    // Get data insights
    const dataInsights = generateInsightsSummary(dataSources)

    // Build prompt for campaign generation
    const systemPrompt = `You are an expert marketing campaign strategist. Your task is to generate a comprehensive, data-driven campaign plan in JSON format.

## DATA FROM CONNECTED SOURCES:
${dataInsights}

## SELECTED CHANNELS:
${channels.map((ch: { name: string }) => ch.name).join(', ')}

## YOUR TASK:
Generate a detailed campaign plan using the REAL DATA provided above. The output MUST be a valid JSON object with the following exact structure:

{
  "id": "campaign_[timestamp]",
  "name": "[Compelling campaign name based on data insights]",
  "channels": [array of selected channel names],
  "dataSources": [array of connected data source names],
  "audience": {
    "segments": [array of specific audience segments derived from the data - be very specific using actual demographics],
    "demographics": {
      "ageRange": "[specific age range from Facebook Pixel data]",
      "gender": "[gender distribution from data]",
      "income": "[income level based on product data and purchase values]",
      "location": "[top locations from the data]"
    },
    "behaviors": {
      "interests": "[actual interest categories from Facebook Pixel]",
      "purchaseHistory": "[customer value segments based on purchase data]",
      "engagement": "[engagement level based on session duration and bounce rate]"
    }
  },
  "timing": {
    "startDate": "[ISO timestamp for start - use current date]",
    "endDate": "[ISO timestamp for end - 30 days from start]",
    "frequency": "[recommended frequency based on engagement data]",
    "timezone": "UTC"
  },
  "content": {
    "body": "[compelling message based on top interests and keywords from data]",
    "cta": "[action-oriented CTA based on conversion funnel data]",
    "subject": "[if email channel selected, compelling subject line]"
  },
  "budget": {
    "total": [realistic total budget based on CPC and conversion cost data],
    "perChannel": {
      "[channel_name]": [budget allocation based on performance data]
    }
  },
  "metrics": {
    "expectedReach": [realistic number based on audience sizes from data],
    "expectedEngagement": [realistic engagement rate based on CTR and current metrics],
    "expectedConversion": [realistic conversion rate based on current funnel data]
  }
}

CRITICAL REQUIREMENTS:
1. Use ONLY the actual numbers and metrics from the data provided
2. Reference specific demographics (age: 25-34 from Facebook data, locations: New York, etc.)
3. Calculate budgets using the actual CPC ($2.35) and conversion costs from Google Ads
4. Base expected metrics on current performance (e.g., if conversion rate is 10%, project similar or slightly better)
5. Create audience segments that reflect actual data (Cart Abandoners with 6,740 users, High-Value Customers, etc.)
6. Use top keywords and interests from the data in content recommendations
7. Make budget allocations that prioritize high-performing channels/devices from the data

Return ONLY the JSON object, no additional text or explanation.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Generate a comprehensive marketing campaign plan using the data provided. Make it specific, actionable, and based entirely on the real metrics shown in the data sources.` 
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    })

    const campaignPlan = completion.choices[0]?.message?.content

    if (!campaignPlan) {
      throw new Error('No campaign plan generated')
    }

    // Parse and validate the JSON
    const campaign = JSON.parse(campaignPlan)

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error generating campaign:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate campaign',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

