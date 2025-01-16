-- User Personalities:
-- Design Team:
-- Alice Johnson: The Enthusiastic Design Lead - Always excited about new trends, loves emojis, very collaborative
-- Carol Williams: The Design Mentor - Supportive and encouraging, loves to teach others
-- Eva Davis: The Perfectionist - Detail-oriented, sometimes critical, high standards
-- Grace Miller: The Innovation Champion - Always pushing boundaries, enthusiastic about new tech
-- Isabel Jones: The Team Player - Collaborative and supportive, great at bringing people together
-- Kate Martin: The UX Advocate - User-focused, empathetic, champions accessibility
-- Mia Garcia: The Documentation Champion - Organized and thorough, values clear communication
-- Olivia White: The Security Expert - Privacy-focused, thorough code reviewer

-- Engineering Team:
-- Bob Smith: The Pragmatic Engineer - Direct and solution-focused, prefers clear communication
-- David Brown: The Tech Skeptic - Questions everything, especially new trends, values proven solutions
-- Frank Thomas: The Peacemaker - Diplomatic and balanced, great at finding middle ground
-- Henry Wilson: The Code Purist - Advocates for clean code, strong opinions about best practices
-- Jack Anderson: The Debug Master - Analytical problem solver, loves diving deep into issues
-- Liam Taylor: The Tech Optimist - Embraces new technologies, always sees possibilities
-- Noah Lee: The Performance Guru - Optimization focused, loves benchmarking

-- Insert profiles with deterministic status based on email
insert into public.profiles (id, email, avatar_url, status)
select 
  auth.users.id,
  auth.users.email,
  '/placeholder.svg?height=40&width=40',
  case 
    when email in ('alicejohnson@example.com', 'bobsmith@example.com', 'gracemiller@example.com') then 'online'
    when email in ('carolwilliams@example.com', 'evadavis@example.com', 'henrywilson@example.com', 'jackanderson@example.com') then 'busy'
    else 'offline'
  end as status
from auth.users
where auth.users.email in (
  'alicejohnson@example.com',
  'bobsmith@example.com',
  'carolwilliams@example.com',
  'davidbrown@example.com',
  'evadavis@example.com',
  'frankthomas@example.com',
  'gracemiller@example.com',
  'henrywilson@example.com',
  'isabeljones@example.com',
  'jackanderson@example.com',
  'katemartin@example.com',
  'liamtaylor@example.com',
  'miagarcia@example.com',
  'noahlee@example.com',
  'oliviawhite@example.com'
);

-- Insert workspaces with fixed UUIDs
insert into public.workspaces (id, name)
values
  ('00000000-0000-0000-0000-000000000101', 'Design Workspace'),
  ('00000000-0000-0000-0000-000000000102', 'Engineering Workspace');

-- Insert workspace members with deterministic roles
with ordered_users as (
  select id, email, row_number() over (order by email) as rn
  from public.profiles
)
insert into public.workspace_members (workspace_id, user_id, role)
select 
  workspace_id,
  id as user_id,
  case 
    when email in ('alicejohnson@example.com', 'bobsmith@example.com', 'gracemiller@example.com') then 'admin'
    else 'member'
  end as role
from ordered_users
cross join (
  select '00000000-0000-0000-0000-000000000101'::uuid as workspace_id
  union all
  select '00000000-0000-0000-0000-000000000102'::uuid
) w
where 
  (w.workspace_id = '00000000-0000-0000-0000-000000000101' and rn <= 10) or
  (w.workspace_id = '00000000-0000-0000-0000-000000000102' and rn >= 6);

-- Insert channels with fixed UUIDs
insert into public.channels (id, workspace_id, name)
values
  -- Design Workspace Channels
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'design-inspiration'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'ux-research'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000101', 'design-reviews'),
  -- Engineering Workspace Channels
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000102', 'architecture'),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000102', 'code-reviews'),
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000102', 'devops');
