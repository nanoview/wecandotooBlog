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

    // Get real IP address from request headers
    const realIP = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   req.headers.get('cf-connecting-ip') || 
                   req.headers.get('x-client-ip') ||
                   '0.0.0.0'

    // Parse request body
    const { sessionId, action, data } = await req.json()

    console.log('Debug - Request received:', { sessionId, action, ip: realIP })

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
          console.log('Debug - Creating session with data:', data)
          
          // Simple session creation with minimal required fields
          const sessionData = {
            session_id: sessionId,
            ip_address: realIP,
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

          // Try to insert the session
          const { data: newSession, error: insertError } = await supabaseClient
            .from('visitor_sessions')
            .insert(sessionData)
            .select()
            .single()

          if (insertError) {
            console.error('Insert error:', insertError)
            throw insertError
          }

          console.log('Debug - Session created successfully:', newSession?.session_id)
          result = newSession
        } catch (createError) {
          console.error('Create session error:', createError)
          throw createError
        }
        break

      case 'track_page_view':
        try {
          console.log('Debug - Tracking page view:', data)
          
          const impressionData = {
            session_id: sessionId,
            post_id: data?.postId ? String(data.postId) : null,
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
            console.error('Impression error:', impressionError)
            throw impressionError
          }

          console.log('Debug - Page view tracked successfully')
          result = impression
        } catch (trackError) {
          console.error('Track page view error:', trackError)
          throw trackError
        }
        break

      case 'heartbeat':
        try {
          console.log('Debug - Heartbeat for session:', sessionId)
          
          const { data: updated, error: heartbeatError } = await supabaseClient
            .from('visitor_sessions')
            .update({
              last_visit: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('session_id', sessionId)
            .select()

          if (heartbeatError) {
            console.error('Heartbeat error:', heartbeatError)
            throw heartbeatError
          }

          console.log('Debug - Heartbeat successful')
          result = { success: true, updated: updated?.length || 0 }
        } catch (heartbeatErr) {
          console.error('Heartbeat failed:', heartbeatErr)
          throw heartbeatErr
        }
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    console.log('Debug - Operation successful, returning result')
    
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
        stack: error.stack,
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
