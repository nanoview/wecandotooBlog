import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/navigation/Header';
import PostEditor from '@/components/PostEditor';
import { createBlogPost, updateBlogPost } from '@/services/blogService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';


interface PostData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  status: 'draft' | 'published';
}

interface Draft {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const WritePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole, loading: authLoading } = useAuth();
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Don't redirect while still loading authentication state
    if (authLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!user) {
      navigate('/auth');
      return;
    }

    // If user is authenticated but role is still loading, wait
    if (user && userRole === null) {
      return;
    }

    // Redirect if user is not admin or editor
    if (user && userRole !== 'admin' && userRole !== 'editor') {
      toast({
        title: "Access Denied",
        description: "You need admin or editor privileges to access the writing page.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    // Load drafts from localStorage for now
    // In production, you'd fetch from your backend
    if (user && (userRole === 'admin' || userRole === 'editor')) {
      loadDrafts();
    }
  }, [user, userRole, authLoading, navigate, toast]);

  const loadDrafts = () => {
    try {
      const savedDrafts = localStorage.getItem('blog_drafts');
      if (savedDrafts) {
        setDrafts(JSON.parse(savedDrafts));
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };

  const saveDraft = (postData: any) => {
    try {
      const draft = {
        id: editingPost?.id || Date.now().toString(),
        title: postData.title,
        excerpt: postData.excerpt,
        category: postData.category,
        tags: postData.tags,
        content: postData.content, // This will be JSON string from blocks
        featuredImage: postData.featured_image,
        readTime: postData.read_time,
        createdAt: editingPost?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existingDrafts = JSON.parse(localStorage.getItem('blog_drafts') || '[]');
      const draftIndex = existingDrafts.findIndex((d: any) => d.id === draft.id);
      
      if (draftIndex >= 0) {
        existingDrafts[draftIndex] = draft;
      } else {
        existingDrafts.unshift(draft);
      }
      
      localStorage.setItem('blog_drafts', JSON.stringify(existingDrafts));
      loadDrafts();
      
      toast({
        title: "Success",
        description: "Draft saved successfully"
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      });
    }
  };

  const publishPost = async (postData: any) => {
    try {
      setLoading(true);
      
      if (editingPost?.isExisting) {
        // Update existing post
        await updateBlogPost(editingPost.id, postData);
      } else {
        // Create new post
        await createBlogPost(postData);
      }

      // Remove from drafts if it was a draft
      if (editingPost?.id) {
        const existingDrafts = JSON.parse(localStorage.getItem('blog_drafts') || '[]');
        const filteredDrafts = existingDrafts.filter((d: any) => d.id !== editingPost.id);
        localStorage.setItem('blog_drafts', JSON.stringify(filteredDrafts));
        loadDrafts();
      }

      toast({
        title: "Success",
        description: "Post published successfully!"
      });
      
      // Navigate to the home page to see the published post
      navigate('/');
    } catch (error: any) {
      console.error('Error publishing post:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to publish post",
        variant: "destructive"
      });
      throw error; // Re-throw so PostEditor can handle it
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (draft?: any) => {
    setEditingPost(draft || null);
    setIsEditorOpen(true);
  };

  const deleteDraft = (draftId: string) => {
    try {
      const existingDrafts = JSON.parse(localStorage.getItem('blog_drafts') || '[]');
      const filteredDrafts = existingDrafts.filter((d: any) => d.id !== draftId);
      localStorage.setItem('blog_drafts', JSON.stringify(filteredDrafts));
      loadDrafts();
      
      toast({
        title: "Success",
        description: "Draft deleted"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete draft",
        variant: "destructive"
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header variant="simple" />
      
      {/* Write Title Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Write</h1>
              <p className="text-gray-600 mt-1">Share your thoughts with the world</p>
            </div>
            <Button 
              onClick={() => openEditor()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => openEditor()}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Post
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Published Posts
                </Button>
              </CardContent>
            </Card>

            {/* Writing Tips */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Writing Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Start with a compelling headline that grabs attention</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Use short paragraphs and bullet points for readability</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Add relevant tags to help readers discover your content</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Include a featured image to make your post more engaging</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Drafts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Your Drafts ({drafts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {drafts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start writing your first post and save it as a draft
                    </p>
                    <Button onClick={() => openEditor()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Post
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {drafts.map((draft) => (
                      <div
                        key={draft.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              {draft.title || 'Untitled Draft'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {draft.excerpt || 'No excerpt available...'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Updated {new Date(draft.updatedAt).toLocaleDateString()}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {draft.category}
                              </Badge>
                              {draft.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {draft.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      #{tag}
                                    </Badge>
                                  ))}
                                  {draft.tags.length > 2 && (
                                    <span className="text-xs">+{draft.tags.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditor(draft)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteDraft(draft.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Post Editor Modal */}
      <PostEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPost(null);
        }}
        onSave={async (postData) => {
          if (postData.status === 'published') {
            await publishPost(postData);
          } else {
            saveDraft(postData);
          }
        }}
        initialPost={editingPost ? {
          title: editingPost.title || '',
          content: editingPost.content || '',
          excerpt: editingPost.excerpt || '',
          category: editingPost.category || 'Technology',
          tags: editingPost.tags || [],
          featured_image: editingPost.featuredImage || '',
          read_time: editingPost.readTime || 5,
          id: editingPost.id
        } : undefined}
        mode={editingPost?.isExisting ? 'edit' : 'create'}
      />
    </div>
  );
};

export default WritePage;
