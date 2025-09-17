import React, { useState, useEffect } from 'react';
import { User, Shield, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const RoleManager: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check current user role
  const checkCurrentRole = async () => {
    if (!user) {
      setCheckingRole(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_user_role');
      
      if (error) {
        console.error('Error checking role:', error);
        setCurrentRole(null);
      } else {
        setCurrentRole(data?.[0]?.role || 'user');
      }
    } catch (error) {
      console.error('Error checking role:', error);
      setCurrentRole(null);
    } finally {
      setCheckingRole(false);
    }
  };

  useEffect(() => {
    checkCurrentRole();
    loadAllUsers();
  }, [user]);

  // Load all users with roles for debugging
  const loadAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          created_at,
          profiles!inner(username)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
      } else {
        setAllUsers(data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Grant admin role to user by email
  const grantAdminRole = async () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // First check if user exists
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (userError || !userData) {
        toast({
          title: "User Not Found",
          description: "No user found with that email address.",
          variant: "destructive"
        });
        return;
      }

      // Grant admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userData.id,
          role: 'admin'
        }, {
          onConflict: 'user_id'
        });

      if (roleError) {
        throw roleError;
      }

      toast({
        title: "Success",
        description: `Admin role granted to ${email}`,
      });

      setEmail('');
      
      // Refresh current role if it's the same user
      if (user?.email?.toLowerCase() === email.trim().toLowerCase()) {
        await checkCurrentRole();
      }

    } catch (error: any) {
      console.error('Error granting admin role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to grant admin role.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Grant yourself admin role
  const grantSelfAdmin = async () => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "Please log in to grant yourself admin access.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // First ensure profile exists
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          username: user.email?.split('@')[0] || 'user'
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.warn('Profile creation warning:', profileError);
        // Continue even if profile creation fails
      }

      // Grant admin role
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'admin'
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Admin role granted to your account! Profile created if needed.",
      });

      await checkCurrentRole();

    } catch (error: any) {
      console.error('Error granting self admin role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to grant admin role.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Please log in to manage roles.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Role Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Role Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Current Status</h3>
            {checkingRole ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking role...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Email: {user.email}</span>
                <span className="ml-4">Role: <strong>{currentRole || 'user'}</strong></span>
              </div>
            )}
          </div>

          {/* Self Admin Grant */}
          {currentRole !== 'admin' && (
            <div className="space-y-3">
              <h3 className="font-medium">Grant Yourself Admin Access</h3>
              <p className="text-sm text-gray-600">
                If you're the owner of this blog, click below to grant yourself admin access.
              </p>
              <Button
                onClick={grantSelfAdmin}
                disabled={loading}
                className="w-full"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                {loading ? 'Granting...' : 'Grant Me Admin Access'}
              </Button>
            </div>
          )}

          {/* Grant Admin to Others (only if current user is admin) */}
          {currentRole === 'admin' && (
            <div className="space-y-3">
              <h3 className="font-medium">Grant Admin Access to Others</h3>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && grantAdminRole()}
                />
                <Button
                  onClick={grantAdminRole}
                  disabled={loading || !email.trim()}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Grant Admin
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to Fix Write Access</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Make sure you're logged in</li>
              <li>2. Click "Grant Me Admin Access" if you're the blog owner</li>
              <li>3. Try accessing /write again</li>
              <li>4. If issues persist, run the SQL script in Supabase</li>
            </ol>
          </div>

          {/* Current Users with Roles */}
          <div className="space-y-3">
            <h3 className="font-medium">Current Users with Roles</h3>
            {loadingUsers ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading users...</span>
              </div>
            ) : allUsers.length === 0 ? (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800">No users with roles found. This might be why you can't access /write.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allUsers.map((userRole, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{userRole.profiles?.username || 'Unknown'}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        (ID: {userRole.user_id.substring(0, 8)}...)
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      userRole.role === 'admin' ? 'bg-red-100 text-red-800' :
                      userRole.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {userRole.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManager;
