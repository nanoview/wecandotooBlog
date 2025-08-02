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

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Set user context
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    // Get OAuth tokens from database
    const { data: config, error: configError } = await supabase
      .from('google_site_kit_config')
      .select('*')
      .limit(1)
      .single();

    if (configError || !config) {
      throw new Error('Google Site Kit configuration not found');
    }

    if (!config.access_token || !config.search_console_site_url) {
      throw new Error('Google Search Console not configured or not connected');
    }

    // Check if token needs refresh
    const tokenExpiry = new Date(config.token_expires_at);
    const now = new Date();
    
    if (tokenExpiry <= now) {
      console.log('Token expired, refreshing...');
      const refreshResult = await refreshAccessToken(supabase, config);
      if (!refreshResult.success) {
        throw new Error('Failed to refresh access token');
      }
      // Get updated config
      const { data: updatedConfig } = await supabase
        .from('google_site_kit_config')
        .select('*')
        .limit(1)
        .single();
      config.access_token = updatedConfig.access_token;
    }

    // Fetch Search Console data
    const searchConsoleData = await fetchSearchConsoleData(config.access_token, config.search_console_site_url);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: searchConsoleData,
        cached: false,
        cached_at: null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Google Search Console API error:', error);
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

async function refreshAccessToken(supabase: any, config: any) {
  try {
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
      throw new Error('Token refresh failed');
    }

    const tokens = await refreshResponse.json();
    const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000));

    await supabase
      .from('google_site_kit_config')
      .update({
        access_token: tokens.access_token,
        token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', config.id);

    return { success: true };
  } catch (error) {
    console.error('Token refresh error:', error);
    return { success: false, error: error.message };
  }
}

async function fetchSearchConsoleData(accessToken: string, siteUrl: string) {
  try {
    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const requestBody = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: [],
      rowLimit: 1,
      startRow: 0
    };

    console.log('Fetching Search Console data for site:', siteUrl);

    // Encode the site URL for the API call
    const encodedSiteUrl = encodeURIComponent(siteUrl);
    
    const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search Console API error response:', errorText);
      throw new Error(`Search Console API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Search Console API response received');

    // Parse the response
    if (!data.rows || data.rows.length === 0) {
      console.log('No data rows in Search Console response');
      return {
        impressions: 0,
        clicks: 0,
        ctr: 0,
        average_position: 0
      };
    }

    // Aggregate all rows for totals
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalCtr = 0;
    let totalPosition = 0;

    data.rows.forEach((row: any) => {
      totalImpressions += row.impressions || 0;
      totalClicks += row.clicks || 0;
      totalCtr += row.ctr || 0;
      totalPosition += row.position || 0;
    });

    // Calculate averages
    const rowCount = data.rows.length;
    const avgCtr = rowCount > 0 ? totalCtr / rowCount : 0;
    const avgPosition = rowCount > 0 ? totalPosition / rowCount : 0;

    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: avgCtr,
      average_position: avgPosition
    };

  } catch (error) {
    console.error('Error fetching Search Console data:', error);
    throw new Error(`Failed to fetch Search Console data: ${error.message}`);
  }
}