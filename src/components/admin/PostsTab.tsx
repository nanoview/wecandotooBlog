import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Edit, Trash2, Plus, Eye, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import SocialSharing from '@/components/SocialSharing';

export default function PostsTab({ blogPosts, togglePostStatus, deleteBlogPost }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  
  // Paginate posts
  const { paginatedPosts, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    return {
      paginatedPosts: blogPosts.slice(startIndex, endIndex),
      totalPages: Math.ceil(blogPosts.length / postsPerPage)
    };
  }, [blogPosts, currentPage, postsPerPage]);
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">Blog Posts Management</h2>
        <Button onClick={() => navigate('/write')} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">Create New Post</span>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            All Blog Posts
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage, edit, and delete your blog posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {paginatedPosts.map((post) => (
              <div key={post.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 gap-3">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="font-medium text-sm sm:text-lg">{post.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                        {post.status}
                      </Badge>
                      {post.category && (
                        <Badge variant="outline" className="text-xs">{post.category}</Badge>
                      )}
                    </div>
                  </div>
                  {post.excerpt && (
                    <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                    <span>By {post.profiles?.display_name || 'Unknown'}</span>
                    <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                    {post.published_at && (
                      <span>Published: {new Date(post.published_at).toLocaleDateString()}</span>
                    )}
                    <span className="font-mono text-blue-600">/{post.slug}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1 w-full lg:w-auto lg:ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/${post.slug}`)}
                    className="flex items-center gap-1 flex-1 sm:flex-none text-xs h-8"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/edit/${post.slug}`)}
                    className="flex items-center gap-1 flex-1 sm:flex-none text-xs h-8"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    Edit
                  </Button>
                  
                  {/* Social Sharing - Only for published posts */}
                  {post.status === 'published' && (
                    <SocialSharing
                      post={post}
                      variant="compact"
                      showLabel={false}
                    />
                  )}
                  
                  <Button
                    size="sm"
                    variant={post.status === 'published' ? 'secondary' : 'default'}
                    onClick={() => togglePostStatus(post.id, post.status)}
                    className="flex-1 sm:flex-none text-xs h-8"
                  >
                    {post.status === 'published' ? 'Unpublish' : 'Publish'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" className="flex items-center gap-1 flex-1 sm:flex-none text-xs">
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{post.title}"? This action cannot be undone.
                          This will also delete all comments associated with this post.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteBlogPost(post.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Post
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * postsPerPage) + 1} to {Math.min(currentPage * postsPerPage, blogPosts.length)} of {blogPosts.length} posts
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages)
                    .map((page, index, array) => (
                      <span key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && <span className="px-2">...</span>}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      </span>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}