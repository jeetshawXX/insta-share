import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Supabase client for frontend
 * Uses anon key - safe to use in browser
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUCKET_NAME = import.meta.env.VITE_SUPABASE_BUCKET || 'room-media';

/**
 * Upload a file to Supabase Storage
 * @param file File to upload
 * @param roomCode Room code for organizing files
 * @returns Public URL of uploaded file
 */
export async function uploadFile(file: File, roomCode: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${roomCode}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Get file type from URL
 */
export function getFileType(url: string): 'image' | 'video' | 'unknown' {
  const ext = url.split('.').pop()?.toLowerCase();
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
  
  if (ext && imageExts.includes(ext)) return 'image';
  if (ext && videoExts.includes(ext)) return 'video';
  return 'unknown';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
