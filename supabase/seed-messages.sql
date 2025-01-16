-- Create temporary table for user messages
create temp table user_messages (
  email text,
  messages text[]
);

-- Insert message arrays for each user
insert into user_messages (email, messages) values
  ('alicejohnson@example.com', array[
    -- First 5 messages about Material Design 3.0
    'Just explored Material Design 3.0''s dynamic color system - it''s revolutionary! 🎨',
    'The new Material You theming engine is going to transform our design system! ✨',
    'Love how Material 3.0 handles dark mode transitions seamlessly 🌙',
    'Material''s new elevation system creates such beautiful depth in our UI 🎯',
    'The adaptive layouts in Material 3.0 are perfect for our responsive design needs 📱',
    -- Rest of Design Trends and Inspiration
    'Just discovered an amazing new design pattern! 😍',
    'Check out this incredible minimalist trend! ✨',
    'Loving the new glassmorphism style! 🌟',
    'These micro-interactions are game-changing! 💫',
    'Found some incredible inspiration on Dribbble! 🎨'
  ]),
  ('bobsmith@example.com', array[
    -- First 5 messages about Clean Architecture
    'Clean Architecture principles show us exactly how to structure this service layer 🏗️',
    'Following Uncle Bob''s dependency rule will make this codebase maintainable 🎯',
    'The Clean Architecture approach to error handling is exactly what we need here ⚠️',
    'Let''s implement proper boundary interfaces as defined in Clean Architecture 🔄',
    'Clean Architecture''s entity separation will protect our business logic 🛡️',
    -- Rest of Performance and Optimization
    'Let''s focus on performance here',
    'The metrics show a 30% improvement',
    'Response time needs optimization',
    'Memory usage is too high',
    'CPU utilization is spiking'
  ]),
  ('carolwilliams@example.com', array[
    -- First 5 messages about Design System Education
    'Created a comprehensive onboarding guide for our design system - perfect for new team members! 📚',
    'Let''s walk through our component hierarchy together - it''s a great learning opportunity 🎯',
    'I''ve prepared visual examples of our design principles in action 🎨',
    'Here''s a step-by-step tutorial on using our design tokens effectively ✨',
    'Created interactive exercises to practice our design system implementation 💡',
    -- Rest of Teaching and Guidance
    'Let me show you a helpful technique',
    'Here''s a design principle to consider',
    'This is a great learning opportunity',
    'Let me walk you through this process',
    'Here''s how we can approach this'
  ]),
  ('davidbrown@example.com', array[
    -- First 5 messages about Technical Debt
    'This new framework will just add to our technical debt - let''s analyze the maintenance cost 📊',
    'We need concrete metrics before adopting this pattern - show me the benchmarks 📈',
    'Our current solution has proven reliable for 5 years - why change it? 🤔',
    'Let''s see the failure rates of this new approach in production environments ⚠️',
    'The existing system handles this perfectly - new tech isn''t always better 🎯',
    -- Rest of Risk Assessment
    'Have we tested this thoroughly?',
    'What''s the evidence this approach works?',
    'How do we know this is reliable?',
    'What are the failure scenarios?',
    'Has this been battle-tested?'
  ]),
  ('evadavis@example.com', array[
    -- First 5 messages about Typography Precision
    'The line height in our headers is off by 0.125rem - this needs immediate attention 📏',
    'Our font weight distribution isn''t following the perfect modular scale 🔍',
    'The kerning pairs in our brand font need precise adjustments - I''ve documented all 164 pairs 📐',
    'Our text blocks aren''t adhering to the perfect 4px baseline grid 📊',
    'The heading hierarchy ratios are off by 0.054 from the ideal typographic scale 🎯',
    -- Rest of Detail-Oriented Feedback
    'This pixel alignment needs adjustment',
    'The spacing isn''t quite consistent',
    'The margins are off by 2px',
    'These elements aren''t perfectly aligned',
    'The padding needs to be uniform'
  ]),
  ('frankthomas@example.com', array[
    -- First 5 messages about Cross-Team Collaboration
    'Both the frontend and backend teams make valid points about API design - let''s find common ground 🤝',
    'We can balance the designers'' vision with our technical constraints - here''s a proposal 🎯',
    'Let''s bridge the gap between UX requirements and performance needs 🌉',
    'I see merit in both testing approaches - we can create a hybrid solution ⚖️',
    'We can satisfy both security and usability concerns with this compromise 🤝',
    -- Rest of Finding Common Ground
    'Both approaches have merit',
    'Let''s find a middle ground',
    'We can balance these requirements',
    'How about a compromise?',
    'I see valid points on both sides'
  ]),
  ('gracemiller@example.com', array[
    -- First 5 messages about AI Integration
    'Just integrated GPT-4 into our design workflow - the possibilities are endless! 🤖',
    'Our new AI-powered design validation tool is revolutionary! 🚀',
    'Implementing AI-assisted accessibility checking - this changes everything! ♿',
    'The AI design suggestions feature is already improving our productivity 💫',
    'Our machine learning color palette generator is groundbreaking! 🎨',
    -- Rest of Innovation and New Ideas
    'Just discovered a game-changing approach! 🚀',
    'This innovative solution could transform our workflow',
    'Here''s a revolutionary way to tackle this',
    'Check out this cutting-edge technology! 💫',
    'We could pioneer something amazing here'
  ]),
  ('henrywilson@example.com', array[
    -- First 5 messages about Code Quality Standards
    'Our function complexity metrics must follow Cognitive Complexity standards precisely 📊',
    'Every module needs to maintain a Maintainability Index above 85 - no exceptions 📈',
    'Let''s enforce strict cyclomatic complexity limits - maximum of 10 per function 🎯',
    'All code must pass SonarQube with zero new technical debt 🔍',
    'Implementing mandatory SOLID principle validation in our CI pipeline ⚙️',
    -- Rest of Code Standards
    'This needs to follow our coding standards',
    'Let''s maintain consistent naming conventions',
    'We should document this properly',
    'This violates our style guide',
    'Let''s follow established patterns'
  ]),
  ('isabeljones@example.com', array[
    -- First 5 messages about Team Building
    'Organized a cross-functional pair programming session - amazing collaboration everyone! 👥',
    'Our team-building hackathon was a huge success - great work together! 🚀',
    'Love seeing backend and frontend teams collaborating on the API design 🤝',
    'The mentorship program is bringing our teams closer together! 💫',
    'Our daily stand-ups are becoming such a positive space for collaboration! ⭐',
    -- Rest of Supportive Collaboration
    'How can I help with this task? 🤝',
    'I''m here to support the team! 💪',
    'Let me know what you need assistance with',
    'Happy to help however I can! ✨',
    'Count me in for support'
  ]),
  ('jackanderson@example.com', array[
    -- First 5 messages about Memory Leak Investigation
    'Found the root cause of our memory leak - circular references in the event handlers 🔍',
    'Memory profiling shows a 15% heap growth every hour - investigating the garbage collection 📊',
    'Tracked down the memory leak to unbounded caching in our middleware 🕵️',
    'The WeakMap implementation was causing subtle memory retention - fixed! 🎯',
    'Memory snapshots reveal zombie event listeners in our cleanup logic ⚠️',
    -- Rest of Problem Investigation
    'Investigating the root cause now',
    'This error pattern is interesting 🔍',
    'Let me analyze the stack trace',
    'Reproducing the issue consistently',
    'The bug appears under specific conditions'
  ]),
  ('katemartin@example.com', array[
    -- First 5 messages about Accessibility Standards
    'Our color contrast ratios need to meet WCAG 2.1 AAA standards - I''ve audited all UI components ♿',
    'Adding ARIA labels to improve screen reader navigation - user testing confirmed the impact 🎯',
    'Implementing keyboard navigation patterns based on user feedback 🔍',
    'Our focus indicators need to be more visible - updating styles based on user research 👀',
    'Adding skip links to improve navigation for assistive technology users ⚡',
    -- Rest of User Research
    'User testing revealed some friction points 🔍',
    'Our research shows users struggle here',
    'The user feedback is quite clear on this',
    'Here''s what we learned from usability tests',
    'Users consistently report this issue'
  ]),
  ('liamtaylor@example.com', array[
    -- First 5 messages about Performance Optimization
    'Reduced our main bundle size by 45% using dynamic imports - deployment ready! 🚀',
    'Implemented service worker caching - page load time down to 1.2 seconds! ⚡',
    'Memory usage optimized by 60% after implementing object pooling 💾',
    'New tree-shaking configuration reduced our JavaScript footprint by 30% 📊',
    'Achieved 98/100 on Lighthouse performance after implementing lazy loading 🎯',
    -- Rest of Performance Analysis
    'Found a critical performance bottleneck 📊',
    'Response time increased by 200% 📈',
    'Memory usage is spiking here 📉',
    'CPU utilization at 95% 🔥',
    'Network latency is concerning ⚡'
  ]),
  ('miagarcia@example.com', array[
    -- First 5 messages about Documentation Structure
    'Implemented new documentation architecture with auto-generated API references 📚',
    'Created interactive documentation with live code examples - check it out! 💻',
    'Our new documentation search system indexes code samples and comments 🔍',
    'Added versioned documentation for better backward compatibility 📝',
    'Implemented automated documentation testing to catch broken links and examples ✅',
    -- Rest of Documentation Updates
    'Just updated the API documentation 📚',
    'Documentation refresh complete! ✨',
    'Added new code examples to docs 💻',
    'Updated the getting started guide 🚀',
    'Fresh documentation is live! 📖'
  ]),
  ('noahlee@example.com', array[
    -- First 5 messages about Performance Security
    'Identified critical performance bottleneck in our authentication system - fixing now 🚨',
    'Load testing revealed potential DoS vulnerability under high concurrency ⚠️',
    'Optimizing our rate limiting implementation for better attack prevention 🛡️',
    'Memory profiling shows potential resource exhaustion attack vector 🔍',
    'Implementing performance-based security measures in our API gateway 🔒',
    -- Rest of Security Analysis
    'Found a potential security vulnerability 🚨',
    'Security audit revealed concerns 🔍',
    'This needs immediate security review ⚠️',
    'Detected suspicious activity pattern 🕵️',
    'Security scan shows weaknesses 🔬'
  ]),
  ('oliviawhite@example.com', array[
    -- First 5 messages about Zero Trust Security
    'Implementing Zero Trust architecture - every request must be authenticated 🔒',
    'Adding continuous authentication checks at each service boundary 🛡️',
    'Implementing least-privilege access controls across all microservices ⚠️',
    'Setting up real-time security monitoring for all service-to-service communication 🔍',
    'Deploying Zero Trust network policies in our Kubernetes clusters 🚨',
    -- Rest of Security Analysis
    'High-risk vulnerability detected 🚨',
    'Critical security exposure here ⚠️',
    'This needs threat modeling 🎯',
    'Risk level: Critical 🔴',
    'Security impact assessment needed 📊'
  ]);

