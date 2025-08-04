import { supabase } from '@/integrations/supabase/client';

export interface Subscriber {
  id: string;
  email: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  confirmation_token: string;
  confirmed_at?: string;
  unsubscribed_at?: string;
  created_at: string;
  updated_at: string;
}

// Subscribe to newsletter
export const subscribeToNewsletter = async (email: string) => {
  try {
    console.log('Attempting to subscribe:', email);
    
    // Test if we can connect to Supabase
    const { data: testData, error: testError } = await supabase
      .from('subscribers')
      .select('count', { count: 'exact' });
    
    if (testError) {
      console.error('Connection test failed:', testError);
      throw new Error('Database connection failed');
    }
    
    console.log('Database connection successful, subscriber count:', testData);
    
    // Insert without confirmation_token - let the trigger generate it
    const { data, error } = await supabase
      .from('subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      if (error.code === '42501') {
        throw new Error('Permission denied. Database policy is blocking the insert.');
      }
      if (error.code === '23505') {
        throw new Error('This email is already subscribed');
      }
      if (error.message.includes('relation "subscribers" does not exist')) {
        throw new Error('Database table not found. Please run the migration first.');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Subscription successful:', data);
    
    // Send confirmation email if we have the token
    if (data.confirmation_token) {
      await sendConfirmationEmail(data.email, data.confirmation_token);
    }
    
    return data;

  } catch (error: any) {
    console.error('Error in subscribeToNewsletter:', error);
    throw error;
  }
};

// Confirm subscription
export const confirmSubscription = async (token: string) => {
  try {
    if (!token || token.length < 16) {
      throw new Error('Invalid confirmation token');
    }

    const { data, error } = await supabase
      .from('subscribers')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      })
      .eq('confirmation_token', token)
      .eq('status', 'pending')
      .select()
      .single();

    if (error || !data) {
      throw new Error('Invalid or expired confirmation link');
    }

    return data;
  } catch (error: any) {
    console.error('Error confirming subscription:', error);
    throw error;
  }
};

// Unsubscribe
export const unsubscribeFromNewsletter = async (token: string) => {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('confirmation_token', token)
      .select()
      .single();

    if (error || !data) {
      throw new Error('Invalid unsubscribe token');
    }

    return data;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    throw error;
  }
};

// Get all confirmed subscribers (admin only)
export const getConfirmedSubscribers = async () => {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    throw error;
  }
};

// Send confirmation email (placeholder - you'll need to implement with your email service)
const sendConfirmationEmail = async (email: string, token: string) => {
  // This is a placeholder. You'll need to implement this with your email service
  // (SendGrid, Mailgun, AWS SES, etc.)
  
  const confirmationUrl = `${window.location.origin}/confirm-subscription?token=${token}`;
  
  console.log(`Send confirmation email to ${email}`);
  console.log(`Confirmation URL: ${confirmationUrl}`);
  
  // For now, we'll just log it. In production, you'd send an actual email
  // Example with a hypothetical email service:
  /*
  await emailService.send({
    to: email,
    subject: 'Confirm your subscription to wecandotoo',
    html: `
      <h2>Welcome to wecandotoo!</h2>
      <p>Thanks for subscribing to our newsletter. Please confirm your subscription by clicking the link below:</p>
      <a href="${confirmationUrl}">Confirm Subscription</a>
      <p>If you didn't subscribe, you can safely ignore this email.</p>
    `
  });
  */
};