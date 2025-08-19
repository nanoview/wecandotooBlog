-- Insert quality blog posts with substantial content for AdSense compliance
-- These posts have original, valuable content that meets Google's quality guidelines

INSERT INTO blog_posts (id, title, slug, content, excerpt, featured_image_url, status, category, tags, author_id, created_at, updated_at) VALUES 
(
  gen_random_uuid(),
  'Building Modern Web Applications: A Complete Guide for 2025',
  'building-modern-web-applications-2025',
  '<h1>Building Modern Web Applications: A Complete Guide for 2025</h1>

<p>The landscape of web development has evolved dramatically in recent years. Modern web applications require a different approach than traditional websites, focusing on performance, user experience, and scalability. In this comprehensive guide, we''ll explore the essential technologies and best practices for building cutting-edge web applications in 2025.</p>

<h2>Core Technologies and Frameworks</h2>

<p>The foundation of modern web development rests on several key technologies that have proven their worth in production environments:</p>

<h3>Frontend Frameworks</h3>
<ul>
  <li><strong>React</strong> - Component-based architecture with excellent ecosystem support</li>
  <li><strong>Vue.js</strong> - Progressive framework with gentle learning curve</li>
  <li><strong>Angular</strong> - Full-featured framework for enterprise applications</li>
  <li><strong>Svelte</strong> - Compile-time optimized framework for maximum performance</li>
</ul>

<h3>Backend Technologies</h3>
<p>Modern backend development has embraced cloud-native approaches and microservices architecture. Popular choices include:</p>

<ul>
  <li><strong>Node.js</strong> with Express or Fastify for JavaScript/TypeScript backends</li>
  <li><strong>Python</strong> with FastAPI or Django for rapid development</li>
  <li><strong>Go</strong> for high-performance, concurrent applications</li>
  <li><strong>Rust</strong> for systems programming and maximum performance</li>
</ul>

<h2>Database and Storage Solutions</h2>

<p>Choosing the right database architecture is crucial for application success. Modern applications often use a combination of:</p>

<h3>Relational Databases</h3>
<p>PostgreSQL remains the top choice for complex applications requiring ACID compliance and advanced querying capabilities. Its support for JSON data types bridges the gap between relational and document databases.</p>

<h3>NoSQL Solutions</h3>
<p>MongoDB and DynamoDB excel in scenarios requiring flexible schemas and horizontal scaling. Redis provides excellent caching and session storage capabilities.</p>

<h3>Modern Database-as-a-Service</h3>
<p>Platforms like Supabase, Firebase, and PlanetScale offer managed database solutions with built-in authentication, real-time subscriptions, and edge computing capabilities.</p>

<h2>Development Best Practices</h2>

<h3>Code Quality and Testing</h3>
<p>Maintaining high code quality is essential for long-term project success:</p>

<ul>
  <li><strong>TypeScript</strong> - Provides type safety and better developer experience</li>
  <li><strong>ESLint and Prettier</strong> - Enforce consistent code style</li>
  <li><strong>Jest or Vitest</strong> - Comprehensive testing frameworks</li>
  <li><strong>Cypress or Playwright</strong> - End-to-end testing solutions</li>
</ul>

<h3>Performance Optimization</h3>
<p>Performance directly impacts user experience and SEO rankings:</p>

<ul>
  <li>Implement code splitting and lazy loading</li>
  <li>Optimize images with modern formats (WebP, AVIF)</li>
  <li>Use Content Delivery Networks (CDNs)</li>
  <li>Implement proper caching strategies</li>
  <li>Monitor Core Web Vitals</li>
</ul>

<h2>Deployment and DevOps</h2>

<h3>Containerization</h3>
<p>Docker has become the standard for application packaging, providing consistent environments across development, testing, and production.</p>

<h3>Cloud Platforms</h3>
<p>Modern deployment strategies leverage cloud platforms for scalability and reliability:</p>

<ul>
  <li><strong>Vercel</strong> - Optimized for frontend applications and Next.js</li>
  <li><strong>Netlify</strong> - Excellent for static sites and JAMstack applications</li>
  <li><strong>AWS, Google Cloud, Azure</strong> - Full-featured cloud platforms</li>
  <li><strong>Railway, Render</strong> - Developer-friendly platforms for full-stack apps</li>
</ul>

<h2>Security Considerations</h2>

<p>Security must be built into applications from the ground up:</p>

<ul>
  <li>Implement proper authentication and authorization</li>
  <li>Use HTTPS everywhere</li>
  <li>Sanitize user inputs to prevent XSS attacks</li>
  <li>Implement Content Security Policy (CSP)</li>
  <li>Regular security audits and dependency updates</li>
</ul>

<h2>Future Trends and Technologies</h2>

<h3>Edge Computing</h3>
<p>Edge functions and edge databases are bringing computation closer to users, reducing latency and improving performance globally.</p>

<h3>WebAssembly</h3>
<p>WASM enables running high-performance applications in browsers, opening new possibilities for web applications.</p>

<h3>AI Integration</h3>
<p>Large Language Models and AI APIs are becoming integral parts of modern applications, enhancing user experiences with intelligent features.</p>

<h2>Conclusion</h2>

<p>Building modern web applications requires a holistic approach that combines the right technologies, best practices, and forward-thinking architecture. Success depends on choosing tools that align with your project requirements while maintaining focus on performance, security, and user experience.</p>

<p>As the web continues to evolve, staying updated with emerging technologies and industry best practices ensures your applications remain competitive and provide exceptional value to users.</p>',
  'A comprehensive guide to building modern web applications in 2025, covering essential technologies, frameworks, best practices, and deployment strategies.',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
  'published',
  'Web Development',
  ARRAY['React', 'JavaScript', 'TypeScript', 'Web Development', 'Frontend', 'Backend'],
  (SELECT id FROM auth.users LIMIT 1),
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
),
(
  gen_random_uuid(),
  'Mastering TypeScript: Advanced Patterns and Best Practices',
  'mastering-typescript-advanced-patterns',
  '<h1>Mastering TypeScript: Advanced Patterns and Best Practices</h1>

<p>TypeScript has revolutionized JavaScript development by bringing static typing to the dynamic world of web development. While many developers are comfortable with basic TypeScript usage, mastering advanced patterns can significantly improve code quality, maintainability, and developer productivity.</p>

<h2>Advanced Type System Features</h2>

<h3>Conditional Types</h3>
<p>Conditional types allow you to create types that depend on other types, enabling powerful type-level programming:</p>

<pre><code>type NonNullable&lt;T&gt; = T extends null | undefined ? never : T;
type ApiResponse&lt;T&gt; = T extends string ? { message: T } : { data: T };</code></pre>

<h3>Mapped Types</h3>
<p>Mapped types transform existing types by applying transformations to their properties:</p>

<pre><code>type Partial&lt;T&gt; = {
  [P in keyof T]?: T[P];
};

type ReadonlyKeys&lt;T&gt; = {
  readonly [P in keyof T]: T[P];
};</code></pre>

<h2>Generic Constraints and Utility Types</h2>

<h3>Generic Constraints</h3>
<p>Constraints allow you to limit the types that can be used with generics:</p>

<pre><code>interface Lengthwise {
  length: number;
}

function loggingIdentity&lt;T extends Lengthwise&gt;(arg: T): T {
  console.log(arg.length);
  return arg;
}</code></pre>

<h3>Built-in Utility Types</h3>
<p>TypeScript provides many utility types for common transformations:</p>

<ul>
  <li><strong>Omit&lt;T, K&gt;</strong> - Creates a type by omitting specific properties</li>
  <li><strong>Pick&lt;T, K&gt;</strong> - Creates a type by selecting specific properties</li>
  <li><strong>Record&lt;K, T&gt;</strong> - Creates a type with specified keys and value type</li>
  <li><strong>Extract&lt;T, U&gt;</strong> - Extracts types that are assignable to U</li>
</ul>

<h2>Design Patterns with TypeScript</h2>

<h3>Builder Pattern</h3>
<p>The builder pattern with TypeScript provides type-safe object construction:</p>

<pre><code>class QueryBuilder&lt;T&gt; {
  private conditions: string[] = [];
  
  where(condition: keyof T, value: any): this {
    this.conditions.push(`${String(condition)} = ${value}`);
    return this;
  }
  
  build(): string {
    return this.conditions.join(' AND ');
  }
}</code></pre>

<h3>Factory Pattern</h3>
<p>Factories with TypeScript can provide compile-time guarantees about object creation:</p>

<pre><code>interface DatabaseConnection {
  connect(): Promise&lt;void&gt;;
  query(sql: string): Promise&lt;any[]&gt;;
}

class ConnectionFactory {
  static create(type: 'postgres' | 'mysql'): DatabaseConnection {
    switch (type) {
      case 'postgres':
        return new PostgresConnection();
      case 'mysql':
        return new MySQLConnection();
    }
  }
}</code></pre>

<h2>Performance Optimization</h2>

<h3>Compilation Performance</h3>
<p>Large TypeScript projects can suffer from slow compilation. Optimization strategies include:</p>

<ul>
  <li>Using project references for monorepos</li>
  <li>Implementing incremental compilation</li>
  <li>Optimizing import/export patterns</li>
  <li>Using type-only imports when appropriate</li>
</ul>

<h3>Runtime Performance</h3>
<p>TypeScript compilation should not negatively impact runtime performance:</p>

<ul>
  <li>Avoid excessive type assertions</li>
  <li>Use const assertions for literal types</li>
  <li>Leverage tree shaking with proper ES modules</li>
  <li>Minimize the use of any type</li>
</ul>

<h2>Testing TypeScript Code</h2>

<h3>Type Testing</h3>
<p>Test your types to ensure they behave as expected:</p>

<pre><code>// Using TypeScript''s built-in type checking
type Equal&lt;X, Y&gt; = X extends Y ? (Y extends X ? true : false) : false;
type Assert&lt;T extends true&gt; = T;

type Test = Assert&lt;Equal&lt;ReturnType&lt;typeof myFunction&gt;, ExpectedType&gt;&gt;;</code></pre>

<h3>Unit Testing</h3>
<p>TypeScript enhances testing by providing type safety in test code:</p>

<pre><code>describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked&lt;UserRepository&gt;;
  
  beforeEach(() => {
    mockRepository = createMockRepository();
    userService = new UserService(mockRepository);
  });
  
  it('should create user with valid data', async () => {
    const userData: CreateUserRequest = {
      name: 'John Doe',
      email: 'john@example.com'
    };
    
    const result = await userService.createUser(userData);
    expect(result).toMatchObject({ id: expect.any(String) });
  });
});</code></pre>

