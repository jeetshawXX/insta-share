import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, QrCode, Share2, Menu, X, User, Lock, Loader2, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RoomCodeChip } from '@/components/RoomCodeChip';
import { MessageBubble } from '@/components/MessageBubble';
import { CodeSnippet } from '@/components/CodeSnippet';
import { ChatComposer } from '@/components/ChatComposer';
import { ParticipantsList } from '@/components/ParticipantsList';
import { TypingIndicator } from '@/components/TypingIndicator';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { QRCodeModal } from '@/components/QRCodeModal';
import { UsernameDialog } from '@/components/UsernameDialog';
import { PasswordDialog } from '@/components/PasswordDialog';
import { SetPasswordDialog } from '@/components/SetPasswordDialog';
import { FileUpload } from '@/components/FileUpload';
import { Message, Participant, createSocketConnection, SocketConnection } from '@/lib/socket';
import { toast } from 'sonner';
import { getRoomUrl, copyToClipboard } from '@/lib/roomCode';
import { cn } from '@/lib/utils';

const CONNECTING_MESSAGES = [
  'Establishing connection with Backend...🧑‍💻',
  'Making coffee for the backend...☕',
  'Almost there, hang tight!🚀',
  'Connecting the dots...🎯',
  'Backend is getting ready...⚡',
];

/**
 * Main room interface for chat and code sharing
 */
