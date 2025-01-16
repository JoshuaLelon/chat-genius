-- Create temporary table for DM messages
create temp table dm_messages (
  sender_email text,
  receiver_email text,
  messages text[]
);

-- Insert message arrays for Frank's DMs with each user (except Kate)
insert into dm_messages (sender_email, receiver_email, messages) values
  ('frankthomas@example.com', 'alicejohnson@example.com', array[
    'Hey Alice, I noticed some tension between the design and dev teams about the new component library 🤔',
    'I think both teams have valid points about the implementation approach',
    'Maybe we could find a middle ground between maintainability and design flexibility?',
    'What if we created a small working group with members from both teams?',
    'We could document both perspectives and find common solutions 📝',
    'The hybrid approach you suggested could work well here',
    'Let''s schedule a collaborative session to hash out the details',
    'I appreciate your openness to finding a balanced solution',
    'This kind of collaboration is exactly what we need',
    'Looking forward to seeing how we can merge both team''s strengths 🤝'
  ]),
  ('frankthomas@example.com', 'bobsmith@example.com', array[
    'Bob, I see the concerns about the new architecture proposal',
    'While performance is crucial, we also need to consider maintainability',
    'What if we tried a phased approach to implementation? 🤔',
    'That way we can validate performance at each step',
    'I think we can find a balance between optimal performance and clean code',
    'Your benchmarks raise valid points about the bottlenecks',
    'Let''s explore some hybrid solutions that address both concerns',
    'Maybe we can optimize the critical paths while keeping the overall structure clean',
    'I appreciate your thorough analysis of the performance implications',
    'We''ll make sure both performance and maintainability are prioritized 🎯'
  ]),
  ('frankthomas@example.com', 'carolwilliams@example.com', array[
    'Carol, I love how you''re mentoring the junior designers',
    'I noticed some anxiety about the new tools rollout though',
    'Perhaps we could create a more gradual learning curve? 📚',
    'Your teaching approach is great, just thinking about pacing',
    'What if we combined your tutorials with hands-on practice sessions?',
    'That way everyone can learn at their own speed',
    'The documentation you''re creating is really helpful',
    'Maybe we can add some intermediate steps for complex concepts',
    'Your mentorship is really valuable to the team',
    'Let''s keep refining the learning process together 🌱'
  ]),
  ('frankthomas@example.com', 'davidbrown@example.com', array[
    'David, I understand your skepticism about the new framework',
    'You raise valid points about potential maintenance issues',
    'What if we did a small pilot project first? 🔍',
    'That way we can evaluate real-world implications',
    'Your experience with similar transitions is valuable here',
    'We should definitely consider the long-term support aspects',
    'Maybe we can identify specific areas where it makes sense to start',
    'A gradual transition might address some of your concerns',
    'I appreciate your pragmatic approach to this',
    'Let''s keep analyzing and find the most sustainable path forward ⚖️'
  ]),
  ('frankthomas@example.com', 'evadavis@example.com', array[
    'Eva, I see both sides of the design system debate',
    'Your attention to detail is crucial for quality',
    'Could we find a way to maintain standards while meeting deadlines? ⚡',
    'Maybe we can prioritize certain components for deep refinement',
    'I value your commitment to excellence',
    'What if we created a tiered review process?',
    'That way critical components get full scrutiny',
    'While allowing faster iteration on less crucial elements',
    'Your high standards really elevate our work',
    'Let''s find a way to balance quality and speed 🎯'
  ]),
  ('frankthomas@example.com', 'gracemiller@example.com', array[
    'Grace, your enthusiasm for AI integration is contagious! 🚀',
    'I see some team members are hesitant though',
    'Maybe we can showcase some concrete benefits?',
    'Your innovative ideas are valuable, just need the right approach',
    'What if we started with a small proof of concept?',
    'That could help address some of the concerns',
    'I love how you''re pushing us forward technically',
    'Let''s make sure everyone feels comfortable with the pace',
    'Your vision for the future is inspiring',
    'We''ll find the right balance of innovation and stability 🌟'
  ]),
  ('frankthomas@example.com', 'henrywilson@example.com', array[
    'Henry, I understand your passion for code quality',
    'The strict standards definitely help maintain consistency',
    'Could we add some flexibility for special cases? 🤔',
    'Your guidelines have really improved our codebase',
    'Maybe we can create different levels of requirements?',
    'That way we maintain quality while allowing some adaptability',
    'I really value your expertise in this area',
    'Let''s find a way to keep high standards while being pragmatic',
    'Your attention to code quality is invaluable',
    'We''ll keep refining our approach together 🛠️'
  ]),
  ('frankthomas@example.com', 'isabeljones@example.com', array[
    'Isabel, your team-building initiatives are really positive',
    'I notice some people are still hesitant to participate',
    'What if we tried some smaller group activities first? 👥',
    'Your inclusive approach is exactly what we need',
    'Maybe we can gather anonymous feedback?',
    'That way we can address any concerns directly',
    'I really appreciate your efforts to bring people together',
    'Let''s keep working on building those connections',
    'Your focus on collaboration is transformative',
    'We''ll keep fostering that team spirit 🤝'
  ]),
  ('frankthomas@example.com', 'jackanderson@example.com', array[
    'Jack, your debugging skills are impressive',
    'I see some team members hesitate to ask for help though',
    'Could we make the process more approachable? 🔍',
    'Your technical expertise is so valuable',
    'Maybe we could document some of your debugging strategies?',
    'That way others can learn from your approach',
    'I appreciate how thorough you are',
    'Let''s find ways to share that knowledge more widely',
    'Your problem-solving abilities are fantastic',
    'We''ll work on making it more accessible to everyone 📚'
  ]),
  ('frankthomas@example.com', 'liamtaylor@example.com', array[
    'Liam, your optimism about new tech is refreshing',
    'I see some concerns about implementation timelines though',
    'Could we create a more detailed adoption roadmap? 🗺️',
    'Your vision for possibilities is valuable',
    'Maybe we can break it down into smaller phases?',
    'That way we can celebrate quick wins',
    'I love your forward-thinking approach',
    'Let''s make sure everyone can keep up with the changes',
    'Your enthusiasm drives innovation',
    'We''ll find the right pace for everyone 🚀'
  ]),
  ('frankthomas@example.com', 'miagarcia@example.com', array[
    'Mia, your documentation work is fantastic',
    'I notice some teams still aren''t referencing it though',
    'Could we make it more discoverable? 📚',
    'Your organization really helps maintain order',
    'Maybe we could add some quick-start guides?',
    'That way it''s easier for people to jump in',
    'I really value your attention to detail',
    'Let''s keep making it more user-friendly',
    'Your documentation is crucial for our growth',
    'We''ll keep improving accessibility together 📖'
  ]),
  ('frankthomas@example.com', 'noahlee@example.com', array[
    'Noah, your performance optimization work is crucial',
    'I see some concerns about development speed though',
    'Could we find a balance with rapid prototyping? ⚡',
    'Your focus on efficiency is valuable',
    'Maybe we can identify critical vs non-critical paths?',
    'That way we optimize where it matters most',
    'I appreciate your dedication to performance',
    'Let''s make it work for all development stages',
    'Your expertise really elevates our product',
    'We''ll find the sweet spot together 🎯'
  ]),
  ('frankthomas@example.com', 'oliviawhite@example.com', array[
    'Olivia, your security focus is so important',
    'I see some friction with feature development pace',
    'Could we streamline the security review process? 🔒',
    'Your thoroughness keeps us safe',
    'Maybe we can create security templates?',
    'That way teams can build security in from the start',
    'I really value your protective mindset',
    'Let''s make security more accessible to everyone',
    'Your expertise is crucial for our success',
    'We''ll keep balancing security and speed 🛡️'
  ]);

