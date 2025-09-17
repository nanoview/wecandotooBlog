import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, User, Tag, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  category: string;
  tags: string[];
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

interface SEOGeneratorProps {
  post: BlogPost;
  onSEOGenerated?: () => void;
}

const SEOGenerator: React.FC<SEOGeneratorProps> = ({ post, onSEOGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [seoData, setSeoData] = useState<any>(null);
  const { toast } = useToast();

  const generateSEO = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-seo', {
        body: { post_id: post.id }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to generate SEO data');
      }

      setSeoData(data.data);
      
      toast({
        title: "✨ SEO Generated!",
        description: "Meta title, description, and keywords have been generated successfully.",
      });

      if (onSEOGenerated) {
        onSEOGenerated();
      }

    } catch (error: any) {
      console.error('SEO generation error:', error);
      
      if (error.message?.includes('Only administrators and editors')) {
        toast({
          title: "🚫 Access Denied",
          description: "You need admin or editor permissions to generate SEO data.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "❌ SEO Generation Failed",
          description: error.message || "Unable to generate SEO data. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const hasSEO = post.meta_title || post.meta_description;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            SEO Optimization
          </CardTitle>
          <Badge variant={hasSEO ? "default" : "secondary"}>
            {hasSEO ? "SEO Ready" : "No SEO Data"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Post Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Slug:</span>
            <code className="text-xs bg-white px-2 py-1 rounded">{post.slug}</code>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Category:</span>
            <Badge variant="outline" className="text-xs">{post.category}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="text-xs">
              {post.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Updated:</span>
            <span className="text-xs text-gray-600">
              {new Date(post.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Current SEO Data */}
        {hasSEO && (
          <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800">Current SEO Data:</h4>
            {post.meta_title && (
              <div>
                <span className="text-sm font-medium text-gray-700">Meta Title:</span>
                <p className="text-sm text-gray-600 mt-1 p-2 bg-white rounded border">
                  {post.meta_title}
                </p>
              </div>
            )}
            {post.meta_description && (
              <div>
                <span className="text-sm font-medium text-gray-700">Meta Description:</span>
                <p className="text-sm text-gray-600 mt-1 p-2 bg-white rounded border">
                  {post.meta_description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Generated SEO Data */}
        {seoData && (
          <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800">✨ Newly Generated SEO Data:</h4>
            <div>
              <span className="text-sm font-medium text-gray-700">Meta Title:</span>
              <p className="text-sm text-gray-600 mt-1 p-2 bg-white rounded border">
                {seoData.meta_title}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Meta Description:</span>
              <p className="text-sm text-gray-600 mt-1 p-2 bg-white rounded border">
                {seoData.meta_description}
              </p>
            </div>
            {seoData.keywords && seoData.keywords.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700">Keywords:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {seoData.keywords.map((keyword: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="text-xs text-blue-600">
              Generated by: {seoData.generated_by} • {new Date(seoData.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {hasSEO ? 
              "Re-generate to update SEO data with latest content" : 
              "Generate SEO meta tags and keywords for this post"
            }
          </div>
          <Button 
            onClick={generateSEO} 
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : hasSEO ? 'Re-generate SEO' : 'Generate SEO'}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded border-l-4 border-blue-400">
          <strong>💡 How it works:</strong> Click "Generate SEO" to automatically create optimized meta title, 
          meta description, and keywords based on your post's title, content, and category. 
          This helps improve search engine visibility and social media sharing.
        </div>
      </CardContent>
    </Card>
  );
};

export default SEOGenerator;
