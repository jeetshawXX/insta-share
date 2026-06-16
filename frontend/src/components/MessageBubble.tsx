import { motion } from 'framer-motion';
import { Message } from '@/lib/socket';
import { Copy, Heart, Trash2, MoreVertical, Reply, Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/roomCode';
import { cn } from '@/lib/utils';
import { MediaMessage } from './MediaMessage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

interface MessageBubbleProps {
  message: Message;
  isOwn?: boolean;
  currentUserId?: string;
  onDelete?: (id: string) => void;
  onReact?: (id: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
}

/**
 * Message bubble component with animations and actions
 */
export function MessageBubble({ message, isOwn = false, currentUserId, onDelete, onReact, onReply, onEdit }: MessageBubbleProps) {
  const [reactedEmojis, setReactedEmojis] = useState<Set<string>>(new Set());

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      toast.success('Message copied!');
    }
  };

  const handleReact = (emoji: string) => {
    // Check if user already reacted with this emoji
    const reactionKey = `${message.id}-${emoji}`;
    const hasReacted = reactedEmojis.has(reactionKey);
    
    if (hasReacted) {
      toast.info('You already Liked this message');
      return;
    }

    // Add reaction
    onReact?.(message.id, emoji);
    setReactedEmojis(prev => new Set([...prev, reactionKey]));
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-2 group', isOwn && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs"
        style={{ backgroundColor: message.userColor }}
      >
        {(message.userName || 'Unknown').slice(0, 2).toUpperCase()}
      </div>

      {/* Message content */}
      <div className={cn('flex flex-col gap-1 max-w-[70%] relative', isOwn && 'items-end')}>
        <div className="flex items-center gap-2 text-[10px]">
          <span
            className="font-bold text-xs"
            style={{ color: message.userColor }}
          >
            {message.userName || 'Unknown'}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{formatTime(message.timestamp)}</span>
        </div>

        <div className={cn('flex items-start gap-1', isOwn && 'flex-row-reverse')}>
          <div
            className={cn(
              message.type === 'media' ? '' : 'glass-strong px-3 py-2 rounded-2xl',
              isOwn && message.type !== 'media' ? 'rounded-tr-sm' : message.type !== 'media' ? 'rounded-tl-sm' : ''
            )}
          >
            {/* Reply preview if this is a reply */}
            {message.replyToId && message.replyToContent && message.replyToUserName && (
              <div className="mb-2 pl-2 border-l-2 border-primary/50 bg-primary/5 rounded-r-md p-1.5">
                <div className="text-xs font-semibold text-primary mb-0.5">
                  {message.replyToUserName}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {message.replyToContent}
                </div>
              </div>
            )}

            {message.type === 'media' && message.mediaUrl ? (
              <MediaMessage
                mediaUrl={message.mediaUrl}
                mediaType={message.mediaType || 'image'}
                fileName={message.fileName}
                fileSize={message.fileSize}
                content={message.content}
              />
            ) : (
              <div>
                <p className="text-base text-foreground whitespace-pre-wrap break-words">{message.content}</p>
                {message.editedAt && (
                  <span className="text-[10px] text-muted-foreground italic ml-2">
                    (edited)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Three-dot menu - beside message bubble */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1"
              >
                <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwn ? "end" : "start"} side="bottom">
              <DropdownMenuItem onClick={() => onReply?.(message)}>
                <Reply className="w-4 h-4 mr-2" />
                Reply
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleReact('❤️')}>
                <Heart className="w-4 h-4 mr-2" />
                Like
              </DropdownMenuItem>
              {isOwn && (
                <>
                  <DropdownMenuSeparator />
                  {message.type !== 'media' && onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(message)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={() => onDelete(message.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex gap-1 px-1">
            {Object.entries(message.reactions).map(([emoji, count]) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReact(emoji)}
                className="glass px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 hover:bg-primary/10 transition-smooth"
              >
                <span>{emoji}</span>
                <span className="text-muted-foreground">{count}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