<h2>Integration with Modern Frameworks</h2>

<h3>React with TypeScript</h3>
<p>TypeScript provides excellent support for React development:</p>

<ul>
  <li>Strongly typed props and state</li>
  <li>Generic components for reusability</li>
  <li>Type-safe context and hooks</li>
  <li>Enhanced IntelliSense and refactoring</li>
</ul>

<h3>Node.js with TypeScript</h3>
<p>Server-side TypeScript development benefits from:</p>

<ul>
  <li>Type-safe API endpoints</li>
  <li>Database query type safety</li>
  <li>Middleware type definitions</li>
  <li>Configuration type checking</li>
</ul>

<h2>Tooling and Development Experience</h2>

<h3>IDE Configuration</h3>
<p>Optimize your development environment for TypeScript:</p>

<ul>
  <li>Configure strict mode for maximum type safety</li>
  <li>Set up automatic imports and organizing</li>
  <li>Enable format on save and lint on save</li>
  <li>Use TypeScript Hero or similar extensions</li>
</ul>

<h3>Build Tools Integration</h3>
<p>Modern build tools provide excellent TypeScript support:</p>

<ul>
  <li><strong>Vite</strong> - Fast development with built-in TypeScript support</li>
  <li><strong>esbuild</strong> - Extremely fast TypeScript compilation</li>
  <li><strong>swc</strong> - Rust-based TypeScript compiler</li>
  <li><strong>Webpack</strong> - Mature bundler with TypeScript loader</li>
