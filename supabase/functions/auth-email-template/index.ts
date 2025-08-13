import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  email: string;
  type: 'signup' | 'recovery' | 'email_change' | 'magic_link';
  token: string;
  redirect_url?: string;
  site_url: string;
}

const getEmailTemplate = (type: string, email: string, confirmationUrl: string) => {
  const templates = {
    signup: {
      subject: "Welcome to WeCanDoToo - Confirm your account",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">WeCanDoToo</h1>
            <p style="color: #666; margin: 5px 0;">Discover Amazing Stories</p>
          </div>
          
          <h2 style="color: #333; text-align: center;">Welcome to WeCanDoToo!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi there! 👋
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thanks for signing up for WeCanDoToo! We're excited to have you join our community of readers and writers.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            To get started, please confirm your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              Confirm Your Email
            </a>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #333; margin-top: 0;">What's next?</h3>
            <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Explore thought-provoking articles and tutorials</li>
              <li>Connect with like-minded readers and writers</li>
              <li>Share your own stories and insights</li>
              <li>Get the latest updates delivered to your inbox</li>
            </ul>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            Having trouble with the button? Copy and paste this link into your browser:<br>
            <a href="${confirmationUrl}" style="color: #2563eb; word-break: break-all;">${confirmationUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>© 2025 WeCanDoToo. All rights reserved.</p>
            <p>
              <a href="mailto:hello@wecandotoo.com" style="color: #9ca3af;">hello@wecandotoo.com</a> | 
              <a href="https://wecandotoo.com" style="color: #9ca3af;">wecandotoo.com</a>
            </p>
          </div>
        </div>
      `
    },
    recovery: {
      subject: "Reset your WeCanDoToo password",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">WeCanDoToo</h1>
            <p style="color: #666; margin: 5px 0;">Discover Amazing Stories</p>
          </div>
          
          <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi there!
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your WeCanDoToo account associated with ${email}.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This link will expire in 24 hours for security reasons.
          </p>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
          </p>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            Having trouble with the button? Copy and paste this link into your browser:<br>
            <a href="${confirmationUrl}" style="color: #dc2626; word-break: break-all;">${confirmationUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>© 2025 WeCanDoToo. All rights reserved.</p>
            <p>
              <a href="mailto:hello@wecandotoo.com" style="color: #9ca3af;">hello@wecandotoo.com</a> | 
              <a href="https://wecandotoo.com" style="color: #9ca3af;">wecandotoo.com</a>
            </p>
          </div>
        </div>
      `
    },
    magic_link: {
      subject: "Your WeCanDoToo magic link",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">WeCanDoToo</h1>
            <p style="color: #666; margin: 5px 0;">Discover Amazing Stories</p>
          </div>
          
          <h2 style="color: #333; text-align: center;">Your Magic Link</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi there!
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Click the button below to sign in to your WeCanDoToo account:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              Sign In to WeCanDoToo
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This link will expire in 24 hours for security reasons.
          </p>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            If you didn't request this sign-in link, you can safely ignore this email.
          </p>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            Having trouble with the button? Copy and paste this link into your browser:<br>
            <a href="${confirmationUrl}" style="color: #059669; word-break: break-all;">${confirmationUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>© 2025 WeCanDoToo. All rights reserved.</p>
            <p>
              <a href="mailto:hello@wecandotoo.com" style="color: #9ca3af;">hello@wecandotoo.com</a> | 
              <a href="https://wecandotoo.com" style="color: #9ca3af;">wecandotoo.com</a>
            </p>
          </div>
        </div>
      `
    }
  };

  return templates[type as keyof typeof templates] || templates.signup;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, token, redirect_url, site_url }: AuthEmailRequest = await req.json();

    if (!email || !type || !token || !site_url) {
      throw new Error('Missing required parameters: email, type, token, and site_url');
    }

    // Construct the confirmation URL based on type
    let confirmationUrl = '';
    const baseUrl = site_url.replace(/\/$/, ''); // Remove trailing slash

    switch (type) {
      case 'signup':
        confirmationUrl = `${baseUrl}/auth/confirm?token=${token}&type=signup&email=${encodeURIComponent(email)}`;
        if (redirect_url) {
          confirmationUrl += `&redirect_to=${encodeURIComponent(redirect_url)}`;
        }
        break;
      case 'recovery':
        confirmationUrl = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
        break;
      case 'magic_link':
        confirmationUrl = `${baseUrl}/auth/confirm?token=${token}&type=magiclink&email=${encodeURIComponent(email)}`;
        if (redirect_url) {
          confirmationUrl += `&redirect_to=${encodeURIComponent(redirect_url)}`;
        }
        break;
      case 'email_change':
        confirmationUrl = `${baseUrl}/auth/confirm?token=${token}&type=email_change&email=${encodeURIComponent(email)}`;
        break;
      default:
        confirmationUrl = `${baseUrl}/auth/confirm?token=${token}&email=${encodeURIComponent(email)}`;
    }

    const template = getEmailTemplate(type, email, confirmationUrl);
    
    const emailResponse = await resend.emails.send({
      from: "WeCanDoToo <hello@wecandotoo.com>",
      to: [email],
      subject: template.subject,
      html: template.html,
    });

    console.log(`${type} email sent successfully:`, emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      type,
      confirmationUrl 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error(`Error in auth-email-template function:`, error);
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
