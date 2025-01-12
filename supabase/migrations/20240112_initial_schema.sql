-- Create users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
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

-- Create direct_messages table (represents DM conversations)
create table public.direct_messages (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create direct_message_participants table (junction table for DM participants)
create table public.direct_message_participants (
  dm_id uuid references public.direct_messages on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (dm_id, user_id)
);

-- Create messages table (for both channel and direct messages)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  user_id uuid references public.profiles on delete cascade not null,
  channel_id uuid references public.channels on delete cascade,
  dm_id uuid references public.direct_messages on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (
    (channel_id is null and dm_id is not null) or
    (channel_id is not null and dm_id is null)
  )
);

-- Create reactions table
create table public.reactions (
  id uuid default gen_random_uuid() primary key,
  message_id uuid references public.messages on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  emoji text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (message_id, user_id, emoji)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;
alter table public.direct_messages enable row level security;
alter table public.direct_message_participants enable row level security;
alter table public.reactions enable row level security;

-- Create RLS policies

-- Profiles: viewable by workspace members, updatable by self
create policy "Profiles are viewable by workspace members"
  on public.profiles for select
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.user_id = auth.uid()
      and exists (
        select 1 from public.workspace_members as wm
        where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = profiles.id
      )
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Workspaces: viewable and updatable by members
create policy "Workspaces are viewable by members"
  on public.workspaces for select
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = workspaces.id
      and workspace_members.user_id = auth.uid()
    )
  );

-- Workspace members: viewable by workspace members
create policy "Workspace members are viewable by workspace members"
  on public.workspace_members for select
  using (
    exists (
      select 1 from public.workspace_members as wm
      where wm.workspace_id = workspace_members.workspace_id
      and wm.user_id = auth.uid()
    )
  );

-- Channels: viewable by workspace members
create policy "Channels are viewable by workspace members"
  on public.channels for select
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = channels.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

-- Messages: viewable by conversation participants
create policy "Channel messages are viewable by workspace members"
  on public.messages for select
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = (
        select workspace_id from public.channels
        where channels.id = messages.channel_id
      )
      and workspace_members.user_id = auth.uid()
    )
    or
    exists (
      select 1 from public.direct_message_participants
      where direct_message_participants.dm_id = messages.dm_id
      and direct_message_participants.user_id = auth.uid()
    )
  );

create policy "Users can create messages"
  on public.messages for insert
  with check (auth.uid() = user_id);

create policy "Users can update own messages"
  on public.messages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Direct Messages: viewable by participants
create policy "Direct messages are viewable by participants"
  on public.direct_messages for select
  using (
    exists (
      select 1 from public.direct_message_participants
      where direct_message_participants.dm_id = direct_messages.id
      and direct_message_participants.user_id = auth.uid()
    )
  );

-- Direct Message Participants: viewable by participants
create policy "DM participants are viewable by participants"
  on public.direct_message_participants for select
  using (
    exists (
      select 1 from public.direct_message_participants as dmp
      where dmp.dm_id = direct_message_participants.dm_id
      and dmp.user_id = auth.uid()
    )
  );

-- Reactions: viewable by conversation participants
create policy "Reactions are viewable by conversation participants"
  on public.reactions for select
  using (
    exists (
      select 1 from public.messages
      where messages.id = reactions.message_id
      and (
        exists (
          select 1 from public.workspace_members
          where workspace_members.workspace_id = (
            select workspace_id from public.channels
            where channels.id = messages.channel_id
          )
          and workspace_members.user_id = auth.uid()
        )
        or
        exists (
          select 1 from public.direct_message_participants
          where direct_message_participants.dm_id = messages.dm_id
          and direct_message_participants.user_id = auth.uid()
        )
      )
    )
  );

create policy "Users can create reactions"
  on public.reactions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own reactions"
  on public.reactions for delete
  using (auth.uid() = user_id);

-- Create functions for real-time features

-- Function to update user status
create or replace function public.update_user_status(user_id uuid, new_status text)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set status = new_status,
      updated_at = now()
  where id = user_id
  and id = auth.uid(); -- Ensure user can only update their own status
end;
$$; 