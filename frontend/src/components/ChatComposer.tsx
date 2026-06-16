import { useState, useRef, KeyboardEvent, ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Code, Smile, Paperclip } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { ReplyPreview } from './ReplyPreview';
import { Message } from '@/lib/socket';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { cn } from '@/lib/utils';

interface ChatComposerProps {
  onSendMessage: (content: string, type: 'text' | 'code', language?: string, replyToId?: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  fileUpload?: ReactNode;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
}

const LANGUAGES = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
];

const EMOJIS = ['👍', '❤️', '🔥', '🚀', '💯', '🎉', '😂', '🤔'];

/**
 * Chat composer with file drop, code mode, and emoji picker
 */
export function ChatComposer({ 
  onSendMessage, 
  onEditMessage,
  onTyping, 
  disabled = false, 
  fileUpload,
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
}: ChatComposerProps) {
  const [message, setMessage] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [language, setLanguage] = useState('typescript');
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Set message content when editing
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
      setIsCodeMode(editingMessage.type === 'code');
      if (editingMessage.language) {
        setLanguage(editingMessage.language);
      }
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  // Handle typing events
  const handleMessageChange = (value: string) => {
    const maxChars = isCodeMode ? 10000 : 2000;
    setMessage(value.slice(0, maxChars));
    
    // Notify parent component about typing
    if (onTyping && !editingMessage) { // Don't send typing indicator when editing
      if (value.length > 0) {
        onTyping(true);
      } else {
        onTyping(false);
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setMessage(content);
          setIsCodeMode(true);
          
          // Detect language from file extension
          const ext = file.name.split('.').pop()?.toLowerCase();
          const langMap: Record<string, string> = {
            'ts': 'typescript',
            'tsx': 'typescript',
            'js': 'javascript',
            'jsx': 'javascript',
            'py': 'python',
            'java': 'java',
            'rs': 'rust',
            'go': 'go',
            'cpp': 'cpp',
            'cs': 'csharp',
          };
          if (ext && langMap[ext]) {
            setLanguage(langMap[ext]);
          }
          
          toast.success('File loaded!');
        };
        reader.readAsText(file);
      }
    },
    multiple: false,
    noClick: false,
  });

  const handleSend = () => {
    if (!message.trim()) return;
    
    if (editingMessage && onEditMessage) {
      // Edit existing message
      onEditMessage(editingMessage.id, message);
      onCancelEdit?.();
    } else {
      // Send new message (with optional reply)
      onSendMessage(
        message, 
        isCodeMode ? 'code' : 'text', 
        isCodeMode ? language : undefined,
        replyingTo?.id
      );
      onCancelReply?.();
    }
    
    setMessage('');
    setIsCodeMode(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isCodeMode) {
      e.preventDefault();
      handleSend();
    }
    
    // ESC to cancel reply or edit
    if (e.key === 'Escape') {
      if (editingMessage) {
        onCancelEdit?.();
        setMessage('');
      } else if (replyingTo) {
        onCancelReply?.();
      }
    }
  };

  const insertEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  const charCount = message.length;
  const maxChars = isCodeMode ? 10000 : 2000;

  return (
    <div className="p-4">
      {/* Reply or Edit Preview */}
      {replyingTo && onCancelReply && (
        <ReplyPreview
          userName={replyingTo.userName}
          userColor={replyingTo.userColor}
          content={replyingTo.content}
          onCancel={onCancelReply}
          isEdit={false}
        />
      )}
      {editingMessage && onCancelEdit && (
        <ReplyPreview
          userName="your message"
          userColor={editingMessage.userColor}
          content={editingMessage.content}
          onCancel={() => {
            onCancelEdit();
            setMessage('');
          }}
          isEdit={true}
        />
      )}

      <div
        {...getRootProps({ onClick: (e) => e.stopPropagation() })}
        className={cn(
          'relative',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        <input {...getInputProps()} />
        
        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg z-10">
            <div className="text-center">
              <Paperclip className="w-12 h-12 mx-auto mb-2 text-primary animate-bounce" />
              <p className="font-semibold text-primary">Drop code file here</p>
            </div>
          </div>
        )}

        {/* Mode selector */}
        <div className="flex items-center gap-2 mb-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCodeMode(!isCodeMode)}
            className={cn(
              'h-10 border-border/50 hover:bg-primary/10',
              isCodeMode && 'bg-primary/10 text-primary'
            )}
          >
            <Code className="w-4 h-4 mr-1" />
            {isCodeMode ? 'Code Mode' : 'Text Mode'}
          </Button>

          {isCodeMode && (
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[150px] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {fileUpload && (
            <div className="flex-shrink-0">
              {fileUpload}
            </div>
          )}

          <div className="ml-auto text-xs text-muted-foreground">
            {charCount}/{maxChars}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isCodeMode ? 'Paste or drop code here...' : 'Type a message... (Shift+Enter for new line)'}
            rows={1}
            className={cn(
              'resize-none border-0 focus-visible:ring-0 bg-transparent max-h-[300px] pr-28 overflow-y-hidden',
              isCodeMode && 'font-mono text-sm'
            )}
            style={{ height: 'auto', minHeight: '2.5rem' }}
            disabled={disabled}
          />

          {/* Actions - Inside Textarea */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowEmoji(!showEmoji)}
                className="h-8 w-8 p-0"
              >
                <Smile className="w-5 h-5" />
              </Button>

              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full right-0 mb-2 glass-strong p-2 rounded-lg flex gap-1 shadow-lg z-50"
                >
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="hover:bg-primary/10 rounded p-1 transition-smooth text-xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSend}
                disabled={!message.trim() || disabled}
                size="sm"
                className={cn(
                  "h-8 px-3 gap-1.5",
                  editingMessage 
                    ? "bg-blue-600 hover:bg-blue-500 text-white" 
                    : "bg-green-600 hover:bg-green-500 text-white"
                )}
              >
                <Send className="w-4 h-4" />
                <span className="text-sm font-medium">{editingMessage ? 'Update' : 'Send'}</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
