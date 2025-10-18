import { NextRequest, NextResponse } from 'next/server'

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Forward request to API Gateway
    const response = await fetch(`${API_GATEWAY_URL}/generate-campaign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('authorization') || 'Bearer jwt_token_test',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || 'Failed to generate campaign' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
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

