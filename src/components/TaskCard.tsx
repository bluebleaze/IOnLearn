"use client";
import React from "react";
import {
  Check,
  Clock,
  Sparkles,
  Youtube,
  FileText,
  ChevronRight,
  ListChecks,
  Paperclip,
  AlertCircle,
  Loader2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { TodoTask } from "../types";

interface TaskCardProps {
  task: TodoTask;
  onToggleComplete: (taskId: string) => void;
  onAnalyzeWithAI?: (taskId: string) => void;
  onOpenDetails: (task: TodoTask) => void;
  onOpenChat?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onBreakdownToTodo?: (task: TodoTask) => void;
  isBreakingDown?: boolean;
}

const truncateWords = (text: string, maxWords: number = 12): string => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onOpenDetails,
}) => {
  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.isCompleted) {
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.85 },
          colors: ["#818cf8", "#34d399", "#fbbf24"],
        });
      } catch (err) {}
    }
    onToggleComplete(task.id);
  };

  // Due date status badge
  let dueBadge = null;
  if (task.dueDateStr) {
    if (task.isCompleted) {
      dueBadge = (
        <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-[#737373]">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{task.dueDateStr}</span>
        </span>
      );
    } else if (task.dueTimestamp) {
      const diffHours = (task.dueTimestamp - Date.now()) / (1000 * 3600);
      if (diffHours < 0) {
        dueBadge = (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-[#f87171]">
            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-[#f87171]" />
            <span>Terlewat ({task.dueDateStr})</span>
          </span>
        );
      } else if (diffHours <= 24) {
        dueBadge = (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-[#fbbf24]">
            <Clock className="w-3 h-3 text-amber-600 dark:text-[#fbbf24]" />
            <span>Hari Ini ({task.dueDateStr})</span>
          </span>
        );
      } else if (diffHours <= 48) {
        dueBadge = (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300">
            <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />
            <span>Besok ({task.dueDateStr})</span>
          </span>
        );
      } else {
        dueBadge = (
          <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-[#a3a3a3]">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{task.dueDateStr}</span>
          </span>
        );
      }
    } else {
      dueBadge = (
        <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-[#a3a3a3]">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{task.dueDateStr}</span>
        </span>
      );
    }
  }

  const checklistTotal = task.aiAnalysis?.checklist?.length || 0;
  const checklistDone = task.aiAnalysis?.checklist?.filter((c) => c.done)?.length || 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenDetails(task);
    }
  };

  return (
    <div
      id={`task-card-${task.id}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails(task)}
      onKeyDown={handleKeyDown}
      className={`group rounded-2xl p-4.5 sm:p-5 shadow-2xs border transition-all duration-150 flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#121212] ${
        task.isCompleted
          ? "bg-slate-50/60 dark:bg-[#141414]/50 border-slate-200/70 dark:border-[#222] opacity-80"
          : "bg-white dark:bg-[#161616] border-slate-200/80 dark:border-[#262626] hover:border-indigo-400 dark:hover:border-indigo-900/60 hover:shadow-xs"
      }`}
    >
      <div className="space-y-2.5">
        {/* Top Header: Course Pill + Due Date + Checkbox */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-[#1f1f28] text-indigo-700 dark:text-[#a5b4fc] max-w-[170px] truncate">
              {task.courseName || "Kuliah"}
            </span>

            {dueBadge}

            {task.points !== undefined && (
              <span className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                {task.points} pts
              </span>
            )}
          </div>

          {/* Quick Checkbox Button */}
          <button
            id={`task-checkbox-${task.id}`}
            type="button"
            onClick={handleCheck}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
              }
            }}
            className="min-w-[44px] min-h-[44px] -m-2.5 flex items-center justify-center cursor-pointer shrink-0 focus-visible:outline-none"
            title={task.isCompleted ? "Tandai belum selesai" : "Tandai sudah selesai"}
            aria-label={task.isCompleted ? `Tandai "${task.title}" belum selesai` : `Tandai "${task.title}" sudah selesai`}
          >
            <span
              className={`w-5.5 h-5.5 rounded-md flex items-center justify-center transition focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                task.isCompleted
                  ? "bg-emerald-500 text-white shadow-2xs"
                  : "border border-slate-300 hover:border-emerald-500 dark:border-[#444] text-slate-700 dark:text-[#f5f5f5]"
              }`}
            >
              {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
            </span>
          </button>
        </div>

        {/* Task Title */}
        <h3
          className={`font-heading text-sm sm:text-base font-bold tracking-tight leading-snug break-words transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ${
            task.isCompleted
              ? "text-slate-600 dark:text-[#888]"
              : "text-slate-900 dark:text-[#f5f5f5]"
          }`}
          title={task.title}
        >
          {truncateWords(task.title, 12)}
        </h3>

        {/* Short Description */}
        {task.description && (
          <p className="text-xs text-slate-600 dark:text-[#a3a3a3] line-clamp-2 leading-relaxed">
            {truncateWords(task.description, 16)}
          </p>
        )}

        {/* Attachments Indicator (Clean count pill) */}
        {task.materials && task.materials.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-[#a3a3a3]">
            <Paperclip className="w-3.5 h-3.5" />
            <span>{task.materials.length} Lampiran</span>
          </div>
        )}
      </div>

      {/* Quiet Status Footer */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-[#222] flex items-center justify-between text-xs text-slate-500 dark:text-[#888]">
        {task.aiLoading ? (
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-medium animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Menyusun AI...</span>
          </div>
        ) : task.aiAnalysis ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-[#1f1f28] text-indigo-700 dark:text-[#a5b4fc]">
              <Sparkles className="w-3 h-3 text-indigo-600 dark:text-[#818cf8]" />
              Rangkuman AI
            </span>
            {checklistTotal > 0 && (
              <span className="text-xs text-slate-600 dark:text-[#a3a3a3]">
                {checklistDone}/{checklistTotal} Langkah
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-500 dark:text-[#a3a3a3]">
            Klik untuk detail & AI
          </span>
        )}

        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-indigo-600 dark:text-[#818cf8] group-hover:translate-x-0.5 transition-transform">
          <span>Detail</span>
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
