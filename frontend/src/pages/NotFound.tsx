import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center glass-strong p-12 rounded-2xl max-w-md animate-slide-up">
        <h1 className="mb-4 text-6xl font-bold text-gradient-primary">404</h1>
        <p className="mb-6 text-xl text-foreground">Oops! Room not found</p>
        <p className="mb-8 text-muted-foreground">
          This room doesn't exist or has been closed.
        </p>
        <a 
          href="/" 
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-smooth font-medium glow-cyan"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
