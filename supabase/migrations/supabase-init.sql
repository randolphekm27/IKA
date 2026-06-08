-- 
-- IKA — Platform de Galerie Photo Événementielle Live
-- Supabase Schema & Initial Migrations
-- 

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table users : List of users and roles
create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text not null check (role in ('admin', 'organisateur', 'photographe', 'invite')) default 'invite',
  created_at timestamptz default now()
);

-- Table events : Created by users (role admin or organisateur)
create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  location text,
  cover_image text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Table photos : Uploaded live
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  image_url text not null,
  uploaded_by uuid references public.users(id) on delete set null,
  download_count integer not null default 0,
  created_at timestamptz default now()
);

-- Active Supabase Realtime for photostream
alter publish supabase_realtime add table public.photos;

-- 
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- 

alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.photos enable row level security;

-- Users policies
create policy "Allow public read-only access to users profiles"
  on public.users for select
  using (true);

create policy "Allow users to update their own profiles"
  on public.users for update
  using (auth.uid() = id);

-- Events policies
create policy "Allow public read access to all events"
  on public.events for select
  using (true);

create policy "Organisateurs can insert their own events"
  on public.events for insert
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role in ('admin', 'organisateur')
    )
  );

create policy "Organisateurs can manage their own events"
  on public.events for all
  using (created_by = auth.uid() or exists (
    select 1 from public.users where users.id = auth.uid() and users.role = 'admin'
  ));

-- Photos policies
create policy "Photos are publicly readable"
  on public.photos for select
  using (true);

create policy "Photographers can upload is authorized"
  on public.photos for insert
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role in ('admin', 'organisateur', 'photographe')
    )
  );

create policy "Photographers and owners can delete photos"
  on public.photos for delete
  using (
    uploaded_by = auth.uid() or 
    exists (
      select 1 from public.events
      where events.id = photos.event_id and events.created_by = auth.uid()
    ) or
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );
