import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, ExternalLink, RefreshCw, Settings, Shield, Key } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface GoogleService {
  id: string;
  name: string;
  description: string;
  icon: string;
  scopes: string[];
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  isRequired: boolean;
}

const GOOGLE_SERVICES: GoogleService[] = [
  {
    id: 'analytics',
    name: 'Google Analytics',
    description: 'View your website traffic and user behavior data',
    icon: '📊',
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    status: 'disconnected',
    isRequired: true
  },
  {
    id: 'adsense',
    name: 'Google AdSense',
    description: 'Monitor your ad performance and earnings',
    icon: '💰',
    scopes: ['https://www.googleapis.com/auth/adsense.readonly'],
    status: 'disconnected',
    isRequired: false
  },
  {
    id: 'search-console',
    name: 'Google Search Console',
    description: 'Track your search performance and indexing',
    icon: '🔍',
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    status: 'disconnected',
    isRequired: true
  }
];

export const WordPressSiteKitOAuth: React.FC = () => {
  const [services, setServices] = useState<GoogleService[]>(GOOGLE_SERVICES);
  const [currentStep, setCurrentStep] = useState<'setup' | 'connect' | 'verify' | 'complete'>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthWindow, setOauthWindow] = useState<Window | null>(null);
  const [credentials, setCredentials] = useState<any>(null);

  useEffect(() => {
    // Listen for OAuth callback messages
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'oauth_success') {
        handleOAuthSuccess(event.data.credentials);
      } else if (event.data.type === 'oauth_error') {
        handleOAuthError(event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleOAuthSuccess = async (creds: any) => {
    setIsLoading(false);
    setCredentials(creds);
    
    // Store credentials in Supabase
    await storeCredentials(creds);
    
    // Update service statuses
    setServices(prev => prev.map(service => ({
      ...service,
      status: 'connected'
    })));
    
    setCurrentStep('complete');
    
    if (oauthWindow) {
      oauthWindow.close();
      setOauthWindow(null);
    }
  };

  const handleOAuthError = (errorMsg: string) => {
    setIsLoading(false);
    setError(errorMsg);
    
    if (oauthWindow) {
      oauthWindow.close();
      setOauthWindow(null);
    }
  };

  const startOAuthFlow = async (selectedServices: string[] = ['all']) => {
    setIsLoading(true);
    setError(null);
    setCurrentStep('connect');

    // Determine scopes based on selected services
    let scopes = ['openid', 'email', 'profile'];
    
    if (selectedServices.includes('all')) {
      scopes = scopes.concat(
        services.flatMap(service => service.scopes)
      );
    } else {
      selectedServices.forEach(serviceId => {
        const service = services.find(s => s.id === serviceId);
        if (service) {
          scopes = scopes.concat(service.scopes);
        }
      });
    }

    // Update service statuses
    setServices(prev => prev.map(service => ({
      ...service,
      status: selectedServices.includes('all') || selectedServices.includes(service.id) 
        ? 'connecting' 
        : service.status
    })));

    // Build OAuth URL
    const authUrl = new URL('https://accounts.google.com/oauth2/auth');
    authUrl.searchParams.set('client_id', import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '622861962504-a2ob64p9ve0drgal7ncoujm58mmsitjr.apps.googleusercontent.com');
    authUrl.searchParams.set('redirect_uri', 'https://rowcloxlszwnowlggqon.supabase.co/functions/v1/google-oauth');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes.join(' '));
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('include_granted_scopes', 'true');

    console.log('OAuth URL:', authUrl.toString());

    // Open OAuth popup
    const popup = window.open(
      authUrl.toString(),
      'google_oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    setOauthWindow(popup);

    // Check if popup was blocked
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setError('Popup blocked! Please allow popups for this site and try again.');
      setIsLoading(false);
      return;
    }

    // Monitor popup
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        if (currentStep === 'connect') {
          setError('OAuth flow was cancelled');
          setIsLoading(false);
        }
      }
    }, 1000);
  };

  const storeCredentials = async (creds: any) => {
    try {
      // Store in google_site_kit table
      const { error } = await supabase
        .from('google_site_kit')
        .upsert({
          oauth_access_token: creds.access_token,
          oauth_refresh_token: creds.refresh_token,
          oauth_expires_at: new Date(Date.now() + (creds.expires_in * 1000)).toISOString(),
          enabled_apis: services.map(s => s.id),
          oauth_scopes: services.flatMap(s => s.scopes),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing credentials:', error);
        throw error;
      }

      console.log('✅ Credentials stored successfully');
    } catch (error) {
      console.error('Failed to store credentials:', error);
      setError('Failed to store credentials. Please try again.');
    }
  };

  const checkConnectionStatus = async () => {
    try {
      // Check stored credentials
      const { data, error } = await supabase
        .from('google_site_kit')
        .select('*')
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const config = data[0];
        if (config.oauth_access_token) {
          setServices(prev => prev.map(service => ({
            ...service,
            status: 'connected'
          })));
          setCurrentStep('complete');
          setCredentials(config);
        }
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  };

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const renderSetupStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Connect Your Google Services</h2>
        <p className="text-gray-600">
          Just like WordPress Site Kit, we'll help you connect your Google services to get insights about your website.
        </p>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{service.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {service.isRequired && (
                    <Badge variant="secondary">Required</Badge>
                  )}
                  <Badge 
                    variant={service.status === 'connected' ? 'default' : 'outline'}
                    className={service.status === 'connected' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {service.status === 'connected' ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      'Not Connected'
                    )}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          We use the same secure OAuth flow as WordPress Site Kit. Your credentials are encrypted and stored securely.
        </AlertDescription>
      </Alert>

      <div className="flex justify-center space-x-4">
        <Button 
          onClick={() => startOAuthFlow(['all'])}
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Key className="w-4 h-4 mr-2" />
              Connect All Services
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderConnectStep = () => (
    <div className="text-center space-y-6">
      <div className="animate-pulse">
        <RefreshCw className="w-16 h-16 mx-auto text-blue-500 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold">Connecting to Google...</h2>
      <p className="text-gray-600">
        Please complete the authorization in the popup window. This may take a few moments.
      </p>
      
      <div className="grid gap-2">
        {services.filter(s => s.status === 'connecting').map((service) => (
          <div key={service.id} className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Connecting {service.name}...</span>
          </div>
        ))}
      </div>

      <Button 
        variant="outline" 
        onClick={() => {
          if (oauthWindow) oauthWindow.close();
          setCurrentStep('setup');
          setIsLoading(false);
        }}
      >
        Cancel
      </Button>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="text-green-500">
        <CheckCircle className="w-16 h-16 mx-auto" />
      </div>
      <h2 className="text-2xl font-bold text-green-800">Successfully Connected!</h2>
      <p className="text-gray-600">
        Your Google services are now connected and ready to use, just like WordPress Site Kit.
      </p>

      <div className="grid gap-3">
        {services.filter(s => s.status === 'connected').map((service) => (
          <div key={service.id} className="flex items-center justify-center space-x-2 text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span>{service.name} connected successfully</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center space-x-4">
        <Button onClick={() => window.location.reload()}>
          <ExternalLink className="w-4 h-4 mr-2" />
          View Dashboard
        </Button>
        <Button variant="outline" onClick={() => setCurrentStep('setup')}>
          <Settings className="w-4 h-4 mr-2" />
          Manage Connections
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">🔗</span>
            <span>Google Site Kit Integration</span>
          </CardTitle>
          <CardDescription>
            WordPress-style Google services connection with secure credential storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {currentStep === 'setup' && renderSetupStep()}
          {currentStep === 'connect' && renderConnectStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </CardContent>
      </Card>
    </div>
  );
};
