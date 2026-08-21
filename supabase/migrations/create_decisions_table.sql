-- Create decisions table for tracking Claude-driven decisions
create table if not exists decisions (
  id bigserial primary key,
  project_id text not null,
  agent_name text not null,
  decision_type text not null, -- 'claude_feedback', 'user_approval', 'system_trigger'
  action text not null,
  status text not null default 'approved', -- 'approved', 'pending', 'rejected', 'executed'
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
