import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, MessageSquare, Shield, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function OverviewTab({ blogPosts, profiles, comments, userRole, username, updateUserRole }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogPosts.length}</div>
            <p className="text-xs text-muted-foreground">
              {blogPosts.filter(p => p.status === 'published').length} published
            </p>
          </CardContent>
        </Card>
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
      {/* User Management */}
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
                    <Badge variant={profile.user_roles[0]?.role === 'admin' ? 'default' : profile.user_roles[0]?.role === 'editor' ? 'secondary' : 'outline'}>
                      {profile.user_roles[0]?.role || 'user'}
                    </Badge>
                    {profile.user_id !== username && (
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
    </div>
  );
}