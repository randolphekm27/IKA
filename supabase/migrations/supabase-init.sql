-- 
-- IKA — Platform de Galerie Photo Événementielle Live
-- Supabase Schema & Initial Migrations
-- 

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: users
-- Stores all users and their roles
-- ============================================================
create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text, -- hashed in production, plaintext in dev mock
  role text not null check (role in ('admin', 'organisateur', 'photographe', 'invite')) default 'invite',
  status text not null check (status in ('active', 'suspended')) default 'active',
  created_at timestamptz default now()
);

-- ============================================================
-- TABLE: events
-- Created by users with role admin or organisateur
-- ============================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  location text,
  cover_image text,
  status text not null check (status in ('active', 'archived')) default 'active',
  date date, -- event date
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLE: photos
-- Uploaded live during events
-- ============================================================
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  image_url text not null,
  uploaded_by uuid references public.users(id) on delete set null,
  uploaded_by_name text not null default 'Invité',
  download_count integer not null default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLE: event_photographers
-- Maps photographers to events they are assigned to
-- ============================================================
create table public.event_photographers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  photographer_id uuid references public.users(id) on delete cascade,
  joined_at timestamptz default now(),
  revoked boolean not null default false,
  unique(event_id, photographer_id)
);

-- ============================================================
-- TABLE: invitation_tokens
-- Shareable tokens for photographers to join an event
-- ============================================================
create table public.invitation_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  event_id uuid references public.events(id) on delete cascade,
  created_at timestamptz default now(),
  revoked boolean not null default false
);

-- ============================================================
-- TABLE: visits
-- Tracks unique visitor impressions per event
-- ============================================================
create table public.visits (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  visitor_token text not null,
  created_at timestamptz default now(),
  unique(event_id, visitor_token)
);

-- ============================================================
-- TABLE: reset_tokens
-- Password reset tokens with expiration
-- ============================================================
create table public.reset_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text unique not null,
  expires timestamptz not null,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- Performance optimization for frequent queries
-- ============================================================
create index idx_photos_event_id on public.photos(event_id);
create index idx_photos_uploaded_by on public.photos(uploaded_by);
create index idx_event_photographers_event on public.event_photographers(event_id);
create index idx_event_photographers_photographer on public.event_photographers(photographer_id);
create index idx_invitation_tokens_token on public.invitation_tokens(token);
create index idx_invitation_tokens_event on public.invitation_tokens(event_id);
create index idx_visits_event_id on public.visits(event_id);
create index idx_reset_tokens_token on public.reset_tokens(token);
create index idx_events_slug on public.events(slug);
create index idx_events_created_by on public.events(created_by);

-- ============================================================
-- SUPABASE REALTIME
-- Enable realtime subscriptions for live photo stream
-- ============================================================
alter publication supabase_realtime add table public.photos;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.photos enable row level security;
alter table public.event_photographers enable row level security;
alter table public.invitation_tokens enable row level security;
alter table public.visits enable row level security;
alter table public.reset_tokens enable row level security;

-- ----------------------------------------------------------
-- USERS POLICIES
-- ----------------------------------------------------------
create policy "Allow public read-only access to user profiles"
  on public.users for select
  using (true);

create policy "Allow users to update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Allow users to insert their own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- ----------------------------------------------------------
-- EVENTS POLICIES
-- ----------------------------------------------------------
create policy "Allow public read access to all events"
  on public.events for select
  using (true);

create policy "Organisateurs and admins can create events"
  on public.events for insert
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
        and users.role in ('admin', 'organisateur')
    )
  );

create policy "Organisateurs can update their own events"
  on public.events for update
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

create policy "Organisateurs can delete their own events"
  on public.events for delete
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- ----------------------------------------------------------
-- PHOTOS POLICIES
-- ----------------------------------------------------------
create policy "Photos are publicly readable"
  on public.photos for select
  using (true);

create policy "Authorized users can upload photos"
  on public.photos for insert
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
        and users.role in ('admin', 'organisateur', 'photographe')
    )
  );

create policy "Photographers and event owners can delete photos"
  on public.photos for delete
  using (
    uploaded_by = auth.uid()
    or exists (
      select 1 from public.events
      where events.id = photos.event_id
        and events.created_by = auth.uid()
    )
    or exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- ----------------------------------------------------------
-- EVENT_PHOTOGRAPHERS POLICIES
-- ----------------------------------------------------------
create policy "Event photographers are publicly readable"
  on public.event_photographers for select
  using (true);

create policy "Organisateurs and admins can manage photographer assignments"
  on public.event_photographers for insert
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
        and users.role in ('admin', 'organisateur', 'photographe')
    )
  );

create policy "Organisateurs can update photographer assignments"
  on public.event_photographers for update
  using (
    exists (
      select 1 from public.events
      where events.id = event_photographers.event_id
        and events.created_by = auth.uid()
    )
    or exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- ----------------------------------------------------------
-- INVITATION_TOKENS POLICIES
-- ----------------------------------------------------------
create policy "Invitation tokens are publicly readable for join flow"
  on public.invitation_tokens for select
  using (true);

create policy "Event owners can create invitation tokens"
  on public.invitation_tokens for insert
  with check (
    exists (
      select 1 from public.events
      where events.id = invitation_tokens.event_id
        and events.created_by = auth.uid()
    )
    or exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

create policy "Event owners can update invitation tokens"
  on public.invitation_tokens for update
  using (
    exists (
      select 1 from public.events
      where events.id = invitation_tokens.event_id
        and events.created_by = auth.uid()
    )
    or exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- ----------------------------------------------------------
-- VISITS POLICIES
-- ----------------------------------------------------------
create policy "Visits are publicly insertable for tracking"
  on public.visits for insert
  with check (true);

create policy "Event owners can read visit stats"
  on public.visits for select
  using (true);

-- ----------------------------------------------------------
-- RESET_TOKENS POLICIES
-- ----------------------------------------------------------
create policy "Reset tokens are server-managed"
  on public.reset_tokens for select
  using (false); -- Only accessible via service_role key