</ul>

<h2>Best Practices and Guidelines</h2>

<h3>Code Organization</h3>
<ul>
  <li>Use consistent naming conventions</li>
  <li>Organize types in dedicated files</li>
  <li>Implement proper module structure</li>
  <li>Use index files for clean imports</li>
</ul>

<h3>Type Safety</h3>
<ul>
  <li>Enable strict mode in tsconfig.json</li>
  <li>Avoid using any type</li>
  <li>Use type guards for runtime checks</li>
  <li>Implement proper error handling with typed errors</li>
</ul>

<h2>Future of TypeScript</h2>

<p>TypeScript continues to evolve with regular releases bringing new features:</p>

<ul>
  <li>Template literal types for advanced string manipulation</li>
  <li>Variadic tuple types for flexible function signatures</li>
  <li>Recursive conditional types for complex type relationships</li>
  <li>Performance improvements in the compiler</li>
</ul>

<h2>Conclusion</h2>

<p>Mastering advanced TypeScript patterns requires practice and understanding of the type system''s capabilities. By leveraging these advanced features, developers can create more robust, maintainable, and scalable applications.</p>

<p>The investment in learning advanced TypeScript pays dividends in reduced bugs, improved developer experience, and better code documentation through types. As TypeScript continues to evolve, staying current with new features and patterns ensures your development skills remain sharp and relevant.</p>',
  'Deep dive into advanced TypeScript patterns, design principles, and best practices for professional development.',
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
  'published',
  'Programming',
  ARRAY['TypeScript', 'JavaScript', 'Programming', 'Development', 'Software Engineering'],
  (SELECT id FROM auth.users LIMIT 1),
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),
(
  gen_random_uuid(),
  'The Complete Guide to Modern CSS: Grid, Flexbox, and Beyond',
  'complete-guide-modern-css-2025',
  '<h1>The Complete Guide to Modern CSS: Grid, Flexbox, and Beyond</h1>

<p>CSS has evolved tremendously over the past decade. Modern CSS provides powerful layout systems, advanced styling capabilities, and tools that make creating beautiful, responsive web interfaces easier than ever. This comprehensive guide covers everything you need to know about modern CSS techniques and best practices.</p>

<h2>CSS Grid: The Ultimate Layout System</h2>

<h3>Understanding CSS Grid Fundamentals</h3>
<p>CSS Grid is a two-dimensional layout system that allows you to create complex layouts with ease. Unlike Flexbox, which is primarily one-dimensional, Grid excels at creating both row and column layouts simultaneously.</p>

<h4>Basic Grid Setup</h4>
<pre><code>.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  min-height: 100vh;
}</code></pre>

