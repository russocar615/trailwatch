-- ============================================================
-- TrailWatch Government Pilot — Supabase Schema v2
-- Run this in Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Profiles (extends auth.users) ────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  full_name     text not null default '',
  role          text not null default 'public'
                check (role in ('super_admin','park_admin','ranger','public')),
  park_id       text,                     -- null = access all parks (super_admin)
  badge_number  text,
  agency        text,                     -- 'NSW NPWS' | 'NPS Olympic' etc
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  last_active   timestamptz
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id)
  with check (role = (select role from public.profiles where id = auth.uid()));
create policy "Admins read all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('super_admin','park_admin')));
create policy "Super admin manages profiles"
  on public.profiles for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'));

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, park_id, agency)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'public'),
    new.raw_user_meta_data->>'park_id',
    new.raw_user_meta_data->>'agency'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Parks ─────────────────────────────────────────────────────────────────────
create table if not exists public.parks (
  id                 text primary key,
  name               text not null,
  agency             text not null,
  country            text not null check (country in ('AU','US','NZ','GB','CA')),
  state_region       text not null,
  description        text,
  image_url          text,
  timezone           text not null default 'UTC',
  coordinates        jsonb,               -- { lat, lng }
  total_area_ha      numeric,
  established_year   int,
  emergency_contact  text,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

alter table public.parks enable row level security;
create policy "Anyone reads active parks" on public.parks for select using (is_active = true);
create policy "Admins manage parks" on public.parks for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('super_admin','park_admin')));

-- ── Parking lots ──────────────────────────────────────────────────────────────
create table if not exists public.parking_lots (
  id                 text primary key,
  park_id            text not null references public.parks(id) on delete cascade,
  name               text not null,
  total_spaces       int not null check (total_spaces > 0),
  occupied_spaces    int not null default 0 check (occupied_spaces >= 0),
  status             text not null default 'open'
                     check (status in ('open','busy','full','closed','unknown')),
  sensor_id          text,
  last_sensor_ping   timestamptz,
  coordinates        jsonb,
  notes              text,
  is_active          boolean not null default true,
  updated_at         timestamptz not null default now()
);

alter table public.parking_lots enable row level security;
create policy "Anyone reads parking" on public.parking_lots for select using (is_active = true);
create policy "Staff update parking" on public.parking_lots for update
  using (exists (select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','park_admin','ranger')
    and (p.park_id = park_id or p.role = 'super_admin')));
create policy "Admins manage parking" on public.parking_lots for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('super_admin','park_admin')));

-- ── Trails ────────────────────────────────────────────────────────────────────
create table if not exists public.trails (
  id                  text primary key,
  park_id             text not null references public.parks(id) on delete cascade,
  name                text not null,
  difficulty          text not null check (difficulty in ('Easy','Moderate','Hard','Expert')),
  length_km           numeric not null check (length_km > 0),
  elevation_gain_m    int not null default 0,
  estimated_hours     numeric,
  status              text not null default 'open'
                      check (status in ('open','closed','hazard','maintenance')),
  current_hikers      int not null default 0 check (current_hikers >= 0),
  max_capacity        int not null default 50 check (max_capacity > 0),
  crowd_level         text not null default 'quiet'
                      check (crowd_level in ('quiet','moderate','busy','very_busy')),
  description         text,
  features            text[] not null default '{}',
  surface_type        text,
  is_accessible       boolean not null default false,
  coordinates_start   jsonb,
  gpx_url             text,
  updated_at          timestamptz not null default now(),
  updated_by          uuid references auth.users(id)
);

alter table public.trails enable row level security;
create policy "Anyone reads trails" on public.trails for select using (true);
create policy "Staff update trails" on public.trails for update
  using (exists (select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','park_admin','ranger')
    and (p.park_id = park_id or p.role = 'super_admin')));
create policy "Admins manage trails" on public.trails for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('super_admin','park_admin')));

