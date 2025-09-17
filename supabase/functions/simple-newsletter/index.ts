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

    // Generate confirmation token
    const confirmationToken = crypto.randomUUID();

    // Save to newsletter_subscribers table with pending status (always requires confirmation)
    const { data: insertData, error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({ 
        email,
        status: 'pending', // Always pending until confirmed
        confirmation_token: confirmationToken,
        subscribed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      // Handle duplicate email gracefully
      if (insertError.code === '23505') {
        // Check if already confirmed
        const { data: existing } = await supabase
          .from("newsletter_subscribers")
          .select("status, email")
          .eq("email", email)
          .single();
          
        if (existing?.status === 'confirmed') {
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Email already confirmed and subscribed',
            already_confirmed: true
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } else {
          // Resend confirmation for pending subscription
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Confirmation email will be resent',
            resend: true
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
      throw insertError;
    }

    // Always attempt to send confirmation email
    const emailResult = await sendConfirmationEmail(email, confirmationToken);

    console.log(`Newsletter subscription for: ${email} - pending email confirmation`);
    console.log('Email send result:', emailResult);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Please check your email to confirm your subscription',
      subscriber_id: insertData.id,
      requires_confirmation: true,
      debug_info: {
        email_attempted: true,
        email_success: emailResult.success,
        token_generated: !!confirmationToken
      }
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

// Helper function to send confirmation email
async function sendConfirmationEmail(email: string, confirmationToken: string) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    console.log('=== EMAIL SENDING DEBUG ===');
    console.log('Sending confirmation email to:', email);
    console.log('Token:', confirmationToken);
    console.log('Supabase URL exists:', !!supabaseUrl);
    console.log('Service key exists:', !!supabaseServiceKey);
    
    // Try the simple-email-send function first (has better fallbacks)
    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/simple-email-send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        confirmationToken: confirmationToken,
        siteUrl: 'https://wecandotoo.com'
      }),
    });

    console.log('Email service response status:', emailResponse.status);
    console.log('Email service response ok:', emailResponse.ok);

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Failed to send confirmation email:', errorText);
      return { success: false, error: errorText };
    } else {
      const result = await emailResponse.json();
      console.log('Confirmation email sent successfully:', result);
      return { success: true, result };
    }
  } catch (emailError) {
    console.error('Error sending confirmation email:', emailError);
    return { success: false, error: emailError.message };
  }
}
