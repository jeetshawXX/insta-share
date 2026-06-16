import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (password: string) => void;
  title?: string;
  description?: string;
  errorMessage?: string;
}

/**
 * Password dialog for protected rooms
 */
export function PasswordDialog({
  open,
  onOpenChange,
  onSubmit,
  title = "Room Password Required",
  description = "This room is password protected. Please enter the password to join.",
  errorMessage,
}: PasswordDialogProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (password.trim()) {
      onSubmit(password);
      setPassword(""); // Clear password after submission
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && password.trim()) {
      handleSubmit();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {errorMessage || description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter room password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className={errorMessage ? "border-red-500" : ""}
            />
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setPassword("")}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={!password.trim()}>
            Join Room
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
