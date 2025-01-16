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

-- Create DMs between Frank and other users (except Kate)
do $$
declare
  dm_id uuid;
  frank_id uuid;
  other_id uuid;
  other_email text;
begin
  -- Get Frank's ID
  select id into frank_id from auth.users where email = 'frankthomas@example.com';
  
  -- Create DMs with each user except Kate
  for other_id, other_email in 
    select id, email from auth.users 
    where email != 'katemartin@example.com' 
    and email != 'frankthomas@example.com'
  loop
    -- Create DM
    insert into public.direct_messages (workspace_id)
    values ('00000000-0000-0000-0000-000000000101')
    returning id into dm_id;
    
    -- Add participants
    insert into public.dm_participants (dm_id, user_id)
    values 
      (dm_id, frank_id),
      (dm_id, other_id);
    
    -- Insert messages based on who we're talking to
    case other_email
      when 'alicejohnson@example.com' then
        -- Natural conversation between Frank and Alice
        insert into public.messages (content, user_id, dm_id, created_at)
        values
          ('Hey Alice, I noticed some tension between the design and dev teams about the new component library 🤔', frank_id, dm_id, now() - interval '10 days'),
          ('Absolutely! I''ve been worried about this too! 😊', other_id, dm_id, now() - interval '10 days' + interval '2 minutes'),
          ('I think both teams have valid points about the implementation approach', frank_id, dm_id, now() - interval '10 days' + interval '4 minutes'),
          ('You''re right, we need to find common ground! 🌟', other_id, dm_id, now() - interval '10 days' + interval '6 minutes'),
          ('Maybe we could create a small working group with members from both teams?', frank_id, dm_id, now() - interval '10 days' + interval '8 minutes'),
          ('Love the idea of a working group! Let''s do it! 💪', other_id, dm_id, now() - interval '10 days' + interval '10 minutes'),
          ('We could document both perspectives and find common solutions 📝', frank_id, dm_id, now() - interval '10 days' + interval '12 minutes'),
          ('I''ll gather the design team for this, they''ll be excited! 🎨', other_id, dm_id, now() - interval '10 days' + interval '14 minutes'),
          ('Looking forward to seeing how we can merge both team''s strengths 🤝', frank_id, dm_id, now() - interval '10 days' + interval '16 minutes'),
          ('Can''t wait to see what we create together! 🚀', other_id, dm_id, now() - interval '10 days' + interval '18 minutes');

      when 'bobsmith@example.com' then
        -- Natural conversation between Frank and Bob
        insert into public.messages (content, user_id, dm_id, created_at)
        values
          ('Bob, I see the concerns about the new architecture proposal', frank_id, dm_id, now() - interval '8 days'),
          ('The performance metrics are concerning.', other_id, dm_id, now() - interval '8 days' + interval '2 minutes'),
          ('While performance is crucial, we also need to consider maintainability', frank_id, dm_id, now() - interval '8 days' + interval '4 minutes'),
          ('Maintainability often comes at a performance cost.', other_id, dm_id, now() - interval '8 days' + interval '6 minutes'),
          ('What if we tried a phased approach to implementation? 🤔', frank_id, dm_id, now() - interval '8 days' + interval '8 minutes'),
          ('A phased approach could work, if we set clear metrics.', other_id, dm_id, now() - interval '8 days' + interval '10 minutes'),
          ('That way we can validate performance at each step', frank_id, dm_id, now() - interval '8 days' + interval '12 minutes'),
          ('I''ll prepare detailed performance benchmarks for each phase.', other_id, dm_id, now() - interval '8 days' + interval '14 minutes'),
          ('Let''s make sure both performance and maintainability are prioritized 🎯', frank_id, dm_id, now() - interval '8 days' + interval '16 minutes'),
          ('Agreed. Let''s proceed with clear metrics in place.', other_id, dm_id, now() - interval '8 days' + interval '18 minutes');

      when 'carolwilliams@example.com' then
        -- Natural conversation between Frank and Carol
        insert into public.messages (content, user_id, dm_id, created_at)
        values
          ('Carol, I love how you''re mentoring the junior designers', frank_id, dm_id, now() - interval '6 days'),
          ('Thank you! I really want everyone to succeed.', other_id, dm_id, now() - interval '6 days' + interval '2 minutes'),
          ('I noticed some anxiety about the new tools rollout though', frank_id, dm_id, now() - interval '6 days' + interval '4 minutes'),
          ('You''re right about the anxiety, I''ve noticed it too.', other_id, dm_id, now() - interval '6 days' + interval '6 minutes'),
          ('Perhaps we could create a more gradual learning curve? 📚', frank_id, dm_id, now() - interval '6 days' + interval '8 minutes'),
          ('A gradual approach would be more supportive.', other_id, dm_id, now() - interval '6 days' + interval '10 minutes'),
          ('What if we combined your tutorials with hands-on practice sessions?', frank_id, dm_id, now() - interval '6 days' + interval '12 minutes'),
          ('Love the idea of hands-on practice!', other_id, dm_id, now() - interval '6 days' + interval '14 minutes'),
          ('Your mentorship is really valuable to the team', frank_id, dm_id, now() - interval '6 days' + interval '16 minutes'),
          ('Together we can build a strong learning culture.', other_id, dm_id, now() - interval '6 days' + interval '18 minutes');

      else
        -- For other users, create alternating generic but unique messages
        insert into public.messages (content, user_id, dm_id, created_at)
        select 
          case 
            when n % 2 = 1 then
              case ((n + 1) / 2 % 5)
                when 0 then 'Let''s find a balanced approach to this challenge'
                when 1 then 'I see valid points on both sides'
                when 2 then 'Maybe we can find a middle ground'
                when 3 then 'What if we tried a hybrid solution?'
                else 'I appreciate your perspective on this'
              end || ' (#' || ((n + 1) / 2) || ')'
            else
              case (n / 2 % 5)
                when 0 then 'That makes sense'
                when 1 then 'I can work with that'
                when 2 then 'Good suggestion'
                when 3 then 'Let''s try it'
                else 'Sounds like a plan'
              end || ' (#' || (n / 2) || ')'
          end as content,
          case when n % 2 = 1 then frank_id else other_id end as user_id,
          dm_id,
          now() - interval '4 days' + (interval '2 minutes' * n)
        from generate_series(1, 10) as n;
    end case;
  end loop;
