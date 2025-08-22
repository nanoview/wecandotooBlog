import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Shield, Settings, LogOut, BarChart3, FileText, Edit, Trash2, Plus, Eye, Mail, Search, Database, Activity } from 'lucide-react';
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
            published_at, created_at, updated_at, status, author_id,
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
        <Tabs defaultValue="overview" className="space-y-6">
          {/* Mobile-friendly tab list with responsive layout */}
          <div className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-10 gap-1 h-auto p-1">
              <TabsTrigger value="overview" className="flex-col sm:flex-row h-auto py-2 px-2 text-xs sm:text-sm">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-2" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Home</span>
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex-col sm:flex-row h-auto py-2 px-2 text-xs sm:text-sm">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-2" />
                <span className="hidden sm:inline">Blog Posts</span>
                <span className="sm:hidden">Posts</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex-col sm:flex-row h-auto py-2 px-2 text-xs sm:text-sm">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-2" />
                <span className="hidden sm:inline">Visitor Analytics</span>
                <span className="sm:hidden">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex-col sm:flex-row h-auto py-2 px-2 text-xs sm:text-sm">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-2" />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex-col sm:flex-row h-auto py-2 px-2 text-xs sm:text-sm">
                <Search className="w-3 h-3 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-2" />
                <span>SEO</span>
              </TabsTrigger>
              <TabsTrigger value="emails" className="flex-col sm:flex-row h-auto py-2 px-2 text-xs sm:text-sm">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-2" />
                <span>Emails</span>
              </TabsTrigger>
              <TabsTrigger value="google" className="flex-col sm:flex-row h-auto py-2 px-2 text-xs sm:text-sm">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-2" />
                <span className="hidden sm:inline">Google APIs</span>
                <span className="sm:hidden">Google</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex-col sm:flex-row h-auto py-2 px-2 text-xs sm:text-sm">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard (Demo)</span>
                <span className="sm:hidden">Demo</span>
              </TabsTrigger>
              <TabsTrigger value="database" className="flex-col sm:flex-row h-auto py-2 px-2 text-xs sm:text-sm">
                <Database className="w-3 h-3 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-2" />
                <span className="hidden sm:inline">Database</span>
                <span className="sm:hidden">DB</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-col sm:flex-row h-auto py-2 px-2 text-xs sm:text-sm">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 mb-1 sm:mb-0 sm:mr-2" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <PostsTab
                blogPosts={blogPosts}
                togglePostStatus={togglePostStatus}
                deleteBlogPost={deleteBlogPost}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <VisitorAnalytics />
            </Suspense>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <UserManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <SEOUtilities />
            </Suspense>
          </TabsContent>

          <TabsContent value="emails" className="space-y-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <ZohoMailChecker />
            </Suspense>
          </TabsContent>

          <TabsContent value="google" className="space-y-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <GoogleDataDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <DashboardTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <DatabaseViewer />
            </Suspense>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <SettingsTab />
            </Suspense>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Admin;