"use client";

import dynamic from "next/dynamic";
import { useTelegram } from "@/components/TelegramProvider";

const DashboardClient = dynamic(
  () =>
    import("@/components/Dashboard").then((mod) => ({
      default: mod.Dashboard,
    })),
  { ssr: false }
);

const LandingClient = dynamic(
  () =>
    import("@/components/landing/Landing").then((mod) => ({
      default: mod.Landing,
    })),
  { ssr: false }
);

export default function Home() {
  const { isReady, isTelegram } = useTelegram();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (isTelegram) {
    return <DashboardClient />;
  }

  return <LandingClient />;
}
