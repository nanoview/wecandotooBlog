import { supabase } from '@/integrations/supabase/client';

interface VisitorData {
  sessionId: string;
  ipAddress?: string;
  userAgent: string;
  referrer?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
}

interface PostView {
  sessionId: string;
  postId?: number;
  postSlug?: string;
  viewDuration?: number;
  scrollDepth?: number;
  isBounce?: boolean;
}

interface LocationData {
  ip?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
}

class VisitorTrackingService {
  private sessionId: string;
  private startTime: number = Date.now();
  private maxScrollDepth: number = 0;
  private isTracking: boolean = false;
  private heartbeatInterval?: NodeJS.Timeout;
  private visitorData?: VisitorData;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeTracking() {
    if (this.isTracking) return;
    
    try {
      // Get visitor data
      this.visitorData = await this.getVisitorData();
      
      // Get location data (using a free IP geolocation service)
      const locationData = await this.getLocationData();
      
      // Create or update visitor session
      await this.createOrUpdateSession(this.visitorData, locationData);
      
      // Start tracking scroll depth
      this.trackScrollDepth();
      
      // Start heartbeat to update session
      this.startHeartbeat();
      
      this.isTracking = true;
      
      console.log('Visitor tracking initialized:', this.sessionId);
    } catch (error) {
      console.error('Failed to initialize visitor tracking:', error);
    }
  }

  private async getVisitorData(): Promise<VisitorData> {
    const userAgent = navigator.userAgent;
    const deviceType = this.detectDeviceType(userAgent);
    const browser = this.detectBrowser(userAgent);
    const os = this.detectOS(userAgent);

    return {
      sessionId: this.sessionId,
      userAgent,
      referrer: document.referrer || undefined,
      deviceType,
      browser,
      os
    };
  }

