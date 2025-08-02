
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

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
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <Input placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <Input placeholder="What's this about?" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <Textarea 
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                  />
                </div>
                
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Send Message
                </Button>
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
                    <Phone className="w-8 h-8 text-green-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Us</h3>
                      <p className="text-gray-600 mb-2">
                        Monday to Friday, 9 AM to 6 PM EST
                      </p>
                      <a href="tel:+1234567890" className="text-green-600 hover:underline">
                        +1 (234) 567-8900
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
                        Use the contact form above or email us directly at support@wecandotoo.com
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
