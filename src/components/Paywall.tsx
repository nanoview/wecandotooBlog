import React, { useState, useEffect } from 'react';
import { Lock, Coffee, CreditCard, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getBuyMeCoffeeUrl, getPayPalUrl, PAYMENT_CONFIG } from '@/config/payment';

interface PaywallProps {
  content: string;
  previewContent?: string;
  price?: number;
  currency?: string;
  postTitle?: string;
  onPaymentSuccess?: () => void;
}

interface PremiumAccess {
  has_access: boolean;
  access_type?: string;
  expires_at?: string;
  total_paid?: number;
  payment_count?: number;
}

const Paywall: React.FC<PaywallProps> = ({
  content,
  previewContent = '',
  price = 5,
  currency = 'EUR',
  postTitle = 'this content',
  onPaymentSuccess
}) => {
  const [premiumAccess, setPremiumAccess] = useState<PremiumAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check user's premium access status
  const checkPremiumAccess = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('check_user_premium_access');
      
      if (error) {
        console.error('Error checking premium access:', error);
      } else {
        setPremiumAccess(data);
      }
    } catch (error) {
      console.error('Error checking premium access:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPremiumAccess();
  }, [user]);

  // Handle Buy Me a Coffee payment
  const handleBuyMeCoffeePayment = () => {
    if (!user?.email) {
      toast({
        title: "Login Required",
        description: "Please log in to access premium content.",
        variant: "destructive"
      });
      return;
    }

    // Open Buy Me a Coffee in new window with user email
    const buyMeCoffeeUrl = getBuyMeCoffeeUrl({
      amount: price,
      description: `Premium access for ${postTitle}`,
      buyerEmail: user.email
    });
    
    const paymentWindow = window.open(
      buyMeCoffeeUrl,
      'BuyMeCoffeePayment',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    // Listen for payment completion (you'd need to implement webhook handling)
    const checkPayment = setInterval(() => {
      if (paymentWindow?.closed) {
        clearInterval(checkPayment);
        // Simulate payment processing (in real implementation, this would be handled by webhooks)
        handlePaymentVerification();
      }
    }, 1000);

    // Auto-close check after 10 minutes
    setTimeout(() => {
      clearInterval(checkPayment);
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close();
      }
    }, 600000);
  };

  // Handle PayPal payment
  const handlePayPalPayment = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to access premium content.",
        variant: "destructive"
      });
      return;
    }

    // Open PayPal in new window
    const paypalUrl = getPayPalUrl({
      amount: price,
      description: `Premium access for ${postTitle}`,
      currency: currency
    });
    
    const paymentWindow = window.open(
      paypalUrl,
      'PayPalPayment',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    setProcessing(true);

    // Check if payment window is closed
    const checkPayment = setInterval(() => {
      if (paymentWindow?.closed) {
        clearInterval(checkPayment);
        setProcessing(false);
        // Show manual verification option
        toast({
          title: "Payment Window Closed",
          description: "If you completed the payment, click 'I've already paid' to verify access.",
          duration: 8000
        });
      }
    }, 1000);

    // Auto-close check after 10 minutes
    setTimeout(() => {
      clearInterval(checkPayment);
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close();
      }
    }, 600000);
  };

  // Simulate payment verification (in production, this would be triggered by webhooks)
  const handlePaymentVerification = async () => {
    setProcessing(true);
    
    try {
      // In production, this would be called by your webhook handler
      const { data, error } = await supabase.rpc('process_premium_payment', {
        p_email: user?.email,
        p_payment_provider: 'buymeacoffee',
        p_amount_cents: price * 100, // Convert to cents
        p_currency: currency
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Payment Successful! ☕",
          description: "You now have premium access. Thank you for your support!",
        });
        
        // Refresh premium access status
        await checkPremiumAccess();
        
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        throw new Error(data?.error || 'Payment processing failed');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast({
        title: "Payment Verification Failed",
        description: "If you completed the payment, please contact support.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  // Manual payment verification for testing
  const handleManualVerification = async () => {
    if (!user?.email) return;
    
    setProcessing(true);
    await handlePaymentVerification();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Checking access...</p>
        </div>
      </div>
    );
  }

  // If user has premium access, show full content
  if (premiumAccess?.has_access) {
    return (
      <div>
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Premium Access Active</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            {premiumAccess.expires_at 
              ? `Access expires: ${new Date(premiumAccess.expires_at).toLocaleDateString()}`
              : 'Lifetime access'
            }
          </p>
        </div>
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    );
  }

  // Show paywall for non-premium users
  return (
    <div>
      {/* Preview content */}
      {previewContent && (
        <div className="prose max-w-none mb-6">
          <div dangerouslySetInnerHTML={{ __html: previewContent }} />
          <div className="text-center mt-4">
            <p className="text-gray-500 italic">...</p>
          </div>
        </div>
      )}

      {/* Paywall */}
      <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-white rounded-full shadow-lg">
            <Lock className="h-8 w-8 text-gray-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Premium Content
          </CardTitle>
          <p className="text-gray-600">
            Support our work and unlock the full article
          </p>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              €{price}
            </div>
            <p className="text-gray-600 mb-4">
              One-time payment for 1 year of premium access
            </p>
            
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <p>✓ Access to all premium articles</p>
              <p>✓ Support independent content creation</p>
              <p>✓ No subscription, just pay once</p>
              <p>✓ 1 year of premium access</p>
            </div>

            {user ? (
              <div className="space-y-3">
                <Button
                  onClick={handleBuyMeCoffeePayment}
                  disabled={processing}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3"
                >
                  <Coffee className="mr-2 h-5 w-5" />
                  {processing ? 'Processing...' : `Buy me a coffee - €${price}`}
                </Button>
                
                <Button
                  onClick={handlePayPalPayment}
                  disabled={processing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  {processing ? 'Processing...' : `Pay with PayPal - €${price}`}
                </Button>
                
                {/* Manual verification button for testing */}
                <Button
                  onClick={handleManualVerification}
                  disabled={processing}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  I've already paid (Verify)
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-red-600 font-medium">
                  Please log in to purchase premium access
                </p>
                <Button
                  onClick={() => window.location.href = '/auth'}
                  variant="outline"
                  className="w-full"
                >
                  Log In to Continue
                </Button>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500">
            <p>
              Powered by Buy Me a Coffee. Secure payment processing.
              <br />
              Questions? Contact us at support@yourdomain.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Paywall;
