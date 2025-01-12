-- Function to create a workspace and add the creator as a member
create or replace function create_workspace_with_member(
  workspace_name text,
  creator_id uuid
)
returns json
language plpgsql
security definer
as $$
declare
  new_workspace record;
begin
  -- Create the workspace
  insert into public.workspaces (name)
  values (workspace_name)
  returning * into new_workspace;

  -- Add the creator as a member
  insert into public.workspace_members (workspace_id, user_id)
  values (new_workspace.id, creator_id);

  return json_build_object(
    'id', new_workspace.id,
    'name', new_workspace.name,
    'created_at', new_workspace.created_at,
    'updated_at', new_workspace.updated_at
  );
end;
$$; 