-- Create DMs and insert messages
do $$
declare
  dm_id uuid;
  sender_id uuid;
  receiver_id uuid;
begin
  -- For each DM conversation
  for sender_email, receiver_email in 
    select distinct dm_messages.sender_email, dm_messages.receiver_email 
    from dm_messages
  loop
    -- Get user IDs
    select id into sender_id from auth.users where email = sender_email;
    select id into receiver_id from auth.users where email = receiver_email;
    
    -- Create DM
    insert into public.direct_messages (workspace_id)
    values ('00000000-0000-0000-0000-000000000101')
    returning id into dm_id;
    
    -- Add participants
    insert into public.dm_participants (dm_id, user_id)
    values 
      (dm_id, sender_id),
      (dm_id, receiver_id);
    
    -- Insert messages from Frank
    insert into public.messages (content, user_id, dm_id, created_at)
    select 
      unnest(messages),
      sender_id,
      dm_id,
      now() - interval '1 day' * (array_length(messages, 1) - generate_subscripts(messages, 1))
    from dm_messages 
    where dm_messages.sender_email = sender_email 
    and dm_messages.receiver_email = receiver_email;
    
    -- Insert responses (alternating messages)
    insert into public.messages (content, user_id, dm_id, created_at)
    select 
      'Thanks for your perspective! ' || 
      case (random() * 5)::int
        when 0 then 'That makes a lot of sense.'
        when 1 then 'I appreciate your balanced approach.'
        when 2 then 'You raise some good points.'
        when 3 then 'Let''s definitely explore that.'
        else 'I like how you think about this.'
      end,
      receiver_id,
      dm_id,
      now() - interval '1 day' * (array_length(messages, 1) - generate_subscripts(messages, 1)) + interval '1 minute'
    from dm_messages 
    where dm_messages.sender_email = sender_email 
    and dm_messages.receiver_email = receiver_email;
  end loop;
end;
$$; 