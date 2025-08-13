import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Save to newsletter_subscribers table
    const { data: insertData, error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({ 
        email,
        status: 'confirmed', // Skip confirmation step for simplicity
        confirmed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      // Handle duplicate email gracefully
      if (insertError.code === '23505') {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Email already subscribed' 
        }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
          status: 200,
        });
      }
      throw insertError;
    }

    // For now, skip email sending to test core functionality
    console.log('Newsletter subscription saved for:', email);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully subscribed to newsletter',
      subscriber_id: insertData.id
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'An unexpected error occurred'
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
  }
});
