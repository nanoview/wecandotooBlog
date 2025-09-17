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

    // For testing: Auto-confirm the subscription instead of requiring email confirmation
    const { data: insertData, error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({ 
        email,
        status: 'confirmed', // Auto-confirm for testing
        confirmed_at: new Date().toISOString(),
        subscribed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Email already subscribed to our newsletter',
          already_confirmed: true
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw insertError;
    }

    console.log('Newsletter subscription auto-confirmed for:', email);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully subscribed to newsletter! (Auto-confirmed for testing)',
      subscriber_id: insertData.id,
      auto_confirmed: true
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });

  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
  }
});