-- Insert messages from the temporary table
insert into public.messages (content, user_id, channel_id)
select 
  unnest(um.messages) as content,
  p.id as user_id,
  case 
    when p.email = 'alicejohnson@example.com' then '00000000-0000-0000-0000-000000000201'::uuid
    when p.email = 'bobsmith@example.com' then '00000000-0000-0000-0000-000000000204'::uuid
    when p.email = 'carolwilliams@example.com' then '00000000-0000-0000-0000-000000000202'::uuid
    when p.email = 'davidbrown@example.com' then '00000000-0000-0000-0000-000000000205'::uuid
    when p.email = 'evadavis@example.com' then '00000000-0000-0000-0000-000000000203'::uuid
    when p.email = 'frankthomas@example.com' then '00000000-0000-0000-0000-000000000206'::uuid
    when p.email = 'gracemiller@example.com' then '00000000-0000-0000-0000-000000000201'::uuid
    when p.email = 'henrywilson@example.com' then '00000000-0000-0000-0000-000000000205'::uuid
    when p.email = 'isabeljones@example.com' then '00000000-0000-0000-0000-000000000202'::uuid
    when p.email = 'jackanderson@example.com' then '00000000-0000-0000-0000-000000000204'::uuid
    when p.email = 'katemartin@example.com' then '00000000-0000-0000-0000-000000000202'::uuid
    when p.email = 'liamtaylor@example.com' then '00000000-0000-0000-0000-000000000204'::uuid
    when p.email = 'miagarcia@example.com' then '00000000-0000-0000-0000-000000000203'::uuid
    when p.email = 'noahlee@example.com' then '00000000-0000-0000-0000-000000000206'::uuid
    when p.email = 'oliviawhite@example.com' then '00000000-0000-0000-0000-000000000205'::uuid
  end as channel_id
from user_messages um
join public.profiles p on p.email = um.email;

-- Drop the temporary table
drop table user_messages; 