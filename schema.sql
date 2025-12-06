-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- PROJECTS
create table projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  color text default '#6366f1', -- Default Indigo
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TASKS
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  project_id uuid references projects(id) on delete set null,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'in_progress', 'done')),
  scheduled_date date, -- For Calendar View
  duration integer default 60, -- Estimated time in minutes
  start_time time, -- Optional specific time
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NOTES
create table notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  content text,
  title text default 'Untitled Note',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS)
alter table profiles enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table notes enable row level security;

-- POLICIES

-- Profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Projects
create policy "Users can view own projects." on projects
  for select using (auth.uid() = user_id);

create policy "Users can insert own projects." on projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update own projects." on projects
  for update using (auth.uid() = user_id);

create policy "Users can delete own projects." on projects
  for delete using (auth.uid() = user_id);

-- Tasks
create policy "Users can view own tasks." on tasks
  for select using (auth.uid() = user_id);

create policy "Users can insert own tasks." on tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks." on tasks
  for update using (auth.uid() = user_id);

create policy "Users can delete own tasks." on tasks
  for delete using (auth.uid() = user_id);

-- Notes
create policy "Users can view own notes." on notes
  for select using (auth.uid() = user_id);

create policy "Users can insert own notes." on notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own notes." on notes
  for update using (auth.uid() = user_id);

create policy "Users can delete own notes." on notes
  for delete using (auth.uid() = user_id);

-- TRIGGERS
-- Handle new user signup -> create profile
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
