"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface BalanceCardProps {
  balance: number;
  onTopUp: () => void;
}

export function BalanceCard({ balance, onTopUp }: BalanceCardProps) {
  return (
    <div className="bg-[#161616] rounded-2xl border border-[#222] p-5">
      <div className="flex flex-col items-center gap-4">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Баланс</span>
        <p className="text-4xl font-bold text-white tabular-nums">
          {formatCurrency(balance)}
        </p>
        <Button
          onClick={onTopUp}
          className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl h-11 text-sm"
        >
          Пополнить баланс
        </Button>
      </div>
    </div>
  );
}
