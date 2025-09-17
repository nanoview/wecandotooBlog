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
  auth_user_id?: string;
  subscription_type?: 'newsletter_only' | 'signup_and_newsletter';
  terms_accepted?: boolean;
}

export interface SubscriptionOptions {
  email: string;
  password?: string;
  termsAccepted: boolean;
  createAccount?: boolean;
}

// Enhanced subscription with optional account creation
export const subscribeWithAuth = async (options: SubscriptionOptions) => {
  try {
    console.log('=== Enhanced Newsletter Subscription Started ===');
    console.log('Options:', { ...options, password: options.password ? '[REDACTED]' : undefined });
    
    // Validate email before sending
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(options.email)) {
      throw new Error('Invalid email format');
    }

    if (!options.termsAccepted) {
      throw new Error('You must accept the terms and conditions');
    }
    
    const action = options.createAccount && options.password ? 'signup_and_newsletter' : 'newsletter_only';
    
    console.log('Calling auth-newsletter-subscription function...');
    const { data, error } = await supabase.functions.invoke('auth-newsletter-subscription', {
      body: {
        email: options.email.toLowerCase().trim(),
        password: options.password,
        termsAccepted: options.termsAccepted,
        action: action
      }
    });

    console.log('Response data:', data);
    console.log('Response error:', error);

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to process subscription');
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'No response from subscription service');
    }

    return {
      success: true,
      message: data.message,
      status: data.status,
      emailSent: data.emailSent,
      authUserId: data.authUserId,
      warning: data.warning
    };

  } catch (error: any) {
    console.error('Enhanced subscription error:', error);
    
    // Fallback to simple newsletter if auth integration fails
    if (error.message.includes('auth-newsletter-subscription') && !options.createAccount) {
      console.log('Falling back to simple newsletter subscription...');
      return await subscribeToNewsletter(options.email);
    }
    
    throw error;
  }
};

