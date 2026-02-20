"use client";

import { useState } from "react";
import { toast } from "sonner";

interface ConfigCardProps {
  links: string[];
  subscriptionUrl: string;
  onShowQR: (url: string) => void;
}

export function ConfigCard({ links, subscriptionUrl, onShowQR }: ConfigCardProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const displayLinks = links.length > 0 ? links : subscriptionUrl ? [subscriptionUrl] : [];

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      toast.success("Ссылка скопирована");
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  if (displayLinks.length === 0) return null;

  return (
    <div className="bg-[#161616] rounded-2xl border border-[#222] p-4 space-y-3">
      <span className="text-xs text-gray-500 uppercase tracking-wider">Ссылки подключения</span>

      {displayLinks.map((link, idx) => {
        const protocol = link.split("://")[0]?.toUpperCase() || "LINK";
        const isCopied = copiedIdx === idx;

        return (
          <div key={idx} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-green-500 bg-green-500/10 px-2 py-0.5 rounded shrink-0">
                {protocol}
              </span>
              <div className="flex-1 min-w-0 bg-[#0d0d0d] rounded-lg px-3 py-2">
                <p className="text-[11px] font-mono text-gray-500 truncate">{link}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(link, idx)}
                className={`flex-1 rounded-xl h-9 text-xs font-medium transition-all ${
                  isCopied
                    ? "bg-green-500/15 text-green-400 border border-green-500/30"
                    : "bg-[#222] text-gray-400 hover:bg-[#2a2a2a] border border-[#333]"
                }`}
              >
                {isCopied ? "Скопировано" : "Копировать"}
              </button>
              <button
                onClick={() => onShowQR(link)}
                className="bg-[#222] text-gray-400 hover:bg-[#2a2a2a] border border-[#333] rounded-xl h-9 px-4 text-xs font-medium"
              >
                QR
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
