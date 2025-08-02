
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Clock, ArrowLeft, Share2, Heart, Bookmark, Loader2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { blogPosts as fallbackPosts } from '@/data/blogData';
import BlogPost from '@/components/BlogPost';
import { Comments } from '@/components/Comments';
import BlockEditor, { Block } from '@/components/BlockEditor';
import GoogleAd from '@/components/GoogleAd';
import { fetchBlogPost, fetchBlogPostsByCategory } from '@/services/blogService';
import { BlogPost as BlogPostType } from '@/types/blog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const BlogPostDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user, userRole, username } = useAuth();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      loadPost(id);
    }
  }, [id]);

  const loadPost = async (postId: string) => {
    try {
      setLoading(true);
      setNotFound(false);

      // Try to fetch from database first
      let postData = await fetchBlogPost(postId);
      
      // If not found in database, try fallback data
      if (!postData) {
        const fallbackPost = fallbackPosts.find(p => p.id === parseInt(postId));
        if (fallbackPost) {
          postData = fallbackPost;
        } else {
          setNotFound(true);
          return;
        }
      }

      setPost(postData);

      // Load related posts from the same category
      if (postData.category) {
        try {
          const categoryPosts = await fetchBlogPostsByCategory(postData.category);
          const related = categoryPosts
            .filter(p => p.id !== postData.id)
            .slice(0, 3);
          setRelatedPosts(related);
        } catch (error) {
          // Use fallback for related posts
          const related = fallbackPosts
            .filter(p => p.id !== postData.id && p.category === postData.category)
            .slice(0, 3);
          setRelatedPosts(related);
        }
      }
    } catch (error) {
      console.error('Error loading post:', error);
      toast({
        title: "Error",
        description: "Failed to load the blog post. Please try again.",
        variant: "destructive"
      });
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link to="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Posts
              </Button>
            </Link>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (notFound || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Posts
            </Button>
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Image */}
        <div className="relative mb-8 rounded-lg overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover"
          />
          <Badge className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-700">
            {post.category}
          </Badge>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-900">{post.author.name}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {user && post && (
                // Check if current user can edit this post
                (post.author_id && user.id === post.author_id) ||
                (post.author_username && username === post.author_username) ||
                userRole === 'editor' ||
                username === 'nanopro'
              ) && (
                <Link to={`/edit/${post.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-1" />
                Like
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8 font-medium leading-relaxed">
            {post.excerpt}
          </p>
          
          {/* Render block content if available, otherwise fall back to static content */}
          {post.content && (() => {
            try {
              const blocks: Block[] = JSON.parse(post.content);
              return (
                <BlockEditor
                  blocks={blocks}
                  onChange={() => {}}
                  readOnly={true}
                />
              );
            } catch {
              // Fall back to rendering as plain text if not valid JSON
              return (
                <div className="space-y-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>
              );
            }
          })() || (
            // Default content for legacy posts without content
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Insights</h2>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              
              <blockquote className="border-l-4 border-blue-500 pl-6 py-2 bg-blue-50 rounded-r-lg my-8">
                <p className="text-lg italic text-gray-700">
                  "The best way to predict the future is to create it yourself."
                </p>
              </blockquote>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Implementation Details</h2>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>Nemo enim ipsam voluptatem quia voluptas sit aspernatur</li>
                <li>Neque porro quisquam est, qui dolorem ipsum</li>
                <li>Ut enim ad minima veniam, quis nostrum exercitationem</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Conclusion</h2>
              <p>
                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
              </p>
            </div>
          )}
        </div>

        {/* Ad - After content, before author bio */}
        <div className="my-8">
          <GoogleAd slot="rectangle" className="flex justify-center" />
        </div>

        {/* Author Bio */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <CardContent className="p-8">
            <div className="flex items-start space-x-4">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{post.author.name}</h3>
                <p className="text-gray-600 mb-4">
                  {post.author.bio || "Passionate writer and technology enthusiast sharing insights on modern development practices and industry trends."}
                </p>
                <Button variant="outline">Follow Author</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="mt-12">
          <Comments blogPostId={post.id.toString()} />
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Related Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <BlogPost key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
            
            {/* Ad - After related posts */}
            <div className="mt-12">
              <GoogleAd slot="banner" className="flex justify-center" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPostDetail;
