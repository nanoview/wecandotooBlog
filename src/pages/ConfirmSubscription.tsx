import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { confirmSubscription } from '@/services/subscriptionService';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const ConfirmSubscription = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  const token = searchParams.get('token');

  useEffect(() => {
    const confirmSub = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid confirmation link');
        return;
      }

      try {
        await confirmSubscription(token);
        setStatus('success');
        setMessage('Your subscription has been confirmed! You\'ll now receive our latest articles.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to confirm subscription');
      }
    };

    confirmSub();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Confirming your subscription...</h2>
              <p className="text-gray-600">Please wait while we process your confirmation.</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-green-800">Subscription Confirmed!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link to="/">
                <Button className="w-full">
                  Continue to Blog
                </Button>
              </Link>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-red-800">Confirmation Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmSubscription;