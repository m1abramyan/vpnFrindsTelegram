"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Plan {
  id: string;
  label: string;
  price: number;
  days: number;
  badge?: string;
}

const PLANS: Plan[] = [
  { id: "1month", label: "1 месяц", price: 99, days: 30 },
  { id: "2months", label: "2 месяца", price: 169, days: 60, badge: "Хит" },
  { id: "3months", label: "3 месяца", price: 249, days: 90 },
];

interface AddDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  loading: boolean;
  onConfirm: (planId: string) => void;
  onTopUp: () => void;
}

export function AddDeviceDialog({
  open,
  onOpenChange,
  balance,
  loading,
  onConfirm,
  onTopUp,
}: AddDeviceDialogProps) {
  const [selected, setSelected] = useState("2months");
  const currentPlan = PLANS.find((p) => p.id === selected)!;
  const canAfford = balance >= currentPlan.price;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161616] border-[#222] text-white max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            Новое устройство
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-xs text-gray-400 text-center">
            Выберите тариф для нового устройства
          </p>

          <div className="grid grid-cols-3 gap-2">
            {PLANS.map((plan) => {
              const isSelected = selected === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelected(plan.id)}
                  className={`relative flex flex-col items-center rounded-xl border p-3 transition-all ${
                    isSelected
                      ? "bg-[#0f1f0f] border-green-500/50 ring-1 ring-green-500/20"
                      : "bg-[#111] border-[#222] hover:border-[#333]"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-semibold bg-green-500 text-black px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {plan.badge}
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {plan.label}
                  </span>
                  <span
                    className={`text-sm font-bold mt-0.5 ${
                      isSelected ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {plan.price} ₽
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-gray-500">Баланс</span>
            <span className={canAfford ? "text-gray-300" : "text-red-400"}>
              {balance} ₽
            </span>
          </div>

          {canAfford ? (
            <button
              onClick={() => onConfirm(selected)}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold rounded-xl h-11 text-sm transition-all disabled:opacity-40"
            >
              {loading
                ? "Создание..."
                : `Создать — ${currentPlan.price} ₽`}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                disabled
                className="w-full bg-red-500/80 text-white font-semibold rounded-xl h-11 text-sm opacity-60"
              >
                Недостаточно средств
              </button>
              <button
                onClick={() => {
                  onOpenChange(false);
                  onTopUp();
                }}
                className="w-full bg-[#222] hover:bg-[#2a2a2a] text-gray-300 border border-[#333] font-medium rounded-xl h-10 text-sm transition-all"
              >
                Пополнить баланс
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
