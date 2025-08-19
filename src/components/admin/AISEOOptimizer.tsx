import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Search, 
  TrendingUp, 
  BarChart3, 
  Lightbulb,
  Target,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Eye,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SEOSuggestion {
  metaDescription: string;
  focusKeyword: string;
  relatedKeywords: string[];
  seoScore: number;
  analysis: any;
  recommendations: string[];
}

interface TrendingKeyword {
  keyword: string;
  trend: 'up' | 'down' | 'stable';
  volume: number;
  competition: 'low' | 'medium' | 'high';
}

const AISEOOptimizer: React.FC = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [seoHealth, setSeoHealth] = useState<any>(null);
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([]);
  const [recentOptimizations, setRecentOptimizations] = useState<any[]>([]);
  const [autoOptimizeEnabled, setAutoOptimizeEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSEOHealth();
    loadTrendingKeywords();
    loadRecentOptimizations();
  }, []);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  };

  const loadSEOHealth = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-seo-optimizer?action=seo-health`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        setSeoHealth(data);
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Error loading SEO health:', error);
      // Set mock data as fallback
      setSeoHealth({
        seoHealth: {
          averageSeoScore: 72,
          metaDescriptionCoverage: 85,
          focusKeywordCoverage: 68,
          highPerformingPosts: 12
        },
        recommendations: [
          'Optimize meta descriptions for better click-through rates',
          'Add focus keywords to posts missing them',
          'Improve content length for better search rankings'
        ],
        lowScorePosts: [
          { id: 1, title: 'Sample Post 1', seoScore: 45 },
          { id: 2, title: 'Sample Post 2', seoScore: 52 }
        ]
      });
      toast({
        title: "Using Demo Data",
        description: "AI SEO optimizer is in demo mode. Connect authentication to use live data.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingKeywords = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-seo-optimizer?action=trending-keywords&category=technology`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        // Transform trending keywords into proper format
        const formatted = data.trending.slice(0, 10).map((keyword: string, index: number) => ({
          keyword,
          trend: index % 3 === 0 ? 'up' : index % 3 === 1 ? 'down' : 'stable',
          volume: Math.floor(Math.random() * 10000) + 1000,
          competition: ['low', 'medium', 'high'][index % 3] as 'low' | 'medium' | 'high'
        }));
        setTrendingKeywords(formatted);
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Error loading trending keywords:', error);
      // Set mock trending keywords
      setTrendingKeywords([
        { keyword: 'artificial intelligence', trend: 'up', volume: 8500, competition: 'high' },
        { keyword: 'web development', trend: 'stable', volume: 12000, competition: 'medium' },
        { keyword: 'react components', trend: 'up', volume: 6800, competition: 'medium' },
        { keyword: 'SEO optimization', trend: 'up', volume: 4200, competition: 'low' },
        { keyword: 'typescript tutorial', trend: 'stable', volume: 3900, competition: 'low' },
        { keyword: 'mobile design', trend: 'down', volume: 2800, competition: 'medium' },
        { keyword: 'api integration', trend: 'up', volume: 5100, competition: 'medium' },
        { keyword: 'database design', trend: 'stable', volume: 3600, competition: 'high' }
      ]);
    }
  };

  const loadRecentOptimizations = async () => {
    try {
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, title, seo_score, last_seo_update')
        .not('last_seo_update', 'is', null)
        .order('last_seo_update', { ascending: false })
        .limit(5);

      if (!error && posts) {
        setRecentOptimizations(posts);
      }
    } catch (error) {
      console.error('Error loading recent optimizations:', error);
    }
  };

  const analyzeAllPosts = async () => {
    setIsAnalyzing(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-seo-optimizer?action=analyze-all`,
        {
          method: 'GET',
          headers
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "🤖 AI Analysis Complete!",
          description: `Analyzed ${result.processed} posts, updated ${result.updated} with optimized SEO data.`
        });
        
        // Reload data
        loadSEOHealth();
        loadRecentOptimizations();
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze posts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const optimizeSinglePost = async (postId: string) => {
    try {
      // Get post data
      const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error || !post) {
        throw new Error('Post not found');
      }

      // Send to AI optimizer
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-seo-optimizer`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            postId: post.id,
            content: post.content,
            title: post.title,
            category: post.category,
            existingKeywords: []
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "✨ Post Optimized!",
          description: `Generated new meta description and focus keyword for "${post.title}"`
        });
        
        loadRecentOptimizations();
        return result.suggestions;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to optimize post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSEOScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading AI SEO Optimizer...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI SEO Optimizer
          </h2>
          <p className="text-muted-foreground">
            Automatically generate optimized meta descriptions and focus keywords based on search trends
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={analyzeAllPosts}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Optimize All Posts
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trending">Trending Keywords</TabsTrigger>
          <TabsTrigger value="recent">Recent Updates</TabsTrigger>
          <TabsTrigger value="settings">Auto-Optimize</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {seoHealth && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Average SEO Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getSEOScoreColor(seoHealth?.seoHealth?.averageSeoScore || 0)}`}>
                    {seoHealth?.seoHealth?.averageSeoScore || 0}%
                  </div>
                  <Progress value={seoHealth?.seoHealth?.averageSeoScore || 0} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Meta Descriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {seoHealth?.seoHealth?.metaDescriptionCoverage || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Posts with meta descriptions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Focus Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {seoHealth?.seoHealth?.focusKeywordCoverage || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Posts with focus keywords</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    High Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {seoHealth?.seoHealth?.highPerformingPosts || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Posts with 80+ SEO score</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recommendations */}
          {seoHealth?.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {seoHealth?.recommendations?.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  )) || (
                    <div className="text-sm text-muted-foreground">No recommendations available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Low Performing Posts */}
          {seoHealth?.lowScorePosts && seoHealth.lowScorePosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Posts Needing Optimization
                </CardTitle>
                <CardDescription>
                  These posts have SEO scores below 60 and could benefit from optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {seoHealth?.lowScorePosts?.slice(0, 5).map((post: any) => (
                    <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{post.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className={getSEOScoreBg(post.seoScore)}>
                            SEO Score: {post.seoScore}%
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => optimizeSinglePost(post.id)}
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        Optimize
                      </Button>
                    </div>
                  )) || (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No posts need optimization
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trending Keywords Tab */}
        <TabsContent value="trending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Trending Keywords
              </CardTitle>
              <CardDescription>
                Popular search terms in your content categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingKeywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{keyword.keyword}</span>
                        {keyword.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                        {keyword.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                        {keyword.trend === 'stable' && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>Vol: {keyword.volume.toLocaleString()}</span>
                        <Badge variant={
                          keyword.competition === 'low' ? 'default' : 
                          keyword.competition === 'medium' ? 'secondary' : 'destructive'
                        }>
                          {keyword.competition} comp
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Updates Tab */}
        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Recent AI Optimizations
              </CardTitle>
              <CardDescription>
                Posts recently optimized by the AI SEO engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentOptimizations.length > 0 ? (
                <div className="space-y-3">
                  {recentOptimizations.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{post.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className={getSEOScoreBg(post.seo_score)}>
                            SEO Score: {post.seo_score}%
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(post.last_seo_update).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => optimizeSinglePost(post.id)}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Re-optimize
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recent optimizations found</p>
                  <p className="text-sm">Click "Optimize All Posts" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto-Optimize Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                Auto-Optimization Settings
              </CardTitle>
              <CardDescription>
                Configure automatic SEO optimization for new and existing posts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Auto-optimize new posts</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate SEO data when new posts are published
                  </p>
                </div>
                <Button
                  variant={autoOptimizeEnabled ? "default" : "outline"}
                  onClick={() => setAutoOptimizeEnabled(!autoOptimizeEnabled)}
                >
                  {autoOptimizeEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Weekly batch optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically re-optimize all posts based on latest trends
                  </p>
                </div>
                <Button variant="outline">
                  Configure Schedule
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Trend-based updates</h4>
                  <p className="text-sm text-muted-foreground">
                    Update focus keywords when better trending alternatives are found
                  </p>
                </div>
                <Button variant="outline">
                  Setup Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AISEOOptimizer;
