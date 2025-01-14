-- Drop existing schema if it exists
drop schema if exists public cascade;
create schema public;

-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store message vectors
create table public.vectorized_messages (
  id bigserial primary key,
  content text not null,
  metadata jsonb,
  embedding vector(1536)
);

-- Grant permissions on vectorized_messages
grant all privileges on table public.vectorized_messages to service_role;
grant all privileges on table public.vectorized_messages to anon;
grant all privileges on table public.vectorized_messages to authenticated;
grant all privileges on sequence public.vectorized_messages_id_seq to service_role;
grant all privileges on sequence public.vectorized_messages_id_seq to anon;
grant all privileges on sequence public.vectorized_messages_id_seq to authenticated;

-- Create an index for faster similarity search
create index vectorized_messages_embedding_idx 
  on vectorized_messages 
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Function to search for similar messages
create or replace function match_documents(
  query_embedding vector(1536),
  match_count int DEFAULT 10,
  filter jsonb DEFAULT '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    vectorized_messages.id,
    vectorized_messages.content,
    vectorized_messages.metadata,
    1 - (vectorized_messages.embedding <=> query_embedding) as similarity
  from vectorized_messages
  where metadata @> filter
  order by vectorized_messages.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Enable RLS on vectorized_messages
alter table public.vectorized_messages enable row level security;

-- Add policy for vectorized_messages
create policy "Allow reading vectorized messages"
  on public.vectorized_messages for select
  using (true);

create policy "Allow inserting vectorized messages"
  on public.vectorized_messages for insert
  with check (auth.uid() is not null);

-- Grant permissions to service role and anon role
grant usage on schema public to service_role, anon, authenticated;
grant all privileges on schema public to service_role;
grant all privileges on schema public to anon;
grant all privileges on schema public to authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;
alter default privileges in schema public grant all on tables to anon;
alter default privileges in schema public grant all on sequences to anon;
alter default privileges in schema public grant all on functions to anon;
alter default privileges in schema public grant all on tables to authenticated;
alter default privileges in schema public grant all on sequences to authenticated;
alter default privileges in schema public grant all on functions to authenticated;

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

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;
alter table public.direct_messages enable row level security;
alter table public.dm_participants enable row level security;
alter table public.reactions enable row level security;


-- ===========================
-- 20240320000001_add_policies.sql
-- ===========================

-- Drop existing policies
drop policy if exists "Allow users to read all profiles" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can delete their own profile" on public.profiles;
drop policy if exists "Insert profile on signup" on public.profiles;
drop policy if exists "Allow workspace members to read workspaces" on public.workspaces;
drop policy if exists "Allow workspace creation" on public.workspaces;
drop policy if exists "Allow reading workspace members" on public.workspace_members;
drop policy if exists "Allow joining workspaces" on public.workspace_members;
drop policy if exists "Allow workspace members to read channels" on public.channels;
drop policy if exists "Allow workspace members to create channels" on public.channels;
drop policy if exists "Allow reading messages in channels user is member of" on public.messages;
drop policy if exists "Allow sending messages" on public.messages;
drop policy if exists "Allow reading DMs user is part of" on public.direct_messages;
drop policy if exists "Allow creating DMs" on public.direct_messages;
drop policy if exists "Allow reading DM participants" on public.dm_participants;
drop policy if exists "Allow adding DM participants" on public.dm_participants;
drop policy if exists "Allow reading reactions on visible messages" on public.reactions;
drop policy if exists "Allow adding reactions" on public.reactions;

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;
alter table public.direct_messages enable row level security;
alter table public.dm_participants enable row level security;
alter table public.reactions enable row level security;

-- Profiles policies
create policy "Allow anyone to read all profiles"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

create policy "Insert profile on signup"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Workspace policies
create policy "Allow workspace members to read workspaces"
  on public.workspaces for select
  using (true);

create policy "Allow workspace creation"
  on public.workspaces for insert
  with check (auth.uid() is not null);

-- Workspace members policies
create policy "Allow reading workspace members"
  on public.workspace_members for select
  using (true);

create policy "Allow joining workspaces"
  on public.workspace_members for insert
  with check (auth.uid() is not null);

-- Channels policies
create policy "Allow workspace members to read channels"
  on public.channels for select
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = channels.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Allow workspace members to create channels"
  on public.channels for insert
  with check (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

-- Messages policies
create policy "Allow reading messages in channels user is member of"
  on public.messages for select
  using (
    (channel_id is not null and exists (
      select 1 from public.workspace_members wm
      join public.channels c on c.workspace_id = wm.workspace_id
      where c.id = messages.channel_id
      and wm.user_id = auth.uid()
    ))
    or
    (dm_id is not null and exists (
      select 1 from public.dm_participants
      where dm_participants.dm_id = messages.dm_id
      and dm_participants.user_id = auth.uid()
    ))
  );

create policy "Allow sending messages"
  on public.messages for insert
  with check (auth.uid() = user_id);

-- Direct messages policies
create policy "Allow reading DMs user is part of"
  on public.direct_messages for select
  using (
    exists (
      select 1 from public.dm_participants
      where dm_participants.dm_id = direct_messages.id
      and dm_participants.user_id = auth.uid()
    )
  );

create policy "Allow creating DMs"
  on public.direct_messages for insert
  with check (auth.uid() is not null);

-- DM participants policies
create policy "Allow reading DM participants"
  on public.dm_participants for select
  using (true);

create policy "Allow adding DM participants"
  on public.dm_participants for insert
  with check (auth.uid() is not null);

-- Reactions policies
create policy "Allow reading reactions on visible messages"
  on public.reactions for select
  using (
    exists (
      select 1 from public.messages m
      left join public.channels c on c.id = m.channel_id
      left join public.workspace_members wm on wm.workspace_id = c.workspace_id
      left join public.dm_participants dp on dp.dm_id = m.dm_id
      where m.id = reactions.message_id
      and (wm.user_id = auth.uid() or dp.user_id = auth.uid())
    )
  );

create policy "Allow adding reactions"
  on public.reactions for insert
  with check (auth.uid() = user_id);


-- ===========================
-- 20240320000002_add_workspace_member_role.sql
-- ===========================

-- Add role column to workspace_members table
alter table public.workspace_members
add column role text check (role in ('admin', 'member')) default 'member' not null;