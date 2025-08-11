import React, { useState, useEffect } from 'react';
import { Share2, Heart, Bookmark, MessageCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SocialSharing from '@/components/SocialSharing';
import { useToast } from '@/hooks/use-toast';

interface SocialActionBarProps {
  post: any;
  isVisible?: boolean;
  position?: 'top' | 'bottom' | 'floating';
  showStats?: boolean;
  className?: string;
}

export const SocialActionBar: React.FC<SocialActionBarProps> = ({
  post,
  isVisible = true,
  position = 'bottom',
  showStats = true,
  className = ''
}) => {
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { toast } = useToast();

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    
    toast({
      title: isLiked ? "Removed from likes" : "Added to likes",
      description: isLiked ? "Post removed from your likes" : "Thanks for liking this post!",
    });
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: isBookmarked ? "Post removed from your bookmarks" : "Post saved to your bookmarks!",
    });
  };

  const handleComment = () => {
    // Scroll to comments section
    const commentsSection = document.getElementById('comments');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  const baseClasses = "bg-white/95 backdrop-blur-sm border shadow-lg rounded-lg p-3";
  
  const positionClasses = {
    top: "sticky top-4 z-30 mb-6",
    bottom: "sticky bottom-4 z-30 mt-6",
    floating: "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
  };

  return (
    <div className={`${baseClasses} ${positionClasses[position]} ${className}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Post Stats */}
        {showStats && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{post.views || 0} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{likes} likes</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments || 0} comments</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Like Button */}
          <Button
            variant={isLiked ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
            className={isLiked ? "bg-red-500 hover:bg-red-600" : ""}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span className="ml-1 hidden sm:inline">{likes}</span>
          </Button>

          {/* Bookmark Button */}
          <Button
            variant={isBookmarked ? "default" : "outline"}
            size="sm"
            onClick={handleBookmark}
            className={isBookmarked ? "bg-blue-500 hover:bg-blue-600" : ""}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            <span className="ml-1 hidden sm:inline">Save</span>
          </Button>

          {/* Comment Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleComment}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Comment</span>
          </Button>

          {/* Share Button */}
          <SocialSharing
            post={post}
            variant="compact"
            showLabel={false}
            className="hidden sm:inline-flex"
          />

          {/* Mobile Share */}
          <Button
            variant="outline"
            size="sm"
            className="sm:hidden"
            onClick={() => setShowShareDialog(true)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Reading Progress (optional) */}
      {position === 'top' && (
        <div className="mt-3">
          <ReadingProgress />
        </div>
      )}
    </div>
  );
};

// Reading Progress Component
const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default SocialActionBar;
