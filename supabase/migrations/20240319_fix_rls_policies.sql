-- Drop all existing policies
drop policy if exists "Anyone can create workspaces" on public.workspaces;
drop policy if exists "Workspaces are viewable by members" on public.workspaces;
drop policy if exists "Members can update workspaces" on public.workspaces;
drop policy if exists "Members can delete workspaces" on public.workspaces;
drop policy if exists "Anyone can add workspace members" on public.workspace_members;
drop policy if exists "Members can view other workspace members" on public.workspace_members;
drop policy if exists "Members can remove workspace members" on public.workspace_members;
drop policy if exists "Workspace members are viewable by workspace members" on public.workspace_members;

-- Create new workspace policies
create policy "Anyone can create workspaces"
  on public.workspaces for insert
  with check (true);

create policy "Workspaces are viewable by members"
  on public.workspaces for select
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Members can update workspaces"
  on public.workspaces for update
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = id
      and workspace_members.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Members can delete workspaces"
  on public.workspaces for delete
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = id
      and workspace_members.user_id = auth.uid()
    )
  );

-- Create new workspace members policies
create policy "Anyone can add workspace members"
  on public.workspace_members for insert
  with check (true);

create policy "Members can view other workspace members"
  on public.workspace_members for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  );

create policy "Members can remove workspace members"
  on public.workspace_members for delete
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where user_id = auth.uid()
    )
  ); 