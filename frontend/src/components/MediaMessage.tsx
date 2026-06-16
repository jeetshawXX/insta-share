import { useState } from 'react';
import { Download, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface MediaMessageProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  fileName?: string;
  fileSize?: number;
  content?: string;
}

/**
 * Component for displaying image/video messages
 */
export function MediaMessage({ mediaUrl, mediaType, fileName, fileSize, content }: MediaMessageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = async () => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || `download.${mediaType === 'image' ? 'jpg' : 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <>
      <div className="relative group max-w-sm">
        {mediaType === 'image' ? (
          <div className="relative rounded-lg overflow-hidden bg-muted">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            <img
              src={mediaUrl}
              alt={fileName || 'Image'}
              className={cn(
                'max-w-full max-h-[250px] w-auto h-auto rounded-lg cursor-pointer transition-opacity object-cover',
                isLoading ? 'opacity-0' : 'opacity-100'
              )}
              onLoad={() => setIsLoading(false)}
              onClick={() => setIsFullscreen(true)}
              loading="lazy"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden bg-muted">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            <video
              src={mediaUrl}
              controls
              className="max-w-full max-h-[250px] h-auto rounded-lg"
              onLoadedData={() => setIsLoading(false)}
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Caption */}
        {content && (
          <div className="mt-2 text-sm text-foreground">
            {content}
          </div>
        )}
        
        {/* File info */}
        {(fileName || fileSize) && (
          <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
            {fileName && <span className="truncate max-w-[200px]">{fileName}</span>}
            {fileSize && <span>• {formatFileSize(fileSize)}</span>}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && mediaType === 'image' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-4 left-4 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
            >
              <Download className="h-5 w-5" />
            </Button>
            <img
              src={mediaUrl}
              alt={fileName || 'Image'}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