end;
$$;

-- Insert channel messages with natural conversation patterns
do $$
declare
  design_workspace_id uuid := '00000000-0000-0000-0000-000000000101';
  eng_workspace_id uuid := '00000000-0000-0000-0000-000000000102';
  design_users uuid[];
  eng_users uuid[];
  user_id uuid;
  channel_id uuid;
begin
  -- Get design team users
  select array_agg(id) into design_users
  from auth.users
  where email in (
    'alicejohnson@example.com',
    'carolwilliams@example.com',
    'evadavis@example.com',
    'gracemiller@example.com',
    'isabeljones@example.com'
  );

  -- Get engineering team users
  select array_agg(id) into eng_users
  from auth.users
  where email in (
    'bobsmith@example.com',
    'davidbrown@example.com',
    'frankthomas@example.com',
    'henrywilson@example.com',
    'jackanderson@example.com'
  );

  -- Design Inspiration Channel
  for i in 1..15 loop
    insert into public.messages (content, user_id, channel_id, created_at)
    select
      case (i % 3)
        when 0 then 'Check out this amazing design trend I found! #inspiration'
        when 1 then 'That''s really innovative! How could we apply this?'
        else 'I love the minimalist approach here.'
      end,
      design_users[1 + (i % array_length(design_users, 1))],
      '00000000-0000-0000-0000-000000000201',
      now() - interval '5 days' + (interval '30 minutes' * i);
  end loop;

  -- UX Research Channel
  for i in 1..15 loop
    insert into public.messages (content, user_id, channel_id, created_at)
    select
      case (i % 3)
        when 0 then 'Latest user testing results show interesting patterns'
        when 1 then 'That aligns with our previous findings'
        else 'We should incorporate this into the next sprint'
      end,
      design_users[1 + (i % array_length(design_users, 1))],
      '00000000-0000-0000-0000-000000000202',
      now() - interval '4 days' + (interval '30 minutes' * i);
  end loop;

  -- Architecture Channel
  for i in 1..15 loop
    insert into public.messages (content, user_id, channel_id, created_at)
    select
      case (i % 3)
        when 0 then 'Proposed changes to the service layer'
        when 1 then 'Have we considered the scaling implications?'
        else 'The metrics support this approach'
      end,
      eng_users[1 + (i % array_length(eng_users, 1))],
      '00000000-0000-0000-0000-000000000204',
      now() - interval '3 days' + (interval '30 minutes' * i);
  end loop;

  -- Code Reviews Channel
  for i in 1..15 loop
    insert into public.messages (content, user_id, channel_id, created_at)
    select
      case (i % 3)
        when 0 then 'PR ready for review: Updated authentication flow'
        when 1 then 'Looks good, but we need more test coverage'
        else 'Changes implemented, ready for another review'
      end,
      eng_users[1 + (i % array_length(eng_users, 1))],
      '00000000-0000-0000-0000-000000000205',
      now() - interval '2 days' + (interval '30 minutes' * i);
  end loop;

  -- DevOps Channel
  for i in 1..15 loop
    insert into public.messages (content, user_id, channel_id, created_at)
    select
      case (i % 3)
        when 0 then 'Deployment metrics for the new release'
        when 1 then 'Performance looks stable, monitoring continues'
        else 'Identified potential optimization points'
      end,
      eng_users[1 + (i % array_length(eng_users, 1))],
      '00000000-0000-0000-0000-000000000206',
      now() - interval '1 day' + (interval '30 minutes' * i);
  end loop;
end;
$$;
