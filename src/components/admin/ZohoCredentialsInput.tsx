import { useState } from 'react';
import { Eye, EyeOff, Key, Mail, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ZohoCredentials {
  username: string;
  password: string;
}

interface ZohoCredentialsInputProps {
  onCredentialsSubmit: (credentials: ZohoCredentials) => void;
  isLoading?: boolean;
  error?: string | null;
}

const ZohoCredentialsInput = ({ onCredentialsSubmit, isLoading = false, error }: ZohoCredentialsInputProps) => {
  const [credentials, setCredentials] = useState<ZohoCredentials>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(true);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleUsernameChange = (value: string) => {
    setCredentials(prev => ({ ...prev, username: value }));
    setIsValidEmail(validateEmail(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      return;
    }

    if (!isValidEmail) {
      return;
    }

    onCredentialsSubmit(credentials);
  };

  const isFormValid = credentials.username && credentials.password && isValidEmail;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-xl">Zoho Mail Access</CardTitle>
        <CardDescription>
          Enter your Zoho mail credentials to check emails for hello@wecandotoo.com
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="username"
              type="email"
              placeholder="your-email@zoho.com"
              value={credentials.username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className={!isValidEmail && credentials.username ? 'border-red-500' : ''}
              disabled={isLoading}
              autoComplete="email"
            />
            {!isValidEmail && credentials.username && (
              <p className="text-sm text-red-600">Please enter a valid email address</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLoading}
                autoComplete="current-password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Security Note:</strong> For maximum security, consider using an 
              <a 
                href="https://accounts.zoho.com/signin?servicename=VirtualOffice#security/app-passwords" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                app-specific password
              </a> instead of your main password.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Connecting to Zoho...
              </>
            ) : (
              'Connect to Zoho Mail'
            )}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-1">What happens next:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Secure IMAP connection to imap.zoho.com:993</li>
            <li>Check inbox for emails to hello@wecandotoo.com</li>
            <li>Display recent emails in the admin panel</li>
            <li>Credentials are not stored permanently</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZohoCredentialsInput;
