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

async function checkSchema() {
  console.log('Checking database schema...');
  
  try {
    // List all tables in the public schema
    console.log('\nListing all tables in public schema...');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (tablesError) {
      console.error('Error listing tables:', tablesError.message);
      console.log('\nTrying alternative method...');
      
      // Try alternative method using raw SQL
      const { data, error } = await supabase.rpc('pg_temp.execute_sql', {
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public';
        `
      });
      
      if (error) {
        console.error('Error with alternative method:', error.message);
        return false;
      }
      
      console.log('Tables in public schema:');
      console.log(data);
    } else {
      console.log('Tables in public schema:');
      console.log(tables.map(t => t.tablename).join('\n'));
    }
    
    // Check auth.users table (should exist in Supabase)
    console.log('\nChecking auth.users table...');
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
        
      if (usersError) {
        console.error('Error checking auth.users:', usersError.message);
      } else {
        console.log('✅ auth.users table is accessible');
        console.log(`Found ${users.length} users`);
      }
    } catch (err) {
      console.error('Exception checking auth.users:', err.message);
    }
    
    return true;
  } catch (err) {
    console.error('Error checking schema:');
    console.error(err);
    return false;
  }
}

// Run the check
checkSchema().then(success => {
  if (success) {
    console.log('\n✅ Schema check completed');
  } else {
    console.log('\n❌ Schema check failed');
  }
  process.exit(success ? 0 : 1);
});
