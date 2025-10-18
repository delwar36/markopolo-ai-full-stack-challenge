import { NextRequest, NextResponse } from 'next/server'

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Forward request to API Gateway
    const url = new URL('/campaigns', API_GATEWAY_URL)
    if (userId) {
      url.searchParams.set('userId', userId)
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || 'Bearer jwt_token_test',
      },
    })

    if (!response.ok) {
      throw new Error(`API Gateway responded with ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching campaigns from API Gateway:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, channel, dataSource, userId } = body

    if (!title || !channel || !dataSource || !userId) {
      return NextResponse.json(
        { error: 'Title, channel, dataSource, and userId are required' },
        { status: 400 }
      )
    }

    // Forward request to API Gateway
    const response = await fetch(`${API_GATEWAY_URL}/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || 'Bearer jwt_token_test',
      },
      body: JSON.stringify({
        title,
        description,
        channel,
        dataSource,
        userId,
      }),
    })

    if (!response.ok) {
      throw new Error(`API Gateway responded with ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error creating campaign via API Gateway:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
