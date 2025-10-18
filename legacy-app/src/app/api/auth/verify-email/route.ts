import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Email verification error:', error)
      return NextResponse.json(
        { error: 'Email verification failed' },
        { status: 400 }
      )
    }

    if (data.user && data.session) {
      // Email verification successful
      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
        },
        message: 'Email verified successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Email verification failed' },
      { status: 500 }
    )
  }
}
