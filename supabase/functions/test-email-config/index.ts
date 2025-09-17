import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const result = {
      resend_api_key_exists: !!resendApiKey,
      resend_api_key_length: resendApiKey ? resendApiKey.length : 0,
      supabase_url_exists: !!supabaseUrl,
      service_role_key_exists: !!serviceRoleKey,
      environment: "supabase-edge-function"
    };

    // Test if we can reach the Resend API
    if (resendApiKey) {
      try {
        const testResponse = await fetch('https://api.resend.com/domains', {
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
        });
        result.resend_api_accessible = testResponse.ok;
        result.resend_status = testResponse.status;
      } catch (error) {
        result.resend_api_accessible = false;
        result.resend_error = error.message;
      }
    }

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
