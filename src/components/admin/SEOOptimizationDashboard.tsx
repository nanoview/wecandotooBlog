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

interface SEOSummary {
  total_posts: number;
  posts_below_80: number;
  posts_below_65: number;
  posts_below_40: number;
  average_seo_score: number;
  posts_without_keywords: number;
  posts_without_tags: number;
  posts_without_meta_description: number;
}

interface PostRecommendations {
  post_id: string;
  current_seo_score: number;
  seo_status: string;
  quick_fixes: string[];
  content_improvements: string[];
  overall_recommendations: string[];
  priority_level: number;
  effort_level: string;
}

const SEOOptimizationDashboard: React.FC = () => {
  const [posts, setPosts] = useState<SEOOptimizationPost[]>([]);
  const [criticalPosts, setCriticalPosts] = useState<SEOOptimizationPost[]>([]);
  const [summary, setSummary] = useState<SEOSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<PostRecommendations | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSEOData();
  }, []);

  const fetchSEOData = async () => {
    setLoading(true);
    try {
      // Fetch posts needing optimization (score < 80)
      const { data: postsData, error: postsError } = await supabase
        .from('posts_needing_seo_optimization')
        .select('*')
        .order('optimization_priority', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;

      // Fetch critical posts (score < 60)
      const { data: criticalData, error: criticalError } = await supabase
        .from('posts_needing_seo_optimization')
        .select('*')
        .lt('seo_score', 60)
        .order('seo_score', { ascending: true });

      if (criticalError) throw criticalError;

      // Add urgency levels to critical posts
      const criticalWithUrgency = criticalData?.map(post => ({
        ...post,
        urgency_level: post.seo_score < 40 ? '🔴 CRITICAL' : 
                     post.seo_score < 50 ? '🟠 URGENT' : '🟡 HIGH PRIORITY'
      })) || [];

      // Fetch summary
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_seo_optimization_summary');

      if (summaryError) throw summaryError;

      setPosts(postsData || []);
      setCriticalPosts(criticalWithUrgency);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching SEO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const optimizePost = async (postId: string) => {
    try {
      setOptimizing(true);
      const { error } = await supabase
        .rpc('regenerate_post_seo', { post_id: postId });

      if (error) throw error;

      // Refresh the data
      await fetchSEOData();
      
      alert('Post SEO optimized successfully!');
    } catch (error) {
      console.error('Error optimizing post:', error);
      alert('Failed to optimize post SEO');
    } finally {
      setOptimizing(false);
    }
  };

  const bulkOptimize = async () => {
    try {
      setOptimizing(true);
      const { data, error } = await supabase
        .rpc('bulk_optimize_low_seo_posts', { score_threshold: 80 });

      if (error) throw error;

      alert(`Optimized ${data.optimized_posts} posts successfully!`);
      await fetchSEOData();
    } catch (error) {
      console.error('Error bulk optimizing:', error);
      alert('Failed to bulk optimize posts');
    } finally {
      setOptimizing(false);
    }
  };

  const getDetailedRecommendations = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_post_seo_recommendations', { post_id: postId });

      if (error) throw error;
      setRecommendations(data);
      setSelectedPost(postId);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    }
  };

  const bulkOptimizeCritical = async () => {
    try {
      setOptimizing(true);
      const { data, error } = await supabase
        .rpc('bulk_optimize_low_seo_posts', { score_threshold: 60 });

      if (error) throw error;

      alert(`Optimized ${data.optimized_posts} critical posts successfully!`);
      await fetchSEOData();
    } catch (error) {
      console.error('Error bulk optimizing critical posts:', error);
      alert('Failed to bulk optimize critical posts');
    } finally {
      setOptimizing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 65) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'Poor': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'Needs Improvement': return <Target className="h-4 w-4 text-yellow-500" />;
      default: return <Eye className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading SEO optimization data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SEO Optimization Dashboard</h1>
        <p className="text-gray-600">Manage and optimize your blog posts for better search engine rankings</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_posts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Need Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{summary.posts_below_80}</div>
              <p className="text-xs text-gray-500">Score &lt; 80</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Critical Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.posts_below_40}</div>
              <p className="text-xs text-gray-500">Score &lt; 40</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.average_seo_score}</div>
              <p className="text-xs text-gray-500">Overall performance</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="critical" className="text-red-600">
            Critical Posts ({criticalPosts.length})
          </TabsTrigger>
          <TabsTrigger value="all">All Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Quick Actions */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={bulkOptimizeCritical} 
                    disabled={optimizing}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                  >
                    {optimizing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                    Fix Critical Posts ({criticalPosts.length})
                  </Button>
                  <Button 
                    onClick={bulkOptimize} 
                    disabled={optimizing}
                    className="flex items-center gap-2"
                  >
                    {optimizing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                    Optimize All Posts (&lt; 80)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={fetchSEOData}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Posts Preview */}
          {criticalPosts.length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription>
                <strong>{criticalPosts.length} posts have SEO scores below 60 and need immediate attention!</strong>
                <Button 
                  variant="link" 
                  className="ml-2 p-0 h-auto text-red-600"
                  onClick={() => setActiveTab('critical')}
                >
                  Click to see the list →
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="critical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Critical Posts (Score &lt; 60) - {criticalPosts.length} posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {criticalPosts.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    🎉 No critical posts! All posts have SEO scores above 60.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {criticalPosts.map((post, index) => (
                    <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow border-red-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <Badge className="bg-red-100 text-red-800">{post.urgency_level}</Badge>
                          </div>
                          <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{post.category}</Badge>
                            <Badge className={getScoreColor(post.seo_score)}>
                              Score: {post.seo_score}
                            </Badge>
                            <Badge variant="outline">{post.effort_level}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="text-sm">
                          <span className="font-medium">Keywords:</span> {post.keyword_count}
                          {post.keyword_count < 3 && <span className="text-red-500"> (critical)</span>}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Tags:</span> {post.tag_count}
                          {post.tag_count < 3 && <span className="text-red-500"> (critical)</span>}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Description:</span> {post.description_length} chars
                          {(post.description_length < 120 || post.description_length > 160) && 
                            <span className="text-red-500"> (critical)</span>}
                        </div>
                      </div>

                      {post.recommendations && (
                        <Alert className="mb-3 border-red-200">
                          <AlertDescription>
                            <strong>Priority Actions:</strong> {post.recommendations}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => optimizePost(post.id)}
                          disabled={optimizing}
                          className="flex items-center gap-1 bg-red-600 hover:bg-red-700"
                        >
                          {optimizing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                          Fix Now
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => getDetailedRecommendations(post.id)}
                          className="flex items-center gap-1"
                        >
                          <BarChart3 className="h-3 w-3" />
                          Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`/admin/posts/${post.id}/edit`, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                All Posts Needing SEO Optimization ({posts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    🎉 Great news! All your posts have good SEO scores (80+). Keep up the excellent work!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(post.seo_status)}
                            <Badge variant="secondary">{post.category}</Badge>
                            <Badge className={getScoreColor(post.seo_score)}>
                              Score: {post.seo_score}
                            </Badge>
                            <Badge variant="outline">{post.effort_level}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="text-sm">
                          <span className="font-medium">Keywords:</span> {post.keyword_count}
                          {post.keyword_count < 5 && <span className="text-red-500"> (need more)</span>}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Tags:</span> {post.tag_count}
                          {post.tag_count < 3 && <span className="text-red-500"> (need more)</span>}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Description:</span> {post.description_length} chars
                          {(post.description_length < 120 || post.description_length > 160) && 
                            <span className="text-orange-500"> (optimize length)</span>}
                        </div>
                      </div>

                      {post.recommendations && (
                        <Alert className="mb-3">
                          <AlertDescription>
                            <strong>Recommendations:</strong> {post.recommendations}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => optimizePost(post.id)}
                          disabled={optimizing}
                          className="flex items-center gap-1"
                        >
                          {optimizing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Target className="h-3 w-3" />}
                          Auto-Optimize
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => getDetailedRecommendations(post.id)}
                          className="flex items-center gap-1"
                        >
                          <BarChart3 className="h-3 w-3" />
                          Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`/admin/posts/${post.id}/edit`, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit Post
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Recommendations Modal/Panel */}
      {recommendations && selectedPost && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detailed SEO Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-600">Quick Fixes</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {recommendations.quick_fixes.map((fix, index) => (
                    <li key={index}>{fix}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-600">Content Improvements</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {recommendations.content_improvements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-600">Overall Recommendations</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {recommendations.overall_recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setRecommendations(null)}
                className="mt-4"
              >
                Close Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SEOOptimizationDashboard;
