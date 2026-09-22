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
  unlock_lat double precision,
  unlock_lng double precision,
  unlock_location_label text,
  status text not null default 'sealed' check (status in ('sealed', 'unlocked')),
  unlocked_at timestamptz,
  created_at timestamptz not null default now()
);

-- If the table was created before the location columns existed, `create table
-- if not exists` above skips it and they never get added. Add them explicitly,
-- then refresh PostgREST's schema cache so the API sees them.
alter table public.capsules add column if not exists unlock_date timestamptz;
alter table public.capsules add column if not exists unlock_lat double precision;
alter table public.capsules add column if not exists unlock_lng double precision;
alter table public.capsules add column if not exists unlock_location_label text;
alter table public.capsules add column if not exists status text not null default 'sealed';
alter table public.capsules add column if not exists unlocked_at timestamptz;
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

-- ---------------------------------------------------------------------------
-- Capsule photos
-- Private bucket; files are stored at <user id>/<capsule id>.<ext>, and each
-- policy only lets a user reach the folder named after their own id.
-- Safe to run more than once.
-- ---------------------------------------------------------------------------
alter table public.capsules add column if not exists photo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'capsule-photos',
  'capsule-photos',
  false,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

drop policy if exists "Users can upload their own capsule photos" on storage.objects;
create policy "Users can upload their own capsule photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'capsule-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can view their own capsule photos" on storage.objects;
create policy "Users can view their own capsule photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'capsule-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their own capsule photos" on storage.objects;
create policy "Users can delete their own capsule photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'capsule-photos' and (storage.foldername(name))[1] = auth.uid()::text);
