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

// Get all URLs for sitemap
export const getAllUrls = async (): Promise<string[]> => {
  const baseUrl = getBaseUrl();
  const urls = [baseUrl]; // Homepage
  
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts for URLs:', error);
      return urls;
    }

    // Add all post URLs
    posts?.forEach(post => {
      if (post.slug) {
        urls.push(`${baseUrl}/post/${post.slug}`);
      }
    });

    return urls;
  } catch (error) {
    console.error('Error generating URLs:', error);
    return urls;
  }
};

export const generateSitemap = async (): Promise<string> => {
  const baseUrl = getBaseUrl();
  
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts for sitemap:', error);
      return '';
    }

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    posts?.forEach(post => {
      if (post.slug) {
        const lastmod = post.updated_at || post.created_at;
        const formattedDate = new Date(lastmod).toISOString().split('T')[0];
        
        sitemap += `
  <url>
    <loc>${baseUrl}/post/${post.slug}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    });

    sitemap += `
</urlset>`;

    return sitemap;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return '';
  }
};

// Generate and return sitemap for admin utilities
export const updateSitemap = async (): Promise<string> => {
  const sitemap = await generateSitemap();
  console.log('Generated sitemap with', sitemap.split('<url>').length - 1, 'URLs');
  return sitemap;
};

export default generateSitemap;