<h3>Advanced Grid Techniques</h3>
<p>Modern Grid layouts can handle complex responsive designs with minimal code:</p>

<h4>Named Grid Lines</h4>
<pre><code>.layout {
  display: grid;
  grid-template-columns: 
    [sidebar-start] 250px 
    [sidebar-end main-start] 1fr 
    [main-end];
  grid-template-rows: 
    [header-start] 60px 
    [header-end content-start] 1fr 
    [content-end footer-start] 60px 
    [footer-end];
}</code></pre>

<h4>Grid Areas for Semantic Layouts</h4>
<pre><code>.app-layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }</code></pre>

<h2>Flexbox: The Perfect One-Dimensional Layout Tool</h2>

<h3>When to Use Flexbox vs Grid</h3>
<p>Understanding when to use each layout method is crucial for efficient CSS:</p>

<ul>
  <li><strong>Use Flexbox for:</strong> Navigation bars, centering content, distributing space, component-level layouts</li>
  <li><strong>Use Grid for:</strong> Page layouts, complex two-dimensional arrangements, responsive design systems</li>
</ul>

<h3>Advanced Flexbox Patterns</h3>

<h4>The Holy Grail Layout with Flexbox</h4>
<pre><code>.holy-grail {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content-wrapper {
  display: flex;
  flex: 1;
}

.sidebar { flex: 0 0 200px; }
.main { flex: 1; }
.aside { flex: 0 0 200px; }</code></pre>

<h4>Responsive Navigation with Flexbox</h4>
<pre><code>.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

@media (max-width: 768px) {
  .navigation {
    flex-direction: column;
  }
}</code></pre>

<h2>Modern CSS Features and Techniques</h2>

<h3>CSS Custom Properties (Variables)</h3>
<p>CSS custom properties enable dynamic theming and maintainable stylesheets:</p>

<pre><code>:root {
  --primary-color: #3b82f6;
  --secondary-color: #1e40af;
  --spacing-unit: 8px;
  --border-radius: 8px;
}

.button {
  background-color: var(--primary-color);
  padding: calc(var(--spacing-unit) * 2);
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease;
}

.button:hover {
  background-color: var(--secondary-color);
}</code></pre>

<h3>Container Queries</h3>
<p>Container queries allow components to respond to their container size rather than viewport size:</p>

<pre><code>.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: flex;
    gap: 1rem;
  }
  
  .card-image {
    flex: 0 0 150px;
  }
}</code></pre>

