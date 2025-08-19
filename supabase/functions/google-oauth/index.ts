import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } }
    });

    const url = new URL(req.url);
    
    // Simple health check endpoint
    if (req.method === 'GET' && !url.searchParams.has('code')) {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Google OAuth endpoint is running' }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle OAuth callback from Google (GET request with code parameter)
    if (req.method === 'GET' && url.searchParams.has('code')) {
      const code = url.searchParams.get('code')!;
      const state = url.searchParams.get('state');
      
      try {
        const result = await exchangeCodeForTokens(supabase, code);
        
        // WordPress Site Kit style success page
        const htmlResponse = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Google Connection Successful</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                max-width: 400px;
                width: 100%;
              }
              .success-icon {
                width: 64px;
                height: 64px;
                background: #10b981;
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
              }
              .title {
                color: #1f2937;
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 12px;
              }
              .subtitle {
                color: #6b7280;
                margin-bottom: 24px;
                line-height: 1.5;
              }
              .services {
                background: #f9fafb;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 24px;
              }
              .service {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .service:last-child {
                border-bottom: none;
              }
              .service-name {
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .connected {
                color: #10b981;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 4px;
              }
              .closing-message {
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success-icon">✓</div>
              <h1 class="title">Successfully Connected!</h1>
              <p class="subtitle">Your Google services are now connected and ready to use.</p>
              
              <div class="services">
                <div class="service">
                  <div class="service-name">
                    <span>📊</span>
                    <span>Google Analytics</span>
                  </div>
                  <div class="connected">✓ Connected</div>
                </div>
                <div class="service">
                  <div class="service-name">
                    <span>💰</span>
                    <span>Google AdSense</span>
                  </div>
                  <div class="connected">✓ Connected</div>
                </div>
                <div class="service">
                  <div class="service-name">
                    <span>🔍</span>
                    <span>Search Console</span>
                  </div>
                  <div class="connected">✓ Connected</div>
                </div>
              </div>
              
              <p class="closing-message">This window will close automatically...</p>
            </div>
            
            <script>
              // Send success message to parent window
              if (window.opener) {
                window.opener.postMessage({
                  type: 'oauth_success',
                  credentials: {}
                }, '*');
              }
              
              // Close window after delay
              setTimeout(() => {
                window.close();
              }, 3000);
            </script>
          </body>
          </html>
        `;
        
        return new Response(htmlResponse, {
          headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        });
        
      } catch (error) {
        console.error('OAuth exchange error:', error);
        
        // WordPress Site Kit style error page
        const errorHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Connection Failed</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                max-width: 400px;
                width: 100%;
              }
              .error-icon {
                width: 64px;
                height: 64px;
                background: #ef4444;
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
              }
              .title {
                color: #1f2937;
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 12px;
              }
              .subtitle {
                color: #6b7280;
                margin-bottom: 24px;
                line-height: 1.5;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error-icon">✗</div>
              <h1 class="title">Connection Failed</h1>
              <p class="subtitle">${(error as Error).message || 'An error occurred during authentication'}</p>
              <p class="subtitle">Please close this window and try again.</p>
            </div>
            
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'oauth_error',
                  error: '${(error as Error).message || 'Authentication failed'}'
                }, '*');
              }
              
              setTimeout(() => {
                window.close();
              }, 5000);
            </script>
          </body>
          </html>
        `;
        
        return new Response(errorHtml, {
          headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        });
      }
    }
    
    // Handle API calls (POST requests)
    if (req.method === 'POST') {
      const { action } = await req.json();
      
      if (action === 'refresh_tokens') {
        return await refreshTokens(supabase);
      } else if (action === 'check_status') {
        return await checkConnectionStatus(supabase);
      }
    }

    throw new Error('Invalid request method or parameters');

  } catch (error) {
    console.error('Google OAuth error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message 
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
    // Get OAuth configuration from database - FIXED: Use consistent table name
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
      client_secret: config.oauth_client_secret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: 'https://rowcloxlszwnowlggqon.supabase.co/functions/v1/google-oauth'
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

    // Store tokens in database - FIXED: Use consistent field names
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

    // FIXED: Return simple object instead of Response
    return { 
      success: true, 
      message: 'OAuth tokens exchanged and stored successfully' 
    };

  } catch (error) {
    console.error('Token exchange error:', error);
    throw error; // Re-throw to be caught by main handler
  }
}

async function refreshTokens(supabase: any) {
  try {
    // Get current tokens from database - FIXED: Use consistent table name
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
      client_secret: config.oauth_client_secret,
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

    // Update tokens in database - FIXED: Use consistent field names
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
        error: (error as Error).message 
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
        error: (error as Error).message 
      }),
      {
        status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}