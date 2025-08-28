import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blog';

// Helper function to format error objects for better logging
const formatError = (error: any, context: string = '') => {
  const prefix = context ? `[${context}] ` : '';
  console.error(`${prefix}❌ Error occurred:`);
  console.error(`${prefix}🔍 Full error object:`, JSON.stringify(error, null, 2));
  console.error(`${prefix}🔍 Error message:`, error?.message || 'No message');
  console.error(`${prefix}🔍 Error code:`, error?.code || 'No code');
  console.error(`${prefix}🔍 Error details:`, error?.details || 'No details');
  console.error(`${prefix}🔍 Error hint:`, error?.hint || 'No hint');
  if (error?.stack) {
    console.error(`${prefix}🔍 Error stack:`, error.stack);
  }
};

// Safely ensure a value is an array of strings
const ensureStringArray = (value: any): string[] => {
  if (!value) return [];
  
  // If it's already a proper array
  if (Array.isArray(value)) return value.filter(item => typeof item === 'string' && item.trim().length > 0);
  
  if (typeof value === 'string') {
    // Check if it's a JSON string representation like '["tag1","tag2"]'
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string' && item.trim().length > 0) : [value];
      } catch {
        console.error('🚨 Failed to parse JSON array string:', value);
        return [value];
      }
    }
    
    // Check if it's PostgreSQL array format like '{"tag1","tag2"}'
    if (value.startsWith('{') && value.endsWith('}')) {
      try {
        // Convert PostgreSQL format to JSON format and parse
        const jsonFormat = value.replace(/^\{/, '[').replace(/\}$/, ']');
        const parsed = JSON.parse(jsonFormat);
        return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string' && item.trim().length > 0) : [value];
      } catch {
        console.error('🚨 Failed to parse PostgreSQL array string:', value);
        return [value];
      }
    }
    
    // Single string tag
    return value.trim().length > 0 ? [value] : [];
  }
  
  console.warn('⚠️ Unexpected tag format, returning empty array:', value, typeof value);
  return [];
};

