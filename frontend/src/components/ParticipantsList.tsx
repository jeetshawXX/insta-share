import { motion, AnimatePresence } from 'framer-motion';
import { Participant } from '@/lib/socket';
import { Users } from 'lucide-react';

interface ParticipantsListProps {
  participants: Participant[];
  currentUserId?: string;
}

/**
 * Participants list showing active users in the room
 */
export function ParticipantsList({ participants, currentUserId }: ParticipantsListProps) {
  return (
    <div className="glass-strong rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">
          Participants <span className="text-muted-foreground text-sm">({participants.length})</span>
        </h3>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {participants.map((participant) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass flex items-center gap-3 p-3 rounded-lg hover:bg-card/50 transition-smooth"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: participant.color }}
              >
                {participant.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {participant.name}
                  {participant.id === currentUserId && (
                    <span className="text-muted-foreground ml-1.5">(You)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {participant.isTyping ? 'typing...' : 'online'}
                </p>
              </div>

              {/* Status indicator */}
              <div className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
