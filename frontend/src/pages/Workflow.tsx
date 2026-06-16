import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Users, MessageSquare, Share2, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Workflow() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Zap,
      step: "Step 1",
      title: "Create or Join a Room",
      description: "Click 'Create Room' to generate a unique 8-character room code instantly, or enter an existing room code to join an active session. No registration needed."
    },
    {
      icon: Users,
      step: "Step 2",
      title: "Set Your Username",
      description: "Choose a temporary username for your session. This name is only visible to participants in the room and will be deleted after 24 hours."
    },
    {
      icon: Share2,
      step: "Step 3",
      title: "Share the Room",
      description: "Share your room using the room code, QR code, or direct link. Multiple participants can join simultaneously using the same code."
    },
    {
      icon: MessageSquare,
      step: "Step 4",
      title: "Start Collaborating",
      description: "Send text messages, share syntax-highlighted code snippets, upload images and videos. See who's typing in real-time and react to messages with emojis."
    },
    {
      icon: Lock,
      step: "Step 5",
      title: "Stay Private",
      description: "All data is encrypted during transmission. Your room is completely private and only accessible to those with the room code."
    },
    {
      icon: Trash2,
      step: "Step 6",
      title: "Auto-Cleanup",
      description: "After 3 hours of the room's last activity, all messages, files, and room data are automatically and permanently deleted from our servers."
    }
  ];

  const technicalFlow = [
    {
      step: "01",
      title: "Frontend - Vite + React",
      description: "Built with Vite for lightning-fast HMR and optimized production builds. Deployed on Vercel with automatic SSL and global CDN distribution. React 18 with TypeScript ensures type-safe code and excellent developer experience."
    },
    {
      step: "02",
      title: "WebSocket Connection",
      description: "When you join a room, Socket.IO establishes a persistent WebSocket connection to our Node.js backend on Render.com. This enables instant bidirectional communication with automatic reconnection and fallback to HTTP long-polling."
    },
    {
      step: "03",
      title: "Backend - Express + Socket.IO",
      description: "Node.js server running on Render.com handles all WebSocket connections, room management, and real-time messaging. Express.js provides REST API endpoints for health checks and statistics. Environment uses automatic scaling based on traffic."
    },
    {
      step: "04",
      title: "Database - Supabase PostgreSQL",
      description: "All rooms, participants, and messages are stored in Supabase's managed PostgreSQL database. Features include UUID primary keys, foreign key constraints for data integrity, JSONB for reactions, and optimized indexes for fast queries."
    },
    {
      step: "05",
      title: "File Storage - Supabase Storage",
      description: "Images and videos are uploaded to Supabase Storage buckets with public access. Files are organized by room code, with automatic URL generation. Maximum 10MB per file with support for multiple formats (PNG, JPG, MP4, etc.)."
    },
    {
      step: "06",
      title: "Password Protection - bcrypt.js",
      description: "Room passwords are hashed using bcrypt with 10 salt rounds before storage. Password verification happens on the backend during WebSocket handshake. Original passwords are never stored or logged."
    },
    {
      step: "07",
      title: "Real-time Sync",
      description: "Every action (message, reaction, typing indicator) is broadcast to all connected clients in the room via Socket.IO's room feature. Backend maintains in-memory map of active connections and syncs with database for persistence."
    },
    {
      step: "08",
      title: "Automatic Cleanup - Dual Layer",
      description: "Backend runs hourly cleanup checking for rooms with last_activity > 3 hours. Supabase pg_cron extension (optional) provides database-level cleanup as a safety net. Both layers ensure no data persists beyond retention period."
    },
    {
      step: "09",
      title: "File Cleanup - Storage Job",
      description: "Separate cleanup job runs every hour scanning Supabase Storage for files older than 3 hours. Files are batch-deleted with error handling and logging. Ensures compliance with data retention policy."
    },
    {
      step: "10",
      title: "Monitoring & Logging",
      description: "Backend logs all events (connections, messages, errors) with timestamps. Render.com provides real-time log streaming and 7-day retention. Health check endpoint at /health returns server status, uptime, and timestamp."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-y-auto relative">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-cyber opacity-30 animate-pulse pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_50%)] pointer-events-none" />

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-6 left-6 z-50"
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="gap-2 hover:bg-primary/10 glass-strong"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
        </Button>
      </motion.div>

      <div className="relative z-10 w-full max-w-5xl mx-auto p-6 md:p-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 mt-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <Zap className="w-10 h-10 md:w-12 md:h-12 text-primary glow-cyan" />
            <h1 className="text-3xl md:text-5xl font-bold">
              <span className="text-gradient-primary">How It Works - For Users</span>
            </h1>
          </div>
          
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            InstaShare makes real-time collaboration simple and secure. Here's how our platform works from start to finish.
          </p>
        </motion.div>

        {/* Workflow Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6 mb-10"
        >
          {steps.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="glass-strong p-6 rounded-xl hover:bg-card/60 transition-smooth flex gap-4"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary glow-cyan" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-primary font-semibold mb-1">{item.step}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Technical Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gradient-secondary">
            Technical Workflow -  Behind the Scenes
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
            Here's a detailed technical flow of how InstaShare works behind the scenes, from frontend deployment to database cleanup.
          </p>

          {/* Architecture Overview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.85 }}
            className="glass-strong p-6 rounded-xl mb-6 border border-primary/20"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              System Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="text-primary font-semibold">Frontend Layer</div>
                <div className="text-muted-foreground">
                  <div>• React 18 + TypeScript</div>
                  <div>• Vite Build Tool</div>
                  <div>• Deployed on Vercel</div>
                  <div>• Socket.IO Client</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-primary font-semibold">Backend Layer</div>
                <div className="text-muted-foreground">
                  <div>• Node.js + Express</div>
                  <div>• Socket.IO Server</div>
                  <div>• Deployed on Render.com</div>
                  <div>• Automatic Scaling</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-primary font-semibold">Data Layer</div>
                <div className="text-muted-foreground">
                  <div>• Supabase PostgreSQL</div>
                  <div>• Supabase Storage</div>
                  <div>• pg_cron for cleanup</div>
                  <div>• bcrypt encryption</div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            {technicalFlow.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.05 }}
                className="glass-strong p-5 rounded-xl hover:bg-card/60 transition-smooth"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                      <span className="text-xs font-bold text-primary">{item.step}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full py-3 text-center text-xs md:text-sm text-muted-foreground border-t border-border/30 mt-8"
        >
          <p>© 2026 | Developed with ❤</p>
        </motion.footer>
      </div>
    </div>
  );
}
