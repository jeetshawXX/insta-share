/**
 * WebSocket client for instashare using Socket.IO
 * 
 * This module handles real-time communication with the backend server.
 * It provides type-safe WebSocket connections for chat rooms.
 * 
 * @example
 * ```typescript
 * const socket = createSocketConnection('ROOM123', 'JohnDoe');
 * socket.on('message', (msg) => console.log(msg));
 * socket.send({ type: 'message', data: { content: 'Hello!' } });
 * ```
 */

import { io, Socket } from 'socket.io-client';

export interface Message {
  id: string;
  type: 'text' | 'code' | 'media';
  content: string;
  language?: string; // For code snippets
  mediaUrl?: string; // For images/videos
  mediaType?: 'image' | 'video'; // Type of media
  fileName?: string; // Original filename
  fileSize?: number; // File size in bytes
  userId: string;
  userName: string;
  userColor: string;
  timestamp: number;
  reactions?: Record<string, number>;
  editedAt?: number; // Timestamp when message was last edited
  replyToId?: string; // ID of message being replied to
  replyToContent?: string; // Content preview of replied message
  replyToUserName?: string; // Name of user who sent the replied message
}

export interface Participant {
  id: string;
  name: string;
  color: string;
  joinedAt: number;
  isTyping?: boolean;
}

export interface SocketEvent {
  type: 'message' | 'typing' | 'join' | 'leave' | 'reaction' | 'delete_message' | 'set_room_password' | 'edit_message';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface SocketConnection {
  send: (event: SocketEvent) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: (event: string, handler: (data: any) => void) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off: (event: string, handler: (data: any) => void) => void;
  disconnect: () => void;
  isConnected: () => boolean;
}

/**
 * Get or create persistent user ID
 * This ensures messages show on correct side even after reconnection
 */
function getPersistentUserId(): string {
  let userId = localStorage.getItem('persistentUserId');
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('persistentUserId', userId);
    console.log('🆔 Generated new persistent user ID:', userId);
  }
  return userId;
}

/**
 * Create a Socket.IO connection to a room
 * 
 * This function establishes a WebSocket connection to the backend server
 * and sets up automatic reconnection with exponential backoff.
 * 
 * @param roomCode - The room code to join (e.g., "ABC123")
 * @param userName - The user's display name
 * @param password - Optional room password for protected rooms
 * @returns SocketConnection instance with event handlers
 */
export function createSocketConnection(
  roomCode: string,
  userName: string,
  password?: string
): SocketConnection {
  // Get WebSocket URL from environment variable or use default
  const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
  
  // Get or create persistent user ID
  const userId = getPersistentUserId();
  
  console.log(`🔌 Connecting to WebSocket: ${WS_URL}`);
  console.log(`📍 Room: ${roomCode}, User: ${userName}, ID: ${userId}`);

  // Create Socket.IO connection with options
  const socket: Socket = io(WS_URL, {
    transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
    reconnection: true, // Enable automatic reconnection
    reconnectionAttempts: 5, // Try 5 times before giving up
    reconnectionDelay: 1000, // Start with 1 second delay
    reconnectionDelayMax: 5000, // Max 5 seconds between attempts
    timeout: 10000, // Connection timeout
    query: {
      roomCode,
      userName,
      userId, // Send persistent user ID to backend
      ...(password && { roomPassword: password }), // Include password if provided
    },
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('✅ Socket.IO connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket.IO disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
  });

  socket.on('reconnect_failed', () => {
    console.error('❌ Reconnection failed after all attempts');
  });

  // Return connection interface
  return {
    send: (event: SocketEvent) => {
      if (socket.connected) {
        console.log('📤 Sending event:', event.type);
        socket.emit(event.type, event.data);
      } else {
        console.warn('⚠️  Cannot send - socket not connected');
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on: (event: string, handler: (data: any) => void) => {
      socket.on(event, handler);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    off: (event: string, handler: (data: any) => void) => {
      socket.off(event, handler);
    },

    disconnect: () => {
      console.log('🔌 Disconnecting socket');
      socket.disconnect();
    },

    isConnected: () => {
      return socket.connected;
    },
  };
}

/**
 * Mock mode flag - set to false to use real WebSocket connection
 * Set VITE_MOCK_MODE=true in .env to enable mock mode
 */
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true' || false;

