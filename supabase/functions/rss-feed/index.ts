import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  const { url, method } = req

  // Handle CORS
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the request URL to determine the base URL
    const requestUrl = new URL(url)
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`

    // Fetch blog posts
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
      .limit(20)

    if (error) {
      console.error('Error fetching posts for RSS:', error)
      return new Response('Error fetching posts', { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    const now = new Date().toUTCString()
    const title = 'WeCanDoToo.com Blog'
    const description = 'Latest blog posts from WeCanDoToo.com - Web development, technology, and career insights'
    
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>https://wecandotoo.com</link>
    <description>${escapeXml(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <pubDate>${now}</pubDate>
    <ttl>60</ttl>
    <atom:link href="https://wecandotoo.com/sitemap.rss" rel="self" type="application/rss+xml"/>
    <generator>Custom RSS Generator</generator>
    <webMaster>admin@wecandotoo.com (WeCanDoToo Admin)</webMaster>
    <managingEditor>admin@wecandotoo.com (WeCanDoToo Editorial)</managingEditor>
    <image>
      <url>https://wecandotoo.com/favicon.ico</url>
      <title>${escapeXml(title)}</title>
      <link>https://wecandotoo.com</link>
      <width>32</width>
      <height>32</height>
    </image>`

    posts?.forEach(post => {
      if (post.slug) {
        const postUrl = `https://wecandotoo.com/${post.slug}`
        const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
        const author = profile?.display_name || profile?.username || 'WeCanDoToo Team'
        const pubDate = formatRssDate(post.published_at || post.created_at)
        const content = cleanContentForRss(post.content || post.excerpt || '', false)
        const excerpt = post.excerpt || cleanContentForRss(post.content || '', false)
        
        rss += `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>admin@wecandotoo.com (${escapeXml(author)})</author>
      <category>${escapeXml(post.category || 'General')}</category>
      ${post.featured_image ? `<enclosure url="${post.featured_image}" type="image/jpeg"/>` : ''}
    </item>`
      }
    })

    rss += `
  </channel>
</rss>`

    return new Response(rss, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })

  } catch (error) {
    console.error('Error in RSS function:', error)
    return new Response('Internal Server Error', { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    })
  }
})
