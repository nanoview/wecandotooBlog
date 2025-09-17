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
  password?: string;
  termsAccepted: boolean;
  action: 'newsletter_only' | 'signup_and_newsletter';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, termsAccepted, action } = await req.json() as SubscriptionRequest;

    if (!email || !termsAccepted) {
      throw new Error('Email and terms acceptance are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    const normalizedEmail = email.toLowerCase().trim();
    let authUserId = null;

    // Handle different subscription types
    if (action === 'signup_and_newsletter') {
      if (!password) {
        throw new Error('Password is required for account creation');
      }

      // Create user account using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: password,
        email_confirm: false, // We'll handle confirmation ourselves
        user_metadata: {
          newsletter_subscribed: true,
          terms_accepted: termsAccepted,
          subscription_date: new Date().toISOString()
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('An account with this email already exists');
        }
        throw new Error(`Account creation failed: ${authError.message}`);
      }

      authUserId = authData.user?.id;
    }

    // Check if email is already in newsletter_subscribers
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
            status: "confirmed"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else if (existingSubscriber.status === 'pending') {
        // Resend confirmation email
        await supabase.functions.invoke('send-confirmation-email', {
          body: {
            email: normalizedEmail,
            confirmationToken: existingSubscriber.confirmation_token
          }
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: "Confirmation email resent! Please check your inbox.",
            status: "pending"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomUUID();

    // Insert into newsletter_subscribers table
    const { data: insertData, error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: normalizedEmail,
        status: "pending",
        confirmation_token: confirmationToken,
        terms_accepted: termsAccepted,
        auth_user_id: authUserId, // Link to auth user if created
        subscription_type: action,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to save subscription: ${insertError.message}`);
    }

    // Send confirmation email
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        email: normalizedEmail,
        confirmationToken: confirmationToken,
        isAuthSignup: action === 'signup_and_newsletter'
      }
    });

    if (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the whole process if email fails
      return new Response(
        JSON.stringify({
          success: true,
          message: action === 'signup_and_newsletter' 
            ? "Account created! Please check your email to confirm your subscription."
            : "Subscription saved! Confirmation email will be sent when available.",
          status: "pending",
          emailSent: false,
          warning: "Email service temporarily unavailable"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: action === 'signup_and_newsletter'
          ? "Account created successfully! Please check your email to confirm both your account and newsletter subscription."
          : "Subscription request sent! Please check your email to confirm your subscription.",
        status: "pending",
        emailSent: true,
        authUserId: authUserId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Subscription error:', error);
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
