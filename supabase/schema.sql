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

-- An earlier version of this table (created directly in the dashboard, before
-- this file existed) had `first_name`/`last_name` columns marked `not null`.
-- Nothing in the app writes to them — first/last name only ever lives in
-- auth.users' metadata, set at sign-up — so any insert that didn't happen to
-- carry them (e.g. the avatar upload upsert) failed with "null value in
-- column first_name violates not-null constraint". Relax them if present.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'first_name'
  ) then
    alter table public.profiles alter column first_name drop not null;
    alter table public.profiles alter column last_name drop not null;
  end if;
end $$;

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

-- Without this, PostgREST can keep serving requests against its last-known
-- schema and not know `profiles` exists yet — every read/write to it then
-- fails with "Could not find the table 'public.profiles' in the schema
-- cache", which is exactly what silently broke avatar uploads.
notify pgrst, 'reload schema';

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

-- ---------------------------------------------------------------------------
-- Archive (reversible, independent of unlock status) and true opened/viewed
-- state (distinct from `status`, which only reflects the unlock condition).
-- Delete needs no new column — it reuses the "Users can delete their own
-- capsules" policy above, which existed but had no caller until now.
-- ---------------------------------------------------------------------------
alter table public.capsules add column if not exists archived_at timestamptz;
alter table public.capsules add column if not exists opened_at timestamptz;
notify pgrst, 'reload schema';

-- One row per reveal, so a shared capsule can later show who opened it and
-- when. Append-only: nothing ever updates or deletes a row here.
create table if not exists public.capsule_opens (
  id uuid primary key default gen_random_uuid(),
  capsule_id uuid not null references public.capsules (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Denormalized so the owner can see who opened it without a privileged
  -- lookup into auth.users from the client.
  opened_by_email text not null,
  opened_at timestamptz not null default now()
);
create index if not exists capsule_opens_capsule_id_idx on public.capsule_opens (capsule_id);

alter table public.capsule_opens enable row level security;

drop policy if exists "Users can log their own opens" on public.capsule_opens;
create policy "Users can log their own opens"
  on public.capsule_opens for insert
  with check (auth.uid() = user_id);

drop policy if exists "Owners and openers can view opens" on public.capsule_opens;
create policy "Owners and openers can view opens"
  on public.capsule_opens for select
  using (
    auth.uid() = user_id
    or capsule_id in (select id from public.capsules where user_id = auth.uid())
  );

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- Freeform tags (distinct from `mood`, which only biases cover-art color) and
-- a per-capsule unlock radius (previously a single hardcoded constant in
-- lib/checkLocationCapsules.ts — now user-configurable per place capsule).
-- ---------------------------------------------------------------------------
alter table public.capsules add column if not exists tags text[] not null default '{}';
alter table public.capsules drop constraint if exists capsules_tags_max5;
alter table public.capsules add constraint capsules_tags_max5
  check (array_length(tags, 1) is null or array_length(tags, 1) <= 5);

alter table public.capsules add column if not exists unlock_radius_meters integer not null default 300;
alter table public.capsules drop constraint if exists capsules_unlock_radius_range;
alter table public.capsules add constraint capsules_unlock_radius_range
  check (unlock_radius_meters between 50 and 5000);

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- Notification preferences, read later by the reminder cron job.
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists email_reminders_enabled boolean not null default true;
alter table public.profiles add column if not exists reminder_lead_hours integer not null default 24;
alter table public.profiles drop constraint if exists profiles_reminder_lead_hours_valid;
alter table public.profiles add constraint profiles_reminder_lead_hours_valid
  check (reminder_lead_hours in (1, 24, 72, 168));
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- One-time bookkeeping for the reminder cron (app/api/cron/send-reminders) —
-- a capsule only ever has one date-unlock event, so a nullable timestamp is
-- enough to prevent double-sending. Server-only: never read from the client.
-- ---------------------------------------------------------------------------
alter table public.capsules add column if not exists reminder_sent_at timestamptz;
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- Sharing: invite a capsule to someone by email. Read-access only (an
-- accepted recipient can view/open, not edit/delete/archive/share) — a
-- "family/group" capsule is just one capsule shared to several emails, not a
-- separate concept. Matching is done entirely via the invited user's own
-- verified JWT email (auth.jwt() ->> 'email'), so no admin/service-role
-- lookup is needed to know whether an invited address has an account yet.
-- ---------------------------------------------------------------------------
create table if not exists public.capsule_shares (
  id uuid primary key default gen_random_uuid(),
  capsule_id uuid not null references public.capsules (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  invited_email text not null,
  -- Snapshot at invite time, so a pending recipient can see what they were
  -- invited to without row access to the capsule itself (granted only once accepted).
  capsule_title text not null,
  invited_user_id uuid references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);
create unique index if not exists capsule_shares_unique on public.capsule_shares (capsule_id, lower(invited_email));
create index if not exists capsule_shares_invited_user_idx on public.capsule_shares (invited_user_id);

alter table public.capsule_shares enable row level security;

drop policy if exists "Owners manage their shares" on public.capsule_shares;
create policy "Owners manage their shares"
  on public.capsule_shares for all
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.capsules c where c.id = capsule_id and c.user_id = auth.uid())
  );

drop policy if exists "Invitees can see invites addressed to them" on public.capsule_shares;
create policy "Invitees can see invites addressed to them"
  on public.capsule_shares for select
  using (
    invited_user_id = auth.uid()
    or lower(invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "Invitees can accept their own invite" on public.capsule_shares;
create policy "Invitees can accept their own invite"
  on public.capsule_shares for update
  using (lower(invited_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (invited_user_id = auth.uid() and status = 'accepted');

-- Widen capsule visibility to accepted recipients. Replaces the original
-- owner-only select policy from earlier in this file.
drop policy if exists "Users can view their own capsules" on public.capsules;
drop policy if exists "Users can view their own or accepted-shared capsules" on public.capsules;
create policy "Users can view their own or accepted-shared capsules"
  on public.capsules for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.capsule_shares s
      where s.capsule_id = capsules.id and s.invited_user_id = auth.uid() and s.status = 'accepted'
    )
  );

notify pgrst, 'reload schema';