export default function Room() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [typingUsers, setTypingUsers] = useState<Participant[]>([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [connectingMessageIndex, setConnectingMessageIndex] = useState(0);
  const [userName, setUserName] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showSetPasswordDialog, setShowSetPasswordDialog] = useState(false);
  const [passwordError, setPasswordError] = useState<string>('');
  const [pendingUsername, setPendingUsername] = useState<string>('');
  const [roomPassword, setRoomPassword] = useState<string | null>(null);
  const [isRoomProtected, setIsRoomProtected] = useState(false);
  const [isRoomCreator, setIsRoomCreator] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<SocketConnection | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const prevMessageCountRef = useRef<number>(0);

  // Initialize WebSocket connection
  const initializeConnection = useCallback((displayName: string, password?: string) => {
    if (!roomCode) return;

    // Create WebSocket connection
    setConnectionStatus('connecting');
    const socket = createSocketConnection(roomCode, displayName, password);
    socketRef.current = socket;

    // Listen for connection success
    socket.on('connected', (data: { userId: string; participants: Participant[]; isRoomProtected?: boolean }) => {
      console.log('✅ Connected to room:', data);
      setCurrentUserId(data.userId);
      setParticipants(data.participants);
      setConnectionStatus('connected');
      
      // Check if user is the room creator (first participant)
      setIsRoomCreator(data.participants.length === 1);
      
      // Set room protection status from backend
      setIsRoomProtected(data.isRoomProtected || false);
      
      toast.success('Connected to room!');
    });

    // Listen for new messages
    socket.on('message', (message: Message) => {
      console.log('📩 New message:', message);
      setMessages((prev) => [...prev, message]);
    });

    // Listen for message history
    socket.on('message_history', (history: Message[]) => {
      console.log('📜 Message history:', history.length);
      setMessages(history);
    });

    // Listen for user joined
    socket.on('user_joined', (participant: Participant) => {
      console.log('👋 User joined:', participant);
      setParticipants((prev) => [...prev, participant]);
      
      // If someone else joined, we're no longer the only one (not creator anymore for protection purposes)
      setIsRoomCreator(false);
      
      toast.info(`${participant.name} joined the room`);
    });

    // Listen for user left
    socket.on('user_left', (data: { userId: string; userName: string }) => {
      console.log('👋 User left:', data);
      setParticipants((prev) => prev.filter((p) => p.id !== data.userId));
      toast.info(`${data.userName} left the room`);
    });

    // Listen for typing indicator
    socket.on('user_typing', (data: { userId: string; userName: string; isTyping: boolean }) => {
      console.log('⌨️ User typing:', data);
      if (data.isTyping) {
        setTypingUsers((prev) => {
          const existing = prev.find((u) => u.id === data.userId);
          if (!existing) {
            return [...prev, { id: data.userId, name: data.userName, color: '', joinedAt: Date.now() }];
          }
          return prev;
        });
      } else {
        setTypingUsers((prev) => prev.filter((u) => u.id !== data.userId));
      }
    });

    // Listen for reactions
    socket.on('reaction_added', (data: { messageId: string; emoji: string; count: number }) => {
      console.log('👍 Reaction added:', data);
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            // Only update if count is different (from other users)
            const currentCount = msg.reactions?.[data.emoji] || 0;
            if (currentCount !== data.count) {
              return {
                ...msg,
                reactions: { ...(msg.reactions || {}), [data.emoji]: data.count },
              };
            }
          }
          return msg;
        })
      );
    });

    // Listen for message edits
    socket.on('message_edited', (updatedMessage: Message) => {
      console.log('✏️ Message edited:', updatedMessage);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
      
      // Cancel editing if this was the message being edited
      setEditingMessage((current) => {
        if (current && current.id === updatedMessage.id) {
          return null;
        }
        return current;
      });
    });

    // Listen for message deletion
    socket.on('message_deleted', (data: { messageId: string }) => {
      console.log('🗑️ Message deleted:', data);
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
    });

    // Listen for connection errors
    socket.on('error', (error: { message: string }) => {
      console.error('❌ Socket error:', error);
      toast.error(error.message || 'Connection error');
      setConnectionStatus('disconnected');
      
      // Reset password setting state if error occurs
      setIsSettingPassword(false);
    });

    // Listen for password required
    socket.on('password_required', (data: { message: string }) => {
      console.log('🔒 Password required:', data);
      setPasswordError(data.message || 'This room is password protected');
      setShowPasswordDialog(true);
      setConnectionStatus('disconnected');
    });

    // Listen for room password set confirmation
    socket.on('room_password_set', () => {
      console.log('🔒 Room password set successfully');
      setIsRoomProtected(true);
      setIsSettingPassword(false);
      setShowSetPasswordDialog(false);
      toast.success('Room password set successfully');
    });

    // Listen for disconnection
    socket.on('disconnected', () => {
      console.log('🔌 Disconnected from room');
      setConnectionStatus('disconnected');
      toast.error('Disconnected from room');
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection');
      socket.disconnect();
    };
  }, [roomCode]);

  // Check for existing username on mount
  useEffect(() => {
    if (!roomCode) {
      navigate('/');
      return;
    }

    // Save the current room code to localStorage
    localStorage.setItem('lastRoomCode', roomCode);

    const storedName = localStorage.getItem('displayName');
    if (!storedName) {
      // Show username dialog if no username exists
      setShowUsernameDialog(true);
    } else {
      // Use existing username
      setUserName(storedName);
      initializeConnection(storedName);
    }
  }, [roomCode, navigate, initializeConnection]);

  // Rotate connecting messages every 2 seconds
  useEffect(() => {
    if (connectionStatus === 'connecting') {
      const interval = setInterval(() => {
        setConnectingMessageIndex((prev) => (prev + 1) % CONNECTING_MESSAGES.length);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setConnectingMessageIndex(0);
    }
  }, [connectionStatus]);

  // Handle username set from dialog
  const handleUsernameSet = (username: string) => {
    localStorage.setItem('displayName', username);
    setUserName(username);
    setShowUsernameDialog(false);
    
    // Connect directly without showing password dialog
    initializeConnection(username);
  };

  // Handle protect room button click
  const handleProtectRoom = () => {
    setShowSetPasswordDialog(true);
  };

  // Handle password set for new room
  const handleSetPassword = (password: string | null) => {
    if (!password) {
      // User cancelled
      setShowSetPasswordDialog(false);
      return;
    }
    
    setRoomPassword(password);
    setIsSettingPassword(true);
    
    // Send password to backend
    if (socketRef.current?.isConnected()) {
      socketRef.current.send({
        type: 'set_room_password',
        data: { password },
      });
    } else {
      setIsSettingPassword(false);
      setShowSetPasswordDialog(false);
      toast.error('Not connected to room');
    }
  };

  // Handle password submit for joining protected room
  const handlePasswordSubmit = (password: string) => {
    setPasswordError('');
    setShowPasswordDialog(false);
    setRoomPassword(password);
    
    // Retry connection with password
    if (pendingUsername) {
      initializeConnection(pendingUsername, password);
    } else if (userName) {
      initializeConnection(userName, password);
    }
  };

  // Handle username change (disconnect and reconnect with new name)
  const handleChangeUsername = () => {
    // Disconnect current socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    // Show username dialog
    setShowUsernameDialog(true);
  };

  useEffect(() => {
    // Only scroll when a new message is added, not when reactions/edits happen
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      prevMessageCountRef.current = messages.length;
    }
  }, [messages]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      setShowLeaveDialog(true);
      // Push state back to prevent navigation
      window.history.pushState(null, '', window.location.pathname);
    };

    // Push initial state
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleSendMessage = (content: string, type: 'text' | 'code', language?: string, replyToId?: string) => {
    if (!socketRef.current || !socketRef.current.isConnected()) {
      toast.error('Not connected to room');
      return;
    }

    // Send message via WebSocket
    socketRef.current.send({
      type: 'message',
      data: {
        content,
        messageType: type,
        language,
        replyToMessageId: replyToId,
      },
    });

    // Clear reply state after sending
    setReplyingTo(null);

    // Note: The message will be added to state when we receive it back from the server
    // This ensures all clients see messages in the same order
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!socketRef.current || !socketRef.current.isConnected()) {
      toast.error('Not connected to room');
      return;
    }

    socketRef.current.send({
      type: 'edit_message',
      data: {
        messageId,
        newContent,
      },
    });

    // Clear edit state
    setEditingMessage(null);
    
    console.log(`✏️ Editing message: ${messageId}`);
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyingTo(message);
    setEditingMessage(null); // Cancel edit if replying
  };

  const handleEditMessageClick = (message: Message) => {
    setEditingMessage(message);
    setReplyingTo(null); // Cancel reply if editing
  };

  const handleMediaUpload = (url: string, type: 'image' | 'video', fileName: string, fileSize: number) => {
    if (!socketRef.current || !socketRef.current.isConnected()) {
      toast.error('Not connected to room');
      return;
    }

    // Send media message via WebSocket
    socketRef.current.send({
      type: 'message',
      data: {
        content: '', // Caption can be added later
        messageType: 'media',
        mediaUrl: url,
        mediaType: type,
        fileName,
        fileSize,
      },
    });

    console.log(`📎 Sent ${type}: ${fileName}`);
  };

  const handleDeleteMessage = (id: string) => {
    if (!socketRef.current || !socketRef.current.isConnected()) {
      toast.error('Not connected to room');
      return;
    }

    socketRef.current.send({
      type: 'delete_message',
      data: { messageId: id },
    });

    // Optimistically update UI
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
    toast.success('Message deleted');
  };

  const handleReact = (id: string, emoji: string) => {
    if (!socketRef.current || !socketRef.current.isConnected()) {
      toast.error('Not connected to room');
      return;
    }

    // Optimistically update UI immediately
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === id) {
          return {
            ...msg,
            reactions: {
              ...(msg.reactions || {}),
              [emoji]: (msg.reactions?.[emoji] || 0) + 1,
            },
          };
        }
        return msg;
      })
    );

    // Send to server
    socketRef.current.send({
      type: 'reaction',
      data: { messageId: id, emoji },
    });
  };

  // Handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    if (!socketRef.current || !socketRef.current.isConnected()) {
      return;
    }

    // Debounce typing events
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socketRef.current.send({
      type: 'typing',
      data: { isTyping },
    });

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.send({
          type: 'typing',
          data: { isTyping: false },
        });
      }, 3000);
    }
  };

  const handleShare = async () => {
    const url = getRoomUrl(roomCode!);
    const success = await copyToClipboard(url);
    if (success) {
      toast.success('Room link copied!');
    }
  };

  const handleLeave = () => {
    setShowLeaveDialog(true);
  };

  const confirmLeave = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    toast.success('Exited room');
    navigate('/');
  };

  if (!roomCode) {
    return null;
  }

  // Show connecting screen
  if (connectionStatus === 'connecting' && !showUsernameDialog) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Connecting...</h2>
            <AnimatePresence mode="wait">
              <motion.p
                key={connectingMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-muted-foreground"
              >
                {CONNECTING_MESSAGES[connectingMessageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show disconnected screen
  if (connectionStatus === 'disconnected' && !showPasswordDialog && !showUsernameDialog) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong p-8 rounded-2xl max-w-md w-full space-y-6 text-center border border-border/50"
        >
          <div className="space-y-2">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Connection Lost</h2>
            <p className="text-muted-foreground">
              Unable to connect to the backend server. Please try again.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full gap-2"
              size="lg"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-strong border-b border-border/50 px-4 py-3 flex items-center justify-between gap-4 flex-shrink-0"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          <div className="flex items-center gap-2 hidden sm:flex">
            <img
              src="/instashare-logo.png"
              alt="InstaShare logo"
              className="w-6 h-6 md:w-8 md:h-8 object-contain"
            />
            <h1 className="text-xl font-bold">
              <span className="text-gradient-primary">InstaShare</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <RoomCodeChip roomCode={roomCode} />
          
          {/* Protect Room button - only show for room creator if not already protected */}
          {isRoomCreator && !isRoomProtected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProtectRoom}
              disabled={isSettingPassword}
              className="gap-2 bg-amber-500/20 text-amber-500 hover:bg-amber-500/40 hover:text-amber-600 disabled:opacity-70"
              title="Protect this room with a password"
            >
              {isSettingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Protecting...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">Protect Room</span>
                </>
              )}
            </Button>
          )}

          {/* Show lock icon if room is protected */}
          {isRoomProtected && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-md bg-green-500/20 text-green-500 text-sm border border-green-500/30">
              <Lock className="w-7 h-7" />
              <span className="hidden sm:inline">Protected</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleChangeUsername}
            className="gap-2 bg-blue-500/20 text-blue-500 hover:bg-blue-500/40 hover:text-blue-600"
            title={`Change username (${userName})`}
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{userName}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQrModalOpen(true)}
            className="gap-2 bg-blue-500/20 text-blue-500 hover:bg-blue-500/40 hover:text-blue-600"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">QR</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="gap-2 bg-blue-500/20 text-blue-500 hover:bg-blue-500/40 hover:text-blue-600"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          <ConnectionStatus status={connectionStatus} />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeave}
            className="gap-2 bg-red-500/20 text-red-500 hover:bg-red-500/40 hover:text-red-600"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </Button>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className={cn(
                'w-72 border-r border-border/50 flex-shrink-0',
                'lg:relative absolute inset-y-0 left-0 z-20 bg-background'
              )}
            >
              {/* Mobile close button */}
              <div className="lg:hidden flex items-center justify-between p-4 border-b border-border/50">
                <h2 className="font-semibold text-lg">Participants</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="hover:bg-red-500/20 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-4 flex-1 overflow-hidden">
                <ParticipantsList participants={participants} currentUserId={currentUserId} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 p-4">
          <div className="flex-1 flex flex-col border border-border/100 rounded-lg overflow-hidden chat-background">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {messages.map((message) => {
                const isOwn = message.userId === currentUserId;
                return message.type === 'code' ? (
                  <CodeSnippet
                    key={message.id}
                    message={message}
                    isOwn={isOwn}
                    onReact={handleReact}
                    onReply={handleReplyToMessage}
                  />
                ) : (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={isOwn}
                    currentUserId={currentUserId}
                    onDelete={isOwn ? handleDeleteMessage : undefined}
                    onReact={handleReact}
                    onReply={handleReplyToMessage}
                    onEdit={isOwn ? handleEditMessageClick : undefined}
                  />
                );
              })}

              <TypingIndicator typingUsers={typingUsers} />
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="border-t border-border/100 bg-background/95 backdrop-blur-sm">
              <ChatComposer
                onSendMessage={handleSendMessage}
                onEditMessage={handleEditMessage}
                onTyping={handleTyping}
                disabled={connectionStatus === 'disconnected'}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                editingMessage={editingMessage}
                onCancelEdit={() => setEditingMessage(null)}
                fileUpload={
                  <FileUpload
                    roomCode={roomCode!}
                    onUploadComplete={handleMediaUpload}
                    disabled={connectionStatus === 'disconnected'}
                  />
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <QRCodeModal
        roomCode={roomCode}
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />

      {/* Username Dialog */}
      <UsernameDialog
        open={showUsernameDialog}
        onUsernameSet={handleUsernameSet}
        currentUsername={userName}
        onClose={() => setShowUsernameDialog(false)}
      />

      {/* Set Password Dialog (for room creators) */}
      <SetPasswordDialog
        open={showSetPasswordDialog}
        onOpenChange={setShowSetPasswordDialog}
        onSubmit={handleSetPassword}
        isLoading={isSettingPassword}
      />

      {/* Password Dialog (for joining protected rooms) */}
      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onSubmit={handlePasswordSubmit}
        errorMessage={passwordError}
      />

      {/* Leave Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Room?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exit this room? You will be disconnected from the chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave} className="bg-red-700 hover:bg-red-600 text-white">
              Exit Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
