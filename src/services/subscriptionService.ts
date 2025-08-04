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
    
    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing subscriber:', checkError);
      throw new Error(`Database error: ${checkError.message}`);
    }
    
    // Handle existing subscriber cases
    if (existingSubscriber) {
      if (existingSubscriber.status === 'confirmed') {
        throw new Error('ALREADY_CONFIRMED');
      } else if (existingSubscriber.status === 'pending') {
        // Resend confirmation email for pending subscription
        await sendConfirmationEmail(existingSubscriber.email, existingSubscriber.confirmation_token);
        return { ...existingSubscriber, resent: true };
      } else if (existingSubscriber.status === 'unsubscribed') {
        // Reactivate unsubscribed user
        const { data: reactivatedData, error: reactivateError } = await supabase
          .from('subscribers')
          .update({
            status: 'pending',
            unsubscribed_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSubscriber.id)
          .select()
          .single();
        
        if (reactivateError) {
          throw new Error(`Failed to reactivate subscription: ${reactivateError.message}`);
        }
        
        await sendConfirmationEmail(reactivatedData.email, reactivatedData.confirmation_token);
        return { ...reactivatedData, reactivated: true };
      }
    }
    
    // Insert new subscriber
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

// Send confirmation email using Supabase Edge Function
const sendConfirmationEmail = async (email: string, token: string) => {
  try {
    const siteUrl = window.location.origin;
    
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        email,
        confirmationToken: token,
        siteUrl
      }
    });
    
    if (error) {
      console.error('Error sending confirmation email:', error);
      // Don't throw error here as subscription was successful
      // Just log the error and continue
    } else {
      console.log('Confirmation email sent successfully:', data);
    }
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    // Don't throw error here as subscription was successful
  }
};

// Resend confirmation email
export const resendConfirmationEmail = async (email: string) => {
  try {
    // Get the subscriber's confirmation token
    const { data: subscriber, error } = await supabase
      .from('subscribers')
      .select('confirmation_token, status')
      .eq('email', email.toLowerCase().trim())
      .eq('status', 'pending')
      .single();
    
    if (error || !subscriber) {
      throw new Error('Subscriber not found or already confirmed');
    }
    
    await sendConfirmationEmail(email, subscriber.confirmation_token);
    return { success: true };
  } catch (error: any) {
    console.error('Error resending confirmation email:', error);
    throw error;
  }
};