/**
 * Production URL checker to prevent blob URLs from reaching live site
 * This should be added to your build process or runtime checks
 */

// Override console methods in production to catch blob URL issues
if (import.meta.env.PROD) {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('blob:') || message.includes('Not allowed to load local resource')) {
      // Send error to monitoring service
      console.log('🚨 PRODUCTION BLOB URL ERROR DETECTED:', message);
      
      // You could send this to an error tracking service like Sentry
      // Sentry.captureException(new Error(`Blob URL in production: ${message}`));
    }
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('blob:')) {
      console.log('⚠️ PRODUCTION BLOB URL WARNING:', message);
    }
    originalWarn.apply(console, args);
  };
}

// Global function to scan page for blob URLs
export const scanPageForBlobUrls = () => {
  const allElements = document.querySelectorAll('*');
  const blobUrls: string[] = [];
  
  allElements.forEach(element => {
    // Check src attributes
    if (element.getAttribute('src')?.includes('blob:')) {
      blobUrls.push(element.getAttribute('src')!);
    }
    
    // Check href attributes
    if (element.getAttribute('href')?.includes('blob:')) {
      blobUrls.push(element.getAttribute('href')!);
    }
    
    // Check background images in style
    const style = window.getComputedStyle(element);
    if (style.backgroundImage?.includes('blob:')) {
      blobUrls.push(style.backgroundImage);
    }
    
    // Check text content for blob URLs
    if (element.textContent?.includes('blob:')) {
      const matches = element.textContent.match(/blob:[^\s"']+/g);
      if (matches) {
        blobUrls.push(...matches);
      }
    }
  });
  
  return blobUrls;
};

// Run scan on page load in production
if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const blobUrls = scanPageForBlobUrls();
      if (blobUrls.length > 0) {
        console.error('🚨 PRODUCTION SITE HAS BLOB URLs:', blobUrls);
        
        // Optionally alert site admin
        if (window.location.hostname === 'wecandotoo.com') {
          console.error('🚨 CRITICAL: wecandotoo.com has blob URLs that will not work!');
        }
      }
    }, 2000);
  });
}

export default {};
