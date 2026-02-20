"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";

interface VlessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vlessLink: string;
  deviceName: string;
}

export function VlessDialog({
  open,
  onOpenChange,
  vlessLink,
  deviceName,
}: VlessDialogProps) {
  const [showQR, setShowQR] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(vlessLink);
      toast.success("Конфиг скопирован");
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161616] border-[#222] text-white max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-base">
            {deviceName} создано
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-xs text-gray-400 text-center">
            Скопируйте VLESS-конфиг и вставьте его в V2Ray или другой VPN-клиент
          </p>

          <div className="bg-[#0a0a0a] rounded-xl p-3 border border-[#222]">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">
              VLESS
            </p>
            <p className="text-[11px] text-gray-300 font-mono break-all leading-relaxed">
              {vlessLink}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black text-xs font-semibold rounded-xl h-10 transition-all"
            >
              Скопировать конфиг
            </button>
            <button
              onClick={() => setShowQR((v) => !v)}
              className="bg-[#222] hover:bg-[#2a2a2a] text-gray-300 text-xs font-medium rounded-xl h-10 px-4 transition-all border border-[#333]"
            >
              QR
            </button>
          </div>

          {showQR && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <div className="bg-white p-3 rounded-xl">
                <QRCodeSVG value={vlessLink} size={180} level="M" />
              </div>
              <p className="text-[10px] text-gray-600 text-center">
                Отсканируйте в VPN-клиенте
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
