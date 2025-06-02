import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { dbConnect } from '@/lib/dbconnect';
import User from '@/models/User';

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
    
    await dbConnect();
    
    const Resend = (await import('resend')).Resend;
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Check for existing user
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      );
    }
    
    // Generate email verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24); // 24 hours expiration
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      role: 'user',
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false
    });

    try {
      // Send verification email
      await resend.emails.send({
        from: 'AncestryChain <noreply@ancestrychain.app>',
        to: user.email,
        subject: 'Verify your email address',
        html: `
          <div>
            <h2>Welcome to AncestryChain, ${user.name}!</h2>
            <p>Please click the link below to verify your email address:</p>
            <a href="${process.env.NEXTAUTH_URL}/verify-email?token=${emailVerificationToken}">
              Verify Email Address
            </a>
            <p>This link will expire in 24 hours.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the registration if email sending fails
    }
    
    // Don't include sensitive data in the response
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified || false
    };
    
    return NextResponse.json(
      { 
        message: 'User created successfully. Please check your email to verify your account.',
        user: userResponse
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { 
        error: 'Failed to create account',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
      },
      { status: 500 }
    );
  }
}
