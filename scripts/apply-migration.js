#!/usr/bin/env node

/**
 * Apply Supabase migration directly
 * Usage: node scripts/apply-migration.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE environment variables');
  console.error('Ensure .env.local has:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Read migration file
const migrationFile = path.join(
  __dirname,
  '../supabase/migrations/20260821_create_decisions_table.sql'
);

let sql;
try {
  sql = fs.readFileSync(migrationFile, 'utf-8');
} catch (err) {
  console.error(`❌ Failed to read migration file: ${err.message}`);
  process.exit(1);
}

// Split SQL into individual statements (simple split by semicolon)
const statements = sql
  .split(';')
  .map((stmt) => stmt.trim())
  .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

async function applyMigration() {
  try {
    console.log('🚀 Applying migration to Supabase...\n');

    // Use Supabase REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        sql: sql,
      }),
    });

    if (!response.ok) {
      // If REST API doesn't work, try using postgres-js or shell
      console.log('⚠️  REST API method not available, trying direct approach...\n');
      applyViaSQL();
      return;
    }

    const result = await response.json();
    console.log('✅ Migration applied successfully!\n');
    console.log('📊 Summary:');
    console.log('  - Created table: decisions');
    console.log('  - Created indexes: 4');
    console.log('  - Created RLS policies: 3');
    console.log('  - Created trigger: 1\n');
    console.log('ℹ️  You can verify in Supabase dashboard:');
    console.log('   Database → Tables → decisions\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Alternative: Apply SQL manually');
    console.log('   1. Go to: https://app.supabase.com');
    console.log('   2. Select your atlas project');
    console.log('   3. Go to: SQL Editor');
    console.log('   4. Create new query');
    console.log('   5. Copy-paste content from: supabase/migrations/20260821_create_decisions_table.sql');
    console.log('   6. Run query\n');
    process.exit(1);
  }
}

function applyViaSQL() {
  // For direct SQL application, we'd need postgres-js
  console.log('📋 SQL to apply manually:\n');
  console.log(sql);
  console.log('\n💾 Save this and run in Supabase SQL Editor');
}

applyMigration();
