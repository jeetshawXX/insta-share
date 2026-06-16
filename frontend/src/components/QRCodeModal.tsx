import { QRCodeSVG } from 'qrcode.react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { getRoomUrl } from '@/lib/roomCode';
import { toast } from 'sonner';

interface QRCodeModalProps {
  roomCode: string;
  open: boolean;
  onClose: () => void;
}

/**
 * QR code modal for easy room sharing
 */
export function QRCodeModal({ roomCode, open, onClose }: QRCodeModalProps) {
  const roomUrl = getRoomUrl(roomCode);

  const handleDownload = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `instashare-${roomCode}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('QR code downloaded!');
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-strong sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gradient-primary">Share Room</DialogTitle>
          <DialogDescription>
            Scan this QR code to join the room instantly
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          <div className="bg-white p-6 rounded-lg">
            <QRCodeSVG
              id="qr-code"
              value={roomUrl}
              size={200}
              level="H"
              includeMargin
            />
          </div>

          <div className="glass p-3 rounded-lg w-full">
            <p className="text-center font-mono text-sm break-all">{roomUrl}</p>
          </div>

          <Button onClick={handleDownload} className="w-full gap-2 glow-cyan">
            <Download className="w-4 h-4" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
