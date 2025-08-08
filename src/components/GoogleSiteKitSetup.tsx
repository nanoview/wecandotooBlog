import React, { useState, useEffect } from 'react';
import { GoogleSiteKitService } from '@/services/googleSiteKitService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Settings, 
  ExternalLink,
  Shield,
  BarChart3,
  DollarSign,
  Search
} from 'lucide-react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
  action?: () => void;
  actionText?: string;
}

export const GoogleSiteKitSetup: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const existingConfig = await GoogleSiteKitService.getConfig();
      setConfig(existingConfig);
    } catch (err) {
      console.error('Error loading configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectToGoogle = () => {
    const authUrl = `https://accounts.google.com/oauth2/auth?` +
      `client_id=622861962504-a2ob64p9ve0drgal7ncoujm58mmsitjr.apps.googleusercontent.com&` +
      `redirect_uri=https://rowcloxlszwnowlggqon.supabase.co/functions/v1/google-oauth&` +
      `response_type=code&` +
      `scope=https://www.googleapis.com/auth/adsense.readonly https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.open(authUrl, '_blank', 'width=500,height=600');
  };

  const openGoogleCloudConsole = () => {
    window.open('https://console.cloud.google.com/', '_blank');
  };

  const openAnalyticsSetup = () => {
    window.open('https://analytics.google.com/', '_blank');
  };

  const openAdSenseSetup = () => {
    window.open('https://www.google.com/adsense/', '_blank');
  };

  const openSearchConsoleSetup = () => {
    window.open('https://search.google.com/search-console/', '_blank');
  };

  const setupSteps: SetupStep[] = [
    {
      id: 'oauth',
      title: 'Connect your Google account',
      description: 'Authorize Site Kit to access your Google services',
      completed: config?.is_connected || false,
      icon: <Shield className="h-5 w-5" />,
      action: connectToGoogle,
      actionText: 'Connect to Google'
    },
    {
      id: 'analytics',
      title: 'Set up Google Analytics',
      description: 'Track website traffic and user behavior',
      completed: config?.enable_analytics && !!config?.analytics_property_id,
      icon: <BarChart3 className="h-5 w-5" />,
      action: openAnalyticsSetup,
      actionText: 'Configure Analytics'
    },
    {
      id: 'adsense',
      title: 'Set up Google AdSense',
      description: 'Monetize your website with ads',
      completed: config?.enable_adsense && !!config?.adsense_publisher_id,
      icon: <DollarSign className="h-5 w-5" />,
      action: openAdSenseSetup,
      actionText: 'Configure AdSense'
    },
    {
      id: 'search-console',
      title: 'Set up Google Search Console',
      description: 'Monitor search performance and SEO',
      completed: config?.enable_search_console && !!config?.search_console_site_url,
      icon: <Search className="h-5 w-5" />,
      action: openSearchConsoleSetup,
      actionText: 'Configure Search Console'
    }
  ];

  const completedSteps = setupSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / setupSteps.length) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading setup...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Welcome to Site Kit by Google</h1>
        <p className="text-lg text-muted-foreground">
          Get insights about how your site is performing and being discovered
        </p>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-medium">{completedSteps} of {setupSteps.length} completed</span>
            <Badge variant={completedSteps === setupSteps.length ? "default" : "secondary"}>
              {Math.round(progressPercentage)}%
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Setup Complete */}
      {completedSteps === setupSteps.length && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Setup Complete!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your Site Kit is fully configured. You can now view insights from all your Google services.
          </AlertDescription>
        </Alert>
      )}

      {/* Setup Steps */}
      <div className="space-y-4">
        {setupSteps.map((step, index) => (
          <Card key={step.id} className={`transition-all duration-200 ${
            step.completed ? 'border-green-200 bg-green-50/50' : 
            index === currentStep ? 'border-primary' : ''
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    step.completed ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.completed ? <CheckCircle className="h-5 w-5" /> : step.icon}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {step.title}
                      {step.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {step.completed ? (
                    <Badge variant="default">Complete</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            {!step.completed && step.action && (
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Ready to set up?</p>
                    <p className="text-xs text-muted-foreground">
                      Click the button to continue with this step
                    </p>
                  </div>
                  <Button onClick={step.action} className="flex items-center gap-2">
                    {step.actionText}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Need Help?
          </CardTitle>
          <CardDescription>
            Additional resources to help you get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Setup Guides</h4>
              <div className="space-y-1 text-sm">
                <Button variant="link" className="h-auto p-0 text-left justify-start" onClick={openGoogleCloudConsole}>
                  Google Cloud Console Setup
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
                <Button variant="link" className="h-auto p-0 text-left justify-start" onClick={openAnalyticsSetup}>
                  Analytics Configuration
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
                <Button variant="link" className="h-auto p-0 text-left justify-start" onClick={openAdSenseSetup}>
                  AdSense Setup
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">What You'll Get</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Website traffic insights</li>
                <li>• Search performance data</li>
                <li>• Ad revenue tracking</li>
                <li>• SEO recommendations</li>
                <li>• Performance alerts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {completedSteps > 0 && completedSteps < setupSteps.length && (
        <div className="text-center">
          <Button onClick={() => setCurrentStep(currentStep + 1)} className="flex items-center gap-2">
            Continue Setup
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default GoogleSiteKitSetup;