import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/dbconnect';
import { getServerSession } from 'next-auth';
import authOptions from '@/auth';
import User from '@/models/User';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDB();

    // Fetch all users (excluding sensitive data)
    const users = await User.find({})
      .select('-password -__v')
      .lean();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
