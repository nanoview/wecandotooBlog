import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Edit3, 
  Save, 
  Eye, 
  Image, 
  Video, 
  Bold, 
  Italic, 
  Link, 
  List, 
  Quote,
  ArrowLeft,
  Upload,
  X,
  Sparkles,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Underline,
  Strikethrough,
  Hash,
  Search,
  Globe,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';

const BlogEditor = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [post, setPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    category: '',
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published',
    featured_image: '',
    meta_title: '',
    meta_description: '',
    canonical_url: '',
    schema_type: 'Article',
    focus_keyword: '',
    alt_text: ''
  });
  
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [showSEOPanel, setShowSEOPanel] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [isFloatingToolbar, setIsFloatingToolbar] = useState(false);

  useEffect(() => {
    if (!loading && (!user || userRole !== 'editor')) {
      navigate('/');
      return;
    }

    // Handle floating toolbar on scroll
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const shouldFloat = scrollTop > 200;
      setIsFloatingToolbar(shouldFloat);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, userRole, loading, navigate]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setPost(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('blog-media')
        .getPublicUrl(filePath);

      const mediaUrl = data.publicUrl;

      if (file.type.startsWith('image/')) {
        const imageMarkdown = `![${file.name}](${mediaUrl})`;
        setPost(prev => ({
          ...prev,
          content: prev.content + '\n\n' + imageMarkdown
        }));
      } else if (file.type.startsWith('video/')) {
        const videoMarkdown = `<video controls width="100%">\n  <source src="${mediaUrl}" type="${file.type}">\n  Your browser does not support the video tag.\n</video>`;
        setPost(prev => ({
          ...prev,
          content: prev.content + '\n\n' + videoMarkdown
        }));
      }

      toast({
        title: "Success",
        description: "Media uploaded successfully!"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = before + selectedText + after;
    
    const newContent = 
      textarea.value.substring(0, start) + 
      newText + 
      textarea.value.substring(end);
    
    setPost(prev => ({ ...prev, content: newContent }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const insertHTMLTag = (tag: string, attributes: string = '') => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const openTag = attributes ? `<${tag} ${attributes}>` : `<${tag}>`;
    const closeTag = `</${tag}>`;
    const newText = openTag + selectedText + closeTag;
    
    const newContent = 
      textarea.value.substring(0, start) + 
      newText + 
      textarea.value.substring(end);
    
    setPost(prev => ({ ...prev, content: newContent }));
    
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + openTag.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertCustomHTML = (html: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newContent = 
      textarea.value.substring(0, start) + 
      html + 
      textarea.value.substring(start);
    
    setPost(prev => ({ ...prev, content: newContent }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + html.length, start + html.length);
    }, 0);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const saveDraft = async () => {
    if (!post.title.trim() || !post.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || post.content.substring(0, 200) + '...',
          slug: post.slug || generateSlug(post.title),
          category: post.category,
          tags: post.tags,
          status: 'draft',
          author_id: user!.id,
          featured_image: post.featured_image,
          meta_title: post.meta_title,
          meta_description: post.meta_description,
          canonical_url: post.canonical_url,
          schema_type: post.schema_type || 'Article',
          focus_keyword: post.focus_keyword,
          alt_text: post.alt_text
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Draft saved successfully!"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const publishPost = async () => {
    if (!post.title.trim() || !post.content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || post.content.substring(0, 200) + '...',
          slug: post.slug || generateSlug(post.title),
          category: post.category,
          tags: post.tags,
          status: 'published',
          published_at: new Date().toISOString(),
          author_id: user!.id,
          featured_image: post.featured_image,
          meta_title: post.meta_title || post.title,
          meta_description: post.meta_description || post.excerpt,
          canonical_url: post.canonical_url,
          schema_type: post.schema_type,
          focus_keyword: post.focus_keyword
        });

      if (error) throw error;

      toast({
        title: "🎉 Success",
        description: "Blog post published successfully!"
      });
      
      // Redirect to blog list or home
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced Floating Toolbar Component
  const FloatingToolbar = () => (
    <div className={`
      ${isFloatingToolbar ? 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50' : 'relative mb-4'} 
      ${isFloatingToolbar ? 'bg-white shadow-lg border rounded-lg' : 'bg-muted rounded-lg'} 
      transition-all duration-300 p-2
    `}>
      <div className="flex flex-wrap gap-1 items-center">
        {/* Basic Formatting */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button size="sm" variant="ghost" onClick={() => insertFormatting('**', '**')} title="Bold">
            <Bold className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => insertFormatting('*', '*')} title="Italic">
            <Italic className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => insertHTMLTag('u')} title="Underline">
            <Underline className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => insertHTMLTag('s')} title="Strikethrough">
            <Strikethrough className="w-4 h-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button size="sm" variant="ghost" onClick={() => insertFormatting('# ')} title="Heading 1">
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => insertFormatting('## ')} title="Heading 2">
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => insertFormatting('### ')} title="Heading 3">
            <Heading3 className="w-4 h-4" />
          </Button>
        </div>

        {/* HTML Tags */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button size="sm" variant="ghost" onClick={() => insertHTMLTag('div', 'class=""')} title="Div">
            <Code className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => insertHTMLTag('span', 'class=""')} title="Span">
            <Hash className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => insertHTMLTag('p')} title="Paragraph">
            <AlignLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button size="sm" variant="ghost" onClick={() => insertHTMLTag('div', 'style="text-align: center;"')} title="Center">
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => insertHTMLTag('div', 'style="text-align: right;"')} title="Right">
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Lists & Links */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button size="sm" variant="ghost" onClick={() => insertFormatting('[', '](url)')} title="Link">
            <Link className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => insertFormatting('- ')} title="List">
            <List className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => insertFormatting('> ')} title="Quote">
            <Quote className="w-4 h-4" />
          </Button>
        </div>

        {/* Media */}
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()} title="Image">
            <Image className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()} title="Video">
            <Video className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden ml-2 pl-2 border-l">
          <Button size="sm" variant="ghost" onClick={() => setShowToolbar(!showToolbar)}>
            {showToolbar ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Extended HTML Tools (Mobile Collapsible) */}
      {showToolbar && (
        <div className="mt-2 pt-2 border-t md:hidden">
          <div className="grid grid-cols-3 gap-1 text-xs">
            <Button size="sm" variant="outline" onClick={() => insertCustomHTML('<br>')}>
              Line Break
            </Button>
            <Button size="sm" variant="outline" onClick={() => insertCustomHTML('<hr>')}>
              Divider
            </Button>
            <Button size="sm" variant="outline" onClick={() => insertHTMLTag('blockquote')}>
              Blockquote
            </Button>
            <Button size="sm" variant="outline" onClick={() => insertHTMLTag('code')}>
              Inline Code
            </Button>
            <Button size="sm" variant="outline" onClick={() => insertHTMLTag('pre')}>
              Code Block
            </Button>
            <Button size="sm" variant="outline" onClick={() => insertHTMLTag('table')}>
              Table
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'editor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              You need editor privileges to access this page.
            </p>
            <Button onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-semibold">Blog Editor</h1>
                <Badge variant="default" className="bg-primary/10 text-primary">
                  ✨ Editor Mode
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                onClick={saveDraft}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={publishPost}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!previewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-3 space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Post Content</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSEOPanel(!showSEOPanel)}
                      className="text-xs"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      SEO
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      value={post.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter your blog post title..."
                      className="text-lg md:text-xl font-semibold"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Slug</label>
                    <Input
                      value={post.slug}
                      onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="url-friendly-slug"
                    />
                  </div>

                  {/* Essential SEO Fields (Always Visible) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Meta Description</label>
                      <Textarea
                        value={post.meta_description}
                        onChange={(e) => setPost(prev => ({ ...prev, meta_description: e.target.value }))}
                        placeholder="SEO-friendly description for search results"
                        className="min-h-[80px] text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {post.meta_description.length}/160 characters (optimal for search results)
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Focus Keyword</label>
                      <Input
                        value={post.focus_keyword}
                        onChange={(e) => setPost(prev => ({ ...prev, focus_keyword: e.target.value }))}
                        placeholder="Main SEO keyword for this post"
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Primary keyword to optimize for in search engines
                      </p>
                    </div>
                  </div>

                  {/* SEO Panel (Collapsible) */}
                  {showSEOPanel && (
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          SEO Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Meta Title</label>
                          <Input
                            value={post.meta_title}
                            onChange={(e) => setPost(prev => ({ ...prev, meta_title: e.target.value }))}
                            placeholder="Custom meta title (optional)"
                            className="text-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {post.meta_title.length}/60 characters
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block">Canonical URL</label>
                          <Input
                            value={post.canonical_url}
                            onChange={(e) => setPost(prev => ({ ...prev, canonical_url: e.target.value }))}
                            placeholder="https://example.com/post"
                            className="text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block">Schema Type</label>
                          <select
                            value={post.schema_type}
                            onChange={(e) => setPost(prev => ({ ...prev, schema_type: e.target.value }))}
                            className="w-full p-2 border rounded-md text-sm"
                          >
                            <option value="Article">Article</option>
                            <option value="BlogPosting">Blog Posting</option>
                            <option value="NewsArticle">News Article</option>
                            <option value="TechArticle">Technical Article</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Enhanced Floating Toolbar */}
                  <FloatingToolbar />

                  <div>
                    <label className="text-sm font-medium mb-2 block">Content</label>
                    <Textarea
                      name="content"
                      value={post.content}
                      onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your amazing blog post here... Use the toolbar above for formatting and HTML tags."
                      className="min-h-[300px] md:min-h-[400px] font-mono text-sm"
                    />
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{post.content.length} characters</span>
                      <span>~{Math.ceil(post.content.split(' ').length / 250)} min read</span>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Mobile-Friendly Sidebar */}
            <div className="space-y-4 md:space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Post Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Input
                      value={post.category}
                      onChange={(e) => setPost(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Technology, Travel"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Excerpt</label>
                    <Textarea
                      value={post.excerpt}
                      onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Brief description of your post..."
                      className="min-h-[80px] md:min-h-[100px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {post.excerpt.length}/200 characters
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag"
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button onClick={handleAddTag} size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
                          {tag}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Featured Image URL</label>
                    <Input
                      value={post.featured_image}
                      onChange={(e) => setPost(prev => ({ ...prev, featured_image: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                    {post.featured_image && (
                      <div className="mt-2">
                        <img 
                          src={post.featured_image} 
                          alt="Featured preview"
                          className="w-full h-32 object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Alt Text for Featured Image</label>
                    <Input
                      value={post.alt_text}
                      onChange={(e) => setPost(prev => ({ ...prev, alt_text: e.target.value }))}
                      placeholder="Describe the image for accessibility"
                      className="text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Media
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const currentUrl = window.location.origin;
                        const previewUrl = `${currentUrl}/blog/${post.slug || 'preview'}`;
                        navigator.clipboard.writeText(previewUrl);
                        toast({
                          title: "Copied!",
                          description: "Preview URL copied to clipboard"
                        });
                      }}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Copy Preview URL
                    </Button>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Auto-save drafts</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Enable SEO hints</span>
                        <Switch 
                          checked={showSEOPanel}
                          onCheckedChange={setShowSEOPanel}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Action Buttons */}
              <div className="md:hidden sticky bottom-4 bg-white p-4 border-t rounded-t-lg shadow-lg">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={saveDraft}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    onClick={publishPost}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    Publish
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">{post.title || 'Untitled Post'}</h1>
                {post.category && (
                  <Badge variant="outline" className="mb-4">{post.category}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {post.featured_image && (
                <img 
                  src={post.featured_image} 
                  alt="Featured"
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              <div className="prose max-w-none">
                <div 
                  dangerouslySetInnerHTML={{
                    __html: post.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\n/g, '<br />')
                  }}
                />
              </div>
              {post.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">#{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BlogEditor;