  private async getLocationData(): Promise<LocationData> {
    try {
      // Using ipapi.co for free IP geolocation (1000 requests/month)
      // You can replace this with your preferred service
      const response = await fetch('https://ipapi.co/json/', {
        headers: {
          'User-Agent': 'YourBlogName/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get location data');
      }
      
      const data = await response.json();
      
      return {
        ip: data.ip, // Include the detected IP from client side
        country: data.country_name,
        countryCode: data.country_code,
        region: data.region,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        isp: data.org
      };
    } catch (error) {
      console.error('Failed to get location data:', error);
      return {};
    }
  }

  private async createOrUpdateSession(visitorData: VisitorData, locationData: LocationData) {
    try {
      // Use the edge function to create/update session with real IP
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/visitor-tracker`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          action: 'create_session',
          data: {
            userAgent: visitorData.userAgent,
            referrer: visitorData.referrer,
            deviceType: visitorData.deviceType,
            browser: visitorData.browser,
            os: visitorData.os,
            ...locationData
          }
        })
      });

      if (!response.ok) {
        console.warn(`Edge function failed with status ${response.status}, falling back to direct database call`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        console.warn('Edge function returned error, falling back to direct database call:', result.error);
        throw new Error(result.error || 'Failed to create session');
      }

      console.log('Session created/updated via edge function:', result.data);
      return; // Success, no need for fallback
    } catch (error) {
      console.warn('Edge function failed, attempting fallback to direct database call:', error);
      
      // Fallback to direct Supabase call (without real IP)
      try {
        const { data: existingSession, error: fetchError } = await supabase
          .from('visitor_sessions')
          .select('*')
          .eq('session_id', this.sessionId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (existingSession) {
          const { error: updateError } = await supabase
            .from('visitor_sessions')
            .update({
              last_visit: new Date().toISOString(),
              visit_count: existingSession.visit_count + 1,
              updated_at: new Date().toISOString()
            })
            .eq('session_id', this.sessionId);

          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('visitor_sessions')
            .insert({
              session_id: this.sessionId,
              ip_address: '0.0.0.0', // Placeholder - real IP will be captured server-side
              user_agent: visitorData.userAgent,
              country: locationData.country,
              country_code: locationData.countryCode,
              region: locationData.region,
              city: locationData.city,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              timezone: locationData.timezone,
              isp: locationData.isp,
              device_type: visitorData.deviceType,
              browser: visitorData.browser,
              os: visitorData.os,
              referrer: visitorData.referrer,
              first_visit: new Date().toISOString(),
              last_visit: new Date().toISOString(),
              visit_count: 1
            });

          if (insertError) throw insertError;
        }
      } catch (fallbackError) {
        console.error('Fallback session creation also failed:', fallbackError);
      }
    }
  }

  public async trackPostView(postId?: number, postSlug?: string): Promise<void> {
    if (!this.isTracking) {
      await this.initializeTracking();
    }

    try {
      // Use edge function for better server-side tracking
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/visitor-tracker`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          action: 'track_page_view',
          data: {
            postId,
            postSlug
          }
        })
      });

      if (!response.ok) {
        console.warn(`Edge function failed with status ${response.status}, falling back to direct database call`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        console.warn('Edge function returned error, falling back to direct database call:', result.error);
        throw new Error(result.error || 'Failed to track page view');
      }

      // Reset tracking data for new page
      this.startTime = Date.now();
      this.maxScrollDepth = 0;

      console.log('Post view tracked via edge function:', { postId, postSlug });
      return; // Success, no need for fallback
    } catch (error) {
      console.warn('Edge function failed, attempting fallback to direct database call:', error);
      
      // Fallback to direct Supabase call
      try {
        const { error } = await supabase
          .from('post_impressions')
          .insert({
            session_id: this.sessionId,
            post_id: postId,
            post_slug: postSlug,
            view_duration: 0,
            scroll_depth: 0,
            is_bounce: false,
            timestamp: new Date().toISOString()
          });

        if (error) throw error;

        this.startTime = Date.now();
        this.maxScrollDepth = 0;

        console.log('Post view tracked (fallback):', { postId, postSlug });
      } catch (fallbackError) {
        console.warn('Both edge function and direct database calls failed for post tracking:', fallbackError);
        // Continue silently - don't break the user experience
      }
    }
  }

  public async updatePostEngagement(postId?: number, postSlug?: string): Promise<void> {
    if (!this.isTracking) return;

    try {
      const viewDuration = Math.floor((Date.now() - this.startTime) / 1000);
      const isBounce = viewDuration < 10 && this.maxScrollDepth < 25;

      // Use edge function for engagement tracking
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/visitor-tracker`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          action: 'update_engagement',
          data: {
            postId,
            postSlug,
            viewDuration,
            scrollDepth: this.maxScrollDepth,
            isBounce
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update engagement');
      }

      console.log('Post engagement updated via edge function:', {
        viewDuration,
        scrollDepth: this.maxScrollDepth,
        isBounce
      });
    } catch (error) {
      console.error('Failed to update engagement via edge function:', error);
      
      // Fallback to direct Supabase call
      try {
        const viewDuration = Math.floor((Date.now() - this.startTime) / 1000);
        const isBounce = viewDuration < 10 && this.maxScrollDepth < 25;

        const { data: impression, error: fetchError } = await supabase
          .from('post_impressions')
          .select('id')
          .eq('session_id', this.sessionId)
          .eq(postId ? 'post_id' : 'post_slug', postId || postSlug)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle(); // Use maybeSingle() instead of single() to handle no results

        if (fetchError) {
          console.error('Failed to find impression:', fetchError);
          return;
        }

        // If no impression found, create one first
        if (!impression) {
          console.log('No impression found, creating one first...');
          await this.trackPostView(postId, postSlug);
          return; // The newly created impression will be updated on next call
        }

        const { error: updateError } = await supabase
          .from('post_impressions')
          .update({
            view_duration: viewDuration,
            scroll_depth: this.maxScrollDepth,
            is_bounce: isBounce
          })
          .eq('id', impression.id);

        if (updateError) throw updateError;

        console.log('Post engagement updated (fallback):', {
          viewDuration,
          scrollDepth: this.maxScrollDepth,
          isBounce
        });
      } catch (fallbackError) {
        console.error('Fallback engagement tracking also failed:', fallbackError);
      }
    }
  }

  private trackScrollDepth(): void {
    const updateScrollDepth = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      if (scrollPercent > this.maxScrollDepth) {
        this.maxScrollDepth = Math.min(scrollPercent, 100);
      }
    };

    window.addEventListener('scroll', updateScrollDepth, { passive: true });
    
    // Also track on window beforeunload
    window.addEventListener('beforeunload', () => {
      this.updatePostEngagement();
    });
  }

  private startHeartbeat(): void {
    // Update session every 30 seconds to show user is still active
    this.heartbeatInterval = setInterval(async () => {
      try {
        // Use the edge function for heartbeat instead of direct database access
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const functionUrl = `${supabaseUrl}/functions/v1/visitor-tracker`;
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            sessionId: this.sessionId,
            action: 'heartbeat',
            data: {}
          })
        });

        if (!response.ok) {
          console.warn('Heartbeat failed, but continuing silently:', response.status, response.statusText);
        }
      } catch (error) {
        console.warn('Heartbeat error, but continuing silently:', error);
      }
    }, 30000); // 30 seconds
  }

  public stopTracking(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.isTracking = false;
  }

  // Utility methods for device/browser detection
  private detectDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private detectBrowser(userAgent: string): string {
    // Check for Edge first (both legacy and Chromium-based Edge)
    if (userAgent.includes('Edg/') || userAgent.includes('Edge/')) return 'Edge';
    
    // Check for Chrome (but exclude Edge which also contains "Chrome")
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg') && !userAgent.includes('Edge')) return 'Chrome';
    
    // Check for Firefox
    if (userAgent.includes('Firefox')) return 'Firefox';
    
    // Check for Safari (but exclude Chrome-based browsers that contain "Safari")
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome') && !userAgent.includes('Edg') && !userAgent.includes('Edge')) return 'Safari';
    
    // Check for Opera
    if (userAgent.includes('Opera') || userAgent.includes('OPR/')) return 'Opera';
    
    return 'Unknown';
  }

  private detectOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  // Getter for session ID (useful for debugging)
  public getSessionId(): string {
    return this.sessionId;
  }
}

// Export a singleton instance
export const visitorTracker = new VisitorTrackingService();

// Utility function to easily track page views
export const trackPageView = (postId?: number, postSlug?: string) => {
  visitorTracker.trackPostView(postId, postSlug);
};

// Utility function to update engagement before leaving page
export const updatePageEngagement = (postId?: number, postSlug?: string) => {
  visitorTracker.updatePostEngagement(postId, postSlug);
};

export default VisitorTrackingService;
