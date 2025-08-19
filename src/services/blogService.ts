import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blog';

// Transform database blog post to app BlogPost type
const transformDatabasePost = (dbPost: any): BlogPost => {
  console.log('🔄 Transforming post:', dbPost.title, dbPost.profiles);
  
  // Create a consistent numeric ID from UUID using hash
  const generateNumericId = (uuid: string): number => {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
      const char = uuid.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };
  
  return {
    id: generateNumericId(dbPost.id) || Math.floor(Math.random() * 1000000),
    slug: dbPost.slug || '', // Add slug field
    title: dbPost.title || '',
    excerpt: dbPost.excerpt || '',
    content: dbPost.content || '', // HTML content from rich text editor
    image: dbPost.featured_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    author: {
      name: dbPost.profiles?.display_name || dbPost.profiles?.username || 'Anonymous',
      avatar: dbPost.profiles?.avatar_url || '/placeholder.svg',
      bio: dbPost.profiles?.bio || 'Content creator and writer'
    },
    date: new Date(dbPost.published_at || dbPost.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    readTime: calculateReadTime(dbPost.content || ''),
    category: dbPost.category || 'General',
    tags: dbPost.tags || [],
    author_id: dbPost.author_id,
    author_username: dbPost.profiles?.username
  };
};

// Calculate estimated read time based on content
const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
};

// Generate URL-friendly slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim() // Remove leading/trailing whitespace
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Fetch published blog posts with author information
export const fetchBlogPosts = async (limit?: number): Promise<BlogPost[]> => {
  try {
    console.log('🔍 Fetching blog posts from database...');
    
    let query = supabase
      .from('blog_posts')
      .select(`
        id,
        slug,
        title,
        excerpt,
        content,
        featured_image,
        category,
        tags,
        published_at,
        created_at,
        author_id,
        status
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching blog posts:', error);
      throw error;
    }

    console.log('✅ Raw database response:', data);
    console.log('📊 Number of posts found:', data?.length || 0);
    
    // If we have posts, fetch author profiles separately
    if (data && data.length > 0) {
      const authorIds = [...new Set(data.map(post => post.author_id))];
      console.log('👥 Fetching profiles for author IDs:', authorIds);
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, bio')
        .in('user_id', authorIds);

      if (profileError) {
        console.warn('⚠️ Error fetching profiles:', profileError);
      }

      console.log('👤 Profiles found:', profiles?.length || 0);

      // Combine posts with author profiles
      const postsWithAuthors = data.map(post => ({
        ...post,
        profiles: profiles?.find(profile => profile.user_id === post.author_id) || null
      }));

      console.log('🔗 Posts with authors combined:', postsWithAuthors.length);
      console.log('📝 Sample post:', postsWithAuthors[0]);

      const transformedPosts = postsWithAuthors.map(post => {
        try {
          return transformDatabasePost(post);
        } catch (error) {
          console.error('❌ Error transforming post:', post.title, error);
          return null;
        }
      }).filter(Boolean);

      console.log('✨ Transformed posts:', transformedPosts.length);
      return transformedPosts;
    }

    return [];
  } catch (error) {
    console.error('💥 Blog service error:', error);
    throw error;
  }
};

// Fetch a single blog post by ID with original database ID (supports UUID, numeric IDs, and slugs)
export const fetchBlogPostWithDbId = async (id: string): Promise<{ post: BlogPost; dbId: string } | null> => {
  try {
    console.log('🔍 Fetching blog post with ID:', id);
    
    // Check if ID looks like a UUID (contains hyphens and is 36 chars)
    const isUUID = id.includes('-') && id.length === 36;
    // Check if ID is purely numeric
    const isNumeric = /^\d+$/.test(id);
    
    if (isUUID) {
      // Fetch by UUID (database ID)
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          category,
          tags,
          published_at,
          created_at,
          author_id,
          profiles:author_id (
            username,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error fetching blog post by UUID:', error);
        return null;
      }

      return data ? { post: transformDatabasePost(data), dbId: data.id } : null;
    } else if (!isNumeric) {
      // Treat as slug
      console.log('🔤 Searching by slug:', id);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          category,
          tags,
          published_at,
          created_at,
          author_id,
          profiles:author_id (
            username,
            display_name,
            avatar_url,
            bio
          )
        `)
        .eq('slug', id)
        .single();

      if (error) {
        console.error('❌ Error fetching blog post by slug:', error);
        return null;
      }

      return data ? { post: transformDatabasePost(data), dbId: data.id } : null;
    } else {
      // For numeric IDs, we need to fetch all posts and find by transformed ID
      console.log('🔢 Searching for numeric ID in database posts...');
      
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          category,
          tags,
          published_at,
          created_at,
          author_id
        `);

      if (error) {
        console.error('❌ Error fetching all posts for numeric search:', error);
        return null;
      }

      // Transform posts and find by numeric ID
      if (posts && posts.length > 0) {
        const authorIds = [...new Set(posts.map(post => post.author_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, avatar_url, bio')
          .in('user_id', authorIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        
        for (const post of posts) {
          const profile = profileMap.get(post.author_id);
          const transformedPost = transformDatabasePost({ ...post, profiles: profile });
          
          if (transformedPost.id === parseInt(id)) {
            console.log('✅ Found post by numeric ID:', transformedPost.title);
            return { post: transformedPost, dbId: post.id };
          }
        }
      }
      
      console.log('❌ No post found with numeric ID:', id);
      return null;
    }
  } catch (error) {
    console.error('❌ Blog service error:', error);
    return null;
  }
};

// Fetch a single blog post by slug (SEO-friendly URLs)
export const fetchBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    console.log('🔍 fetchBlogPostBySlug called with slug:', slug);
    console.log('🔍 Supabase client available:', !!supabase);
    
    // First get the blog post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select(`
        id,
        slug,
        title,
        excerpt,
        content,
        featured_image,
        category,
        tags,
        published_at,
        created_at,
        author_id,
        status
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (postError) {
      console.error('❌ Error fetching blog post by slug:', postError);
      return null;
    }

    // Then get the author profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url, bio')
      .eq('user_id', post.author_id)
      .single();

    if (profileError) {
      console.warn('⚠️ Error fetching author profile:', profileError);
    }

    const data = {
      ...post,
      profiles: profile
    };
    
    console.log('🔍 Supabase query result:', { data });

    if (!data) {
      console.log('📭 No blog post found with slug:', slug);
      return null;
    }

    console.log('✅ Blog post found:', data.title);
    return transformDatabasePost(data);
  } catch (error) {
    console.error('💥 Error in fetchBlogPostBySlug:', error);
    return null;
  }
};

