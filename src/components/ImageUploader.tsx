import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, X, Check, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  uploadImage, 
  generateImageMarkdown, 
  generateImageHTML, 
  validateImageFile,
  compressImage,
  type UploadedImage 
} from '@/services/imageUploadService';

interface ImageUploaderProps {
  onImageUploaded: (image: UploadedImage) => void;
  onInsertImage?: (markdown: string) => void;
  context?: {
    title?: string;
    keywords?: string[];
    content?: string;
  };
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUploaded, 
  onInsertImage,
  context,
  className = '' 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [altText, setAltText] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    const file = files[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Upload Error",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Compress image if it's large
      let fileToUpload = file;
      if (file.size > 50 * 1024 * 1024) { // 50MB - only compress very large files
        fileToUpload = await compressImage(file, 0.8);
      }

      // Upload image
      const uploadedImg = await uploadImage(fileToUpload, context);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Set form values from SEO-optimized data
      setUploadedImage(uploadedImg);
      setAltText(uploadedImg.alt);
      setImageTitle(uploadedImg.title);
      setCaption(uploadedImg.caption || '');

      onImageUploaded(uploadedImg);

      toast({
        title: "Image Uploaded Successfully",
        description: "SEO-optimized image ready for use!",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [context, onImageUploaded, toast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  }, [handleUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const insertImage = () => {
    if (!uploadedImage || !onInsertImage) return;

    const updatedImage = {
      ...uploadedImage,
      alt: altText,
      title: imageTitle,
      caption
    };

    const markdown = generateImageMarkdown(updatedImage);
    onInsertImage(markdown);

    toast({
      title: "Image Inserted",
      description: "Image added to your content",
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}>
        <CardContent className="p-6">
          <div
            className="text-center cursor-pointer"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {isUploading ? (
              <div className="space-y-3">
                <div className="animate-pulse">
                  <Upload className="mx-auto h-12 w-12 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Uploading and optimizing...</p>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-gray-500">{uploadProgress}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium">Upload Image</p>
                  <p className="text-sm text-gray-600">
                    Drag & drop or click to select
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG, WebP, GIF up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Image Preview & SEO Editor */}
      {uploadedImage && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="font-medium">Image Uploaded Successfully</span>
              <Badge variant="secondary">SEO Optimized</Badge>
            </div>

            {/* Image Preview */}
            <div className="relative">
              <img 
                src={uploadedImage.url} 
                alt={uploadedImage.alt}
                className="max-w-full h-auto max-h-64 object-contain rounded-lg border"
              />
            </div>

            {/* SEO Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="alt-text">Alt Text (SEO)</Label>
                <Textarea
                  id="alt-text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Descriptive alt text for accessibility and SEO"
                  className="mt-1"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {altText.length}/125 characters (optimal for SEO)
                </p>
              </div>

              <div>
                <Label htmlFor="image-title">Title</Label>
                <Input
                  id="image-title"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  placeholder="Image title (appears on hover)"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="caption">Caption (Optional)</Label>
                <Input
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Image caption or description"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Copy Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(uploadedImage.url, "Image URL")}
                className="justify-start"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(
                  generateImageMarkdown({ ...uploadedImage, alt: altText, title: imageTitle }),
                  "Markdown"
                )}
                className="justify-start"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Markdown
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(
                  generateImageHTML({ ...uploadedImage, alt: altText, title: imageTitle }),
                  "HTML"
                )}
                className="justify-start"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy HTML
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(uploadedImage.url, '_blank')}
                className="justify-start"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Image
              </Button>
            </div>

            {/* Insert Button */}
            {onInsertImage && (
              <Button onClick={insertImage} className="w-full">
                <ImageIcon className="h-4 w-4 mr-2" />
                Insert Image into Content
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUploader;
