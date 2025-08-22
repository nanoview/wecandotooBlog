import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Globe, 
  Eye, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Monitor, 
  Smartphone, 
  Tablet,
  RefreshCw,
  Download,
  Calendar,
  BarChart3,
  MousePointer,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VisitorSession {
  id: string;
  session_id: string;
  ip_address: string;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  referrer?: string;
  first_visit: string;
  last_visit: string;
  visit_count: number;
}

interface PostImpression {
  id: string;
  session_id: string;
  post_id: number;
  post_slug?: string;
  view_duration: number;
  scroll_depth: number;
  is_bounce: boolean;
  timestamp: string;
  blog_posts?: {
    title: string;
    slug: string;
  };
}

interface AnalyticsSummary {
  date: string;
  total_visitors: number;
  unique_visitors: number;
  page_views: number;
  bounce_rate: number;
  avg_session_duration: number;
  top_countries: Array<{ country: string; count: number }>;
  top_posts: Array<{ post_slug: string; title: string; views: number }>;
}

export default function VisitorAnalytics() {
  const [visitorSessions, setVisitorSessions] = useState<VisitorSession[]>([]);
  const [postImpressions, setPostImpressions] = useState<PostImpression[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState('today');
  const { toast } = useToast();

  const fetchVisitorAnalytics = async () => {
    try {
      setRefreshing(true);
      
      // Calculate date range based on filter
      const now = new Date();
      let startDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'all':
          startDate.setFullYear(2020); // Get all data
          break;
      }

      // Fetch visitor sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('visitor_sessions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (sessionsError) throw sessionsError;

      // Fetch post impressions (without join to avoid relationship issues)
      const { data: impressions, error: impressionsError } = await supabase
        .from('post_impressions')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false })
        .limit(200);

      if (impressionsError) throw impressionsError;

      // Fetch blog posts separately and join in JavaScript
      let impressionsWithPosts = impressions || [];
      if (impressions && impressions.length > 0) {
        const uniqueSlugs = [...new Set(impressions.map(imp => imp.post_slug).filter(Boolean))];
        const uniqueIds = [...new Set(impressions.map(imp => imp.post_id).filter(Boolean))];
        
        // Fetch blog posts by slug and id
        const { data: blogPosts } = await supabase
          .from('blog_posts')
          .select('id, title, slug')
          .or(`slug.in.(${uniqueSlugs.map(s => `"${s}"`).join(',')}),id.in.(${uniqueIds.join(',')})`);

        // Join the data in JavaScript
        impressionsWithPosts = impressions.map(impression => {
          const blogPost = blogPosts?.find(post => 
            post.slug === impression.post_slug || 
            post.id === impression.post_id
          );
          
          return {
            ...impression,
            blog_posts: blogPost ? {
              title: blogPost.title,
              slug: blogPost.slug
            } : null
          };
        });
      }

      // Fetch analytics summary
      const { data: summary, error: summaryError } = await supabase
        .from('visitor_analytics_summary')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(30);

      if (summaryError) throw summaryError;

      setVisitorSessions(sessions || []);
      setPostImpressions(impressionsWithPosts || []);
      setAnalyticsSummary(summary || []);

    } catch (error: any) {
      console.error('Error fetching visitor analytics:', error);
      toast({
        title: "Error Loading Analytics",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVisitorAnalytics();
  }, [dateFilter]);

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const exportData = async () => {
    try {
      const exportData = {
        sessions: visitorSessions,
        impressions: postImpressions,
        summary: analyticsSummary,
        exported_at: new Date().toISOString(),
        date_filter: dateFilter
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visitor-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Analytics data exported successfully"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export analytics data",
        variant: "destructive"
      });
    }
  };

  // Calculate current stats
  const currentStats = {
    totalVisitors: visitorSessions.length,
    uniqueVisitors: new Set(visitorSessions.map(s => s.ip_address)).size,
    totalPageViews: postImpressions.length,
    bounceRate: postImpressions.length > 0 ? 
      (postImpressions.filter(p => p.is_bounce).length / postImpressions.length * 100).toFixed(1) : '0',
    avgDuration: postImpressions.length > 0 ?
      Math.round(postImpressions.reduce((sum, p) => sum + p.view_duration, 0) / postImpressions.length) : 0
  };

  // Group data for display
  const topCountries = visitorSessions
    .filter(s => s.country)
    .reduce((acc, session) => {
      acc[session.country!] = (acc[session.country!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topPosts = postImpressions
    .reduce((acc, impression) => {
      const key = impression.blog_posts?.title || impression.post_slug || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading visitor analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Visitor Analytics
          </h2>
          <p className="text-muted-foreground">
            Track visitor behavior, locations, and post engagement
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVisitorAnalytics}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Visitors</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {currentStats.totalVisitors.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Unique Visitors</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {currentStats.uniqueVisitors.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Page Views</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {currentStats.totalPageViews.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Bounce Rate</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {currentStats.bounceRate}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-gray-600">Avg. Duration</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.floor(currentStats.avgDuration / 60)}m {currentStats.avgDuration % 60}s
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sessions">Visitor Sessions</TabsTrigger>
          <TabsTrigger value="impressions">Post Views</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="summary">Daily Summary</TabsTrigger>
        </TabsList>

        {/* Visitor Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recent Visitor Sessions
              </CardTitle>
              <CardDescription>
                Latest {visitorSessions.length} visitor sessions with location and device info
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {visitorSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(session.device_type)}
                      <div>
                        <p className="font-medium text-sm">
                          {session.ip_address}
                          {session.visit_count > 1 && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {session.visit_count} visits
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.city && session.country ? 
                            `${session.city}, ${session.country}` : 
                            session.country || 'Unknown Location'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {session.device_type} • {session.browser}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.first_visit).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {visitorSessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No visitor sessions found for the selected period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Post Impressions Tab */}
        <TabsContent value="impressions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Post Impressions & Engagement
              </CardTitle>
              <CardDescription>
                Recent post views with engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {postImpressions.map((impression) => (
                  <div key={impression.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {impression.blog_posts?.title || impression.post_slug || 'Unknown Post'}
                        {impression.is_bounce && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Bounce
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Session: {impression.session_id.substring(0, 8)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{Math.floor(impression.view_duration / 60)}m{impression.view_duration % 60}s</p>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{impression.scroll_depth}%</p>
                        <p className="text-xs text-muted-foreground">Scroll</p>
                      </div>
                      <div className="text-center min-w-[100px]">
                        <p className="text-xs text-muted-foreground">
                          {new Date(impression.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {postImpressions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No post impressions found for the selected period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Countries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(topCountries)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([country, count]) => (
                      <div key={country} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{country}</span>
                        <Badge variant="secondary">{count} visitors</Badge>
                      </div>
                    ))}
                  
                  {Object.keys(topCountries).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No location data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Most Viewed Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(topPosts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([post, views]) => (
                      <div key={post} className="flex items-center justify-between">
                        <span className="text-sm font-medium flex-1 pr-2 truncate">{post}</span>
                        <Badge variant="secondary">{views} views</Badge>
                      </div>
                    ))}
                  
                  {Object.keys(topPosts).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No post view data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Daily Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Daily Analytics Summary
              </CardTitle>
              <CardDescription>
                Aggregated daily statistics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsSummary.map((summary) => (
                  <div key={summary.date} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">
                        {new Date(summary.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <Badge variant="outline">
                        {summary.page_views} views
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Visitors</p>
                        <p className="font-medium">{summary.total_visitors}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Unique</p>
                        <p className="font-medium">{summary.unique_visitors}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Bounce Rate</p>
                        <p className="font-medium">{summary.bounce_rate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg. Duration</p>
                        <p className="font-medium">
                          {Math.floor(summary.avg_session_duration / 60)}m{summary.avg_session_duration % 60}s
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {analyticsSummary.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No daily summary data available for the selected period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
