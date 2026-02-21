"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Plan {
  id: string;
  label: string;
  price: number;
  days: number;
  badge?: string;
}

const PLANS: Plan[] = [
  { id: "1month", label: "30 дней", price: 99, days: 30 },
  { id: "2months", label: "60 дней", price: 169, days: 60, badge: "Хит" },
  { id: "3months", label: "90 дней", price: 249, days: 90 },
];

interface DeviceData {
  id: string;
  name: string;
  vlessLink: string | null;
  subscriptionUntil: string | null;
  trialUsed: boolean;
  isActive: boolean;
  links: string[];
}

interface DeviceCardProps {
  device: DeviceData;
  balance: number;
  onSubscribe: (deviceId: string, planId: string, price: number, days: number) => Promise<void>;
  onDelete: (deviceId: string) => Promise<void>;
  subscribing: boolean;
}

export function DeviceCard({
  device,
  balance,
  onSubscribe,
  onDelete,
  subscribing,
}: DeviceCardProps) {
  const [showPlans, setShowPlans] = useState(false);
  const [selected, setSelected] = useState("2months");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentPlan = PLANS.find((p) => p.id === selected)!;
  const canAfford = balance >= currentPlan.price;
  const vlessLink = device.vlessLink || device.links?.find((l) => l.startsWith("vless://")) || device.links?.[0];

  const daysLeft = device.subscriptionUntil
    ? Math.max(0, Math.ceil((new Date(device.subscriptionUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const statusLabel = device.isActive
    ? daysLeft <= 3 && device.trialUsed && daysLeft > 0
      ? "Пробный период"
      : "Активно"
    : device.subscriptionUntil
      ? "Истекло"
      : "Не активно";

  const statusColor = device.isActive ? "text-green-400" : "text-red-400";
  const statusBg = device.isActive ? "bg-green-500/10" : "bg-red-500/10";

  const handleCopy = async () => {
    if (!vlessLink) return;
    try {
      await navigator.clipboard.writeText(vlessLink);
      toast.success("Скопировано");
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  return (
    <div className="bg-[#161616] rounded-2xl border border-[#222] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#222] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white">{device.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusColor} ${statusBg}`}>
            {statusLabel}
          </span>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-gray-600 hover:text-red-400 transition-colors p-0.5"
              title="Удалить устройство"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={async () => {
                  setDeleting(true);
                  await onDelete(device.id);
                  setDeleting(false);
                }}
                disabled={deleting}
                className="text-[10px] bg-red-500/80 hover:bg-red-500 text-white px-2 py-0.5 rounded-md font-medium disabled:opacity-50"
              >
                {deleting ? "..." : "Да"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[10px] bg-[#333] hover:bg-[#444] text-gray-300 px-2 py-0.5 rounded-md font-medium"
              >
                Нет
              </button>
            </div>
          )}
        </div>
      </div>

      {device.subscriptionUntil && (
        <p className="text-xs text-gray-500">
          {device.isActive ? "До" : "Истекла"} {formatDate(device.subscriptionUntil)}
          {device.isActive && daysLeft > 0 && (
            <span className="text-gray-600">
              {" "}({daysLeft} {daysLeft === 1 ? "день" : daysLeft < 5 ? "дня" : "дней"})
            </span>
          )}
        </p>
      )}

      {vlessLink && (
        <div className="space-y-2">
          <div className="bg-[#0a0a0a] rounded-xl p-3 border border-[#222]">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">VLESS</p>
            <p className="text-xs text-gray-400 font-mono truncate">{vlessLink}</p>
          </div>
          <button
            onClick={handleCopy}
            className="w-full bg-[#222] hover:bg-[#2a2a2a] text-gray-300 text-xs font-medium rounded-xl h-8 transition-all border border-[#333]"
          >
            Скопировать
          </button>
        </div>
      )}

      {!device.isActive || showPlans ? (
        <div className="space-y-2 pt-1">
          <button
            onClick={() => setShowPlans(false)}
            className="text-[11px] text-gray-400 hover:text-gray-300"
          >
            Скрыть тарифы
          </button>

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
                  <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-gray-400"}`}>
                    {plan.label}
                  </span>
                  <span className={`text-sm font-bold mt-0.5 ${isSelected ? "text-white" : "text-gray-400"}`}>
                    {plan.price} ₽
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              canAfford && onSubscribe(device.id, currentPlan.id, currentPlan.price, currentPlan.days)
            }
            disabled={subscribing}
            className={`w-full font-semibold rounded-xl h-9 text-xs transition-all disabled:opacity-40 ${
              canAfford
                ? "bg-green-500 hover:bg-green-600 text-black"
                : "bg-red-500/80 hover:bg-red-500 text-white"
            }`}
          >
            {subscribing
              ? "Обработка..."
              : canAfford
                ? `Продлить — ${currentPlan.price} ₽`
                : "Недостаточно средств"}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowPlans(true)}
          className={`w-full font-medium rounded-xl h-8 text-xs transition-all border ${
            device.isActive
              ? "bg-[#222] hover:bg-[#2a2a2a] text-gray-300 border-[#333]"
              : "bg-green-500 hover:bg-green-600 text-black border-green-500"
          }`}
        >
          {device.isActive ? "Продлить подписку" : "Выбрать тариф"}
        </button>
      )}
    </div>
  );
}