-- ── Incidents ─────────────────────────────────────────────────────────────────
create table if not exists public.incidents (
  id                   uuid primary key default gen_random_uuid(),
  park_id              text not null references public.parks(id) on delete cascade,
  trail_id             text references public.trails(id),
  reported_by          uuid not null references auth.users(id),
  reporter_name        text not null,
  category             text not null
                       check (category in ('medical','search_rescue','trail_hazard','wildlife','fire','flooding','infrastructure','visitor_behaviour','other')),
  severity             text not null
                       check (severity in ('low','medium','high','critical')),
  status               text not null default 'open'
                       check (status in ('open','in_progress','resolved','closed')),
  title                text not null,
  description          text not null,
  location_description text,
  coordinates          jsonb,
  assigned_to          uuid references auth.users(id),
  resolved_at          timestamptz,
  resolution_notes     text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.incidents enable row level security;
create policy "Staff read incidents" on public.incidents for select
  using (exists (select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','park_admin','ranger')
    and (p.park_id = park_id or p.role = 'super_admin')));
create policy "Staff create incidents" on public.incidents for insert
  with check (exists (select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','park_admin','ranger')));
create policy "Staff update incidents" on public.incidents for update
  using (exists (select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('super_admin','park_admin','ranger')
    and (p.park_id = park_id or p.role = 'super_admin')));

-- ── Audit logs ────────────────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id              uuid primary key default gen_random_uuid(),
  timestamp       timestamptz not null default now(),
  user_id         uuid,
  user_email      text,
  user_role       text,
  action          text not null,
  entity_type     text not null,
  entity_id       text,
  park_id         text,
  previous_value  jsonb,
  new_value       jsonb,
  ip_address      text,
  user_agent      text,
  metadata        jsonb
);

-- Audit logs are append-only — no updates or deletes
alter table public.audit_logs enable row level security;
create policy "Admins read audit logs" on public.audit_logs for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('super_admin','park_admin')));
create policy "System inserts audit logs" on public.audit_logs for insert
  with check (true); -- controlled via service role key in API routes

-- Index for common queries
create index if not exists audit_logs_timestamp_idx on public.audit_logs (timestamp desc);
create index if not exists audit_logs_park_idx on public.audit_logs (park_id, timestamp desc);
create index if not exists audit_logs_action_idx on public.audit_logs (action);

-- ── Sensors ───────────────────────────────────────────────────────────────────
create table if not exists public.sensors (
  id                text primary key,
  park_id           text not null references public.parks(id) on delete cascade,
  entity_id         text not null,
  entity_type       text not null check (entity_type in ('parking_lot','trail')),
  type              text not null check (type in ('parking_magnetic','trail_ir_counter','trail_thermal','weather')),
  hardware_id       text not null unique,
  firmware_version  text,
  health            text not null default 'unknown'
                    check (health in ('online','degraded','offline','unknown')),
  battery_pct       int check (battery_pct between 0 and 100),
  last_ping         timestamptz,
  last_reading      jsonb,
  installed_at      timestamptz,
  coordinates       jsonb
);

alter table public.sensors enable row level security;
create policy "Staff read sensors" on public.sensors for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('super_admin','park_admin','ranger')));
create policy "Super admin manages sensors" on public.sensors for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin'));

-- ── Hiker favourites & wishlist ───────────────────────────────────────────────
create table if not exists public.hiker_trail_lists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  trail_id   text not null references public.trails(id) on delete cascade,
  list_type  text not null check (list_type in ('favourite','wishlist')),
  created_at timestamptz not null default now(),
  unique (user_id, trail_id, list_type)
);

alter table public.hiker_trail_lists enable row level security;
create policy "Users manage own lists" on public.hiker_trail_lists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Seed pilot parks ──────────────────────────────────────────────────────────
insert into public.parks (id, name, agency, country, state_region, description, timezone, total_area_ha, established_year, emergency_contact) values
  ('royal-np',  'Royal National Park',  'NSW National Parks & Wildlife Service', 'AU', 'New South Wales', 'Australia''s oldest national park, established 1879. 16,000ha of coastal heath, rainforest and sandstone gorges south of Sydney.', 'Australia/Sydney',    16000,  1879, '1300 361 967'),
  ('olympic-np','Olympic National Park','US National Park Service',               'US', 'Washington',       'UNESCO World Heritage Site. Three ecosystems — glaciers, old-growth rainforest, and 70 miles of wilderness coast.',                  'America/Los_Angeles', 373397, 1938, '360-565-3130'),
  ('demo-park', 'Blue Ridge State Reserve','Parks Victoria',                      'AU', 'Victoria',         'High-altitude reserve protecting ancient snowgum woodlands and alpine bogs across 8,200 hectares.',                                  'Australia/Melbourne',  8200,  1956, '13 19 63')
on conflict (id) do nothing;
