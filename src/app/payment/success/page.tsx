"use client";

import { useEffect } from "react";

export default function PaymentSuccess() {
  useEffect(() => {
    try {
      const tg = (window as unknown as { Telegram?: { WebApp?: { close: () => void } } }).Telegram?.WebApp;
      if (tg) {
        setTimeout(() => tg.close(), 2000);
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-white">Оплата прошла успешно!</h1>
        <p className="text-sm text-gray-400">
          Баланс будет обновлён автоматически. Вернитесь в Telegram и откройте приложение.
        </p>
        <p className="text-xs text-gray-600 pt-2">
          Эту вкладку можно закрыть.
        </p>
      </div>
    </div>
  );
}
