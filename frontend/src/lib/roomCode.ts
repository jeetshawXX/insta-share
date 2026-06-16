/**
 * Room code generation and validation utilities
 */

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar chars like I, O, 0, 1

/**
 * Generate a random room code
 * @param length - Length of the room code (default: 6)
 * @returns Random room code
 */
export function generateRoomCode(length: number = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

/**
 * Validate a room code format
 * @param code - Room code to validate
 * @returns True if valid format
 */
export function isValidRoomCode(code: string): boolean {
  return /^[A-Z0-9]{4,8}$/.test(code);
}

/**
 * Format room code with separators for display
 * @param code - Room code to format
 * @returns Formatted code (e.g., "ABC-DEF")
 */
export function formatRoomCode(code: string): string {
  if (code.length <= 3) return code;
  const mid = Math.floor(code.length / 2);
  return `${code.slice(0, mid)}-${code.slice(mid)}`;
}

/**
 * Copy text to clipboard with fallback
 * @param text - Text to copy
 * @returns Promise<boolean> - Success status
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (e) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Get the full shareable URL for a room
 * @param roomCode - Room code
 * @returns Full URL
 */
export function getRoomUrl(roomCode: string): string {
  return `${window.location.origin}/room/${roomCode}`;
}
