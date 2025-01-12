-- Add role column to workspace_members table
alter table public.workspace_members
add column role text check (role in ('admin', 'member')) default 'member' not null; 