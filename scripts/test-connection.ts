// scripts/test-connection.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testSupabaseConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Anon Key');
    return false;
  }

  // First, try to access the health endpoint
  try {
    const healthUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/`;
    const response = await fetch(healthUrl, {
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('✅ Successfully connected to Supabase REST endpoint');
    return true;
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    return false;
  }
}

async function main() {
  console.log('Testing Supabase connection...');
  const isConnected = await testSupabaseConnection();
  
  if (isConnected) {
    console.log('✅ Supabase connection test passed!');
    process.exit(0);
  } else {
    console.error('❌ Supabase connection test failed');
    process.exit(1);
  }
}

main().catch(console.error);