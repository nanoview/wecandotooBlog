import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ImageStorageDebug = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
  };

  const runDiagnostics = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      addResult('🔍 Starting image storage diagnostics...');

      // Test 1: Check Supabase connection
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          addResult(`❌ Auth check failed: ${error.message}`);
        } else {
          addResult(`✅ Supabase connection OK`);
          addResult(`📝 User authenticated: ${data.session ? 'Yes' : 'No'}`);
        }
      } catch (error) {
        addResult(`❌ Supabase connection failed: ${error}`);
      }

      // Test 2: Check if bucket exists
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (error) {
          addResult(`❌ Cannot list buckets: ${error.message}`);
        } else {
          const blogImagesBucket = buckets.find(b => b.id === 'blog-images');
          if (blogImagesBucket) {
            addResult(`✅ blog-images bucket found`);
            addResult(`📝 Bucket public: ${blogImagesBucket.public ? 'Yes' : 'No'}`);
            addResult(`📝 Bucket name: ${blogImagesBucket.name}`);
          } else {
            addResult(`❌ blog-images bucket NOT found`);
            addResult(`📝 Available buckets: ${buckets.map(b => b.id).join(', ') || 'None'}`);
          }
        }
      } catch (error) {
        addResult(`❌ Bucket check failed: ${error}`);
      }

      // Test 3: Try to access the bucket
      try {
        const { data, error } = await supabase.storage
          .from('blog-images')
          .list('', { limit: 1 });
        
        if (error) {
          addResult(`❌ Cannot access blog-images bucket: ${error.message}`);
        } else {
          addResult(`✅ Can access blog-images bucket`);
          addResult(`📝 Files in root: ${data.length}`);
        }
      } catch (error) {
        addResult(`❌ Bucket access test failed: ${error}`);
      }

      // Test 4: Test upload permissions (with a tiny test file)
      try {
        const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const { data, error } = await supabase.storage
          .from('blog-images')
          .upload(`test/debug-${Date.now()}.txt`, testFile);
        
        if (error) {
          addResult(`❌ Upload test failed: ${error.message}`);
        } else {
          addResult(`✅ Upload permissions OK`);
          // Clean up test file
          await supabase.storage
            .from('blog-images')
            .remove([data.path]);
          addResult(`🧹 Test file cleaned up`);
        }
      } catch (error) {
        addResult(`❌ Upload test failed: ${error}`);
      }

      addResult('🏁 Diagnostics complete!');

    } catch (error) {
      addResult(`💥 Diagnostic failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsLoading(true);
      addResult(`🖼️ Testing image upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      try {
        const fileName = `test-${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('blog-images')
          .upload(`posts/${fileName}`, file);

        if (error) {
          addResult(`❌ Image upload failed: ${error.message}`);
        } else {
          addResult(`✅ Image uploaded successfully!`);
          addResult(`📝 Path: ${data.path}`);
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('blog-images')
            .getPublicUrl(data.path);
          
          addResult(`🔗 Public URL: ${urlData.publicUrl}`);
        }
      } catch (error) {
        addResult(`💥 Upload error: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };
    input.click();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Image Storage Debug Tool
        </CardTitle>
        <CardDescription>
          Use this tool to diagnose image storage issues and test uploads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={isLoading}
            className="gap-2"
          >
            <Info className="h-4 w-4" />
            {isLoading ? 'Running Diagnostics...' : 'Run Diagnostics'}
          </Button>
          <Button 
            onClick={testImageUpload} 
            disabled={isLoading}
            variant="outline"
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Test Image Upload
          </Button>
        </div>

        {testResults.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <strong>Diagnostic Results:</strong>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono max-h-60 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="mb-1">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Quick Fix Steps:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Run diagnostics to see what's wrong</li>
              <li>If bucket is missing, run the ENHANCED_IMAGE_STORAGE_SETUP.sql</li>
              <li>If permissions are wrong, check your admin role in Supabase</li>
              <li>Test image upload to verify it's working</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
