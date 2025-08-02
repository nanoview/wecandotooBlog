import React, { useState, useRef } from 'react';
import { X, Save, Eye, EyeOff, Hash, Send, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/RichTextEditor';

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Technology', 'Science', 'Health', 'Business', 'Entertainment', 
    'Sports', 'Politics', 'Education', 'Travel', 'Food', 'Lifestyle', 'Other'
  ];

  const handleContentChange = (html: string, text: string) => {
    setContent(html);
    setContentText(text);
    // Auto-generate excerpt if not manually set
    if (!excerpt) {
      setExcerpt(text.substring(0, 150) + '...');
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
    // Here you would typically upload the file to your storage service
    // For now, we'll just create an object URL
    return URL.createObjectURL(file);
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
    // Count words in title and excerpt
    const titleWords = title.split(/\s+/).length;
    const excerptWords = excerpt.split(/\s+/).length;
    const contentWords = contentText.split(/\s+/).length;
    
    // Average reading speed is 200-250 words per minute
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
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
                  {mode === 'create' ? 'Create New Post' : 'Edit Post'}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Share your thoughts with the world
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-6">
          <div className="flex h-full">
            {/* Main Editor */}
            <div className="flex-1 pr-6">
              <div className="grid gap-6">
                {/* Title */}
                <div>
                  <Input
                    placeholder="Post Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-2xl font-semibold"
                  />
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

            {/* Sidebar */}
            <div className="w-80 border-l pl-6 space-y-6">
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
            </div>
          </div>
        </CardContent>

        <div className="border-t p-4 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{readTime} min read</span>
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
