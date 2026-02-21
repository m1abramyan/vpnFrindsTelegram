"use client";

import { useEffect, useState, useCallback } from "react";
import { useTelegram } from "@/components/TelegramProvider";
import { StatusIndicator } from "@/components/StatusIndicator";
import { BalanceCard } from "@/components/BalanceCard";
import { DeviceCard } from "@/components/DeviceCard";
import { TopUpDialog } from "@/components/TopUpDialog";
import { VlessDialog } from "@/components/VlessDialog";
import { toast } from "sonner";

interface DeviceData {
  id: string;
  name: string;
  vlessLink: string | null;
  subscriptionUntil: string | null;
  trialUsed: boolean;
  isActive: boolean;
  links: string[];
}

interface DevicesResponse {
  devices: DeviceData[];
  maxDevices: number;
  canAdd: boolean;
}

export function Dashboard() {
  const { apiFetch, isReady, isTelegram } = useTelegram();
  const [balance, setBalance] = useState(0);
  const [trialUsed, setTrialUsed] = useState(true);
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [maxDevices, setMaxDevices] = useState(5);
  const [canAdd, setCanAdd] = useState(true);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [addingDevice, setAddingDevice] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [vlessDialogOpen, setVlessDialogOpen] = useState(false);
  const [newDeviceVless, setNewDeviceVless] = useState("");
  const [newDeviceName, setNewDeviceName] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const authRes = await apiFetch("/api/auth", { method: "POST" });
      if (!authRes.ok) {
        const errData = await authRes.json().catch(() => ({}));
        toast.error(`Auth ${authRes.status}: ${JSON.stringify(errData).slice(0, 200)}`);
        return;
      }
      const authData = await authRes.json();
      setBalance(authData.balance);
      setTrialUsed(authData.trialUsed ?? true);
      setTelegramId(authData.telegramId);

      const devicesRes = await apiFetch("/api/devices");
      if (devicesRes.ok) {
        const data: DevicesResponse = await devicesRes.json();
        setDevices(data.devices);
        setMaxDevices(data.maxDevices);
        setCanAdd(data.canAdd);
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    if (isReady && isTelegram) fetchData();
    if (isReady && !isTelegram) setLoading(false);
  }, [isReady, isTelegram, fetchData]);

  const handleAddDevice = async () => {
    setAddingDevice(true);
    try {
      const res = await apiFetch("/api/devices", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Не удалось добавить устройство");
        return;
      }

      if (data.vlessLink) {
        setNewDeviceVless(data.vlessLink);
        setNewDeviceName(data.name || "Устройство");
        setVlessDialogOpen(true);
      }

      if (data.trialDays > 0) {
        toast.success(`Устройство добавлено! ${data.trialDays} дня бесплатно`);
      } else {
        toast.success("Устройство добавлено. Выберите тариф для активации.");
      }
      await fetchData();
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setAddingDevice(false);
    }
  };

  const handleSubscribe = async (
    deviceId: string,
    planId: string,
    price: number,
    days: number
  ) => {
    setSubscribing(true);
    try {
      const res = await apiFetch("/api/billing/subscribe", {
        method: "POST",
        body: JSON.stringify({ deviceId, planId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Ошибка оплаты подписки");
        return;
      }

      toast.success(`Подписка продлена на ${days} дней!`);
      await fetchData();
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setSubscribing(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      const res = await apiFetch(`/api/devices?id=${deviceId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Не удалось удалить устройство");
        return;
      }

      if (data.trialMessage) {
        const days = data.remainingDays ?? 0;
        const daysText = days > 0
          ? `Оставалось ${days} ${days === 1 ? "день" : days < 5 ? "дня" : "дней"}.`
          : "";
        toast.info(
          `Устройство удалено. ${daysText} ${data.trialMessage}`,
          { duration: 6000 }
        );
      } else {
        toast.success("Устройство удалено");
      }
      await fetchData();
    } catch {
      toast.error("Ошибка соединения");
    }
  };

  if (!isTelegram && isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white">Откройте в Telegram</h1>
          <p className="text-sm text-gray-400">
            Это приложение работает только внутри Telegram. Откройте бота и запустите Mini App.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-md mx-auto px-4 pb-8 space-y-4 pt-4">
        <StatusIndicator
          activeDevices={devices.filter((d) => d.isActive).length}
          totalDevices={devices.length}
        />

        <BalanceCard
          balance={balance}
          onTopUp={() => setTopUpOpen(true)}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              Устройства ({devices.length}/{maxDevices})
            </span>
          </div>

          {devices.length === 0 && (
            <div className="bg-[#161616] rounded-2xl border border-[#222] p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#222] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">Нет подключённых устройств</p>
              <p className="text-xs text-gray-600">
                {trialUsed
                  ? "Добавьте устройство и выберите тариф"
                  : "Добавьте устройство и получите 3 дня бесплатно"}
              </p>
            </div>
          )}

          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              balance={balance}
              onSubscribe={handleSubscribe}
              onDelete={handleDeleteDevice}
              subscribing={subscribing}
            />
          ))}

          {canAdd && (
            <button
              onClick={handleAddDevice}
              disabled={addingDevice}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold rounded-2xl h-12 text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addingDevice ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Добавить устройство
                </>
              )}
            </button>
          )}
        </div>
        {telegramId && (
          <p className="text-center text-[10px] text-gray-600 pt-4">
            ID: {telegramId}
          </p>
        )}
      </div>

      <TopUpDialog
        open={topUpOpen}
        onOpenChange={setTopUpOpen}
        onSuccess={() => setTimeout(fetchData, 3000)}
      />

      <VlessDialog
        open={vlessDialogOpen}
        onOpenChange={setVlessDialogOpen}
        vlessLink={newDeviceVless}
        deviceName={newDeviceName}
      />
    </div>
  );
}
