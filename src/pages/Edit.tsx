import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PostEditor from '@/components/PostEditor';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { fetchBlogPost, fetchBlogPostWithDbId, updateBlogPost } from '@/services/blogService';
import { BlogPost as BlogPostType } from '@/types/blog';

const Edit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole, username } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [originalPostId, setOriginalPostId] = useState<string | null>(null); // Store the original UUID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (id) {
      loadPost(id);
    }
  }, [id, user, navigate]);

  const loadPost = async (postId: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchBlogPostWithDbId(postId);
      
      if (!result) {
        setError('Post not found');
        return;
      }

      const { post: postData, dbId } = result;
      setOriginalPostId(dbId); // Store the original database UUID

      // Check if user has permission to edit this post
      const canEdit = user && (
        // User is the author AND has editor role
        ((postData.author_id === user.id || postData.author_username === username) && userRole === 'editor') ||
        // Or user is nanopro or admin
        username === 'nanopro' ||
        userRole === 'admin'
      );

      if (!canEdit) {
        setError('You do not have permission to edit this post');
        return;
      }

      setPost(postData);
      setShowEditor(true);
    } catch (error) {
      console.error('Error loading post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (postData: any) => {
    try {
      if (!originalPostId) throw new Error('No post ID provided');
      
      console.log('Saving post with database ID:', originalPostId);
      console.log('Post data:', postData);
      
      // Update the post using the original database UUID
      await updateBlogPost(originalPostId, postData);
      
      toast({
        title: "Post updated!",
        description: "Your changes have been saved successfully.",
      });
      
      // Navigate back to the post
      navigate(`/post/${id}`);
    } catch (error) {
      console.error('Error updating post:', error);
      throw error; // Re-throw to let PostEditor handle the error display
    }
  };

  const handleClose = () => {
    navigate(`/post/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading post...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The post you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PostEditor
        isOpen={showEditor}
        onClose={handleClose}
        onSave={handleSave}
        initialPost={{
          id: originalPostId, // Use the original database UUID
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          tags: post.tags,
          featured_image: post.image
        }}
        mode="edit"
      />
    </>
  );
};

export default Edit;
