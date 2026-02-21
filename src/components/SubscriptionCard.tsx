"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";

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

const MAX_DEVICES = 5;

interface SubscriptionCardProps {
  subscriptionUntil: string | null;
  balance: number;
  loading: boolean;
  deviceCount: number;
  onSubscribe: (planId: string, price: number, days: number) => void;
}

export function SubscriptionCard({
  subscriptionUntil,
  balance,
  loading,
  deviceCount,
  onSubscribe,
}: SubscriptionCardProps) {
  const isActive = subscriptionUntil && new Date(subscriptionUntil) > new Date();
  const [showPlans, setShowPlans] = useState(false);
  const [selected, setSelected] = useState("2months");
  const currentPlan = PLANS.find((p) => p.id === selected)!;
  const canAfford = balance >= currentPlan.price;

  if (isActive && !showPlans) {
    const daysLeft = Math.max(
      0,
      Math.ceil((new Date(subscriptionUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    return (
      <div className="bg-[#161616] rounded-2xl border border-[#222] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Подписка</span>
          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
            Активна
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-white font-medium">
              {deviceCount} из {MAX_DEVICES} устройств
            </p>
            <p className="text-xs text-gray-500">
              До {formatDate(subscriptionUntil)}
              {daysLeft > 0 && (
                <span className="text-gray-600">
                  {" "}({daysLeft} {daysLeft === 1 ? "день" : daysLeft < 5 ? "дня" : "дней"})
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPlans(true)}
          className="w-full bg-[#222] hover:bg-[#2a2a2a] text-gray-300 border border-[#333] font-medium rounded-xl h-10 text-sm transition-all"
        >
          Изменить подписку
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Тарифы</span>
        {isActive && (
          <button
            onClick={() => setShowPlans(false)}
            className="text-[11px] text-green-400 hover:text-green-300"
          >
            Назад
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {PLANS.map((plan) => {
          const isSelected = selected === plan.id;

          return (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`relative flex flex-col items-center rounded-2xl border p-4 transition-all ${
                isSelected
                  ? "bg-[#0f1f0f] border-green-500/50 ring-1 ring-green-500/20"
                  : "bg-[#161616] border-[#222] hover:border-[#333]"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-semibold bg-green-500 text-black px-2 py-0.5 rounded-full whitespace-nowrap">
                  {plan.badge}
                </span>
              )}

              <span className={`text-sm font-bold ${isSelected ? "text-white" : "text-gray-300"}`}>
                {plan.label}
              </span>

              <span className={`text-lg font-bold mt-1 ${isSelected ? "text-white" : "text-gray-300"}`}>
                {plan.price} ₽
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => canAfford && onSubscribe(currentPlan.id, currentPlan.price, currentPlan.days)}
        disabled={loading}
        className={`w-full font-semibold rounded-xl h-11 text-sm transition-all disabled:opacity-40 ${
          canAfford
            ? "bg-green-500 hover:bg-green-600 text-black"
            : "bg-red-500/80 hover:bg-red-500 text-white"
        }`}
      >
        {loading
          ? "Обработка..."
          : canAfford
            ? `Оформить подписку — ${currentPlan.price} ₽`
            : "Недостаточно средств"}
      </button>
    </div>
  );
}
