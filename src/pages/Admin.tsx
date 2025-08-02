import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Shield, Settings, ArrowLeft, LogOut, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WordPressMigrationPanel from '@/components/WordPressMigrationPanel';
import WordPressSiteKitIntegration from '@/components/WordPressSiteKitIntegration';
import { SupabaseGoogleDashboard } from '@/components/SupabaseGoogleDashboard';

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

const Admin = () => {
  const { user, userRole, username, loading, refreshUserData, isNanopro, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="google" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Google Setup
            </TabsTrigger>
            <TabsTrigger value="migration" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Migration
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profiles.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{comments.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Editors</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profiles.filter(p => p.user_roles[0]?.role === 'editor').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Management - only visible to admin users */}
          {userRole === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{profile.display_name}</p>
                        <p className="text-sm text-muted-foreground">@{profile.username}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(profile.user_roles[0]?.role || 'user')}>
                          {profile.user_roles[0]?.role || 'user'}
                        </Badge>
                        {profile.user_id !== user?.id && (
                          <div className="flex gap-2">
                            {profile.user_roles[0]?.role !== 'admin' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserRole(profile.user_id, 'admin')}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                              >
                                Make Admin
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserRole(profile.user_id, 'editor')}
                              disabled={profile.user_roles[0]?.role === 'editor'}
                              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
                            >
                              ✨ Promote to Editor
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserRole(profile.user_id, 'user')}
                              disabled={profile.user_roles[0]?.role === 'user'}
                            >
                              Make User
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments Management
              </CardTitle>
              <CardDescription>
                Monitor and manage user comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {comment.profiles?.display_name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Post {comment.blog_post_id}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteComment(comment.id)}
                      >
                        Delete
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No comments yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* WordPress Migration Panel - only visible to admin users */}
        {userRole === 'admin' && (
          <div className="mt-8">
            <WordPressMigrationPanel />
          </div>
        )}
      </TabsContent>

      <TabsContent value="dashboard" className="space-y-6">
        <SupabaseGoogleDashboard />
      </TabsContent>

      <TabsContent value="google" className="space-y-6">
        <WordPressSiteKitIntegration />
        {/* Google Site Kit setup and configuration */}
      </TabsContent>

      <TabsContent value="migration" className="space-y-6">
        {userRole === 'admin' ? (
          <WordPressMigrationPanel />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
              <p className="text-gray-600">Only administrators can access migration tools.</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure system-wide settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Additional settings panel coming soon...</p>
          </CardContent>
        </Card>
      </TabsContent>

    </Tabs>
      </div>
    </div>
  );
};

export default Admin;