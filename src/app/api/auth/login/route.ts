import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (data.user) {
      // Check if email is verified
      if (!data.user.email_confirmed_at) {
        return NextResponse.json(
          { error: 'Please verify your email before logging in. Check your inbox for a verification link.' },
          { status: 403 }
        )
      }

      // Get or create user in our database
      let user = await prisma.user.findUnique({
        where: { email: data.user.email! }
      })

      if (!user) {
        // Create user if doesn't exist
        user = await prisma.user.create({
          data: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || email.split('@')[0],
          },
        })
      }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        session: data.session,
      })
    }

    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
