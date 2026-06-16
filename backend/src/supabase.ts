import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Supabase client with service role key (backend only)
 * Has full access to bypass Row Level Security
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'room-media';
export const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10');
export const FILE_RETENTION_HOURS = parseInt(process.env.FILE_RETENTION_HOURS || '24');
