import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SocialSharing from '@/components/SocialSharing';
import SocialActionBar from '@/components/SocialActionBar';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SocialSharingDemo = () => {
  // Mock blog post data for demo
  const mockPost = {
    id: '1',
    title: 'The Ultimate Guide to Modern Web Development',
    excerpt: 'Discover the latest trends, tools, and techniques that are shaping the future of web development in 2025.',
    content: 'This is a comprehensive guide covering everything from React and TypeScript to modern deployment strategies...',
    slug: 'ultimate-guide-modern-web-development',
    featured_image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
    tags: ['webdev', 'react', 'typescript', 'javascript'],
    category: 'Web Development',
    author: {
      name: 'John Developer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      bio: 'Senior Full-Stack Developer with 8+ years experience'
    },
    date: new Date().toLocaleDateString(),
    readTime: '8 min read',
    views: 1234,
    likes: 89,
    comments: 12,
    meta_description: 'Complete guide to modern web development practices, frameworks, and tools for building amazing applications in 2025.'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Social Sharing Demo</h1>
          <p className="text-gray-600 mt-2">
            Test all social sharing features and components
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Demo Post Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <img 
                src={mockPost.featured_image} 
                alt={mockPost.title}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div className="flex-1">
                <Badge className="mb-2">{mockPost.category}</Badge>
                <h2 className="text-2xl font-bold mb-2">{mockPost.title}</h2>
                <p className="text-gray-600 mb-4">{mockPost.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>👀 {mockPost.views} views</span>
                  <span>❤️ {mockPost.likes} likes</span>
                  <span>💬 {mockPost.comments} comments</span>
                  <span>📖 {mockPost.readTime}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compact Sharing Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Compact Sharing Button</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Perfect for post headers, cards, or anywhere you need a simple share button.
            </p>
            <div className="flex gap-4">
              <SocialSharing 
                post={mockPost} 
                variant="compact" 
                showLabel={true}
              />
              <SocialSharing 
                post={mockPost} 
                variant="compact" 
                showLabel={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Full Sharing Demo */}
        <SocialSharing 
          post={mockPost} 
          variant="full" 
          showLabel={true}
        />

        {/* Social Action Bar Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Social Action Bar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Interactive action bar with like, bookmark, comment, and share functionality.
            </p>
            <SocialActionBar 
              post={mockPost} 
              position="top" 
              showStats={true}
            />
          </CardContent>
        </Card>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Features Included</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-600 mb-3">Social Platforms</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>𝕏</span>
                    <span>Twitter/X - With hashtags and via mentions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📘</span>
                    <span>Facebook - With quote and image</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💼</span>
                    <span>LinkedIn - Professional sharing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🟠</span>
                    <span>Reddit - Submit to subreddit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💬</span>
                    <span>WhatsApp - Mobile-friendly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✈️</span>
                    <span>Telegram - Instant messaging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📌</span>
                    <span>Pinterest - With image support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📧</span>
                    <span>Email - Native email client</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-green-600 mb-3">Smart Features</h4>
                <ul className="space-y-2 text-sm">
                  <li>✅ Native Web Share API support</li>
                  <li>✅ Copy link to clipboard</li>
                  <li>✅ SEO-optimized meta tags</li>
                  <li>✅ Open Graph protocol</li>
                  <li>✅ Twitter Card markup</li>
                  <li>✅ Mobile-responsive design</li>
                  <li>✅ Popup window management</li>
                  <li>✅ Analytics tracking ready</li>
                  <li>✅ Custom hashtag support</li>
                  <li>✅ Image sharing optimization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Guide */}
        <Card>
          <CardHeader>
            <CardTitle>💻 How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Basic Sharing Button</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<SocialSharing 
  post={post} 
  variant="compact" 
  showLabel={true}
/>`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Full Sharing Panel</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<SocialSharing 
  post={post} 
  variant="full" 
/>`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Floating Action Bar</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<SocialActionBar 
  post={post} 
  position="floating" 
  showStats={true}
/>`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test Social Sharing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Click any sharing button above to test the functionality. The links will open with pre-filled content.
            </p>
            <div className="flex gap-2">
              <Badge variant="outline">✅ Ready for Production</Badge>
              <Badge variant="outline">📱 Mobile Optimized</Badge>
              <Badge variant="outline">🔗 SEO Enhanced</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Demo */}
      <SocialActionBar 
        post={mockPost} 
        position="floating" 
        showStats={true}
        className="opacity-80"
      />
    </div>
  );
};

export default SocialSharingDemo;
