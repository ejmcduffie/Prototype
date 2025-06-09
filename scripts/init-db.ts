import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabase: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const ancestryChainContainersPath = path.resolve(process.cwd(), '..', 'manus', 'ancestrychain-containers');

async function runMigrations(): Promise<boolean> {
  console.log('Preparing to run database migrations...');
  
  // Get database connection string from environment variables
  const databaseUrl = process.env.SUPABASE_DB_URL;
  if (!databaseUrl) {
    console.error('❌ SUPABASE_DB_URL environment variable is not set');
    console.error('Please add your database connection string to .env.local as SUPABASE_DB_URL');
    console.error('Format: postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres');
    return false;
  }

  // Create a new pool using the connection string
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false // Required for Supabase connection
    }
  });

  try {
    // Get all migration files
    const migrationsDir = path.join(ancestryChainContainersPath, 'supabase', 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();

    if (sqlFiles.length === 0) {
      console.error(`❌ No SQL migration files found in ${migrationsDir}`);
      return false;
    }

    console.log(`Found ${sqlFiles.length} migration files to apply...`);

    // Connect to the database
    const client = await pool.connect();

    try {
      // Create migrations table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.migrations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // Get already applied migrations
      const { rows: appliedMigrations } = await client.query('SELECT name FROM public.migrations');
      const appliedMigrationNames = appliedMigrations.map(m => m.name);

      // Apply each migration that hasn't been applied yet
      for (const file of sqlFiles) {
        if (!appliedMigrationNames.includes(file)) {
          console.log(`Applying migration: ${file}...`);
          
          // Read the SQL file
          const filePath = path.join(migrationsDir, file);
          const sql = await fs.readFile(filePath, 'utf8');
          
          // Execute the SQL
          await client.query('BEGIN');
          try {
            await client.query(sql);
            // Record the migration
            await client.query('INSERT INTO public.migrations (name) VALUES ($1)', [file]);
            await client.query('COMMIT');
            console.log(`✅ Applied migration: ${file}`);
          } catch (error) {
            await client.query('ROLLBACK');
            console.error(`❌ Failed to apply migration ${file}:`, error);
            return false;
          }
        } else {
          console.log(`✓ Migration already applied: ${file}`);
        }
      }

      console.log('✅ All migrations applied successfully!');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    return false;
  } finally {
    await pool.end();
  }
}

async function setupStorageAndPolicies(client: SupabaseClient): Promise<boolean> {
  const bucketName = 'documents';
  console.log(`Setting up storage bucket: ${bucketName}...`);

  try {
    // Create a new client with the service role key for storage operations
    const storageClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Check if bucket exists, create if not
    const { data: buckets, error: listError } = await storageClient.storage.listBuckets();
    if (listError) {
      console.error('❌ Error listing storage buckets:', listError);
      console.error('Please verify your Supabase service role key has the correct permissions.');
      return false;
    }
    const bucketExists = buckets?.some(b => b.name === bucketName);

    if (!bucketExists) {
      console.log(`Creating storage bucket "${bucketName}"...`);
      const { data: newBucket, error: createError } = await storageClient.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'],
        fileSizeLimit: 10485760, // 10MB
      });

      if (createError) {
        console.error('❌ Error creating storage bucket:', createError);
        return false;
      }
      console.log('✅ Created storage bucket:', newBucket);
    } else {
      console.log(`✅ Storage bucket "${bucketName}" already exists`);
    }

    // Provide instructions for manual RLS policy setup
    console.log('\n⚠️  RLS policies need to be applied manually in Supabase Dashboard');
    console.log('Please run the following SQL in your Supabase SQL Editor:');
    console.log(`
      -- Enable RLS on storage.objects
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

      -- Create policies for storage.objects
      CREATE POLICY "Users can view their own documents"
      ON storage.objects FOR SELECT
      USING (bucket_id = '${bucketName}' AND auth.uid() = (storage.foldername(name))[1]::uuid);

      CREATE POLICY "Users can upload their own documents"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = '${bucketName}' AND auth.uid() = (storage.foldername(name))[1]::uuid);

      CREATE POLICY "Users can update their own documents"
      ON storage.objects FOR UPDATE
      USING (bucket_id = '${bucketName}' AND auth.uid() = (storage.foldername(name))[1]::uuid);

      CREATE POLICY "Users can delete their own documents"
      ON storage.objects FOR DELETE
      USING (bucket_id = '${bucketName}' AND auth.uid() = (storage.foldername(name))[1]::uuid);
    `);
    
    return true;
  } catch (error) {
    console.error('❌ Error setting up storage bucket:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Supabase setup script...');

  // Check for required environment variables
  if (!process.env.SUPABASE_DB_URL) {
    console.error('❌ Missing required environment variable: SUPABASE_DB_URL');
    console.error('Please add your database connection string to .env.local:');
    console.error('SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres');
    console.error('You can find this in your Supabase dashboard under Project Settings -> Database -> Connection string');
    return;
  }

  // Run migrations
  const migrationsSuccess = await runMigrations();
  if (!migrationsSuccess) {
    console.error('❌ Migrations failed. Please address the issues above before proceeding.');
    return;
  }

  // Then set up storage and policies
  const storageSuccess = await setupStorageAndPolicies(supabase);
  if (!storageSuccess) {
    console.error('❌ Storage setup failed. Please check the errors above.');
    return;
  }

  console.log('\n🎉 Setup completed successfully!');
  console.log('You can now use Supabase in your application with the following environment variables:');
  console.log(`- NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`);
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
  console.log('\nYou can find your anon key in the Supabase dashboard under Project Settings -> API');
}

main().catch(error => {
  console.error('❌ Unhandled error in main setup:', error);
  process.exit(1);
});