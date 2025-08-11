import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  socialPlatforms,
  shareToSocial,
  copyShareLink,
  nativeShare,
  isWebShareSupported,
  generateShareData,
  trackShare,
  type ShareData
} from '@/services/socialSharingService';

interface SocialSharingProps {
  post: any;
  variant?: 'compact' | 'full' | 'floating';
  showLabel?: boolean;
  className?: string;
}

export const SocialSharing: React.FC<SocialSharingProps> = ({
  post,
  variant = 'compact',
  showLabel = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareData = generateShareData(post);

  const handlePlatformShare = async (platform: string) => {
    try {
      const success = shareToSocial(platform, shareData);
      if (success) {
        trackShare(platform, post.id);
        toast({
          title: "Shared!",
          description: `Post shared to ${socialPlatforms[platform].name}`,
        });
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Could not share to this platform",
        variant: "destructive"
      });
    }
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    const success = await copyShareLink(shareData.url);
    if (success) {
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Share link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleNativeShare = async () => {
    const success = await nativeShare(shareData);
    if (!success) {
      // Fallback to custom share dialog
      setIsOpen(true);
    } else {
      trackShare('native', post.id);
    }
  };

  // Compact variant - just a share button
  if (variant === 'compact') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={className}
            onClick={isWebShareSupported() ? handleNativeShare : undefined}
          >
            <Share2 className="h-4 w-4" />
            {showLabel && <span className="ml-2">Share</span>}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Share URL */}
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    readOnly
                    value={shareData.url}
                    className="flex-1 px-3 py-2 bg-gray-50 border rounded-md text-sm"
                  />
                  <Button size="sm" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Social Platforms */}
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(socialPlatforms).map(([key, platform]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-3"
                  style={{ borderColor: platform.color + '20' }}
                  onClick={() => handlePlatformShare(key)}
                >
                  <span className="text-lg">{platform.icon}</span>
                  <span className="text-xs">{platform.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Full variant - show all platforms inline
  if (variant === 'full') {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              <h3 className="font-semibold">Share this post</h3>
            </div>
            
            {/* Copy Link */}
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareData.url}
                className="flex-1 px-3 py-2 bg-gray-50 border rounded-md text-sm"
              />
              <Button size="sm" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* Social Platforms Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(socialPlatforms).map(([key, platform]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 justify-start"
                  style={{ borderColor: platform.color + '20' }}
                  onClick={() => handlePlatformShare(key)}
                >
                  <span>{platform.icon}</span>
                  <span className="text-sm">{platform.name}</span>
                </Button>
              ))}
            </div>

            {/* Share Stats (if available) */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>📊 Help others discover this content</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Floating variant - fixed position sharing
  if (variant === 'floating') {
    return (
      <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-40 ${className}`}>
        <div className="flex flex-col gap-2">
          {/* Native share if supported */}
          {isWebShareSupported() && (
            <Button
              size="sm"
              className="w-12 h-12 rounded-full"
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          
          {/* Top platforms */}
          {['twitter', 'facebook', 'linkedin'].map((key) => {
            const platform = socialPlatforms[key];
            return (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className="w-12 h-12 rounded-full"
                style={{ borderColor: platform.color + '40', backgroundColor: platform.color + '10' }}
                onClick={() => handlePlatformShare(key)}
                title={`Share on ${platform.name}`}
              >
                <span>{platform.icon}</span>
              </Button>
            );
          })}

          {/* More options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-12 h-12 rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="left">
              {Object.entries(socialPlatforms)
                .filter(([key]) => !['twitter', 'facebook', 'linkedin'].includes(key))
                .map(([key, platform]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => handlePlatformShare(key)}
                  >
                    <span className="mr-2">{platform.icon}</span>
                    {platform.name}
                  </DropdownMenuItem>
                ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return null;
};

export default SocialSharing;
