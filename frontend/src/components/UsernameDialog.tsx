import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UsernameDialogProps {
  open: boolean;
  onUsernameSet: (username: string) => void;
  currentUsername?: string;
  onClose?: () => void;
}

/**
 * Dialog to prompt user for their username on first visit
 */
export function UsernameDialog({ open, onUsernameSet, currentUsername, onClose }: UsernameDialogProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      // Use current username if available, otherwise generate a random suggestion
      if (currentUsername) {
        setUsername(currentUsername);
      } else {
        const randomNum = Math.floor(Math.random() * 1000);
        setUsername(`User${randomNum}`);
      }
    }
  }, [open, currentUsername]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUsername = username.trim();
    
    // Validation
    if (!trimmedUsername) {
      setError('Username cannot be empty');
      return;
    }
    
    if (trimmedUsername.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    
    if (trimmedUsername.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }
    
    // Valid username
    setError('');
    onUsernameSet(trimmedUsername);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // Allow closing only if user already has a username (change username case)
        if (!isOpen && currentUsername && onClose) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => {
        // Prevent closing by clicking outside only for first-time setup
        if (!currentUsername) {
          e.preventDefault();
        }
      }}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {currentUsername ? 'Change Username' : 'Choose Your Username'}
            </DialogTitle>
            <DialogDescription>
              {currentUsername 
                ? 'Enter a new username to update your display name in the chat room.'
                : 'This will be your display name in the chat room. You can change it anytime.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className={error ? 'border-red-500' : ''}
                autoFocus
                maxLength={20}
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                2-20 characters. Letters, numbers, spaces allowed.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" className="w-full">
              {currentUsername ? 'Update Username' : 'Continue to Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
