import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationToken, siteUrl } = await req.json();

    if (!email || !confirmationToken || !siteUrl) {
      throw new Error('Missing required parameters');
    }

    console.log('=== SIMPLE EMAIL SEND ===');
    console.log('Sending to:', email);
    console.log('Token:', confirmationToken);

    const confirmationUrl = `${siteUrl}/confirm-subscription?token=${confirmationToken}`;
    
    // Try multiple email services in order of preference
    
    // 1. Try Resend if API key is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        console.log('Attempting Resend email...');
        const { Resend } = await import("npm:resend@2.0.0");
        const resend = new Resend(resendApiKey);
        
        const emailResponse = await resend.emails.send({
          from: "WeCanDoToo <hello@wecandotoo.com>",
          to: [email],
          subject: "Confirm your newsletter subscription",
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #2563eb; text-align: center;">Welcome to WeCanDoToo!</h2>
              <p>Thanks for subscribing to our newsletter. Please confirm your subscription by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Confirm Subscription
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                If the button doesn't work, copy and paste this link: ${confirmationUrl}
              </p>
              <p style="color: #999; font-size: 12px;">
                If you didn't subscribe to this newsletter, you can safely ignore this email.
              </p>
            </div>
          `,
        });

        console.log('Resend email sent successfully:', emailResponse);
        return new Response(JSON.stringify({ 
          success: true, 
          service: 'resend',
          emailId: emailResponse.data?.id 
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (resendError) {
        console.error('Resend failed:', resendError);
      }
    }

    // 2. Fallback: Log the email for manual processing
    console.log('=== EMAIL FALLBACK ===');
    console.log('EMAIL TO:', email);
    console.log('CONFIRMATION URL:', confirmationUrl);
    console.log('Please manually send confirmation email to user');

    return new Response(JSON.stringify({ 
      success: true, 
      service: 'fallback',
      message: 'Email logged for manual processing',
      confirmation_url: confirmationUrl
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in simple-email-send function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
