-- Sample Blog Post for Testing
-- Run this in your Supabase SQL Editor to create a test post

-- First, ensure we have a profile for the author (using nanopro as admin)
INSERT INTO profiles (id, user_id, username, display_name, bio)
SELECT 
  gen_random_uuid(),
  auth.users.id,
  'nanopro',
  'Nano Pro',
  'Blog administrator and content creator'
FROM auth.users 
WHERE auth.users.email LIKE '%nanopro%'
ON CONFLICT (user_id) DO NOTHING;

-- Create a sample blog post
INSERT INTO blog_posts (
  id,
  title,
  slug,
  excerpt,
  content,
  category,
  featured_image,
  author_id,
  status,
  published_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Welcome to Your New Blog!',
  'welcome-to-your-new-blog',
  'Discover the power of dynamic content management with our modern blog platform. Create, edit, and manage your content with ease.',
  '# Welcome to Your New Blog!

## Getting Started

Congratulations! You''ve successfully set up your dynamic blog platform. This post demonstrates how your content management system works.

## Features

### ✅ **Dynamic Content**
All posts are stored in the database and managed through the admin interface.

### ✅ **SEO-Friendly URLs**
Notice how this post has a clean URL: `/welcome-to-your-new-blog`

### ✅ **Admin Management**
Visit `/admin` to manage all your content through a beautiful interface.

## What''s Next?

1. **Create More Content**: Use the "Write" page to create new posts
2. **Manage Posts**: Visit the admin panel to edit, publish, or delete posts
3. **Customize**: Modify categories and add your own content

## Admin Features

- ✏️ **Edit Posts**: Click edit on any post to modify it
- 📊 **View Statistics**: See post counts and user metrics
- 🗑️ **Delete Content**: Safely remove posts with confirmation
- 👥 **User Management**: Control user roles and permissions

---

*This is your first blog post! You can edit or delete it from the admin panel.*',
  'Technology',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  (SELECT auth.users.id FROM auth.users WHERE auth.users.email LIKE '%nanopro%' LIMIT 1),
  'published',
  NOW(),
  NOW(),
  NOW()
);

-- Create a second sample post
INSERT INTO blog_posts (
  id,
  title,
  slug,
  excerpt,
  content,
  category,
  featured_image,
  author_id,
  status,
  published_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'How to Create Amazing Content',
  'how-to-create-amazing-content',
  'Learn the secrets of creating engaging blog content that resonates with your audience and drives meaningful engagement.',
  '# How to Create Amazing Content

Creating compelling blog content is both an art and a science. Here are some proven strategies to help you craft posts that engage and inspire your readers.

## Know Your Audience

Understanding your audience is the foundation of great content. Consider:

- **Demographics**: Age, location, interests
- **Pain Points**: What challenges do they face?
- **Goals**: What are they trying to achieve?

## Content Structure

### 1. **Compelling Headlines**
Your headline is the first impression. Make it:
- Clear and specific
- Benefit-focused
- Emotionally engaging

### 2. **Strong Openings**
Hook your readers immediately with:
- A surprising statistic
- A thought-provoking question
- A relatable story

### 3. **Valuable Body Content**
Deliver on your headline promise:
- Use subheadings for easy scanning
- Include actionable tips
- Support points with examples

## SEO Best Practices

- **Keywords**: Use relevant keywords naturally
- **Meta Descriptions**: Write compelling excerpts
- **Internal Links**: Connect related content
- **Images**: Use descriptive alt text

## Engagement Tips

### Visual Elements
- Use high-quality images
- Add infographics and charts
- Include videos when relevant

### Interactive Content
- Ask questions in your posts
- Encourage comments
- Create polls and surveys

## Conclusion

Great content combines valuable information with engaging presentation. Focus on serving your audience, and success will follow.

---

*Ready to create your own amazing content? Head to the admin panel and start writing!*',
  'Business',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  (SELECT auth.users.id FROM auth.users WHERE auth.users.email LIKE '%nanopro%' LIMIT 1),
  'published',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);
