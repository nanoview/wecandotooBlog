import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  confirmationToken: string;
  siteUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationToken, siteUrl }: ConfirmationEmailRequest = await req.json();

    if (!email || !confirmationToken || !siteUrl) {
      throw new Error('Missing required parameters: email, confirmationToken, and siteUrl');
    }

    const confirmationUrl = `${siteUrl}/confirm-subscription?token=${confirmationToken}`;
    
    const emailResponse = await resend.emails.send({
      from: "WeCanDoToo <onboarding@resend.dev>",
      to: [email],
      subject: "Confirm your subscription to WeCanDoToo",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Welcome to WeCanDoToo!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thanks for subscribing to our newsletter. You'll receive the latest insights, tips, and updates directly in your inbox.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Please confirm your subscription by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Confirm Subscription
            </a>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center;">
            If you didn't subscribe to this newsletter, you can safely ignore this email.
          </p>
          <p style="color: #999; font-size: 12px; text-align: center;">
            Or copy and paste this link: ${confirmationUrl}
          </p>
        </div>
      `,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
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