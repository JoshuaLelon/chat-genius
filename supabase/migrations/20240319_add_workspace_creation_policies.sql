-- Add policies for workspace creation and member management
create policy "Users can create workspaces"
  on public.workspaces for insert
  with check (true);  -- Anyone can create a workspace

create policy "Workspace creators become members"
  on public.workspace_members for insert
  with check (
    -- Can only add yourself as a member when creating a workspace
    auth.uid() = user_id
  );

create policy "Workspace members can add other members"
  on public.workspace_members for insert
  with check (
    -- Can add others if you're already a member
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = workspace_id
      and workspace_members.user_id = auth.uid()
    )
  ); 