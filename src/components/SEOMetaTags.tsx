import { useEffect } from 'react';
import { BlogPost } from '@/types/blog';

interface SEOMetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  post?: BlogPost;
  type?: 'website' | 'article';
}

const SEOMetaTags: React.FC<SEOMetaTagsProps> = ({
  title = "wecandotoo - Discover Amazing Stories",
  description = "A modern blog platform for sharing knowledge and connecting with like-minded readers.",
  image = "/android-chrome-512x512.png",
  url = "https://wecandotoo.com",
  post,
  type = 'website'
}) => {
  useEffect(() => {
    const baseUrl = 'https://wecandotoo.com';
    
    // If post is provided, use post data
    if (post) {
      title = post.title;
      description = post.excerpt;
      image = post.image;
      url = `${baseUrl}/${post.slug}`;
      type = 'article';
    }

    // Update document title
    document.title = title;

    // Helper function to update meta tag
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('author', post?.author.name || 'wecandotoo');
    
    // Canonical URL
    updateMetaTag('canonical', url);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // RSS feed link
    let rssLink = document.querySelector('link[rel="alternate"][type="application/rss+xml"]') as HTMLLinkElement;
    if (!rssLink) {
      rssLink = document.createElement('link');
      rssLink.rel = 'alternate';
      rssLink.type = 'application/rss+xml';
      rssLink.title = 'RSS Feed';
      document.head.appendChild(rssLink);
    }
    rssLink.href = `${baseUrl}/feed.xml`;

    // Open Graph meta tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:image', image.startsWith('http') ? image : `${baseUrl}${image}`, true);
    updateMetaTag('og:site_name', 'wecandotoo', true);
    
    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@wecandotoo');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image.startsWith('http') ? image : `${baseUrl}${image}`);

    // Article-specific meta tags
    if (post && type === 'article') {
      updateMetaTag('article:author', post.author.name, true);
      updateMetaTag('article:published_time', new Date(post.date).toISOString(), true);
      updateMetaTag('article:section', post.category, true);
      
      // Article tags
      if (post.tags && post.tags.length > 0) {
        // Remove existing article:tag meta tags
        document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
        
        // Add new article:tag meta tags
        post.tags.forEach(tag => {
          updateMetaTag('article:tag', tag, true);
        });
      }
    }

    // Robots meta tag
    updateMetaTag('robots', 'index, follow');
    
    // Google-specific meta tags
    updateMetaTag('googlebot', 'index, follow');
    
  }, [title, description, image, url, post, type]);

  return null;
};

export default SEOMetaTags;
