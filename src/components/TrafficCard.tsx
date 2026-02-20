"use client";

import { formatBytes } from "@/lib/utils";

interface TrafficCardProps {
  usedTraffic: number;
  dataLimit: number | null;
}

export function TrafficCard({ usedTraffic, dataLimit }: TrafficCardProps) {
  const percentage =
    dataLimit && dataLimit > 0
      ? Math.min((usedTraffic / dataLimit) * 100, 100)
      : null;

  return (
    <div className="bg-[#161616] rounded-2xl border border-[#222] p-4 space-y-3">
      <span className="text-xs text-gray-500 uppercase tracking-wider">Трафик</span>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-white tabular-nums">
          {formatBytes(usedTraffic)}
        </span>
        <span className="text-sm text-gray-500">
          / {dataLimit && dataLimit > 0 ? formatBytes(dataLimit) : "∞"}
        </span>
      </div>

      {percentage !== null && (
        <div className="w-full bg-[#222] rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              percentage > 90
                ? "bg-red-500"
                : percentage > 70
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {(!dataLimit || dataLimit === 0) && (
        <p className="text-[11px] text-gray-600">Неограниченный трафик</p>
      )}
    </div>
  );
}
