// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use the authenticated user's session with Supabase
    const supabase = createServerComponentClient({ 
      cookies: () => new ReadonlyRequestCookies(cookies())
    });

    // Verify the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the file from the form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Generate a unique filename
    const fileName = `${user.id}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const fileBuffer = await file.arrayBuffer();
    
    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('files')
      .upload(fileName, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message }, 
        { status: 500 }
      );
    }

    // Save file metadata to the database
    const { data: fileMetaData, error: dbError } = await supabase
      .from('files')
      .insert({
        user_id: user.id,
        filename: fileName,
        original_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        file_path: uploadData.path,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up the uploaded file if database insert fails
      await supabase.storage.from('files').remove([fileName]);
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save file metadata', details: dbError.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      file: fileMetaData,
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}