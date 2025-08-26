import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Target, RefreshCw, Eye, Edit, Zap, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SEOOptimizationPost {
  id: string;
  title: string;
  category: string;
  seo_score: number;
  seo_status: string;
  keyword_count: number;
  tag_count: number;
  description_length: number;
  recommendations: string;
  effort_level: string;
  optimization_priority: number;
  last_seo_update: string;
  tags: string[];
  suggested_keywords: string[];
  urgency_level?: string;
}

const SEOOptimizationDashboard: React.FC = () => {
  const [posts, setPosts] = useState<SEOOptimizationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  // Group posts by SEO score
  const groupedPosts = {
    excellent: posts.filter(p => (p.seo_score || 0) >= 80),
    good: posts.filter(p => (p.seo_score || 0) >= 60 && (p.seo_score || 0) < 80),
    fair: posts.filter(p => (p.seo_score || 0) >= 40 && (p.seo_score || 0) < 60),
    poor: posts.filter(p => (p.seo_score || 0) < 40)
  };

  useEffect(() => {
    // Fetch posts from Supabase
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, category, seo_score, seo_status, keyword_count, tag_count, description_length, recommendations, effort_level, optimization_priority, last_seo_update, tags, suggested_keywords');
      
      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        console.log('Fetched posts:', data);
        console.log('Total posts:', data?.length || 0);
        console.log('SEO Score distribution:', data?.reduce((acc, post) => {
          const score = post.seo_score || 0;
          if (score >= 80) acc.excellent++;
          else if (score >= 60) acc.good++;
          else if (score >= 40) acc.fair++;
          else acc.poor++;
          return acc;
        }, { excellent: 0, good: 0, fair: 0, poor: 0 }));
        setPosts(data || []);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const optimizePost = async (postId: string) => {
    try {
      setOptimizing(true);
      setFallbackUrl(null);
      
      // Get post details first
      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .select('title, excerpt, content, slug, category, tags, seo_score')
        .eq('id', postId)
        .single();
      
      if (postError) throw postError;
      
      const postUrl = `https://wecandotoo.com/blog/${post.slug}`;
      const editUrl = `https://wecandotoo.com/edit/${post.slug}`;
      const currentScore = post.seo_score || 0;
      
      // Check if post needs optimization (below 80%)
      if (currentScore >= 80) {
        if (!confirm(`This post already has a good SEO score (${currentScore}%). Do you still want to optimize it for 95%+ score?`)) {
          setOptimizing(false);
          return;
        }
      }
      
      // Auto-open ChatGPT immediately for posts below 80%
      const promptText = `🎯 URGENT SEO OPTIMIZATION - TARGET: 95%+ SCORE

Current Score: ${currentScore}% (${currentScore < 80 ? 'NEEDS IMPROVEMENT' : 'GOOD BUT CAN BE BETTER'})
Post: ${post.title}
Edit: ${editUrl}

FULL CONTENT:
${post.content || 'No content'}

DELIVER 95%+ SEO OPTIMIZATIONS:
1. Optimized SEO title (50-60 chars)
2. Perfect meta description (150-160 chars)
3. Keyword-rich H2/H3 structure
4. 2000+ word comprehensive content
5. FAQ section (5-7 Q&As)
6. Internal/external links
7. Technical SEO checklist

TARGET: Transform ${currentScore}% → 95%+ for wecandotoo.com traffic growth!`;

      // Immediately open ChatGPT
      const seoPrompt = encodeURIComponent(promptText);
      const chatGptUrl = `https://chatgpt.com/?q=${seoPrompt}`;
      
      const win = window.open(chatGptUrl, '_blank');
      if (!win) {
        setFallbackUrl(chatGptUrl);
      } else {
        setFallbackUrl(null);
      }
    } catch (error) {
      console.error('Error generating SEO optimization prompt:', error);
      alert('Failed to generate SEO optimization prompt');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">SEO Optimization Dashboard</h1>
      
      {/* Enhanced SEO Performance Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            SEO Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-600">Total Posts</div>
              <div className="text-3xl font-bold">{posts.length}</div>
              <div className="text-xs text-gray-500">All content</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-700">Excellent (80%+)</div>
              <div className="text-3xl font-bold text-green-600">{groupedPosts.excellent.length}</div>
              <div className="text-xs text-green-600">High performing</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-700">Good (60-79%)</div>
              <div className="text-3xl font-bold text-blue-600">{groupedPosts.good.length}</div>
              <div className="text-xs text-blue-600">Some improvements</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-yellow-700">Fair (40-59%)</div>
              <div className="text-3xl font-bold text-yellow-600">{groupedPosts.fair.length}</div>
              <div className="text-xs text-yellow-600">Needs work</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-700">Poor (&lt;40%)</div>
              <div className="text-3xl font-bold text-red-600">{groupedPosts.poor.length}</div>
              <div className="text-xs text-red-600">Critical priority</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading posts...
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="poor" className="text-red-600">
              🚨 Critical ({groupedPosts.poor.length})
            </TabsTrigger>
            <TabsTrigger value="fair" className="text-yellow-600">
              ⚠️ Fair ({groupedPosts.fair.length})
            </TabsTrigger>
            <TabsTrigger value="good" className="text-blue-600">
              👍 Good ({groupedPosts.good.length})
            </TabsTrigger>
            <TabsTrigger value="excellent" className="text-green-600">
              🏆 Excellent ({groupedPosts.excellent.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <PostList posts={posts} optimizePost={optimizePost} optimizing={optimizing} fallbackUrl={fallbackUrl} />
          </TabsContent>

          <TabsContent value="poor" className="mt-6">
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                🚨 Critical SEO Issues
              </h3>
              <p className="text-sm text-red-700">These posts need immediate attention. They have major SEO problems that are likely hurting your search rankings.</p>
            </div>
            <PostList posts={groupedPosts.poor} optimizePost={optimizePost} optimizing={optimizing} fallbackUrl={fallbackUrl} />
          </TabsContent>

          <TabsContent value="fair" className="mt-6">
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                ⚠️ Needs Improvement
              </h3>
              <p className="text-sm text-yellow-700">These posts have moderate SEO issues. With some work, they could perform much better.</p>
            </div>
            <PostList posts={groupedPosts.fair} optimizePost={optimizePost} optimizing={optimizing} fallbackUrl={fallbackUrl} />
          </TabsContent>

          <TabsContent value="good" className="mt-6">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                👍 Good Performance
              </h3>
              <p className="text-sm text-blue-700">These posts are performing well but could be optimized further for even better results.</p>
            </div>
            <PostList posts={groupedPosts.good} optimizePost={optimizePost} optimizing={optimizing} fallbackUrl={fallbackUrl} />
          </TabsContent>

          <TabsContent value="excellent" className="mt-6">
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                🏆 Excellent Performance
              </h3>
              <p className="text-sm text-green-700">These posts are performing excellently! They're your top performers that others should model.</p>
            </div>
            <PostList posts={groupedPosts.excellent} optimizePost={optimizePost} optimizing={optimizing} fallbackUrl={fallbackUrl} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

// Separate component for rendering post lists to avoid repetition
const PostList: React.FC<{
  posts: SEOOptimizationPost[];
  optimizePost: (postId: string) => void;
  optimizing: boolean;
  fallbackUrl: string | null;
}> = ({ posts, optimizePost, optimizing, fallbackUrl }) => {
  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No posts in this category</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <Card key={post.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="truncate pr-4">{post.title}</span>
              <Badge 
                variant={
                  post.seo_score >= 80 ? 'default' : 
                  post.seo_score >= 60 ? 'secondary' : 
                  post.seo_score >= 40 ? 'outline' : 'destructive'
                }
                className="flex-shrink-0"
              >
                {post.seo_score}%
              </Badge>
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">{post.category}</Badge>
              <Badge variant="outline" className="text-xs">
                {post.effort_level} effort
              </Badge>
              <Badge variant="outline" className="text-xs">
                {post.keyword_count} keywords
              </Badge>
              <Badge variant="outline" className="text-xs">
                {post.tag_count} tags
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2 text-sm">
              <strong>Status:</strong> {post.seo_status}
            </div>
            <div className="mb-3 text-sm text-gray-600">
              <strong>AI Recommendations:</strong> {post.recommendations}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={() => optimizePost(post.id)}
                disabled={optimizing}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700"
              >
                {optimizing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                Fix Now with AI
              </Button>
              {fallbackUrl && (
                <a
                  href={fallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-xs"
                >
                  Open ChatGPT manually
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SEOOptimizationDashboard;
