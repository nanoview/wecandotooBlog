/// <reference types="https://deno.land/x/deno@v1.28.0/lib/deno.d.ts" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SubscriptionRequest {
  email: string;
  action: 'subscribe' | 'confirm' | 'unsubscribe';
  token?: string;
  user_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, action, token, user_id }: SubscriptionRequest = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    let result;

    switch (action) {
      case 'subscribe':
        // Add new subscriber
        const { data: subscribeData, error: subscribeError } = await supabase
          .rpc('add_newsletter_subscriber', {
            email_param: email,
            user_id_param: user_id || null
          });

        if (subscribeError) {
          throw subscribeError;
        }

        result = subscribeData;

        // Send confirmation email if subscription was successful
        if (result.success && result.confirmation_token) {
          try {
            console.log('Attempting to send confirmation email to:', email);
            console.log('Confirmation token:', result.confirmation_token);
            
            // Call the send-confirmation-email function
            const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-confirmation-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: email,
                confirmationToken: result.confirmation_token,
                siteUrl: 'https://wecandotoo.com'
              }),
            });

            console.log('Email response status:', emailResponse.status);
            
            if (!emailResponse.ok) {
              const errorText = await emailResponse.text();
              console.error('Failed to send confirmation email:', errorText);
              // Add email error to result but don't fail the subscription
              result.emailError = errorText;
            } else {
              const emailResult = await emailResponse.json();
              console.log('Email sent successfully:', emailResult);
              result.emailSent = true;
            }
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Add email error to result but don't fail the subscription
            result.emailError = emailError.message;
          }
        }
        break;

      case 'confirm':
        if (!token) {
          throw new Error('Confirmation token is required');
        }

        const { data: confirmData, error: confirmError } = await supabase
          .rpc('confirm_newsletter_subscription', {
            confirmation_token_param: token
          });

        if (confirmError) {
          throw confirmError;
        }

        result = confirmData;
        break;

      case 'unsubscribe':
        const { data: unsubscribeData, error: unsubscribeError } = await supabase
          .rpc('unsubscribe_newsletter', {
            email_param: email,
            token_param: token || null
          });

        if (unsubscribeError) {
          throw unsubscribeError;
        }

        result = unsubscribeData;
        break;

      default:
        throw new Error('Invalid action. Must be subscribe, confirm, or unsubscribe');
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in newsletter-subscription function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      }),
      {
        status: 400,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
