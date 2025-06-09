// src/app/api/user/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createClient } from '@supabase/supabase-js';
import { authOptions } from '@/lib/auth-options';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase URL or Service Role Key is not defined for user/files API.');
}

// Initialize Supabase client with service role key for this route
const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // @ts-ignore
    if (!session?.user?.providerId) {
      console.log('User Files API: Unauthorized - No providerId in session user', session?.user);
      return NextResponse.json({ error: 'Unauthorized - Missing providerId' }, { status: 401 });
    }
    
    // @ts-ignore
    const providerId = session.user.providerId as string;

    // Get user from database using provider ID to fetch their internal UUID
    const { data: dbUser, error: userFetchError } = await supabase
      .from('users') // Ensure this is your public users table
      .select('id')
      .eq('provider_id', providerId)
      .single();

    if (userFetchError || !dbUser) {
      console.error(`User Files API: User not found for providerId: ${providerId}`, userFetchError);
      return NextResponse.json({ error: 'User not found or error fetching user' }, { status: 404 });
    }

    const internalUserId = dbUser.id;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    const { data: files, error: filesError } = await supabase
      .from('files') // Ensure this is your public files table
      .select('*')
      .eq('user_id', internalUserId) // Use the internal UUID
      .order('uploaded_at', { ascending: false }) // Assuming 'uploaded_at' or 'created_at'
      .range(offset, offset + limit - 1);

    if (filesError) {
      console.error('User Files API: Error fetching files from Supabase:', filesError);
      return NextResponse.json(
        { error: 'Failed to fetch files', details: filesError.message },
        { status: 500 }
      );
    }

    const { count, error: countError } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', internalUserId);

    if (countError) {
      console.error('User Files API: Error counting files from Supabase:', countError);
      return NextResponse.json(
        { error: 'Failed to count files', details: countError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      files,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });

  } catch (error: any) {
    console.error('User Files API: Unexpected error in GET /api/user/files:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}
