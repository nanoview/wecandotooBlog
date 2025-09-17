import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { email } = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    console.log('Testing newsletter subscription for:', email);

    // Test 1: Check if table exists
    const { count, error: countError } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: 'exact', head: true });

    if (countError) {
      console.error('Table access error:', countError);
      throw new Error(`Table access failed: ${countError.message}`);
    }

    console.log('Table exists, current count:', count);

    // Test 2: Try to insert
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .insert({ 
        email: email,
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        subscribed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      
      if (error.code === '23505') {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Email already subscribed',
          existing: true
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      throw error;
    }

    console.log('Successfully inserted:', data);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully subscribed to newsletter',
      subscriber_id: data.id,
      data: data
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error('Newsletter test error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      details: error.toString()
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
