import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Clock, Trash2, Lock, Database, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  const policies = [
    {
      icon: Clock,
      title: "Temporary Data Storage",
      description: "All chat messages, files, and room data are stored temporarily for a maximum of 3 hours. After this period, all data is automatically and permanently deleted from our servers."
    },
    {
      icon: Trash2,
      title: "Auto-Delete System",
      description: "Our automated system ensures that inactive rooms and their associated data are purged within 3 hours of the last activity, maintaining your privacy and keeping our servers clean."
    },
    {
      icon: Lock,
      title: "No Account Required",
      description: "We don't require sign-ups or account creation. No personal information, email addresses, or phone numbers are collected or stored at any time."
    },
    {
      icon: Shield,
      title: "Anonymous Usage",
      description: "Your identity remains completely anonymous. We only store temporary usernames you provide during your session, which are deleted along with the room data."
    },
    {
      icon: Database,
      title: "Minimal Data Collection",
      description: "We only collect essential data needed for the service to function: room codes, messages, and uploaded files. No tracking cookies or analytics are used."
    },
    {
      icon: Eye,
      title: "No Data Sharing",
      description: "We never share, sell, or disclose your data to third parties. Your conversations and files are only accessible to participants in your room."
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
            <Shield className="w-10 h-10 md:w-12 md:h-12 text-primary glow-cyan" />
            <h1 className="text-3xl md:text-5xl font-bold">
              <span className="text-gradient-primary">Privacy Policy</span>
            </h1>
          </div>
          
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            At InstaShare, your privacy is our top priority. We believe in complete transparency about how we handle your data.
          </p>
        </motion.div>

        {/* Privacy Policies Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-5 mb-8"
        >
          {policies.map((policy, index) => (
            <motion.div
              key={policy.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="glass-strong p-6 rounded-xl hover:bg-card/60 transition-smooth"
            >
              <policy.icon className="w-8 h-8 text-primary mb-3 glow-cyan" />
              <h3 className="font-semibold text-lg mb-2">{policy.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {policy.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="glass-strong p-6 md:p-8 rounded-xl mb-8"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gradient-secondary">
            Your Rights
          </h2>
          <div className="space-y-3 text-sm md:text-base text-muted-foreground leading-relaxed">
            <p>
              • <strong className="text-foreground">Right to Access:</strong> You have full access to all messages and files in your room during the active session.
            </p>
            <p>
              • <strong className="text-foreground">Right to Delete:</strong> You can delete your own messages at any time during the session.
            </p>
            <p>
              • <strong className="text-foreground">Right to Leave:</strong> You can exit any room at any time, and your participation data will be deleted within 3 hours.
            </p>
            <p>
              • <strong className="text-foreground">Data Retention:</strong> All data is automatically purged after 3 hours, ensuring nothing persists beyond the temporary session.
            </p>
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
