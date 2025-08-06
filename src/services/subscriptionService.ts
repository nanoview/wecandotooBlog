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
      
      if (error.code === '23505') {
        throw new Error('This email is already subscribed');
      }
      if (error.message.includes('relation "subscribers" does not exist')) {
        throw new Error('Database table not found. Please run the migration first.');
      }
      if (error.message.includes('permission denied')) {
        throw new Error('Permission denied. Please check database policies.');
      }
      throw new Error(error.message || 'Failed to subscribe');
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

// Get all subscribers (admin/nanopro only)
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
        throw new Error('Access denied. Admin privileges or nanopro subscription required.');
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

// Get subscriber statistics (admin/nanopro only)
export const getSubscriberStats = async () => {
  try {
    console.log('Fetching subscriber statistics...');
    
    const { data, error } = await supabase
      .from('subscribers')
      .select('status');

    if (error) {
      console.error('Error fetching subscriber stats:', error);
      
      if (error.code === '42501' || error.message.includes('permission denied')) {
        throw new Error('Access denied. Admin privileges or nanopro subscription required.');
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

// Check if current user has nanopro access
export const checkNanoproAccess = async () => {
  try {
    const { data, error } = await supabase.rpc('is_nanopro');
    
    if (error) {
      console.error('Error checking nanopro access:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in checkNanoproAccess:', error);
    return false;
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
    const [isAdmin, isNanopro] = await Promise.all([
      checkAdminAccess(),
      checkNanoproAccess()
    ]);
    
    return {
      isAdmin,
      isNanopro,
      accessLevel: isAdmin ? 'admin' : isNanopro ? 'nanopro' : 'basic'
    };
  } catch (error) {
    console.error('Error getting user access level:', error);
    return {
      isAdmin: false,
      isNanopro: false,
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