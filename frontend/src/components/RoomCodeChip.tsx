import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatRoomCode, copyToClipboard, getRoomUrl } from '@/lib/roomCode';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RoomCodeChipProps {
  roomCode: string;
  className?: string;
  showUrl?: boolean;
}

/**
 * Animated chip component displaying room code with copy functionality
 */
export function RoomCodeChip({ roomCode, className, showUrl = false }: RoomCodeChipProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = showUrl ? getRoomUrl(roomCode) : roomCode;
    const success = await copyToClipboard(textToCopy);
    
    if (success) {
      setCopied(true);
      toast.success(showUrl ? 'Room link copied!' : 'Room code copied!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy');
    }
  };

  return (
    <motion.button
      onClick={handleCopy}
      className={cn(
        'glass group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg',
        'hover:bg-card/50 transition-smooth cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-primary/50',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="font-mono text-lg font-bold tracking-wider text-gradient-primary">
        {formatRoomCode(roomCode)}
      </span>
      
      <motion.div
        initial={false}
        animate={{ rotate: copied ? 360 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {copied ? (
          <Check className="w-4 h-4 text-primary" />
        ) : (
          <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-smooth" />
        )}
      </motion.div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-lg bg-gradient-primary opacity-0 group-hover:opacity-10 transition-smooth -z-10" />
    </motion.button>
  );
}
