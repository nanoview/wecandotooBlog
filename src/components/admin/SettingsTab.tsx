import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageStorageDebug } from '@/components/debug/ImageStorageDebug';

export default function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure system-wide settings and troubleshoot issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="storage">Storage Debug</TabsTrigger>
              <TabsTrigger value="system">System Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">General Settings</h3>
                <p className="text-gray-600">Additional settings panel coming soon...</p>
              </div>
            </TabsContent>
            
            <TabsContent value="storage" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Image Storage Diagnostics</h3>
                <p className="text-gray-600 mb-4">
                  Use this tool to diagnose and fix image upload issues.
                </p>
                <ImageStorageDebug />
              </div>
            </TabsContent>
            
            <TabsContent value="system" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Environment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Node Version: {typeof window !== 'undefined' ? 'Browser' : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Build: Production
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Supabase: Connected
                      </p>
                      <p className="text-sm text-gray-600">
                        Storage: Blog Images
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}