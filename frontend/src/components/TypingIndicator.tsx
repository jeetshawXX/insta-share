import { motion } from 'framer-motion';
import { Participant } from '@/lib/socket';

interface TypingIndicatorProps {
  typingUsers: Participant[];
}

/**
 * Typing indicator showing who's currently typing
 */
export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.name).join(', ');
  const text =
    typingUsers.length === 1
      ? `${names} is typing...`
      : `${names} are typing...`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
      <span>{text}</span>
    </motion.div>
  );
}