<h3>CSS Logical Properties</h3>
<p>Logical properties make your CSS more international and flexible:</p>

<pre><code>.content {
  margin-inline: auto; /* Replaces margin-left and margin-right */
  padding-block: 2rem; /* Replaces padding-top and padding-bottom */
  border-inline-start: 3px solid blue; /* Replaces border-left */
}</code></pre>

<h2>Advanced Styling Techniques</h2>

<h3>CSS Subgrid</h3>
<p>Subgrid allows nested grids to align with their parent grid:</p>

<pre><code>.parent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.child-grid {
  display: grid;
  grid-column: span 2;
  grid-template-columns: subgrid;
  grid-template-rows: subgrid;
}</code></pre>

<h3>CSS Animations and Transitions</h3>
<p>Modern CSS provides powerful animation capabilities:</p>

<h4>CSS Custom Animations</h4>
<pre><code>@keyframes slideInFromLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animated-element {
  animation: slideInFromLeft 0.5s ease-out;
}</code></pre>

<h4>CSS Transforms and 3D Effects</h4>
<pre><code>.card {
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: rotateY(10deg) rotateX(5deg) translateZ(20px);
}</code></pre>

<h2>Responsive Design with Modern CSS</h2>

<h3>Intrinsic Web Design</h3>
<p>Modern responsive design focuses on intrinsic layouts that adapt naturally:</p>

<pre><code>.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.flexible-container {
  width: min(90%, 1200px);
  margin-inline: auto;
}</code></pre>

<h3>Modern Media Queries</h3>
<p>Use feature queries and modern media query techniques:</p>

