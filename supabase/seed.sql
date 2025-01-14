-- User Personalities:
-- Alice Johnson: The Enthusiastic Design Lead - Always excited about new trends, loves emojis, very collaborative
-- Bob Smith: The Pragmatic Engineer - Direct and solution-focused, prefers clear communication
-- Carol Williams: The Design Mentor - Supportive and encouraging, loves to teach others
-- David Brown: The Tech Skeptic - Questions everything, especially new trends, values proven solutions
-- Eva Davis: The Perfectionist - Detail-oriented, sometimes critical, high standards
-- Frank Thomas: The Peacemaker - Diplomatic and balanced, great at finding middle ground
-- Grace Miller: The Innovation Champion - Always pushing boundaries, enthusiastic about new tech
-- Henry Wilson: The Code Purist - Advocates for clean code, strong opinions about best practices
-- Isabel Jones: The Team Player - Collaborative and supportive, great at bringing people together
-- Jack Anderson: The Debug Master - Analytical problem solver, loves diving deep into issues
-- Kate Martin: The UX Advocate - User-focused, empathetic, champions accessibility
-- Liam Taylor: The Tech Optimist - Embraces new technologies, always sees possibilities
-- Mia Garcia: The Documentation Champion - Organized and thorough, values clear communication
-- Noah Lee: The Performance Guru - Optimization focused, loves benchmarking
-- Olivia White: The Security Expert - Privacy-focused, thorough code reviewer

-- Insert profiles (first 10 users in Design Workspace, last 10 in Engineering)
insert into public.profiles (id, email, avatar_url, status)
select 
  auth.users.id,
  auth.users.email,
  '/placeholder.svg?height=40&width=40',
  case 
    when random() < 0.33 then 'online'
    when random() < 0.66 then 'busy'
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

-- Insert workspaces
insert into public.workspaces (id, name)
values
  ('00000000-0000-0000-0000-000000000101', 'Design Workspace'),
  ('00000000-0000-0000-0000-000000000102', 'Engineering Workspace');

-- Insert workspace members (first 10 in Design, last 10 in Engineering, with overlap)
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

-- Insert channels
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

-- Create a function to generate UUID v4
create or replace function generate_uuid() returns uuid as $$
begin
  return gen_random_uuid();
end;
$$ language plpgsql;

-- Create message arrays for each personality
create temp table user_messages as
select 
  'alicejohnson@example.com' as email,
  array[
    'Just discovered an amazing new design pattern! 😍',
    'What do you all think about this color scheme? 🎨',
    'The latest Figma update is game-changing! 🚀',
    'Found some great inspiration on Dribbble today!',
    'Let''s brainstorm some new ideas! 💡',
    'This design system is coming together beautifully! ✨',
    'Anyone up for a design critique session? 🤔',
    'Check out this awesome typography combination! 👀',
    'Love how this animation turned out! 💫',
    'Time for some design exploration! 🎯'
  ] as messages
union all
select 
  'bobsmith@example.com',
  array[
    'Let''s focus on performance here',
    'This needs to be more scalable',
    'Good solution, but can we simplify it?',
    'Here''s a more efficient approach',
    'The metrics show improvement',
    'We should document this decision',
    'Let''s benchmark this first',
    'Clean and maintainable - I like it',
    'This follows best practices',
    'Have we considered edge cases?'
  ]
union all
select 
  'carolwilliams@example.com',
  array[
    'Great work everyone! Here''s some feedback...',
    'Let me show you a helpful technique',
    'You''re on the right track! Consider this...',
    'This is a great learning opportunity',
    'Here''s how we can improve this',
    'I love seeing your progress!',
    'Let''s explore this concept further',
    'You''ve really grown in this area',
    'Here''s a tip that might help',
    'Excellent attention to detail!'
  ];

-- Insert channel messages (at least 10 messages per user per channel they have access to)
insert into public.messages (id, content, user_id, channel_id, created_at)
select
  generate_uuid(),
  case 
    when um.messages is not null then
      um.messages[1 + floor(random() * array_length(um.messages, 1))::integer]
    else
      (array[
        'Great point!',
        'Interesting perspective',
        'Let''s explore this further',
        'I like where this is going',
        'Thanks for sharing',
        'Good discussion',
        'Makes sense to me',
        'Let''s iterate on this',
        'Solid approach',
        'Keep it going!'
      ])[1 + floor(random() * 10)]
  end,
  p.id,
  c.id,
  now() - (random() * interval '30 days')
from public.profiles p
cross join public.channels c
join public.workspace_members wm on wm.user_id = p.id and wm.workspace_id = c.workspace_id
left join user_messages um on um.email = p.email
cross join generate_series(1, 10) as msg_num;

