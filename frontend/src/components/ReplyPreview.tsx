import { X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ReplyPreviewProps {
  userName: string;
  userColor: string;
  content: string;
  onCancel: () => void;
  isEdit?: boolean;
}

/**
 * WhatsApp-style reply/edit preview component
 * Shows above the chat composer when replying to or editing a message
 */
export function ReplyPreview({ userName, userColor, content, onCancel, isEdit = false }: ReplyPreviewProps) {
  // Truncate content to 2 lines max
  const truncatedContent = content.length > 100 ? content.substring(0, 100) + '...' : content;

  return (
    <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm px-4 py-2">
      <div className="flex items-start gap-2">
        {/* Colored left border indicator */}
        <div
          className="w-1 rounded-full self-stretch flex-shrink-0"
          style={{ backgroundColor: userColor }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold" style={{ color: userColor }}>
              {isEdit ? 'Editing message' : `Replying to ${userName}`}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate whitespace-pre-wrap line-clamp-2">
            {truncatedContent}
          </p>
        </div>

        {/* Cancel button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-7 w-7 p-0 rounded-full flex-shrink-0 hover:bg-destructive/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
