"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { init, retrieveLaunchParams } from "@telegram-apps/sdk-react";

interface TelegramContextValue {
  initDataRaw: string | null;
  isReady: boolean;
  isTelegram: boolean;
  apiFetch: (path: string, options?: RequestInit) => Promise<Response>;
}

const TelegramContext = createContext<TelegramContextValue>({
  initDataRaw: null,
  isReady: false,
  isTelegram: false,
  apiFetch: () => Promise.reject(new Error("Not initialized")),
});

export function useTelegram() {
  return useContext(TelegramContext);
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [initDataRaw, setInitDataRaw] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    let raw: string | null = null;
    let fromTelegram = false;

    try {
      init();
      const params = retrieveLaunchParams();
      raw = (params.initDataRaw as string) ?? null;
      if (raw) fromTelegram = true;
    } catch {
      // SDK init failed
    }

    if (!raw && typeof window !== "undefined") {
      const tgWebApp = (window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp;
      raw = tgWebApp?.initData || null;
      if (raw) fromTelegram = true;
    }

    const isLocalhost = typeof window !== "undefined" && 
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    if (!raw && process.env.NODE_ENV === "development" && isLocalhost) {
      raw = "dev_mode";
    }

    setIsTelegram(fromTelegram);
    setInitDataRaw(raw);
    setIsReady(true);
  }, []);

  const apiFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      return fetch(path, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(initDataRaw
            ? { Authorization: `tma ${initDataRaw}` }
            : {}),
          ...options.headers,
        },
      });
    },
    [initDataRaw]
  );

  return (
    <TelegramContext.Provider value={{ initDataRaw, isReady, isTelegram, apiFetch }}>
      {children}
    </TelegramContext.Provider>
  );
}
