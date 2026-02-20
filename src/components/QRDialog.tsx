"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

interface QRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
}

export function QRDialog({ open, onOpenChange, url }: QRDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161616] border-[#222] text-white max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">QR-код подключения</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-4 rounded-2xl">
            <QRCodeSVG value={url} size={200} level="M" />
          </div>
          <p className="text-xs text-gray-500 text-center max-w-[250px]">
            Отсканируйте QR-код в V2Ray, Shadowsocks или другом VPN-клиенте
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
