"use client";

import React, { useState } from "react";
import {
  Check,
  Clock,
  Sparkles,
  ChevronRight,
  Paperclip,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
} from "lucide-react";
import { TodoTask } from "../types";
import { TaskCompleteConfirmModal } from "./TaskCompleteConfirmModal";

import { useLanguage } from "@/context/LanguageContext";

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
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const { isEn } = useLanguage();

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.isCompleted) {
      setShowConfirmComplete(true);
    } else {
      onToggleComplete(task.id);
    }
  };

  const handleConfirmDone = () => {
    onToggleComplete(task.id);
  };

  // Status computation for explicit distinction: Perlu Dikerjakan, Nanti, Telat, Selesai
  const getStatusInfo = () => {
    if (task.isCompleted) {
      return {
        label: isEn ? "Completed" : "Selesai",
        badgeClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50",
        icon: CheckCircle2,
      };
    }
    const now = Date.now();
    if (typeof task.dueTimestamp === "number" && !isNaN(task.dueTimestamp) && task.dueTimestamp < now) {
      return {
        label: isEn ? "Overdue" : "Telat",
        badgeClass: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/50",
        icon: AlertCircle,
      };
    }
    const isUrgent =
      task.priority === "high" ||
      (typeof task.dueTimestamp === "number" && !isNaN(task.dueTimestamp) && task.dueTimestamp - now <= 48 * 3600 * 1000) ||
      (!task.dueTimestamp && task.priority !== "low");

    if (isUrgent) {
      return {
        label: isEn ? "Action Needed" : "Perlu Dikerjakan",
        badgeClass: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/50",
        icon: Clock,
      };
    }
    return {
      label: isEn ? "Later" : "Nanti",
      badgeClass: "bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-[#303030]",
      icon: Calendar,
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const checklistTotal = task.aiAnalysis?.checklist?.length || 0;
  const checklistDone = task.aiAnalysis?.checklist?.filter((c) => c.done)?.length || 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenDetails(task);
    }
  };

  return (
    <>
      <div
        id={`task-card-${task.id}`}
        role="button"
        tabIndex={0}
        onClick={() => onOpenDetails(task)}
        onKeyDown={handleKeyDown}
        className={`group rounded-2xl p-4 sm:p-5 shadow-xs border transition-all duration-200 flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#121212] ${task.isCompleted
            ? "bg-slate-50/70 dark:bg-[#121212] border-slate-200/60 dark:border-[#222222] opacity-85"
            : "bg-white dark:bg-[#161616] border-slate-200/80 dark:border-[#262626] hover:border-indigo-400 dark:hover:border-indigo-600/70 hover:shadow-md hover:-translate-y-0.5"
          }`}
      >
        <div className="space-y-3">
          {/* Top Header: Course Pill + Status Badge + Checkbox */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 max-w-[170px] truncate">
                {task.courseName || (isEn ? "Course" : "Kuliah")}
              </span>

              {/* Status Badge with Label & Icon */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold border ${statusInfo.badgeClass}`}>
                <StatusIcon className="w-3 h-3 shrink-0" />
                <span>{statusInfo.label}</span>
              </span>

              {task.points !== undefined && (
                <span className="text-xs font-medium text-slate-500 dark:text-[#a3a3a3] hidden sm:inline">
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
              className="min-w-[40px] min-h-[40px] -m-2 flex items-center justify-center cursor-pointer shrink-0 focus-visible:outline-none"
              title={task.isCompleted ? (isEn ? "Mark as incomplete" : "Tandai belum selesai") : (isEn ? "Mark as completed" : "Tandai selesai")}
              aria-label={task.isCompleted ? `Tandai "${task.title}" belum selesai` : `Tandai "${task.title}" sudah selesai`}
            >
              <span
                className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 ${task.isCompleted
                    ? "bg-emerald-500 text-white shadow-2xs"
                    : "border-2 border-slate-300 hover:border-emerald-500 dark:border-[#444] text-slate-700 dark:text-[#f5f5f5]"
                  }`}
              >
                {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </span>
            </button>
          </div>

          {/* Task Title */}
          <h3
            className={`font-heading text-sm sm:text-base font-bold tracking-tight leading-snug break-words transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ${task.isCompleted
                ? "text-slate-600 dark:text-[#888] line-through decoration-slate-300 dark:decoration-slate-700"
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

          {/* Deadline info */}
          {task.dueDateStr && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#888]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? "Due: " : "Tenggat: "}<strong className="font-semibold text-slate-700 dark:text-slate-300">{task.dueDateStr}</strong></span>
            </div>
          )}

          {/* Attachments Indicator */}
          {task.materials && task.materials.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-[#a3a3a3]">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{task.materials.length} {isEn ? "Attachments" : "Lampiran File"}</span>
            </div>
          )}
        </div>

        {/* Quiet Status Footer */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-[#262626] flex items-center justify-between text-xs text-slate-500 dark:text-[#888]">
          {task.aiLoading ? (
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-medium animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{isEn ? "AI generating..." : "Menyusun AI..."}</span>
            </div>
          ) : task.aiAnalysis ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-[#202020] text-indigo-700 dark:text-[#a5b4fc]">
                {isEn ? "Summary" : "Rangkuman"}
              </span>
              {checklistTotal > 0 && (
                <span className="text-xs text-slate-600 dark:text-[#a3a3a3]">
                  {checklistDone}/{checklistTotal} {isEn ? "Steps" : "Langkah"}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-500 dark:text-[#a3a3a3]">
              {isEn ? "Click for details & AI" : "Klik untuk detail & AI"}
            </span>
          )}

          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-indigo-600 dark:text-[#818cf8] group-hover:translate-x-0.5 transition-transform">
            <span>{isEn ? "Task Details" : "Detail Tugas"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      <TaskCompleteConfirmModal
        isOpen={showConfirmComplete}
        onClose={() => setShowConfirmComplete(false)}
        onConfirm={handleConfirmDone}
        taskTitle={task.title}
        language={isEn ? "en" : "id"}
      />
    </>
  );
};
