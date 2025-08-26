import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, Target, TrendingUp, Zap, Brain, Eye, ExternalLink, 
  CheckCircle, AlertTriangle, Info, Lightbulb, ArrowUp, Clock,
  Search, FileText, Users, Globe, Smartphone, MonitorSpeaker
} from 'lucide-react';
import { AdvancedSEOAnalyzer, AdvancedSEOAnalysis, SEORecommendation } from '@/services/advancedSEOAnalyzer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SEOMetricsOverview from '@/components/admin/SEOMetricsOverview';

interface PostAnalysis {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription: string;
  focusKeyword: string;
  category: string;
  status: string;
  analysis: AdvancedSEOAnalysis;
  lastOptimized?: string;
}

const EnhancedSEODashboard: React.FC = () => {
  const [posts, setPosts] = useState<PostAnalysis[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [overallStats, setOverallStats] = useState({
    averageScore: 0,
    totalPosts: 0,
    excellentPosts: 0,
    needsImprovement: 0,
    critical: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPostsAndAnalyze();
  }, []);

  const loadPostsAndAnalyze = async () => {
    setLoading(true);
    try {
      const { data: blogPosts, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, content, excerpt, meta_description, focus_keyword, category, status')
        .eq('status', 'published')
        .limit(20);

      if (error) throw error;

      const analyzedPosts = blogPosts.map(post => {
        const analysis = AdvancedSEOAnalyzer.analyzeContent(
          post.content || '',
          post.title || '',
          post.meta_description || post.excerpt || '',
          post.focus_keyword || ''
        );

        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          metaDescription: post.meta_description || post.excerpt,
          focusKeyword: post.focus_keyword || '',
          category: post.category,
          status: post.status,
          analysis
        };
      });

      setPosts(analyzedPosts);
      calculateOverallStats(analyzedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts for analysis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStats = (posts: PostAnalysis[]) => {
    const totalPosts = posts.length;
    const totalScore = posts.reduce((sum, post) => sum + post.analysis.overallScore, 0);
    const averageScore = totalPosts > 0 ? Math.round(totalScore / totalPosts) : 0;
    
    const excellentPosts = posts.filter(p => p.analysis.overallScore >= 80).length;
    const needsImprovement = posts.filter(p => p.analysis.overallScore >= 60 && p.analysis.overallScore < 80).length;
    const critical = posts.filter(p => p.analysis.overallScore < 60).length;

    setOverallStats({
      averageScore,
      totalPosts,
      excellentPosts,
      needsImprovement,
      critical
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'content': return <FileText className="w-4 h-4" />;
      case 'technical': return <Globe className="w-4 h-4" />;
      case 'keywords': return <Search className="w-4 h-4" />;
      case 'ux': return <Users className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getRecommendationIcon = (category: string) => {
    switch (category) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'important': return <ExternalLink className="w-4 h-4 text-orange-500" />;
      case 'minor': return <Info className="w-4 h-4 text-blue-500" />;
      case 'enhancement': return <Lightbulb className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const optimizeWithAI = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    setAnalyzing(true);
    try {
      // Create ChatGPT optimization prompt
      const recommendations = post.analysis.recommendations
        .slice(0, 5)
        .map(rec => `- ${rec.title}: ${rec.description}`)
        .join('\n');

      const seoPrompt = encodeURIComponent(`🚀 ADVANCED SEO OPTIMIZATION REQUEST

**CURRENT POST ANALYSIS:**
📊 Overall SEO Score: ${post.analysis.overallScore}/100
🎯 Content Score: ${post.analysis.contentScore}/30
⚙️ Technical Score: ${post.analysis.technicalScore}/25  
🔍 Keyword Score: ${post.analysis.keywordScore}/25
👥 UX Score: ${post.analysis.userExperienceScore}/20

**POST DETAILS:**
Title: ${post.title}
Focus Keyword: ${post.focusKeyword || 'None set'}
Meta Description: ${post.metaDescription || 'None set'}
Word Count: ${post.analysis.detailedBreakdown.wordCount.current}
URL: https://wecandotoo.com/${post.slug}

**TOP PRIORITY IMPROVEMENTS NEEDED:**
${recommendations}

**DETAILED OPTIMIZATION REQUEST:**
Please provide comprehensive optimization suggestions to improve this post's SEO score to 90%+:

1. **ENHANCED TITLE OPTIMIZATION**
   - Rewrite title for better keyword targeting
   - Ensure 30-60 characters with primary keyword
   - Make it more compelling for clicks

2. **META DESCRIPTION ENHANCEMENT** 
   - Create compelling 120-160 character description
   - Include primary keyword and call-to-action
   - Focus on click-through rate optimization

3. **CONTENT STRUCTURE IMPROVEMENTS**
   - Suggest H2/H3 heading optimizations
   - Recommend content additions for ${post.analysis.detailedBreakdown.wordCount.target}+ words
   - FAQ section suggestions for voice search

4. **KEYWORD OPTIMIZATION STRATEGY**
   - Primary keyword placement recommendations
   - Secondary keyword suggestions
   - LSI keyword integration
   - Keyword density optimization

5. **TECHNICAL SEO ENHANCEMENTS**
   - Schema markup recommendations
   - Internal linking opportunities
   - Image alt text suggestions
   - URL optimization if needed

6. **USER EXPERIENCE IMPROVEMENTS**
   - Readability enhancements
   - Engagement element suggestions
   - Call-to-action optimization
   - Mobile optimization tips

7. **PERFORMANCE OPTIMIZATION**
   - Page speed improvement suggestions
   - Core Web Vitals optimization
   - Mobile-first indexing preparation

**TARGET OUTCOME:** Transform this post into a 90%+ SEO optimized piece that ranks higher in search results and drives more organic traffic.

Please provide specific, actionable recommendations with before/after examples where possible.`);

      const chatGptUrl = `https://chat.openai.com/?q=${seoPrompt}`;
      window.open(chatGptUrl, '_blank');

      toast({
        title: "🚀 AI Optimization Started",
        description: "ChatGPT opened with advanced SEO optimization prompts for your post!"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate optimization suggestions",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Analyzing SEO performance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-blue-600" />
          Enhanced SEO Dashboard
        </h1>
        <p className="text-gray-600">Advanced AI-powered SEO analysis and optimization</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(overallStats.averageScore)}`}>
              {overallStats.averageScore}%
            </div>
            <Progress value={overallStats.averageScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Excellent (80%+)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallStats.excellentPosts}</div>
            <p className="text-xs text-gray-500">High performing posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-500" />
              Good (60-79%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overallStats.needsImprovement}</div>
            <p className="text-xs text-gray-500">Needs optimization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Critical (&lt;60%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallStats.critical}</div>
            <p className="text-xs text-gray-500">Urgent attention needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalPosts}</div>
            <p className="text-xs text-gray-500">Analyzed posts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Posts Analysis
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Detailed View
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            AI Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <SEOMetricsOverview />
        </TabsContent>

        {/* Posts Analysis Tab */}
        <TabsContent value="posts" className="space-y-4">
          <div className="grid gap-4">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary">{post.category}</Badge>
                        <Badge className={getScoreBg(post.analysis.overallScore)}>
                          {post.analysis.overallScore}% SEO Score
                        </Badge>
                        <Badge variant="outline">
                          {post.analysis.detailedBreakdown.wordCount.current} words
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => optimizeWithAI(post.id)}
                      disabled={analyzing}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {analyzing ? (
                        <>
                          <Brain className="w-4 h-4 mr-2 animate-pulse" />
                          Optimizing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          AI Optimize
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Score Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600">Content</div>
                      <div className={`text-xl font-bold ${getScoreColor(post.analysis.contentScore)}`}>
                        {post.analysis.contentScore}/30
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600">Technical</div>
                      <div className={`text-xl font-bold ${getScoreColor(post.analysis.technicalScore)}`}>
                        {post.analysis.technicalScore}/25
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600">Keywords</div>
                      <div className={`text-xl font-bold ${getScoreColor(post.analysis.keywordScore)}`}>
                        {post.analysis.keywordScore}/25
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600">UX</div>
                      <div className={`text-xl font-bold ${getScoreColor(post.analysis.userExperienceScore)}`}>
                        {post.analysis.userExperienceScore}/20
                      </div>
                    </div>
                  </div>

                  {/* Top Recommendations */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 mb-2">Top Recommendations:</h4>
                    {post.analysis.recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                        {getRecommendationIcon(rec.category)}
                        <div className="flex-1">
                          <span className="font-medium">{rec.title}</span>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          +{rec.estimatedScoreGain}pts
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedPost(post)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`https://wecandotoo.com/${post.slug}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Live
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Detailed View Tab */}
        <TabsContent value="detailed" className="space-y-4">
          {selectedPost ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Detailed Analysis: {selectedPost.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Content Quality (30 pts)</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Word Count</span>
                        <span className="font-medium">{selectedPost.analysis.detailedBreakdown.wordCount.score}/30</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Heading Structure</span>
                        <span className="font-medium">{selectedPost.analysis.detailedBreakdown.headingStructure.score}/25</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Content Depth</span>
                        <span className="font-medium">{selectedPost.analysis.detailedBreakdown.contentDepth.score}/25</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Multimedia</span>
                        <span className="font-medium">{selectedPost.analysis.detailedBreakdown.multimedia.score}/20</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Technical SEO (25 pts)</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Meta Title</span>
                        <span className="font-medium">{selectedPost.analysis.detailedBreakdown.metaTitle.score}/25</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Meta Description</span>
                        <span className="font-medium">{selectedPost.analysis.detailedBreakdown.metaDescription.score}/25</span>
                      </div>
                      <div className="flex justify-between">
                        <span>URL Structure</span>
                        <span className="font-medium">{selectedPost.analysis.detailedBreakdown.urlStructure.score}/20</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Schema Markup</span>
                        <span className="font-medium">{selectedPost.analysis.detailedBreakdown.schemaMarkup.score}/25</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trending Opportunities */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trending Opportunities
                  </h3>
                  <div className="grid gap-2">
                    {selectedPost.analysis.trendingOpportunities.map((opportunity, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <ArrowUp className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{opportunity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Select a post from the Posts Analysis tab to view detailed breakdown.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {selectedPost ? (
            <div className="space-y-4">
              {selectedPost.analysis.recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getRecommendationIcon(rec.category)}
                        {getCategoryIcon(rec.type)}
                        <span>{rec.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={rec.impact === 'high' ? 'destructive' : rec.impact === 'medium' ? 'default' : 'secondary'}>
                          {rec.impact} impact
                        </Badge>
                        <Badge variant="outline">+{rec.estimatedScoreGain} pts</Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{rec.description}</p>
                    <div>
                      <h4 className="font-medium mb-2">Action Items:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {rec.actionItems.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-sm text-gray-600">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <Lightbulb className="w-4 h-4" />
              <AlertDescription>
                Select a post to view AI-powered optimization recommendations.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSEODashboard;
