import { useEffect, useCallback } from 'react';
import { uploadImage } from '@/services/imageUploadService';

/**
 * Hook to automatically upload blob images to server and replace blob URLs
 * This prevents the "Not allowed to load local resource: blob:" errors
 */
export const useAutoImageUpload = (
  blocks: any[],
  onBlocksUpdate: (blocks: any[]) => void
) => {
  const uploadBlobImages = useCallback(async () => {
    const updatedBlocks = [...blocks];
    let hasUpdates = false;

    for (let blockIndex = 0; blockIndex < updatedBlocks.length; blockIndex++) {
      const block = updatedBlocks[blockIndex];
      
      // Handle single image blocks
      if (block.type === 'image' && block.content._blobUrl && block.content.file) {
        try {
          console.log('Uploading image from blob URL...');
          const uploadedImage = await uploadImage(block.content.file, {
            title: block.content.alt,
            content: `Image for blog post`
          });
          
          // Replace blob URL with actual uploaded URL
          updatedBlocks[blockIndex] = {
            ...block,
            content: {
              ...block.content,
              url: uploadedImage.url,
              // Remove temporary blob data
              _blobUrl: undefined,
              _cleanup: undefined,
              file: undefined
            }
          };
          
          // Clean up the blob URL
          if (block.content._cleanup) {
            block.content._cleanup();
          }
          
          hasUpdates = true;
          console.log('Image uploaded successfully:', uploadedImage.url);
        } catch (error) {
          console.error('Failed to upload image:', error);
        }
      }
      
      // Handle gallery blocks
      if (block.type === 'gallery' && block.content.images) {
        const updatedImages = [...block.content.images];
        let galleryHasUpdates = false;
        
        for (let imgIndex = 0; imgIndex < updatedImages.length; imgIndex++) {
          const image = updatedImages[imgIndex];
          
          if (image._blobUrl && image.file) {
            try {
              console.log('Uploading gallery image from blob URL...');
              const uploadedImage = await uploadImage(image.file, {
                title: image.alt,
                content: `Gallery image`
              });
              
              // Replace blob URL with actual uploaded URL
              updatedImages[imgIndex] = {
                ...image,
                url: uploadedImage.url,
                // Remove temporary blob data
                _blobUrl: undefined,
                _cleanup: undefined,
                file: undefined
              };
              
              // Clean up the blob URL
              if (image._cleanup) {
                image._cleanup();
              }
              
              galleryHasUpdates = true;
              console.log('Gallery image uploaded successfully:', uploadedImage.url);
            } catch (error) {
              console.error('Failed to upload gallery image:', error);
            }
          }
        }
        
        if (galleryHasUpdates) {
          updatedBlocks[blockIndex] = {
            ...block,
            content: {
              ...block.content,
              images: updatedImages
            }
          };
          hasUpdates = true;
        }
      }
    }

    if (hasUpdates) {
      onBlocksUpdate(updatedBlocks);
    }
  }, [blocks, onBlocksUpdate]);

  // Auto-upload blob images when blocks change
  useEffect(() => {
    const timer = setTimeout(() => {
      uploadBlobImages();
    }, 1000); // Delay to batch multiple changes

    return () => clearTimeout(timer);
  }, [uploadBlobImages]);

  return {
    uploadBlobImages,
    // Manual trigger for immediate upload
    uploadAllPendingImages: uploadBlobImages
  };
};
