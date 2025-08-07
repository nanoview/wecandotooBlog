import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleDataService } from '@/services/googleDataService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Header from '@/components/navigation/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your authorization...');

  useEffect(() => {
    const handleGoogleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          throw new Error(errorDescription || error);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        setMessage('Completing Google authentication...');
        
        const success = await googleDataService.handleOAuthCallback(code, state);

        if (success) {
          setStatus('success');
          setMessage('Google services connected successfully!');
          
          toast({
            title: "Success!",
            description: "Google Analytics, AdSense, and Search Console are now connected.",
            variant: "default"
          });
          
          // Redirect to admin page after 3 seconds
          setTimeout(() => {
            navigate('/admin');
          }, 3000);
        } else {
          throw new Error('Failed to complete OAuth authentication');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        
        toast({
          title: "Authentication Failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
        
        // Redirect to admin page after 5 seconds
        setTimeout(() => {
          navigate('/admin');
        }, 5000);
      }
    };

    handleGoogleOAuthCallback();
  }, [searchParams, navigate, toast]);

  const handleRetryAuth = () => {
    googleDataService.authenticate();
  };

  const handleGoToAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="simple" />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              {status === 'processing' && (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  Connecting to Google...
                </>
              )}
              {status === 'success' && (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Successfully Connected!
                </>
              )}
              {status === 'error' && (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Connection Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'processing' && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {message}
                </h3>
                <p className="text-gray-600">
                  We're securely connecting your Google account to access:
                </p>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Google Analytics (Traffic & User Data)
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Google AdSense (Revenue & Performance)
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Google Search Console (SEO & Search Performance)
                  </div>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Google Services Connected!
                </h3>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-green-800 mb-2">What's Available Now:</h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Real-time website analytics and traffic data
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      AdSense earnings and performance metrics
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Search Console insights and SEO data
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Redirecting to your dashboard in a few seconds...
                </p>
                
                <Button 
                  onClick={handleGoToAdmin}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Connection Failed
                </h3>
                <p className="text-gray-600 mb-4">
                  We couldn't complete the connection to your Google account.
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800">
                    <strong>Error:</strong> {message}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleRetryAuth}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={handleGoToAdmin}
                    variant="outline"
                  >
                    Return to Dashboard
                  </Button>
                </div>
                
                <p className="text-sm text-gray-500 mt-4">
                  You'll be automatically redirected in a few seconds...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Troubleshooting Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Troubleshooting Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-3">
            <div>
              <strong>Common Solutions:</strong>
            </div>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Ensure you're logged into the correct Google account</li>
              <li>Make sure your Google account has access to Analytics, AdSense, and Search Console</li>
              <li>Check that you granted all requested permissions during authorization</li>
              <li>Try using an incognito/private browser window</li>
              <li>Clear browser cache and cookies if issues persist</li>
            </ul>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Need Help?</strong> If you continue having issues, check that your 
                Google OAuth client ID is correctly configured and that the redirect URI matches 
                your current domain.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OAuthCallback;
