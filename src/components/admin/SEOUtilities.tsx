import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, ExternalLink, CheckCircle, AlertCircle, Globe, Search, FileText, BarChart3, Rss, Download, Brain } from 'lucide-react';
import { updateSitemap, getAllUrls } from '@/utils/sitemapGenerator';
import { updateRssFeed, RssOptions } from '@/utils/rssGenerator';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import SEOOptimizationDashboard from '@/components/admin/SEOOptimizationDashboard';

const SEOUtilities: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rssLoading, setRssLoading] = useState(false);
  const [sitemapRssLoading, setSitemapRssLoading] = useState(false);
  const [liveSitemapLoading, setLiveSitemapLoading] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);
  const [sitemapXml, setSitemapXml] = useState<string>('');
  const [rssXml, setRssXml] = useState<string>('');
  const [sitemapRssXml, setSitemapRssXml] = useState<string>('');
  const [liveSitemapXml, setLiveSitemapXml] = useState<string>('');
  const [includeFullContent, setIncludeFullContent] = useState(false);
  const { toast } = useToast();

  // Check if Google verification is set up
  const isVerificationConfigured = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION && 
    import.meta.env.VITE_GOOGLE_SITE_VERIFICATION !== 'your_verification_code';

  const handleGenerateSitemapRss = async () => {
    setSitemapRssLoading(true);
    try {
      // First try the domain URL (with redirects)
      let response;
      let xml;
      
      try {
        response = await fetch('https://wecandotoo.com/sitemap.rss');
        if (response.ok) {
          xml = await response.text();
        }
      } catch (error) {
        console.log('Domain URL failed, trying direct Supabase URL...');
      }

      // If domain fails, try direct Supabase URL
      if (!xml) {
        response = await fetch('https://rowcloxlszwnowlggqon.supabase.co/functions/v1/rss-feed');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        xml = await response.text();
      }
      
      setSitemapRssXml(xml);
      
      toast({
        title: "sitemap.rss Generated!",
        description: "Successfully fetched RSS feed from live Edge Function",
      });
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      toast({
        title: "Error",
        description: "Failed to generate sitemap.rss from Edge Function. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setSitemapRssLoading(false);
    }
  };

  const handleGenerateLiveSitemap = async () => {
    setLiveSitemapLoading(true);
    try {
      // First try the domain URL (with redirects)
      let response;
      let xml;
      
      try {
        response = await fetch('https://wecandotoo.com/sitemap.xml');
        if (response.ok) {
          xml = await response.text();
        }
      } catch (error) {
        console.log('Domain URL failed, trying direct Supabase URL...');
      }

      // If domain fails, try direct Supabase URL
      if (!xml) {
        response = await fetch('https://rowcloxlszwnowlggqon.supabase.co/functions/v1/sitemap');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        xml = await response.text();
      }
      
      setLiveSitemapXml(xml);
      
      toast({
        title: "Live Sitemap Generated!",
        description: "Successfully fetched sitemap from live Edge Function",
      });
    } catch (error) {
      console.error('Error fetching sitemap:', error);
      toast({
        title: "Error",
        description: "Failed to generate sitemap from Edge Function. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setLiveSitemapLoading(false);
    }
  };

  const handleGenerateRssFeed = async () => {
    setRssLoading(true);
    try {
      const options: RssOptions = {
        includeFullContent,
        maxItems: 20
      };
      
      const xml = await updateRssFeed(options);
      setRssXml(xml);
      
      toast({
        title: "RSS Feed Generated!",
        description: `Generated RSS feed with latest posts`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate RSS feed",
        variant: "destructive"
      });
    } finally {
      setRssLoading(false);
    }
  };

  const handleGenerateSitemap = async () => {
    setLoading(true);
    try {
      const xml = await updateSitemap();
      const urlList = await getAllUrls();
      
      setSitemapXml(xml);
      setUrls(urlList);
      
      toast({
        title: "Sitemap Generated!",
        description: `Generated sitemap with ${urlList.length} URLs`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate sitemap",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, title = "Copied!") => {
    navigator.clipboard.writeText(text);
    toast({
      title,
      description: "Content copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      {/* Environment Status Card */}
      <Card className={`border-2 ${isVerificationConfigured ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isVerificationConfigured ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            Google Search Console Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isVerificationConfigured ? (
            <div className="text-green-800">
              <p className="font-medium">✅ Verification code is configured!</p>
              <p className="text-sm mt-1">Your site can be verified with Google Search Console.</p>
            </div>
          ) : (
            <div className="text-red-800">
              <p className="font-medium">❌ Verification code not set up</p>
              <p className="text-sm mt-1">Current value: <code className="bg-red-100 px-1 rounded">{import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || 'not set'}</code></p>
              <p className="text-sm mt-1">Please update your .env file with a real verification code from Google Search Console.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            SEO & Feed Generators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ai-seo" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="ai-seo" className="flex items-center gap-2 text-xs">
                <Brain className="w-3 h-3" />
                SEO Dashboard
              </TabsTrigger>
              <TabsTrigger value="live-rss" className="flex items-center gap-2 text-xs">
                <Download className="w-3 h-3" />
                Live RSS
              </TabsTrigger>
              <TabsTrigger value="live-sitemap" className="flex items-center gap-2 text-xs">
                <Globe className="w-3 h-3" />
                Live Sitemap
              </TabsTrigger>
              <TabsTrigger value="sitemap" className="flex items-center gap-2 text-xs">
                <FileText className="w-3 h-3" />
                XML Sitemap
              </TabsTrigger>
              <TabsTrigger value="rss" className="flex items-center gap-2 text-xs">
                <Rss className="w-3 h-3" />
                RSS Feed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai-seo" className="space-y-4">
              <SEOOptimizationDashboard />
            </TabsContent>

            <TabsContent value="live-rss" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Generate Live sitemap.rss</h3>
                  <p className="text-sm text-gray-600">Fetch current RSS feed from deployed Edge Function</p>
                </div>
                <Button 
                  onClick={handleGenerateSitemapRss} 
                  disabled={sitemapRssLoading}
                  className="flex items-center gap-2"
                >
                  {sitemapRssLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Download className="w-4 h-4" />
                  Fetch sitemap.rss
                </Button>
              </div>

              {sitemapRssXml && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Live RSS Feed (sitemap.rss)</h4>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(sitemapRssXml, "RSS Feed Copied!")}
                        >
                          Copy XML
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open('https://wecandotoo.com/sitemap.rss', '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Live
                        </Button>
                      </div>
                    </div>
                    <textarea
                      value={sitemapRssXml}
                      readOnly
                      className="w-full h-40 p-3 bg-gray-50 border rounded font-mono text-xs"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                      <p>🚀 Live URL: <code className="bg-gray-100 px-1 rounded">https://wecandotoo.com/sitemap.rss</code></p>
                      <p>⚡ Powered by Supabase Edge Function</p>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <h5 className="font-medium text-green-900 mb-2">Live RSS Benefits:</h5>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Automatically updates when new posts are published</li>
                      <li>• Hosted on Supabase Edge for global performance</li>
                      <li>• Available at both /sitemap.rss and /feed.xml</li>
                      <li>• No manual file updates needed</li>
                    </ul>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="live-sitemap" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Generate Live XML Sitemap</h3>
                  <p className="text-sm text-gray-600">Fetch current sitemap from deployed Edge Function</p>
                </div>
                <Button 
                  onClick={handleGenerateLiveSitemap} 
                  disabled={liveSitemapLoading}
                  className="flex items-center gap-2"
                >
                  {liveSitemapLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Globe className="w-4 h-4" />
                  Fetch Live Sitemap
                </Button>
              </div>

              {liveSitemapXml && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Live XML Sitemap</h4>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(liveSitemapXml, "Sitemap Copied!")}
                        >
                          Copy XML
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open('https://wecandotoo.com/sitemap.xml', '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Live
                        </Button>
                      </div>
                    </div>
                    <textarea
                      value={liveSitemapXml}
                      readOnly
                      className="w-full h-40 p-3 bg-gray-50 border rounded font-mono text-xs"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                      <p>🌐 Live URL: <code className="bg-gray-100 px-1 rounded">https://wecandotoo.com/sitemap.xml</code></p>
                      <p>⚡ Powered by Supabase Edge Function</p>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <h5 className="font-medium text-blue-900 mb-2">Live Sitemap Benefits:</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Automatically includes all published blog posts</li>
                      <li>• Updates immediately when content changes</li>
                      <li>• Optimized for search engine crawling</li>
                      <li>• Hosted on global edge network</li>
                    </ul>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sitemap" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Generate XML Sitemap</h3>
                  <p className="text-sm text-gray-600">Create XML sitemap for search engines</p>
                </div>
                <Button 
                  onClick={handleGenerateSitemap} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generate Sitemap
                </Button>
              </div>

              {urls.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Found URLs ({urls.length})</h4>
                    <div className="grid gap-2 max-h-40 overflow-y-auto">
                      {urls.map((url, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <span className="truncate">{url}</span>
                          <Badge variant="secondary" className="ml-2">
                            {url.includes('/post/') ? 'Post' : 'Page'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {sitemapXml && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Generated Sitemap XML</h4>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(sitemapXml)}
                        >
                          Copy XML
                        </Button>
                      </div>
                      <textarea
                        value={sitemapXml}
                        readOnly
                        className="w-full h-40 p-3 bg-gray-50 border rounded font-mono text-xs"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        💡 Copy this XML and save it as <code>public/sitemap.xml</code>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rss" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Generate RSS Feed</h3>
                  <p className="text-sm text-gray-600">Create RSS feed for content syndication</p>
                </div>
                <Button 
                  onClick={handleGenerateRssFeed} 
                  disabled={rssLoading}
                  className="flex items-center gap-2"
                >
                  {rssLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Rss className="w-4 h-4" />
                  Generate RSS
                </Button>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded">
                <Switch 
                  id="full-content" 
                  checked={includeFullContent}
                  onCheckedChange={setIncludeFullContent}
                />
                <Label htmlFor="full-content" className="text-sm">
                  Include full post content (recommended for better RSS experience)
                </Label>
              </div>

              {rssXml && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Generated RSS Feed</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(rssXml)}
                      >
                        Copy XML
                      </Button>
                    </div>
                    <textarea
                      value={rssXml}
                      readOnly
                      className="w-full h-40 p-3 bg-gray-50 border rounded font-mono text-xs"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                      <p>💡 Save as <code>public/feed.xml</code> or <code>public/rss.xml</code></p>
                      <p>🔗 Live URL: <code>https://wecandotoo.com/sitemap.rss</code></p>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <h5 className="font-medium text-green-900 mb-2">RSS Feed Benefits:</h5>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Readers can subscribe to your blog updates</li>
                      <li>• Automatic content distribution to RSS readers</li>
                      <li>• Social media platforms can auto-post from RSS</li>
                      <li>• SEO benefits from content syndication</li>
                    </ul>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO Checklist & Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Step 1: Google Search Console */}
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <h4 className="font-semibold text-red-900">1. Set up Google Search Console</h4>
                  <p className="text-sm text-red-700">Add your website and get verification code</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('https://search.google.com/search-console/', '_blank')}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Open Console
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>

            {/* Step 2: Environment Variables */}
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="font-semibold text-amber-900">2. Add verification code to .env</h4>
                  <p className="text-sm text-amber-700">Update VITE_GOOGLE_SITE_VERIFICATION</p>
                  <code className="text-xs bg-amber-100 px-2 py-1 rounded mt-1 block">
                    VITE_GOOGLE_SITE_VERIFICATION=your_verification_code
                  </code>
                </div>
              </div>
              <Badge variant="secondary">Manual Edit</Badge>
            </div>

            {/* Step 3: Submit Sitemap */}
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="font-semibold text-blue-900">3. Submit sitemap to Google</h4>
                  <p className="text-sm text-blue-700">After verification, submit your sitemap</p>
                  <code className="text-xs bg-blue-100 px-2 py-1 rounded mt-1 block">
                    https://wecandotoo.com/sitemap.xml
                  </code>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('https://search.google.com/search-console/sitemaps', '_blank')}
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Submit Sitemap
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>

            {/* Step 4: Monitor Indexing */}
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="font-semibold text-green-900">4. Monitor indexing status</h4>
                  <p className="text-sm text-green-700">Track how Google indexes your pages</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('https://search.google.com/search-console/index', '_blank')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Index Status
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Additional Tools */}
          <div className="mt-6 pt-6 border-t space-y-3">
            <h5 className="font-medium text-gray-900 mb-3">Additional SEO Tools</h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('https://search.google.com/test/rich-results', '_blank')}
                className="flex items-center gap-2 justify-start"
              >
                <CheckCircle className="w-4 h-4" />
                Rich Results Test
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('https://pagespeed.web.dev/', '_blank')}
                className="flex items-center gap-2 justify-start"
              >
                <RefreshCw className="w-4 h-4" />
                PageSpeed Insights
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('https://search.google.com/search-console/url-inspection', '_blank')}
                className="flex items-center gap-2 justify-start"
              >
                <Search className="w-4 h-4" />
                URL Inspection
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('https://search.google.com/search-console/performance', '_blank')}
                className="flex items-center gap-2 justify-start"
              >
                <BarChart3 className="w-4 h-4" />
                Performance Report
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOUtilities;
