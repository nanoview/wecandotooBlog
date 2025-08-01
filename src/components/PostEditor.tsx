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
import { useToast } from '@/components/ui/use-toast';
import BlockEditor, { Block } from '@/components/BlockEditor';

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
  
  // Initialize with default blocks if no initial post
  const getInitialBlocks = (): Block[] => {
    if (initialPost?.content) {
      try {
        // Try to parse as block content
        return JSON.parse(initialPost.content);
      } catch {
        // Fallback to text block if parsing fails
        return [{
          id: '1',
          type: 'text',
          content: { text: initialPost.content || '' },
          style: { fontSize: 'base', fontWeight: 'normal', textAlign: 'left', color: '#000000' }
        }];
      }
    }
    return [{
      id: '1',
      type: 'text',
      content: { text: '' },
      style: { fontSize: 'base', fontWeight: 'normal', textAlign: 'left', color: '#000000' }
    }];
  };

  const [title, setTitle] = useState(initialPost?.title || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [blocks, setBlocks] = useState<Block[]>(getInitialBlocks);
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

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFeaturedImage(url);
    }
  };

  const calculateReadTime = () => {
    let wordCount = 0;
    
    // Count words in title and excerpt
    wordCount += (title.split(' ').length || 0) + (excerpt.split(' ').length || 0);
    
    // Count words in all blocks
    blocks.forEach(block => {
      switch (block.type) {
        case 'text':
        case 'heading':
          wordCount += block.content?.text?.split(' ').length || 0;
          break;
        case 'list':
          block.content?.items?.forEach((item: string) => {
            wordCount += item.split(' ').length || 0;
          });
          break;
        case 'quote':
          wordCount += (block.content?.text?.split(' ').length || 0) + (block.content?.author?.split(' ').length || 0);
          break;
        case 'checklist':
          block.content?.items?.forEach((item: any) => {
            wordCount += item.text?.split(' ').length || 0;
          });
          break;
      }
    });
    
    // Average reading speed is 200-250 words per minute
    const estimatedTime = Math.max(1, Math.ceil(wordCount / 225));
    setReadTime(estimatedTime);
  };

  const handleSave = async (publish: boolean = false) => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your post.",
        variant: "destructive",
      });
      return;
    }

    if (blocks.length === 0 || blocks.every(block => !getBlockText(block))) {
      toast({
        title: "Content required",
        description: "Please add some content to your post.",
        variant: "destructive",
      });
      return;
    }

    calculateReadTime();

    const postData = {
      title: title.trim(),
      excerpt: excerpt.trim() || generateExcerpt(),
      content: JSON.stringify(blocks),
      category: category || 'Other',
      tags,
      featured_image: featuredImage,
      read_time: readTime,
      status: publish ? 'published' : 'draft',
      author_id: user?.id,
      ...(mode === 'edit' && { id: initialPost.id })
    };

    setIsPublishing(true);
    try {
      await onSave(postData);
      toast({
        title: publish ? "Post published!" : "Draft saved!",
        description: publish 
          ? "Your post has been published successfully." 
          : "Your draft has been saved successfully.",
      });
      onClose();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const generateExcerpt = () => {
    const textBlocks = blocks.filter(block => 
      block.type === 'text' || block.type === 'heading'
    );
    
    if (textBlocks.length > 0) {
      const firstTextBlock = textBlocks[0];
      const text = firstTextBlock.content?.text || '';
      return text.substring(0, 150) + (text.length > 150 ? '...' : '');
    }
    
    return '';
  };

  const getBlockText = (block: Block): string => {
    switch (block.type) {
      case 'text':
      case 'heading':
        return block.content?.text || '';
      case 'list':
        return block.content?.items?.join(' ') || '';
      case 'quote':
        return (block.content?.text || '') + ' ' + (block.content?.author || '');
      case 'checklist':
        return block.content?.items?.map((item: any) => item.text).join(' ') || '';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">
                {mode === 'edit' ? 'Edit Post' : 'Create Post'}
              </h2>
              <p className="text-sm text-gray-600">
                Share your thoughts with the world
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center space-x-2"
            >
              {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{isPreview ? 'Edit' : 'Preview'}</span>
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isPreview ? (
            <PostPreview 
              title={title}
              excerpt={excerpt}
              blocks={blocks}
              category={category}
              tags={tags}
              featuredImage={featuredImage}
              readTime={readTime}
              author={user}
            />
          ) : (
            <div className="flex">
              {/* Main Editor */}
              <div className="flex-1 p-6 space-y-6">
                {/* Title */}
                <div>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's your story about?"
                    className="text-2xl font-bold border-none shadow-none p-0 placeholder:text-gray-400"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <Textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Write a brief description..."
                    className="border-none shadow-none p-0 resize-none"
                    rows={2}
                  />
                </div>

                <Separator />

                {/* Block Editor */}
                <div className="min-h-[400px]">
                  <BlockEditor
                    blocks={blocks}
                    onChange={setBlocks}
                    readOnly={false}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-80 p-6 border-l bg-gray-50 space-y-6">
                {/* Featured Image */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Featured Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {featuredImage ? (
                      <div className="relative">
                        <img
                          src={featuredImage}
                          alt="Featured"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setFeaturedImage('')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </CardContent>
                </Card>

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
                    <div className="flex space-x-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag"
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="flex-1"
                      />
                      <Button onClick={addTag} size="sm">
                        <Hash className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTag(tag)}
                        >
                          {tag} <X className="w-3 h-3 ml-1" />
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
                    <div className="flex items-center space-x-2">
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
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{blocks.length} blocks</span>
            <span>•</span>
            <span>{readTime} min read</span>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isPublishing}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={isPublishing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Preview Component
const PostPreview: React.FC<{
  title: string;
  excerpt: string;
  blocks: Block[];
  category: string;
  tags: string[];
  featuredImage: string;
  readTime: number;
  author: any;
}> = ({ title, excerpt, blocks, category, tags, featuredImage, readTime, author }) => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        {featuredImage && (
          <img
            src={featuredImage}
            alt={title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}
        
        <div className="flex items-center gap-2 mb-4">
          {category && (
            <Badge variant="outline">{category}</Badge>
          )}
          <span className="text-sm text-gray-600">{readTime} min read</span>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">{title || 'Untitled Post'}</h1>
        
        {excerpt && (
          <p className="text-xl text-gray-600 mb-6">{excerpt}</p>
        )}
        
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-12 w-12">
            <AvatarImage src={author?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {author?.user_metadata?.full_name?.charAt(0) || author?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{author?.user_metadata?.full_name || 'Anonymous'}</p>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">#{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      <Separator className="mb-8" />

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <BlockEditor
          blocks={blocks}
          onChange={() => {}}
          readOnly={true}
        />
      </div>
    </div>
  );
};

export default PostEditor;
