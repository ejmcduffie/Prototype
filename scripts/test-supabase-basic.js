require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection to:', supabaseUrl);
  
  try {
    // Test connection by fetching auth settings
    console.log('Fetching auth settings...');
    const { data: settings, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error connecting to Supabase:');
      console.error(error);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('Auth session:', settings.session ? 'Active session' : 'No active session');
    return true;
  } catch (err) {
    console.error('Exception when connecting to Supabase:');
    console.error(err);
    return false;
  }
}

// Run the test
testConnection().then(success => {
  if (!success) {
    console.log('❌ Supabase connection test failed');
    process.exit(1);
  }
});
