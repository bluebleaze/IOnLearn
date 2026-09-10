"use client";
import React from "react";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ListTodo,
  CheckCheck,
  X,
} from "lucide-react";
import { TodoTask } from "../types";
import { cn } from "@/lib/utils";

interface StatsBannerProps {
  tasks: TodoTask[];
  onQuickFilter: (status: "all" | "pending" | "completed" | "ai-ready") => void;
  currentFilter: string;
  syncNotification?: string | null;
  onDismissNotification?: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  tasks,
  onQuickFilter,
  currentFilter,
  syncNotification,
  onDismissNotification,
}) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.isCompleted).length;
  const pending = total - completed;
  const aiAnalyzed = tasks.filter((t) => t.aiAnalysis && !t.isCompleted).length;

  // Urgent tasks: due within 48 hours or overdue
  const urgentTasks = tasks.filter((t) => {
    if (t.isCompleted || !t.dueTimestamp) return false;
    const diff = (t.dueTimestamp - Date.now()) / (1000 * 3600);
    return diff < 48;
  }).length;

  const completionPercentage =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  const cards: {
    id: string;
    filter: "all" | "pending" | "completed" | "ai-ready";
    label: string;
    value: number;
    icon: React.ElementType;
    tint: string;
    sub: React.ReactNode;
  }[] = [
    {
      id: "stat-filter-all-btn",
      filter: "all",
      label: "Total Tugas",
      value: total,
      icon: ListTodo,
      tint: "text-indigo-600 dark:text-[#818cf8] bg-indigo-50 dark:bg-[#141414]",
      sub: `${pending} masih perlu dikerjakan`,
    },
    {
      id: "stat-filter-pending-btn",
      filter: "pending",
      label: "Harus Dikerjakan",
      value: pending,
      icon: Clock,
      tint: "text-amber-600 dark:text-[#fbbf24] bg-amber-50 dark:bg-[#141414]",
      sub:
        urgentTasks > 0
          ? `${urgentTasks} mendekati batas waktu`
          : "Aman, semua tenggat masih longgar",
    },
    {
      id: "stat-filter-ai-ready-btn",
      filter: "ai-ready",
      label: "Ada Video & Tips",
      value: aiAnalyzed,
      icon: Sparkles,
      tint: "text-violet-600 dark:text-[#a5b4fc] bg-violet-50 dark:bg-[#141414]",
      sub: "Sudah dianalisis AI",
    },
    {
      id: "stat-filter-completed-btn",
      filter: "completed",
      label: "Selesai",
      value: completed,
      icon: CheckCircle2,
      tint: "text-emerald-600 dark:text-[#34d399] bg-emerald-50 dark:bg-[#141414]",
      sub: (
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-[#141414] overflow-hidden">
            <div
              className="h-full bg-emerald-600 dark:bg-[#34d399] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="font-bold text-emerald-600 dark:text-[#34d399]">
            {completionPercentage}%
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3 mb-5">
      {/* Real-time Sync Alert Notification */}
      {syncNotification && (
        <div
          id="sync-notification-alert"
          className="flex items-center justify-between p-3.5 bg-emerald-50 text-emerald-900 rounded-2xl text-xs sm:text-sm shadow-xs animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <CheckCheck className="w-4 h-4" />
            </div>
            <p className="font-medium truncate">{syncNotification}</p>
          </div>
          <button
            onClick={onDismissNotification}
            className="p-1 text-emerald-700 hover:text-emerald-900 rounded-lg hover:bg-emerald-100/60 transition cursor-pointer shrink-0 ml-2"
            title="Tutup pesan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {cards.map((card) => {
          const active = currentFilter === card.filter;
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              id={card.id}
              onClick={() => onQuickFilter(card.filter)}
              className={cn(
                "relative rounded-2xl p-4 text-left transition-colors cursor-pointer shadow-2xs border",
                active
                  ? "bg-indigo-50/60 dark:bg-[#1c1c24] border-indigo-500/40 dark:border-[#818cf8]/40"
                  : "bg-white dark:bg-[#161616] border-slate-200/80 dark:border-[#262626] hover:border-slate-300 dark:hover:border-[#333]"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[#a3a3a3]">
                    {card.label}
                  </p>
                  <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-[#f5f5f5]">
                    {card.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    card.tint
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5 text-xs text-slate-500 dark:text-[#a3a3a3] min-h-[14px] truncate">
                {card.sub}
              </div>
              {active && (
                <span className="absolute left-4 right-4 -bottom-px h-0.5 rounded-full bg-indigo-600 dark:bg-[#818cf8] opacity-70" />
              )}
            </button>
          );
        })}
      </div>

      {/* Friendly Motivation */}
      <p className="px-1 text-xs text-slate-500 dark:text-[#a3a3a3]">
        {completionPercentage === 100 && total > 0
          ? "Hebat! Semua tugas sudah selesai. Waktunya istirahat atau pelajari materi baru."
          : `Kamu sudah menyelesaikan ${completed} dari ${total} tugas.`}
        {urgentTasks > 0 && pending > 0 && (
          <span className="text-amber-700 dark:text-[#fbbf24] font-semibold">
            {" "}
            · {urgentTasks} tugas mendekati batas waktu.
          </span>
        )}
      </p>
    </div>
  );
};