// Fetch a single blog post by ID (supports both UUID and numeric IDs) - original function
export const fetchBlogPost = async (id: string): Promise<BlogPost | null> => {
  const result = await fetchBlogPostWithDbId(id);
  return result ? result.post : null;
};

// Fetch blog posts by category
export const fetchBlogPostsByCategory = async (category: string): Promise<BlogPost[]> => {
  try {
    console.log(`🔍 Fetching blog posts for category: "${category}"`);
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        excerpt,
        content,
        featured_image,
        category,
        tags,
        published_at,
        created_at,
        author_id
      `)
      .eq('status', 'published')
      .eq('category', category)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching blog posts by category:', error);
      throw error;
    }

    console.log(`✅ Found ${data?.length || 0} posts in category "${category}"`);

    // If we have posts, fetch author profiles separately
    if (data && data.length > 0) {
      const authorIds = [...new Set(data.map(post => post.author_id))];
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, bio')
        .in('user_id', authorIds);

      if (profileError) {
        console.warn('⚠️ Error fetching profiles:', profileError);
      }

      // Combine posts with author profiles
      const postsWithAuthors = data.map(post => ({
        ...post,
        profiles: profiles?.find(profile => profile.user_id === post.author_id) || null
      }));

      return postsWithAuthors.map(transformDatabasePost);
    }

    return [];
  } catch (error) {
    console.error('💥 Blog service error:', error);
    throw error;
  }
};

// Get unique categories from database
export const fetchCategories = async (): Promise<string[]> => {
  try {
    console.log('🔍 Fetching categories from database...');
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select('category')
      .eq('status', 'published')
      .not('category', 'is', null);

    if (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }

    console.log('📂 Raw categories data:', data);

    // Get unique categories and add 'All' at the beginning
    const uniqueCategories = Array.from(new Set(data?.map(item => item.category) || []));
    const categories = ['All', ...uniqueCategories.sort()];
    
    console.log('✅ Final categories:', categories);
    
    return categories;
  } catch (error) {
    console.error('💥 Categories fetch error:', error);
    return ['All']; // Fallback
  }
};

// Search blog posts
export const searchBlogPosts = async (searchTerm: string): Promise<BlogPost[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        excerpt,
        content,
        featured_image,
        category,
        tags,
        published_at,
        created_at,
        profiles:author_id (
          username,
          display_name,
          avatar_url,
          bio
        )
      `)
      .eq('status', 'published')
      .or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error searching blog posts:', error);
      throw error;
    }

    return (data || []).map(transformDatabasePost);
  } catch (error) {
    console.error('Blog service error:', error);
    throw error;
  }
};

