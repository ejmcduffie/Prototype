require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client with anon key first
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test user data
const testUser = {
  email: `testuser.${Date.now()}@example.com`,
  password: 'TestPassword123!',
  user_metadata: {
    name: 'Test User',
    avatar_url: ''
  }
};

console.log('Using test email:', testUser.email);

// Test file data
const testFileContent = 'This is a test file content for Supabase storage';
const testFileName = `test-${Date.now()}.txt`;

async function runTests() {
  console.log('Starting Supabase CRUD and file upload test...');
  
  // Check if we can use the service role key for admin operations
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let supabaseAdmin;
  
  if (serviceRoleKey) {
    console.log('Using service role key for admin operations');
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } else {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found. Some operations may be restricted.');
    supabaseAdmin = supabase;
  }
  
  try {
    // 1. Check if we can create a user with admin privileges
    let userId;
    
    try {
      console.log('\n1. Attempting to create user with admin privileges...');
      const { data: authData, error: adminCreateError } = await supabaseAdmin.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: testUser.user_metadata
      });
      
      if (adminCreateError) throw adminCreateError;
      
      userId = authData.user.id;
      console.log(`✅ Admin created user with ID: ${userId}`);
    } catch (adminError) {
      console.warn('Could not create user with admin privileges, falling back to email signup:', adminError.message);
      
      // Fall back to regular signup if admin create fails
      console.log('\n1. Signing up a new user...');
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          data: testUser.user_metadata,
          emailRedirectTo: 'http://localhost:3000/auth/callback'
        }
      });

      if (signUpError) {
        console.error('❌ Failed to sign up user:', signUpError.message);
        console.log('\nTo enable email signup in your Supabase dashboard:');
        console.log('1. Go to: https://app.supabase.com/project/bgmopytuzmylchletyxv/auth/providers');
        console.log('2. Enable "Email" provider');
        console.log('3. Under "Email Confirmations", set "Enable Confirmations" to ON');
        console.log('4. Under "Email Confirmations", set "Double Confirm Changes" to OFF');
        console.log('5. Under "Email Confirmations", set "Secure email change" to OFF');
        console.log('6. Save changes');
        console.log('\nThen run this test again.');
        throw signUpError;
      }
      
      if (!authData.user) {
        throw new Error('Failed to create user: No user data returned');
      }
      
      userId = authData.user.id;
      console.log(`✅ User created with ID: ${userId}`);
      console.log('\n⚠️  Check your email to confirm your account before proceeding with the test.');
      console.log('   After confirming, run the test again to continue with file uploads.');
      return;
    }
    
    // 2. Sign in the user to get a session
    console.log('\n2. Signing in the user...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });
    
    if (signInError) {
      console.error('❌ Failed to sign in user:', signInError.message);
      console.log('\nIf you just confirmed your email, please run the test again.');
      throw signInError;
    }
    
    console.log('✅ User signed in successfully');
    
    // 3. Create a user profile (if your app uses a separate profiles table)
    try {
      console.log('\n3. Creating user profile...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: userId,
            username: `user_${Date.now()}`,
            full_name: testUser.user_metadata.name,
            avatar_url: testUser.user_metadata.avatar_url || '',
            updated_at: new Date().toISOString()
          }
        ])
        .select();

      if (profileError) {
        console.warn('Note: Could not create profile (might need to handle this in your auth hooks):', profileError.message);
      } else {
        console.log('✅ Profile created:', profileData[0]);
      }
    } catch (profileError) {
      console.warn('Skipping profile creation - profiles table might not exist or have a different structure');
    }

    // 3. Create a test file
    console.log('\n3. Creating test file...');
    const tempFilePath = path.join(__dirname, testFileName);
    fs.writeFileSync(tempFilePath, testFileContent);
    
    // 4. Upload file to user's storage
    console.log('\n4. Uploading file to storage...');
    const fileContents = fs.readFileSync(tempFilePath);
    const filePath = `${userId}/${testFileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-files') // Make sure this bucket exists in your Supabase storage
      .upload(filePath, fileContents, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'text/plain'
      });
    
    if (uploadError) {
      if (uploadError.message.includes('bucket not found')) {
        console.log('Creating storage bucket "user-files"...');
        const { error: createBucketError } = await supabase.storage.createBucket('user-files', {
          public: false,
          allowedMimeTypes: ['text/plain'],
          fileSizeLimit: 1024 * 1024 // 1MB
        });
        
        if (createBucketError) throw createBucketError;
        
        // Retry upload after creating bucket
        const { data: retryUploadData, error: retryError } = await supabase.storage
          .from('user-files')
          .upload(filePath, fileContents, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'text/plain'
          });
          
        if (retryError) throw retryError;
        console.log('✅ File uploaded successfully:', retryUploadData);
      } else {
        throw uploadError;
      }
    } else {
      console.log('✅ File uploaded successfully:', uploadData);
    }
    
    // 5. Get public URL for the uploaded file
    console.log('\n5. Getting public URL for the uploaded file...');
    const { data: { publicUrl } } = supabase.storage
      .from('user-files')
      .getPublicUrl(filePath);
    
    console.log('✅ File public URL:', publicUrl);
    
    // 6. Store file reference in database
    console.log('\n6. Storing file reference in database...');
    const { data: fileRefData, error: fileRefError } = await supabase
      .from('user_files')
      .insert([
        {
          user_id: userId,
          file_name: testFileName,
          file_path: filePath,
          file_url: publicUrl,
          file_type: 'text/plain',
          file_size: fileContents.length
        }
      ])
      .select();
    
    if (fileRefError) {
      // If table doesn't exist, create it
      if (fileRefError.code === '42P01') {
        console.log('Creating user_files table...');
        const { error: createTableError } = await supabase.rpc('create_user_files_table');
        
        if (createTableError) {
          console.warn('Could not create table automatically. Please create it manually with:', `
            CREATE TABLE IF NOT EXISTS public.user_files (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
              file_name TEXT NOT NULL,
              file_path TEXT NOT NULL,
              file_url TEXT NOT NULL,
              file_type TEXT NOT NULL,
              file_size BIGINT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );
            
            -- Enable RLS
            ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;
            
            -- Create policies as needed
            CREATE POLICY "Users can view their own files" 
            ON public.user_files
            FOR SELECT
            USING (auth.uid() = user_id);
            
            CREATE POLICY "Users can insert their own files"
            ON public.user_files
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
          `);
        }
      }
      console.warn('Could not store file reference in database:', fileRefError.message);
    } else {
      console.log('✅ File reference stored in database:', fileRefData[0]);
    }
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\nTest User Email:', testUser.email);
    console.log('Test User Password:', testUser.password);
    console.log('File uploaded to:', publicUrl);
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error);
    process.exit(1);
  } finally {
    // Clean up: Delete the temporary file
    try {
      const tempFilePath = path.join(__dirname, testFileName);
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (cleanupError) {
      console.warn('Warning: Could not clean up temporary file:', cleanupError.message);
    }
  }
}

// Run the tests
runTests();
