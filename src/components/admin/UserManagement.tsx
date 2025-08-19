import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Shield, User, UserX, RefreshCw, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  username: string;
  full_name: string;
  avatar_url: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  profiles: Profile[];
}

interface OrphanedRole {
  id: string;
  user_id: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [orphanedRoles, setOrphanedRoles] = useState<OrphanedRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          profiles!inner (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('role', { ascending: false });

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast.error('Failed to fetch user roles');
    }
  };

  const fetchOrphanedRoles = async () => {
    try {
      const { data, error } = await supabase.rpc('find_orphaned_user_roles');
      if (error) throw error;
      setOrphanedRoles(data || []);
    } catch (error) {
      console.error('Error fetching orphaned roles:', error);
      // If the function doesn't exist, we'll check manually
      const { data: allRoles } = await supabase
        .from('user_roles')
        .select('id, user_id, role');
      
      if (allRoles) {
        const orphaned = [];
        for (const role of allRoles) {
          const { data: userExists } = await supabase.auth.admin.getUserById(role.user_id);
          if (!userExists.user) {
            orphaned.push(role);
          }
        }
        setOrphanedRoles(orphaned);
      }
    }
  };

  const cleanupOrphanedRoles = async () => {
    try {
      setRefreshing(true);
      
      // Try to use the cleanup function first
      const { error: rpcError } = await supabase.rpc('cleanup_orphaned_user_roles');
      
      if (rpcError) {
        // Manual cleanup if function doesn't exist
        for (const orphan of orphanedRoles) {
          await supabase
            .from('user_roles')
            .delete()
            .eq('id', orphan.id);
        }
      }
      
      toast.success(`Cleaned up ${orphanedRoles.length} orphaned roles`);
      await fetchData();
    } catch (error) {
      console.error('Error cleaning up orphaned roles:', error);
      toast.error('Failed to cleanup orphaned roles');
    } finally {
      setRefreshing(false);
    }
  };

  const removeUserRole = async (roleId: string, userId: string, username?: string) => {
    if (!confirm(`Are you sure you want to remove the role for user ${username || userId}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
      
      toast.success('User role removed successfully');
      await fetchData();
    } catch (error) {
      console.error('Error removing user role:', error);
      toast.error('Failed to remove user role');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUserRoles(), fetchOrphanedRoles()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'editor':
        return 'default';
      case 'user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Alert for Orphaned Roles */}
      {orphanedRoles.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Security Alert: Orphaned User Roles Detected
            </CardTitle>
            <CardDescription className="text-red-600">
              Found {orphanedRoles.length} role(s) for users that no longer exist. This could be a security risk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium mb-2">Orphaned Roles:</h4>
                <ul className="space-y-1 text-sm">
                  {orphanedRoles.map((orphan) => (
                    <li key={orphan.id} className="flex items-center gap-2">
                      <UserX className="w-4 h-4 text-red-500" />
                      User ID: {orphan.user_id} - Role: {orphan.role}
                    </li>
                  ))}
                </ul>
              </div>
              <Button 
                onClick={cleanupOrphanedRoles}
                disabled={refreshing}
                variant="destructive"
                className="w-full"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Cleaning up...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Clean Up Orphaned Roles
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current User Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            User Role Management
          </CardTitle>
          <CardDescription>
            Manage user roles and permissions. Be careful when removing admin roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Total Users: {userRoles.length}
              </div>
              <Button 
                onClick={fetchData} 
                variant="outline" 
                size="sm"
                disabled={refreshing}
              >
                {refreshing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </Button>
            </div>

            {userRoles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No user roles found
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userRoles.map((userRole) => (
                      <TableRow key={userRole.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <div>
                              <div className="font-medium">
                                {userRole.profiles?.[0]?.full_name || userRole.profiles?.[0]?.username || 'Unknown User'}
                              </div>
                              {userRole.profiles?.[0]?.username && (
                                <div className="text-sm text-gray-500">
                                  @{userRole.profiles[0].username}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {userRole.user_id}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(userRole.role)}>
                            {userRole.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => removeUserRole(
                              userRole.id, 
                              userRole.user_id, 
                              userRole.profiles?.[0]?.username
                            )}
                            variant="destructive"
                            size="sm"
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks for user management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => window.open('/admin', '_blank')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
            >
              <Database className="w-5 h-5 mb-2" />
              <div className="text-left">
                <div className="font-medium">Run Cleanup Scripts</div>
                <div className="text-sm text-gray-500">Execute user removal and security scripts</div>
              </div>
            </Button>
            
            <Button 
              onClick={fetchData}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
            >
              <RefreshCw className="w-5 h-5 mb-2" />
              <div className="text-left">
                <div className="font-medium">Security Audit</div>
                <div className="text-sm text-gray-500">Check for security vulnerabilities</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
