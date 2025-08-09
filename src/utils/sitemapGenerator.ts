import { supabase } from "@/integrations/supabase/client";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = async (baseUrl: string): Promise<string> => {
  const urls: SitemapUrl[] = [
    // Static pages
    {
      loc: baseUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${baseUrl}/about`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/contact`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.7
    },
    {
      loc: `${baseUrl}/write`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.6
    },
    {
      loc: `${baseUrl}/google-services`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.5
    }
  ];

  try {
    // Fetch published blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, slug, updated_at, created_at')
      .eq('published', true)
      .order('updated_at', { ascending: false });

    if (!error && posts) {
      // Add blog posts to sitemap
      posts.forEach(post => {
        const postUrl = post.slug ? `${baseUrl}/${post.slug}` : `${baseUrl}/post/${post.id}`;
        urls.push({
          loc: postUrl,
          lastmod: post.updated_at || post.created_at,
          changefreq: 'weekly',
          priority: 0.9
        });
      });
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  // Generate XML
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

  const xmlUrls = urls.map(url => {
    let urlXml = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>`;
    
    if (url.lastmod) {
      urlXml += `\n    <lastmod>${new Date(url.lastmod).toISOString()}</lastmod>`;
    }
    
    if (url.changefreq) {
      urlXml += `\n    <changefreq>${url.changefreq}</changefreq>`;
    }
    
    if (url.priority !== undefined) {
      urlXml += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
    }
    
    urlXml += '\n  </url>';
    return urlXml;
  }).join('\n');

  const xmlFooter = '\n</urlset>';

  return xmlHeader + '\n' + xmlUrls + xmlFooter;
};

const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const submitSitemapToSearchConsole = async (siteUrl: string, sitemapUrl: string) => {
  try {
    const response = await fetch('/api/submit-sitemap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteUrl,
        sitemapUrl
      })
    });

    if (!response.ok) {
      throw new Error('Failed to submit sitemap');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting sitemap to Search Console:', error);
    throw error;
  }
};