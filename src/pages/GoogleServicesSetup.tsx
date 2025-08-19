import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, ExternalLink, Settings, BarChart3, DollarSign, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface GoogleService {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'connecting';
  scopes: string[];
}

const GoogleServicesSetup: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);

  const [services, setServices] = useState<GoogleService[]>([
    {
      id: 'analytics',
      name: 'Google Analytics',
      description: 'Track website traffic, user behavior, and performance metrics',
      icon: <BarChart3 className="w-6 h-6" />,
      status: 'disconnected',
      scopes: ['https://www.googleapis.com/auth/analytics.readonly']
    },
    {
      id: 'adsense',
      name: 'Google AdSense',
      description: 'Monitor ad revenue, performance, and earnings',
      icon: <DollarSign className="w-6 h-6" />,
      status: 'disconnected',
      scopes: ['https://www.googleapis.com/auth/adsense.readonly']
    },
    {
      id: 'search-console',
      name: 'Search Console',
      description: 'Track search performance, indexing, and SEO insights',
      icon: <Search className="w-6 h-6" />,
      status: 'disconnected',
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    }
  ]);

  const handleConnectGoogle = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to connect Google services.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    setConnectionProgress(0);

    try {
      // Simulate connection progress
      const progressInterval = setInterval(() => {
        setConnectionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Build OAuth URL with all required scopes
      const allScopes = services.flatMap(service => service.scopes);
      const scopes = [...new Set([...allScopes, 'openid', 'email', 'profile'])];
      
      const oauthParams = new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '',
        redirect_uri: 'https://rowcloxlszwnowlggqon.supabase.co/functions/v1/google-oauth',
        response_type: 'code',
        scope: scopes.join(' '),
        access_type: 'offline',
        prompt: 'consent',
        state: Math.random().toString(36).substring(7)
      });

      // Check if client ID is configured
      if (!import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID) {
        throw new Error('Google OAuth Client ID is not configured. Please add VITE_GOOGLE_OAUTH_CLIENT_ID to your .env file.');
      }

      const oauthUrl = `https://accounts.google.com/oauth2/auth?${oauthParams.toString()}`;

      // Open OAuth popup
      const popup = window.open(
        oauthUrl,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'oauth_success') {
          clearInterval(progressInterval);
          setConnectionProgress(100);
          
          // Update all services to connected
          setServices(prev => prev.map(service => ({
            ...service,
            status: 'connected'
          })));

          toast({
            title: "Successfully Connected!",
            description: "All Google services are now connected and ready to use.",
          });

          popup?.close();
        } else if (event.data.type === 'oauth_error') {
          clearInterval(progressInterval);
          toast({
            title: "Connection Failed",
            description: event.data.error || "Failed to connect Google services.",
            variant: "destructive"
          });
        }

        window.removeEventListener('message', handleMessage);
        setIsConnecting(false);
      };

      window.addEventListener('message', handleMessage);

      // Handle popup closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          clearInterval(progressInterval);
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
        }
      }, 1000);

    } catch (error) {
      console.error('OAuth error:', error);
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to Google services.",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Connecting...</Badge>;
      default:
        return <Badge variant="secondary">Not Connected</Badge>;
    }
  };

  const connectedCount = services.filter(s => s.status === 'connected').length;
  const allConnected = connectedCount === services.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Connect Google Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock powerful insights and analytics by connecting your Google accounts
          </p>
        </div>

        {/* Progress Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Setup Progress
            </CardTitle>
            <CardDescription>
              {allConnected 
                ? "All services connected! You're ready to go." 
                : `${connectedCount} of ${services.length} services connected`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={(connectedCount / services.length) * 100} className="h-2" />
              {isConnecting && (
                <div className="space-y-2">
                  <Progress value={connectionProgress} className="h-2" />
                  <p className="text-sm text-gray-600 text-center">
                    Connecting to Google services... {connectionProgress}%
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {services.map((service) => (
            <Card key={service.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {service.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                    </div>
                  </div>
                  {service.status === 'connected' && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  {getStatusBadge(service.status)}
                  {service.status === 'connected' && (
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Data
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Connection Button */}
        <div className="text-center">
          {!allConnected ? (
            <Button
              onClick={handleConnectGoogle}
              disabled={isConnecting}
              size="lg"
              className="px-8 py-3 text-lg"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Connecting...
                </>
              ) : (
                'Connect All Google Services'
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-8 h-8" />
                <span className="text-2xl font-semibold">All Services Connected!</span>
              </div>
              <Button size="lg" className="px-8 py-3 text-lg">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Dashboard
              </Button>
            </div>
          )}
        </div>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What happens when you connect?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">🔒 Secure Connection</h4>
                <p className="text-gray-600">
                  Your data is encrypted and stored securely. We only access the data you explicitly authorize.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📊 Real-time Insights</h4>
                <p className="text-gray-600">
                  Get live updates on your website performance, earnings, and search rankings.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🚀 Enhanced Features</h4>
                <p className="text-gray-600">
                  Unlock advanced analytics, automated reports, and optimization recommendations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoogleServicesSetup;
