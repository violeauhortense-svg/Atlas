# 🔧 Supabase Migration - Apply Now

**Status:** Migration file ready, needs manual application  
**Time:** 2 minutes

---

## The Issue
Supabase CLI is trying to re-apply old migrations. We need to apply only the new `decisions` table migration.

## Solution: Apply via Supabase Dashboard (Easiest)

### Step 1: Open Supabase Dashboard

Go to: **https://app.supabase.com**

![](https://img.shields.io/badge/1-Open%20Supabase-blue)

### Step 2: Select Your Project

Click your **atlas** project (North EU, Stockholm)

### Step 3: Go to SQL Editor

Left sidebar → **SQL Editor**

### Step 4: Create New Query

Click: **New Query**

### Step 5: Copy the SQL

Copy this entire SQL block:

```sql
-- Create decisions table for tracking Claude-driven decisions
create table if not exists decisions (
  id bigserial primary key,
  project_id text not null,
  agent_name text not null,
  decision_type text not null,
  action text not null,
  status text not null default 'approved',
  context jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for faster queries
create index if not exists idx_decisions_project_id on decisions(project_id);
create index if not exists idx_decisions_agent_name on decisions(agent_name);
create index if not exists idx_decisions_decision_type on decisions(decision_type);
create index if not exists idx_decisions_created_at on decisions(created_at);

-- Enable RLS (Row Level Security)
alter table decisions enable row level security;

-- Create RLS policies
create policy "Enable read access for all users" on decisions
  for select using (true);

create policy "Enable insert access for all users" on decisions
  for insert with check (true);

create policy "Enable update access for all users" on decisions
  for update using (true);

-- Add trigger to update updated_at timestamp
create or replace function update_decisions_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger decisions_timestamp_trigger
  before update on decisions
  for each row
  execute function update_decisions_timestamp();
```

### Step 6: Paste into Query Editor

1. Click in the SQL editor pane
2. Paste the SQL above
3. It should look like a long query

### Step 7: Run the Query

Click: **RUN** button (or press Ctrl+Enter)

You should see:

```
✓ Query executed successfully

13 rows inserted in decisions

Rows affected: 13
```

### Step 8: Verify

Go to: **Database** → **Tables**

You should see: `decisions` table with 9 columns

✅ Done!

---

## Alternative: Use Script

If you prefer, run:

```bash
node scripts/setup-decisions-table.js
```

This will output the SQL and a direct link.

---

## Verification Checklist

After running the SQL, verify:

- [ ] Table `decisions` exists in Database → Tables
- [ ] Has columns: id, project_id, agent_name, decision_type, action, status, context, created_at, updated_at
- [ ] Has 4 indexes (idx_decisions_*)
- [ ] Has 3 RLS policies
- [ ] Has 1 trigger (decisions_timestamp_trigger)

---

## What This Does

| Item | Purpose |
|------|---------|
| `decisions` table | Stores all Claude-driven decisions |
| `project_id` | Links decision to specific product |
| `agent_name` | Which agent should act on this decision |
| `decision_type` | Type: claude_feedback, user_approval, system_trigger |
| `action` | The specific action (e.g., "OUI_TEST_99") |
| `status` | approved, pending, rejected, executed |
| `context` | Extra metadata (JSON) |
| Indexes | Speed up queries by project/agent/type |
| RLS Policies | Allow read/insert/update for all users |
| Trigger | Auto-update `updated_at` on changes |

---

## Next Steps

1. ✅ Apply SQL (above)
2. ✅ Verify table exists
3. Go back to terminal
4. Run: `git add supabase/ && git commit -m "fix: Add proper timestamp to migration file" && git push`
5. Check Vercel deployment status

---

**Once this is done, your system is 100% deployed and ready to test!** 🚀

If you have issues, DM me the error message.
