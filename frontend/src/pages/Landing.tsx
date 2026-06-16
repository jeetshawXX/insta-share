import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Code2, Share2, Shield, Zap, X, Menu, FileText, Workflow as WorkflowIcon, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { generateRoomCode, isValidRoomCode } from "@/lib/roomCode";
import { toast } from "sonner";

/**
 * Landing page with hero section and room creation/join flow
 */
export default function Landing() {
  const [joinCode, setJoinCode] = useState("");
  const [showRejoinDialog, setShowRejoinDialog] = useState(false);
  const [previousRoomCode, setPreviousRoomCode] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    // Check if there's a previous room code in localStorage
    const savedRoomCode = localStorage.getItem("lastRoomCode");

    if (savedRoomCode && isValidRoomCode(savedRoomCode)) {
      // Show dialog to rejoin previous room
      setPreviousRoomCode(savedRoomCode);
      setShowRejoinDialog(true);
    } else {
      // Create new room
      createNewRoom();
    }
  };

  const createNewRoom = () => {
    const roomCode = generateRoomCode();
    // Save the new room code to localStorage
    localStorage.setItem("lastRoomCode", roomCode);
    toast.success("Room created!");
    navigate(`/room/${roomCode}`);
  };

  const rejoinPreviousRoom = () => {
    if (previousRoomCode) {
      toast.success("Rejoining previous room!");
      navigate(`/room/${previousRoomCode}`);
    }
    setShowRejoinDialog(false);
  };

  const createNewRoomInstead = () => {
    setShowRejoinDialog(false);
    createNewRoom();
  };

  const handleJoinRoom = () => {
    const code = joinCode.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (!code) {
      toast.error("Please enter a room code");
      return;
    }

    if (!isValidRoomCode(code)) {
      toast.error("Invalid room code format");
      return;
    }

    // Save the room code when joining
    localStorage.setItem("lastRoomCode", code);
    navigate(`/room/${code}`);
  };

  const features = [
    {
      icon: Zap,
      title: "Instant & Anonymous",
      description: "Create rooms in seconds — no signup, fully private, and auto-delete after 3 hours",
    },
    {
      icon: Code2,
      title: "Share Code",
      description: "Use syntax-highlighted code snippets to make your shared code easier to read.",
    },
    {
      icon: Share2,
      title: "QR Sharing",
      description: "Share rooms easily using QR codes and links for quicker, smoother access.",
    },
    {
      icon: Shield,
      title: "Password Protected",
      description: "Secure your rooms with optional passwords to keep shared content safe always.",
    },
  ];

  const menuOptions = [
    {
      icon: Shield,
      label: "Privacy Policy",
      path: "/privacy-policy",
      description: "Learn about our data practices"
    },
    {
      icon: WorkflowIcon,
      label: "Workflow",
      path: "/workflow",
      description: "See how InstaShare works"
    },
    {
      icon: HelpCircle,
      label: "FAQ",
      path: "/faq",
      description: "Frequently asked questions"
    }
  ];

  return (
    <div className="h-screen md:h-screen flex flex-col items-center justify-between p-4 md:p-6 overflow-y-auto md:overflow-hidden relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 md:inset-0 bg-gradient-cyber opacity-50 animate-pulse" style={{ position: 'fixed', height: '100vh', width: '100vw', top: 0, left: 0 }} />
      <div className="absolute inset-0 md:inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_50%)]" style={{ position: 'fixed', height: '100vh', width: '100vw', top: 0, left: 0 }} />

      {/* Toggle Menu Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 right-3 z-50"
      >
        <Button
          onClick={() => setShowMenu(!showMenu)}
          size="lg"
          variant="outline"
          className="glass-strong gap-1.5 sm:gap-2 glow-cyan px-2 sm:px-3 py-2 sm:py-2.5"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline text-sm">Menu</span>
        </Button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-72 glass-strong rounded-xl shadow-2xl overflow-hidden border border-border/50"
            >
              {menuOptions.map((option, index) => (
                <motion.button
                  key={option.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => {
                    navigate(option.path);
                    setShowMenu(false);
                  }}
                  className="w-full p-4 flex items-start gap-3 hover:bg-primary/10 transition-colors border-b border-border/30 last:border-b-0 text-left"
                >
                  <option.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Content - Split Layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex-grow flex items-center px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-10 items-center w-full">
          
          {/* Hero Content Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left w-full lg:order-1"
          >
            <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <img
                src="/instashare-logo.png"
                alt="InstaShare logo"
                loading="lazy"
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
              />
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-none">
                <span className="text-gradient-instalogo">InstaShare</span>
              </h1>
            </div>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 md:mb-10 mt-3 sm:mt-4 md:mt-5 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Anonymous real-time chat & code sharing.
              <br />
              <span className="text-gradient-secondary font-semibold">
                No sign-up. No hassle. Just share.
              </span>
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center lg:justify-start items-stretch sm:items-center mt-3 sm:mt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button
                  onClick={handleCreateRoom}
                  size="lg"
                  className="text-sm md:text-base px-4 sm:px-4 md:px-5 py-3 sm:py-4 md:py-5 glow-cyan w-full sm:w-auto"
                >
                  <Sparkles className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                  Create Room
                </Button>
              </motion.div>

              <div className="flex gap-1.5 sm:gap-2 items-center w-full sm:w-auto">
                <Input
                  placeholder="Enter code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                  className="glass flex-1 sm:w-44 md:w-48 h-10 sm:h-11 md:h-12 text-center font-mono text-xs sm:text-sm md:text-base tracking-wider border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-all"
                  maxLength={8}
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleJoinRoom}
                    size="lg"
                    variant="outline"
                    className="h-10 sm:h-11 md:h-12 px-3 sm:px-4 md:px-5 glass-strong text-xs sm:text-sm md:text-base font-semibold border-2 border-primary/30
                    hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-400/60 hover:shadow-lg 
                    transition-all"
                  >
                    Join
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* App Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full lg:order-2"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-border/50 shadow-2xl hover:shadow-primary/20 transition-shadow duration-300 bg-transparent">
              {/* Video */}
              <video
                className="w-full h-auto max-h-[200px] sm:max-h-[250px] md:max-h-[310px] lg:max-h-[320px] object-cover block"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/instashare-demo-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-8 pb-0 mt-4 sm:mt-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-strong p-4 md:p-5 rounded-xl hover:bg-card/60 transition-smooth flex flex-col items-center text-center min-h-[140px] md:min-h-[160px]"
            >
              <feature.icon className="w-8 h-8 md:w-10 md:h-10 text-primary mb-3 md:mb-4 glow-cyan" />
              <h3 className="text-sm md:text-base font-bold mb-2 md:mb-3 text-white line-clamp-2">
                {feature.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-snug line-clamp-3">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="relative z-10 w-full py-3 md:py-4 mt-4 sm:mt-6 md:mt-8 text-center text-xs md:text-sm text-muted-foreground"
      >
        <p>© 2026 | Developed with ❤</p>
      </motion.footer>

      {/* Rejoin Previous Room Dialog */}
      <AlertDialog open={showRejoinDialog} onOpenChange={setShowRejoinDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full opacity-70 hover:opacity-100"
              onClick={() => setShowRejoinDialog(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <AlertDialogTitle>Rejoin Previous Room?</AlertDialogTitle>
            <AlertDialogDescription>
              You have a previous room session. Would you like to rejoin room{" "}
              <span className="font-mono font-semibold text-primary">
                {previousRoomCode}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={createNewRoomInstead}>
              Create New Room
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={rejoinPreviousRoom}
              className="bg-primary hover:bg-primary/90"
            >
              Rejoin Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
