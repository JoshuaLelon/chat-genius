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
        insert into public.messages (content, user_id, dm_id, created_at)
        values
          ('Hey Alice, I noticed some tension between the design and dev teams about the new component library 🤔', frank_id, dm_id, now() - interval '10 days'),
          ('I think both teams have valid points about the implementation approach', frank_id, dm_id, now() - interval '9 days'),
          ('Maybe we could find a middle ground between maintainability and design flexibility?', frank_id, dm_id, now() - interval '8 days'),
          ('What if we created a small working group with members from both teams?', frank_id, dm_id, now() - interval '7 days'),
          ('We could document both perspectives and find common solutions 📝', frank_id, dm_id, now() - interval '6 days'),
          ('The hybrid approach you suggested could work well here', frank_id, dm_id, now() - interval '5 days'),
          ('Let''s schedule a collaborative session to hash out the details', frank_id, dm_id, now() - interval '4 days'),
          ('I appreciate your openness to finding a balanced solution', frank_id, dm_id, now() - interval '3 days'),
          ('This kind of collaboration is exactly what we need', frank_id, dm_id, now() - interval '2 days'),
          ('Looking forward to seeing how we can merge both team''s strengths 🤝', frank_id, dm_id, now() - interval '1 day');
        
        insert into public.messages (content, user_id, dm_id, created_at)
        values
          ('Absolutely! I''ve been worried about this too! 😊', other_id, dm_id, now() - interval '10 days' + interval '1 minute'),
          ('You''re right, we need to find common ground! 🌟', other_id, dm_id, now() - interval '9 days' + interval '1 minute'),
          ('Love the idea of a working group! Let''s do it! 💪', other_id, dm_id, now() - interval '8 days' + interval '1 minute'),
          ('I''ll gather the design team for this, they''ll be excited! 🎨', other_id, dm_id, now() - interval '7 days' + interval '1 minute'),
          ('Documentation is key! I''ll start a shared doc! 📝', other_id, dm_id, now() - interval '6 days' + interval '1 minute'),
          ('The hybrid approach could be really innovative! ✨', other_id, dm_id, now() - interval '5 days' + interval '1 minute'),
          ('I''ll set up the meeting for next week! 📅', other_id, dm_id, now() - interval '4 days' + interval '1 minute'),
          ('Your balanced perspective is so helpful! 🙌', other_id, dm_id, now() - interval '3 days' + interval '1 minute'),
          ('This is why cross-team collaboration is amazing! 🌈', other_id, dm_id, now() - interval '2 days' + interval '1 minute'),
          ('Can''t wait to see what we create together! 🚀', other_id, dm_id, now() - interval '1 day' + interval '1 minute');

      when 'bobsmith@example.com' then
        insert into public.messages (content, user_id, dm_id, created_at)
        values
          ('Bob, I see the concerns about the new architecture proposal', frank_id, dm_id, now() - interval '10 days'),
          ('While performance is crucial, we also need to consider maintainability', frank_id, dm_id, now() - interval '9 days'),
          ('What if we tried a phased approach to implementation? 🤔', frank_id, dm_id, now() - interval '8 days'),
          ('That way we can validate performance at each step', frank_id, dm_id, now() - interval '7 days'),
          ('I think we can find a balance between optimal performance and clean code', frank_id, dm_id, now() - interval '6 days'),
          ('Your benchmarks raise valid points about the bottlenecks', frank_id, dm_id, now() - interval '5 days'),
          ('Let''s explore some hybrid solutions that address both concerns', frank_id, dm_id, now() - interval '4 days'),
          ('Maybe we can optimize the critical paths while keeping the overall structure clean', frank_id, dm_id, now() - interval '3 days'),
          ('I appreciate your thorough analysis of the performance implications', frank_id, dm_id, now() - interval '2 days'),
          ('We''ll make sure both performance and maintainability are prioritized 🎯', frank_id, dm_id, now() - interval '1 day');
        
        insert into public.messages (content, user_id, dm_id, created_at)
        values
          ('The performance metrics are concerning.', other_id, dm_id, now() - interval '10 days' + interval '1 minute'),
          ('Maintainability often comes at a performance cost.', other_id, dm_id, now() - interval '9 days' + interval '1 minute'),
          ('A phased approach could work, if we set clear metrics.', other_id, dm_id, now() - interval '8 days' + interval '1 minute'),
          ('I''ll prepare detailed performance benchmarks for each phase.', other_id, dm_id, now() - interval '7 days' + interval '1 minute'),
          ('We need concrete numbers to make these decisions.', other_id, dm_id, now() - interval '6 days' + interval '1 minute'),
          ('I''ve identified three major bottlenecks.', other_id, dm_id, now() - interval '5 days' + interval '1 minute'),
          ('Let''s focus on optimizing these critical sections first.', other_id, dm_id, now() - interval '4 days' + interval '1 minute'),
          ('I''ll document the performance requirements.', other_id, dm_id, now() - interval '3 days' + interval '1 minute'),
          ('The data supports my concerns.', other_id, dm_id, now() - interval '2 days' + interval '1 minute'),
          ('Agreed. Let''s proceed with clear metrics in place.', other_id, dm_id, now() - interval '1 day' + interval '1 minute');

      when 'carolwilliams@example.com' then
        insert into public.messages (content, user_id, dm_id, created_at)
        values
          ('Carol, I love how you''re mentoring the junior designers', frank_id, dm_id, now() - interval '10 days'),
          ('I noticed some anxiety about the new tools rollout though', frank_id, dm_id, now() - interval '9 days'),
          ('Perhaps we could create a more gradual learning curve? 📚', frank_id, dm_id, now() - interval '8 days'),
          ('Your teaching approach is great, just thinking about pacing', frank_id, dm_id, now() - interval '7 days'),
          ('What if we combined your tutorials with hands-on practice sessions?', frank_id, dm_id, now() - interval '6 days'),
          ('That way everyone can learn at their own speed', frank_id, dm_id, now() - interval '5 days'),
          ('The documentation you''re creating is really helpful', frank_id, dm_id, now() - interval '4 days'),
          ('Maybe we can add some intermediate steps for complex concepts', frank_id, dm_id, now() - interval '3 days'),
          ('Your mentorship is really valuable to the team', frank_id, dm_id, now() - interval '2 days'),
          ('Let''s keep refining the learning process together 🌱', frank_id, dm_id, now() - interval '1 day');
        
        insert into public.messages (content, user_id, dm_id, created_at)
        values
          ('Thank you! I really want everyone to succeed.', other_id, dm_id, now() - interval '10 days' + interval '1 minute'),
          ('You''re right about the anxiety, I''ve noticed it too.', other_id, dm_id, now() - interval '9 days' + interval '1 minute'),
          ('A gradual approach would be more supportive.', other_id, dm_id, now() - interval '8 days' + interval '1 minute'),
          ('I can adjust my teaching style for different learners.', other_id, dm_id, now() - interval '7 days' + interval '1 minute'),
          ('Love the idea of hands-on practice!', other_id, dm_id, now() - interval '6 days' + interval '1 minute'),
          ('Self-paced learning is so important.', other_id, dm_id, now() - interval '5 days' + interval '1 minute'),
          ('I''ll keep improving the documentation.', other_id, dm_id, now() - interval '4 days' + interval '1 minute'),
          ('Breaking down concepts is a great suggestion.', other_id, dm_id, now() - interval '3 days' + interval '1 minute'),
          ('It''s rewarding to see everyone grow.', other_id, dm_id, now() - interval '2 days' + interval '1 minute'),
          ('Together we can build a strong learning culture.', other_id, dm_id, now() - interval '1 day' + interval '1 minute');

      else
        -- For other users, create generic but unique messages
        insert into public.messages (content, user_id, dm_id, created_at)
        select 
          case (n % 5)
            when 0 then 'Let''s find a balanced approach to this challenge'
            when 1 then 'I see valid points on both sides'
            when 2 then 'Maybe we can find a middle ground'
            when 3 then 'What if we tried a hybrid solution?'
            else 'I appreciate your perspective on this'
          end || ' (#' || n || ')',
          frank_id,
          dm_id,
          now() - interval '1 day' * (10 - n)
        from generate_series(1, 10) as n;
        
        insert into public.messages (content, user_id, dm_id, created_at)
        select 
          case (n % 5)
            when 0 then 'That makes sense'
            when 1 then 'I can work with that'
            when 2 then 'Good suggestion'
            when 3 then 'Let''s try it'
            else 'Sounds like a plan'
          end || ' (#' || n || ')',
          other_id,
          dm_id,
          now() - interval '1 day' * (10 - n) + interval '1 minute'
        from generate_series(1, 10) as n;
    end case;
  end loop;
end;
$$;
