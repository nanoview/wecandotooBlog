import { useState, useEffect } from 'react';
import { Mail, RefreshCw, Inbox, AlertCircle, Info, ExternalLink, Settings, LogOut, Lock, CheckCircle, Server, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import ZohoCredentialsInput from './ZohoCredentialsInput';
import { createZohoIMAPService, ZohoIMAPService } from '@/services/zohoIMAP';
import { supabaseZohoEmailService } from '@/services/supabaseZohoEmail';
import { zohoSMTPService, SMTPCredentials } from '@/services/zohoSMTP';

interface EmailData {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  isUnread: boolean;
}

interface EmailCheckConfig {
  method: 'mock' | 'imap' | 'gmail' | 'webhook' | 'supabase' | 'smtp';
  enabled: boolean;
}

interface ZohoCredentials {
  username: string;
  password: string;
}

const ZohoMailChecker = () => {
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<EmailCheckConfig>({ method: 'supabase', enabled: true });
  const [zohoService, setZohoService] = useState<ZohoIMAPService | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [smtpCredentials, setSmtpCredentials] = useState<SMTPCredentials | null>(null);
  const [smtpStatus, setSmtpStatus] = useState<{ tested: boolean; message?: string; error?: string }>({ tested: false });
  const [isSendingTest, setIsSendingTest] = useState(false);
  const { toast } = useToast();

  // Mock email data for demonstration
  const mockEmails: EmailData[] = [
    {
      id: '1',
      subject: 'New Contact Form Submission',
      from: 'john.doe@example.com',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      snippet: 'Hello, I would like to inquire about your services...',
      isUnread: true
    },
    {
      id: '2',
      subject: 'Partnership Opportunity',
      from: 'sarah.smith@techcorp.com',
      date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      snippet: 'We are interested in exploring a potential partnership...',
      isUnread: true
    },
    {
      id: '3',
      subject: 'Blog Post Feedback',
      from: 'reader@email.com',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      snippet: 'Great article about web development trends! I have a question...',
      isUnread: false
    }
  ];

  const handleZohoLogin = async (credentials: ZohoCredentials) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const service = createZohoIMAPService(credentials.username, credentials.password);
      
      // Test connection first
      const connectionTest = await service.testConnection();
      
      if (connectionTest.success) {
        setZohoService(service);
        setIsAuthenticated(true);
        setConfig(prev => ({ ...prev, method: 'imap' }));
        
        toast({
          title: "Connected to Zoho Mail",
          description: connectionTest.message
        });
        
        // Automatically check emails after successful login
        await checkZohoEmails(service);
      } else {
        setAuthError(connectionTest.message);
        toast({
          title: "Connection Failed",
          description: connectionTest.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Zoho Mail';
      setAuthError(errorMessage);
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setZohoService(null);
    setIsAuthenticated(false);
    setEmails([]);
    setLastChecked(null);
    setError(null);
    setAuthError(null);
    setConfig(prev => ({ ...prev, method: 'mock' }));
    
    toast({
      title: "Logged Out",
      description: "Disconnected from Zoho Mail"
    });
  };

  const checkZohoEmails = async (service?: ZohoIMAPService) => {
    const activeService = service || zohoService;
    if (!activeService) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await activeService.checkEmails('hello@wecandotoo.com', 50);
      
      if (result.success) {
        const emailData = result.emails.map(email => ({
          id: email.id,
          subject: email.subject,
          from: email.from,
          date: email.date,
          snippet: email.snippet,
          isUnread: email.isUnread
        }));
        
        setEmails(emailData);
        setLastChecked(new Date());
        
        toast({
          title: "Emails Retrieved",
          description: `Found ${result.unreadCount} unread email(s) via Zoho IMAP`
        });
      } else {
        throw new Error(result.error || 'Failed to retrieve emails');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check emails';
      setError(errorMessage);
      toast({
        title: "Email Check Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkSupabaseEmails = async () => {
    if (!isAuthenticated || !zohoService) {
      setError('Authentication required for Supabase backend');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Use stored credentials for Supabase backend call
      const credentials = {
        username: 'hello@wecandotoo.com', // This should come from secure storage
        password: 'app-password' // This should come from secure storage
      };

      const result = await supabaseZohoEmailService.checkEmails(credentials, 'hello@wecandotoo.com');
      
      if (result.success) {
        setEmails(result.emails);
        setLastChecked(result.lastChecked);
        
        toast({
          title: "Emails Retrieved via Supabase",
          description: `Found ${result.unreadCount} unread email(s) using secure backend`
        });
      } else {
        throw new Error(result.error || 'Failed to retrieve emails via Supabase');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check emails via Supabase';
      setError(errorMessage);
      toast({
        title: "Supabase Email Check Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmails = async () => {
    // Handle special methods first
    if (config.method === 'imap' && zohoService) {
      return await checkZohoEmails();
    }
    
    if (config.method === 'supabase') {
      return await checkSupabaseEmails();
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let emailData: EmailData[] = [];
      let message = '';

      switch (config.method) {
        case 'mock':
          emailData = mockEmails;
          message = `Found ${mockEmails.filter(e => e.isUnread).length} unread email(s) - Demo Mode`;
          break;
        
        case 'gmail':
          // In real implementation, this would call Gmail API
          emailData = mockEmails.map(email => ({
            ...email,
            snippet: email.snippet + ' (via Gmail API - Demo)'
          }));
          message = `Gmail API check complete - ${emailData.filter(e => e.isUnread).length} unread`;
          break;
        
        case 'imap':
          // In real implementation, this would use IMAP connection
          if (isAuthenticated && zohoService) {
            return await checkZohoEmails();
          } else {
            emailData = mockEmails.slice(0, 2).map(email => ({
              ...email,
              snippet: email.snippet + ' (via IMAP - Demo)'
            }));
            message = `IMAP check complete - ${emailData.filter(e => e.isUnread).length} unread`;
          }
          break;
        
        case 'webhook':
          // In real implementation, this would fetch webhook-received emails
          emailData = mockEmails.slice(0, 1).map(email => ({
            ...email,
            snippet: email.snippet + ' (via Webhook - Demo)'
          }));
          message = `Webhook emails retrieved - ${emailData.filter(e => e.isUnread).length} unread`;
          break;
        
        default:
          throw new Error('Invalid email checking method');
      }
      
      setEmails(emailData);
      setLastChecked(new Date());
      
      toast({
        title: "Emails Checked",
        description: message
      });
      
    } catch (err) {
      const errorMessage = `Failed to check emails via ${config.method.toUpperCase()}. Please try again.`;
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const unreadCount = emails.filter(email => email.isUnread).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Monitor</h2>
          <p className="text-gray-600">
            Monitor emails to hello@wecandotoo.com 
            <Badge variant="outline" className="ml-2 text-xs">
              {config.method.toUpperCase()} Mode
            </Badge>
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={checkEmails} 
            disabled={isLoading || !config.enabled || ((config.method === 'imap' || config.method === 'supabase') && !isAuthenticated)} 
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Checking...' : 
             (config.method === 'imap' || config.method === 'supabase') && !isAuthenticated ? 'Login Required' : 
             'Check Emails'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Email Check Method</CardTitle>
          <CardDescription>Choose how to monitor hello@wecandotoo.com emails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { key: 'supabase', label: 'Supabase Backend', desc: 'Secure server' },
              { key: 'mock', label: 'Demo Mode', desc: 'Mock data' },
              { key: 'gmail', label: 'Gmail API', desc: 'Free tier' },
              { key: 'imap', label: 'IMAP', desc: 'Direct access' },
              { key: 'webhook', label: 'Webhooks', desc: 'Real-time' },
              { key: 'smtp', label: 'SMTP Send', desc: 'Outgoing' }
            ].map((method) => (
              <Button
                key={method.key}
                variant={config.method === method.key ? "default" : "outline"}
                size="sm"
                onClick={() => setConfig(prev => ({ ...prev, method: method.key as any }))}
                className="h-auto p-3 flex flex-col items-center gap-1"
              >
                <span className="font-medium text-xs">{method.label}</span>
                <span className="text-xs opacity-70">{method.desc}</span>
              </Button>
            ))}
          </div>
          
          {/* Supabase Backend Authentication */}
          {config.method === 'supabase' && !isAuthenticated && (
            <div className="mt-6 p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Supabase Backend - Zoho Authentication</span>
              </div>
              <p className="text-sm text-blue-700 mb-4">
                Enter your Zoho credentials for secure server-side email checking via Supabase Edge Functions.
              </p>
              <ZohoCredentialsInput 
                onCredentialsSubmit={handleZohoLogin}
                isLoading={isLoading}
                error={authError}
              />
            </div>
          )}
          
          {/* Supabase Authenticated State */}
          {config.method === 'supabase' && isAuthenticated && (
            <div className="mt-6 p-4 border rounded-lg bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Connected to Supabase Backend</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
              <p className="text-sm text-green-700 mt-2">
                Ready to check emails via secure Supabase Edge Function with IMAP backend
              </p>
            </div>
          )}
          
          {/* Zoho IMAP Authentication */}
          {config.method === 'imap' && !isAuthenticated && (
            <div className="mt-6 p-4 border rounded-lg bg-yellow-50">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Zoho Mail Authentication Required</span>
              </div>
              <p className="text-sm text-yellow-700 mb-4">
                Enter your Zoho Mail credentials to check emails via IMAP. We recommend using an app-specific password.
              </p>
              <ZohoCredentialsInput 
                onCredentialsSubmit={handleZohoLogin}
                isLoading={isLoading}
                error={authError}
              />
            </div>
          )}
          
          {/* Authenticated State */}
          {config.method === 'imap' && isAuthenticated && (
            <div className="mt-6 p-4 border rounded-lg bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Connected to Zoho Mail</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
              <p className="text-sm text-green-700 mt-2">
                Ready to check emails via secure IMAP connection
              </p>
            </div>
          )}
          
          {/* SMTP Authentication */}
          {config.method === 'smtp' && !smtpCredentials && (
            <div className="mt-6 p-4 border rounded-lg bg-purple-50">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">Zoho SMTP Credentials</span>
              </div>
              <p className="text-sm text-purple-700 mb-4">Enter your Zoho email and app password to enable sending test emails (simulated in Edge Function).</p>
              <ZohoCredentialsInput 
                onCredentialsSubmit={async (c) => {
                  setIsLoading(true);
                  try {
                    const creds: SMTPCredentials = { username: c.username, password: c.password, host: 'smtp.zoho.com', port: 465, secure: true };
                    const result = await zohoSMTPService.test(creds);
                    if (result.success) {
                      setSmtpCredentials(creds);
                      setSmtpStatus({ tested: true, message: result.message });
                      toast({ title: 'SMTP Connected', description: result.message });
                    } else {
                      setSmtpStatus({ tested: false, error: result.message });
                      toast({ title: 'SMTP Test Failed', description: result.message, variant: 'destructive' });
                    }
                  } catch (e) {
                    const msg = e instanceof Error ? e.message : 'SMTP test failed';
                    setSmtpStatus({ tested: false, error: msg });
                    toast({ title: 'SMTP Error', description: msg, variant: 'destructive' });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                isLoading={isLoading}
                error={smtpStatus.error || undefined}
              />
            </div>
          )}

          {config.method === 'smtp' && smtpCredentials && (
            <div className="mt-6 p-4 border rounded-lg bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">SMTP Ready</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setSmtpCredentials(null); setSmtpStatus({ tested: false }); }} className="text-red-600 hover:text-red-700">
                  <LogOut className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
              <p className="text-sm text-green-700 mt-2">{smtpStatus.message}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" disabled={isSendingTest} onClick={async () => {
                  if (!smtpCredentials) return;
                  setIsSendingTest(true);
                  try {
                    const sendRes = await zohoSMTPService.send(smtpCredentials, {
                      to: smtpCredentials.username,
                      subject: 'Test Email (Simulated SMTP)',
                      text: 'This is a simulated test email from the Zoho SMTP integration.',
                    });
                    toast({ title: 'Email Sent', description: sendRes.message });
                  } catch (e) {
                    toast({ title: 'Send Failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
                  } finally {
                    setIsSendingTest(false);
                  }
                }} className="flex items-center gap-1">
                  <Send className={`w-4 h-4 ${isSendingTest ? 'animate-pulse' : ''}`} />
                  {isSendingTest ? 'Sending...' : 'Send Test Email'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emails.length}</div>
            <p className="text-xs text-gray-600">in inbox</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unread Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
            <p className="text-xs text-gray-600">require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Checked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {lastChecked ? formatDate(lastChecked.toISOString()) : 'Never'}
            </div>
            <p className="text-xs text-gray-600">automatic refresh</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Recent Emails
          </CardTitle>
          <CardDescription>
            Latest emails received at hello@wecandotoo.com
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No emails found. Click "Check Emails" to refresh.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    email.isUnread 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${email.isUnread ? 'font-semibold' : ''}`}>
                          {email.subject}
                        </h4>
                        {email.isUnread && (
                          <Badge variant="secondary" className="text-xs">
                            Unread
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">From: {email.from}</p>
                      <p className="text-sm text-gray-500 mt-1">{email.snippet}</p>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {formatDate(email.date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p><strong>Email Monitoring Status:</strong> Multiple methods available for checking hello@wecandotoo.com</p>
            <div className="text-sm space-y-1">
              <p><strong>Available Methods:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Supabase Backend</strong> - Secure server-side IMAP via Edge Functions (Recommended)</li>
                <li><strong>Gmail API</strong> - Free tier: 1B requests/day with OAuth setup</li>
                <li><strong>IMAP Direct</strong> - Direct email access, works with most providers</li>
                <li><strong>Webhooks</strong> - Real-time email notifications</li>
                <li><strong>Demo Mode</strong> - Mock data for testing interface</li>
                <li><strong>SMTP Send</strong> - Simulated Zoho SMTP for sending test emails</li>
              </ul>
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open('/ZOHO_EMAIL_AUTH_GUIDE.md', '_blank')}
                  className="text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Setup Guide
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setConfig(prev => ({ 
                    ...prev, 
                    method: prev.method === 'supabase' ? 'mock' : 'supabase' 
                  }))}
                  className="text-xs"
                >
                  {config.method === 'supabase' ? 'Switch to Demo' : 'Switch to Supabase Backend'}
                </Button>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Zoho Mail API Limitation:</strong> Zoho Mail API requires organizational/business accounts 
          and is not available for free individual accounts. Consider the alternatives above for 
          monitoring hello@wecandotoo.com emails.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ZohoMailChecker;
