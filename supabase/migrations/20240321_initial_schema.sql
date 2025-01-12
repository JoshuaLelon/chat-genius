-- Drop existing schema if it exists
drop schema if exists public cascade;
create schema public;

-- Grant permissions to service role
grant usage on schema public to service_role;
grant all privileges on schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;

-- Create users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  avatar_url text,
  status text check (status in ('online', 'offline', 'busy')) default 'offline',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create workspaces table
create table public.workspaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create workspace_members table (junction table for users-workspaces)
create table public.workspace_members (
  workspace_id uuid references public.workspaces on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (workspace_id, user_id)
);

-- Create channels table
create table public.channels (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (workspace_id, name)
);

-- Create direct_messages table
create table public.direct_messages (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create dm_participants table (junction table for users-direct_messages)
create table public.dm_participants (
  dm_id uuid references public.direct_messages on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (dm_id, user_id)
);

-- Create messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  user_id uuid references public.profiles on delete cascade not null,
  channel_id uuid references public.channels on delete cascade,
  dm_id uuid references public.direct_messages on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (
    (channel_id is not null and dm_id is null) or
    (channel_id is null and dm_id is not null)
  )
);

-- Create reactions table
create table public.reactions (
  message_id uuid references public.messages on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  emoji text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (message_id, user_id, emoji)
);

-- Disable Row Level Security
alter table public.profiles disable row level security;
alter table public.workspaces disable row level security;
alter table public.workspace_members disable row level security;
alter table public.channels disable row level security;
alter table public.messages disable row level security;
alter table public.direct_messages disable row level security;
alter table public.dm_participants disable row level security;
alter table public.reactions disable row level security; 