-- =====================================================
-- SIMPLE SEED DATABASE WITH FAKE BLOG POSTS
-- Run this in Supabase SQL Editor after RLS setup
-- =====================================================

-- This version creates blog posts using the nanopro user as author
-- Later you can update author_id to real users as needed

DO $$
DECLARE
  -- Get nanopro's user_id to use as author
  nanopro_user_id UUID;
  
  -- We'll create some generic user IDs for future use
  sarah_id UUID := gen_random_uuid();
  michael_id UUID := gen_random_uuid();
  emily_id UUID := gen_random_uuid();
  david_id UUID := gen_random_uuid();
  alex_id UUID := gen_random_uuid();
  lisa_id UUID := gen_random_uuid();
BEGIN

  -- Try to get nanopro's user_id
  SELECT user_id INTO nanopro_user_id 
  FROM public.profiles 
  WHERE username = 'nanopro' 
  LIMIT 1;

  -- If nanopro doesn't exist, we'll need to handle this
  IF nanopro_user_id IS NULL THEN
    RAISE NOTICE '⚠️ Warning: nanopro user not found. Creating posts without proper author.';
    -- Use a placeholder UUID - you'll need to update these later
    nanopro_user_id := '00000000-0000-0000-0000-000000000000';
  END IF;

  -- Clear existing fake data first
  DELETE FROM public.blog_posts WHERE title IN (
    'The Future of Web Development: Trends to Watch in 2024',
    'Building Scalable React Applications: Best Practices',
    'Design Systems: Creating Consistency at Scale',
    'The Art of Remote Team Management',
    'TypeScript Tips for Better Code Quality',
    'Mindful Productivity: Working Smarter, Not Harder'
  );

  -- Insert the blog posts (all attributed to nanopro for now)
  INSERT INTO public.blog_posts (
    title, 
    slug, 
    excerpt, 
    content, 
    featured_image, 
    category, 
    tags, 
    status, 
    author_id, 
    published_at,
    created_at
  ) VALUES
  
  -- Post 1: Technology
  ('The Future of Web Development: Trends to Watch in 2024',
   'future-web-development-trends-2024',
   'Explore the latest trends shaping the future of web development, from AI integration to progressive web apps and beyond.',
   'The landscape of web development is evolving at an unprecedented pace. As we move through 2024, several key trends are reshaping how we build and interact with web applications.

**AI Integration is Becoming Standard**

Artificial Intelligence is no longer a futuristic concept—it''s becoming an integral part of modern web development. From AI-powered code completion tools like GitHub Copilot to intelligent user interfaces that adapt to user behavior, AI is transforming every aspect of the development process.

**Progressive Web Apps (PWAs) Gain Traction**

Progressive Web Apps continue to bridge the gap between web and native applications. With improved offline capabilities, push notifications, and app-like experiences, PWAs are becoming the go-to solution for businesses looking to provide seamless user experiences across all devices.

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
   nanopro_user_id,
   '2024-12-15 10:00:00'::timestamp,
   '2024-12-14 15:30:00'::timestamp),

  -- Post 2: Development
  ('Building Scalable React Applications: Best Practices',
   'building-scalable-react-applications-best-practices',
   'Learn the essential patterns and practices for building React applications that can grow with your business needs.',
   'Building scalable React applications requires careful planning and adherence to proven patterns. Here are the essential practices that will help your React applications grow sustainably.

**Component Architecture**

A well-thought-out component architecture is the foundation of scalable React applications. Follow these principles:

- **Single Responsibility**: Each component should have one clear purpose
- **Composition over Inheritance**: Build complex UIs by composing simple components
- **Container vs Presentational**: Separate logic from presentation

**State Management**

As your application grows, state management becomes increasingly important:

- **Local State First**: Use component state for simple, localized data
- **Context for Shared State**: Use React Context for data that needs to be shared across components
- **External Libraries**: Consider Redux, Zustand, or Jotai for complex state management needs

**Performance Optimization**

Optimize your React application for performance:

- **React.memo**: Prevent unnecessary re-renders of functional components
- **useMemo and useCallback**: Memoize expensive calculations and functions
- **Code Splitting**: Use React.lazy() and Suspense for lazy loading
- **Bundle Analysis**: Regularly analyze your bundle size and optimize imports

**Testing Strategy**

Implement a comprehensive testing strategy:

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows

**Conclusion**

Building scalable React applications is an ongoing process that requires attention to architecture, performance, and maintainability. By following these best practices, you''ll be well-equipped to handle growth and complexity.',
   'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
   'Development',
   ARRAY['React', 'Architecture', 'Scalability', 'Best Practices'],
   'published',
   nanopro_user_id,
   '2024-12-12 14:00:00'::timestamp,
   '2024-12-11 16:20:00'::timestamp),

  -- Post 3: Design
  ('Design Systems: Creating Consistency at Scale',
   'design-systems-creating-consistency-at-scale',
   'Discover how to build and maintain design systems that ensure consistency across large product teams and multiple platforms.',
   'Design systems are the backbone of consistent, scalable user interfaces. They provide a shared language between designers and developers, ensuring that products maintain visual and functional consistency across all touchpoints.

**What is a Design System?**

A design system is a comprehensive guide that includes:

- **Design Tokens**: Colors, typography, spacing, and other visual properties
- **Component Library**: Reusable UI components with defined behaviors
- **Documentation**: Guidelines on when and how to use each component
- **Tools and Resources**: Templates, plugins, and other assets

**Building Your Design System**

Start with these foundational elements:

**1. Establish Design Tokens**
Define your color palette, typography scale, spacing system, and other core visual properties. These tokens become the building blocks of your entire system.

**2. Create Component Library**
Build a comprehensive library of reusable components. Start with basics like buttons, inputs, and cards, then expand to more complex patterns.

**3. Document Everything**
Clear documentation is crucial for adoption. Include usage guidelines, do''s and don''ts, and code examples for each component.

**4. Governance and Maintenance**
Establish a process for updating and maintaining your design system. Regular reviews and updates ensure it stays relevant and useful.

**Tools for Design Systems**

Popular tools include:
- **Figma**: For design and prototyping
- **Storybook**: For component documentation
- **Design Tokens Studio**: For managing design tokens
- **Chromatic**: For visual testing

**Conclusion**

A well-implemented design system is an investment that pays dividends in consistency, efficiency, and user experience. Start small, document thoroughly, and iterate based on team feedback.',
   'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
   'Design',
   ARRAY['Design Systems', 'UI/UX', 'Consistency', 'Figma'],
   'published',
   nanopro_user_id,
   '2024-12-10 11:00:00'::timestamp,
   '2024-12-09 13:45:00'::timestamp),

  -- Post 4: Business
  ('The Art of Remote Team Management',
   'art-of-remote-team-management',
   'Master the challenges of leading distributed teams with proven strategies for communication, productivity, and team building.',
   'Managing remote teams requires a different set of skills compared to traditional in-person management. Here are proven strategies for leading distributed teams effectively.

**Communication is Everything**

In remote work, communication becomes your primary management tool:

- **Over-communicate**: What feels like too much communication is often just right
- **Choose the Right Channels**: Async for updates, sync for discussions, video for important conversations
- **Document Decisions**: Keep written records of important decisions and discussions

**Building Trust and Accountability**

Trust is the foundation of successful remote teams:

- **Focus on Outcomes**: Measure success by results, not hours worked
- **Regular Check-ins**: Schedule consistent one-on-ones and team meetings
- **Transparency**: Share company goals, challenges, and successes openly

**Creating Connection**

Maintaining team cohesion across distances requires intentional effort:

- **Virtual Coffee Chats**: Encourage informal interactions
- **Team Building Activities**: Organize online games, virtual lunches, or shared experiences
- **In-Person Gatherings**: Plan periodic face-to-face meetings when possible

**Technology and Tools**

The right tools can make or break remote collaboration:

- **Communication**: Slack, Microsoft Teams, or Discord
- **Project Management**: Asana, Trello, or Linear
- **Documentation**: Notion, Confluence, or Google Workspace
- **Video Conferencing**: Zoom, Google Meet, or Microsoft Teams

**Managing Time Zones**

Working across time zones presents unique challenges:

- **Core Hours**: Establish overlap hours when everyone is available
- **Async Workflows**: Design processes that don''t require real-time collaboration
- **Flexible Scheduling**: Allow team members to work during their most productive hours

**Conclusion**

Remote team management is both an art and a science. By focusing on communication, trust, and the right tools, you can build high-performing distributed teams that deliver exceptional results.',
   'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
   'Business',
   ARRAY['Management', 'Remote Work', 'Leadership', 'Productivity'],
   'published',
   nanopro_user_id,
   '2024-12-08 09:00:00'::timestamp,
   '2024-12-07 10:15:00'::timestamp),

  -- Post 5: Development
  ('TypeScript Tips for Better Code Quality',
   'typescript-tips-better-code-quality',
   'Elevate your TypeScript skills with advanced techniques that will make your code more robust and maintainable.',
   'TypeScript has become an essential tool for building robust JavaScript applications. Here are advanced tips to help you write better, more maintainable TypeScript code.

**Leverage Advanced Type Features**

TypeScript offers powerful type features beyond basic typing:

**1. Union and Intersection Types**
```typescript
type Status = ''loading'' | ''success'' | ''error'';
type UserWithId = User & { id: string };
```

**2. Conditional Types**
```typescript
type ApiResponse<T> = T extends string ? string : T extends number ? number : never;
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

**Utility Types**

Master TypeScript''s built-in utility types:

- **Partial<T>**: Makes all properties optional
- **Required<T>**: Makes all properties required
- **Pick<T, K>**: Selects specific properties
- **Omit<T, K>**: Excludes specific properties
- **Record<K, T>**: Creates an object type with specific keys

**Configuration Best Practices**

Optimize your TypeScript configuration:

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

**Error Handling**

Use discriminated unions for better error handling:

```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };
```

**Conclusion**

These advanced TypeScript techniques will help you write more robust, maintainable code. The key is to leverage TypeScript''s type system to catch errors at compile time and provide better developer experience.',
   'https://images.unsplash.com/photo-1516116216624-53e697fedbea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
   'Development',
   ARRAY['TypeScript', 'Code Quality', 'JavaScript', 'Best Practices'],
   'published',
   nanopro_user_id,
   '2024-12-05 16:00:00'::timestamp,
   '2024-12-04 14:30:00'::timestamp),

  -- Post 6: Lifestyle
  ('Mindful Productivity: Working Smarter, Not Harder',
   'mindful-productivity-working-smarter-not-harder',
   'Discover how mindfulness practices can revolutionize your approach to productivity and work-life balance.',
   'In our always-connected world, the pursuit of productivity often leads to burnout and decreased well-being. Mindful productivity offers a different approach: working with intention, focus, and awareness.

**What is Mindful Productivity?**

Mindful productivity combines the principles of mindfulness with effective work practices. It''s about:

- **Intentional Focus**: Choosing what deserves your attention
- **Present Moment Awareness**: Being fully engaged in current tasks
- **Sustainable Practices**: Building habits that support long-term well-being

**Core Principles**

**1. Single-Tasking**
Despite popular belief, multitasking reduces efficiency and increases stress. Focus on one task at a time for better results and less mental fatigue.

**2. Mindful Breaks**
Regular breaks aren''t just beneficial—they''re essential. Use break time for:
- Deep breathing exercises
- Short walks without devices
- Meditation or mindfulness practices

**3. Digital Boundaries**
Create healthy relationships with technology:
- Designated phone-free times
- Mindful email checking (not constant monitoring)
- Evening digital curfews

**Practical Techniques**

**The Pomodoro Technique with Mindfulness**
- 25 minutes of focused work
- 5-minute mindful break
- Repeat 3-4 cycles
- Longer mindful break (15-30 minutes)

**Mindful Planning**
Start each day with intention:
- Review your priorities mindfully
- Set realistic expectations
- Identify your most important tasks

**Energy Management**
Work with your natural rhythms:
- Identify your peak energy times
- Schedule important work during these periods
- Use low-energy times for routine tasks

**Building Sustainable Habits**

**Start Small**
Begin with just 5 minutes of mindfulness daily. Consistency is more important than duration.

**Be Compassionate**
Treat yourself with kindness when you inevitably get distracted or fall off track.

**Regular Practice**
Incorporate mindfulness into existing routines rather than adding new time commitments.

**Conclusion**

Mindful productivity isn''t about doing more—it''s about doing what matters with full presence and intention. By incorporating these practices, you''ll find yourself not just more productive, but more fulfilled and balanced.',
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
   'Lifestyle',
   ARRAY['Productivity', 'Mindfulness', 'Work-Life Balance', 'Wellness'],
   'published',
   nanopro_user_id,
   '2024-12-03 12:00:00'::timestamp,
   '2024-12-02 15:45:00'::timestamp);

  -- Success message
  RAISE NOTICE '🎉 Database seeded successfully!';
  RAISE NOTICE '✅ Created 6 blog posts with rich content';
  RAISE NOTICE '✅ All posts are published and ready to view';
  RAISE NOTICE '✅ Posts attributed to nanopro user (for now)';
  RAISE NOTICE '';
  RAISE NOTICE 'Blog posts created:';
  RAISE NOTICE '- Technology: The Future of Web Development';
  RAISE NOTICE '- Development: Building Scalable React Applications';
  RAISE NOTICE '- Design: Design Systems at Scale';
  RAISE NOTICE '- Business: Remote Team Management';
  RAISE NOTICE '- Development: TypeScript Tips';
  RAISE NOTICE '- Lifestyle: Mindful Productivity';
  RAISE NOTICE '';
  RAISE NOTICE 'Your blog should now show dynamic content from the database!';
  RAISE NOTICE 'You can later create real users and update the author_id fields.';

END;
$$;
