import { supabase } from '@/integrations/supabase/client';

// Get the production base URL
const getBaseUrl = (): string => {
  // In production, use your actual domain
  if (import.meta.env.PROD) {
    return 'https://wecandotoo.com';
  }
  // In development, use localhost
  return window.location.origin;
};

// Escape XML special characters
const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Clean HTML content for RSS (remove HTML tags or keep basic ones)
const cleanContentForRss = (html: string, includeFullContent: boolean = false): string => {
  if (!html) return '';
  
  if (includeFullContent) {
    // Keep basic HTML tags for full content
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .trim();
  } else {
    // Create excerpt by removing all HTML tags
    const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return textContent.length > 300 ? textContent.substring(0, 300) + '...' : textContent;
  }
};

// Format date for RSS (RFC 822 format)
const formatRssDate = (date: string): string => {
  return new Date(date).toUTCString();
};

export interface RssOptions {
  includeFullContent?: boolean;
  maxItems?: number;
  title?: string;
  description?: string;
}

export const generateRssFeed = async (options: RssOptions = {}): Promise<string> => {
  const {
    includeFullContent = false,
    maxItems = 20,
    title = 'WeCanDoToo.com Blog',
    description = 'Latest blog posts from WeCanDoToo.com - Web development, technology, and career insights'
  } = options;

  const baseUrl = getBaseUrl();
  
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        slug,
        title,
        excerpt,
        content,
        category,
        featured_image,
        published_at,
        created_at,
        updated_at,
        profiles:author_id (
          username,
          display_name
        )
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(maxItems);

    if (error) {
      console.error('Error fetching posts for RSS:', error);
      return '';
    }

    const now = new Date().toUTCString();
    
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <pubDate>${now}</pubDate>
    <ttl>60</ttl>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>Custom RSS Generator</generator>
    <webMaster>admin@wecandotoo.com (WeCanDoToo Admin)</webMaster>
    <managingEditor>admin@wecandotoo.com (WeCanDoToo Editorial)</managingEditor>
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>${escapeXml(title)}</title>
      <link>${baseUrl}</link>
      <width>32</width>
      <height>32</height>
    </image>`;

    posts?.forEach(post => {
      if (post.slug) {
        const postUrl = `${baseUrl}/post/${post.slug}`;
        const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
        const author = profile?.display_name || profile?.username || 'WeCanDoToo Team';
        const pubDate = formatRssDate(post.published_at || post.created_at);
        const content = cleanContentForRss(post.content || post.excerpt || '', includeFullContent);
        const excerpt = post.excerpt || cleanContentForRss(post.content || '', false);
        
        rss += `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(excerpt)}</description>
      ${includeFullContent ? `<content:encoded><![CDATA[${content}]]></content:encoded>` : ''}
      <pubDate>${pubDate}</pubDate>
      <author>admin@wecandotoo.com (${escapeXml(author)})</author>
      <category>${escapeXml(post.category || 'General')}</category>
      ${post.featured_image ? `<enclosure url="${post.featured_image}" type="image/jpeg"/>` : ''}
    </item>`;
      }
    });

    rss += `
  </channel>
</rss>`;

    return rss;
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return '';
  }
};

// Generate RSS feed for admin utilities
export const updateRssFeed = async (options: RssOptions = {}): Promise<string> => {
  const rss = await generateRssFeed(options);
  console.log('Generated RSS feed with', rss.split('<item>').length - 1, 'items');
  return rss;
};

export default generateRssFeed;
