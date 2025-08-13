-- Configure auth email settings for WeCanDoToo
-- This migration sets up email confirmations and custom SMTP settings

-- Enable email confirmations for signup
UPDATE auth.config 
SET enable_confirmations = true,
    double_confirm_changes = true,
    secure_email_change_enabled = false
WHERE instance_id = '00000000-0000-0000-0000-000000000000';

-- Insert custom email templates
INSERT INTO auth.email_templates (type, subject, content, content_html) 
VALUES 
-- Signup confirmation email
('confirmation', 
 'Welcome to WeCanDoToo - Confirm your account',
 'Hi there! Thanks for signing up for WeCanDoToo. Please confirm your email address by clicking the link below: {{ .ConfirmationURL }}',
 '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to WeCanDoToo</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">WeCanDoToo</h1>
        <p style="color: #666; margin: 5px 0;">Discover Amazing Stories</p>
    </div>
    
    <h2 style="color: #333; text-align: center;">Welcome to WeCanDoToo!</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Hi there! 👋</p>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        Thanks for signing up for WeCanDoToo! We''re excited to have you join our community of readers and writers.
    </p>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
        To get started, please confirm your email address by clicking the button below:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" 
           style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
            Confirm Your Email
        </a>
    </div>
    
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <h3 style="color: #333; margin-top: 0;">What''s next?</h3>
        <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Explore thought-provoking articles and tutorials</li>
            <li>Connect with like-minded readers and writers</li>
            <li>Share your own stories and insights</li>
            <li>Get the latest updates delivered to your inbox</li>
        </ul>
    </div>
    
    <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
        If you didn''t create an account, you can safely ignore this email.
    </p>
    
    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
        Having trouble with the button? Copy and paste this link into your browser:<br>
        <a href="{{ .ConfirmationURL }}" style="color: #2563eb; word-break: break-all;">{{ .ConfirmationURL }}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <div style="text-align: center; color: #9ca3af; font-size: 12px;">
        <p>© 2025 WeCanDoToo. All rights reserved.</p>
        <p>
            <a href="mailto:hello@wecandotoo.com" style="color: #9ca3af;">hello@wecandotoo.com</a> | 
            <a href="https://wecandotoo.com" style="color: #9ca3af;">wecandotoo.com</a>
        </p>
    </div>
</body>
</html>'),

-- Password recovery email
('recovery', 
 'Reset your WeCanDoToo password',
 'Hi there! We received a request to reset your password for your WeCanDoToo account. Click the link below to reset your password: {{ .ConfirmationURL }}',
 '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Your Password - WeCanDoToo</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">WeCanDoToo</h1>
        <p style="color: #666; margin: 5px 0;">Discover Amazing Stories</p>
    </div>
    
    <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Hi there!</p>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        We received a request to reset your password for your WeCanDoToo account.
    </p>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
        Click the button below to reset your password:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" 
           style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
            Reset Password
        </a>
    </div>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        This link will expire in 24 hours for security reasons.
    </p>
    
    <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
        If you didn''t request a password reset, you can safely ignore this email. Your password won''t be changed.
    </p>
    
    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
        Having trouble with the button? Copy and paste this link into your browser:<br>
        <a href="{{ .ConfirmationURL }}" style="color: #dc2626; word-break: break-all;">{{ .ConfirmationURL }}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <div style="text-align: center; color: #9ca3af; font-size: 12px;">
        <p>© 2025 WeCanDoToo. All rights reserved.</p>
        <p>
            <a href="mailto:hello@wecandotoo.com" style="color: #9ca3af;">hello@wecandotoo.com</a> | 
            <a href="https://wecandotoo.com" style="color: #9ca3af;">wecandotoo.com</a>
        </p>
    </div>
</body>
</html>'),

-- Magic link email
('magic_link', 
 'Your WeCanDoToo magic link',
 'Hi there! Click the link below to sign in to your WeCanDoToo account: {{ .ConfirmationURL }}',
 '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your Magic Link - WeCanDoToo</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">WeCanDoToo</h1>
        <p style="color: #666; margin: 5px 0;">Discover Amazing Stories</p>
    </div>
    
    <h2 style="color: #333; text-align: center;">Your Magic Link</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Hi there!</p>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
        Click the button below to sign in to your WeCanDoToo account:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" 
           style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
            Sign In to WeCanDoToo
        </a>
    </div>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        This link will expire in 24 hours for security reasons.
    </p>
    
    <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
        If you didn''t request this sign-in link, you can safely ignore this email.
    </p>
    
    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
        Having trouble with the button? Copy and paste this link into your browser:<br>
        <a href="{{ .ConfirmationURL }}" style="color: #059669; word-break: break-all;">{{ .ConfirmationURL }}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <div style="text-align: center; color: #9ca3af; font-size: 12px;">
        <p>© 2025 WeCanDoToo. All rights reserved.</p>
        <p>
            <a href="mailto:hello@wecandotoo.com" style="color: #9ca3af;">hello@wecandotoo.com</a> | 
            <a href="https://wecandotoo.com" style="color: #9ca3af;">wecandotoo.com</a>
        </p>
    </div>
</body>
</html>')
ON CONFLICT (type) DO UPDATE SET
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    updated_at = now();

-- Set SMTP configuration (to be configured in Supabase dashboard)
-- Note: These settings need to be configured in your Supabase project dashboard
-- under Authentication > Settings > SMTP Settings:
--
-- SMTP Host: your-smtp-host (e.g., smtp.mailgun.org)
-- SMTP Port: 587
-- SMTP User: hello@wecandotoo.com
-- SMTP Pass: your-smtp-password
-- SMTP Sender Name: WeCanDoToo
-- SMTP Admin Email: hello@wecandotoo.com

COMMENT ON TABLE auth.email_templates IS 'Custom email templates for WeCanDoToo authentication emails sent from hello@wecandotoo.com';