// Original newsletter-only subscription (kept for backward compatibility)
export const subscribeToNewsletter = async (email: string) => {
  try {
    console.log('=== Newsletter Subscription Started ===');
    console.log('Attempting to subscribe:', email);
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Supabase client configured:', !!supabase);
    
    // Validate email before sending
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    
    // Try simple-newsletter function first as fallback
    console.log('Calling simple-newsletter function...');
    const { data, error } = await supabase.functions.invoke('simple-newsletter', {
      body: {
        email: email.toLowerCase().trim()
      }
    });

    console.log('Raw response data:', data);
    console.log('Raw response error:', error);

    if (error) {
      console.error('Supabase function error:', error);
      // Provide more specific error messages
      if (error.message.includes('duplicate')) {
        throw new Error('This email is already subscribed to our newsletter');
      }
      throw new Error(error.message || 'Failed to subscribe to newsletter');
    }

    if (!data) {
      throw new Error('No response from subscription service');
    }

    if (!data.success) {
      console.error('Function returned unsuccessful:', data);
      throw new Error(data.error || data.message || 'Subscription failed');
    }

    console.log('Newsletter subscription successful:', data);
    console.log('=== Newsletter Subscription Completed ===');
    return data;
  } catch (error: any) {
    console.error('=== Newsletter Subscription Error ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Try direct database insertion as fallback
    try {
      console.log('Attempting direct database fallback...');
      const { data: dbData, error: dbError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase().trim(),
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          subscribed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        if (dbError.code === '23505') {
          console.log('Email already exists - treating as success');
          return {
            success: true,
            message: 'Email already subscribed',
            existing: true
          };
        }
        throw dbError;
      }

      console.log('Direct database subscription successful:', dbData);
      return {
        success: true,
        message: 'Successfully subscribed via fallback method',
        subscriber_id: dbData.id
      };
    } catch (fallbackError: any) {
      console.error('Fallback method also failed:', fallbackError);
      throw new Error(error.message || 'Failed to subscribe to newsletter');
    }
  }
};

// Confirm subscription using edge function
export const confirmSubscription = async (token: string, termsAccepted: boolean = false) => {
  try {
    if (!token || token.length < 16) {
      throw new Error('Invalid confirmation token');
    }

    if (!termsAccepted) {
      throw new Error('You must accept the terms and conditions to complete your subscription');
    }

    // Call the newsletter-subscription edge function
    const { data, error } = await supabase.functions.invoke('newsletter-subscription', {
      body: {
        email: '', // Not needed for confirmation
        action: 'confirm',
        token: token,
        terms_accepted: termsAccepted
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to confirm subscription');
    }

    if (!data.success) {
      throw new Error(data.message || 'Invalid or expired confirmation link');
    }

    return data;
  } catch (error: any) {
    console.error('Error confirming subscription:', error);
    throw error;
  }
};

// Unsubscribe from newsletter
export const unsubscribeFromNewsletter = async (token: string) => {
  try {
    if (!token || token.length < 16) {
      throw new Error('Invalid unsubscribe token');
    }

    const { data, error } = await supabase
      .from('subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('confirmation_token', token)
      .neq('status', 'unsubscribed')
      .select()
      .single();

    if (error || !data) {
      throw new Error('Invalid unsubscribe link or already unsubscribed');
    }

    return data;
  } catch (error: any) {
    console.error('Error unsubscribing:', error);
    throw error;
  }
};

// Get all subscribers (admin only)
export const getAllSubscribers = async () => {
  try {
    console.log('Fetching all subscribers...');
    
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all subscribers:', error);
      
      if (error.code === '42501' || error.message.includes('permission denied')) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      if (error.code === '42P01') {
        throw new Error('Subscribers table not found. Please run the database migration.');
      }
      
      throw new Error(`Failed to fetch subscribers: ${error.message}`);
    }
    
    console.log(`Successfully fetched ${data?.length || 0} subscribers`);
    return data || [];
  } catch (error) {
    console.error('Error in getAllSubscribers:', error);
    throw error;
  }
};

// Get subscriber statistics (admin only)
export const getSubscriberStats = async () => {
  try {
    console.log('Fetching subscriber statistics...');
    
    const { data, error } = await supabase
      .from('subscribers')
      .select('status');

    if (error) {
      console.error('Error fetching subscriber stats:', error);
      
      if (error.code === '42501' || error.message.includes('permission denied')) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }
    
    const stats = {
      total_count: data?.length || 0,
      confirmed_count: data?.filter(s => s.status === 'confirmed').length || 0,
      pending_count: data?.filter(s => s.status === 'pending').length || 0,
      unsubscribed_count: data?.filter(s => s.status === 'unsubscribed').length || 0
    };
    
    console.log('Subscriber stats:', stats);
    return stats;
  } catch (error) {
    console.error('Error in getSubscriberStats:', error);
    throw error;
  }
};

// Delete subscriber (admin only)
export const deleteSubscriber = async (id: string) => {
  try {
    console.log('Deleting subscriber:', id);
    
    const { error } = await supabase
      .from('subscribers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subscriber:', error);
      
      if (error.code === '42501' || error.message.includes('permission denied')) {
        throw new Error('Access denied. Admin privileges required to delete subscribers.');
      }
      
      throw new Error(`Failed to delete subscriber: ${error.message}`);
    }
    
    console.log('Subscriber deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteSubscriber:', error);
    throw error;
  }
};

// Resend confirmation email
export const resendConfirmationEmail = async (email: string) => {
  try {
    console.log('Resending confirmation email to:', email);
    
    // Get subscriber data
    const { data: subscriber, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (error || !subscriber) {
      throw new Error('Subscriber not found or already confirmed');
    }

    // Send confirmation email
    await sendConfirmationEmail(subscriber.email, subscriber.confirmation_token);
    
    console.log('Confirmation email resent successfully');
    return true;
  } catch (error) {
    console.error('Error resending confirmation:', error);
    throw error;
  }
};

// Update subscriber status (admin only)
export const updateSubscriberStatus = async (id: string, status: 'pending' | 'confirmed' | 'unsubscribed') => {
  try {
    console.log('Updating subscriber status:', { id, status });
    
    const updateData: any = { status };
    
    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    } else if (status === 'unsubscribed') {
      updateData.unsubscribed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('subscribers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscriber status:', error);
      
      if (error.code === '42501' || error.message.includes('permission denied')) {
        throw new Error('Access denied. Admin privileges required to update subscriber status.');
      }
      
      throw new Error(`Failed to update subscriber status: ${error.message}`);
    }
    
    console.log('Subscriber status updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in updateSubscriberStatus:', error);
    throw error;
  }
};

// Check if current user has admin role
export const checkAdminAccess = async () => {
  try {
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error('Error checking admin access:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in checkAdminAccess:', error);
    return false;
  }
};

// Check if current user has specific role
export const checkUserRole = async (role: string) => {
  try {
    const { data, error } = await supabase.rpc('has_role', {
      user_uuid: (await supabase.auth.getUser()).data.user?.id,
      role_to_check: role
    });
    
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in checkUserRole:', error);
    return false;
  }
};

// Get current user's access level
export const getUserAccessLevel = async () => {
  try {
    const isAdmin = await checkAdminAccess();
    
    return {
      isAdmin,
      accessLevel: isAdmin ? 'admin' : 'basic'
    };
  } catch (error) {
    console.error('Error getting user access level:', error);
    return {
      isAdmin: false,
      accessLevel: 'basic'
    };
  }
};

// Send confirmation email with different providers
const sendConfirmationEmail = async (email: string, token: string) => {
  const confirmationUrl = `${window.location.origin}/confirm-subscription?token=${token}`;
  const unsubscribeUrl = `${window.location.origin}/unsubscribe?token=${token}`;
  
  console.log(`Send confirmation email to ${email}`);
  console.log(`Confirmation URL: ${confirmationUrl}`);
  console.log(`Unsubscribe URL: ${unsubscribeUrl}`);
  
  try {
    // Try to use Supabase Edge Function first
    const { error: edgeFunctionError } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        email,
        token,
        type: 'subscription_confirmation',
        confirmationUrl,
        unsubscribeUrl
      }
    });

    if (edgeFunctionError) {
      console.warn('Edge function failed, falling back to alternative method:', edgeFunctionError);
      
      // Fallback: Use EmailJS or other email service
      await sendEmailViaEmailJS(email, token, confirmationUrl, unsubscribeUrl);
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    // Don't throw error - subscription was successful, just email failed
    console.warn('Email sending failed, but subscription was successful');
  }
};

