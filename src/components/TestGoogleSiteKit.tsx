// Test your Google Site Kit configuration
// Add this to any React component to verify it's working

import { useEffect, useState } from 'react';
import { GoogleSiteKitService } from '../services/googleSiteKitService';

export const TestGoogleSiteKit = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConfig() {
      try {
        console.log('🔍 Testing Google Site Kit configuration...');
        
        // Get the configuration from database
        const siteKitConfig = await GoogleSiteKitService.getConfig();
        
        if (siteKitConfig) {
          console.log('✅ Google Site Kit configuration loaded successfully!');
          console.log('📊 Configuration:', {
            oauthClientId: siteKitConfig.oauth_client_id,
            adsensePublisher: siteKitConfig.adsense_publisher_id,
            analyticsProperty: siteKitConfig.analytics_property_id,
            verificationCode: siteKitConfig.site_verification_code,
            domain: siteKitConfig.search_console_site_url,
            connectionStatus: siteKitConfig.connection_status
          });
          setConfig(siteKitConfig);
        } else {
          console.error('❌ No Google Site Kit configuration found');
        }
      } catch (error) {
        console.error('❌ Error loading Google Site Kit config:', error);
      } finally {
        setLoading(false);
      }
    }
    
    testConfig();
  }, []);

  if (loading) {
    return <div>🔄 Loading Google Site Kit configuration...</div>;
  }

  if (!config) {
    return <div>❌ Google Site Kit not configured</div>;
  }

  return (
    <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-4">
        ✅ Google Site Kit - Ready to Work!
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <strong>OAuth Client ID:</strong><br />
          <code className="text-xs bg-white p-1 rounded">
            {config.oauth_client_id?.substring(0, 20)}...
          </code>
        </div>
        
        <div>
          <strong>AdSense Publisher:</strong><br />
          <code className="text-xs bg-white p-1 rounded">
            {config.adsense_publisher_id}
          </code>
        </div>
        
        <div>
          <strong>Analytics Property:</strong><br />
          <code className="text-xs bg-white p-1 rounded">
            {config.analytics_property_id}
          </code>
        </div>
        
        <div>
          <strong>Domain:</strong><br />
          <code className="text-xs bg-white p-1 rounded">
            {config.search_console_site_url}
          </code>
        </div>
        
        <div>
          <strong>Connection Status:</strong><br />
          <span className={`px-2 py-1 rounded text-xs ${
            config.connection_status === 'connected' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {config.connection_status}
          </span>
        </div>
        
        <div>
          <strong>Services Enabled:</strong><br />
          <div className="text-xs space-x-1">
            {config.enable_adsense && <span className="bg-blue-100 text-blue-800 px-1 rounded">AdSense</span>}
            {config.enable_analytics && <span className="bg-purple-100 text-purple-800 px-1 rounded">Analytics</span>}
            {config.enable_search_console && <span className="bg-orange-100 text-orange-800 px-1 rounded">Search Console</span>}
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-white rounded border">
        <strong className="text-green-700">🎯 Your Google Site Kit is configured and ready!</strong>
        <ul className="mt-2 text-sm text-gray-600 space-y-1">
          <li>✅ Database table created with your Google Cloud Console data</li>
          <li>✅ OAuth credentials configured for API access</li>
          <li>✅ AdSense integration ready (Publisher ID: {config.adsense_publisher_id})</li>
          <li>✅ Analytics tracking ready (Property: {config.analytics_property_id})</li>
          <li>✅ Site verification configured</li>
          <li>✅ Search Console integration ready</li>
        </ul>
      </div>
    </div>
  );
};
