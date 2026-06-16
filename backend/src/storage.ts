import { supabase, BUCKET_NAME, FILE_RETENTION_HOURS } from './supabase';

interface FileMetadata {
  name: string;
  created_at: string;
}

/**
 * Delete files older than the retention period
 */
export async function cleanupOldFiles(): Promise<{ deleted: number; errors: number }> {
  try {
    console.log('🧹 Starting file cleanup...');
    
    // List all files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' },
      });

    if (listError) {
      console.error('❌ Error listing files:', listError);
      return { deleted: 0, errors: 1 };
    }

    if (!files || files.length === 0) {
      console.log('📭 No files to clean up');
      return { deleted: 0, errors: 0 };
    }

    const now = Date.now();
    const retentionMs = FILE_RETENTION_HOURS * 60 * 60 * 1000;
    const filesToDelete: string[] = [];

    // Find files older than retention period
    for (const file of files as FileMetadata[]) {
      const createdAt = new Date(file.created_at).getTime();
      const age = now - createdAt;

      if (age > retentionMs) {
        filesToDelete.push(file.name);
      }
    }

    if (filesToDelete.length === 0) {
      console.log('✅ No old files found');
      return { deleted: 0, errors: 0 };
    }

    console.log(`🗑️  Found ${filesToDelete.length} file(s) to delete`);

    // Delete files
    const { data: deleteData, error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filesToDelete);

    if (deleteError) {
      console.error('❌ Error deleting files:', deleteError);
      return { deleted: 0, errors: filesToDelete.length };
    }

    console.log(`✅ Successfully deleted ${filesToDelete.length} file(s)`);
    return { deleted: filesToDelete.length, errors: 0 };
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return { deleted: 0, errors: 1 };
  }
}

/**
 * Start automatic cleanup job
 * Runs every hour
 */
export function startCleanupJob() {
  // Run immediately
  cleanupOldFiles();

  // Run every hour
  setInterval(() => {
    cleanupOldFiles();
  }, 60 * 60 * 1000); // 1 hour

  console.log(`🔄 File cleanup job started (runs every hour, deletes files older than ${FILE_RETENTION_HOURS}h)`);
}

/**
 * Delete a specific file
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('❌ Error deleting file:', error);
      return false;
    }

    console.log(`🗑️  Deleted file: ${filePath}`);
    return true;
  } catch (error) {
    console.error('❌ Delete error:', error);
    return false;
  }
}

/**
 * Delete all files in a room folder
 */
export async function deleteRoomFiles(roomCode: string): Promise<number> {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(roomCode);

    if (listError || !files) {
      console.error('❌ Error listing room files:', listError);
      return 0;
    }

    if (files.length === 0) {
      return 0;
    }

    const filePaths = files.map((file) => `${roomCode}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (deleteError) {
      console.error('❌ Error deleting room files:', deleteError);
      return 0;
    }

    console.log(`🗑️  Deleted ${files.length} file(s) from room ${roomCode}`);
    return files.length;
  } catch (error) {
    console.error('❌ Delete room files error:', error);
    return 0;
  }
}
