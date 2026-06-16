import { motion } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected';
}

/**
 * Connection status indicator
 */
export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const config = {
    connected: {
      icon: Wifi,
      text: 'Connected',
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    connecting: {
      icon: AlertCircle,
      text: 'Connecting...',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    disconnected: {
      icon: WifiOff,
      text: 'Disconnected',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  };

  const { icon: Icon, text, color, bgColor } = config[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass flex items-center gap-2 px-3 py-1.5 rounded-full ${bgColor} shadow-sm `}
    >
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-sm font-medium ${color}`}>{text}</span>
      
     
    </motion.div>
  );
}
