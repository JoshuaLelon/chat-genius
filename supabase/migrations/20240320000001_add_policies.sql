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
  using (exists (
    select 1 from public.workspace_members
    where workspace_members.workspace_id = channels.workspace_id
    and workspace_members.user_id = auth.uid()
  ));

create policy "Allow workspace members to create channels"
  on public.channels for insert
  with check (exists (
    select 1 from public.workspace_members
    where workspace_members.workspace_id = workspace_id
    and workspace_members.user_id = auth.uid()
  ));

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
  using (exists (
    select 1 from public.dm_participants
    where dm_participants.dm_id = direct_messages.id
    and dm_participants.user_id = auth.uid()
  ));

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
  using (exists (
    select 1 from public.messages m
    left join public.channels c on c.id = m.channel_id
    left join public.workspace_members wm on wm.workspace_id = c.workspace_id
    left join public.dm_participants dp on dp.dm_id = m.dm_id
    where m.id = reactions.message_id
    and (wm.user_id = auth.uid() or dp.user_id = auth.uid())
  ));

create policy "Allow adding reactions"
  on public.reactions for insert
  with check (auth.uid() = user_id); 