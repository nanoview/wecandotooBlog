import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ImageUploader from '@/components/ImageUploader';
import { type UploadedImage } from '@/services/imageUploadService';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ImageUploadDemo = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const { toast } = useToast();

  const handleImageUploaded = (image: UploadedImage) => {
    setUploadedImages(prev => [...prev, image]);
  };

  const handleInsertImage = (markdown: string) => {
    navigator.clipboard.writeText(markdown);
    toast({
      title: "Markdown Copied!",
      description: "Image markdown has been copied to clipboard",
    });
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL Copied!",
        description: "Image URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy URL",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SEO Image Upload Demo</h1>
        <p className="text-gray-600 mb-4">
          Upload images with automatic SEO optimization. Try pasting an image from your clipboard!
        </p>
        <div className="flex gap-2">
          <Badge variant="outline">🎯 Auto SEO Optimization</Badge>
          <Badge variant="outline">📋 Paste Support</Badge>
          <Badge variant="outline">🔗 Auto Link Generation</Badge>
          <Badge variant="outline">💾 Supabase Storage</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upload & Test</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader
                onImageUploaded={handleImageUploaded}
                onInsertImage={handleInsertImage}
                context={{
                  title: "Demo Blog Post About Web Development",
                  keywords: ["web development", "react", "typescript"],
                  content: "This is a demo blog post about modern web development using React and TypeScript..."
                }}
              />
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">How to Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="text-blue-600 font-semibold">1.</span>
                <span><strong>Drag & Drop:</strong> Drag an image file onto the upload area</span>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-600 font-semibold">2.</span>
                <span><strong>Click Upload:</strong> Click the upload area to select a file</span>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-600 font-semibold">3.</span>
                <span><strong>Paste Image:</strong> Copy an image and paste it anywhere on this page</span>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-600 font-semibold">4.</span>
                <span><strong>SEO Magic:</strong> Watch as filename, alt text, and title are automatically optimized</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Images ({uploadedImages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {uploadedImages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No images uploaded yet.</p>
                  <p className="text-sm">Upload or paste an image to see the SEO magic!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      {/* Image Preview */}
                      <img 
                        src={image.url} 
                        alt={image.alt}
                        className="w-full h-32 object-cover rounded border"
                      />
                      
                      {/* SEO Data */}
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-semibold text-green-600">✓ Filename:</span>
                          <p className="text-gray-700 break-all">{image.fileName}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-green-600">✓ Alt Text:</span>
                          <p className="text-gray-700">"{image.alt}"</p>
                        </div>
                        <div>
                          <span className="font-semibold text-green-600">✓ Title:</span>
                          <p className="text-gray-700">"{image.title}"</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyUrl(image.url)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy URL
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>🚀 Features Implemented</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">SEO Optimization</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Auto-generated SEO-friendly filenames</li>
                <li>• Keyword-optimized alt text</li>
                <li>• Descriptive titles for accessibility</li>
                <li>• Context-aware naming</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Upload Features</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Drag & drop support</li>
                <li>• Clipboard paste detection</li>
                <li>• Automatic compression</li>
                <li>• Multiple format support</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-600">Storage & Links</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Supabase cloud storage</li>
                <li>• Instant public URLs</li>
                <li>• CDN-optimized delivery</li>
                <li>• Secure access policies</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-600">Integration</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• One-click markdown generation</li>
                <li>• HTML with all SEO attributes</li>
                <li>• Copy to clipboard</li>
                <li>• Post editor integration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUploadDemo;
