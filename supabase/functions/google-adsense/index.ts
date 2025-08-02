// Supabase Edge Function: Google AdSense API
// File: supabase/functions/google-adsense/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get user from request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: user } = await supabaseClient.auth.getUser(token)

    if (!user.user) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*, user_roles(*)')
      .eq('user_id', user.user.id)
      .single()

    const isAdmin = profile?.user_roles?.some((role: any) => role.role === 'admin')
    if (!isAdmin) {
      throw new Error('Admin access required')
    }

    // Get Google Site Kit configuration
    const { data: config } = await supabaseClient
      .from('google_site_kit')
      .select('*')
      .single()

    if (!config || !config.oauth_access_token) {
      throw new Error('Google Site Kit not configured or tokens missing')
    }

    // Check cache first
    const cacheKey = `adsense_earnings_${new Date().toISOString().split('T')[0]}`
    const { data: cached } = await supabaseClient
      .from('google_api_cache')
      .select('*')
      .eq('api_type', 'adsense')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (cached) {
      return new Response(
        JSON.stringify({
          success: true,
          data: cached.response_data,
          cached: true,
          cached_at: cached.created_at
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Fetch from Google AdSense API
    const startTime = Date.now()
    const adsenseResponse = await fetch(
      `https://adsense.googleapis.com/v2/accounts/${config.adsense_customer_id}/reports:generate?` +
      new URLSearchParams({
        'dateRange': 'LAST_7_DAYS',
        'metrics': 'ESTIMATED_EARNINGS,PAGE_VIEWS,CLICKS,AD_REQUESTS,AD_REQUESTS_CTR'
      }),
      {
        headers: {
          'Authorization': `Bearer ${config.oauth_access_token}`,
          'Content-Type': 'application/json',
        }
      }
    )

    if (!adsenseResponse.ok) {
      // Try to refresh token if unauthorized
      if (adsenseResponse.status === 401) {
        const refreshResponse = await refreshGoogleToken(config, supabaseClient)
        if (refreshResponse.success) {
          // Retry with new token
          const retryResponse = await fetch(
            `https://adsense.googleapis.com/v2/accounts/${config.adsense_customer_id}/reports:generate?` +
            new URLSearchParams({
              'dateRange': 'LAST_7_DAYS',
              'metrics': 'ESTIMATED_EARNINGS,PAGE_VIEWS,CLICKS,AD_REQUESTS,AD_REQUESTS_CTR'
            }),
            {
              headers: {
                'Authorization': `Bearer ${refreshResponse.access_token}`,
                'Content-Type': 'application/json',
              }
            }
          )
          
          if (retryResponse.ok) {
            const data = await retryResponse.json()
            await cacheResponse('adsense', cacheKey, data, supabaseClient)
            return new Response(JSON.stringify({ success: true, data }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          }
        }
      }
      
      throw new Error(`AdSense API error: ${adsenseResponse.status}`)
    }

    const data = await adsenseResponse.json()
    const fetchDuration = Date.now() - startTime

    // Cache the response
    await cacheResponse('adsense', cacheKey, data, supabaseClient, fetchDuration)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        cached: false,
        fetch_duration_ms: fetchDuration
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

// Helper function to refresh Google OAuth token
async function refreshGoogleToken(config: any, supabase: any) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.oauth_client_id,
        client_secret: config.oauth_client_secret,
        refresh_token: config.oauth_refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const tokenData = await response.json()
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))

    // Update tokens in database
    await supabase
      .from('google_site_kit')
      .update({
        oauth_access_token: tokenData.access_token,
        oauth_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', config.id)

    return {
      success: true,
      access_token: tokenData.access_token
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// Helper function to cache API responses
async function cacheResponse(apiType: string, cacheKey: string, data: any, supabase: any, duration?: number) {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1) // Cache for 1 hour

  await supabase
    .from('google_api_cache')
    .upsert({
      api_type: apiType,
      cache_key: cacheKey,
      endpoint: 'reports:generate',
      response_data: data,
      expires_at: expiresAt.toISOString(),
      fetch_duration_ms: duration,
      response_size_bytes: JSON.stringify(data).length
    }, {
      onConflict: 'api_type,cache_key'
    })
}