// Convert JavaScript array to PostgreSQL array format
const convertToPostgreSQLArray = (tags: string[]): string => {
  if (!tags || tags.length === 0) return '{}';
  
  // Escape quotes and create PostgreSQL array format
  const escapedTags = tags.map(tag => `"${tag.replace(/"/g, '\\"')}"`);
  const pgArray = `{${escapedTags.join(',')}}`;
  
  console.log('🔄 Converting tags to PostgreSQL format:', tags, '->', pgArray);
  return pgArray;
};

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
    tags: ensureStringArray(dbPost.tags),
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
export const fetchBlogPosts = async (limit: number = 20): Promise<BlogPost[]> => {
  try {
    console.log('🔍 Fetching blog posts from database with limit:', limit);
    
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
      .order('published_at', { ascending: false })
      .limit(limit); // Always apply a limit

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

      console.log('✅ Raw database data for editing:', data);
      console.log('🔍 Raw tags from database:', data?.tags, 'Type:', typeof data?.tags);
      
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
    
    // EMERGENCY CONTENT SIZE CHECK
    if (postData.content && postData.content.length > 100000) { // 100KB absolute limit
      console.error('🚨🚨🚨 EMERGENCY: Content too large for create:', postData.content.length);
      throw new Error(`Content too large: ${postData.content.length} characters. Maximum allowed: 100,000 characters.`);
    }
    
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
    
    // Process tags more aggressively to prevent PostgreSQL array errors
    const processedTags = ensureStringArray(postData.tags);
    console.log('🔍 Pre-insert debug - tags processing:', {
      originalTags: postData.tags,
      processedTags: processedTags,
      tagsType: typeof processedTags,
      isArray: Array.isArray(processedTags),
      stringified: JSON.stringify(processedTags)
    });

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: postData.title,
        slug: slug,
        content: postData.content.substring(0, 100000), // Hard truncate for safety
        excerpt: postData.excerpt || postData.content.substring(0, 150).trim() + '...',
        category: postData.category,
        tags: processedTags, // Use the processed tags variable
        featured_image: postData.featuredImage,
        status: postData.status,
        author_id: user.id,
        published_at: postData.status === 'published' ? now : null,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    console.log('🔍 Pre-insert debug - tags format:', {
      originalTags: postData.tags,
      processedTags: ensureStringArray(postData.tags),
      tagsType: typeof ensureStringArray(postData.tags),
      isArray: Array.isArray(ensureStringArray(postData.tags))
    });

    if (error) {
      formatError(error, 'createBlogPost - Supabase insert');
      throw error;
    }

    console.log('✅ Blog post created successfully:', data.id);
    
    // Fetch the created post with author profile
    return await fetchBlogPost(data.id);
  } catch (error) {
    formatError(error, 'createBlogPost - Main catch');
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
    // SEO fields
    seo_title?: string;
    meta_description?: string;
    focus_keyword?: string;
    slug?: string;
    canonical_url?: string;
  }
): Promise<BlogPost | null> => {
  try {
    console.log('📝 Updating blog post:', postId, postData);
    
    // EMERGENCY: Super aggressive content size check
    if (postData.content && postData.content.length > 50000) { // 50KB limit - very aggressive
      console.error('🚨🚨🚨 EMERGENCY: Content too large!', postData.content.length, 'characters');
      console.error('🚨 Content limit: ' + postData.content.length);
      throw new Error(`EMERGENCY: Content is too large (${Math.round(postData.content.length / 1024)}KB). Maximum allowed: 50KB. Please use shorter content.`);
    }
    
    // Check total data size with aggressive limit
    const totalDataSize = JSON.stringify(postData).length;
    if (totalDataSize > 100000) { // 100KB total data limit
      console.error('🚨🚨🚨 EMERGENCY: Total post data too large!', totalDataSize, 'characters');
      console.error('🚨 Content limit: ' + totalDataSize);
      throw new Error(`EMERGENCY: Post data is too large (${Math.round(totalDataSize / 1024)}KB). Maximum allowed: 100KB.`);
    }
    
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
      // Log content size for debugging
      console.log('📊 Content size:', postData.content.length, 'characters');
      console.log('📊 Content preview (first 200 chars):', postData.content.substring(0, 200));
      
      // Check for extremely large content (over 1MB)
      if (postData.content.length > 1024 * 1024) {
        console.warn('⚠️ Content is very large:', postData.content.length, 'characters (~', Math.round(postData.content.length / 1024 / 1024), 'MB)');
        throw new Error(`Content is too large (${Math.round(postData.content.length / 1024 / 1024)}MB). Please reduce content size.`);
      }
      
      // Store the HTML content directly since we're using RichTextEditor
      updateData.content = postData.content;
      if (!postData.excerpt) {
        updateData.excerpt = postData.content.substring(0, 150).replace(/[#>*\-]/g, '').trim() + '...';
      }
    }
    if (postData.excerpt !== undefined) updateData.excerpt = postData.excerpt;
    if (postData.category !== undefined) updateData.category = postData.category;
    if (postData.tags !== undefined) {
      console.log('📊 Tags being sent:', postData.tags, 'Type:', typeof postData.tags, 'Array?', Array.isArray(postData.tags));
      
      // EMERGENCY FIX: If tags are problematic, skip them for now
      let processedTags = ensureStringArray(postData.tags);
      console.log('📊 Processed tags:', processedTags);
      
      // Check if processed tags are safe
      try {
        // Test if this would cause JSON stringify issues
        const testJson = JSON.stringify(processedTags);
        console.log('📊 Tags JSON test:', testJson);
        
        // If we reach here, tags are safe
        updateData.tags = processedTags;
      } catch (error) {
        console.error('🚨 Tags JSON stringify failed, skipping tags:', error);
        // Don't update tags if they're problematic
      }
    }
    if (postData.featured_image !== undefined) updateData.featured_image = postData.featured_image;
    if (postData.status !== undefined) updateData.status = postData.status;
    
    // SEO fields - Currently not available in database schema
    // TODO: Add SEO columns to blog_posts table in database
    // if (postData.seo_title !== undefined) updateData.seo_title = postData.seo_title;
    // if (postData.meta_description !== undefined) updateData.meta_description = postData.meta_description;
    // if (postData.focus_keyword !== undefined) updateData.focus_keyword = postData.focus_keyword;
    if (postData.slug !== undefined) updateData.slug = postData.slug; // slug exists in schema
    // if (postData.canonical_url !== undefined) updateData.canonical_url = postData.canonical_url;

    // If publishing for the first time, set published_at
    if (postData.status === 'published') {
      updateData.published_at = new Date().toISOString();
    }

    console.log('📝 Sending update data to database:', updateData);

    // Final safety check for tags before database operation
    if (updateData.tags && !Array.isArray(updateData.tags)) {
      console.error('🚨 CRITICAL: Tags not array at database level!', updateData.tags, typeof updateData.tags);
      updateData.tags = ensureStringArray(updateData.tags);
      console.log('🔧 Fixed tags:', updateData.tags);
    }

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
    console.log('🔧 BEFORE final check - updateData:', JSON.stringify(updateData, null, 2));

    // BULLETPROOF: Ensure tags are sent as a proper PostgreSQL array
    if ('tags' in updateData) {
      console.log('🔧 Final tags check before database:', updateData.tags, typeof updateData.tags);
      console.log('🔧 Is array?', Array.isArray(updateData.tags));
      console.log('🔧 String representation:', String(updateData.tags));
      
      // EMERGENCY APPROACH: Only allow simple array or remove tags entirely
      if (Array.isArray(updateData.tags)) {
        // Ensure all elements are simple strings
        updateData.tags = updateData.tags
          .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
          .map(tag => tag.trim());
        console.log('🎯 Cleaned array tags:', updateData.tags);
      } else {
        console.error('🚨 REMOVING TAGS - not a proper array:', updateData.tags);
        delete updateData.tags; // Remove tags entirely if problematic
      }
      
      console.log('🎯 FINAL tags being sent to database:', updateData.tags);
    } else {
      console.log('ℹ️ No tags field in updateData');
    }

    console.log('🔧 AFTER final check - updateData:', JSON.stringify(updateData, null, 2));

    // EMERGENCY WORKAROUND: Try update without tags first if tags are problematic
    let updateDataToSend = { ...updateData };
    
    console.log('🚨 DEBUGGING: About to send request to Supabase');
    console.log('🚨 Post ID:', postId);
    console.log('🚨 Update data keys:', Object.keys(updateDataToSend));
    console.log('🚨 Update data sizes:', Object.entries(updateDataToSend).map(([key, value]) => [
      key, 
      typeof value === 'string' ? `${value.length} chars` : 
      Array.isArray(value) ? `${value.length} items` : 
      typeof value
    ]));
    
    // Check each field for potential issues
    for (const [key, value] of Object.entries(updateDataToSend)) {
      if (typeof value === 'string' && value.length > 100000) {
        console.error(`🚨 Field ${key} is very large:`, value.length, 'characters');
        console.error(`🚨 ${key} preview:`, value.substring(0, 200));
      }
      if (Array.isArray(value)) {
        console.log(`🚨 Array field ${key}:`, value, 'Type of first item:', typeof value[0]);
      }
    }
    
    // Test JSON serialization
    try {
      const jsonTest = JSON.stringify(updateDataToSend);
      console.log('🚨 JSON serialization test passed, size:', jsonTest.length);
      if (jsonTest.length > 1000000) {
        console.error('🚨 JSON is too large!', jsonTest.length);
        throw new Error(`Serialized data too large: ${Math.round(jsonTest.length / 1024 / 1024)}MB`);
      }
    } catch (error) {
      console.error('🚨 JSON serialization failed:', error);
      throw new Error('Data cannot be serialized to JSON: ' + error.message);
    }
    
    // If tags exist and might be problematic, try without them first
    if ('tags' in updateDataToSend && updateDataToSend.tags) {
      const originalTags = updateDataToSend.tags;
      try {
        // Test the update with tags
        console.log('🧪 Testing update with tags...');
        
        const { data, error } = await supabase
          .from('blog_posts')
          .update(updateDataToSend)
          .eq('id', postId)
          .select()
          .single();

        if (error) {
          console.error('🚨 Error with tags:', error);
          
          if (error.message?.includes('malformed array literal') || error.code === '22P02') {
            console.error('🚨 Tags causing array error, trying without tags...');
            delete updateDataToSend.tags;
            
            const { data: dataWithoutTags, error: errorWithoutTags } = await supabase
              .from('blog_posts')
              .update(updateDataToSend)
              .eq('id', postId)
              .select()
              .single();
              
            if (errorWithoutTags) {
              console.error('❌ Error even without tags:', errorWithoutTags);
              
              // LAST RESORT: Try with only essential fields
              console.log('🚨 Trying with minimal data...');
              const minimalData = {
                title: updateDataToSend.title,
                content: updateDataToSend.content?.substring(0, 50000) || '', // Truncate content if too large
                updated_at: updateDataToSend.updated_at
              };
              
              const { data: minimalResult, error: minimalError } = await supabase
                .from('blog_posts')
                .update(minimalData)
                .eq('id', postId)
                .select()
                .single();
                
              if (minimalError) {
                console.error('❌ Even minimal update failed:', minimalError);
                throw minimalError;
              }
              
              console.log('⚠️ Post updated with minimal data only');
              return await fetchBlogPost(minimalResult.id);
            }
            
            console.log('⚠️ Post updated successfully WITHOUT tags. Tags were:', originalTags);
            return await fetchBlogPost(dataWithoutTags.id);
          } else {
            throw error;
          }
        }

        console.log('✅ Blog post updated successfully with tags:', data.id);
        return await fetchBlogPost(data.id);
        
      } catch (error) {
        console.error('❌ Error updating blog post:');
        console.error('🔍 Update error details:', JSON.stringify(error, null, 2));
        console.error('🔍 Update error message:', error.message || 'No message');
        console.error('🔍 Update error code:', error.code || 'No code');
        console.error('🔍 Update error details field:', error.details || 'No details');
        throw error;
      }
    } else {
      // No tags, proceed normally
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updateDataToSend)
        .eq('id', postId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating blog post:');
        console.error('🔍 No-tags update error details:', JSON.stringify(error, null, 2));
        console.error('🔍 No-tags update error message:', error.message || 'No message');
        console.error('🔍 No-tags update error code:', error.code || 'No code');
        console.error('🔍 No-tags update error details field:', error.details || 'No details');
        throw error;
      }

      console.log('✅ Blog post updated successfully:', data.id);
      return await fetchBlogPost(data.id);
    }
  } catch (error) {
    console.error('💥 Update post error:');
    console.error('🔍 Final catch error details:', JSON.stringify(error, null, 2));
    console.error('🔍 Final catch error message:', error.message || 'No message');
    console.error('🔍 Final catch error code:', error.code || 'No code');
    console.error('🔍 Final catch error stack:', error.stack || 'No stack');
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
