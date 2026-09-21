-- Dear Tomorrow — capsules table
-- Run this once in your Supabase project's SQL Editor
-- (https://supabase.com/dashboard/project/_/sql/new).

create table if not exists public.capsules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  message text not null,
  unlock_method text not null check (unlock_method in ('date', 'place', 'date-and-place')),
  unlock_date timestamptz,
  unlock_location_label text,
  unlock_location_x numeric,
  unlock_location_y numeric,
  created_at timestamptz not null default now()
);

-- If the table was created before the location columns existed, `create table
-- if not exists` above skips it and they never get added. Add them explicitly,
-- then refresh PostgREST's schema cache so the API sees them.
alter table public.capsules add column if not exists unlock_date timestamptz;
alter table public.capsules add column if not exists unlock_location_label text;
alter table public.capsules add column if not exists unlock_location_x numeric;
alter table public.capsules add column if not exists unlock_location_y numeric;
notify pgrst, 'reload schema';

create index if not exists capsules_user_id_idx on public.capsules (user_id);

alter table public.capsules enable row level security;

create policy "Users can view their own capsules"
  on public.capsules for select
  using (auth.uid() = user_id);

create policy "Users can insert their own capsules"
  on public.capsules for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own capsules"
  on public.capsules for update
  using (auth.uid() = user_id);

create policy "Users can delete their own capsules"
  on public.capsules for delete
  using (auth.uid() = user_id);
