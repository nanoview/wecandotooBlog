/**
 * Social Media Sharing Service
 * Handles sharing blog posts across different social media platforms
 */

export interface ShareData {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  hashtags?: string[];
  via?: string; // Twitter username
}

export interface SocialPlatform {
  name: string;
  icon: string;
  color: string;
  shareUrl: (data: ShareData) => string;
  supportsImage: boolean;
}

/**
 * Generate sharing URL for different platforms
 */
export const socialPlatforms: Record<string, SocialPlatform> = {
  twitter: {
    name: 'Twitter',
    icon: '𝕏',
    color: '#000000',
    shareUrl: (data: ShareData) => {
      const params = new URLSearchParams();
      const text = `${data.title}\n\n${data.description}`;
      params.append('text', text);
      params.append('url', data.url);
      if (data.hashtags && data.hashtags.length > 0) {
        params.append('hashtags', data.hashtags.join(','));
      }
      if (data.via) {
        params.append('via', data.via);
      }
      return `https://twitter.com/intent/tweet?${params.toString()}`;
    },
    supportsImage: false
  },
  
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    shareUrl: (data: ShareData) => {
      const params = new URLSearchParams();
      params.append('u', data.url);
      params.append('quote', `${data.title} - ${data.description}`);
      return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
    },
    supportsImage: true
  },
  
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    shareUrl: (data: ShareData) => {
      const params = new URLSearchParams();
      params.append('url', data.url);
      params.append('title', data.title);
      params.append('summary', data.description);
      if (data.imageUrl) {
        params.append('mini', 'true');
      }
      return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
    },
    supportsImage: true
  },
  
  reddit: {
    name: 'Reddit',
    icon: '🟠',
    color: '#FF4500',
    shareUrl: (data: ShareData) => {
      const params = new URLSearchParams();
      params.append('url', data.url);
      params.append('title', data.title);
      return `https://www.reddit.com/submit?${params.toString()}`;
    },
    supportsImage: false
  },
  
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    shareUrl: (data: ShareData) => {
      const text = `*${data.title}*\n\n${data.description}\n\n${data.url}`;
      const params = new URLSearchParams();
      params.append('text', text);
      return `https://wa.me/?${params.toString()}`;
    },
    supportsImage: false
  },
  
  telegram: {
    name: 'Telegram',
    icon: '✈️',
    color: '#0088CC',
    shareUrl: (data: ShareData) => {
      const params = new URLSearchParams();
      params.append('url', data.url);
      params.append('text', `${data.title}\n\n${data.description}`);
      return `https://t.me/share/url?${params.toString()}`;
    },
    supportsImage: false
  },
  
  pinterest: {
    name: 'Pinterest',
    icon: '📌',
    color: '#E60023',
    shareUrl: (data: ShareData) => {
      const params = new URLSearchParams();
      params.append('url', data.url);
      params.append('description', `${data.title} - ${data.description}`);
      if (data.imageUrl) {
        params.append('media', data.imageUrl);
      }
      return `https://pinterest.com/pin/create/button/?${params.toString()}`;
    },
    supportsImage: true
  },
  
  email: {
    name: 'Email',
    icon: '📧',
    color: '#6B7280',
    shareUrl: (data: ShareData) => {
      const subject = encodeURIComponent(data.title);
      const body = encodeURIComponent(
        `I thought you might be interested in this article:\n\n${data.title}\n\n${data.description}\n\nRead more: ${data.url}`
      );
      return `mailto:?subject=${subject}&body=${body}`;
    },
    supportsImage: false
  }
};

/**
 * Generate share data from blog post
 */
export const generateShareData = (
  post: any,
  baseUrl: string = window.location.origin
): ShareData => {
  const url = `${baseUrl}/${post.slug || `post/${post.id}`}`;
  const hashtags = post.tags || [];
  
  return {
    title: post.title,
    description: post.excerpt || post.meta_description || `Read this amazing article about ${post.title}`,
    url,
    imageUrl: post.featured_image,
    hashtags: hashtags.length > 0 ? hashtags : ['blog', 'article'],
    via: 'stellarcontent' // Your Twitter handle
  };
};

/**
 * Open share dialog for specific platform
 */
export const shareToSocial = (platform: string, shareData: ShareData): boolean => {
  const socialPlatform = socialPlatforms[platform];
  if (!socialPlatform) {
    console.error(`Platform ${platform} not supported`);
    return false;
  }

  const shareUrl = socialPlatform.shareUrl(shareData);
  
  // For email, use window.location
  if (platform === 'email') {
    window.location.href = shareUrl;
    return true;
  }
  
  // For other platforms, open in new window
  const width = 600;
  const height = 600;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  
  const popup = window.open(
    shareUrl,
    `share-${platform}`,
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
  );
  
  return popup !== null;
};

/**
 * Copy share link to clipboard
 */
export const copyShareLink = async (url: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Check if Web Share API is available
 */
export const isWebShareSupported = (): boolean => {
  return 'share' in navigator && 'canShare' in navigator;
};

/**
 * Use native Web Share API if available
 */
export const nativeShare = async (shareData: ShareData): Promise<boolean> => {
  if (!isWebShareSupported()) {
    return false;
  }

  try {
    const data = {
      title: shareData.title,
      text: shareData.description,
      url: shareData.url
    };

    if (navigator.canShare && !navigator.canShare(data)) {
      return false;
    }

    await navigator.share(data);
    return true;
  } catch (error) {
    // User cancelled or error occurred
    return false;
  }
};

/**
 * Track sharing analytics (placeholder for future implementation)
 */
export const trackShare = (platform: string, postId: string): void => {
  // This could be enhanced to track sharing analytics
  console.log(`Shared post ${postId} to ${platform}`);
  
  // Example: Send to analytics service
  // gtag('event', 'share', {
  //   method: platform,
  //   content_type: 'blog_post',
  //   content_id: postId
  // });
};

/**
 * Generate Open Graph meta tags for better social sharing
 */
export const generateOGTags = (shareData: ShareData): string => {
  return `
    <meta property="og:title" content="${shareData.title}" />
    <meta property="og:description" content="${shareData.description}" />
    <meta property="og:url" content="${shareData.url}" />
    <meta property="og:type" content="article" />
    ${shareData.imageUrl ? `<meta property="og:image" content="${shareData.imageUrl}" />` : ''}
    <meta property="og:site_name" content="Stellar Content Stream" />
    
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${shareData.title}" />
    <meta name="twitter:description" content="${shareData.description}" />
    ${shareData.imageUrl ? `<meta name="twitter:image" content="${shareData.imageUrl}" />` : ''}
    ${shareData.via ? `<meta name="twitter:site" content="@${shareData.via}" />` : ''}
  `;
};
