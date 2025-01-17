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
    'Found some incredible inspiration on Dribbble! 🎨',
    -- Additional Design Inspiration Messages
    'Just discovered some amazing minimalist design trends that could inspire our next project! 🎨',
    'Found some beautiful Material Design examples we could draw inspiration from ✨',
    'These new design trends in minimalism are exactly what we need for the redesign 🎯',
    'Check out these innovative Material Design patterns I found - perfect for our UI! 💫',
    'The latest design trends are all about clean, minimalist interfaces 🌟',
    -- Additional Design Inspiration Messages (Extended)
    'Exploring the latest Material Design trends for our next project iteration 🎨',
    'Found some groundbreaking minimalist design patterns on Behance 🌟',
    'These new design trends in flat design could revolutionize our UI 🎯',
    'Discovered amazing Material Design components that align with our brand 💫',
    'The latest design inspiration from Google''s Material 3 showcase 🎨',
    'Fresh minimalist UI trends that could enhance our user experience ✨',
    'New Material Design patterns for better visual hierarchy 🔍',
    'Innovative design trends focusing on accessibility and aesthetics 🌈',
    'Latest design inspiration for modern, clean interfaces 🎯',
    'Material Design updates that could improve our navigation flow 🚀',
    'Contemporary minimalist trends perfect for our redesign 💡',
    'Design inspiration from award-winning Material Design implementations ⭐',
    'Fresh design trends emphasizing user-centric interfaces 👥',
    'Modern Material Design patterns for better engagement 📱',
    'Cutting-edge minimalist design trends from top tech companies 🌟'
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
    'CPU utilization is spiking',
    -- Additional Architecture Messages
    'Important discussion needed about our service architecture scaling plans 🏗️',
    'Let''s address these architectural concerns before they impact performance 📊',
    'Need to discuss proposed changes to our service architecture 🔄',
    'Time to review our scaling strategy and architectural decisions 🎯',
    'Let''s talk about optimizing our service architecture for better performance ⚡',
    -- Additional Architecture Messages (Extended)
    'Critical discussion needed about service architecture scaling 🏗️',
    'Architectural review of new microservices structure 📊',
    'Important updates to our service architecture design 🔄',
    'Need to discuss architectural improvements for scaling 🎯',
    'Service architecture optimization proposals ready for review ⚡',
    'Architecture scaling concerns need immediate attention 🏗️',
    'Discussion needed on microservices architecture changes 📈',
    'Service architecture performance review scheduled 🔍',
    'Architectural decisions for new scaling requirements 🎯',
    'Review of proposed architecture improvements needed 📊',
    'Critical architecture scaling discussion for new features 🏗️',
    'Service architecture updates for better performance ⚡',
    'Architectural review of system scalability plans 📈',
    'Discussion on architecture optimization strategies 🔄',
    'Service architecture scaling proposals ready 🎯'
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
    'Here''s how we can approach this',
    -- Additional Design Education Messages
    'New design system tutorial series ready for review 📚',
    'Updated component documentation with interactive examples ✨',
    'Created video walkthroughs for common design patterns 🎥',
    'Design system workshop materials are ready for next week 📋',
    'New onboarding resources for the design team ready 🎯',
    -- Extended Design Education Messages
    'Design system best practices guide now available 📚',
    'Updated accessibility guidelines with examples 🔍',
    'New component usage documentation ready ✨',
    'Created pattern library tutorial series 📱',
    'Design system migration guide completed 🎯',
    'Interactive design token documentation ready 🎨',
    'Component playground environment launched 💻',
    'Design system changelog process documented 📝',
    'New design system versioning guide available 📊',
    'Component testing guidelines updated ✅',
    'Design system contribution guide ready 🤝',
    'Pattern library showcase updated 🌟',
    'Design system integration tutorials complete 🔧',
    'Component state management guide ready 📈',
    'Design system performance metrics documented 🚀'
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
    'Has this been battle-tested?',
    -- Additional Technical Analysis Messages
    'Critical analysis of the proposed architecture changes 📊',
    'Risk assessment report for new technology stack 📈',
    'Stability concerns in the current implementation 🔍',
    'Performance impact analysis of proposed changes 🎯',
    'Technical debt evaluation complete ⚠️',
    -- Extended Technical Analysis Messages
    'Comprehensive risk analysis of new framework 📊',
    'Technical debt metrics from latest audit 📈',
    'Stability testing results for current system 🔍',
    'Performance regression analysis complete 🎯',
    'System reliability metrics documented ⚠️',
    'Architecture stability assessment ready 🏗️',
    'Code maintainability metrics report 📝',
    'Technical risk mitigation strategies 🛡️',
    'System scalability analysis results 📊',
    'Infrastructure reliability assessment 🔧',
    'Code quality metrics evaluation 📈',
    'Performance bottleneck analysis 🚀',
    'System vulnerability assessment 🔒',
    'Technical debt reduction plan 📋',
    'Architecture optimization report 🎯'
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
    'The padding needs to be uniform',
    -- Additional Design Review Messages
    'Time to review the latest mockups - I''ve scheduled a design review for tomorrow 📅',
    'Can we get feedback on these new design mockups? Ready for review! 🎨',
    'Design review session scheduled - bring your feedback on the latest UI updates ✨',
    'Need everyone''s input on these mockups during tomorrow''s design review 🔍',
    'Let''s review these design changes together in our next session 👥',
    -- Additional Design Review Messages (Extended)
    'Design review scheduled for the new feature mockups tomorrow 📅',
    'Need feedback on these UI design updates in next review 🎨',
    'Important design review meeting for homepage redesign 📋',
    'Mockup review session planned for the new components 🔍',
    'Design feedback needed on latest interface iterations 👥',
    'Critical design review for the checkout flow updates 📊',
    'Team design review scheduled for navigation changes 🎯',
    'Need everyone''s input on these new design mockups 💭',
    'Design review meeting for mobile responsive layouts 📱',
    'Feedback session scheduled for UI component updates ✨',
    'Review needed on the latest design system changes 🎨',
    'Design critique session for new feature mockups 🔍',
    'Team review of updated user interface designs 👥',
    'Scheduled design review for accessibility updates ♿',
    'Mockup review session for new landing pages 🎯'
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
    'I see valid points on both sides',
    -- Additional Collaboration Messages
    'Team alignment session scheduled for next week 📅',
    'Cross-functional workshop planned for API design 🔄',
    'Collaborative solution for performance vs UX ready 🎯',
    'Team integration strategy document prepared 📋',
    'Unified approach to testing methodology ready ✅',
    -- Extended Collaboration Messages
    'Cross-team communication guidelines ready 📢',
    'Team collaboration framework documented 🤝',
    'Integrated development workflow proposal 🔄',
    'Cross-functional team metrics defined 📊',
    'Team alignment strategy updated 🎯',
    'Collaborative development process guide 📝',
    'Inter-team communication protocols set 💬',
    'Cross-functional project templates ready 📋',
    'Team synchronization guidelines updated 🔄',
    'Collaborative code review process defined ✅',
    'Cross-team knowledge sharing plan 📚',
    'Unified development standards ready 🎯',
    'Team integration metrics dashboard 📊',
    'Cross-functional retrospective guide 🔍',
    'Collaborative planning framework complete 📅'
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
    'We could pioneer something amazing here',
    -- Additional Innovation Messages
    'New AI-powered design tools ready for testing 🤖',
    'Machine learning pipeline for design validation complete 🔍',
    'Automated design system checks implemented 🎯',
    'AI-assisted component generation ready 💫',
    'Innovative design workflow automation launched 🚀',
    -- Extended Innovation Messages
    'AI design pattern recognition system ready 🤖',
    'Machine learning color harmony tool launched 🎨',
    'Automated accessibility testing pipeline live 🔍',
    'AI-powered design consistency checker ready ✅',
    'Innovation lab results for new design tools 🚀',
    'Next-gen design automation framework 💫',
    'AI-assisted layout optimization tool 📐',
    'Machine learning typography analyzer 📝',
    'Automated design review system ready 🔍',
    'Innovation metrics dashboard launched 📊',
    'AI design pattern library complete 📚',
    'Machine learning asset organizer ready 🗂️',
    'Automated style guide generator live 🎨',
    'AI-powered design system validator ✨',
    'Innovation pipeline metrics ready 📈'
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
    'Count me in for support',
    -- Additional Team Building Messages
    'Team building workshop planned for next week 📅',
    'Cross-functional collaboration session scheduled 🤝',
    'New mentorship program guidelines ready 📚',
    'Team integration activities planned 🎯',
    'Collaborative project kickoff tomorrow 🚀',
    -- Extended Team Building Messages
    'Team cohesion workshop materials ready 👥',
    'Cross-functional training program launched 📚',
    'Mentorship matching system implemented 🤝',
    'Team building exercise guide complete 🎯',
    'Collaboration metrics dashboard ready 📊',
    'Team development program launched 🚀',
    'Cross-team bonding activities planned 🎮',
    'Mentorship success stories documented 📝',
    'Team feedback system implemented ✨',
    'Collaborative learning platform ready 📚',
    'Team spirit initiatives documented 🌟',
    'Cross-functional project guide ready 📋',
    'Mentorship best practices guide 🎯',
    'Team recognition program launched 🏆',
    'Collaboration success metrics ready 📈'
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
    'The bug appears under specific conditions',
    -- Additional Debug Messages
    'Memory profiling results analyzed 📊',
    'Performance bottleneck identified 🔍',
    'Root cause analysis complete 🎯',
    'Debug logs show interesting pattern ⚡',
    'Memory optimization strategy ready 💾',
    -- Extended Debug Messages
    'Memory leak investigation results 📊',
    'Performance profiling data analyzed 📈',
    'Root cause documentation ready 📝',
    'Debug strategy implementation complete 🔍',
    'Memory management improvements live 💾',
    'Performance optimization results 🚀',
    'System monitoring alerts configured ⚠️',
    'Debug tooling improvements ready 🔧',
    'Memory usage patterns documented 📊',
    'Performance metrics dashboard live 📈',
    'Root cause prevention strategy 🛡️',
    'Debug process documentation updated 📝',
    'Memory leak prevention guidelines 💾',
    'Performance testing framework ready ⚡',
    'System health monitoring complete 🔍'
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
    'Users consistently report this issue',
    -- Additional UX Research Messages
    'Just completed our latest user testing session - fascinating insights! 📊',
    'The usability study results are in - let me share the key findings 🔍',
    'New UX research data shows interesting patterns in user behavior 📈',
    'Our recent user testing revealed some critical UX improvements needed 🎯',
    'Sharing the latest findings from our UX research study 📋',
    -- Additional UX Research Messages (Extended)
    'Latest user testing reveals interesting patterns in navigation behavior 📊',
    'New usability study findings show key areas for UX improvement 🔍',
    'User research data indicates preference for simplified workflows 📈',
    'Recent UX testing highlights opportunities in onboarding flow 🎯',
    'Comprehensive user research findings from latest testing session 📋',
    'User behavior analysis shows interesting interaction patterns 🔍',
    'UX research insights from our latest A/B testing round 📊',
    'New user testing data reveals friction points in checkout flow 🔎',
    'Research findings suggest users prefer streamlined navigation 📈',
    'Latest usability study shows promising engagement metrics 📋',
    'User research indicates need for simplified form interactions 🎯',
    'Testing results reveal opportunities for UX optimization 📊',
    'New insights from user behavior analysis sessions 🔍',
    'Research data shows interesting mobile usage patterns 📱',
    'Latest UX findings suggest areas for accessibility improvement ♿'
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
    'Network latency is concerning ⚡',
    -- Additional Performance Messages
    'Performance optimization results ready 📊',
    'Load time improvements documented 📈',
    'Memory usage analysis complete 💾',
    'CPU optimization strategy ready 🔧',
    'Network latency reduced significantly ⚡',
    -- Extended Performance Messages
    'Performance metrics dashboard live 📊',
    'Load testing results analyzed 📈',
    'Memory profiling report ready 💾',
    'CPU usage optimization complete 🔧',
    'Network performance improved 30% ⚡',
    'Cache hit ratio increased to 95% 🎯',
    'Response time reduced by 60% ⚡',
    'Resource utilization optimized 📊',
    'Performance monitoring alerts set ⚠️',
    'Load balancing improved 40% 📈',
    'Memory leak prevention ready 💾',
    'CPU throttling implemented 🔧',
    'Network routing optimized ⚡',
    'Cache strategy updated 🎯',
    'Performance testing complete 📊'
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
    'Fresh documentation is live! 📖',
    -- Additional Documentation Messages
    'Documentation structure overhaul complete 📚',
    'API reference guides updated 📝',
    'New interactive tutorials ready 💻',
    'Documentation search improved 🔍',
    'Version control for docs implemented ✅',
    -- Extended Documentation Messages
    'Documentation platform upgraded 📚',
    'API documentation automated 🔄',
    'Tutorial system launched 💻',
    'Search functionality enhanced 🔍',
    'Version management improved ✅',
    'Documentation metrics ready 📊',
    'Content structure optimized 📝',
    'Code examples updated 💻',
    'Search indexing complete 🔍',
    'Version tracking live ✅',
    'Documentation testing automated 🔄',
    'Content organization improved 📚',
    'API examples refreshed 💻',
    'Search algorithms optimized 🔍',
    'Version migration guide ready 📝'
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
    'Security scan shows weaknesses 🔬',
    -- Additional DevOps Messages
    'Latest deployment metrics show improved performance across all services 📊',
    'Updated our deployment pipeline for better performance tracking 📈',
    'New monitoring system in place for tracking deployment metrics 🔍',
    'Performance optimization results from the latest release 🚀',
    'Deployment stats and performance metrics for this week''s release ⚡',
    -- Additional DevOps Messages (Extended)
    'Deployment metrics show significant performance gains 📊',
    'New monitoring system tracking deployment success rates 📈',
    'Performance metrics from latest production release 🔍',
    'Deployment pipeline optimization results look promising 🚀',
    'Latest release performance metrics and analysis ⚡',
    'Deployment statistics show improved response times 📊',
    'Monitoring data from recent infrastructure updates 📈',
    'Performance tracking for new deployment pipeline 🔍',
    'Release metrics show positive scaling trends 📊',
    'Infrastructure performance data from latest deploy ⚡',
    'Deployment optimization metrics look promising 🚀',
    'New monitoring insights from production release 📈',
    'Performance data from latest system deployment 🔍',
    'Release statistics show improved error rates 📊',
    'Infrastructure scaling metrics from recent deploy ⚡'
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
    'Security impact assessment needed 📊',
    -- Additional Security Messages
    'Zero Trust implementation complete 🔒',
    'Security monitoring dashboard live 📊',
    'Access control audit finished 🔍',
    'Threat detection system ready ⚠️',
    'Security metrics analysis done 📈',
    -- Extended Security Messages
    'Zero Trust architecture deployed 🔒',
    'Security monitoring enhanced 📊',
    'Access controls tightened 🔐',
    'Threat detection improved 🔍',
    'Security metrics dashboard live 📈',
    'Authentication system hardened 🛡️',
    'Security policies updated ⚠️',
    'Monitoring alerts configured 🚨',
    'Access audit system ready 🔍',
    'Security testing complete ✅',
    'Zero day protection active 🔒',
    'Security response plan updated 📝',
    'Access matrix implemented 🔐',
    'Threat modeling complete 🎯',
    'Security compliance verified ✅'
  ]);

-- Insert messages from the temporary table
insert into public.messages (content, user_id, channel_id)
select 
  unnest(um.messages) as content,
  p.id as user_id,
  channel_id
from user_messages um
join public.profiles p on p.email = um.email
cross join lateral (
  select channel_id
  from (
    select id as channel_id, workspace_id
    from public.channels
  ) c
  where 
    -- Users 1-10 in workspace 1 (Design Workspace)
    ((p.email in (
      'alicejohnson@example.com',
      'bobsmith@example.com',
      'carolwilliams@example.com',
      'davidbrown@example.com',
      'evadavis@example.com',
      'frankthomas@example.com',
      'gracemiller@example.com',
      'henrywilson@example.com',
      'isabeljones@example.com',
      'jackanderson@example.com'
    ) and c.workspace_id = '00000000-0000-0000-0000-000000000101')
    OR
    -- Users 6-15 in workspace 2 (Engineering Workspace)
    (p.email in (
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
    ) and c.workspace_id = '00000000-0000-0000-0000-000000000102'))
) channels;

-- Drop the temporary table
drop table user_messages; 