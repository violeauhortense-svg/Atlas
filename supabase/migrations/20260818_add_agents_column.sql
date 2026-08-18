-- Add agents tracking to projects
alter table projects add column if not exists agents_status jsonb default '[]'::jsonb;

-- agents_status will store: [{ name: "agent_name", status: "active|idle|completed", task: "what_they_do" }]
