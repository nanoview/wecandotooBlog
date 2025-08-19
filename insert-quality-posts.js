import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rowcloxlszwnowlggqon.supabase.co';
// Using service role key for admin operations
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMDAwNCwiZXhwIjoyMDY5Mzk2MDA0fQ.0R8CvJUfXB1aTwFdz7ywNbrmGp2GNTU7V9MdWr-j4mU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const qualityPosts = [
  {
    title: 'Building Modern Web Applications: A Complete Guide for 2025',
    slug: 'building-modern-web-applications-2025',
    content: `<h1>Building Modern Web Applications: A Complete Guide for 2025</h1>

<p>The landscape of web development has evolved dramatically in recent years. Modern web applications require a different approach than traditional websites, focusing on performance, user experience, and scalability. In this comprehensive guide, we'll explore the essential technologies and best practices for building cutting-edge web applications in 2025.</p>

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

<h2>Security Considerations</h2>

<p>Security must be built into applications from the ground up:</p>

<ul>
  <li>Implement proper authentication and authorization</li>
  <li>Use HTTPS everywhere</li>
  <li>Sanitize user inputs to prevent XSS attacks</li>
  <li>Implement Content Security Policy (CSP)</li>
  <li>Regular security audits and dependency updates</li>
</ul>

<h2>Conclusion</h2>

<p>Building modern web applications requires a holistic approach that combines the right technologies, best practices, and forward-thinking architecture. Success depends on choosing tools that align with your project requirements while maintaining focus on performance, security, and user experience.</p>

<p>As the web continues to evolve, staying updated with emerging technologies and industry best practices ensures your applications remain competitive and provide exceptional value to users.</p>`,
    excerpt: 'A comprehensive guide to building modern web applications in 2025, covering essential technologies, frameworks, best practices, and deployment strategies.',
    featured_image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
    status: 'published',
    category: 'Web Development',
    tags: ['React', 'JavaScript', 'TypeScript', 'Web Development', 'Frontend', 'Backend']
  },
  {
    title: 'Mastering TypeScript: Advanced Patterns and Best Practices',
    slug: 'mastering-typescript-advanced-patterns',
    content: `<h1>Mastering TypeScript: Advanced Patterns and Best Practices</h1>

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

<h2>Design Patterns with TypeScript</h2>

<h3>Builder Pattern</h3>
<p>The builder pattern with TypeScript provides type-safe object construction:</p>

<pre><code>class QueryBuilder&lt;T&gt; {
  private conditions: string[] = [];
  
  where(condition: keyof T, value: any): this {
    this.conditions.push(\`\${String(condition)} = \${value}\`);
    return this;
  }
  
  build(): string {
    return this.conditions.join(' AND ');
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

<h2>Best Practices and Guidelines</h2>

<h3>Code Organization</h3>
<ul>
  <li>Use consistent naming conventions</li>
  <li>Organize types in dedicated files</li>
  <li>Implement proper module structure</li>
  <li>Use index files for clean imports</li>
</ul>

<h2>Conclusion</h2>

<p>Mastering advanced TypeScript patterns requires practice and understanding of the type system's capabilities. By leveraging these advanced features, developers can create more robust, maintainable, and scalable applications.</p>

<p>The investment in learning advanced TypeScript pays dividends in reduced bugs, improved developer experience, and better code documentation through types. As TypeScript continues to evolve, staying current with new features and patterns ensures your development skills remain sharp and relevant.</p>`,
    excerpt: 'Deep dive into advanced TypeScript patterns, design principles, and best practices for professional development.',
    featured_image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
    status: 'published',
    category: 'Programming',
    tags: ['TypeScript', 'JavaScript', 'Programming', 'Development', 'Software Engineering']
  },
  {
    title: 'The Complete Guide to Modern CSS: Grid, Flexbox, and Beyond',
    slug: 'complete-guide-modern-css-2025',
    content: `<h1>The Complete Guide to Modern CSS: Grid, Flexbox, and Beyond</h1>

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

<h2>Flexbox: The Perfect One-Dimensional Layout Tool</h2>

<h3>When to Use Flexbox vs Grid</h3>
<p>Understanding when to use each layout method is crucial for efficient CSS:</p>

<ul>
  <li><strong>Use Flexbox for:</strong> Navigation bars, centering content, distributing space, component-level layouts</li>
  <li><strong>Use Grid for:</strong> Page layouts, complex two-dimensional arrangements, responsive design systems</li>
</ul>

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

<h2>Performance Optimization</h2>

<h3>CSS Loading Performance</h3>
<p>Optimize CSS delivery for better performance:</p>

<ul>
  <li>Critical CSS inlining for above-the-fold content</li>
  <li>CSS minification and compression</li>
  <li>Lazy loading non-critical stylesheets</li>
  <li>Using CSS containment for performance isolation</li>
</ul>

<h2>Conclusion</h2>

<p>Modern CSS provides unprecedented power and flexibility for creating beautiful, responsive web interfaces. By mastering Grid, Flexbox, and modern CSS features, developers can create sophisticated layouts with clean, maintainable code.</p>

<p>The key to success with modern CSS is understanding when to use each tool and technique. Grid excels at two-dimensional layouts, Flexbox handles one-dimensional arrangements perfectly, and modern CSS features like custom properties and container queries provide the flexibility needed for complex, responsive designs.</p>`,
    excerpt: 'Master modern CSS with comprehensive coverage of Grid, Flexbox, and cutting-edge styling techniques for 2025.',
    featured_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
    status: 'published',
    category: 'CSS',
    tags: ['CSS', 'Web Design', 'Frontend', 'Responsive Design', 'Grid', 'Flexbox']
  }
];

async function insertQualityPosts() {
  try {
    // First, get any existing users from profiles table
    const { data: existingUsers, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, username')
      .limit(1);
    
    let authorId = null;
    
    if (existingUsers && existingUsers.length > 0) {
      authorId = existingUsers[0].user_id;
      console.log('Using existing user as author:', existingUsers[0].username);
    } else {
      // If no users exist, we'll insert with a placeholder that will be updated later
      console.log('No existing users found, using placeholder author ID');
      authorId = '00000000-0000-0000-0000-000000000000'; // placeholder
    }
    
    for (const post of qualityPosts) {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          ...post,
          author_id: authorId,
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error inserting post:', post.title, error);
      } else {
        console.log('Successfully inserted post:', post.title);
      }
    }
    
    console.log('Finished inserting quality blog posts');
  } catch (error) {
    console.error('Error:', error);
  }
}

insertQualityPosts();
