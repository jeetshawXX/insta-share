import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { useState } from "react";

export default function FAQ() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    {
      question: "How long do rooms stay active?",
      answer: "Rooms remain active as long as there are participants connected. However, all room data is automatically deleted after 3 hours of the last activity, regardless of whether participants are still connected."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes! All data transmission is encrypted, and we don't require any personal information. Your conversations are only accessible to room participants, and all data is permanently deleted after 3 hours."
    },
    {
      question: "Do I need to create an account?",
      answer: "No! InstaShare is completely anonymous and requires no sign-up. Just create or join a room, set a temporary username, and start sharing."
    },
    {
      question: "Can I upload files and images?",
      answer: "Yes! You can upload images and videos directly in the chat. Files are temporarily stored and will be deleted along with all other room data after 3 hours."
    },
    {
      question: "What types of content can I share?",
      answer: "You can share text messages, syntax-highlighted code snippets in various programming languages, images, and videos. Perfect for collaboration, debugging, and quick file sharing."
    },
    {
      question: "Can I delete my messages?",
      answer: "Yes! You can delete your own messages at any time during the session. Click the delete icon on your message bubble to remove it from the conversation."
    },
    {
      question: "How do I share a room with others?",
      answer: "You can share your room in three ways: share the 8-character room code, share the direct link, or show the QR code for others to scan with their mobile devices."
    },
    {
      question: "Can I use InstaShare for code collaboration?",
      answer: "Absolutely! InstaShare supports syntax-highlighted code snippets for many programming languages, making it perfect for code reviews, debugging sessions, and technical discussions."
    },
    {
      question: "What browsers are supported?",
      answer: "InstaShare works on all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of your preferred browser."
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("https://formspree.io/f/xdkyzvga", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: `New question from ${formData.name} - InstaShare`
        })
      });

      if (response.ok) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <div className="relative z-10 w-full max-w-4xl mx-auto p-6 md:p-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 mt-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <HelpCircle className="w-10 h-10 md:w-12 md:h-12 text-primary glow-cyan" />
            <h1 className="text-3xl md:text-5xl font-bold">
              <span className="text-gradient-primary">FAQ</span>
            </h1>
          </div>
          
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Find answers to commonly asked questions about InstaShare, its features, and how to use it effectively.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="border border-primary/20 rounded-lg px-4 py-1 hover:border-primary/40 transition-all"
              >
                <AccordionTrigger className="text-left hover:text-primary transition-colors py-3 hover:no-underline">
                  <span className="font-semibold text-sm md:text-base text-white">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed pt-1 pb-3">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-strong p-6 md:p-8 rounded-xl mb-8"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-3 text-gradient-secondary">
            Still Have Questions?
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mb-6">
            Can't find what you're looking for? Drop a message here or Email us at <b>contact@instashare.in</b> and we'll get back to you as soon as possible.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                Your Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-2 border-primary/30 text-white placeholder:text-white/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="contact@instashare.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/5 border-2 border-primary/30 text-white placeholder:text-white/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                Your Message
              </label>
              <Textarea
                id="message"
                placeholder="Type your question or message here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-white/5 border-2 border-primary/30 text-white placeholder:text-white/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-all min-h-[120px] resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary/40 hover:bg-primary/70 text-white font-semibold py-6 rounded-xl transition-all glow-cyan group"
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  Send Message
                </>
              )}
            </Button>
          </form>
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
