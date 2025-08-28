import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff, 
  FileText, 
  LogOut, 
  Trash, 
  Users, 
  BarChart3,
  Activity,
  Calendar,
  TrendingUp,
  MessageSquare,
  Star,
  DollarSign,
  Clock,
  Shield,
  Search,
  Mail,
  Database,
  Settings,
  Plus,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/navigation/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BlogPost } from '@/types/blog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import LoadingSkeleton from '@/components/LoadingSkeleton';

// Lazy load heavy components
const SupabaseGoogleDashboard = lazy(() => import('@/components/SupabaseGoogleDashboard'));
const GoogleDataDashboard = lazy(() => import('@/components/GoogleDataDashboard'));
const OverviewTab = lazy(() => import('@/components/admin/OverviewTab'));
const PostsTab = lazy(() => import('@/components/admin/PostsTab'));
const DashboardTab = lazy(() => import('@/components/admin/DashboardTab'));
const SettingsTab = lazy(() => import('@/components/admin/SettingsTab'));
const UserManagement = lazy(() => import('@/components/admin/UserManagement'));
const ZohoMailChecker = lazy(() => import('@/components/admin/ZohoMailChecker'));
const ContactMessages = lazy(() => import('@/components/admin/ContactMessages'));
const SEOUtilities = lazy(() => import('@/components/admin/SEOUtilities'));
const DatabaseViewer = lazy(() => import('@/components/admin/DatabaseViewer'));
const VisitorAnalytics = lazy(() => import('@/components/admin/VisitorAnalytics'));

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  created_at: string;
  user_roles: { role: string }[];
}

interface Comment {
  id: string;
  content: string;
  blog_post_id: string;
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
  };
}

interface BlogPostAdmin {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  status: string;
  author_id: string;
  seo_score?: number;
  profiles: {
    username: string;
    display_name: string;
  };
}

interface TabsContentProps {
  value: string;
  className?: string;
  children?: React.ReactNode;
}

