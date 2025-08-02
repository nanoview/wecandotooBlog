import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { code, action } = await req.json();

    if (action === 'exchange_code') {
      return await exchangeCodeForTokens(supabase, code);
    } else if (action === 'refresh_tokens') {
      return await refreshTokens(supabase);
    } else if (action === 'check_status') {
      return await checkConnectionStatus(supabase);
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('Google OAuth error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function exchangeCodeForTokens(supabase: any, code: string) {
  try {
    // Get OAuth configuration from database
    const { data: config, error: configError } = await supabase
      .from('google_site_kit_config')
      .select('*')
      .limit(1)
      .single();

    if (configError || !config) {
      throw new Error('Google Site Kit configuration not found');
    }

    if (!config.oauth_client_id || !config.oauth_client_secret) {
      throw new Error('OAuth credentials not configured');
    }

    // Exchange authorization code for tokens
    const tokenRequest = {
      client_id: config.oauth_client_id,
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: config.oauth_redirect_uri
    };

    console.log('Exchanging code for tokens...');
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenRequest)
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange failed:', errorData);
      throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
    }

    const tokens = await tokenResponse.json();
    console.log('Tokens received successfully');

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000));

    // Store tokens in database
    const { error: updateError } = await supabase
      .from('google_site_kit_config')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt.toISOString(),
        connection_status: 'connected',
        last_sync_at: new Date().toISOString(),
        error_message: null
      })
      .eq('id', config.id);

    if (updateError) {
      console.error('Failed to store tokens:', updateError);
      throw new Error('Failed to store OAuth tokens');
    }

    console.log('Tokens stored successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OAuth tokens exchanged and stored successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Token exchange error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

async function refreshTokens(supabase: any) {
  try {
    // Get current tokens from database
    const { data: config, error: configError } = await supabase
      .from('google_site_kit_config')
      .select('*')
      .limit(1)
      .single();

    if (configError || !config || !config.refresh_token) {
      throw new Error('No refresh token available');
    }

    const refreshRequest = {
      client_id: config.oauth_client_id,
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
      refresh_token: config.refresh_token,
      grant_type: 'refresh_token'
    };

    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(refreshRequest)
    });

    if (!refreshResponse.ok) {
      const errorData = await refreshResponse.json();
      throw new Error(`Token refresh failed: ${errorData.error_description || errorData.error}`);
    }

    const tokens = await refreshResponse.json();
    const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000));

    // Update tokens in database
    const { error: updateError } = await supabase
      .from('google_site_kit_config')
      .update({
        access_token: tokens.access_token,
        token_expires_at: expiresAt.toISOString(),
        last_sync_at: new Date().toISOString(),
        error_message: null
      })
      .eq('id', config.id);

    if (updateError) {
      throw new Error('Failed to update refreshed tokens');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Tokens refreshed successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Token refresh error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

async function checkConnectionStatus(supabase: any) {
  try {
    const { data: config, error } = await supabase
      .from('google_site_kit_config')
      .select('connection_status, last_sync_at, error_message, enable_adsense, enable_analytics, enable_search_console')
      .limit(1)
      .single();

    if (error) {
      throw new Error('Failed to check connection status');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          is_connected: config.connection_status === 'connected',
          last_sync: config.last_sync_at,
          services: {
            adsense: config.enable_adsense,
            analytics: config.enable_analytics,
            search_console: config.enable_search_console
          },
          error_message: config.error_message
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Status check error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}