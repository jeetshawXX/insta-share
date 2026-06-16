import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Image, Video, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { uploadFile, formatFileSize } from '@/lib/supabase';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

interface FileUploadProps {
  roomCode: string;
  onUploadComplete: (url: string, type: 'image' | 'video', fileName: string, fileSize: number) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
};

/**
 * File upload component with drag & drop support
 */
export function FileUpload({ roomCode, onUploadComplete, disabled }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}` };
    }

    // Check file type
    const allAllowedTypes = [...ALLOWED_TYPES.image, ...ALLOWED_TYPES.video];
    if (!allAllowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, MOV) are allowed' };
    }

    return { valid: true };
  };

  const getFileType = (file: File): 'image' | 'video' => {
    if (ALLOWED_TYPES.image.includes(file.type)) return 'image';
    return 'video';
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress (Supabase doesn't provide upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const url = await uploadFile(selectedFile, roomCode);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      const fileType = getFileType(selectedFile);
      onUploadComplete(url, fileType, selectedFile.name, selectedFile.size);

      // Reset
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload Button */}
      {!selectedFile && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-2 h-10 border-border/50 hover:bg-primary/10"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload</span>
        </Button>
      )}

      {/* Preview & Upload UI */}
      {selectedFile && previewUrl && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-background rounded-lg shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload File</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Preview */}
            <div className="relative mb-4 rounded-lg overflow-hidden bg-muted flex items-center justify-center min-h-[200px] max-h-[400px]">
              {getFileType(selectedFile) === 'image' ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-[400px] object-contain"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="max-w-full max-h-[400px] object-contain"
                />
              )}
            </div>

            {/* File Info */}
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                {getFileType(selectedFile) === 'image' ? (
                  <Image className="h-4 w-4 text-blue-500" />
                ) : (
                  <Video className="h-4 w-4 text-purple-500" />
                )}
                <span className="font-medium truncate">{selectedFile.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)} • {getFileType(selectedFile)}
              </div>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={cn(
                      'bg-primary h-2 rounded-full transition-all duration-300',
                      uploadProgress === 100 && 'bg-green-500'
                    )}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload & Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
