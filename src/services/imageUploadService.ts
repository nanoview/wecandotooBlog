import { supabase } from '@/integrations/supabase/client';

export interface UploadedImage {
  url: string;
  fileName: string;
  alt: string;
  title: string;
  caption?: string;
  seoOptimized: boolean;
}

export interface ImageSEOData {
  alt: string;
  title: string;
  caption?: string;
  filename: string;
}

/**
 * Generate SEO-optimized filename from image and context
 */
export const generateSEOFilename = (
  originalName: string, 
  context?: { title?: string; keywords?: string[] }
): string => {
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  
  let seoName = '';
  
  if (context?.title) {
    // Use post title as base
    seoName = context.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove multiple hyphens
      .substring(0, 50); // Limit length
  } else {
    // Fallback to cleaned original name
    seoName = originalName
      .replace(/\.[^/.]+$/, '') // Remove extension
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30);
  }
  
  // Add keyword if available
  if (context?.keywords && context.keywords.length > 0) {
    const keyword = context.keywords[0]
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    seoName = `${keyword}-${seoName}`;
  }
  
  return `${seoName}-${timestamp}.${extension}`;
};

/**
 * Generate SEO-optimized alt text and title
 */
export const generateImageSEO = (
  fileName: string,
  context?: { title?: string; keywords?: string[]; content?: string }
): ImageSEOData => {
  const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/-\d+$/, ''); // Remove extension and timestamp
  
  // Create readable name from filename
  const readableName = baseName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
  
  let alt = readableName;
  let title = readableName;
  
  // Enhance with context
  if (context?.title) {
    title = `${readableName} - ${context.title}`;
    alt = `${readableName} related to ${context.title}`;
  }
  
  // Add primary keyword to alt text for SEO
  if (context?.keywords && context.keywords.length > 0) {
    const keyword = context.keywords[0];
    if (!alt.toLowerCase().includes(keyword.toLowerCase())) {
      alt = `${keyword} ${alt}`;
    }
  }
  
  // Ensure alt text is descriptive and under 125 characters
  if (alt.length > 125) {
    alt = alt.substring(0, 122) + '...';
  }
  
  return {
    alt,
    title,
    filename: fileName,
    caption: `Image: ${readableName}`
  };
};

/**
 * Check if storage bucket is available and accessible
 */
export const checkStorageAvailability = async (): Promise<{
  available: boolean;
  error?: string;
}> => {
  try {
    // Try to list the bucket to see if it exists and is accessible
    const { data, error } = await supabase.storage
      .from('blog-images')
      .list('', { limit: 1 });
    
    if (error) {
      console.error('Storage check failed:', error);
      return {
        available: false,
        error: `Storage not available: ${error.message}`
      };
    }
    
    return {
      available: true
    };
  } catch (error) {
    console.error('Storage availability check failed:', error);
    return {
      available: false,
      error: `Storage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Upload image to Supabase storage with SEO optimization
 */
export const uploadImage = async (
  file: File,
  context?: { title?: string; keywords?: string[]; content?: string }
): Promise<UploadedImage> => {
  try {
    // First, check if storage is available
    const storageCheck = await checkStorageAvailability();
    if (!storageCheck.available) {
      throw new Error(storageCheck.error || 'Storage bucket not available');
    }
    
    // Generate SEO-optimized filename
    const seoFilename = generateSEOFilename(file.name, context);
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(`posts/${seoFilename}`, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(`posts/${seoFilename}`);
    
    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }
    
    // Generate SEO data
    const seoData = generateImageSEO(seoFilename, context);
    
    return {
      url: urlData.publicUrl,
      fileName: seoFilename,
      alt: seoData.alt,
      title: seoData.title,
      caption: seoData.caption,
      seoOptimized: true
    };
    
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

/**
 * Handle image paste from clipboard
 */
export const handleImagePaste = async (
  clipboardEvent: ClipboardEvent,
  context?: { title?: string; keywords?: string[]; content?: string }
): Promise<UploadedImage | null> => {
  const items = clipboardEvent.clipboardData?.items;
  if (!items) return null;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (!file) continue;
      
      // Create a proper filename for pasted image
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const pastedFile = new File([file], `pasted-image-${timestamp}.png`, {
        type: file.type
      });
      
      return await uploadImage(pastedFile, context);
    }
  }
  
  return null;
};

/**
 * Generate markdown for uploaded image with SEO attributes
 */
export const generateImageMarkdown = (image: UploadedImage): string => {
  return `![${image.alt}](${image.url} "${image.title}")`;
};

/**
 * Generate HTML for uploaded image with all SEO attributes
 */
export const generateImageHTML = (image: UploadedImage, className?: string): string => {
  const classAttr = className ? ` class="${className}"` : '';
  
  return `<img src="${image.url}" alt="${image.alt}" title="${image.title}"${classAttr} loading="lazy" decoding="async" />`;
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 200 * 1024 * 1024; // 200MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 200MB' };
  }
  
  return { valid: true };
};

/**
 * Compress image if needed (basic compression)
 */
export const compressImage = (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Create Blob URL for the image
    const blobUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      // IMPORTANT: Revoke the Blob URL as soon as we're done with it
      URL.revokeObjectURL(blobUrl);
      
      // Calculate optimal dimensions (max width 1200px for web)
      const maxWidth = 1200;
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => {
      // Clean up the Blob URL on error too
      URL.revokeObjectURL(blobUrl);
      console.error('Failed to load image for compression');
      resolve(file); // Return original file if compression fails
    };
    
    img.src = blobUrl;
  });
};
