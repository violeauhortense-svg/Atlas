-- Create projects table
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  target_users text,
  problem text,
  status text default 'validation',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create chat_messages table
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  role text not null,
  message text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table projects enable row level security;
alter table chat_messages enable row level security;

-- Create policies (allow all for now, can restrict later)
create policy "Allow all" on projects for all using (true);
create policy "Allow all" on chat_messages for all using (true);

-- Create indexes for performance
create index if not exists idx_chat_messages_project_id on chat_messages(project_id);
create index if not exists idx_projects_created_at on projects(created_at);