-- Create DMs between users in the same workspace
with workspace_user_pairs as (
  select distinct
    wm1.user_id as user1_id,
    wm2.user_id as user2_id,
    wm1.workspace_id
  from public.workspace_members wm1
  join public.workspace_members wm2 
    on wm1.workspace_id = wm2.workspace_id 
    and wm1.user_id < wm2.user_id
)
insert into public.direct_messages (id, workspace_id)
select generate_uuid(), workspace_id
from workspace_user_pairs;

-- Insert DM participants
with dm_pairs as (
  select 
    d.id as dm_id,
    wup.user1_id,
    wup.user2_id
  from public.direct_messages d
  join (
    select distinct
      wm1.user_id as user1_id,
      wm2.user_id as user2_id,
      wm1.workspace_id,
      row_number() over (order by wm1.user_id, wm2.user_id) as rn
    from public.workspace_members wm1
    join public.workspace_members wm2 
      on wm1.workspace_id = wm2.workspace_id 
      and wm1.user_id < wm2.user_id
  ) wup on d.workspace_id = wup.workspace_id
)
insert into public.dm_participants (dm_id, user_id)
select dm_id, user1_id from dm_pairs
union
select dm_id, user2_id from dm_pairs;

-- Create DM message templates
create temp table dm_messages as
select 
  'alicejohnson@example.com' as email,
  array[
    'Love your design approach! 😍',
    'Can we collaborate on this? 🤝',
    'Your latest work is amazing! ✨',
    'Quick question about the mockup 🤔',
    'This interaction is so smooth! 💫',
    'Great attention to detail! 👀',
    'The typography choice is perfect! 🎯',
    'Let''s iterate on this design 🔄',
    'Your feedback was super helpful! 🙏',
    'Excited to work together! 🚀'
  ] as messages
union all
select 
  'bobsmith@example.com',
  array[
    'Here''s the implementation plan',
    'Found a performance issue',
    'Code review feedback',
    'Let''s optimize this function',
    'The metrics look good',
    'Can you review this PR?',
    'Updated the documentation',
    'Fixed the edge case',
    'Added error handling',
    'Improved the algorithm'
  ]
union all
select 
  'carolwilliams@example.com',
  array[
    'Here''s a helpful resource',
    'You''re making great progress!',
    'Let me know if you need help',
    'This approach looks promising',
    'Great job on the latest update',
    'Happy to provide feedback',
    'You''ve really improved here',
    'Let''s explore this together',
    'Excellent work!',
    'Keep up the great work!'
  ];

-- Insert DM messages (at least 10 messages between each pair)
insert into public.messages (id, content, user_id, dm_id, created_at)
select
  generate_uuid(),
  case 
    when dm.messages is not null then
      dm.messages[1 + floor(random() * array_length(dm.messages, 1))::integer]
    else
      (array[
        'Thanks for the update',
        'Good point',
        'Let''s discuss this more',
        'Makes sense to me',
        'I''ll take a look',
        'Appreciate the feedback',
        'Great collaboration',
        'Looking forward to it',
        'Thanks for your help',
        'Let''s sync up soon'
      ])[1 + floor(random() * 10)]
  end,
  p.id,
  d.id,
  now() - (random() * interval '30 days')
from public.dm_participants dp
join public.direct_messages d on d.id = dp.dm_id
join public.profiles p on p.id = dp.user_id
left join dm_messages dm on dm.email = p.email
cross join generate_series(1, 10) as msg_num;

-- Insert reactions (at least 5 reactions per user)
with message_sample as (
  select m.id, m.channel_id, m.dm_id
  from public.messages m
  order by random()
),
user_reactions as (
  select 
    m.id as message_id,
    p.id as user_id,
    row_number() over (partition by p.id order by random()) as rn
  from message_sample m
  join public.profiles p on true
  where 
    (m.channel_id is not null and exists (
      select 1 from public.workspace_members wm
      join public.channels c on c.workspace_id = wm.workspace_id
      where c.id = m.channel_id and wm.user_id = p.id
    ))
    or
    (m.dm_id is not null and exists (
      select 1 from public.dm_participants dp
      where dp.dm_id = m.dm_id and dp.user_id = p.id
    ))
)
insert into public.reactions (message_id, user_id, emoji)
select 
  message_id,
  user_id,
  case when random() < 0.2 then '👍'
       when random() < 0.4 then '❤️'
       when random() < 0.6 then '🎉'
       when random() < 0.8 then '🚀'
       else '💡'
  end as emoji
from user_reactions
where rn <= 5;

-- Drop temporary tables and functions
drop table if exists user_messages;
drop table if exists dm_messages;
drop function if exists generate_uuid();
