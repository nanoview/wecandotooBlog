import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Database, CheckCircle, XCircle, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityCheckResult {
  type: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  count?: number;
  details?: any[];
}

const SecurityAudit: React.FC = () => {
  const [results, setResults] = useState<SecurityCheckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sqlScript, setSqlScript] = useState('');

  const securityChecks = [
    {
      name: 'Check Orphaned User Roles',
      description: 'Find user roles where the user no longer exists',
      sql: `
SELECT 'Orphaned roles' as issue_type,
       ur.id as role_id,
       ur.user_id,
       ur.role,
       'User deleted but role remains' as problem
FROM public.user_roles ur
LEFT JOIN auth.users u ON ur.user_id = u.id
WHERE u.id IS NULL;`
    },
    {
      name: 'Check Shapnokhan Access',
      description: 'Verify if shapnokhan@yahoo.com still has any roles',
      sql: `
SELECT ur.id as role_id,
       ur.user_id,
       ur.role,
       u.email
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'shapnokhan@yahoo.com';`
    },
    {
      name: 'List All Admin Users',
      description: 'Show all users with admin privileges',
      sql: `
SELECT u.email,
       ur.role,
       ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at;`
    }
  ];

  const runSecurityAudit = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      const auditResults: SecurityCheckResult[] = [];
      
      // Check 1: Orphaned user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, user_id, role');

      if (rolesError) {
        auditResults.push({
          type: 'User Roles Check',
          status: 'error',
          message: `Failed to fetch user roles: ${rolesError.message}`
        });
      } else {
        // Check each role to see if user exists
        const orphanedRoles = [];
        for (const role of userRoles) {
          try {
            const { data: user, error: userError } = await supabase.auth.admin.getUserById(role.user_id);
            if (userError || !user.user) {
              orphanedRoles.push(role);
            }
          } catch (e) {
            // If we can't check (no admin access), assume it might be orphaned
            orphanedRoles.push(role);
          }
        }

        auditResults.push({
          type: 'Orphaned Roles Check',
          status: orphanedRoles.length > 0 ? 'error' : 'success',
          message: orphanedRoles.length > 0 
            ? `Found ${orphanedRoles.length} orphaned user roles that need cleanup`
            : 'No orphaned user roles found',
          count: orphanedRoles.length,
          details: orphanedRoles
        });
      }

      // Check 2: Total user roles count
      const { count: totalRoles, error: countError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        auditResults.push({
          type: 'Total User Roles',
          status: 'success',
          message: `Found ${totalRoles} total user roles in system`,
          count: totalRoles
        });
      }

      // Check 3: Admin roles count
      const { count: adminCount, error: adminError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (!adminError) {
        auditResults.push({
          type: 'Admin Roles Count',
          status: adminCount > 3 ? 'warning' : 'success',
          message: `Found ${adminCount} admin users${adminCount > 3 ? ' (consider if this many admins are needed)' : ''}`,
          count: adminCount
        });
      }

      setResults(auditResults);

    } catch (error) {
      console.error('Security audit failed:', error);
      toast.error('Security audit failed');
      setResults([{
        type: 'Audit Error',
        status: 'error',
        message: `Security audit failed: ${error.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const generateCleanupSQL = () => {
    const cleanupSQL = `
-- Emergency Security Cleanup Script
-- Run this in Supabase SQL Editor to fix security issues

-- Step 1: Check current status
SELECT 'Current status check' as step, COUNT(*) as total_user_roles
FROM public.user_roles;

-- Step 2: Remove orphaned user_roles (where user no longer exists)
DELETE FROM public.user_roles
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Step 3: Remove any shapnokhan@yahoo.com roles specifically
DELETE FROM public.user_roles ur
USING auth.users u
WHERE ur.user_id = u.id
AND u.email = 'shapnokhan@yahoo.com';

-- Step 4: Update user metadata to remove admin privileges
UPDATE auth.users
SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'user')
WHERE email = 'shapnokhan@yahoo.com';

-- Step 5: Final verification
SELECT 'Final verification' as step, 
       COUNT(*) as remaining_admin_roles
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'shapnokhan@yahoo.com';

-- Step 6: List all current admin users
SELECT 'Current admins' as step,
       u.email,
       ur.role,
       ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at;
`;
    
    setSqlScript(cleanupSQL);
    toast.success('Cleanup SQL script generated');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Alert */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Critical Security Issue Detected
          </CardTitle>
          <CardDescription className="text-red-600">
            User "shapnokhan@yahoo.com" may still have admin access despite being deleted. Run security audit immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={runSecurityAudit}
              disabled={loading}
              className="w-full"
              variant="destructive"
            >
              {loading ? 'Running Security Audit...' : 'Run Security Audit Now'}
            </Button>
            
            <Button 
              onClick={generateCleanupSQL}
              variant="outline"
              className="w-full"
            >
              <Database className="w-4 h-4 mr-2" />
              Generate Cleanup SQL Script
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Security Audit Results</CardTitle>
            <CardDescription>
              Review the security status of your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{result.type}</h4>
                      <Badge variant={
                        result.status === 'success' ? 'default' : 
                        result.status === 'warning' ? 'secondary' : 'destructive'
                      }>
                        {result.status}
                      </Badge>
                      {result.count !== undefined && (
                        <Badge variant="outline">{result.count}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.details && result.details.length > 0 && (
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                        <details>
                          <summary className="cursor-pointer font-medium">Show Details</summary>
                          <pre className="mt-2 whitespace-pre-wrap">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SQL Script Output */}
      {sqlScript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Emergency Cleanup SQL Script
              <Button 
                onClick={() => copyToClipboard(sqlScript)}
                variant="outline"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy SQL
              </Button>
            </CardTitle>
            <CardDescription>
              Copy this SQL and run it in your Supabase Dashboard → SQL Editor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm whitespace-pre-wrap">{sqlScript}</pre>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Instructions:</h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Go to your Supabase Dashboard</li>
                <li>2. Navigate to "SQL Editor"</li>
                <li>3. Copy and paste the SQL script above</li>
                <li>4. Execute each section one by one</li>
                <li>5. Verify the results after each step</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual SQL Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Manual SQL Checks</CardTitle>
          <CardDescription>
            Run these queries manually in Supabase SQL Editor for detailed investigation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityChecks.map((check, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{check.name}</h4>
                  <Button 
                    onClick={() => copyToClipboard(check.sql)}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-3">{check.description}</p>
                <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                  <pre>{check.sql}</pre>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityAudit;
