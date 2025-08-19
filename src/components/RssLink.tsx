import React from 'react';
import { Rss } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RssLinkProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const RssLink: React.FC<RssLinkProps> = ({ 
  variant = 'outline', 
  size = 'sm',
  className = '' 
}) => {
  const handleRssClick = () => {
    window.open('/feed.xml', '_blank');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRssClick}
      className={`flex items-center gap-2 ${className}`}
      title="Subscribe to RSS feed"
    >
      <Rss className="w-4 h-4" />
      RSS Feed
    </Button>
  );
};

export default RssLink;
