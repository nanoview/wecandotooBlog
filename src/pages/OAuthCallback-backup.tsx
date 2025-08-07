import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleSiteKitService } from '@/services/googleSiteKitService';
import { googleDataService } from '@/services/googleDataService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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
        
        // Try both the new Google Data Service and the existing Site Kit service
        let success = false;
        
        try {
          // Try new Google Data Service first
          success = await googleDataService.handleOAuthCallback(code, state);
          if (success) {
            setMessage('Google services connected successfully!');
          }
        } catch (dataServiceError) {
          console.warn('Google Data Service callback failed, trying Site Kit:', dataServiceError);
          
          // Fallback to existing Site Kit service
          try {
            success = await GoogleSiteKitService.handleOAuthCallback(code);
            if (success) {
              setMessage('Google Site Kit connected successfully!');
            }
          } catch (siteKitError) {
            console.error('Both services failed:', { dataServiceError, siteKitError });
            throw siteKitError;
          }
        }

        if (success) {
          setStatus('success');
          toast({
            title: "Success!",
            description: "Google services have been connected successfully.",
            variant: "default"
          });
          
          // Redirect to admin page after 2 seconds
          setTimeout(() => {
            navigate('/admin');
          }, 2000);
        } else {
          throw new Error('Failed to complete OAuth authentication');
        }

        // Handle OAuth errors
        if (error) {
          setStatus('error');
          setMessage(`Google OAuth error: ${error} - ${errorDescription || 'Unknown error'}`);
          
          toast({
            title: "Google Site Kit Authorization Failed",
            description: `${error}: ${errorDescription || 'Unknown error'}`,
            variant: "destructive"
          });

          // Update connection status in database
          await GoogleSiteKitService.updateConnectionStatus('error', `OAuth error: ${error}`);
          
          setTimeout(() => navigate('/admin'), 3000);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received from Google');
          
          toast({
            title: "Authorization Failed",
            description: "No authorization code received. Please try again.",
            variant: "destructive"
          });
          
          setTimeout(() => navigate('/admin'), 3000);
          return;
        }

        setMessage('Exchanging authorization code for access tokens...');

        // Exchange code for tokens
        const tokenResponse = await exchangeCodeForTokens(code);
        
        if (!tokenResponse.access_token) {
          throw new Error('Failed to obtain access token');
        }

        setMessage('Storing OAuth tokens securely...');

        // Store tokens in database
        const tokenStored = await GoogleSiteKitService.storeOAuthTokens({
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          expires_at: new Date(Date.now() + (tokenResponse.expires_in * 1000)).toISOString()
        });

        if (!tokenStored) {
          throw new Error('Failed to store OAuth tokens');
        }

        setMessage('Updating connection status...');

        // Update connection status
        await GoogleSiteKitService.updateConnectionStatus('connected');

        setStatus('success');
        setMessage('Google Site Kit connected successfully!');

        toast({
          title: "Google Site Kit Connected",
          description: "Successfully connected to Google services. You can now manage AdSense, Analytics, and Search Console.",
        });

        // Redirect to admin panel after success
        setTimeout(() => navigate('/admin'), 2000);

      } catch (error) {
        console.error('Google Site Kit OAuth callback error:', error);
        
        setStatus('error');
        setMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        toast({
          title: "Google Site Kit Connection Failed",
          description: "Failed to connect to Google services. Please try again.",
          variant: "destructive"
        });

        // Update error status in database
        await GoogleSiteKitService.updateConnectionStatus(
          'error', 
          error instanceof Error ? error.message : 'OAuth callback failed'
        );

        setTimeout(() => navigate('/admin'), 3000);
      }
    };

    handleGoogleSiteKitCallback();
  }, [navigate, toast]);

  // Exchange authorization code for access tokens
  const exchangeCodeForTokens = async (code: string) => {
    try {
      // Get OAuth configuration from database
      const config = await GoogleSiteKitService.getConfig();
      
      if (!config?.oauth_client_id || !config?.oauth_client_secret) {
        throw new Error('OAuth configuration not found in database');
      }

      const tokenRequest = {
        client_id: config.oauth_client_id,
        client_secret: config.oauth_client_secret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: config.oauth_redirect_uri || window.location.origin + '/oauth/callback'
      };

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-12 h-12 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            {getStatusIcon()}
          </div>
          
          <h2 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
            {status === 'processing' && 'Connecting to Google Site Kit...'}
            {status === 'success' && 'Connection Successful!'}
            {status === 'error' && 'Connection Failed'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-green-800">
                <div className="font-medium mb-2">✅ Google Services Connected:</div>
                <ul className="text-left space-y-1">
                  <li>• Google AdSense - Revenue tracking ready</li>
                  <li>• Google Analytics - Traffic analysis ready</li>
                  <li>• Google Search Console - SEO monitoring ready</li>
                </ul>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-red-800">
                <div className="font-medium mb-2">❌ Connection Failed</div>
                <p>Please try connecting again from the admin panel.</p>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500">
            {status === 'processing' && 'Please wait while we establish the connection...'}
            {status === 'success' && 'Redirecting to admin panel...'}
            {status === 'error' && 'Redirecting back to admin panel...'}
          </div>

          {(status === 'success' || status === 'error') && (
            <div className="mt-4">
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Go to Admin Panel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
