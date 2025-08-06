import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Edit, Trash2, Plus, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';

export default function PostsTab({ blogPosts, togglePostStatus, deleteBlogPost }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Blog Posts Management</h2>
        <Button onClick={() => navigate('/write')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Post
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            All Blog Posts
          </CardTitle>
          <CardDescription>
            Manage, edit, and delete your blog posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {blogPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-lg">{post.title}</h3>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                      {post.status}
                    </Badge>
                    {post.category && (
                      <Badge variant="outline">{post.category}</Badge>
                    )}
                  </div>
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>By {post.profiles?.display_name || 'Unknown'}</span>
                    <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                    {post.published_at && (
                      <span>Published: {new Date(post.published_at).toLocaleDateString()}</span>
                    )}
                    <span className="font-mono text-blue-600">/{post.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/${post.slug}`)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/edit/${post.slug}`)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={post.status === 'published' ? 'secondary' : 'default'}
                    onClick={() => togglePostStatus(post.id, post.status)}
                  >
                    {post.status === 'published' ? 'Unpublish' : 'Publish'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
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
        </CardContent>
      </Card>
    </div>
  );
}