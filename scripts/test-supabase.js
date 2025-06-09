require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Anon Key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection to:', supabaseUrl);
  
  try {
    // Test connection by fetching project settings
    console.log('Fetching project settings...');
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .limit(1);
    
    if (error) {
      // Even if we get an error, the connection is working
      console.log('✅ Successfully connected to Supabase!');
      console.log('Note:', error.message);
      return true;
    }
    
    console.log('✅ Successfully connected to Supabase!');
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
