"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTelegram } from "@/components/TelegramProvider";
import { toast } from "sonner";

interface TopUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const PRESET_AMOUNTS = [100, 300, 500, 1000];

export function TopUpDialog({ open, onOpenChange, onSuccess }: TopUpDialogProps) {
  const { apiFetch } = useTelegram();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTopUp = async () => {
    const num = Number(amount);
    if (!num || num < 10) {
      toast.error("Минимальная сумма — 10 ₽");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/billing/topup", {
        method: "POST",
        body: JSON.stringify({ amount: num }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка создания платежа");
      }

      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Перенаправление на оплату...");
        onOpenChange(false);
        onSuccess();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка оплаты");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161616] border-[#222] text-white max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">Пополнение баланса</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(String(preset))}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                  amount === String(preset)
                    ? "bg-green-500/20 text-green-400 border border-green-500/40"
                    : "bg-[#222] text-gray-400 border border-[#333] hover:border-[#444]"
                }`}
              >
                {preset} ₽
              </button>
            ))}
          </div>

          <Input
            type="number"
            placeholder="Или введите сумму..."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={10}
            max={100000}
            className="bg-[#0d0d0d] border-[#2a2a2a] text-white rounded-xl h-11 focus:border-green-500/50 focus:ring-green-500/20"
          />

          <Button
            onClick={handleTopUp}
            disabled={loading || !amount || Number(amount) < 10}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl h-11 disabled:opacity-40"
          >
            {loading ? "Создание платежа..." : `Оплатить ${amount ? amount + " ₽" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
