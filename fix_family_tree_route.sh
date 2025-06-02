#!/bin/bash
# Fix the family-tree route file
echo "Fixing family-tree route..."

cat > /root/AncestryChain/src/app/api/family-tree/route.ts << 'EOL'
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { dbConnect } from '@/lib/dbconnect';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { readFileSync } from 'fs';
import path from 'path';
import { parseGedcom, findRootIndividual, getFamilyTreeData } from '@/lib/gedcomParser';
import { Resend } from 'resend';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Helper function for sending test emails
async function sendTestEmail() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'your_actual_email@domain.com', // CHANGE TO YOUR REAL EMAIL
      subject: 'AncestryChain Test',
      html: '<p>Resend API is working!</p>'
    });

    if (error) {
      throw error;
    }

    return {
      success: true, 
      emailId: data?.id,
      message: 'Test email sent - check your inbox'
    };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    // For testing email functionality
    const url = new URL(request.url);
    if (url.searchParams.get('test-email') === 'true') {
      const result = await sendTestEmail();
      return NextResponse.json(result);
    }

    // Rest of your existing GET function
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Your existing GET implementation here...
    return NextResponse.json({ message: 'Family tree data' });
  } catch (error) {
    console.error('Family tree API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' }, 
      { status: 500 }
    );
  }
}
EOL

echo "Family tree route fixed successfully."
