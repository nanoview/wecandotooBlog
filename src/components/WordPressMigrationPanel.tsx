import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import WordPressMigration from '@/utils/wpMigration';

interface MigrationResult {
  success: number;
  failed: number;
  errors: string[];
}

const WordPressMigrationPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [wpSiteUrl, setWpSiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<MigrationResult | null>(null);

  const testWordPressConnection = async () => {
    setIsTesting(true);
    try {
      const testUrl = `${wpSiteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts?per_page=1`;
      console.log('Testing WordPress connection to:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors' // Explicitly set CORS mode
      });
      
      console.log('WordPress response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('WordPress error response body:', errorText);
        throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('WordPress data received:', data);
      
      toast({
        title: "WordPress Connection Successful ✅",
        description: `Found ${data.length} post(s). Ready for migration!`,
      });
      
    } catch (error: any) {
      console.error('WordPress connection test failed:', error);
      toast({
        title: "WordPress Connection Failed ❌",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const startMigration = async () => {
    if (!wpSiteUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter your WordPress site URL",
        variant: "destructive"
      });
      return;
    }

    if (!validateUrl(wpSiteUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid URL (including http:// or https://)",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to migrate content",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setResult(null);

    try {
      // First, let's check user authentication and role
      setCurrentStep('Verifying user permissions...');
      setProgress(5);
      
      console.log('Current user:', user);
      
      if (!user?.id) {
        throw new Error('❌ Authentication required. Please log in first.');
      }

      // Check if user has admin or editor role
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      console.log('User role data:', { userRole, roleError });
      
      if (roleError) {
        console.error('Role check error:', roleError);
        throw new Error(`❌ Could not verify user permissions: ${roleError.message}`);
      }
      
      if (!userRole || (userRole.role !== 'admin' && userRole.role !== 'editor')) {
        throw new Error('❌ Insufficient permissions. Only admin or editor users can migrate content.');
      }
      
      console.log('✅ User permissions verified:', userRole.role);

      setCurrentStep('Initializing migration...');
      setProgress(10);

      const migration = new WordPressMigration(wpSiteUrl, user.id);
      
      setCurrentStep('Connecting to WordPress site...');
      setProgress(20);

      // Test connection first with detailed logging
      try {
        const testUrl = `${wpSiteUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts?per_page=1`;
        console.log('Testing WordPress URL:', testUrl);
        
        const response = await fetch(testUrl);
        console.log('WordPress response status:', response.status, response.statusText);
        console.log('WordPress response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('WordPress error response:', errorText);
          throw new Error(`WordPress API returned ${response.status}: ${response.statusText}. Response: ${errorText.substring(0, 200)}`);
        }
        
        const testData = await response.json();
        console.log('WordPress test data:', testData);
        console.log('✅ WordPress connection successful');
        
      } catch (error: any) {
        console.error('WordPress connection failed:', error);
        throw new Error(`Cannot connect to WordPress site: ${error.message}`);
      }

      // Test database connection
      setCurrentStep('Testing database connection...');
      setProgress(30);
      
      try {
        const { data, error: dbError } = await supabase.from('blog_posts').select('id').limit(1);
        console.log('Database test result:', { data, error: dbError });
        
        if (dbError) {
          console.error('Database error details:', dbError);
          if (dbError.code === '42P01') {
            throw new Error('❌ Blog posts table not found. Please run the database setup script first.');
          } else if (dbError.code === 'PGRST116') {
            throw new Error('❌ Database table exists but no access permissions. Please check RLS policies.');
          } else {
            throw new Error(`❌ Database error: ${dbError.message} (Code: ${dbError.code})`);
          }
        }
        
        console.log('✅ Database connection successful');
      } catch (error: any) {
        console.error('Database connection test failed:', error);
        if (error.message.includes('❌')) {
          throw error; // Re-throw our custom errors
        }
        throw new Error(`❌ Database connection failed: ${error.message}`);
      }

      setCurrentStep('Starting content migration...');
      setProgress(40);

      const migrationResult = await migration.migrateAllPosts();
      
      setProgress(100);
      setCurrentStep('Migration completed!');
      
      setResult({
        success: migrationResult.success,
        failed: migrationResult.failed,
        errors: []
      });

      toast({
        title: "Migration Completed",
        description: `Successfully migrated ${migrationResult.success} posts!`,
      });

    } catch (error: any) {
      console.error('Migration error:', error);
      setResult({
        success: 0,
        failed: 0,
        errors: [error.message || 'Unknown error occurred']
      });
      
      toast({
        title: "Migration Failed",
        description: error.message || 'An error occurred during migration',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          WordPress Content Migration
        </CardTitle>
        <CardDescription>
          Import all your posts from your WordPress site to this blog platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="wp-url">WordPress Site URL</Label>
          <Input
            id="wp-url"
            type="url"
            placeholder="https://yoursite.com"
            value={wpSiteUrl}
            onChange={(e) => setWpSiteUrl(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Enter the full URL of your WordPress site (e.g., https://yoursite.com)
          </p>
        </div>

        {/* Migration Progress */}
        {isLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">{currentStep}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {result.success > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Successfully migrated {result.success} posts!
                </AlertDescription>
              </Alert>
            )}
            
            {result.failed > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to migrate {result.failed} posts.
                </AlertDescription>
              </Alert>
            )}

            {result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Errors encountered:</p>
                    {result.errors.map((error, index) => (
                      <p key={index} className="text-sm">• {error}</p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Requirements Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Requirements:</p>
              <ul className="text-sm space-y-1">
                <li>• Your WordPress site must have the REST API enabled (default in WP 4.7+)</li>
                <li>• Your posts should be publicly accessible</li>
                <li>• The migration will import published posts only</li>
                <li>• Images will be linked from your original WordPress site</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Test WordPress Connection Button */}
          <Button 
            onClick={testWordPressConnection} 
            disabled={isTesting || isLoading || !wpSiteUrl.trim()}
            variant="outline"
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing WordPress...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Test WordPress Connection
              </>
            )}
          </Button>

          {/* Migration Button */}
          <Button 
            onClick={startMigration} 
            disabled={isLoading || isTesting || !wpSiteUrl.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Start Migration
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordPressMigrationPanel;
