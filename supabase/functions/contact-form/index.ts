import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3?dts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ContactFormRequest {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
  isReply?: boolean;
  originalMessageId?: string;
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

    const { firstName, lastName, email, subject, message, userId, isReply, originalMessageId }: ContactFormRequest = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      throw new Error('All fields are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate message length (prevent spam)
    if (message.length < 10) {
      throw new Error('Message must be at least 10 characters long');
    }

    if (message.length > 5000) {
      throw new Error('Message must be less than 5000 characters');
    }

    // Handle reply emails differently
    if (isReply && originalMessageId) {
      console.log('Processing reply email to:', email);
      
      // Send reply email directly without storing in database
      const zohoEmail = Deno.env.get("ZOHO_MAIL_EMAIL");
      const zohoPassword = Deno.env.get("ZOHO_MAIL_PASSWORD");

      if (!zohoEmail || !zohoPassword) {
        throw new Error('Email configuration not available');
      }

      // Create SMTP client
      const client = new SMTPClient({
        connection: {
          hostname: "smtp.zoho.com",
          port: 587,
          tls: true,
          auth: {
            username: zohoEmail,
            password: zohoPassword,
          },
        },
      });

      // Prepare reply email content
      const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
      const replyBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reply from WeCanDoToo</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">WeCanDoToo.com</h1>
        <p style="color: #f0f0f0; margin: 5px 0 0 0; font-size: 14px;">Professional Response</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="margin-top: 0;">Hi ${firstName},</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <div style="white-space: pre-wrap; font-family: inherit;">${message}</div>
        </div>
        
        <p>Best regards,<br>
        <strong>WeCanDoToo Team</strong><br>
        <a href="https://wecandotoo.com" style="color: #3b82f6; text-decoration: none;">WeCanDoToo.com</a></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                📧 This email was sent from hello@wecandotoo.com in response to your inquiry.<br>
                Feel free to reply directly to this email for further assistance.
            </p>
        </div>
    </div>
    
    <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
        <p>© ${new Date().getFullYear()} WeCanDoToo.com - All rights reserved</p>
    </div>
</body>
</html>
      `;

      // Send reply email
      await client.send({
        from: zohoEmail, // hello@wecandotoo.com
        to: email,       // Send TO the original contact person
        subject: replySubject,
        content: message, // Plain text version
        html: replyBody,  // HTML version
      });

      await client.close();
      console.log('Reply email sent successfully to:', email);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Reply sent successfully!',
          type: 'reply'
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Only insert contact message into database for NEW submissions (not replies)
    const { data: contactMessage, error: insertError } = await supabase
      .from('contact_messages')
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.toLowerCase().trim(),
        subject: subject.trim(),
        message: message.trim(),
        user_id: userId || null,
        status: 'new'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save contact message');
    }

    console.log('Contact message saved successfully:', contactMessage.id);

    // Send notification email using Zoho Mail SMTP
    try {
      const zohoEmail = Deno.env.get("ZOHO_MAIL_EMAIL");
      const zohoPassword = Deno.env.get("ZOHO_MAIL_PASSWORD");
      const adminEmail = Deno.env.get("ADMIN_EMAIL") || "hello@wecandotoo.com";

      if (zohoEmail && zohoPassword) {
        console.log('Sending notification email via Zoho Mail SMTP...');
        
        // Create SMTP client with Zoho Mail settings
        const client = new SMTPClient({
          connection: {
            hostname: "smtp.zoho.com",
            port: 587, // TLS port
            tls: true,
            auth: {
              username: zohoEmail,
              password: zohoPassword,
            },
          },
        });

        // Prepare email content
        const emailSubject = `New Contact Form Submission: ${subject}`;
        const emailBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>New Contact Message</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            📧 New Contact Form Submission
        </h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Contact Details</h3>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message ID:</strong> ${contactMessage.id}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #1e40af;">Message</h3>
            <div style="white-space: pre-wrap; font-family: 'Courier New', monospace; background: #f9fafb; padding: 15px; border-radius: 4px;">
${message}
            </div>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="margin: 0; font-size: 14px; color: #047857;">
                💡 <strong>Quick Response:</strong> Reply directly to <a href="mailto:${email}">${email}</a> to respond to this inquiry.
            </p>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
            This email was automatically generated from the WeCanDoToo.com contact form.
        </p>
    </div>
</body>
</html>
        `;

        // Send email
        await client.send({
          from: zohoEmail,
          to: adminEmail,
          replyTo: email, // Allow easy reply to the contact person
          subject: emailSubject,
          content: emailBody,
          html: emailBody,
        });

        await client.close();
        console.log('Notification email sent successfully via Zoho Mail');
        
        // Send auto-reply to the contact person
        try {
          const autoReplyClient = new SMTPClient({
            connection: {
              hostname: "smtp.zoho.com",
              port: 587,
              tls: true,
              auth: {
                username: zohoEmail,
                password: zohoPassword,
              },
            },
          });

          const autoReplySubject = "Thank you for contacting WeCanDoToo - We'll be in touch soon!";
          const autoReplyBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Thank you for your message</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            ✅ Message Received - Thank You!
        </h2>
        
        <p>Hi ${firstName},</p>
        
        <p>Thank you for reaching out to us! We've successfully received your message and really appreciate you taking the time to contact us.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Your Message Summary</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Reference ID:</strong> ${contactMessage.id}</p>
        </div>
        
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <p style="margin: 0;"><strong>⏱️ What happens next?</strong></p>
            <p style="margin: 5px 0 0 0;">Our team will review your message and get back to you within 24 hours during business days.</p>
        </div>
        
        <p>In the meantime, feel free to explore our website at <a href="https://wecandotoo.com" style="color: #2563eb;">WeCanDoToo.com</a> for helpful resources and insights.</p>
        
        <p>Best regards,<br>
        <strong>The WeCanDoToo Team</strong></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
            📧 This is an automated confirmation email. Please do not reply to this message.<br>
            If you need immediate assistance, please visit our website or send a new message.
        </p>
    </div>
</body>
</html>
          `;

          await autoReplyClient.send({
            from: zohoEmail,
            to: email,
            subject: autoReplySubject,
            content: autoReplyBody,
            html: autoReplyBody,
          });

          await autoReplyClient.close();
          console.log('Auto-reply email sent successfully');
        } catch (autoReplyError) {
          console.error('Error sending auto-reply email:', autoReplyError);
          // Don't fail if auto-reply fails
        }

      } else {
        console.log('Zoho Mail SMTP not configured, skipping email notifications');
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the contact form submission if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Your message has been sent successfully! We\'ll get back to you soon.',
        id: contactMessage.id
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in contact-form function:", error);
    
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
