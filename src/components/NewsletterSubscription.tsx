import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { subscribeToNewsletter } from '@/services/subscriptionService';
import { Loader2, Mail, CheckCircle } from 'lucide-react';

const NewsletterSubscription = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Subscribe button clicked', { email, loading });
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Calling subscribeToNewsletter...');
      
      const result = await subscribeToNewsletter(email);
      console.log('Subscription result:', result);
      
      setSubscribed(true);
      setEmail('');
      
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter!",
      });
    } catch (error: any) {
      console.error('Subscription error:', error);
      
      toast({
        title: "Subscription failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">Thank you!</h4>
          <p className="text-blue-100 text-sm">
            You've been successfully subscribed to our newsletter.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="border-white text-white hover:bg-white hover:text-blue-600"
          onClick={() => setSubscribed(false)}
        >
          Subscribe another email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
      <div className="flex-1 relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
        />
      </div>
      <Button 
        type="submit"
        disabled={loading}
        className="bg-white text-blue-600 hover:bg-gray-100 font-semibold min-w-[120px]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Subscribing...
          </>
        ) : (
          'Subscribe'
        )}
      </Button>
    </form>
  );
};

export default NewsletterSubscription;