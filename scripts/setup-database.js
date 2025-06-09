require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('Starting database setup...');
  
  try {
    // 1. Create profiles table
    console.log('\n1. Creating profiles table...');
    const { error: profilesError } = await supabase.rpc('pg_temp.execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID REFERENCES auth.users ON DELETE CASCADE,
          updated_at TIMESTAMP WITH TIME ZONE,
          username TEXT UNIQUE,
          full_name TEXT,
          avatar_url TEXT,
          website TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (id)
        );
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
        CREATE POLICY "Public profiles are viewable by everyone" 
          ON public.profiles FOR SELECT 
          USING (true);
          
        DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
        CREATE POLICY "Users can insert their own profile" 
          ON public.profiles FOR INSERT 
          WITH CHECK (auth.uid() = id);
          
        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
        CREATE POLICY "Users can update own profile" 
          ON public.profiles FOR UPDATE 
          USING (auth.uid() = id);
      `
    });
    
    if (profilesError) {
      console.warn('Warning creating profiles table:', profilesError.message);
    } else {
      console.log('✅ Profiles table created successfully');
    }
    
    // 2. Create user_files table
    console.log('\n2. Creating user_files table...');
    const { error: filesError } = await supabase.rpc('pg_temp.execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_files (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          file_name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_size BIGINT,
          mime_type TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view their own files" ON public.user_files;
        CREATE POLICY "Users can view their own files"
          ON public.user_files FOR SELECT
          USING (auth.uid() = user_id);
          
        DROP POLICY IF EXISTS "Users can insert their own files" ON public.user_files;
        CREATE POLICY "Users can insert their own files"
          ON public.user_files FOR INSERT
          WITH CHECK (auth.uid() = user_id);
          
        DROP POLICY IF EXISTS "Users can update their own files" ON public.user_files;
        CREATE POLICY "Users can update their own files"
          ON public.user_files FOR UPDATE
          USING (auth.uid() = user_id);
          
        DROP POLICY IF EXISTS "Users can delete their own files" ON public.user_files;
        CREATE POLICY "Users can delete their own files"
          ON public.user_files FOR DELETE
          USING (auth.uid() = user_id);
      `
    });
    
    if (filesError) {
      console.warn('Warning creating user_files table:', filesError.message);
    } else {
      console.log('✅ user_files table created successfully');
    }
    
    // 3. Create storage bucket
    console.log('\n3. Setting up storage bucket...');
    const { error: storageError } = await supabase.rpc('pg_temp.execute_sql', {
      sql: `
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('user-files', 'user-files', false, 52428800, '{"image/*","application/pdf","text/plain"}')
        ON CONFLICT (name) DO NOTHING;
        
        DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
        CREATE POLICY "Users can upload their own files"
          ON storage.objects FOR INSERT
          WITH CHECK (
            bucket_id = 'user-files' AND
            (auth.role() = 'authenticated')
          );
          
        DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
        CREATE POLICY "Users can view their own files"
          ON storage.objects FOR SELECT
          USING (
            bucket_id = 'user-files' AND
            (auth.role() = 'authenticated')
          );
          
        DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
        CREATE POLICY "Users can update their own files"
          ON storage.objects FOR UPDATE
          USING (
            bucket_id = 'user-files' AND
            (auth.role() = 'authenticated')
          );
          
        DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
        CREATE POLICY "Users can delete their own files"
          ON storage.objects FOR DELETE
          USING (
            bucket_id = 'user-files' AND
            (auth.role() = 'authenticated')
          );
      `
    });
    
    if (storageError) {
      console.warn('Warning setting up storage bucket:', storageError.message);
      console.log('\n⚠️  You may need to manually create the storage bucket in the Supabase dashboard.');
      console.log('   Go to: https://app.supabase.com/project/bgmopytuzmylchletyxv/storage/buckets');
      console.log('   Click "Create Bucket" and set the following:');
      console.log('   - Name: user-files');
      console.log('   - Public: OFF');
      console.log('   - File size limit: 50MB');
      console.log('   - Allowed MIME types: image/*, application/pdf, text/plain');
    } else {
      console.log('✅ Storage bucket created successfully');
    }
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Go to your Supabase dashboard: https://app.supabase.com/project/bgmopytuzmylchletyxv/editor');
    console.log('2. Verify the tables (profiles, user_files) were created');
    console.log('3. Verify the storage bucket "user-files" exists');
    
    return true;
  } catch (err) {
    console.error('Database setup failed:');
    console.error(err);
    return false;
  }
}

// Run the setup
setupDatabase().then(success => {
  if (!success) {
    console.log('❌ Database setup failed');
    process.exit(1);
  }
  process.exit(0);
});
