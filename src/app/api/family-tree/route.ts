import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authOptions from '@/auth';
import { connectToDB } from '@/lib/dbconnect';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { readFileSync } from 'fs';
import path from 'path';
import { parseGedcom, findRootIndividual, getFamilyTreeData } from '@/lib/gedcomParser';
import { Resend } from 'resend';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// TEMPORARY EMAIL TEST - REMOVE AFTER TESTING
export async function GET_EMAIL_TEST() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'your_actual_email@domain.com', // CHANGE TO YOUR REAL EMAIL
      subject: 'AncestryChain Test',
      html: '<p>Resend API is working!</p>'
    });

    if (error) {
      try {
        console.error('Family tree API error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      } catch (error) {
        console.error('Unexpected error in family-tree route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      emailId: data?.id,
      message: 'Test email sent - check your inbox'
    });
  } catch (error) {
    try {
      console.error('Family tree API error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } catch (error) {
      console.error('Unexpected error in family-tree route:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}

export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'success',
      message: 'Basic endpoint working'
    });
  } catch (error) {
    try {
      console.error('Family tree API error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } catch (error) {
      console.error('Unexpected error in family-tree route:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
