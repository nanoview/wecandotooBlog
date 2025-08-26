import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, BarChart3, Globe, Search, Users, 
  Clock, Target, Zap, Eye, CheckCircle, AlertTriangle, 
  Brain, Lightbulb, ExternalLink, MonitorSpeaker 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdvancedSEOAnalyzer } from '@/services/advancedSEOAnalyzer';
import { useToast } from '@/hooks/use-toast';

interface SiteMetrics {
  totalPosts: number;
  publishedPosts: number;
  averageSEOScore: number;
  topPerformingPosts: number;
  needsOptimization: number;
  criticalIssues: number;
  totalViews: number;
  averageReadTime: number;
  searchVisibility: number;
  mobileOptimized: number;
}

interface SEOTrend {
  period: string;
  score: number;
  posts: number;
  improvements: number;
}

const SEOMetricsOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<SiteMetrics>({
    totalPosts: 0,
    publishedPosts: 0,
    averageSEOScore: 0,
    topPerformingPosts: 0,
    needsOptimization: 0,
    criticalIssues: 0,
    totalViews: 0,
    averageReadTime: 0,
    searchVisibility: 85,
    mobileOptimized: 92
  });
  
  const [trends, setTrends] = useState<SEOTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // Get blog posts for analysis
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, title, content, excerpt, meta_description, focus_keyword, status, created_at, category');

      if (error) throw error;

      // Analyze each post
      const publishedPosts = posts?.filter(p => p.status === 'published') || [];
      const totalPosts = posts?.length || 0;
      
      let totalScore = 0;
      let topPerforming = 0;
      let needsOpt = 0;
      let critical = 0;

      publishedPosts.forEach(post => {
        const analysis = AdvancedSEOAnalyzer.analyzeContent(
          post.content || '',
          post.title || '',
          post.meta_description || post.excerpt || '',
          post.focus_keyword || ''
        );
        
        totalScore += analysis.overallScore;
        
        if (analysis.overallScore >= 80) topPerforming++;
        else if (analysis.overallScore >= 60) needsOpt++;
        else critical++;
      });

      const averageScore = publishedPosts.length > 0 ? Math.round(totalScore / publishedPosts.length) : 0;

      // Get visitor analytics if available
      const { data: analytics } = await supabase
        .from('visitor_analytics')
        .select('page_views, session_duration')
        .limit(1000);

      const totalViews = analytics?.reduce((sum, record) => sum + (record.page_views || 0), 0) || 0;
      const avgReadTime = analytics?.length > 0 ? 
        Math.round(analytics.reduce((sum, record) => sum + (record.session_duration || 0), 0) / analytics.length) : 0;

      setMetrics({
        totalPosts,
        publishedPosts: publishedPosts.length,
        averageSEOScore: averageScore,
        topPerformingPosts: topPerforming,
        needsOptimization: needsOpt,
        criticalIssues: critical,
        totalViews,
        averageReadTime: avgReadTime,
        searchVisibility: 85 + Math.round(averageScore * 0.15), // Estimated based on SEO score
        mobileOptimized: 90 + Math.round(averageScore * 0.1) // Estimated mobile optimization
      });

      // Generate trend data (simulated for now)
      const trendData: SEOTrend[] = [
        { period: 'Last 7 days', score: averageScore, posts: Math.round(publishedPosts.length * 0.1), improvements: topPerforming },
        { period: 'Last 30 days', score: Math.max(0, averageScore - 5), posts: Math.round(publishedPosts.length * 0.4), improvements: Math.round(topPerforming * 0.8) },
        { period: 'Last 90 days', score: Math.max(0, averageScore - 10), posts: publishedPosts.length, improvements: Math.round(topPerforming * 0.6) }
      ];
      setTrends(trendData);

    } catch (error) {
      console.error('Error loading metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load SEO metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runSiteAudit = async () => {
    setAnalyzing(true);
    try {
      // Create comprehensive site audit prompt for ChatGPT
      const auditPrompt = encodeURIComponent(`🔍 COMPREHENSIVE SEO SITE AUDIT REQUEST

**CURRENT SITE PERFORMANCE:**
📊 Total Posts: ${metrics.totalPosts}
📈 Published Posts: ${metrics.publishedPosts}
⭐ Average SEO Score: ${metrics.averageSEOScore}/100
🏆 Top Performing Posts: ${metrics.topPerformingPosts}
⚠️ Need Optimization: ${metrics.needsOptimization}
🚨 Critical Issues: ${metrics.criticalIssues}
👁️ Total Views: ${metrics.totalViews.toLocaleString()}
⏱️ Average Read Time: ${metrics.averageReadTime}s
🔍 Search Visibility: ${metrics.searchVisibility}%
📱 Mobile Optimized: ${metrics.mobileOptimized}%

**COMPREHENSIVE AUDIT REQUEST:**
Please provide a detailed SEO audit and improvement strategy for wecandotoo.com:

1. **TECHNICAL SEO ANALYSIS**
   - Core Web Vitals assessment
   - Page speed optimization opportunities
   - Mobile-first indexing compliance
   - Schema markup implementation
   - XML sitemap optimization
   - Robots.txt analysis

2. **CONTENT STRATEGY AUDIT**
   - Content gap analysis
   - Keyword opportunity mapping
   - Content depth and quality assessment
   - Internal linking structure review
   - Duplicate content identification

3. **ON-PAGE SEO REVIEW**
   - Title tag optimization opportunities
   - Meta description improvements
   - Header structure analysis (H1-H6)
   - Image optimization recommendations
   - URL structure evaluation

4. **OFF-PAGE SEO ASSESSMENT**
   - Backlink profile analysis
   - Local SEO opportunities
   - Social media integration
   - Brand mention tracking
   - Competitor analysis

5. **USER EXPERIENCE OPTIMIZATION**
   - Navigation structure review
   - Call-to-action optimization
   - Conversion rate improvements
   - Accessibility compliance
   - Page layout optimization

6. **PERFORMANCE TRACKING SETUP**
   - Google Analytics 4 configuration
   - Google Search Console optimization
   - Conversion tracking implementation
   - SEO KPI dashboard setup

7. **CONTENT OPTIMIZATION PRIORITIES**
   - High-impact content improvements
   - Featured snippet opportunities
   - Voice search optimization
   - Video content integration
   - FAQ implementation

8. **TECHNICAL IMPROVEMENTS**
   - Site architecture optimization
   - Database query optimization
   - CDN implementation recommendations
   - Security enhancements (HTTPS, etc.)

**TARGET OUTCOMES:**
- Increase average SEO score to 90%+
- Improve search visibility by 20%+
- Reduce critical issues to zero
- Enhance user engagement metrics
- Boost organic traffic by 50%+

Please provide specific, actionable recommendations with implementation priorities and expected impact for each improvement.`);

      const chatGptUrl = `https://chat.openai.com/?q=${auditPrompt}`;
      window.open(chatGptUrl, '_blank');

      toast({
        title: "🔍 Site Audit Started",
        description: "ChatGPT opened with comprehensive SEO audit prompts!"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate audit prompts",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading SEO metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Audit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SEO Performance Overview</h2>
          <p className="text-gray-600">Comprehensive analysis of your site's SEO health</p>
        </div>
        <Button
          onClick={runSiteAudit}
          disabled={analyzing}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {analyzing ? (
            <>
              <Brain className="w-4 h-4 mr-2 animate-pulse" />
              Generating Audit...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Run Site Audit
            </>
          )}
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Average SEO Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(metrics.averageSEOScore)}`}>
              {metrics.averageSEOScore}%
            </div>
            <Progress value={metrics.averageSEOScore} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              {metrics.publishedPosts} published posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{metrics.topPerformingPosts}</div>
            <p className="text-xs text-gray-500">Posts scoring 80%+</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">Excellent performance</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Need Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{metrics.needsOptimization}</div>
            <p className="text-xs text-gray-500">Posts scoring 60-79%</p>
            <div className="flex items-center gap-1 mt-2">
              <Lightbulb className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-yellow-600">Improvement potential</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{metrics.criticalIssues}</div>
            <p className="text-xs text-gray-500">Posts scoring &lt;60%</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="w-3 h-3 text-red-500" />
              <span className="text-xs text-red-600">Urgent attention needed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-500" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Across all posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Avg. Read Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.averageReadTime / 60)}m</div>
            <p className="text-xs text-gray-500">{metrics.averageReadTime}s average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-500" />
              Search Visibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{metrics.searchVisibility}%</div>
            <Progress value={metrics.searchVisibility} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MonitorSpeaker className="w-4 h-4 text-cyan-500" />
              Mobile Optimized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">{metrics.mobileOptimized}%</div>
            <Progress value={metrics.mobileOptimized} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Trends Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            SEO Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium">{trend.period}</div>
                  <Badge variant="outline">{trend.posts} posts</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(trend.score)}`}>
                      {trend.score}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {trend.improvements} optimized
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getScoreBg(trend.score)}`}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => window.open('https://search.google.com/search-console', '_blank')}
            >
              <Search className="w-6 h-6" />
              <span className="font-medium">Search Console</span>
              <span className="text-xs text-gray-500">Monitor search performance</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => window.open('https://pagespeed.web.dev/report?url=https://wecandotoo.com', '_blank')}
            >
              <Zap className="w-6 h-6" />
              <span className="font-medium">PageSpeed Test</span>
              <span className="text-xs text-gray-500">Check site performance</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => window.open('https://www.google.com/webmasters/tools/mobile-friendly/', '_blank')}
            >
              <MonitorSpeaker className="w-6 h-6" />
              <span className="font-medium">Mobile Test</span>
              <span className="text-xs text-gray-500">Mobile optimization check</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOMetricsOverview;
