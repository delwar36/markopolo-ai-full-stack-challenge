import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Redirect to login page with success message
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/login?verified=true`)
    }
  }

  // If there's an error, redirect to login with error
  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/login?error=verification_failed`)
}