// Fallback email sending via EmailJS
const sendEmailViaEmailJS = async (email: string, token: string, confirmationUrl: string, unsubscribeUrl: string) => {
  try {
    const emailParams = {
      to_email: email,
      subject: 'Confirm your wecandotoo newsletter subscription',
      confirmation_url: confirmationUrl,
      unsubscribe_url: unsubscribeUrl,
      message: `
Welcome to wecandotoo!

Thanks for subscribing to our newsletter. Please confirm your subscription by clicking the link below:

${confirmationUrl}

If you didn't subscribe, you can safely ignore this email or unsubscribe here: ${unsubscribeUrl}

Best regards,
The wecandotoo team
      `
    };

    // Only attempt if EmailJS credentials are available
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const userId = import.meta.env.VITE_EMAILJS_USER_ID;

    if (!serviceId || !templateId || !userId) {
      console.warn('EmailJS credentials not configured, skipping email send');
      return;
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: userId,
        template_params: emailParams
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email via EmailJS');
    }

    console.log('Email sent successfully via EmailJS');
  } catch (error) {
    console.error('EmailJS send failed:', error);
    throw error;
  }
};

// Export confirmation and unsubscribe functionality for public routes
export const handleConfirmationFromUrl = async (token: string) => {
  try {
    const subscriber = await confirmSubscription(token);
    return {
      success: true,
      message: 'Subscription confirmed successfully!',
      subscriber
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Confirmation failed',
      error
    };
  }
};

export const handleUnsubscribeFromUrl = async (token: string) => {
  try {
    const subscriber = await unsubscribeFromNewsletter(token);
    return {
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      subscriber
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Unsubscribe failed',
      error
    };
  }
};