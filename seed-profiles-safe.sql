-- =====================================================
-- SAFE SEED FOR PROFILES TABLE (NO AUTH.USERS)
-- Run this in Supabase SQL Editor
-- =====================================================

-- This version creates fake profiles using placeholder UUIDs
-- Later you can create real auth users and update the user_id references

DO $$
DECLARE
  -- Declare placeholder user IDs for our fake profiles
  sarah_user_id UUID := '11111111-1111-1111-1111-111111111111';
  michael_user_id UUID := '22222222-2222-2222-2222-222222222222';
  emily_user_id UUID := '33333333-3333-3333-3333-333333333333';
  david_user_id UUID := '44444444-4444-4444-4444-444444444444';
  alex_user_id UUID := '55555555-5555-5555-5555-555555555555';
  lisa_user_id UUID := '66666666-6666-6666-6666-666666666666';
  
  -- Get nanopro's user_id if it exists
  nanopro_user_id UUID;
BEGIN

  -- Check if nanopro exists
  SELECT user_id INTO nanopro_user_id 
  FROM public.profiles 
  WHERE username = 'nanopro' 
  LIMIT 1;

  -- Clear existing fake data first
  DELETE FROM public.blog_posts WHERE title IN (
    'The Future of Web Development: Trends to Watch in 2024',
    'Building Scalable React Applications: Best Practices',
    'Design Systems: Creating Consistency at Scale',
    'The Art of Remote Team Management',
    'TypeScript Tips for Better Code Quality',
    'Mindful Productivity: Working Smarter, Not Harder'
  );

  -- Delete fake profiles (but keep nanopro)
  DELETE FROM public.profiles WHERE username IN (
    'sarah_chen', 'michael_rodriguez', 'emily_watson', 
    'david_kim', 'alex_johnson', 'lisa_martinez'
  );

  -- Insert fake profiles (using placeholder UUIDs for user_id)
  INSERT INTO public.profiles (
    user_id, username, display_name, avatar_url, bio, created_at, updated_at
  ) VALUES
  
  (sarah_user_id, 'sarah_chen', 'Sarah Chen', 
   'https://images.unsplash.com/photo-1494790108755-2616b612b278?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
   'Senior Frontend Developer at TechCorp. Passionate about React, TypeScript, and building accessible web applications. Coffee enthusiast and open-source contributor.',
   now() - interval '3 months', now()),
   
  (michael_user_id, 'michael_rodriguez', 'Michael Rodriguez', 
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
   'Full-Stack Developer and Architecture Consultant. Specializing in scalable React applications and Node.js backends. Speaker at tech conferences worldwide.',
   now() - interval '2 months', now()),
   
  (emily_user_id, 'emily_watson', 'Emily Watson', 
   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
   'UX/UI Designer and Design Systems Advocate. Leading design at StartupXYZ. Focused on creating cohesive, user-centered experiences across digital products.',
   now() - interval '4 months', now()),
   
  (david_user_id, 'david_kim', 'David Kim', 
   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
   'Engineering Manager and Remote Work Expert. Building and leading distributed teams for 8+ years. Author of "The Remote Manager" blog series.',
   now() - interval '1 month', now()),
   
  (alex_user_id, 'alex_johnson', 'Alex Johnson', 
   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
   'Senior TypeScript Developer and Code Quality Enthusiast. Maintainer of several open-source TypeScript tools. Advocate for type-safe development practices.',
   now() - interval '5 months', now()),
   
  (lisa_user_id, 'lisa_martinez', 'Lisa Martinez', 
   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
   'Productivity Coach and Mindfulness Practitioner. Helping tech professionals find balance between high performance and well-being. Certified meditation instructor.',
   now() - interval '6 months', now())
   
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    updated_at = EXCLUDED.updated_at;

  -- Insert the blog posts with diverse authors (mix of fake users and nanopro as fallback)
  INSERT INTO public.blog_posts (
    title, slug, excerpt, content, featured_image, category, tags, 
    status, author_id, published_at, created_at
  ) VALUES
  
  -- Post 1: Technology (by Sarah Chen if available, otherwise nanopro)
  ('The Future of Web Development: Trends to Watch in 2024',
   'future-web-development-trends-2024',
   'Explore the latest trends shaping the future of web development, from AI integration to progressive web apps and beyond.',
   'The landscape of web development is evolving at an unprecedented pace. As we move through 2024, several key trends are reshaping how we build and interact with web applications.

**AI Integration is Becoming Standard**

Artificial Intelligence is no longer a futuristic concept—it''s becoming an integral part of modern web development. From AI-powered code completion tools like GitHub Copilot to intelligent user interfaces that adapt to user behavior, AI is transforming every aspect of the development process.

As a frontend developer, I''ve seen firsthand how AI tools are changing our daily workflows. Code suggestions are becoming more accurate, automated testing is getting smarter, and even design-to-code conversion is becoming a reality.

**Progressive Web Apps (PWAs) Gain Traction**

Progressive Web Apps continue to bridge the gap between web and native applications. With improved offline capabilities, push notifications, and app-like experiences, PWAs are becoming the go-to solution for businesses looking to provide seamless user experiences across all devices.

The statistics are compelling: PWAs can reduce bounce rates by up to 42% and increase user engagement significantly compared to traditional web applications.

**WebAssembly Opens New Possibilities**

WebAssembly (WASM) is enabling developers to bring high-performance applications to the web. From gaming to data visualization, WASM allows languages like C++, Rust, and Go to run at near-native speeds in the browser.

**The Rise of Edge Computing**

Edge computing is bringing computation closer to users, resulting in faster load times and better user experiences. Platforms like Cloudflare Workers and Vercel Edge Functions are making it easier than ever to deploy code at the edge.

**Conclusion**

The future of web development is bright, with these trends paving the way for more powerful, efficient, and user-friendly applications. Staying ahead of these trends will be crucial for developers looking to build tomorrow''s web experiences.',
   'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
   'Technology',
   ARRAY['Web Development', 'React', 'AI', 'Trends'],
   'published',
   COALESCE(nanopro_user_id, sarah_user_id),
   '2024-12-15 10:00:00'::timestamp,
   '2024-12-14 15:30:00'::timestamp),

  -- Post 2: Development (by Michael Rodriguez if available, otherwise nanopro)
  ('Building Scalable React Applications: Best Practices',
   'building-scalable-react-applications-best-practices',
   'Learn the essential patterns and practices for building React applications that can grow with your business needs.',
   'Building scalable React applications requires careful planning and adherence to proven patterns. After consulting with numerous companies on their React architecture, here are the essential practices that will help your applications grow sustainably.

**Component Architecture**

A well-thought-out component architecture is the foundation of scalable React applications. In my experience working with teams of all sizes, these principles consistently lead to maintainable codebases:

- **Single Responsibility**: Each component should have one clear purpose
- **Composition over Inheritance**: Build complex UIs by composing simple components
- **Container vs Presentational**: Separate logic from presentation

**State Management Strategy**

As your application grows, state management becomes increasingly important. I''ve seen teams struggle with this, so here''s my recommended approach:

- **Local State First**: Use component state for simple, localized data
- **Context for Shared State**: Use React Context for data that needs to be shared across components
- **External Libraries**: Consider Redux, Zustand, or Jotai for complex state management needs

The key is to start simple and evolve your state management strategy as your application grows.

**Performance Optimization**

Performance should be a consideration from day one, not an afterthought:

- **React.memo**: Prevent unnecessary re-renders of functional components
- **useMemo and useCallback**: Memoize expensive calculations and functions
- **Code Splitting**: Use React.lazy() and Suspense for lazy loading
- **Bundle Analysis**: Regularly analyze your bundle size and optimize imports

**Testing Strategy**

A comprehensive testing strategy is crucial for scalable applications:

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows

**Conclusion**

Building scalable React applications is an ongoing process that requires attention to architecture, performance, and maintainability. By following these best practices and adapting them to your specific needs, you''ll be well-equipped to handle growth and complexity.',
   'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
   'Development',
   ARRAY['React', 'Architecture', 'Scalability', 'Best Practices'],
   'published',
   COALESCE(nanopro_user_id, michael_user_id),
   '2024-12-12 14:00:00'::timestamp,
   '2024-12-11 16:20:00'::timestamp),

  -- Post 3: Design (by Emily Watson if available, otherwise nanopro)
  ('Design Systems: Creating Consistency at Scale',
   'design-systems-creating-consistency-at-scale',
   'Discover how to build and maintain design systems that ensure consistency across large product teams and multiple platforms.',
   'Design systems are the backbone of consistent, scalable user interfaces. As a designer who has built design systems for both startups and enterprise companies, I can attest that they provide a shared language between designers and developers, ensuring that products maintain visual and functional consistency across all touchpoints.

**What is a Design System?**

A design system is much more than a style guide or component library. It''s a comprehensive ecosystem that includes:

- **Design Tokens**: Colors, typography, spacing, and other visual properties
- **Component Library**: Reusable UI components with defined behaviors
- **Documentation**: Guidelines on when and how to use each component
- **Tools and Resources**: Templates, plugins, and other assets

**Building Your Design System**

From my experience leading design system initiatives, start with these foundational elements:

**1. Establish Design Tokens**
Design tokens are the DNA of your design system. Define your color palette, typography scale, spacing system, and other core visual properties. These tokens become the building blocks of your entire system.

**2. Create Component Library**
Build a comprehensive library of reusable components. Start with basics like buttons, inputs, and cards, then expand to more complex patterns.

**3. Document Everything**
Clear documentation is crucial for adoption. Include usage guidelines, do''s and don''ts, and code examples for each component. I''ve found that teams are more likely to use the design system when documentation is comprehensive and easy to navigate.

**4. Governance and Maintenance**
Establish a process for updating and maintaining your design system. Regular reviews and updates ensure it stays relevant and useful.

**Tools for Design Systems**

Popular tools that I recommend include:
- **Figma**: For design and prototyping
- **Storybook**: For component documentation and testing
- **Design Tokens Studio**: For managing design tokens
- **Chromatic**: For visual testing and regression detection

**Conclusion**

A well-implemented design system is an investment that pays dividends in consistency, efficiency, and user experience. Start small, document thoroughly, and iterate based on team feedback. Remember, a design system is never "done"—it''s a living, evolving tool that grows with your product and team.',
   'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
   'Design',
   ARRAY['Design Systems', 'UI/UX', 'Consistency', 'Figma'],
   'published',
   COALESCE(nanopro_user_id, emily_user_id),
   '2024-12-10 11:00:00'::timestamp,
   '2024-12-09 13:45:00'::timestamp),

  -- Post 4: Business (by David Kim if available, otherwise nanopro)
  ('The Art of Remote Team Management',
   'art-of-remote-team-management',
   'Master the challenges of leading distributed teams with proven strategies for communication, productivity, and team building.',
   'Managing remote teams requires a different set of skills compared to traditional in-person management. After leading distributed teams for over 8 years, I''ve learned that success in remote management comes down to intentional communication, trust-building, and the right systems.

**Communication is Everything**

In remote work, communication becomes your primary management tool. Here''s what I''ve learned:

- **Over-communicate**: What feels like too much communication is often just right
- **Choose the Right Channels**: Async for updates, sync for discussions, video for important conversations
- **Document Decisions**: Keep written records of important decisions and discussions

**Building Trust and Accountability**

Trust is the foundation of successful remote teams. Without the ability to "see" your team working, you must shift from monitoring activity to measuring outcomes:

- **Focus on Outcomes**: Measure success by results, not hours worked
- **Regular Check-ins**: Schedule consistent one-on-ones and team meetings
- **Transparency**: Share company goals, challenges, and successes openly

**Creating Connection**

Maintaining team cohesion across distances requires intentional effort:

- **Virtual Coffee Chats**: Encourage informal interactions
- **Team Building Activities**: Organize online games, virtual lunches, or shared experiences
- **In-Person Gatherings**: Plan periodic face-to-face meetings when possible

**Technology and Tools**

The right tools can make or break remote collaboration. Here''s my essential toolkit:

- **Communication**: Slack, Microsoft Teams, or Discord
- **Project Management**: Asana, Trello, or Linear
- **Documentation**: Notion, Confluence, or Google Workspace
- **Video Conferencing**: Zoom, Google Meet, or Microsoft Teams

**Managing Time Zones**

Working across time zones presents unique challenges. Here''s my approach:

- **Core Hours**: Establish overlap hours when everyone is available
- **Async Workflows**: Design processes that don''t require real-time collaboration
- **Flexible Scheduling**: Allow team members to work during their most productive hours

**Conclusion**

Remote team management is both an art and a science. By focusing on communication, trust, and the right tools, you can build high-performing distributed teams that deliver exceptional results. The key is to be intentional about every aspect of remote work and continuously iterate based on what works for your specific team and culture.',
   'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
   'Business',
   ARRAY['Management', 'Remote Work', 'Leadership', 'Productivity'],
   'published',
   COALESCE(nanopro_user_id, david_user_id),
   '2024-12-08 09:00:00'::timestamp,
   '2024-12-07 10:15:00'::timestamp),

  -- Post 5: Development (by Alex Johnson if available, otherwise nanopro)
  ('TypeScript Tips for Better Code Quality',
   'typescript-tips-better-code-quality',
   'Elevate your TypeScript skills with advanced techniques that will make your code more robust and maintainable.',
   'TypeScript has become an essential tool for building robust JavaScript applications. As a maintainer of several TypeScript tools and having worked with TypeScript since its early days, I''d like to share some advanced tips to help you write better, more maintainable TypeScript code.

**Leverage Advanced Type Features**

TypeScript offers powerful type features beyond basic typing. Here are some that can significantly improve your code quality:

**1. Union and Intersection Types**
```typescript
type Status = ''loading'' | ''success'' | ''error'';
type UserWithId = User & { id: string };
```

**2. Conditional Types**
```typescript
type ApiResponse<T> = T extends string 
  ? { message: string } 
  : T extends number 
  ? { count: number } 
  : never;
```

**3. Mapped Types**
```typescript
type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

**Type Guards and Narrowing**

Use type guards to safely narrow types:

```typescript
function isString(value: unknown): value is string {
  return typeof value === ''string'';
}
```

**Utility Types Mastery**

TypeScript''s built-in utility types are incredibly powerful:

- **Partial<T>**: Makes all properties optional
- **Required<T>**: Makes all properties required
- **Pick<T, K>**: Selects specific properties
- **Omit<T, K>**: Excludes specific properties
- **Record<K, T>**: Creates an object type with specific keys

**Configuration Best Practices**

Your TypeScript configuration can make or break your development experience:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Error Handling with Types**

Use discriminated unions for better error handling:

```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };
```

**Conclusion**

These advanced TypeScript techniques will help you write more robust, maintainable code. The key is to leverage TypeScript''s type system to catch errors at compile time and provide better developer experience. Start incorporating these patterns gradually, and you''ll find your code becomes more reliable and easier to refactor.',
   'https://images.unsplash.com/photo-1516116216624-53e697fedbea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
   'Development',
   ARRAY['TypeScript', 'Code Quality', 'JavaScript', 'Best Practices'],
   'published',
   COALESCE(nanopro_user_id, alex_user_id),
   '2024-12-05 16:00:00'::timestamp,
   '2024-12-04 14:30:00'::timestamp),

  -- Post 6: Lifestyle (by Lisa Martinez if available, otherwise nanopro)
  ('Mindful Productivity: Working Smarter, Not Harder',
   'mindful-productivity-working-smarter-not-harder',
   'Discover how mindfulness practices can revolutionize your approach to productivity and work-life balance.',
   'In our always-connected world, the pursuit of productivity often leads to burnout and decreased well-being. As a productivity coach who has worked with hundreds of tech professionals, I''ve seen the toll that "hustle culture" can take. Mindful productivity offers a different approach: working with intention, focus, and awareness.

**What is Mindful Productivity?**

Mindful productivity combines the principles of mindfulness with effective work practices. It''s not about doing more—it''s about doing what matters with full presence and intention. This approach focuses on:

- **Intentional Focus**: Choosing what deserves your attention
- **Present Moment Awareness**: Being fully engaged in current tasks
- **Sustainable Practices**: Building habits that support long-term well-being

**Core Principles**

**1. Single-Tasking**
Despite popular belief, multitasking reduces efficiency and increases stress. Our brains aren''t wired to handle multiple complex tasks simultaneously. Focus on one task at a time for better results and less mental fatigue.

**2. Mindful Breaks**
Regular breaks aren''t just beneficial—they''re essential for sustained performance. Use break time for:
- Deep breathing exercises (even 2 minutes helps)
- Short walks without devices
- Meditation or mindfulness practices
- Gentle stretching or movement

**3. Digital Boundaries**
Create healthy relationships with technology:
- Designated phone-free times during deep work
- Mindful email checking (2-3 times per day instead of constant monitoring)
- Evening digital curfews to protect sleep quality

**Practical Techniques**

**The Pomodoro Technique with Mindfulness**
I''ve adapted the classic Pomodoro Technique to include mindfulness:
- 25 minutes of focused work (single-tasking)
- 5-minute mindful break (breathing, stretching, or brief meditation)
- Repeat 3-4 cycles
- Longer mindful break (15-30 minutes) after completing cycles

**Energy Management Over Time Management**
Work with your natural rhythms rather than against them:
- Identify your peak energy times (track for a week)
- Schedule important, creative work during these periods
- Use low-energy times for routine tasks like email or admin work
- Respect your natural need for rest and recovery

**Building Sustainable Habits**

**Start Small**
Begin with just 5 minutes of mindfulness daily. Consistency is more important than duration.

**Be Compassionate**
Treat yourself with kindness when you inevitably get distracted or fall off track. Self-compassion is more motivating than self-criticism.

**Regular Practice**
Incorporate mindfulness into existing routines rather than adding new time commitments.

**Conclusion**

Mindful productivity isn''t about perfection—it''s about progress. By incorporating these practices gradually, you''ll find yourself not just more productive, but more fulfilled and balanced. The goal isn''t to eliminate stress entirely but to develop a healthier relationship with it.',
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
   'Lifestyle',
   ARRAY['Productivity', 'Mindfulness', 'Work-Life Balance', 'Wellness'],
   'published',
   COALESCE(nanopro_user_id, lisa_user_id),
   '2024-12-03 12:00:00'::timestamp,
   '2024-12-02 15:45:00'::timestamp);

  -- Success message
  RAISE NOTICE '🎉 Profiles and blog posts seeded successfully!';
  RAISE NOTICE '✅ Created 6 fake user profiles with realistic data';
  RAISE NOTICE '✅ Created 6 blog posts with diverse authors';
  RAISE NOTICE '✅ Professional avatars from Unsplash';
  RAISE NOTICE '✅ Realistic bios and professional backgrounds';
  RAISE NOTICE '';
  RAISE NOTICE 'Fake User Profiles Created:';
  RAISE NOTICE '- Sarah Chen (Frontend Developer)';
  RAISE NOTICE '- Michael Rodriguez (Full-Stack Developer)';
  RAISE NOTICE '- Emily Watson (UX/UI Designer)';
  RAISE NOTICE '- David Kim (Engineering Manager)';
  RAISE NOTICE '- Alex Johnson (TypeScript Expert)';
  RAISE NOTICE '- Lisa Martinez (Productivity Coach)';
  RAISE NOTICE '';
  RAISE NOTICE 'Blog Posts Created:';
  RAISE NOTICE '- Technology: The Future of Web Development';
  RAISE NOTICE '- Development: Building Scalable React Applications';
  RAISE NOTICE '- Design: Design Systems at Scale';
  RAISE NOTICE '- Business: Remote Team Management';
  RAISE NOTICE '- Development: TypeScript Tips';
  RAISE NOTICE '- Lifestyle: Mindful Productivity';
  RAISE NOTICE '';
  RAISE NOTICE 'Note: Profiles use placeholder UUIDs for user_id';
  RAISE NOTICE 'Blog posts fall back to nanopro user if available';
  RAISE NOTICE 'Your blog now has realistic content and author profiles!';

END;
$$;
