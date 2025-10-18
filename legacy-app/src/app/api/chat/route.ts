import { NextRequest } from 'next/server'

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Forward request to API Gateway
    const response = await fetch(`${API_GATEWAY_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('authorization') || 'Bearer jwt_token_test',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return new Response(
        JSON.stringify({ error: errorData.message || 'Failed to process chat request' }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if response is streaming
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('text/event-stream')) {
      // Return streaming response
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    } else {
      // Return regular JSON response
      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
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

