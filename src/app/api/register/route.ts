import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize the admin client with the service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const { email, password, ...userData } = await request.json()

    // Create the user with email confirmation bypass
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: userData
    })

    if (error) {
      console.error('Registration error:', error)
      return NextResponse.json(
        { error: error.message || 'Registration failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({ user: data.user })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}