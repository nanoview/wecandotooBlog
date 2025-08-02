import { Link } from 'react-router-dom';
import { CalendarDays, Clock, User, ChevronRight, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BlogPost as BlogPostType } from '@/types/blog';
import { useAuth } from '@/hooks/useAuth';

interface BlogPostProps {
  post: BlogPostType;
}

const BlogPost = ({ post }: BlogPostProps) => {
  const { user, userRole, username } = useAuth();

  // Check if current user can edit this post
  const canEdit = user && (
    // User is the author of the post
    (post.author_id && user.id === post.author_id) ||
    (post.author_username && username === post.author_username) ||
    // User has editor role or is nanopro
    userRole === 'editor' ||
    username === 'nanopro'
  );

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Link to={post.slug ? `/${post.slug}` : `/post/${post.id}`}>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                {post.title}
              </h2>
            </Link>
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CalendarDays className="w-3 h-3" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{post.readTime}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <Link to={`/edit/${post.id}`}>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-700 p-1 h-8">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <Link to={post.slug ? `/${post.slug}` : `/post/${post.id}`}>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0">
                  Read More <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogPost;
