import { NextResponse } from 'next/server'

export async function GET() {
  // Only allow this in development or with a specific debug key
  if (process.env.NODE_ENV === 'production' && process.env.DEBUG_KEY !== 'your-debug-key') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    // Don't expose sensitive keys
    HAS_SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  })
}
