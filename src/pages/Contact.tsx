import { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/navigation/Header';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!formData.subject.trim()) {
      toast.error('Subject is required');
      return false;
    }
    if (!formData.message.trim()) {
      toast.error('Message is required');
      return false;
    }
    if (formData.message.trim().length < 10) {
      toast.error('Message must be at least 10 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      // Submit to contact-form edge function
      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.toLowerCase().trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          userId: user?.id || null
        }
      });

      if (error) {
        console.error('Contact form error:', error);
        throw new Error(error.message || 'Failed to send message');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send message');
      }

      // Success
      setIsSubmitted(true);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });

    } catch (error: any) {
      console.error('Contact form submission error:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <Header variant="simple" />

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Get in Touch</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have a question, suggestion, or just want to say hello? We'd love to hear from you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600 mb-4">
                      Thank you for contacting us. We'll get back to you within 24 hours.
                    </p>
                    <Button 
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <Input 
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="John"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <Input 
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <Input 
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="What's this about?"
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <Textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us more about your inquiry... (minimum 10 characters)"
                        rows={6}
                        required
                        minLength={10}
                        maxLength={5000}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {formData.message.length}/5000 characters
                      </div>
                    </div>
                    
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </div>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="w-8 h-8 text-blue-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
                      <p className="text-gray-600 mb-2">
                        For general inquiries and support
                      </p>
                      <a href="mailto:hello@wecandotoo.com" className="text-blue-600 hover:underline">
                        hello@wecandotoo.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-8 h-8 text-red-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Visit Us</h3>
                      <p className="text-gray-600">
                        123 Innovation Street<br />
                        Tech District, San Francisco<br />
                        CA 94105, United States
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">How do I submit an article?</h4>
                      <p className="text-sm text-gray-600">
                        You can submit articles through our writer portal. Sign up and start publishing!
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Can I guest post on wecandotoo?</h4>
                      <p className="text-sm text-gray-600">
                        Yes! We welcome guest contributors. Email us with your idea and writing samples.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">How do I report an issue?</h4>
                      <p className="text-sm text-gray-600">
                        Use the contact form above or email us directly at arif.js@hotmail.com
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
