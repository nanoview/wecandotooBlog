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

interface SubscriptionRequest {
  email: string;
  termsAccepted: boolean;
  source?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, termsAccepted, source = 'web' } = await req.json() as SubscriptionRequest;

    if (!email || !termsAccepted) {
      throw new Error('Email and terms acceptance are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is already subscribed
    const { data: existingSubscriber } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", normalizedEmail)
      .single();

    if (existingSubscriber) {
      if (existingSubscriber.status === 'confirmed') {
        return new Response(
          JSON.stringify({
            success: true,
            message: "You're already subscribed to our newsletter!",
            status: "confirmed",
            alreadySubscribed: true
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else if (existingSubscriber.status === 'pending') {
        // Update to trigger email resend via trigger
        const { error: updateError } = await supabase
          .from("newsletter_subscribers")
          .update({ 
            updated_at: new Date().toISOString(),
            terms_accepted: termsAccepted,
            source: source
          })
          .eq("id", existingSubscriber.id);

        if (updateError) {
          throw new Error(`Failed to resend confirmation: ${updateError.message}`);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Confirmation email resent! Please check your inbox.",
            status: "pending",
            emailResent: true
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomUUID();

    // Insert into newsletter_subscribers table 
    // The trigger will automatically send the confirmation email
    const { data: insertData, error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: normalizedEmail,
        status: "pending", // This will trigger the email automatically
        confirmation_token: confirmationToken,
        terms_accepted: termsAccepted,
        subscription_type: 'newsletter_only',
        source: source,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to save subscription: ${insertError.message}`);
    }

    // Log the subscription attempt
    console.log(`Newsletter subscription created for ${normalizedEmail} with trigger-based email`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription request sent! Please check your email to confirm your subscription.",
        status: "pending",
        emailSent: true,
        triggerBased: true,
        subscriptionId: insertData.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Subscription failed'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
