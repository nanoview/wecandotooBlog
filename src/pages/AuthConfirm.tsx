import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmUser = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      const email = searchParams.get('email');
      const redirectTo = searchParams.get('redirect_to');

      if (!token) {
        setStatus('error');
        setMessage('Invalid confirmation link. Please try again.');
        return;
      }

      try {
        if (type === 'signup') {
          // Handle email confirmation for signup
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          });

          if (error) {
            throw error;
          }

          setStatus('success');
          setMessage('Your email has been confirmed! Welcome to WeCanDoToo.');
          
          toast({
            title: "Email Confirmed!",
            description: "Welcome to WeCanDoToo! You can now sign in to your account.",
          });

          // Redirect after a delay
          setTimeout(() => {
            navigate(redirectTo || '/dashboard', { replace: true });
          }, 3000);

        } else if (type === 'magiclink') {
          // Handle magic link sign in
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'magiclink',
          });

          if (error) {
            throw error;
          }

          setStatus('success');
          setMessage('Successfully signed in!');
          
          toast({
            title: "Signed In!",
            description: "Welcome back to WeCanDoToo!",
          });

          // Redirect after a delay
          setTimeout(() => {
            navigate(redirectTo || '/dashboard', { replace: true });
          }, 2000);

        } else {
          // Default email confirmation
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          });

          if (error) {
            throw error;
          }

          setStatus('success');
          setMessage('Email confirmed successfully!');
          
          setTimeout(() => {
            navigate(redirectTo || '/dashboard', { replace: true });
          }, 3000);
        }

      } catch (error: any) {
        console.error('Confirmation error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to confirm email. The link may be expired or invalid.');
        
        toast({
          title: "Confirmation Failed",
          description: error.message || "The confirmation link may be expired or invalid.",
          variant: "destructive",
        });
      }
    };

    confirmUser();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4">
              {status === 'loading' && (
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )}
              {status === 'error' && (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            <CardTitle className="text-xl font-semibold">
              {status === 'loading' && 'Confirming your email...'}
              {status === 'success' && 'Email Confirmed!'}
              {status === 'error' && 'Confirmation Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {message}
            </p>
            
            {status === 'success' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 text-sm">
                      You will be redirected automatically in a few seconds.
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    If you continue to have issues, please contact us at{' '}
                    <a 
                      href="mailto:hello@wecandotoo.com" 
                      className="underline hover:text-red-900"
                    >
                      hello@wecandotoo.com
                    </a>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/auth/signin')}
                    className="flex-1"
                  >
                    Try Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth/signup')}
                    className="flex-1"
                  >
                    Sign Up Again
                  </Button>
                </div>
              </div>
            )}
            
            {status === 'loading' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Need help?{' '}
            <a 
              href="mailto:hello@wecandotoo.com" 
              className="text-blue-600 hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthConfirm;