// Create a new blog post
export const convertContentToBlocks = (content: string) => {
  // Split content by double newlines to separate paragraphs
  const paragraphs = content.split(/\n\n+/);
  
  return paragraphs.map(paragraph => {
    // Check if it's a heading (starts with # or ##)
    if (paragraph.trim().startsWith('# ')) {
      return {
        type: 'heading',
        content: {
          text: paragraph.trim().replace(/^# /, ''),
          level: 1
        }
      };
    } else if (paragraph.trim().startsWith('## ')) {
      return {
        type: 'heading',
        content: {
          text: paragraph.trim().replace(/^## /, ''),
          level: 2
        }
      };
    }
    // Check if it's a quote (starts with >)
    else if (paragraph.trim().startsWith('>')) {
      return {
        type: 'quote',
        content: {
          text: paragraph.trim().replace(/^> /, '')
        }
      };
    }
    // Check if it's a list (starts with - or *)
    else if (paragraph.trim().split('\n').every(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))) {
      return {
        type: 'list',
        content: paragraph.trim().split('\n').map(line => ({
          text: line.trim().replace(/^[-*] /, '')
        }))
      };
    }
    // Regular paragraph
    else {
      return {
        type: 'text',
        content: {
          text: paragraph.trim()
        }
      };
    }
  });
};

export const createBlogPost = async (postData: {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  status: 'draft' | 'published';
}): Promise<BlogPost | null> => {
  try {
    console.log('📝 Creating new blog post:', postData.title);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ User not authenticated:', userError);
      throw new Error('You must be logged in to create a post');
    }

    const now = new Date().toISOString();
    
    // Generate slug from title using the utility function
    const baseSlug = generateSlug(postData.title);
    let slug = baseSlug;
    
    // Check if slug already exists and make it unique
    let counter = 1;
    while (true) {
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (!existingPost) break; // Slug is unique
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: postData.title,
        slug: slug,
        content: postData.content,
        excerpt: postData.excerpt || postData.content.substring(0, 150).trim() + '...',
        category: postData.category,
        tags: postData.tags,
        featured_image: postData.featuredImage,
        status: postData.status,
        author_id: user.id,
        published_at: postData.status === 'published' ? now : null,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating blog post:', error);
      throw error;
    }

    console.log('✅ Blog post created successfully:', data.id);
    
    // Fetch the created post with author profile
    return await fetchBlogPost(data.id);
  } catch (error) {
    console.error('💥 Create post error:', error);
    throw error;
  }
};

// Update an existing blog post
export const updateBlogPost = async (
  postId: string,
  postData: {
    title?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    featured_image?: string;
    read_time?: number;
    status?: 'draft' | 'published';
    author_id?: string;
    id?: string;
  }
): Promise<BlogPost | null> => {
  try {
    console.log('📝 Updating blog post:', postId, postData);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ User not authenticated:', userError);
      throw new Error('You must be logged in to update a post');
    }

    // Prepare update data with correct field names for database
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (postData.title !== undefined) updateData.title = postData.title;
    if (postData.content !== undefined) {
      // Store the HTML content directly since we're using RichTextEditor
      updateData.content = postData.content;
      if (!postData.excerpt) {
        updateData.excerpt = postData.content.substring(0, 150).replace(/[#>*\-]/g, '').trim() + '...';
      }
    }
    if (postData.excerpt !== undefined) updateData.excerpt = postData.excerpt;
    if (postData.category !== undefined) updateData.category = postData.category;
    if (postData.tags !== undefined) updateData.tags = postData.tags;
    if (postData.featured_image !== undefined) updateData.featured_image = postData.featured_image;
    if (postData.status !== undefined) updateData.status = postData.status;

    // If publishing for the first time, set published_at
    if (postData.status === 'published') {
      updateData.published_at = new Date().toISOString();
    }

    console.log('📝 Sending update data to database:', updateData);

    // First, check if the post exists and get current post data
    const { data: currentPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching current post:', fetchError);
      throw new Error('Post not found');
    }

    // Check permissions: user must be author, have editor role, or be nanopro
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    const isAuthor = currentPost.author_id === user.id;
    const isEditor = userRole?.role === 'editor';
    const isNanopro = userProfile?.username === 'nanopro';

    if (!isAuthor && !isEditor && !isNanopro) {
      throw new Error('You do not have permission to edit this post');
    }

    console.log('✅ Permission check passed. Updating post...');

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating blog post:', error);
      throw error;
    }

    console.log('✅ Blog post updated successfully:', data.id);
    
    // Fetch the updated post with author profile
    return await fetchBlogPost(data.id);
  } catch (error) {
    console.error('💥 Update post error:', error);
    throw error;
  }
};

// Delete a blog post
export const deleteBlogPost = async (postId: string): Promise<boolean> => {
  try {
    console.log('🗑️ Deleting blog post:', postId);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ User not authenticated:', userError);
      throw new Error('You must be logged in to delete a post');
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', user.id); // Ensure user can only delete their own posts

    if (error) {
      console.error('❌ Error deleting blog post:', error);
      throw error;
    }

    console.log('✅ Blog post deleted successfully');
    return true;
  } catch (error) {
    console.error('💥 Delete post error:', error);
    throw error;
  }
};

// Fetch blog posts by tag
export const fetchBlogPostsByTag = async (tag: string): Promise<BlogPost[]> => {
  try {
    console.log('🏷️ Fetching blog posts with tag:', tag);
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        id,
        slug,
        title,
        excerpt,
        content,
        featured_image,
        category,
        tags,
        published_at,
        created_at,
        author_id,
        status,
        profiles!blog_posts_author_id_fkey (
          username,
          display_name,
          avatar_url,
          bio
        )
      `)
      .eq('status', 'published')
      .contains('tags', [tag])
      .order('published_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching posts by tag:', error);
      throw error;
    }

    console.log('✅ Found posts with tag:', data?.length || 0);
    
    return data?.map(transformDatabasePost) || [];
  } catch (error) {
    console.error('💥 Fetch posts by tag error:', error);
    throw error;
  }
};
