import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Import Supabase client

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements:
// - At least 8 characters
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one number
// - At least one special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    
    // Input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim().toLowerCase();
    
    // Validate email format
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { 
          error: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character' 
        },
        { status: 400 }
      );
    }
    
    // Sign up the user with Supabase
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password: password, // Supabase handles hashing
      options: {
        data: {
          full_name: sanitizedName, // Pass additional data to be stored with the user
          // role: 'user', // This can be set here or handled by DB trigger/default
        },
        // Supabase sends a confirmation email by default if enabled in your project settings.
        // The emailRedirectTo can be configured in Supabase Auth settings (Site URL).
      },
    });

    if (signUpError) {
      // Handle Supabase specific errors (e.g., email already in use)
      if (signUpError.message.includes('User already registered')) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 } // Conflict
        );
      }
      console.error('Supabase sign up error:', signUpError);
      return NextResponse.json(
        { error: signUpError.message || 'Error signing up. Please try again.' },
        { status: signUpError.status || 400 }
      );
    }

    if (!signUpData.user) {
        return NextResponse.json(
            { error: 'User registration failed, no user data returned.' },
            { status: 500 }
        );
    }

    // If signUpData.user.identities is empty or user is not confirmed, email verification is pending
    const emailVerificationNeeded = signUpData.user.identities && signUpData.user.identities.length > 0 && !signUpData.user.email_confirmed_at;

    if (emailVerificationNeeded) {
        return NextResponse.json(
            {
              message:
                'User registered successfully. Please check your email to verify your account.',
              userId: signUpData.user.id,
            },
            { status: 201 }
          );
    } else {
        // This case might happen if email verification is disabled or auto-confirmed
        return NextResponse.json(
            {
              message: 'User registered successfully.',
              userId: signUpData.user.id,
            },
            { status: 201 }
          );
    }

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
