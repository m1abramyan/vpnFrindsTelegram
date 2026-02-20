"use client";

interface StatusIndicatorProps {
  activeDevices: number;
  totalDevices: number;
}

function ShieldIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#22c55e" : "#555"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      {active && <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" />}
      {!active && <line x1="4" y1="4" x2="20" y2="20" stroke="#555" strokeWidth="1.5" />}
    </svg>
  );
}

export function StatusIndicator({ activeDevices, totalDevices }: StatusIndicatorProps) {
  const isActive = activeDevices > 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        isActive
          ? "bg-[#0f1f0f] border-green-500/30"
          : "bg-[#1f0f0f] border-red-500/20"
      }`}
    >
      {isActive && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      )}

      <div className="relative flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
            isActive
              ? "bg-green-500/15 border border-green-500/30"
              : "bg-red-500/10 border border-red-500/20"
          }`}
        >
          <ShieldIcon active={isActive} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-2 h-2 rounded-full ${
                isActive ? "bg-green-500 animate-pulse-green" : "bg-red-500"
              }`}
            />
            <span
              className={`text-base font-semibold ${
                isActive ? "text-green-400" : "text-red-400"
              }`}
            >
              {isActive ? "Активно" : "Неактивно"}
            </span>
          </div>

          <p className="text-xs text-gray-500">
            {totalDevices === 0
              ? "Нет подключённых устройств"
              : `${activeDevices} из ${totalDevices} устройств активно`}
          </p>
        </div>
      </div>
    </div>
  );
}
