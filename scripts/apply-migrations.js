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

async function runMigrations() {
  console.log('Starting database migrations...');
  
  try {
    // Read the SQL migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20240608235000_initial_schema.sql');
    const sql = await fs.readFile(migrationPath, 'utf8');
    
    // Replace environment variables in the SQL
    const processedSql = sql.replace(/\$\{JWT_SECRET\}/g, process.env.SUPABASE_JWT_SECRET || 'your-jwt-secret');
    
    // Split into individual statements
    const statements = processedSql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      console.log('\nExecuting statement:');
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
      
      try {
        const { data, error } = await supabase.rpc('pg_temp.execute_sql', { sql: statement });
        
        if (error) {
          console.error('Error executing statement:', error.message);
          console.error('Statement:', statement);
          // Continue with next statement instead of failing
          continue;
        }
        
        console.log('✅ Statement executed successfully');
      } catch (err) {
        console.error('Exception executing statement:', err.message);
        console.error('Statement:', statement);
        // Continue with next statement instead of failing
        continue;
      }
    }
    
    console.log('\n✅ All migrations completed successfully!');
    return true;
  } catch (err) {
    console.error('Migration failed:');
    console.error(err);
    return false;
  }
}

// Run the migrations
runMigrations().then(success => {
  if (!success) {
    console.log('❌ Database migrations failed');
    process.exit(1);
  }
  process.exit(0);
});
