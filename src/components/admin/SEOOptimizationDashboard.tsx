import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Target, RefreshCw, Eye, Edit } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

const SEOOptimizationDashboard: React.FC = () => {
  const [posts, setPosts] = useState<SEOOptimizationPost[]>([]);
  const [summary, setSummary] = useState<SEOSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  useEffect(() => {
    fetchSEOData();
  }, []);

  const fetchSEOData = async () => {
    setLoading(true);
    try {
      // Fetch posts needing optimization
      const { data: postsData, error: postsError } = await supabase
        .from('posts_needing_seo_optimization')
        .select('*')
        .order('optimization_priority', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;

      // Fetch summary
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_seo_optimization_summary');

      if (summaryError) throw summaryError;

      setPosts(postsData || []);
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

      {/* Bulk Actions */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Bulk Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={bulkOptimize} 
                disabled={optimizing}
                className="flex items-center gap-2"
              >
                {optimizing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                Optimize All Posts (Score &lt; 80)
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

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Posts Needing SEO Optimization ({posts.length})
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
    </div>
  );
};

export default SEOOptimizationDashboard;
