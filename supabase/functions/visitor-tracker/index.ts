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
    // Initialize Supabase client with better error handling
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      throw new Error('Missing required environment variables');
    }
    
    console.log('Initializing Supabase client...');
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body with better error handling
    let requestBody;
    try {
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);
      requestBody = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { sessionId, action, data } = requestBody;

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing action:', action, 'for session:', sessionId);

    let result;

    switch (action) {
      case 'create_session':
        try {
          console.log('Creating session for:', sessionId);
          
          // Check if session already exists
          const { data: existingSession, error: fetchError } = await supabaseClient
            .from('visitor_sessions')
            .select('*')
            .eq('session_id', sessionId)
            .maybeSingle()

          if (fetchError) {
            console.error('Error checking existing session:', fetchError);
            throw fetchError;
          }

          if (existingSession) {
            console.log('Updating existing session');
            // Update existing session
            const { data: updatedSession, error: updateError } = await supabaseClient
              .from('visitor_sessions')
              .update({
                last_visit: new Date().toISOString(),
                visit_count: (existingSession.visit_count || 0) + 1,
                updated_at: new Date().toISOString()
              })
              .eq('session_id', sessionId)
              .select()
              .single()

            if (updateError) {
              console.error('Error updating session:', updateError);
              throw updateError;
            }
            
            result = updatedSession;
          } else {
            console.log('Creating new session');
            // Create new session with minimal required fields
            const sessionData = {
              session_id: sessionId,
              ip_address: data?.ip || '0.0.0.0',
              user_agent: data?.userAgent || 'Unknown',
              country: data?.country || null,
              country_code: data?.countryCode || null,
              region: data?.region || null,
              city: data?.city || null,
              device_type: data?.deviceType || 'unknown',
              browser: data?.browser || 'unknown',
              os: data?.os || 'unknown',
              referrer: data?.referrer || null,
              first_visit: new Date().toISOString(),
              last_visit: new Date().toISOString(),
              visit_count: 1
            };

            const { data: newSession, error: insertError } = await supabaseClient
              .from('visitor_sessions')
              .insert(sessionData)
              .select()
              .single()

            if (insertError) {
              console.error('Error creating session:', insertError);
              throw insertError;
            }
            
            result = newSession;
          }
        } catch (sessionError) {
          console.error('Session creation/update failed:', sessionError);
          throw sessionError;
        }
        break;

      case 'track_page_view':
        try {
          console.log('Tracking page view for session:', sessionId);
          
          const impressionData = {
            session_id: sessionId,
            post_id: data?.postId ? String(data.postId) : null,
            post_slug: data?.postSlug || null,
            view_duration: 0,
            scroll_depth: 0,
            is_bounce: false,
            timestamp: new Date().toISOString()
          };

          const { data: impression, error: impressionError } = await supabaseClient
            .from('post_impressions')
            .insert(impressionData)
            .select()
            .single()

          if (impressionError) {
            console.error('Error inserting post impression:', impressionError);
            throw impressionError;
          }
          
          result = impression;
        } catch (trackError) {
          console.error('Page view tracking failed:', trackError);
          throw trackError;
        }
        break;

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

        if (heartbeatError) {
          console.error('Heartbeat error:', heartbeatError);
          throw heartbeatError;
        }
        result = heartbeatSession;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('Action completed successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Visitor tracking error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString(),
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})
