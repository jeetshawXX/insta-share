import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2 } from "lucide-react";

interface SetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (password: string | null) => void;
  isLoading?: boolean;
}

/**
 * Dialog to optionally set password when creating a room
 */
export function SetPasswordDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: SetPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e?: React.MouseEvent) => {
    // Prevent default dialog close behavior
    e?.preventDefault();
    
    setError("");

    // Validate password
    if (!password || !confirmPassword) {
      setError("Please fill in both password fields");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validation passed - submit and close
    onSubmit(password);
    setPassword("");
    setConfirmPassword("");
    setError("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    onSubmit(null);
    setPassword("");
    setConfirmPassword("");
    setError("");
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-primary" />
            <AlertDialogTitle>Protect This Room</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Set a password to prevent unauthorized access. Anyone trying to join
            will need to enter this password.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter password (min 4 characters)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(""); // Clear error when user types
              }}
              onKeyDown={handleKeyDown}
              autoFocus
              disabled={isLoading}
              className={error ? "border-red-500" : ""}
            />
          </div>

          {password && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(""); // Clear error when user types
                }}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className={error ? "border-red-500" : ""}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3">
              <p className="text-sm text-red-500 font-medium">{error}</p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <Button 
            onClick={handleSubmit} 
            disabled={!password || !confirmPassword || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Protecting...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Set Password
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
