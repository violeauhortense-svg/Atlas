-- Agents table
create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  role text not null,
  status text default 'idle', -- active, idle, completed, blocked
  tasks jsonb default '[]'::jsonb,
  sub_agents uuid[] default array[]::uuid[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Agent Actions table (pour validation)
create table if not exists agent_actions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  agent_id uuid references agents(id) on delete cascade,
  title text not null,
  description text,
  status text default 'pending', -- pending, approved, rejected
  priority text default 'medium', -- low, medium, high
  details jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table agents enable row level security;
alter table agent_actions enable row level security;

-- Create policies
create policy "Allow all" on agents for all using (true);
create policy "Allow all" on agent_actions for all using (true);

-- Create indexes
create index if not exists idx_agents_project_id on agents(project_id);
create index if not exists idx_agent_actions_project_id on agent_actions(project_id);
create index if not exists idx_agent_actions_agent_id on agent_actions(agent_id);
create index if not exists idx_agent_actions_status on agent_actions(status);
