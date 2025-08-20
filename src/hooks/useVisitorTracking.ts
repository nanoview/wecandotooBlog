import { useEffect } from 'react';
import { visitorTracker, trackPageView, updatePageEngagement } from '@/services/visitorTrackingService';

interface UseVisitorTrackingProps {
  postId?: number;
  postSlug?: string;
  postTitle?: string;
  isActive?: boolean; // Allow disabling tracking for admin/editor modes
}

/**
 * Hook to automatically track visitor analytics for blog posts
 * 
 * @param postId - The ID of the blog post being viewed
 * @param postSlug - The slug of the blog post being viewed
 * @param postTitle - The title of the blog post (for debugging)
 * @param isActive - Whether tracking should be active (default: true)
 */
export const useVisitorTracking = ({ 
  postId, 
  postSlug, 
  postTitle, 
  isActive = true 
}: UseVisitorTrackingProps) => {
  
  useEffect(() => {
    // Don't track if disabled or no identifier provided
    if (!isActive || (!postId && !postSlug)) {
      return;
    }

    // Don't track in development mode (optional)
    if (import.meta.env.MODE === 'development' && 
        !import.meta.env.VITE_TRACK_DEV) {
      console.log('Visitor tracking disabled in development mode');
      return;
    }

    // Track the page view
    trackPageView(postId, postSlug);
    
    console.log('Visitor tracking started for:', {
      postId,
      postSlug,
      postTitle: postTitle || 'Unknown'
    });

    // Cleanup function to update engagement when component unmounts
    return () => {
      updatePageEngagement(postId, postSlug);
      console.log('Visitor tracking ended for:', {
        postId,
        postSlug,
        postTitle: postTitle || 'Unknown'
      });
    };
  }, [postId, postSlug, postTitle, isActive]);

  // Return the session ID for debugging purposes
  return {
    sessionId: visitorTracker.getSessionId(),
    stopTracking: () => visitorTracker.stopTracking()
  };
};

/**
 * Hook for tracking general page views (non-blog pages)
 * 
 * @param pageName - Name of the page being viewed
 * @param pageUrl - URL of the page
 * @param isActive - Whether tracking should be active
 */
export const usePageTracking = (
  pageName: string, 
  pageUrl?: string, 
  isActive: boolean = true
) => {
  
  useEffect(() => {
    if (!isActive) return;

    // Don't track in development mode (optional)
    if (import.meta.env.MODE === 'development' && 
        !import.meta.env.VITE_TRACK_DEV) {
      return;
    }

    // Track general page view with slug as page name
    trackPageView(undefined, pageName);
    
    console.log('Page tracking started for:', pageName);

    return () => {
      updatePageEngagement(undefined, pageName);
      console.log('Page tracking ended for:', pageName);
    };
  }, [pageName, pageUrl, isActive]);

  return {
    sessionId: visitorTracker.getSessionId()
  };
};

/**
 * Hook to get current visitor session information
 */
export const useVisitorSession = () => {
  return {
    sessionId: visitorTracker.getSessionId(),
    stopTracking: () => visitorTracker.stopTracking()
  };
};

export default useVisitorTracking;
