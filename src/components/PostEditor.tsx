import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Eye, EyeOff, Hash, Send, Image as ImageIcon, Search, Target, Globe, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/RichTextEditor';
import ImageUploader from '@/components/ImageUploader';
import { handleImagePaste, type UploadedImage } from '@/services/imageUploadService';

interface PostEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: any) => void;
  initialPost?: any;
  mode?: 'create' | 'edit';
}

const PostEditor: React.FC<PostEditorProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialPost = null,
  mode = 'create'
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Basic fields
  const [title, setTitle] = useState(initialPost?.title || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [contentText, setContentText] = useState('');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [category, setCategory] = useState(initialPost?.category || '');
  const [tags, setTags] = useState<string[]>(initialPost?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(initialPost?.featured_image || '');
  const [readTime, setReadTime] = useState(initialPost?.read_time || 5);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [showImageUploader, setShowImageUploader] = useState(false);

  // NEW SEO FIELDS
  const [seoTitle, setSeoTitle] = useState(initialPost?.seo_title || '');
  const [metaDescription, setMetaDescription] = useState(initialPost?.meta_description || '');
  const [focusKeyword, setFocusKeyword] = useState(initialPost?.focus_keyword || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [canonicalUrl, setCanonicalUrl] = useState(initialPost?.canonical_url || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paste event handler for automatic image upload
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!isOpen) return;
      
      try {
        const context = {
          title,
          keywords: focusKeyword ? [focusKeyword] : [],
          content: contentText
        };
        
        const uploadedImage = await handleImagePaste(e, context);
        if (uploadedImage) {
          setUploadedImages(prev => [...prev, uploadedImage]);
          
          // Insert image into content at cursor position
          const markdown = `![${uploadedImage.alt}](${uploadedImage.url} "${uploadedImage.title}")`;
          setContent(prev => prev + '\n\n' + markdown);
          
          toast({
            title: "Image Uploaded",
            description: "Pasted image uploaded with SEO optimization!",
          });
        }
      } catch (error) {
        console.error('Paste upload error:', error);
        toast({
          title: "Upload Failed",
          description: "Could not upload pasted image",
          variant: "destructive"
        });
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isOpen, title, focusKeyword, contentText, toast]);

  const categories = [
    'Technology', 'Science', 'Health', 'Business', 'Entertainment', 
    'Sports', 'Politics', 'Education', 'Travel', 'Food', 'Lifestyle', 'Other'
  ];

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [title, slug]);

  // Auto-generate SEO title from title
  useEffect(() => {
    if (title && !seoTitle) {
      setSeoTitle(title);
    }
  }, [title, seoTitle]);

  // SEO Analysis Functions
  const getSEOScore = () => {
    let score = 0;
    const checks = [
      { condition: title.length >= 10 && title.length <= 60, points: 20 },
      { condition: seoTitle.length >= 30 && seoTitle.length <= 60, points: 15 },
      { condition: metaDescription.length >= 120 && metaDescription.length <= 160, points: 15 },
      { condition: focusKeyword && contentText.toLowerCase().includes(focusKeyword.toLowerCase()), points: 20 },
      { condition: slug && slug.length >= 3, points: 10 },
      { condition: contentText.length >= 300, points: 10 },
      { condition: tags.length >= 2, points: 10 }
    ];
    
    checks.forEach(check => {
      if (check.condition) score += check.points;
    });
    
    return score;
  };

  const getKeywordDensity = () => {
    if (!focusKeyword || !contentText) return 0;
    const words = contentText.toLowerCase().split(/\s+/);
    const keywordOccurrences = words.filter(word => 
      word.includes(focusKeyword.toLowerCase())
    ).length;
    return (keywordOccurrences / words.length) * 100;
  };

  const getReadabilityScore = () => {
    const sentences = contentText.split(/[.!?]+/).length;
    const words = contentText.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    if (avgWordsPerSentence <= 14) return 'Easy';
    if (avgWordsPerSentence <= 18) return 'Medium';
    return 'Hard';
  };

  const handleContentChange = (html: string, text: string) => {
    setContent(html);
    setContentText(text);
    // Auto-generate excerpt if not manually set
    if (!excerpt) {
      setExcerpt(text.substring(0, 150) + '...');
    }
    // Auto-generate meta description if not set
    if (!metaDescription) {
      setMetaDescription(text.substring(0, 155) + '...');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    // This function is kept for backward compatibility with RichTextEditor
    return URL.createObjectURL(file);
  };

  const handleImageUploaded = (image: UploadedImage) => {
    setUploadedImages(prev => [...prev, image]);
    // Optionally set as featured image if none set
    if (!featuredImage) {
      setFeaturedImage(image.url);
    }
  };

  const insertImageIntoContent = (markdown: string) => {
    setContent(prev => prev + '\n\n' + markdown);
  };

  const handleFeaturedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file).then(url => {
        setFeaturedImage(url);
      });
    }
  };

  const calculateReadTime = () => {
    const titleWords = title.split(/\s+/).length;
    const excerptWords = excerpt.split(/\s+/).length;
    const contentWords = contentText.split(/\s+/).length;
    const estimatedTime = Math.max(1, Math.ceil((titleWords + excerptWords + contentWords) / 225));
    setReadTime(estimatedTime);
  };

  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your post.",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add some content to your post.",
        variant: "destructive"
      });
      return;
    }

    // SEO Validation
    if (status === 'published') {
      if (!seoTitle || !metaDescription || !focusKeyword) {
        toast({
          title: "SEO Fields Required",
          description: "Please fill in SEO title, meta description, and focus keyword before publishing.",
          variant: "destructive"
        });
        return;
      }
    }

    calculateReadTime();

    try {
      const postData = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || contentText.substring(0, 150) + '...',
        category: category || 'Other',
        tags,
        featured_image: featuredImage,
        status,
        author_id: user?.id,
        // SEO FIELDS
        seo_title: seoTitle.trim(),
        meta_description: metaDescription.trim(),
        focus_keyword: focusKeyword.trim(),
        slug: slug.trim(),
        canonical_url: canonicalUrl.trim(),
        ...(mode === 'edit' && { id: initialPost.id })
      };

      await onSave(postData);
      
      toast({
        title: "Success!",
        description: `Post ${status === 'published' ? 'published' : 'saved'} successfully.`,
      });

      if (status === 'published') {
        onClose();
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save the post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  const seoScore = getSEOScore();
  const keywordDensity = getKeywordDensity();
  const readability = getReadabilityScore();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl font-semibold">
                  {mode === 'create' ? 'Create SEO-Optimized Post' : 'Edit Post'}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  SEO Score: <span className={`font-semibold ${
                    seoScore >= 80 ? 'text-green-600' : 
                    seoScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>{seoScore}/100</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-6">
          <div className="flex h-full gap-6">
            {/* Main Editor */}
            <div className="flex-1">
              <div className="grid gap-6">
                {/* Title */}
                <div>
                  <Input
                    placeholder="Post Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-2xl font-semibold"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {title.length}/60 characters
                  </p>
                </div>

                {/* Featured Image */}
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Set Featured Image
                    </Button>
                    {featuredImage && (
                      <Button
                        variant="ghost"
                        onClick={() => setFeaturedImage('')}
                      >
                        Remove Image
                      </Button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFeaturedImageUpload}
                  />
                  {featuredImage && (
                    <div className="relative mt-2 aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={featuredImage}
                        alt="Featured"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Content Editor */}
                {isPreview ? (
                  <div className="prose prose-lg max-w-none min-h-[400px]">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  </div>
                ) : (
                  <div className="min-h-[400px]">
                    <RichTextEditor
                      initialContent={content}
                      onChange={handleContentChange}
                      onImageUpload={handleImageUpload}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Sidebar with SEO and Images */}
            <div className="w-96 border-l pl-6">
              <Tabs defaultValue="content" className="h-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6 mt-6">
                  {/* Category */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Tags */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        />
                        <Button onClick={addTag}>
                          <Hash className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reading Time */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Reading Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={readTime}
                          onChange={(e) => setReadTime(parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-20"
                        />
                        <span className="text-sm text-gray-600">minutes</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={calculateReadTime}
                        >
                          Auto
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="images" className="space-y-6 mt-6">
                  {/* Image Uploader */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Image Upload
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-600 mb-4">
                        📋 <strong>Paste images directly</strong> or upload manually. 
                        Images are automatically optimized for SEO with proper alt text and file names.
                      </p>
                      <ImageUploader
                        onImageUploaded={handleImageUploaded}
                        onInsertImage={insertImageIntoContent}
                        context={{
                          title,
                          keywords: focusKeyword ? [focusKeyword] : [],
                          content: contentText
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* Uploaded Images Gallery */}
                  {uploadedImages.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Uploaded Images ({uploadedImages.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          {uploadedImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={image.url} 
                                alt={image.alt}
                                className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                                onClick={() => insertImageIntoContent(`![${image.alt}](${image.url} "${image.title}")`)}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                <Button 
                                  size="sm" 
                                  variant="secondary"
                                  onClick={() => insertImageIntoContent(`![${image.alt}](${image.url} "${image.title}")`)}
                                >
                                  Insert
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Click any image to insert into content
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="seo" className="space-y-6 mt-6">
                  {/* SEO Score */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        SEO Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>SEO Score</span>
                          <span className={
                            seoScore >= 80 ? 'text-green-600' : 
                            seoScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }>{seoScore}/100</span>
                        </div>
                        <Progress value={seoScore} className="h-2" />
                      </div>
                      
                      <div className="text-xs space-y-2">
                        <div className="flex justify-between">
                          <span>Keyword Density:</span>
                          <span className={
                            keywordDensity >= 1 && keywordDensity <= 3 ? 'text-green-600' : 'text-yellow-600'
                          }>{keywordDensity.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Readability:</span>
                          <span className={
                            readability === 'Easy' ? 'text-green-600' : 
                            readability === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                          }>{readability}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Content Length:</span>
                          <span className={contentText.length >= 300 ? 'text-green-600' : 'text-red-600'}>
                            {contentText.split(/\s+/).length} words
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* SEO Title */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">SEO Title</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Input
                        placeholder="Custom SEO title for search engines"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {seoTitle.length}/60 characters
                      </p>
                    </CardContent>
                  </Card>

                  {/* Meta Description */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Meta Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Brief description for search results (150-160 characters)"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        maxLength={160}
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {metaDescription.length}/160 characters
                      </p>
                    </CardContent>
                  </Card>

                  {/* Focus Keyword */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Focus Keyword
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Input
                        placeholder="Primary keyword for this post"
                        value={focusKeyword}
                        onChange={(e) => setFocusKeyword(e.target.value)}
                      />
                      {focusKeyword && (
                        <p className="text-xs text-gray-500 mt-1">
                          Found {contentText.toLowerCase().split(focusKeyword.toLowerCase()).length - 1} times in content
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* URL Slug */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        URL Slug
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Input
                        placeholder="url-friendly-slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        URL: /blog/{slug}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Canonical URL */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Canonical URL</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Input
                        placeholder="https://example.com/original-post"
                        value={canonicalUrl}
                        onChange={(e) => setCanonicalUrl(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Optional: Set if this content exists elsewhere
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>

        <div className="border-t p-4 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{readTime} min read</span>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                seoScore >= 80 ? 'bg-green-500' : 
                seoScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                SEO: {seoScore >= 80 ? 'Good' : seoScore >= 60 ? 'Needs Work' : 'Poor'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={isPublishing}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave('published')}
              disabled={isPublishing}
            >
              <Send className="w-4 h-4 mr-2" />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PostEditor;
