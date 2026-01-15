-- Tables
create table if not exists public.work_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  record_type text check (record_type in ('promotional','meeting_minutes','policy_application','project_proposal')),
  link_url text,
  ai_summary text,
  status text default 'active',
  priority text default 'medium',
  progress int default 0,
  created_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  description text,
  project_type text,
  status text default 'in_progress',
  priority text default 'medium',
  progress int default 0,
  start_date date,
  target_date date,
  linked_record_ids text[]
);

create table if not exists public.memos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  date date,
  time text,
  type text,
  priority text default 'medium',
  is_notified boolean default false
);