const Admin = () => {
  const { user, userRole, username, loading, refreshUserData, isNanopro, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPostAdmin[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedView, setSelectedView] = useState<string | null>(null);

  useEffect(() => {
    // Don't redirect while still loading authentication state
    if (loading) {
      return;
    }

    // If user is not authenticated, redirect
    if (!user) {
      navigate('/');
      return;
    }

    // If user is authenticated but role is still loading, wait
    if (user && userRole === null) {
      return;
    }

    // If user is authenticated but not admin, redirect
    if (user && userRole !== 'admin') {
      navigate('/');
      return;
    }

    // Only admin users can access admin panel
    if (user && userRole === 'admin') {
      fetchData();
    }
  }, [user, userRole, loading, navigate]);

  const fetchData = useCallback(async () => {
    try {
      setLoadingData(true);
      
      // Use Promise.all to fetch data in parallel with proper joins
      const [profilesResult, commentsResult, postsResult] = await Promise.all([
        // Fetch profiles and roles separately to avoid relationship issues
        supabase
          .from('profiles')
          .select(`
            id, user_id, username, display_name, created_at
          `)
          .order('created_at', { ascending: false })
          .limit(50), // Limit initial load

        // Fetch comments with profile data in a single query
        supabase
          .from('comments')
          .select(`
            id, content, blog_post_id, created_at, user_id,
            profiles!comments_user_id_fkey (username, display_name)
          `)
          .order('created_at', { ascending: false })
          .limit(100), // Limit initial load

        // Fetch blog posts with author profiles in a single query
        supabase
          .from('blog_posts')
          .select(`
            id, title, slug, excerpt, category, featured_image,
            published_at, created_at, updated_at, status, author_id, seo_score,
            profiles!blog_posts_author_id_fkey (username, display_name)
          `)
          .order('created_at', { ascending: false })
          .limit(50) // Limit initial load
      ]);

      // Process profiles data and fetch roles separately
      if (profilesResult.data) {
        // Fetch roles for all profiles
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('user_id, role');

        const processedProfiles = profilesResult.data.map(profile => {
          // Find roles for this user
          const userRoles = rolesData?.filter(role => 
            role.user_id === profile.user_id || 
            role.user_id === profile.user_id?.toString()
          ) || [];
          
          return {
            ...profile,
            user_roles: userRoles.length > 0 ? userRoles : [{ role: 'user' }]
          };
        });
        setProfiles(processedProfiles);
      }

      // Process comments data
      if (commentsResult.data) {
        const processedComments = commentsResult.data.map(comment => ({
          ...comment,
          profiles: Array.isArray(comment.profiles) 
            ? comment.profiles[0] || { username: 'Unknown', display_name: 'Unknown User' }
            : comment.profiles || { username: 'Unknown', display_name: 'Unknown User' }
        }));
        setComments(processedComments);
      }

      // Process blog posts data
      if (postsResult.data) {
        const processedPosts = postsResult.data.map(post => ({
          ...post,
          content: '', // Don't load full content for list view
          profiles: Array.isArray(post.profiles)
            ? post.profiles[0] || { username: 'Unknown', display_name: 'Unknown Author' }
            : post.profiles || { username: 'Unknown', display_name: 'Unknown Author' }
        }));
        setBlogPosts(processedPosts);
      }

      // Handle any errors
      if (profilesResult.error) throw profilesResult.error;
      if (commentsResult.error) throw commentsResult.error;
      if (postsResult.error) throw postsResult.error;

    } catch (error: any) {
      console.error('Admin data fetch error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  }, [toast]);

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.filter(comment => comment.id !== commentId));
      toast({
        title: "Success",
        description: "Comment deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteBlogPost = async (postId: string) => {
    try {
      // First delete all comments for this post
      await supabase
        .from('comments')
        .delete()
        .eq('blog_post_id', postId);

      // Then delete the post
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setBlogPosts(blogPosts.filter(post => post.id !== postId));
      toast({
        title: "Success",
        description: "Blog post deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const togglePostStatus = async (postId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) throw error;

      setBlogPosts(blogPosts.map(post => 
        post.id === postId 
          ? { ...post, status: newStatus, published_at: updateData.published_at || post.published_at }
          : post
      ));

      toast({
        title: "Success",
        description: `Post ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'editor' | 'user') => {
    try {
      // First, try to update the existing role
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ role: newRole as any })
        .eq('user_id', userId);

      // If update fails (maybe no existing row), try to insert a new one
      if (updateError) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole as any });
        
        if (insertError) throw insertError;
      }

      // Update local state
      setProfiles(profiles.map(profile => 
        profile.user_id === userId 
          ? { ...profile, user_roles: [{ role: newRole }] }
          : profile
      ));

      // If the updated user is the current user, refresh their data
      if (userId === user?.id) {
        await refreshUserData();
      }

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'editor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <Header variant="simple" />
      
      {/* Admin Title Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between sm:justify-center gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h1 className="text-lg sm:text-xl font-semibold">Admin Panel</h1>
              {isNanopro && (
                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs sm:text-sm">
                  Super Admin
                </Badge>
              )}
            </div>
            {/* Mobile logout button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="sm:hidden flex items-center gap-1 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Admin Panel Cards */}
        {!selectedView ? (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Admin Dashboard</h2>
              <p className="text-gray-600 text-lg">Manage your website with powerful admin tools</p>
            </div>

            {/* Stats Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Posts</p>
                      <p className="text-3xl font-bold">{blogPosts.length}</p>
                    </div>
                    <FileText className="w-12 h-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold">{profiles.length}</p>
                    </div>
                    <Users className="w-12 h-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Comments</p>
                      <p className="text-3xl font-bold">{comments.length}</p>
                    </div>
                    <MessageSquare className="w-12 h-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Panel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Overview Panel */}
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer group hover:scale-105 transition-transform duration-200"
                onClick={() => setSelectedView('overview')}
              >
                <CardContent className="p-8 text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
                  <p className="text-gray-600 text-sm">Dashboard overview and quick stats</p>
                </CardContent>
              </Card>

              {/* Blog Posts Panel */}
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer group hover:scale-105 transition-transform duration-200"
                onClick={() => setSelectedView('posts')}
              >
                <CardContent className="p-8 text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Blog Posts</h3>
                  <p className="text-gray-600 text-sm">Manage blog posts and content</p>
                  <Badge variant="secondary" className="mt-2">{blogPosts.length} posts</Badge>
                </CardContent>
              </Card>

              {/* Analytics Panel */}
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer group hover:scale-105 transition-transform duration-200"
                onClick={() => setSelectedView('analytics')}
              >
                <CardContent className="p-8 text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                    <Activity className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-gray-600 text-sm">Visitor analytics and insights</p>
                </CardContent>
              </Card>

              {/* Users Panel */}
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer group hover:scale-105 transition-transform duration-200"
                onClick={() => setSelectedView('users')}
              >
                <CardContent className="p-8 text-center">
                  <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                    <Users className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Users</h3>
                  <p className="text-gray-600 text-sm">Manage users and permissions</p>
                  <Badge variant="secondary" className="mt-2">{profiles.length} users</Badge>
                </CardContent>
              </Card>

              {/* SEO Panel */}
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer group hover:scale-105 transition-transform duration-200"
                onClick={() => setSelectedView('seo')}
              >
                <CardContent className="p-8 text-center">
                  <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-200 transition-colors">
                    <Search className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">SEO Tools</h3>
                  <p className="text-gray-600 text-sm">SEO optimization utilities</p>
                </CardContent>
              </Card>

              {/* Contact Messages Panel */}
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer group hover:scale-105 transition-transform duration-200"
                onClick={() => setSelectedView('emails')}
              >
                <CardContent className="p-8 text-center">
                  <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                    <Mail className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
                  <p className="text-gray-600 text-sm">Contact form messages</p>
                </CardContent>
              </Card>

              {/* Google APIs Panel */}
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer group hover:scale-105 transition-transform duration-200"
                onClick={() => setSelectedView('google')}
              >
                <CardContent className="p-8 text-center">
                  <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
                    <BarChart3 className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Google APIs</h3>
                  <p className="text-gray-600 text-sm">Google services integration</p>
                </CardContent>
              </Card>

              {/* Database Panel */}
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer group hover:scale-105 transition-transform duration-200"
                onClick={() => setSelectedView('database')}
              >
                <CardContent className="p-8 text-center">
                  <div className="bg-cyan-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-200 transition-colors">
                    <Database className="w-8 h-8 text-cyan-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Database</h3>
                  <p className="text-gray-600 text-sm">Database management tools</p>
                </CardContent>
              </Card>

              {/* Settings Panel */}
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer group hover:scale-105 transition-transform duration-200"
                onClick={() => setSelectedView('settings')}
              >
                <CardContent className="p-8 text-center">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                    <Settings className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
                  <p className="text-gray-600 text-sm">System configuration</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => navigate('/create-post')}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Post
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedView('posts')}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Manage Posts
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedView('users')}
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  User Management
                </Button>
                <Button 
                  variant="outline"
                  onClick={signOut}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Individual Views */
          <div className="space-y-6">
            {/* Back Button */}
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="outline" 
                onClick={() => setSelectedView(null)}
                className="flex items-center gap-2"
              >
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">{selectedView}</h2>
            </div>

            {/* Render Selected View */}
            {selectedView === 'overview' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <OverviewTab
                  blogPosts={blogPosts}
                  profiles={profiles}
                  comments={comments}
                  userRole={userRole}
                  username={username}
                  updateUserRole={updateUserRole}
                />
              </Suspense>
            )}

            {selectedView === 'posts' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <PostsTab
                  posts={blogPosts}
                  onRefresh={fetchData}
                />
              </Suspense>
            )}

            {selectedView === 'analytics' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <VisitorAnalytics />
              </Suspense>
            )}

            {selectedView === 'users' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <UserManagement />
              </Suspense>
            )}

            {selectedView === 'seo' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <SEOUtilities />
              </Suspense>
            )}

            {selectedView === 'emails' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <ContactMessages />
              </Suspense>
            )}

            {selectedView === 'google' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <GoogleDataDashboard />
              </Suspense>
            )}

            {selectedView === 'database' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <DatabaseViewer />
              </Suspense>
            )}

            {selectedView === 'settings' && (
              <Suspense fallback={<LoadingSkeleton />}>
                <SettingsTab />
              </Suspense>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;