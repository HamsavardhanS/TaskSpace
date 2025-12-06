-- TASKS PHERE FULL SCHEMA UPDATE
-- Run this in Supabase SQL Editor

-- 1. DROPS (To ensure clean state if re-running portions, handle with care in prod)
-- Using "if exists" to be safe.
-- drop table if exists time_logs;
-- drop table if exists events;
-- drop table if exists project_members;

-- 2. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 3. UPDATED TABLES

-- PROFILES (Users)
alter table profiles add column if not exists role text default 'user';
alter table profiles add column if not exists timezone text default 'UTC';

-- PROJECTS (Enhanced)
alter table projects add column if not exists owner_id uuid references profiles(id);
-- If owner_id is new, backfill it (optional manual step), mostly for new projects.

-- PROJECT MEMBERS (Teams)
create table if not exists project_members (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('admin', 'member', 'guest')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, user_id)
);

alter table project_members enable row level security;
create policy "Members can view project members" on project_members for select using (
  auth.uid() in (select user_id from project_members where project_id = project_members.project_id)
);
-- (Additional policies needed for inviting, strictly owner/admin for now)

-- TASKS (Enhanced)
alter table tasks add column if not exists priority text default 'medium'; -- low, medium, high
alter table tasks add column if not exists tags text[];
alter table tasks add column if not exists recurring_rule text; -- e.g. "weekly", "daily"
alter table tasks add column if not exists due_date timestamp with time zone; -- Distinct from scheduled_date? keeping scheduled_date as primary.

-- EVENTS (Calendar)
create table if not exists events (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade, 
  user_id uuid references profiles(id) on delete cascade not null, 
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  location text,
  participants text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table events enable row level security;
create policy "Users can view relevant events" on events for select using (
  auth.uid() = user_id or 
  project_id in (select project_id from project_members where user_id = auth.uid())
);
create policy "Users can insert events" on events for insert with check (auth.uid() = user_id);
create policy "Users can update own events" on events for update using (auth.uid() = user_id);
create policy "Users can delete own events" on events for delete using (auth.uid() = user_id);

-- TIME LOGS (Analytics)
create table if not exists time_logs (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references tasks(id) on delete set null,
  user_id uuid references profiles(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade,
  duration integer not null, -- seconds
  started_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table time_logs enable row level security;
create policy "Users can view own logs" on time_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on time_logs for insert with check (auth.uid() = user_id);
