import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { startCleanupJob } from './storage';
import * as db from './database';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Participant interface (for in-memory socket tracking)
interface SocketParticipant {
  socketId: string;
  userId: string;
  name: string;
  color: string;
  roomId: string;
}

// Store active socket connections by socket ID
const activeSockets = new Map<string, SocketParticipant>();

// User color palette
const COLORS = [
  'hsl(180 100% 50%)', // cyan
  'hsl(320 100% 60%)', // magenta
  'hsl(260 80% 65%)',  // purple
  'hsl(40 100% 60%)',  // yellow
  'hsl(140 80% 50%)',  // green
  'hsl(20 100% 60%)',  // orange
  'hsl(200 90% 60%)',  // blue
  'hsl(350 90% 60%)',  // red
];

// Constants from environment
const ROOM_TIMEOUT_HOURS = parseInt(process.env.ROOM_TIMEOUT_HOURS || '3');
const MAX_PARTICIPANTS = parseInt(process.env.MAX_ROOM_PARTICIPANTS || '50');
const MAX_MESSAGE_LENGTH = parseInt(process.env.MAX_MESSAGE_LENGTH || '10000');

/**
 * Clean up inactive rooms periodically from database
 */
setInterval(async () => {
  const cleanedCount = await db.cleanupOldRooms(ROOM_TIMEOUT_HOURS);

  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} inactive room(s) from database`);
  }
}, 60 * 60 * 1000); // Check every hour

/**
 * Socket.IO connection handler
 */
io.on('connection', async (socket) => {
  console.log(`🔌 New connection: ${socket.id}`);

  const roomCode = socket.handshake.query.roomCode as string;
  const userName = socket.handshake.query.userName as string;
  const userId = socket.handshake.query.userId as string;
  const roomPassword = socket.handshake.query.roomPassword as string | undefined;

  // Validate connection parameters
  if (!roomCode || !userName || !userId) {
    console.error(`❌ Missing roomCode, userName, or userId from ${socket.id}`);
    socket.emit('error', { message: 'Missing room code, user name, or user ID' });
    socket.disconnect();
    return;
  }

  // Validate room code format (4-8 alphanumeric characters)
  if (!/^[A-Z0-9]{4,8}$/.test(roomCode)) {
    console.error(`❌ Invalid room code format: ${roomCode}`);
    socket.emit('error', { message: 'Invalid room code format' });
    socket.disconnect();
    return;
  }

  // Check if room exists and verify password
  const existingRoom = await db.getRoomByCode(roomCode);
  
  if (existingRoom) {
    // Room exists, verify password if protected
    const { valid, requiresPassword } = await db.verifyRoomPassword(
      roomCode,
      roomPassword || null
    );

    if (!valid) {
      if (requiresPassword) {
        console.log(`🔒 Password required for room ${roomCode}`);
        socket.emit('password_required', { 
          message: roomPassword ? 'Incorrect password' : 'This room is password protected'
        });
      } else {
        socket.emit('error', { message: 'Room not found' });
      }
      socket.disconnect();
      return;
    }
  }

  // Get or create room in database (only if password is valid or not required)
  const room = existingRoom || await db.getOrCreateRoom(roomCode);
  if (!room) {
    console.error(`❌ Failed to get or create room: ${roomCode}`);
    socket.emit('error', { message: 'Failed to create or join room' });
    socket.disconnect();
    return;
  }

  console.log(`✨ Room ${roomCode} ready (ID: ${room.id})`);

  // Check max participants
  const participantCount = await db.getParticipantCount(room.id);
  if (participantCount >= MAX_PARTICIPANTS) {
    console.error(`❌ Room ${roomCode} is full (${MAX_PARTICIPANTS} participants)`);
    socket.emit('error', { message: 'Room is full' });
    socket.disconnect();
    return;
  }

  // Assign color to user based on user ID hash (consistent color for same user)
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };
  const userColor = COLORS[hashCode(userId) % COLORS.length];
  
  // Add participant to database
  const dbParticipant = await db.addParticipant(
    room.id,
    socket.id,
    userId,
    userName.substring(0, 50), // Limit name length
    userColor
  );

  if (!dbParticipant) {
    console.error(`❌ Failed to add participant: ${userName}`);
    socket.emit('error', { message: 'Failed to join room' });
    socket.disconnect();
    return;
  }

  // Store in active sockets map for quick access
  activeSockets.set(socket.id, {
    socketId: socket.id,
    userId: dbParticipant.user_id,
    name: dbParticipant.name,
    color: dbParticipant.color,
    roomId: room.id,
  });

  socket.join(roomCode);

  console.log(`👤 ${userName} (${socket.id}, user: ${userId}) joined room ${roomCode} (${participantCount + 1} participants)`);

  // Get all participants from database
  const allParticipants = await db.getParticipants(room.id);
  
  // Convert to frontend format
  const participants = allParticipants.map((p) => ({
    id: p.user_id, // Use persistent user_id instead of socket_id
    name: p.name,
    color: p.color,
    joinedAt: new Date(p.joined_at).getTime(),
  }));

  // Send connection success with room data
  socket.emit('connected', {
    userId: userId, // Send persistent user ID
    participants,
    isRoomProtected: !!room.password_hash, // Send room protection status
  });

  // Get and send message history from database
  const dbMessages = await db.getMessages(room.id, 500);
  
  // Convert to frontend format
  const messages = dbMessages.map((m) => ({
    id: m.message_id,
    type: m.type,
    content: m.content,
    language: m.language,
    mediaUrl: m.media_url,
    mediaType: m.media_type,
    fileName: m.file_name,
    fileSize: m.file_size,
    userId: m.user_id, // Use persistent user_id
    userName: m.user_name,
    userColor: m.user_color,
    timestamp: new Date(m.created_at).getTime(),
    reactions: m.reactions,
    editedAt: m.edited_at ? new Date(m.edited_at).getTime() : undefined,
    replyToId: m.reply_to_message_id,
    replyToContent: m.reply_to_content,
    replyToUserName: m.reply_to_user_name,
  }));

  socket.emit('message_history', messages);

  // Notify others about new participant
  socket.to(roomCode).emit('user_joined', {
    id: userId, // Use persistent user_id
    name: dbParticipant.name,
    color: dbParticipant.color,
    joinedAt: new Date(dbParticipant.joined_at).getTime(),
  });

  /**
   * Handle new messages
   */
  socket.on('message', async (data: { 
    content: string; 
    messageType: 'text' | 'code' | 'media'; 
    language?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    fileName?: string;
    fileSize?: number;
    replyToMessageId?: string;
  }) => {
    try {
      const socketData = activeSockets.get(socket.id);
      if (!socketData) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      // Validate message - allow empty content for media messages
      if (typeof data.content !== 'string') {
        socket.emit('error', { message: 'Invalid message content' });
        return;
      }

      // For non-media messages, content is required
      if (data.messageType !== 'media' && !data.content) {
        socket.emit('error', { message: 'Message content is required' });
        return;
      }

      // Check message length for non-media messages
      if (data.messageType !== 'media' && data.content.length > MAX_MESSAGE_LENGTH) {
        socket.emit('error', { message: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` });
        return;
      }

      // Generate message ID
      const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Get reply context if this is a reply
      let replyToContent: string | undefined;
      let replyToUserName: string | undefined;
      
      if (data.replyToMessageId) {
        const replyToMessage = await db.getMessageById(data.replyToMessageId);
        if (replyToMessage) {
          // Truncate reply content to 100 characters
          replyToContent = replyToMessage.content.substring(0, 100);
          replyToUserName = replyToMessage.user_name;
        }
      }

      // Save message to database
      const dbMessage = await db.addMessage(
        socketData.roomId,
        messageId,
        data.messageType || 'text',
        data.content,
        socketData.userId,
        socketData.name,
        socketData.color,
        {
          language: data.language,
          mediaUrl: data.mediaUrl,
          mediaType: data.mediaType,
          fileName: data.fileName,
          fileSize: data.fileSize,
          replyToMessageId: data.replyToMessageId,
          replyToContent,
          replyToUserName,
        }
      );

      if (!dbMessage) {
        socket.emit('error', { message: 'Failed to save message' });
        return;
      }

      // Convert to frontend format
      const message = {
        id: dbMessage.message_id,
        type: dbMessage.type,
        content: dbMessage.content,
        language: dbMessage.language,
        mediaUrl: dbMessage.media_url,
        mediaType: dbMessage.media_type,
        fileName: dbMessage.file_name,
        fileSize: dbMessage.file_size,
        userId: dbMessage.user_id,
        userName: dbMessage.user_name,
        userColor: dbMessage.user_color,
        timestamp: new Date(dbMessage.created_at).getTime(),
        reactions: dbMessage.reactions,
        editedAt: dbMessage.edited_at ? new Date(dbMessage.edited_at).getTime() : undefined,
        replyToId: dbMessage.reply_to_message_id,
        replyToContent: dbMessage.reply_to_content,
        replyToUserName: dbMessage.reply_to_user_name,
      };

      const preview = data.messageType === 'media' 
        ? `[${data.mediaType}] ${data.fileName || 'file'}`
        : data.content.substring(0, 50).replace(/\n/g, ' ');
      console.log(`💬 ${socketData.name} in ${roomCode}: ${preview}${data.content.length > 50 ? '...' : ''}`);

      // Broadcast to all in room (including sender for consistency)
      io.to(roomCode).emit('message', message);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  /**
   * Handle typing indicator
   */
  socket.on('typing', (data: { isTyping: boolean }) => {
    try {
      const socketData = activeSockets.get(socket.id);
      if (!socketData) return;

      socket.to(roomCode).emit('user_typing', {
        userId: socketData.userId,
        userName: socketData.name,
        isTyping: data.isTyping,
      });
    } catch (error) {
      console.error('Error handling typing:', error);
    }
  });

  /**
   * Handle reactions
   */
  socket.on('reaction', async (data: { messageId: string; emoji: string }) => {
    try {
      const reactions = await db.addReaction(data.messageId, data.emoji);
      
      if (reactions) {
        io.to(roomCode).emit('reaction_added', {
          messageId: data.messageId,
          emoji: data.emoji,
          count: reactions[data.emoji],
        });

        const socketData = activeSockets.get(socket.id);
        if (socketData) {
          console.log(`👍 ${socketData.name} reacted ${data.emoji} to message in ${roomCode}`);
        }
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  });

  /**
   * Handle message deletion
   */
  socket.on('delete_message', async (data: { messageId: string }) => {
    try {
      const socketData = activeSockets.get(socket.id);
      if (!socketData) return;

      const success = await db.deleteMessage(data.messageId);
      
      if (success) {
        io.to(roomCode).emit('message_deleted', { messageId: data.messageId });
        console.log(`🗑️  ${socketData.name} deleted a message in ${roomCode}`);
      }
    } catch (error) {
      console.error('Error handling delete:', error);
    }
  });

  /**
   * Handle message editing
   */
  socket.on('edit_message', async (data: { messageId: string; newContent: string }) => {
    try {
      const socketData = activeSockets.get(socket.id);
      if (!socketData) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      // Validate new content
      if (!data.newContent || typeof data.newContent !== 'string') {
        socket.emit('error', { message: 'Invalid message content' });
        return;
      }

      if (data.newContent.length > MAX_MESSAGE_LENGTH) {
        socket.emit('error', { message: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` });
        return;
      }

      // Edit the message in database
      const updatedMessage = await db.editMessage(
        data.messageId,
        data.newContent,
        socketData.userId
      );

      if (!updatedMessage) {
        socket.emit('error', { message: 'Failed to edit message or unauthorized' });
        return;
      }

      // Convert to frontend format
      const message = {
        id: updatedMessage.message_id,
        type: updatedMessage.type,
        content: updatedMessage.content,
        language: updatedMessage.language,
        mediaUrl: updatedMessage.media_url,
        mediaType: updatedMessage.media_type,
        fileName: updatedMessage.file_name,
        fileSize: updatedMessage.file_size,
        userId: updatedMessage.user_id,
        userName: updatedMessage.user_name,
        userColor: updatedMessage.user_color,
        timestamp: new Date(updatedMessage.created_at).getTime(),
        reactions: updatedMessage.reactions,
        editedAt: updatedMessage.edited_at ? new Date(updatedMessage.edited_at).getTime() : undefined,
        replyToId: updatedMessage.reply_to_message_id,
        replyToContent: updatedMessage.reply_to_content,
        replyToUserName: updatedMessage.reply_to_user_name,
      };

      // Broadcast the updated message to all clients in the room
      io.to(roomCode).emit('message_edited', message);
      console.log(`✏️  ${socketData.name} edited a message in ${roomCode}`);
    } catch (error) {
      console.error('Error handling edit_message:', error);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  });

  /**
   * Handle setting room password (only for room creator on first join)
   */
  socket.on('set_room_password', async (data: { password: string }) => {
    try {
      const socketData = activeSockets.get(socket.id);
      if (!socketData) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      // Check if this is a new room (only one participant - the creator)
      const participantCount = await db.getParticipantCount(socketData.roomId);
      if (participantCount !== 1) {
        socket.emit('error', { message: 'Cannot set password - room already has other participants' });
        return;
      }

      // Validate password
      if (!data.password || typeof data.password !== 'string') {
        socket.emit('error', { message: 'Invalid password' });
        return;
      }

      if (data.password.length < 4 || data.password.length > 50) {
        socket.emit('error', { message: 'Password must be between 4 and 50 characters' });
        return;
      }

      // Get room and check if it already has a password
      const room = await db.getRoomByCode(roomCode);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.password_hash) {
        socket.emit('error', { message: 'Room already has a password' });
        return;
      }

      // Hash and set password using bcrypt
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Update room with password
      const { error } = await (await import('./supabase')).supabase
        .from('rooms')
        .update({ password_hash: passwordHash })
        .eq('id', socketData.roomId);

      if (error) {
        console.error('Error setting room password:', error);
        socket.emit('error', { message: 'Failed to set room password' });
        return;
      }

      console.log(`🔒 Password set for room ${roomCode}`);
      socket.emit('room_password_set', { success: true });
    } catch (error) {
      console.error('Error setting room password:', error);
      socket.emit('error', { message: 'Failed to set room password' });
    }
  });

  /**
   * Handle disconnection
   */
  socket.on('disconnect', async () => {
    const socketData = activeSockets.get(socket.id);
    if (!socketData) return;

    console.log(`👋 ${socketData.name} (${socket.id}) left room ${roomCode}`);
    
    // Remove participant from database
    await db.removeParticipant(socket.id);
    
    // Remove from active sockets
    activeSockets.delete(socket.id);
    
    // Notify others
    socket.to(roomCode).emit('user_left', {
      userId: socketData.userId,
      userName: socketData.name,
    });

    // Get remaining participant count
    const remainingCount = await db.getParticipantCount(socketData.roomId);
    
    if (remainingCount === 0) {
      console.log(`📭 Room ${roomCode} is now empty (will be cleaned up after ${ROOM_TIMEOUT_HOURS} hours of inactivity)`);
    } else {
      console.log(`📊 Room ${roomCode} now has ${remainingCount} participant(s)`);
    }
  });

  /**
   * Handle errors
   */
  socket.on('error', (error) => {
    console.error(`❌ Socket error from ${socket.id}:`, error);
  });
});

// API Routes
app.get('/api/stats', async (req, res) => {
  const stats = await db.getStats();
  res.json(stats);
});

app.get('/api/rooms', (req, res) => {
  // This endpoint is less useful with database storage
  // Could be extended to show active rooms from DB
  res.json({ message: 'Use database queries for room information' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log('');
  console.log('🚀 ====================================');
  console.log(`🚀 InstaShare Backend Server`);
  console.log('🚀 ====================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
  console.log(`⏱️  Room timeout: ${ROOM_TIMEOUT_HOURS} hours`);
  console.log(`👥 Max participants per room: ${MAX_PARTICIPANTS}`);
  console.log(`💬 Max message length: ${MAX_MESSAGE_LENGTH} characters`);
  console.log(`🗄️  Database: Supabase PostgreSQL`);
  console.log(`📦 File storage: Supabase (${process.env.SUPABASE_BUCKET})`);
  console.log(`🗑️  File retention: ${process.env.FILE_RETENTION_HOURS || 24} hours`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ====================================');
  console.log('');
  console.log('📝 Logs:');
  
  // Start file cleanup job
  startCleanupJob();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});
