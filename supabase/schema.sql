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

-- ---------------------------------------------------------------------------
-- Multiple photos per capsule (up to 3 while the free plan is the only plan)
-- Replaces the old single `photo_path` column. Safe to run more than once.
-- ---------------------------------------------------------------------------
alter table public.capsules add column if not exists photo_paths text[] not null default '{}';
update public.capsules set photo_paths = array[photo_path]
  where photo_path is not null and photo_paths = '{}';
alter table public.capsules drop column if exists photo_path;

alter table public.capsules drop constraint if exists capsules_photo_paths_max3;
alter table public.capsules add constraint capsules_photo_paths_max3
  check (array_length(photo_paths, 1) is null or array_length(photo_paths, 1) <= 3);

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- Profile avatars
-- One row per user; avatar_path points at the `avatars` bucket (public read,
-- so the picture can be shown straight from its URL with no signing step —
-- same tradeoff most apps make for a profile photo). `updated_at` doubles as
-- a cache-busting query param so a re-upload shows immediately.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  avatar_path text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can upsert their own profile" on public.profiles;
create policy "Users can upsert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly viewable" on storage.objects;
create policy "Avatar images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can replace their own avatar" on storage.objects;
create policy "Users can replace their own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
