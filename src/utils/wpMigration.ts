// WordPress Content Migration Utility
import { supabase } from '@/integrations/supabase/client';

interface WordPressPost {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  slug: string;
  date: string;
  modified: string;
  status: string;
  featured_media: number;
  categories: number[];
  tags: number[];
  author: number;
}

interface WordPressMedia {
  id: number;
  source_url: string;
  alt_text: string;
  title: {
    rendered: string;
  };
}

interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
}

interface WordPressTag {
  id: number;
  name: string;
  slug: string;
}

class WordPressMigration {
  private wpSiteUrl: string;
  private authorId: string;

  constructor(wpSiteUrl: string, authorId: string) {
    this.wpSiteUrl = wpSiteUrl.replace(/\/$/, ''); // Remove trailing slash
    this.authorId = authorId;
  }

  // Fetch posts from WordPress REST API
  async fetchWordPressPosts(page: number = 1, perPage: number = 100): Promise<WordPressPost[]> {
    try {
      const response = await fetch(
        `${this.wpSiteUrl}/wp-json/wp/v2/posts?page=${page}&per_page=${perPage}&status=publish`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching WordPress posts:', error);
      throw error;
    }
  }

  // Fetch categories from WordPress
  async fetchWordPressCategories(): Promise<WordPressCategory[]> {
    try {
      const response = await fetch(`${this.wpSiteUrl}/wp-json/wp/v2/categories?per_page=100`);
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching WordPress categories:', error);
      return [];
    }
  }

  // Fetch tags from WordPress
  async fetchWordPressTags(): Promise<WordPressTag[]> {
    try {
      const response = await fetch(`${this.wpSiteUrl}/wp-json/wp/v2/tags?per_page=100`);
      if (!response.ok) throw new Error(`Failed to fetch tags: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching WordPress tags:', error);
      return [];
    }
  }

  // Fetch featured image
  async fetchFeaturedImage(mediaId: number): Promise<string | null> {
    try {
      if (!mediaId) return null;
      
      const response = await fetch(`${this.wpSiteUrl}/wp-json/wp/v2/media/${mediaId}`);
      if (!response.ok) return null;
      
      const media: WordPressMedia = await response.json();
      return media.source_url;
    } catch (error) {
      console.error('Error fetching featured image:', error);
      return null;
    }
  }

  // Clean HTML content while preserving important formatting
  cleanContent(htmlContent: string): string {
    // Remove WordPress-specific shortcodes and problematic elements
    let cleaned = htmlContent
      .replace(/\[.*?\]/g, '') // Remove shortcodes
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove objects
      .replace(/<embed\b[^>]*>/gi, '') // Remove embeds
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '') // Remove forms
      .replace(/<input\b[^>]*>/gi, '') // Remove inputs
      .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '') // Remove buttons
      
      // Clean up WordPress-specific classes and attributes while preserving the tags
      .replace(/\s+class="[^"]*"/gi, '') // Remove class attributes
      .replace(/\s+id="[^"]*"/gi, '') // Remove id attributes
      .replace(/\s+style="[^"]*"/gi, '') // Remove inline styles
      .replace(/\s+data-[^=]*="[^"]*"/gi, '') // Remove data attributes
      .replace(/\s+onclick="[^"]*"/gi, '') // Remove onclick handlers
      .replace(/\s+onload="[^"]*"/gi, '') // Remove onload handlers
      
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#8217;/g, "'") // Replace smart quotes
      .replace(/&#8220;/g, '"') // Replace smart quotes
      .replace(/&#8221;/g, '"') // Replace smart quotes
      .replace(/&#8211;/g, '–') // Replace en dash
      .replace(/&#8212;/g, '—') // Replace em dash
      .replace(/&#8230;/g, '…') // Replace ellipsis
      
      // Clean up excessive whitespace and newlines
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace triple+ newlines with double
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();

    return cleaned;
  }

  // Generate slug from title
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }

  // Migrate a single post
  async migratePost(
    wpPost: WordPressPost, 
    categories: WordPressCategory[], 
    tags: WordPressTag[]
  ): Promise<boolean> {
    try {
      // Get category name
      const category = categories.find(cat => wpPost.categories.includes(cat.id))?.name || 'Uncategorized';
      
      // Get tag names
      const postTags = tags.filter(tag => wpPost.tags.includes(tag.id)).map(tag => tag.name);
      
      // Get featured image
      const featuredImage = await this.fetchFeaturedImage(wpPost.featured_media);
      
      // Clean content
      const cleanContent = this.cleanContent(wpPost.content.rendered);
      const cleanExcerpt = this.cleanContent(wpPost.excerpt.rendered);
      
      // Create blog post data
      const blogPostData = {
        title: wpPost.title.rendered,
        content: cleanContent,
        excerpt: cleanExcerpt || cleanContent.substring(0, 200) + '...',
        slug: wpPost.slug || this.generateSlug(wpPost.title.rendered),
        featured_image: featuredImage,
        author_id: this.authorId,
        category: category,
        tags: postTags,
        status: 'published',
        published_at: wpPost.date,
        created_at: wpPost.date,
        updated_at: wpPost.modified
      };

      // Insert into Supabase
      const { error } = await supabase
        .from('blog_posts')
        .insert(blogPostData);

      if (error) {
        console.error('Error inserting post:', wpPost.title.rendered, error);
        return false;
      }

      console.log('Successfully migrated:', wpPost.title.rendered);
      return true;
    } catch (error) {
      console.error('Error migrating post:', wpPost.title.rendered, error);
      return false;
    }
  }

  // Main migration function
  async migrateAllPosts(): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;
    let page = 1;
    
    try {
      // Fetch categories and tags first
      console.log('Fetching WordPress categories and tags...');
      const [categories, tags] = await Promise.all([
        this.fetchWordPressCategories(),
        this.fetchWordPressTags()
      ]);

      console.log(`Found ${categories.length} categories and ${tags.length} tags`);

      // Fetch and migrate posts page by page
      while (true) {
        console.log(`Fetching page ${page}...`);
        const posts = await this.fetchWordPressPosts(page, 10); // Smaller batches
        
        if (posts.length === 0) break;

        console.log(`Processing ${posts.length} posts from page ${page}...`);
        
        // Process posts one by one to avoid overwhelming the API
        for (const post of posts) {
          const result = await this.migratePost(post, categories, tags);
          if (result) {
            success++;
          } else {
            failed++;
          }
          
          // Small delay to be nice to the APIs
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        page++;
      }

      console.log(`Migration completed! Success: ${success}, Failed: ${failed}`);
      return { success, failed };
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
}

export default WordPressMigration;
