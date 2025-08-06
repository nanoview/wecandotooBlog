import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Shield, Settings, ArrowLeft, LogOut, BarChart3, FileText, Edit, Trash2, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SupabaseGoogleDashboard } from '@/components/SupabaseGoogleDashboard';
import { BlogPost } from '@/types/blog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import OverviewTab from '@/components/admin/OverviewTab';
import PostsTab from '@/components/admin/PostsTab';
import DashboardTab from '@/components/admin/DashboardTab';
import SettingsTab from '@/components/admin/SettingsTab';

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

const Admin = () => {
  const { user, userRole, username, loading, refreshUserData, isNanopro, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPostAdmin[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || userRole !== 'admin')) {
      navigate('/');
      return;
    }

    // Only admin users can access admin panel
    if (user && userRole === 'admin') {
      fetchData();
    }
  }, [user, userRole, loading, navigate]);

  const fetchData = async () => {
    try {
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, username, display_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for each profile
      const profilesWithRoles = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .single();

          return {
            ...profile,
            user_roles: roleData ? [{ role: roleData.role }] : [{ role: 'user' }]
          };
        })
      );

      setProfiles(profilesWithRoles);

      // Fetch all comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('id, content, blog_post_id, created_at, user_id')
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Fetch profiles for each comment
      const commentsWithProfiles = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('user_id', comment.user_id)
            .single();

          return {
            ...comment,
            profiles: profile || { username: 'Unknown', display_name: 'Unknown User' }
          };
        })
      );

      setComments(commentsWithProfiles);

      // Fetch all blog posts with proper joins
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select(`
          id, title, slug, excerpt, content, category, featured_image,
          published_at, created_at, updated_at, status, author_id
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Fetch author profiles for each post
      const postsWithProfiles = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('user_id', post.author_id)
            .single();

          return {
            ...post,
            profiles: profile || { username: 'Unknown', display_name: 'Unknown Author' }
          };
        })
      );

      setBlogPosts(postsWithProfiles);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold">Admin Panel</h1>
              {isNanopro && (
                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  Super Admin
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Welcome, {username}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab
              blogPosts={blogPosts}
              profiles={profiles}
              comments={comments}
              userRole={userRole}
              username={username}
              updateUserRole={updateUserRole}
            />
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <PostsTab
              blogPosts={blogPosts}
              togglePostStatus={togglePostStatus}
              deleteBlogPost={deleteBlogPost}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Admin;