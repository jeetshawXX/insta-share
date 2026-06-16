/**
 * Database operations for InstaShare using Supabase
 * Handles rooms, participants, and messages
 */

import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

// Types
export interface Room {
  id: string;
  code: string;
  password_hash?: string | null;
  created_at: string;
  last_activity: string;
}

export interface Participant {
  id: string;
  room_id: string;
  socket_id: string;
  user_id: string;
  name: string;
  color: string;
  joined_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  message_id: string;
  type: 'text' | 'code' | 'media';
  content: string;
  language?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  file_name?: string;
  file_size?: number;
  user_id: string;
  user_name: string;
  user_color: string;
  created_at: string;
  reactions?: Record<string, number>;
  edited_at?: string;
  reply_to_message_id?: string;
  reply_to_content?: string;
  reply_to_user_name?: string;
}

/**
 * Get or create a room by code
 */
export async function getOrCreateRoom(code: string, password?: string): Promise<Room | null> {
  try {
    // Try to get existing room
    const { data: existingRoom, error: fetchError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single();

    if (existingRoom && !fetchError) {
      // Update last activity
      const { data: updatedRoom } = await supabase
        .from('rooms')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', existingRoom.id)
        .select()
        .single();
      
      return updatedRoom || existingRoom;
    }

    // Create new room with optional password
    let passwordHash: string | null = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const { data: newRoom, error: createError } = await supabase
      .from('rooms')
      .insert({ 
        code,
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating room:', createError);
      return null;
    }

    return newRoom;
  } catch (error) {
    console.error('Error in getOrCreateRoom:', error);
    return null;
  }
}

/**
 * Get room by code
 */
export async function getRoomByCode(code: string): Promise<Room | null> {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getRoomByCode:', error);
    return null;
  }
}

/**
 * Update room last activity timestamp
 */
export async function updateRoomActivity(roomId: string): Promise<void> {
  try {
    await supabase
      .from('rooms')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', roomId);
  } catch (error) {
    console.error('Error updating room activity:', error);
  }
}

/**
 * Add participant to room
 */
export async function addParticipant(
  roomId: string,
  socketId: string,
  userId: string,
  name: string,
  color: string
): Promise<Participant | null> {
  try {
    const { data, error } = await supabase
      .from('participants')
      .insert({
        room_id: roomId,
        socket_id: socketId,
        user_id: userId,
        name,
        color,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding participant:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in addParticipant:', error);
    return null;
  }
}

/**
 * Get all participants in a room
 */
export async function getParticipants(roomId: string): Promise<Participant[]> {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching participants:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getParticipants:', error);
    return [];
  }
}

/**
 * Get participant count for a room
 */
export async function getParticipantCount(roomId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId);

    if (error) {
      console.error('Error counting participants:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getParticipantCount:', error);
    return 0;
  }
}

/**
 * Remove participant from room
 */
export async function removeParticipant(socketId: string): Promise<void> {
  try {
    await supabase
      .from('participants')
      .delete()
      .eq('socket_id', socketId);
  } catch (error) {
    console.error('Error removing participant:', error);
  }
}

/**
 * Add message to room
 */
export async function addMessage(
  roomId: string,
  messageId: string,
  type: 'text' | 'code' | 'media',
  content: string,
  userId: string,
  userName: string,
  userColor: string,
  options?: {
    language?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    fileName?: string;
    fileSize?: number;
    replyToMessageId?: string;
    replyToContent?: string;
    replyToUserName?: string;
  }
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        message_id: messageId,
        type,
        content,
        user_id: userId,
        user_name: userName,
        user_color: userColor,
        language: options?.language,
        media_url: options?.mediaUrl,
        media_type: options?.mediaType,
        file_name: options?.fileName,
        file_size: options?.fileSize,
        reply_to_message_id: options?.replyToMessageId,
        reply_to_content: options?.replyToContent,
        reply_to_user_name: options?.replyToUserName,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in addMessage:', error);
    return null;
  }
}

/**
 * Get messages for a room (last 500 messages)
 */
export async function getMessages(roomId: string, limit: number = 500): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMessages:', error);
    return [];
  }
}

/**
 * Delete message
 */
