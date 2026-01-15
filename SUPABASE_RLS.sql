-- Enable RLS
alter table public.work_records enable row level security;
alter table public.projects enable row level security;
alter table public.memos enable row level security;

-- Policies: only owner can read/write
create policy if not exists "records_owner_rw" on public.work_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "projects_owner_rw" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "memos_owner_rw" on public.memos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
