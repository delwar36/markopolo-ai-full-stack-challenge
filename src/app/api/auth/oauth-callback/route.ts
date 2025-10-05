import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token, expires_at } = await request.json()

    if (!access_token || !refresh_token || !expires_at) {
      return NextResponse.json(
        { error: 'Missing required tokens' },
        { status: 400 }
      )
    }

    // Note: We don't need to create a session object here as we use the access token directly

    // Get user info from Supabase using the access token
    const { data: userData, error: userError } = await supabase.auth.getUser(access_token)

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      )
    }

    const user = userData.user

    // Check if this is a Google OAuth user
    if (user.app_metadata?.provider === 'google') {
      try {
        // Check if user already exists
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })

        if (!dbUser) {
          // Create new user from Google OAuth
          dbUser = await prisma.user.create({
            data: {
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split('@')[0],
            },
          })
        }

        return NextResponse.json({
          success: true,
          user: {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            createdAt: dbUser.createdAt,
            updatedAt: dbUser.updatedAt,
          }
        })
      } catch (dbError) {
        console.error('Database error during OAuth callback:', dbError)
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported OAuth provider' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.json(
      { error: 'OAuth callback failed' },
      { status: 500 }
    )
  }
}
