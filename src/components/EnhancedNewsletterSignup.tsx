import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { subscribeWithAuth } from '@/services/subscriptionService';
import { Mail, User, Lock, Loader2 } from 'lucide-react';

const EnhancedNewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('newsletter');
  const { toast } = useToast();

  const handleSubmit = async (createAccount: boolean = false) => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions.",
        variant: "destructive"
      });
      return;
    }

    if (createAccount && !password) {
      toast({
        title: "Password Required",
        description: "Please enter a password for your account.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await subscribeWithAuth({
        email,
        password: createAccount ? password : undefined,
        termsAccepted,
        createAccount
      });

      toast({
        title: "Success!",
        description: result.message,
      });

      if (result.warning) {
        toast({
          title: "Note",
          description: result.warning,
          variant: "default"
        });
      }

      // Reset form
      setEmail('');
      setPassword('');
      setTermsAccepted(false);

    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Join WeCanDoToo</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="newsletter">Newsletter Only</TabsTrigger>
            <TabsTrigger value="account">Create Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="newsletter" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newsletter-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox 
                id="newsletter-terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <Label htmlFor="newsletter-terms" className="text-sm leading-relaxed">
                I agree to receive newsletter emails and accept the terms and conditions.
              </Label>
            </div>

            <Button
              onClick={() => handleSubmit(false)}
              disabled={isLoading || !email || !termsAccepted}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                'Subscribe to Newsletter'
              )}
            </Button>

            <p className="text-sm text-gray-600 text-center">
              Just the newsletter, no account needed.
            </p>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="account-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="account-password"
                  type="password"
                  placeholder="Choose a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox 
                id="account-terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <Label htmlFor="account-terms" className="text-sm leading-relaxed">
                I agree to create an account, receive newsletter emails, and accept the terms and conditions.
              </Label>
            </div>

            <Button
              onClick={() => handleSubmit(true)}
              disabled={isLoading || !email || !password || !termsAccepted}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Create Account + Subscribe
                </>
              )}
            </Button>

            <p className="text-sm text-gray-600 text-center">
              Get an account to comment on posts and manage your subscription.
            </p>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">What you'll get:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Weekly web development tips</li>
            <li>• Latest blog posts and tutorials</li>
            <li>• Exclusive content and resources</li>
            <li>• Career advice and industry insights</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedNewsletterSignup;
