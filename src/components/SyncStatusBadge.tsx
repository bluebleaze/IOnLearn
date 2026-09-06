"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { useShell } from "./Shell";

export function formatTimeAgo(date: Date | null): string {
  if (!date) return "Sinkron Otomatis";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 30) return "Baru saja";
  if (seconds < 60) return `${seconds} dtk lalu`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

interface SyncStatusBadgeProps {
  className?: string;
  showRefreshButton?: boolean;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  className = "",
  showRefreshButton = true,
}) => {
  const { isSyncing, lastSyncedAt, syncClassroom } = useShell();
  const [timeAgoText, setTimeAgoText] = useState<string>("Sinkron Otomatis");

  useEffect(() => {
    setTimeAgoText(formatTimeAgo(lastSyncedAt));
    const timer = setInterval(() => {
      setTimeAgoText(formatTimeAgo(lastSyncedAt));
    }, 30000);
    return () => clearInterval(timer);
  }, [lastSyncedAt]);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] text-xs text-slate-600 dark:text-[#a0a0a0] ${className}`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isSyncing
              ? "bg-indigo-500 animate-ping"
              : "bg-emerald-500"
          }`}
        />
        <span className="truncate">
          {isSyncing ? "Menyinkronkan Classroom..." : `Sinkron: ${timeAgoText}`}
        </span>
      </div>

      {showRefreshButton && (
        <button
          type="button"
          onClick={() => syncClassroom()}
          disabled={isSyncing}
          className="p-1 -mr-1 rounded-lg hover:bg-slate-200 dark:hover:bg-[#252525] text-slate-500 dark:text-[#888] hover:text-slate-800 dark:hover:text-[#eee] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shrink-0"
          title="Tarik tugas terbaru dari Google Classroom"
          aria-label="Refresh data Google Classroom"
        >
          <RefreshCw
            className={`w-3 h-3 ${isSyncing ? "animate-spin text-indigo-500" : ""}`}
          />
        </button>
      )}
    </div>
  );
};
