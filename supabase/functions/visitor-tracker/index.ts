import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get real IP address from request headers with improved detection
    const getClientIP = (req: Request): string => {
      // Debug: Log all headers for troubleshooting
      console.log('All request headers:');
      for (const [key, value] of req.headers.entries()) {
        if (key.toLowerCase().includes('ip') || 
            key.toLowerCase().includes('forward') || 
            key.toLowerCase().includes('client') ||
            key.toLowerCase().includes('real')) {
          console.log(`  ${key}: ${value}`);
        }
      }

      // Priority list of headers to check
      const headers = [
        'x-forwarded-for',
        'x-real-ip',
        'cf-connecting-ip',    // Cloudflare
        'x-client-ip',
        'x-forwarded',
        'forwarded-for',
        'forwarded',
        'true-client-ip',      // Akamai and Cloudflare
        'x-cluster-client-ip', // Cluster environments
        'fastly-client-ip',    // Fastly CDN
        'x-original-forwarded-for'
      ];

      for (const header of headers) {
        const value = req.headers.get(header);
        if (value) {
          // Handle comma-separated IPs (take the first valid one)
          const ips = value.split(',').map(ip => ip.trim());
          for (const ip of ips) {
            // Validate IP format and exclude private/local IPs for better tracking
            if (isValidPublicIP(ip)) {
              console.log(`Found valid IP from ${header}: ${ip}`);
              return ip;
            }
          }
        }
      }

      console.log('No valid public IP found, trying geolocation fallback');
      
      // Try to get IP from the user agent and other clues
      // For mobile devices, we might need to rely on client-side detection
      return 'mobile-device'; // Special marker for mobile devices
    };

    // Validate if IP is public and properly formatted
    const isValidPublicIP = (ip: string): boolean => {
      // Basic IP format validation
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(ip)) return false;

      const parts = ip.split('.').map(Number);
      if (parts.some(part => part > 255)) return false;

      // Exclude only obviously invalid IPs
      const isInvalid = 
        ip === '0.0.0.0' ||
        ip === '127.0.0.1' ||
        ip.startsWith('0.') ||
        ip === '255.255.255.255';

      // For mobile tracking, be more lenient - accept any valid IP format
      // except the obviously invalid ones
      return !isInvalid;
    };

    const realIP = getClientIP(req);

    // Parse request body
    const { sessionId, action, data } = await req.json()

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result

    switch (action) {
      case 'create_session':
        try {
          console.log('Creating session for:', sessionId, 'with IP:', realIP)
          
          // Check if session already exists
          const { data: existingSession, error: fetchError } = await supabaseClient
            .from('visitor_sessions')
            .select('*')
            .eq('session_id', sessionId)
            .maybeSingle()

          if (fetchError) {
            console.error('Error checking existing session:', fetchError)
            throw fetchError
          }

          if (existingSession) {
            // Use client-detected IP as fallback if server-side detection failed
            const finalIP = (realIP === 'mobile-device' && data?.ip) ? data.ip : realIP;
            console.log('Final IP for update:', finalIP, '(server:', realIP, ', client:', data?.ip, ')');
            
            // Update existing session
            const { data: updatedSession, error: updateError } = await supabaseClient
              .from('visitor_sessions')
              .update({
                ip_address: finalIP,
                last_visit: new Date().toISOString(),
                visit_count: (existingSession.visit_count || 0) + 1,
                updated_at: new Date().toISOString()
              })
              .eq('session_id', sessionId)
              .select()
              .single()

            if (updateError) {
              console.error('Error updating session:', updateError)
              throw updateError
            }
            
            console.log('Session updated successfully')
            result = updatedSession
          } else {
            // Use client-detected IP as fallback if server-side detection failed
            const finalIP = (realIP === 'mobile-device' && data?.ip) ? data.ip : realIP;
            console.log('Final IP for session:', finalIP, '(server:', realIP, ', client:', data?.ip, ')');
            
            // Create new session with minimal required fields and safe defaults
            const sessionData = {
              session_id: sessionId,
              ip_address: finalIP,
              user_agent: data?.userAgent || 'Unknown',
              country: data?.country || null,
              country_code: data?.countryCode || null,
              region: data?.region || null,
              city: data?.city || null,
              latitude: data?.latitude || null,
              longitude: data?.longitude || null,
              timezone: data?.timezone || null,
              isp: data?.isp || null,
              device_type: data?.deviceType || 'unknown',
              browser: data?.browser || 'unknown',
              os: data?.os || 'unknown',
              referrer: data?.referrer || null,
              first_visit: new Date().toISOString(),
              last_visit: new Date().toISOString(),
              visit_count: 1
            }

            const { data: newSession, error: insertError } = await supabaseClient
              .from('visitor_sessions')
              .insert(sessionData)
              .select()
              .single()

            if (insertError) {
              console.error('Error creating session:', insertError)
              throw insertError
            }
            
            console.log('Session created successfully')
            result = newSession
          }
        } catch (sessionError) {
          console.error('Session creation/update failed:', sessionError)
          throw sessionError
        }
        break

      case 'track_page_view':
        try {
          console.log('Tracking page view for session:', sessionId, 'post:', data?.postId || data?.postSlug)
          
          // Track page view - handle both numeric and string post IDs
          const postIdValue = data?.postId ? String(data.postId) : null;
          
          const impressionData = {
            session_id: sessionId,
            post_id: postIdValue,
            post_slug: data?.postSlug || null,
            view_duration: 0,
            scroll_depth: 0,
            is_bounce: false,
            timestamp: new Date().toISOString()
          }

          const { data: impression, error: impressionError } = await supabaseClient
            .from('post_impressions')
            .insert(impressionData)
            .select()
            .single()

          if (impressionError) {
            console.error('Error inserting post impression:', impressionError)
            throw impressionError
          }
          
          console.log('Page view tracked successfully')
          result = impression
        } catch (trackError) {
          console.error('Page view tracking failed:', trackError)
          throw trackError
        }
        break

      case 'update_engagement':
        // Update engagement metrics - handle both numeric and string post IDs
        const engagementPostId = data.postId ? String(data.postId) : null;
        
        // Find the latest impression for this session and post
        let impressionQuery = supabaseClient
          .from('post_impressions')
          .select('id')
          .eq('session_id', sessionId)
          .order('timestamp', { ascending: false })
          .limit(1);
          
        if (engagementPostId) {
          impressionQuery = impressionQuery.eq('post_id', engagementPostId);
        } else if (data.postSlug) {
          impressionQuery = impressionQuery.eq('post_slug', data.postSlug);
        }

        const { data: latestImpression, error: fetchImpressionError } = await impressionQuery.maybeSingle();

        if (fetchImpressionError) {
          console.error('Error fetching impression:', fetchImpressionError)
          throw fetchImpressionError
        }

        // If no impression found, create one first
        if (!latestImpression) {
          console.log('No impression found for engagement update, creating one first...')
          
          // Create a new impression
          const { data: newImpression, error: createError } = await supabaseClient
            .from('post_impressions')
            .insert({
              session_id: sessionId,
              post_id: engagementPostId,
              post_slug: data.postSlug,
              view_duration: data.viewDuration || 0,
              scroll_depth: data.scrollDepth || 0,
              is_bounce: data.isBounce || false,
              timestamp: new Date().toISOString()
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating impression:', createError)
            throw createError
          }
          
          result = newImpression
          break
        }

        const { data: updatedImpression, error: updateImpressionError } = await supabaseClient
          .from('post_impressions')
          .update({
            view_duration: data.viewDuration,
            scroll_depth: data.scrollDepth,
            is_bounce: data.isBounce
          })
          .eq('id', latestImpression.id)
          .select()
          .single()

        if (updateImpressionError) {
          console.error('Error updating impression:', updateImpressionError)
          throw updateImpressionError
        }
        result = updatedImpression
        break

      case 'heartbeat':
        // Update last visit time
        const { data: heartbeatSession, error: heartbeatError } = await supabaseClient
          .from('visitor_sessions')
          .update({
            last_visit: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('session_id', sessionId)
          .select()
          .single()

        if (heartbeatError) throw heartbeatError
        result = heartbeatSession
        break

      case 'get_ip_location':
        // Get IP location information
        try {
          // Using ip-api.com for IP geolocation (free tier: 1000 requests/hour)
          const locationResponse = await fetch(`http://ip-api.com/json/${realIP}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,query`)
          
          if (!locationResponse.ok) {
            throw new Error('Failed to get location data')
          }
          
          const locationData = await locationResponse.json()
          
          if (locationData.status === 'success') {
            result = {
              ip: locationData.query,
              country: locationData.country,
              countryCode: locationData.countryCode,
              region: locationData.regionName,
              city: locationData.city,
              latitude: locationData.lat,
              longitude: locationData.lon,
              timezone: locationData.timezone,
              isp: locationData.isp,
              org: locationData.org
            }
          } else {
            result = {
              ip: realIP,
              error: locationData.message || 'Location lookup failed'
            }
          }
        } catch (error) {
          result = {
            ip: realIP,
            error: error.message
          }
        }
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result,
        ip: realIP,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Visitor tracking error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
