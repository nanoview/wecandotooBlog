import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  username: string | null;
  loading: boolean;
  isNanopro: boolean;
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to check if current user is nanopro
  const isNanopro = username === 'nanopro';

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user role and username
          setTimeout(async () => {
            try {
              const [{ data: roleData }, { data: profileData }] = await Promise.all([
                supabase
                  .from('user_roles')
                  .select('role')
                  .eq('user_id', session.user.id)
                  .maybeSingle(),
                supabase
                  .from('profiles')
                  .select('username')
                  .eq('user_id', session.user.id)
                  .maybeSingle(),
              ]);
              setUserRole(roleData?.role ?? 'user');
              setUsername(profileData?.username ?? null);
            } catch (error) {
              console.error('Error fetching user role or username:', error);
              setUserRole('user');
              setUsername(null);
            }
          }, 0);
        } else {
          setUserRole(null);
          setUsername(null);
        }
        setLoading(false);
      }
    );

    // Set up real-time subscription for user_roles changes
    let roleSubscription: any = null;
    
    const setupRoleSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        roleSubscription = supabase
          .channel('user_roles_changes')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'user_roles',
            filter: `user_id=eq.${session.user.id}`
          }, (payload) => {
            if (payload.new && 'role' in payload.new) {
              setUserRole(payload.new.role as string);
            }
          })
          .subscribe();
      }
    };

    setupRoleSubscription();

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          const [{ data: roleData }, { data: profileData }] = await Promise.all([
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .maybeSingle(),
            supabase
              .from('profiles')
              .select('username')
              .eq('user_id', session.user.id)
              .maybeSingle(),
          ]);
          setUserRole(roleData?.role ?? 'user');
          setUsername(profileData?.username ?? null);
        } catch {
          setUserRole('user');
          setUsername(null);
        }
      } else {
        setUserRole(null);
        setUsername(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (roleSubscription) {
        supabase.removeChannel(roleSubscription);
      }
    };
  }, []);

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
          display_name: displayName
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    
    return { error };
  };

  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const [{ data: roleData }, { data: profileData }] = await Promise.all([
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);
      setUserRole(roleData?.role ?? 'user');
      setUsername(profileData?.username ?? null);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userRole,
      username,
      loading,
      isNanopro,
      signUp,
      signIn,
      signOut,
      resetPassword,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};