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

    if (!config.access_token || !config.analytics_property_id) {
      throw new Error('Google Analytics not configured or not connected');
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

    // Fetch Analytics data
    const analyticsData = await fetchAnalyticsData(config.access_token, config.analytics_property_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: analyticsData,
        cached: false,
        cached_at: null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Google Analytics API error:', error);
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

async function fetchAnalyticsData(accessToken: string, propertyId: string) {
  try {
    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    // Use Google Analytics Data API v1
    const requestBody = {
      requests: [{
        viewId: propertyId,
        dateRanges: [{
          startDate: formatDate(startDate),
          endDate: formatDate(endDate)
        }],
        metrics: [
          { name: 'sessions' },
          { name: 'pageviews' },
          { name: 'bounceRate' },
          { name: 'avgSessionDuration' }
        ],
        dimensions: []
      }]
    };

    console.log('Fetching Analytics data for property:', propertyId);

    const response = await fetch(`https://analyticsreporting.googleapis.com/v4/reports:batchGet`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Analytics API error response:', errorText);
      throw new Error(`Analytics API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Analytics API response received');

    // Parse the response
    if (!data.reports || data.reports.length === 0) {
      console.log('No reports in Analytics response');
      return {
        sessions: 0,
        page_views: 0,
        bounce_rate: 0,
        avg_session_duration: 0
      };
    }

    const report = data.reports[0];
    const totals = report.data?.totals?.[0]?.values || ['0', '0', '0', '0'];

    return {
      sessions: parseInt(totals[0] || '0'),
      page_views: parseInt(totals[1] || '0'),
      bounce_rate: parseFloat(totals[2] || '0'),
      avg_session_duration: parseFloat(totals[3] || '0')
    };

  } catch (error) {
    console.error('Error fetching Analytics data:', error);
    throw new Error(`Failed to fetch Analytics data: ${error.message}`);
  }
}