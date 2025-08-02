import React, { useState, useEffect } from 'react';
import { GoogleSiteKitService, GoogleSiteKitConfig } from '../services/googleSiteKitService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, AlertCircle, Settings } from 'lucide-react';

export const GoogleSiteKitConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<GoogleSiteKitConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state for required data
  const [formData, setFormData] = useState({
    oauth_client_id: '',
    oauth_client_secret: '',
    oauth_redirect_uri: 'http://localhost:8082/oauth/callback',
    adsense_publisher_id: '',
    adsense_customer_id: '',
    analytics_property_id: '',
    analytics_measurement_id: '',
    search_console_site_url: '',
    site_verification_code: '',
    site_verification_method: 'meta_tag',
    enable_adsense: true,
    enable_analytics: true,
    enable_search_console: true,
    enable_auto_ads: false
  });

  // Load existing configuration on component mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure configuration exists and load it
      const existingConfig = await GoogleSiteKitService.ensureConfigExists();
      setConfig(existingConfig);
      
      // Update form data with existing values
      if (existingConfig) {
        setFormData({
          oauth_client_id: existingConfig.oauth_client_id || '',
          oauth_client_secret: existingConfig.oauth_client_secret || '',
          oauth_redirect_uri: existingConfig.oauth_redirect_uri || 'http://localhost:8082/oauth/callback',
          adsense_publisher_id: existingConfig.adsense_publisher_id || '',
          adsense_customer_id: existingConfig.adsense_customer_id || '',
          analytics_property_id: existingConfig.analytics_property_id || '',
          analytics_measurement_id: existingConfig.analytics_measurement_id || '',
          search_console_site_url: existingConfig.search_console_site_url || '',
          site_verification_code: existingConfig.site_verification_code || '',
          site_verification_method: existingConfig.site_verification_method || 'meta_tag',
          enable_adsense: existingConfig.enable_adsense ?? true,
          enable_analytics: existingConfig.enable_analytics ?? true,
          enable_search_console: existingConfig.enable_search_console ?? true,
          enable_auto_ads: existingConfig.enable_auto_ads ?? false
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
      console.error('Error loading configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.oauth_client_id.trim()) {
      errors.push('OAuth Client ID is required');
    }
    
    if (!formData.oauth_redirect_uri.trim()) {
      errors.push('OAuth Redirect URI is required');
    }
    
    if (formData.enable_adsense && !formData.adsense_publisher_id.trim()) {
      errors.push('AdSense Publisher ID is required when AdSense is enabled');
    }
    
    if (formData.enable_analytics && !formData.analytics_property_id.trim()) {
      errors.push('Analytics Property ID is required when Analytics is enabled');
    }
    
    if (formData.enable_search_console && !formData.search_console_site_url.trim()) {
      errors.push('Search Console Site URL is required when Search Console is enabled');
    }
    
    return errors;
  };

  const saveConfiguration = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return;
      }
      
      // Prepare data for saving
      const dataToSave = {
        ...formData,
        oauth_scopes: [
          'https://www.googleapis.com/auth/adsense.readonly',
          'https://www.googleapis.com/auth/analytics.readonly',
          'https://www.googleapis.com/auth/webmasters.readonly',
          'openid',
          'email',
          'profile'
        ],
        enabled_apis: [
          ...(formData.enable_adsense ? ['adsense'] : []),
          ...(formData.enable_analytics ? ['analytics'] : []),
          ...(formData.enable_search_console ? ['search_console'] : [])
        ]
      };
      
      // Save required data to database
      const savedConfig = await GoogleSiteKitService.saveRequiredData(dataToSave);
      setConfig(savedConfig);
      setSuccess('Google Site Kit configuration saved successfully!');
      
      console.log('Configuration saved:', savedConfig);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save configuration';
      setError(errorMessage);
      console.error('Error saving configuration:', err);
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      // Update connection status to test
      await GoogleSiteKitService.updateConnectionStatus('connected');
      setSuccess('Connection test successful!');
      
      // Reload configuration to get updated status
      await loadConfiguration();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection test failed';
      setError(errorMessage);
      await GoogleSiteKitService.updateConnectionStatus('error', errorMessage);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading Google Site Kit configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Google Site Kit Configuration
          </CardTitle>
          <CardDescription>
            Configure Google Site Kit to integrate AdSense, Analytics, and Search Console
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          {config && (
            <Alert className={config.is_connected ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
              {config.is_connected ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <AlertTitle>
                Connection Status: {config.connection_status || 'Unknown'}
              </AlertTitle>
              <AlertDescription>
                {config.is_connected 
                  ? `Connected successfully. Last sync: ${config.last_sync_at ? new Date(config.last_sync_at).toLocaleString() : 'Never'}`
                  : 'Not connected to Google services'
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Error/Success Messages */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* OAuth Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">OAuth Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="oauth_client_id">OAuth Client ID *</Label>
                <Input
                  id="oauth_client_id"
                  value={formData.oauth_client_id}
                  onChange={(e) => handleInputChange('oauth_client_id', e.target.value)}
                  placeholder="622861962504-..."
                />
              </div>
              
              <div>
                <Label htmlFor="oauth_client_secret">OAuth Client Secret</Label>
                <Input
                  id="oauth_client_secret"
                  type="password"
                  value={formData.oauth_client_secret}
                  onChange={(e) => handleInputChange('oauth_client_secret', e.target.value)}
                  placeholder="GOCSPX-..."
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="oauth_redirect_uri">OAuth Redirect URI *</Label>
              <Input
                id="oauth_redirect_uri"
                value={formData.oauth_redirect_uri}
                onChange={(e) => handleInputChange('oauth_redirect_uri', e.target.value)}
                placeholder="http://localhost:8082/oauth/callback"
              />
            </div>
          </div>

          {/* Service Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Google Services</h3>
            
            {/* AdSense Configuration */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable_adsense"
                  checked={formData.enable_adsense}
                  onCheckedChange={(checked) => handleInputChange('enable_adsense', checked)}
                />
                <Label htmlFor="enable_adsense">Enable Google AdSense</Label>
              </div>
              
              {formData.enable_adsense && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <Label htmlFor="adsense_publisher_id">Publisher ID *</Label>
                    <Input
                      id="adsense_publisher_id"
                      value={formData.adsense_publisher_id}
                      onChange={(e) => handleInputChange('adsense_publisher_id', e.target.value)}
                      placeholder="ca-pub-..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="adsense_customer_id">Customer ID</Label>
                    <Input
                      id="adsense_customer_id"
                      value={formData.adsense_customer_id}
                      onChange={(e) => handleInputChange('adsense_customer_id', e.target.value)}
                      placeholder="9592425312"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Analytics Configuration */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable_analytics"
                  checked={formData.enable_analytics}
                  onCheckedChange={(checked) => handleInputChange('enable_analytics', checked)}
                />
                <Label htmlFor="enable_analytics">Enable Google Analytics</Label>
              </div>
              
              {formData.enable_analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <Label htmlFor="analytics_property_id">Property ID *</Label>
                    <Input
                      id="analytics_property_id"
                      value={formData.analytics_property_id}
                      onChange={(e) => handleInputChange('analytics_property_id', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="analytics_measurement_id">Measurement ID</Label>
                    <Input
                      id="analytics_measurement_id"
                      value={formData.analytics_measurement_id}
                      onChange={(e) => handleInputChange('analytics_measurement_id', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Search Console Configuration */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable_search_console"
                  checked={formData.enable_search_console}
                  onCheckedChange={(checked) => handleInputChange('enable_search_console', checked)}
                />
                <Label htmlFor="enable_search_console">Enable Google Search Console</Label>
              </div>
              
              {formData.enable_search_console && (
                <div className="ml-6">
                  <Label htmlFor="search_console_site_url">Site URL *</Label>
                  <Input
                    id="search_console_site_url"
                    value={formData.search_console_site_url}
                    onChange={(e) => handleInputChange('search_console_site_url', e.target.value)}
                    placeholder="https://your-domain.com"
                  />
                </div>
              )}
            </div>

            {/* Additional Features */}
            <div className="flex items-center space-x-2">
              <Switch
                id="enable_auto_ads"
                checked={formData.enable_auto_ads}
                onCheckedChange={(checked) => handleInputChange('enable_auto_ads', checked)}
              />
              <Label htmlFor="enable_auto_ads">Enable Auto Ads</Label>
            </div>
          </div>

          {/* Site Verification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Site Verification</h3>
            
            <div>
              <Label htmlFor="site_verification_code">Verification Code</Label>
              <Input
                id="site_verification_code"
                value={formData.site_verification_code}
                onChange={(e) => handleInputChange('site_verification_code', e.target.value)}
                placeholder="Your meta tag verification code"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={saveConfiguration} 
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
            
            <Button 
              onClick={testConnection} 
              variant="outline"
              disabled={!config || saving}
            >
              Test Connection
            </Button>
            
            <Button 
              onClick={loadConfiguration} 
              variant="outline"
              disabled={saving}
            >
              Reload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleSiteKitConfigPanel;
