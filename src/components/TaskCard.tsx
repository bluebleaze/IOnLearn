"use client";
import React from "react";
import {
  Check,
  Clock,
  Sparkles,
  ExternalLink,
  Youtube,
  BookOpen,
  FileText,
  MessageSquareText,
  ChevronRight,
  Loader2,
  Trash2,
  ListChecks,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { TodoTask } from "../types";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/brand";

interface TaskCardProps {
  task: TodoTask;
  onToggleComplete: (taskId: string) => void;
  onAnalyzeWithAI: (taskId: string) => void;
  onOpenDetails: (task: TodoTask) => void;
  onOpenChat: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onAnalyzeWithAI,
  onOpenDetails,
  onOpenChat,
  onDeleteTask,
}) => {
  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.isCompleted) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#6366f1", "#10b981", "#f59e0b", "#ec4899"],
        });
      } catch (err) {}
    }
    onToggleComplete(task.id);
  };

  // Due date status badge with high readability & clear contrast
  let dueBadge = null;
  if (task.dueDateStr) {
    if (task.isCompleted) {
      dueBadge = (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{task.dueDateStr}</span>
        </span>
      );
    } else if (task.dueTimestamp) {
      const diffHours = (task.dueTimestamp - Date.now()) / (1000 * 3600);
      if (diffHours < 0) {
        dueBadge = (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Terlewat ({task.dueDateStr})</span>
          </span>
        );
      } else if (diffHours <= 24) {
        dueBadge = (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Hari Ini ({task.dueDateStr})</span>
          </span>
        );
      } else if (diffHours <= 48) {
        dueBadge = (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60">
            <Clock className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />
            <span>Besok ({task.dueDateStr})</span>
          </span>
        );
      } else {
        dueBadge = (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{task.dueDateStr}</span>
          </span>
        );
      }
    } else {
      dueBadge = (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>{task.dueDateStr}</span>
        </span>
      );
    }
  }

  const checklistTotal = task.aiAnalysis?.checklist?.length || 0;
  const checklistDone =
    task.aiAnalysis?.checklist?.filter((c) => c.done)?.length || 0;

  return (
    <div
      id={`task-card-${task.id}`}
      className={`group rounded-2xl p-5 sm:p-6 border transition-all duration-200 ${
        task.isCompleted
          ? "bg-slate-50/80 dark:bg-[#121927]/60 border-slate-200/80 dark:border-[#252F42]/60 opacity-85"
          : "bg-white dark:bg-[#161F30] border-slate-200 dark:border-[#252F42] hover:border-indigo-300 dark:hover:border-[#9294E8]/50 hover:shadow-xs"
      }`}
    >
      {/* Top Header Row: Course Badge + Urgency + Points + Checkbox */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Badge */}
          <span className="px-2.5 py-1 rounded-[8px] text-xs font-bold bg-indigo-50 dark:bg-[#121927] text-indigo-700 dark:text-[#B0B1F2] border border-indigo-100 dark:border-[#252F42] max-w-[190px] truncate">
            {task.courseName}
          </span>

          {/* Due date badge */}
          {dueBadge}

          {/* Points */}
          {task.points !== undefined && (
            <span className="px-2.5 py-1 rounded-[8px] text-xs font-semibold bg-slate-100 dark:bg-[#121927] text-slate-700 dark:text-[#9AA6B8] border border-slate-200 dark:border-[#252F42]">
              {task.points} Poin
            </span>
          )}

          {/* Source */}
          {task.syncSource === "classroom" && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-[#91C9B5] bg-emerald-50 dark:bg-[#121927] px-2.5 py-1 rounded-[8px] border border-emerald-100 dark:border-[#252F42]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#91C9B5]" />
              Classroom
            </span>
          )}
        </div>

        {/* Big Interactive Checkbox */}
        <button
          id={`task-checkbox-${task.id}`}
          onClick={handleCheck}
          className={`w-7 h-7 rounded-[8px] flex items-center justify-center transition cursor-pointer shrink-0 active:scale-90 ${
            task.isCompleted
              ? "bg-[#91C9B5] text-[#0B0F17] shadow-xs"
              : "border-2 border-slate-300 dark:border-[#252F42] hover:border-[#9294E8] dark:hover:border-[#9294E8] bg-white dark:bg-[#121927] hover:bg-indigo-50 dark:hover:bg-[#161F30]"
          }`}
          title={
            task.isCompleted ? "Tandai belum selesai" : "Tandai sudah selesai"
          }
          aria-label={
            task.isCompleted ? "Tandai belum selesai" : "Tandai sudah selesai"
          }
        >
          {task.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
        </button>
      </div>

      {/* Main Title & Description */}
      <div className="cursor-pointer" onClick={() => onOpenDetails(task)}>
        <h3
          className={`font-heading text-base sm:text-lg font-bold tracking-tight transition hover:text-indigo-600 dark:hover:text-[#9294E8] ${
            task.isCompleted
              ? "line-through text-slate-400 dark:text-[#69758A]"
              : "text-slate-900 dark:text-[#F1F0EC]"
          }`}
        >
          {task.title}
        </h3>

        {task.description && (
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-[#9AA6B8] line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Teacher Attachments Pills (if any) */}
      {task.materials && task.materials.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-xs font-semibold text-slate-400 dark:text-[#69758A] flex items-center gap-1 mr-1">
            <Paperclip className="w-3 h-3" /> Lampiran:
          </span>
          {task.materials.slice(0, 3).map((mat, idx) => {
            const title =
              mat.driveFile?.driveFile?.title ||
              mat.youtubeVideo?.title ||
              mat.link?.title ||
              "File Lampiran";
            const link =
              mat.driveFile?.driveFile?.alternateLink ||
              mat.youtubeVideo?.alternateLink ||
              mat.link?.url ||
              "#";
            return (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-xs font-semibold bg-slate-100 dark:bg-[#121927] hover:bg-slate-200 dark:hover:bg-[#1C273D] text-slate-700 dark:text-[#9AA6B8] max-w-[160px] truncate transition border border-slate-200/60 dark:border-[#252F42]"
              >
                {mat.youtubeVideo ? (
                  <Youtube className="w-3 h-3 text-red-500 shrink-0" />
                ) : (
                  <FileText className="w-3 h-3 text-[#8FAFCB] shrink-0" />
                )}
                <span className="truncate">{title}</span>
              </a>
            );
          })}
        </div>
      )}

      {/* ClassroomAI Feature Pills Bar */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-[#252F42]">
        {task.aiLoading ? (
          <div className="flex items-center gap-2 p-2.5 rounded-[10px] bg-indigo-50/70 dark:bg-[#121927] text-indigo-700 dark:text-[#B0B1F2] border dark:border-[#252F42] text-xs font-semibold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-[#9294E8] shrink-0" />
            <span>{APP_NAME} sedang menyusun materi & video belajar...</span>
          </div>
        ) : task.aiAnalysis ? (
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Study Feature Chips */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-xs font-bold bg-indigo-50 dark:bg-[#121927] text-indigo-700 dark:text-[#B0B1F2] border border-indigo-100 dark:border-[#252F42]">
                <Sparkles className="w-3 h-3 text-[#9294E8]" />
                Rangkuman AI
              </span>

              {checklistTotal > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-xs font-semibold bg-slate-100 dark:bg-[#121927] text-slate-700 dark:text-[#9AA6B8] border border-slate-200/60 dark:border-[#252F42]">
                  <ListChecks className="w-3.5 h-3.5 text-[#91C9B5]" />
                  {checklistDone}/{checklistTotal} Langkah
                </span>
              )}

              {task.aiAnalysis.youtubeVideos?.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-xs font-semibold bg-rose-50 dark:bg-[#121927] text-rose-700 dark:text-[#E8DFC8] border border-rose-100 dark:border-[#252F42]">
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  {task.aiAnalysis.youtubeVideos.length} Video
                </span>
              )}

              {task.aiAnalysis.sources?.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-xs font-semibold bg-slate-100 dark:bg-[#121927] text-slate-700 dark:text-[#9AA6B8] border border-slate-200/60 dark:border-[#252F42]">
                  <BookOpen className="w-3.5 h-3.5 text-[#8FAFCB]" />
                  {task.aiAnalysis.sources.length} Sumber
                </span>
              )}
            </div>

            {/* Quick Open Guide */}
            <button
              onClick={() => onOpenDetails(task)}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-[#9294E8] hover:text-indigo-800 dark:hover:text-[#B0B1F2] transition cursor-pointer ml-auto"
            >
              <span>Lihat Materi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500 dark:text-[#9AA6B8]">
              Belum ada panduan & materi belajar.
            </span>
            <Button
              id={`btn-analyze-${task.id}`}
              variant="primarySubtle"
              size="sm"
              onClick={() => onAnalyzeWithAI(task.id)}
              className="gap-1.5 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9294E8]" />
              <span>Buat Materi Belajar AI</span>
            </Button>
          </div>
        )}
      </div>

      {/* Action Footer Bar */}
      <div className="mt-3.5 pt-3 flex items-center justify-between gap-2 text-xs border-t border-slate-100 dark:border-[#252F42]">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Ask AI Button */}
          <Button
            id={`btn-chat-task-${task.id}`}
            variant="ghost"
            size="sm"
            onClick={() => onOpenChat(task.id)}
            className="gap-1.5 font-bold text-indigo-700 dark:text-[#B0B1F2] hover:text-indigo-900 dark:hover:text-[#F1F0EC] hover:bg-indigo-50 dark:hover:bg-[#121927]"
            title="Tanyakan tugas ini ke Asisten AI"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-[#9294E8]" />
            <span>Tanya AI</span>
          </Button>

          {/* Classroom Link */}
          {task.classroomLink && (
            <a
              href={task.classroomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] font-medium text-slate-600 dark:text-[#9AA6B8] hover:text-slate-900 dark:hover:text-[#F1F0EC] hover:bg-slate-100 dark:hover:bg-[#121927] transition"
              title="Buka di Google Classroom"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">Classroom</span>
            </a>
          )}

          {/* Debug Date Info */}
          {task.createdAt && !isNaN(new Date(task.createdAt).getTime()) && (
            <span
              className="text-xs font-mono text-slate-500 dark:text-[#69758A] bg-slate-100 dark:bg-[#121927] px-2 py-1 rounded-[8px] border border-slate-200 dark:border-[#252F42]"
              title={`Dibuat: ${task.createdAt}`}
            >
              {new Date(task.createdAt).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Primary Study Workspace Button */}
          <Button
            onClick={() => onOpenDetails(task)}
            variant="default"
            size="sm"
            className="gap-1.5 font-bold"
          >
            <span>Buka Materi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => onDeleteTask(task.id)}
            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-[#121927]"
            title="Hapus tugas"
            aria-label="Hapus tugas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
