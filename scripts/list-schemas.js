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

async function listSchemas() {
  console.log('Listing all schemas and tables...');
  
  try {
    // List all schemas
    console.log('\n1. Listing all schemas...');
    const { data: schemas, error: schemasError } = await supabase
      .rpc('pg_temp.execute_sql', {
        sql: `
          SELECT schema_name 
          FROM information_schema.schemata 
          WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
          ORDER BY schema_name;
        `
      });

    if (schemasError) {
      console.error('Error listing schemas:', schemasError.message);
      return false;
    }
    
    console.log('Available schemas:');
    console.log(schemas.map(s => s.schema_name).join('\n'));
    
    // For each schema, list tables
    for (const schema of schemas) {
      const schemaName = schema.schema_name;
      console.log(`\n2. Listing tables in schema "${schemaName}"...`);
      
      const { data: tables, error: tablesError } = await supabase
        .rpc('pg_temp.execute_sql', {
          sql: `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = '${schemaName}'
            ORDER BY table_name;
          `
        });
      
      if (tablesError) {
        console.error(`Error listing tables in ${schemaName}:`, tablesError.message);
        continue;
      }
      
      if (tables.length === 0) {
        console.log(`No tables found in schema "${schemaName}"`);
        continue;
      }
      
      console.log(`Tables in "${schemaName}":`);
      console.log(tables.map(t => `- ${t.table_name}`).join('\n'));
      
      // For each table, show column info
      for (const table of tables) {
        const tableName = table.table_name;
        console.log(`\n  Columns in "${schemaName}.${tableName}":`);
        
        const { data: columns, error: columnsError } = await supabase
          .rpc('pg_temp.execute_sql', {
            sql: `
              SELECT column_name, data_type, is_nullable
              FROM information_schema.columns
              WHERE table_schema = '${schemaName}' AND table_name = '${tableName}'
              ORDER BY ordinal_position;
            `
          });
        
        if (columnsError) {
          console.error(`  Error getting columns:`, columnsError.message);
          continue;
        }
        
        console.log(columns.map(c => `  - ${c.column_name} (${c.data_type}${c.is_nullable === 'YES' ? ', nullable' : ''})`).join('\n'));
      }
    }
    
    return true;
  } catch (err) {
    console.error('Error listing schemas and tables:');
    console.error(err);
    return false;
  }
}

// Run the check
listSchemas().then(success => {
  if (success) {
    console.log('\n✅ Schema listing completed');
  } else {
    console.log('\n❌ Schema listing failed');
  }
  process.exit(success ? 0 : 1);
});
