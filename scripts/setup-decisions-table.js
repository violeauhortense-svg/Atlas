#!/usr/bin/env node

/**
 * Create decisions table in Supabase
 * This script creates the table and applies RLS policies
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing SUPABASE environment variables in .env.local');
  process.exit(1);
}

async function setupTable() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Note: Creating tables via client library requires admin key
  // For now, provide SQL to run manually
  const sql = `
-- Create decisions table
CREATE TABLE IF NOT EXISTS public.decisions (
    id BIGSERIAL PRIMARY KEY,
    project_id TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    decision_type TEXT NOT NULL,
    action TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved',
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_decisions_project_id ON decisions(project_id);
CREATE INDEX IF NOT EXISTS idx_decisions_agent_name ON decisions(agent_name);
CREATE INDEX IF NOT EXISTS idx_decisions_decision_type ON decisions(decision_type);
CREATE INDEX IF NOT EXISTS idx_decisions_created_at ON decisions(created_at);

-- Enable RLS
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON decisions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON decisions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON decisions
    FOR UPDATE USING (true);

-- Create timestamp update function
CREATE OR REPLACE FUNCTION update_decisions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS decisions_timestamp_trigger ON decisions;
CREATE TRIGGER decisions_timestamp_trigger
    BEFORE UPDATE ON decisions
    FOR EACH ROW
    EXECUTE FUNCTION update_decisions_timestamp();
  `;

  console.log('📋 SQL Migration Ready\n');
  console.log('To apply this migration:\n');
  console.log('1. Go to: https://app.supabase.com/project/' + supabaseUrl.split('.')[0].split('//')[1]);
  console.log('2. Click: SQL Editor');
  console.log('3. Create new query and paste:\n');
  console.log(sql);
  console.log('\n4. Click: Run\n');
  console.log('✅ After running, the decisions table will be ready!\n');
}

setupTable().catch(console.error);