<pre><code>@supports (display: grid) {
  .layout {
    display: grid;
    /* Grid-specific styles */
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}</code></pre>

<h2>CSS Architecture and Organization</h2>

<h3>BEM Methodology</h3>
<p>BEM (Block Element Modifier) provides a clear naming convention:</p>

<pre><code>/* Block */
.card { }

/* Element */
.card__title { }
.card__content { }
.card__button { }

/* Modifier */
.card--featured { }
.card__button--primary { }</code></pre>

<h3>CSS-in-JS vs Utility-First</h3>
<p>Understanding different approaches to CSS architecture:</p>

<ul>
  <li><strong>Utility-First (Tailwind CSS):</strong> Rapid development with pre-defined classes</li>
  <li><strong>CSS-in-JS (Styled Components):</strong> Component-scoped styles with JavaScript</li>
  <li><strong>CSS Modules:</strong> Locally scoped CSS with build-time processing</li>
  <li><strong>Traditional CSS:</strong> Global stylesheets with naming conventions</li>
</ul>

<h2>Performance Optimization</h2>

<h3>CSS Loading Performance</h3>
<p>Optimize CSS delivery for better performance:</p>

<ul>
  <li>Critical CSS inlining for above-the-fold content</li>
  <li>CSS minification and compression</li>
  <li>Lazy loading non-critical stylesheets</li>
  <li>Using CSS containment for performance isolation</li>
</ul>

<h3>Efficient CSS Selectors</h3>
<p>Write performant CSS selectors:</p>

<pre><code>/* Efficient - uses class selector */
.navigation-item { }

/* Less efficient - complex descendant selector */
.header .navigation ul li a { }

/* Efficient - uses CSS containment */
.article-content {
  contain: layout style;
}</code></pre>

<h2>CSS Tools and Preprocessing</h2>

<h3>Modern CSS Preprocessors</h3>
<p>While modern CSS has many built-in features, preprocessors still provide value:</p>

<ul>
  <li><strong>Sass/SCSS:</strong> Mature ecosystem with extensive features</li>
  <li><strong>PostCSS:</strong> Modular approach with plugins</li>
  <li><strong>Stylus:</strong> Flexible syntax options</li>
</ul>

<h3>CSS Build Tools</h3>
<p>Modern build tools for CSS development:</p>

<ul>
  <li><strong>Vite:</strong> Fast development with built-in CSS processing</li>
  <li><strong>Webpack:</strong> Comprehensive CSS loading and processing</li>
  <li><strong>Parcel:</strong> Zero-configuration CSS bundling</li>
  <li><strong>esbuild:</strong> Extremely fast CSS compilation</li>
</ul>

<h2>Testing and Debugging CSS</h2>

<h3>Visual Regression Testing</h3>
<p>Ensure CSS changes don''t break layouts:</p>

<ul>
  <li>Percy for automated visual testing</li>
  <li>Chromatic for Storybook integration</li>
  <li>BackstopJS for screenshot comparison</li>
</ul>

<h3>CSS Debugging Techniques</h3>
<p>Effective strategies for debugging CSS issues:</p>

<ul>
  <li>Browser developer tools for live editing</li>
  <li>CSS validation with W3C validator</li>
  <li>Performance profiling for layout issues</li>
  <li>Accessibility testing with screen readers</li>
</ul>

<h2>Future of CSS</h2>

<h3>Upcoming CSS Features</h3>
<p>CSS continues to evolve with exciting new features:</p>

<ul>
  <li><strong>CSS Cascade Layers:</strong> Better control over specificity</li>
  <li><strong>CSS Nesting:</strong> Native nesting support</li>
  <li><strong>CSS Houdini:</strong> Low-level CSS APIs</li>
  <li><strong>CSS Color Functions:</strong> Advanced color manipulation</li>
</ul>

<h2>Conclusion</h2>

<p>Modern CSS provides unprecedented power and flexibility for creating beautiful, responsive web interfaces. By mastering Grid, Flexbox, and modern CSS features, developers can create sophisticated layouts with clean, maintainable code.</p>

<p>The key to success with modern CSS is understanding when to use each tool and technique. Grid excels at two-dimensional layouts, Flexbox handles one-dimensional arrangements perfectly, and modern CSS features like custom properties and container queries provide the flexibility needed for complex, responsive designs.</p>

<p>As CSS continues to evolve, staying current with new features and best practices ensures your styling skills remain sharp and your websites stay competitive in the ever-changing web landscape.</p>',
  'Master modern CSS with comprehensive coverage of Grid, Flexbox, and cutting-edge styling techniques for 2025.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
  'published',
  'CSS',
  ARRAY['CSS', 'Web Design', 'Frontend', 'Responsive Design', 'Grid', 'Flexbox'],
  (SELECT id FROM auth.users LIMIT 1),
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);
