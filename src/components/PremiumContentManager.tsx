import React, { useState, useEffect } from 'react';
import { Crown, DollarSign, Eye, Lock, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PremiumContentManagerProps {
  blogPostId: string;
  blogPostTitle: string;
  blogPostContent: string;
  onUpdate?: () => void;
}

interface PremiumContentData {
  id?: string;
  is_premium: boolean;
  preview_content: string;
  price_cents: number;
  currency: string;
}

const PremiumContentManager: React.FC<PremiumContentManagerProps> = ({
  blogPostId,
  blogPostTitle,
  blogPostContent,
  onUpdate
}) => {
  const [premiumData, setPremiumData] = useState<PremiumContentData>({
    is_premium: false,
    preview_content: '',
    price_cents: 500, // 5 euros
    currency: 'EUR'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load existing premium content data
  const loadPremiumData = async () => {
    try {
      const { data, error } = await supabase
        .from('premium_content')
        .select('*')
        .eq('blog_post_id', blogPostId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error loading premium data:', error);
        return;
      }

      if (data) {
        setPremiumData({
          id: data.id,
          is_premium: data.is_premium,
          preview_content: data.preview_content || '',
          price_cents: data.price_cents || 500,
          currency: data.currency || 'EUR'
        });
      } else {
        // Generate default preview from blog content
        const defaultPreview = blogPostContent
          .replace(/<[^>]*>/g, '') // Strip HTML tags
          .substring(0, 200) + '...';
        
        setPremiumData(prev => ({
          ...prev,
          preview_content: defaultPreview
        }));
      }
    } catch (error) {
      console.error('Error loading premium data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPremiumData();
  }, [blogPostId, blogPostContent]);

  // Save premium content settings
  const handleSave = async () => {
    setSaving(true);
    
    try {
      const dataToSave = {
        blog_post_id: blogPostId,
        is_premium: premiumData.is_premium,
        preview_content: premiumData.preview_content,
        price_cents: premiumData.price_cents,
        currency: premiumData.currency
      };

      let result;
      if (premiumData.id) {
        // Update existing
        result = await supabase
          .from('premium_content')
          .update(dataToSave)
          .eq('id', premiumData.id);
      } else {
        // Insert new
        result = await supabase
          .from('premium_content')
          .insert(dataToSave)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      // Update local state with new ID if it was an insert
      if (!premiumData.id && result.data) {
        setPremiumData(prev => ({ ...prev, id: result.data.id }));
      }

      toast({
        title: "Premium Settings Saved",
        description: premiumData.is_premium 
          ? "Post is now premium content" 
          : "Post is now free content"
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error('Error saving premium data:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save premium settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Remove premium content settings
  const handleRemove = async () => {
    if (!premiumData.id) return;
    
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('premium_content')
        .delete()
        .eq('id', premiumData.id);

      if (error) {
        throw error;
      }

      setPremiumData({
        is_premium: false,
        preview_content: '',
        price_cents: 500,
        currency: 'EUR'
      });

      toast({
        title: "Premium Settings Removed",
        description: "Post is now free content"
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error('Error removing premium data:', error);
      toast({
        title: "Remove Failed",
        description: error.message || "Failed to remove premium settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Generate preview from content
  const generatePreview = () => {
    const preview = blogPostContent
      .replace(/<[^>]*>/g, '') // Strip HTML tags
      .substring(0, 200) + '...';
    
    setPremiumData(prev => ({
      ...prev,
      preview_content: preview
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading premium settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-dashed border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Crown className="h-6 w-6" />
          Premium Content Settings
        </CardTitle>
        <p className="text-sm text-yellow-700">
          Configure paywall settings for "{blogPostTitle}"
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Premium Toggle */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-gray-600" />
            <div>
              <Label className="text-base font-medium">Premium Content</Label>
              <p className="text-sm text-gray-600">
                Require payment to access this content
              </p>
            </div>
          </div>
          <Switch
            checked={premiumData.is_premium}
            onCheckedChange={(checked) => 
              setPremiumData(prev => ({ ...prev, is_premium: checked }))
            }
          />
        </div>

        {premiumData.is_premium && (
          <>
            {/* Price Settings */}
            <div className="space-y-4 p-4 bg-white rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <Label className="text-base font-medium">Price Settings</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (in euros)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={premiumData.price_cents / 100}
                    onChange={(e) => 
                      setPremiumData(prev => ({ 
                        ...prev, 
                        price_cents: Math.round(parseFloat(e.target.value) * 100) 
                      }))
                    }
                    placeholder="5.00"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={premiumData.currency}
                    onChange={(e) => 
                      setPremiumData(prev => ({ ...prev, currency: e.target.value.toUpperCase() }))
                    }
                    placeholder="EUR"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="space-y-4 p-4 bg-white rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-medium">Preview Content</Label>
                </div>
                <Button
                  onClick={generatePreview}
                  variant="outline"
                  size="sm"
                  type="button"
                >
                  Auto-generate
                </Button>
              </div>
              
              <Textarea
                value={premiumData.preview_content}
                onChange={(e) => 
                  setPremiumData(prev => ({ ...prev, preview_content: e.target.value }))
                }
                placeholder="Free preview text that users can read before purchasing..."
                rows={4}
              />
              <p className="text-sm text-gray-600">
                This text will be shown to non-paying users as a preview
              </p>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          
          {premiumData.id && (
            <Button
              onClick={handleRemove}
              disabled={saving}
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Premium
            </Button>
          )}
        </div>

        {/* Preview */}
        {premiumData.is_premium && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium mb-2">Preview for non-paying users:</h4>
            <div className="text-sm text-gray-700 mb-2">
              {premiumData.preview_content || 'No preview content set'}
            </div>
            <div className="text-xs text-gray-500">
              Price: €{(premiumData.price_cents / 100).toFixed(2)} | 
              Currency: {premiumData.currency}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PremiumContentManager;
