/**
 * Utility to detect and fix blob URLs in content
 * This prevents "Not allowed to load local resource: blob:" errors
 */

export const detectBlobUrls = (content: string): string[] => {
  const blobUrlRegex = /blob:[^"'\s)]+/g;
  return content.match(blobUrlRegex) || [];
};

export const hasBlobUrls = (content: string): boolean => {
  return detectBlobUrls(content).length > 0;
};

export const cleanBlobUrls = (content: string): string => {
  // Remove blob URLs and replace with placeholder or warning
  return content.replace(/blob:[^"'\s)]+/g, '[Image upload in progress...]');
};

export const validateContentForProduction = (content: string): {
  isValid: boolean;
  issues: string[];
  cleanedContent?: string;
} => {
  const blobUrls = detectBlobUrls(content);
  
  if (blobUrls.length === 0) {
    return { isValid: true, issues: [] };
  }
  
  return {
    isValid: false,
    issues: [
      `Found ${blobUrls.length} temporary blob URL(s) that need to be uploaded:`,
      ...blobUrls.map(url => `- ${url}`)
    ],
    cleanedContent: cleanBlobUrls(content)
  };
};

export const showBlobUrlWarning = () => {
  console.warn('⚠️ Blob URLs detected in content. These will not work in production.');
  console.log('💡 Images should be uploaded to server storage before publishing.');
};
