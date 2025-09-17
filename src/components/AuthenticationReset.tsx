import React, { useState } from 'react';
import { Trash2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthenticationReset: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const steps = [
    "Signing out from Supabase",
    "Clearing localStorage", 
    "Clearing sessionStorage",
    "Clearing cookies",
    "Clearing IndexedDB",
    "Forcing page reload"
  ];

  const performCompleteSignOut = async () => {
    setLoading(true);
    
    try {
      // Step 1: Sign out from Supabase
      setStep(0);
      await supabase.auth.signOut();
      
      // Step 2: Clear localStorage
      setStep(1);
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('token')) {
          localStorage.removeItem(key);
        }
      });
      
      // Step 3: Clear sessionStorage
      setStep(2);
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('token')) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Step 4: Clear cookies
      setStep(3);
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Step 5: Clear IndexedDB
      setStep(4);
      if ('indexedDB' in window) {
        try {
          const databases = await indexedDB.databases();
          databases.forEach(db => {
            if (db.name && (db.name.includes('supabase') || db.name.includes('auth'))) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        } catch (err) {
          console.warn('IndexedDB cleanup failed:', err);
        }
      }
      
      // Step 6: Force reload
      setStep(5);
      
      toast({
        title: "Authentication Reset Complete",
        description: "All authentication data cleared. Page will reload in 2 seconds.",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error during auth reset:', error);
      toast({
        title: "Reset Error",
        description: error.message || "Failed to reset authentication",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const performNuclearReset = () => {
    // Nuclear option - clear everything
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    toast({
      title: "Nuclear Reset Complete",
      description: "All browser storage cleared. Reloading...",
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-6 w-6" />
          Authentication Reset Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Current Authentication Status</h3>
          <div className="text-sm space-y-1">
            <div>User: {user ? user.email : 'Not logged in'}</div>
            <div>User ID: {user ? user.id : 'None'}</div>
            <div>Session: {user ? 'Active' : 'None'}</div>
          </div>
        </div>

        {/* Step-by-step reset */}
        <div className="space-y-4">
          <h3 className="font-medium">Step-by-Step Authentication Reset</h3>
          
          {loading && (
            <div className="space-y-2">
              {steps.map((stepName, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {index < step ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : index === step ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={index <= step ? 'text-gray-900' : 'text-gray-500'}>
                    {stepName}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <Button
            onClick={performCompleteSignOut}
            disabled={loading}
            className="w-full"
            variant="destructive"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {loading ? 'Resetting...' : 'Complete Authentication Reset'}
          </Button>
        </div>

        {/* Nuclear option */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-red-600 mb-2">Nuclear Option</h3>
          <p className="text-sm text-gray-600 mb-3">
            If the above doesn't work, this will clear ALL browser data for this site.
          </p>
          <Button
            onClick={performNuclearReset}
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Browser Data
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">If You Still Can't Reset:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Run the database cleanup SQL script</li>
            <li>2. Check browser developer tools for cached data</li>
            <li>3. Try a different browser or incognito mode</li>
            <li>4. Clear browser cache manually (Ctrl+Shift+Delete)</li>
            <li>5. Check if RLS policies are blocking user deletion</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthenticationReset;
