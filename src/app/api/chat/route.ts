import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { generateInsightsSummary } from '@/utils/dataSourceMockData'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, dataSources, channels, model = 'gpt-4o-mini' } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Build system prompt based on context
    const systemPrompt = buildSystemPrompt(dataSources, channels)

    // Create chat completion with streaming
    const stream = await openai.chat.completions.create({
      model: model as 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((msg: ChatMessage) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    })

    // Create a ReadableStream for streaming the response
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || ''
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

function buildSystemPrompt(
  dataSources?: Array<{ id: string; name: string }>,
  channels?: Array<{ id: string; name: string }>
): string {
  let prompt = `You are an AI marketing campaign assistant. Be concise, accurate, and data-driven.

Communication Style:
- Keep responses brief and to the point
- Use bullet points and lists for clarity
- Reference actual numbers from data
- Be conversational but professional
- Avoid lengthy explanations`

  if (dataSources && dataSources.length > 0) {
    prompt += `\n\nConnected Data Sources: ${dataSources.map((ds) => ds.name).join(', ')}`
    
    // Generate and include actual data insights
    const dataInsights = generateInsightsSummary(dataSources);
    prompt += `\n\n## REAL DATA FROM CONNECTED SOURCES:\n${dataInsights}`
    
    prompt += `\n\nIMPORTANT: Use the above REAL DATA to provide specific, data-driven recommendations. Reference actual metrics, conversion rates, audience demographics, and performance indicators from the data when making suggestions.`
  }

  if (channels && channels.length > 0) {
    prompt += `\n\nSelected Channels: ${channels.map((ch) => ch.name).join(', ')}`
    prompt += `\nFocus your campaign recommendations on these specific channels. Provide channel-specific content strategies, timing recommendations, and best practices for each.`
  }

  if (dataSources && dataSources.length > 0 && channels && channels.length > 0) {
    prompt += `\n\n## CAMPAIGN GENERATION:
When user requests a campaign (mentions "campaign", "generate", "create strategy"), provide:

1. **Brief analysis** (5-7 sentences) highlighting key insights from the data
2. **Campaign JSON** in a markdown code block

The JSON must follow this EXACT structure:
\`\`\`json
{
  "id": "campaign_[timestamp]",
  "name": "[Data-driven campaign name]",
  "channels": [selected channels],
  "dataSources": [connected sources],
  "audience": {
    "segments": ["Specific segment (size)", ...],
    "demographics": {
      "ageRange": "[from data]",
      "gender": "[from data]",
      "income": "[based on purchase values]",
      "location": "[top cities from data]"
    },
    "behaviors": {
      "interests": "[top interests from data]",
      "purchaseHistory": "[value segments]",
      "engagement": "[based on metrics]"
    }
  },
  "timing": {
    "startDate": "[ISO timestamp]",
    "endDate": "[30 days later]",
    "frequency": "[based on engagement]",
    "timezone": "UTC"
  },
  "content": {
    "body": "[Based on top keywords/interests]",
    "cta": "[Action-oriented]",
    "subject": "[If email selected]"
  },
  "budget": {
    "total": [realistic based on CPC data],
    "perChannel": {
      "[channel]": [amount]
    }
  },
  "metrics": {
    "expectedReach": [based on audience size],
    "expectedEngagement": [decimal, e.g., 0.18],
    "expectedConversion": [decimal, based on current rate]
  }
}
\`\`\`

Use ONLY real numbers from the data. Be specific and concise.`
  } else {
    prompt += `\n\nIf the user hasn't connected data sources or selected channels yet, guide them to:
1. Connect data sources (Google Tag Manager, Facebook Pixel, Google Ads Tag) to understand their audience
2. Select communication channels (Email, SMS, Push Notifications, WhatsApp) to reach their audience
3. Then ask about their campaign goals to generate a comprehensive, data-driven strategy`
  }

  return prompt
}

