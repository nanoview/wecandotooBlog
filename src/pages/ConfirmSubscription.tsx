import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { confirmSubscription } from '@/services/subscriptionService';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const ConfirmSubscription = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'loading' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid confirmation link');
    }
  }, [token]);

  const handleConfirmSubscription = async () => {
    if (!termsAccepted) {
      toast({
        title: "Terms & Conditions Required",
        description: "Please accept the terms and conditions to complete your subscription.",
        variant: "destructive"
      });
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('Invalid confirmation token');
      return;
    }

    try {
      setStatus('loading');
      await confirmSubscription(token, termsAccepted);
      setStatus('success');
      setMessage('Your subscription has been confirmed! Welcome to our newsletter.');
      
      toast({
        title: "Subscription Confirmed!",
        description: "Thank you for subscribing! You'll receive our latest updates.",
      });

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to confirm subscription');
      toast({
        title: "Confirmation Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive"
      });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-red-700">Invalid Link</h2>
            <p className="text-gray-600 mb-6">This confirmation link is invalid or has expired.</p>
            <Button asChild variant="outline">
              <Link to="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        {status === 'pending' && (
          <>
            <CardHeader className="text-center">
              <CardTitle>Confirm Your Newsletter Subscription</CardTitle>
              <CardDescription>
                Please review and accept our terms to complete your subscription.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">What you'll receive:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Weekly web development tips and tutorials</li>
                    <li>• Latest blog posts and updates</li>
                    <li>• Exclusive content and resources</li>
                    <li>• Career advice and industry insights</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-blue-800">Privacy Promise:</h3>
                  <p className="text-sm text-blue-700">
                    We respect your privacy. Your email will never be shared with third parties. 
                    You can unsubscribe at any time with one click.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <label 
                  htmlFor="terms" 
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  I agree to receive newsletter emails and accept the{' '}
                  <Link 
                    to="/privacy-policy" 
                    className="text-blue-600 hover:underline"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link 
                    to="/terms" 
                    className="text-blue-600 hover:underline"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>
                  .
                </label>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleConfirmSubscription}
                  disabled={!termsAccepted}
                  className="flex-1"
                >
                  Confirm Subscription
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {status === 'loading' && (
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Confirming your subscription...</h2>
            <p className="text-gray-600">Please wait while we process your confirmation.</p>
          </CardContent>
        )}
        
        {status === 'success' && (
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-green-700">Subscription Confirmed!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-4">
              Redirecting to home page in a few seconds...
            </p>
            <Button asChild>
              <Link to="/">Go to Home</Link>
            </Button>
          </CardContent>
        )}
        
        {status === 'error' && (
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-red-700">Confirmation Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button asChild variant="outline">
              <Link to="/">Return to Home</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ConfirmSubscription;