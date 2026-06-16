import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Message } from '@/lib/socket';
import { Copy, Download, Heart, Reply, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/roomCode';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface CodeSnippetProps {
  message: Message;
  isOwn?: boolean;
  onReact?: (id: string, emoji: string) => void;
  onReply?: (message: Message) => void;
}

/**
 * Code snippet component with syntax highlighting
 */
export function CodeSnippet({ message, isOwn = false, onReact, onReply }: CodeSnippetProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [reactedEmojis, setReactedEmojis] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [message.content]);

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      toast.success('Code copied!');
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

  const handleDownload = () => {
    const ext = message.language || 'txt';
    const blob = new Blob([message.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snippet-${message.id}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code downloaded!');
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const languageLabel = message.language || 'plaintext';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn('flex gap-3 group w-full max-w-4xl', isOwn && 'flex-row-reverse ml-auto')}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm"
        style={{ backgroundColor: message.userColor }}
      >
        {message.userName.slice(0, 2).toUpperCase()}
      </div>

      {/* Code card */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold">{message.userName}</span>
            <span>•</span>
            <span>{formatTime(message.timestamp)}</span>
            {message.editedAt && (
              <>
                <span>•</span>
                <span className="italic">(edited)</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="glass px-2 py-0.5 rounded text-xs font-mono text-primary">
              {languageLabel}
            </span>
            
            {/* Three-dot menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                  Copy Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReact('❤️')}>
                  <Heart className="w-4 h-4 mr-2" />
                  Like
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Code block */}
        <div className="glass-strong rounded-lg overflow-hidden">
          {/* Reply preview if this is a reply */}
          {message.replyToId && message.replyToContent && message.replyToUserName && (
            <div className="mx-4 mt-4 mb-2 pl-2 border-l-2 border-primary/50 bg-primary/5 rounded-r-md p-1.5">
              <div className="text-xs font-semibold text-primary mb-0.5">
                {message.replyToUserName}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {message.replyToContent}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/20">
            <span className="text-xs text-muted-foreground font-mono">snippet.{languageLabel}</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 hover:bg-primary/10"
              >
                <Copy className="w-3 h-3" />
                <span className="ml-1 text-xs">Copy</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-7 px-2 hover:bg-primary/10"
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <pre className="!bg-transparent !m-0 p-4">
              <code
                ref={codeRef}
                className={cn(`language-${message.language || 'javascript'}`, '!text-sm')}
              >
                {message.content}
              </code>
            </pre>
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex gap-1 px-2">
            {Object.entries(message.reactions).map(([emoji, count]) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReact(emoji)}
                className="glass px-2 py-0.5 rounded-full text-xs flex items-center gap-1 hover:bg-primary/10 transition-smooth"
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