export async function deleteMessage(messageId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('message_id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    return false;
  }
}

/**
 * Edit message
 */
export async function editMessage(
  messageId: string,
  newContent: string,
  userId: string
): Promise<Message | null> {
  try {
    // First verify the user owns the message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('user_id')
      .eq('message_id', messageId)
      .single();

    if (fetchError || !message) {
      console.error('Error fetching message for edit:', fetchError);
      return null;
    }

    if (message.user_id !== userId) {
      console.error('User does not own this message');
      return null;
    }

    // Update the message
    const { data: updatedMessage, error: updateError } = await supabase
      .from('messages')
      .update({ 
        content: newContent,
        edited_at: new Date().toISOString()
      })
      .eq('message_id', messageId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating message:', updateError);
      return null;
    }

    return updatedMessage;
  } catch (error) {
    console.error('Error in editMessage:', error);
    return null;
  }
}

/**
 * Get message by ID (for reply context)
 */
export async function getMessageById(messageId: string): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('message_id', messageId)
      .single();

    if (error) {
      console.error('Error fetching message by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getMessageById:', error);
    return null;
  }
}

/**
 * Add reaction to message
 */
export async function addReaction(
  messageId: string,
  emoji: string
): Promise<Record<string, number> | null> {
  try {
    // Get current message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('reactions')
      .eq('message_id', messageId)
      .single();

    if (fetchError || !message) {
      console.error('Error fetching message for reaction:', fetchError);
      return null;
    }

    // Update reactions
    const reactions = (message.reactions as Record<string, number>) || {};
    reactions[emoji] = (reactions[emoji] || 0) + 1;

    const { data: updatedMessage, error: updateError } = await supabase
      .from('messages')
      .update({ reactions })
      .eq('message_id', messageId)
      .select('reactions')
      .single();

    if (updateError) {
      console.error('Error updating reaction:', updateError);
      return null;
    }

    return updatedMessage.reactions as Record<string, number>;
  } catch (error) {
    console.error('Error in addReaction:', error);
    return null;
  }
}

/**
 * Cleanup old rooms (called periodically)
 * Note: This should primarily be handled by Supabase cron job
 */
export async function cleanupOldRooms(hoursOld: number = 3): Promise<number> {
  try {
    const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('rooms')
      .delete()
      .lt('last_activity', cutoffTime)
      .select();

    if (error) {
      console.error('Error cleaning up old rooms:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error in cleanupOldRooms:', error);
    return 0;
  }
}

/**
 * Get database statistics
 */
export async function getStats(): Promise<{
  totalRooms: number;
  totalParticipants: number;
  totalMessages: number;
}> {
  try {
    const [roomsCount, participantsCount, messagesCount] = await Promise.all([
      supabase.from('rooms').select('*', { count: 'exact', head: true }),
      supabase.from('participants').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
    ]);

    return {
      totalRooms: roomsCount.count || 0,
      totalParticipants: participantsCount.count || 0,
      totalMessages: messagesCount.count || 0,
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return { totalRooms: 0, totalParticipants: 0, totalMessages: 0 };
  }
}

/**
 * Verify room password
 * @returns true if password is correct or room has no password, false otherwise
 */
export async function verifyRoomPassword(
  roomCode: string,
  password: string | null
): Promise<{ valid: boolean; requiresPassword: boolean }> {
  try {
    const room = await getRoomByCode(roomCode);
    
    if (!room) {
      return { valid: false, requiresPassword: false };
    }

    // If room has no password, allow access
    if (!room.password_hash) {
      return { valid: true, requiresPassword: false };
    }

    // If room has password but none provided, deny access
    if (!password) {
      return { valid: false, requiresPassword: true };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, room.password_hash);
    return { valid: isValid, requiresPassword: true };
  } catch (error) {
    console.error('Error verifying room password:', error);
    return { valid: false, requiresPassword: false };
  }
}

/**
 * Check if room is password protected
 */
export async function isRoomPasswordProtected(roomCode: string): Promise<boolean> {
  try {
    const room = await getRoomByCode(roomCode);
    return !!(room && room.password_hash);
  } catch (error) {
    console.error('Error checking room password protection:', error);
    return false;
  }
}
