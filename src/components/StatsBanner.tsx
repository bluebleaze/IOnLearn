"use client";
import React from "react";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ListTodo,
  CheckCheck,
  X,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { TodoTask } from "../types";

interface StatsBannerProps {
  tasks: TodoTask[];
  onQuickFilter: (status: "all" | "pending" | "completed" | "ai-ready") => void;
  currentFilter: string;
  syncNotification: string | null;
  onDismissNotification: () => void;
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

  return (
    <div className="space-y-3 mb-4">
      {/* Real-time Sync Alert Notification */}
      {syncNotification && (
        <div
          id="sync-notification-alert"
          className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs sm:text-sm shadow-2xs animate-in fade-in duration-200"
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

      {/* Progress Card & Friendly Motivation */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base shrink-0 border border-indigo-100">
              {completionPercentage === 100 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <BookOpen className="w-5 h-5 text-indigo-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {completionPercentage === 100
                  ? "Hebat! Semua tugas kamu sudah selesai!"
                  : `Kamu sudah menyelesaikan ${completed} dari ${total} tugas`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {pending > 0 ? (
                  <span>
                    Tersisa <strong className="text-slate-800 font-semibold">{pending} tugas</strong> lagi yang perlu diselesaikan.
                    {urgentTasks > 0 && (
                      <span className="text-amber-700 font-semibold ml-1 inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600 inline" />
                        {urgentTasks} tugas mendekati batas waktu
                      </span>
                    )}
                  </span>
                ) : (
                  "Waktunya istirahat atau pelajari materi baru!"
                )}
              </p>
            </div>
          </div>

          {/* Progress Bar with Percentage */}
          <div className="flex items-center gap-3 sm:w-56 shrink-0">
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700 min-w-[36px] text-right">
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Easy Filter Buttons (Harus Dikerjakan, Ada Materi, Selesai, Semua) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100">
          {/* Harus Dikerjakan (Pending) */}
          <button
            id="stat-filter-pending-btn"
            onClick={() => onQuickFilter("pending")}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentFilter === "pending"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Harus Dikerjakan</span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${
                currentFilter === "pending"
                  ? "bg-indigo-700 text-white"
                  : "bg-white text-slate-700 border border-slate-200"
              }`}
            >
              {pending}
            </span>
          </button>

          {/* Ada Bantuan Materi (AI Ready) */}
          <button
            id="stat-filter-ai-ready-btn"
            onClick={() => onQuickFilter("ai-ready")}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentFilter === "ai-ready"
                ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Ada Video/Tips</span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${
                currentFilter === "ai-ready"
                  ? "bg-violet-700 text-white"
                  : "bg-white text-slate-700 border border-slate-200"
              }`}
            >
              {aiAnalyzed}
            </span>
          </button>

          {/* Sudah Selesai (Completed) */}
          <button
            id="stat-filter-completed-btn"
            onClick={() => onQuickFilter("completed")}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentFilter === "completed"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sudah Selesai</span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${
                currentFilter === "completed"
                  ? "bg-emerald-700 text-white"
                  : "bg-white text-slate-700 border border-slate-200"
              }`}
            >
              {completed}
            </span>
          </button>

          {/* Semua Tugas (All) */}
          <button
            id="stat-filter-all-btn"
            onClick={() => onQuickFilter("all")}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentFilter === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4" />
              <span>Semua Tugas</span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${
                currentFilter === "all"
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-700 border border-slate-200"
              }`}
            >
              {total}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
