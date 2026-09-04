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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Terlewat ({task.dueDateStr})</span>
          </span>
        );
      } else if (diffHours <= 24) {
        dueBadge = (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Hari Ini ({task.dueDateStr})</span>
          </span>
        );
      } else if (diffHours <= 48) {
        dueBadge = (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-900 border border-orange-200">
            <Clock className="w-3.5 h-3.5 text-orange-700" />
            <span>Besok ({task.dueDateStr})</span>
          </span>
        );
      } else {
        dueBadge = (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{task.dueDateStr}</span>
          </span>
        );
      }
    } else {
      dueBadge = (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
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
      className={`group rounded-3xl p-5 sm:p-6 border transition-all duration-200 ${
        task.isCompleted
          ? "bg-slate-50/80 border-slate-200/80 opacity-85"
          : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md"
      }`}
    >
      {/* Top Header Row: Course Badge + Urgency + Points + Checkbox */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Badge */}
          <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 max-w-[190px] truncate">
            {task.courseName}
          </span>

          {/* Due date badge */}
          {dueBadge}

          {/* Points */}
          {task.points !== undefined && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {task.points} Poin
            </span>
          )}

          {/* Source */}
          {task.syncSource === "classroom" && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Classroom
            </span>
          )}
        </div>

        {/* Big Interactive Checkbox */}
        <button
          id={`task-checkbox-${task.id}`}
          onClick={handleCheck}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 active:scale-90 ${
            task.isCompleted
              ? "bg-emerald-600 text-white shadow-xs"
              : "border-2 border-slate-300 hover:border-indigo-600 bg-white hover:bg-indigo-50"
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
          className={`text-base sm:text-lg font-bold tracking-tight transition hover:text-indigo-600 ${
            task.isCompleted
              ? "line-through text-slate-400"
              : "text-slate-900"
          }`}
        >
          {task.title}
        </h3>

        {task.description && (
          <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Teacher Attachments Pills (if any) */}
      {task.materials && task.materials.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Paperclip className="w-3 h-3" /> Lampiran Guru:
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
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 max-w-[160px] truncate transition border border-slate-200/60"
              >
                {mat.youtubeVideo ? (
                  <Youtube className="w-3 h-3 text-red-500 shrink-0" />
                ) : (
                  <FileText className="w-3 h-3 text-blue-500 shrink-0" />
                )}
                <span className="truncate">{title}</span>
              </a>
            );
          })}
        </div>
      )}

      {/* TurboLearn Style AI Feature Pills Bar */}
      <div className="mt-4 pt-3.5 border-t border-slate-100">
        {task.aiLoading ? (
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-indigo-50/70 text-indigo-700 text-xs font-semibold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
            <span>TurboLearn AI sedang menyusun materi & video belajar...</span>
          </div>
        ) : task.aiAnalysis ? (
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* TurboLearn Study Feature Chips */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Rangkuman AI
              </span>

              {checklistTotal > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                  <ListChecks className="w-3.5 h-3.5 text-indigo-600" />
                  {checklistDone}/{checklistTotal} Langkah
                </span>
              )}

              {task.aiAnalysis.youtubeVideos?.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                  <Youtube className="w-3.5 h-3.5 text-rose-600" />
                  {task.aiAnalysis.youtubeVideos.length} Video
                </span>
              )}

              {task.aiAnalysis.sources?.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                  <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                  {task.aiAnalysis.sources.length} Sumber
                </span>
              )}
            </div>

            {/* Quick Open Guide */}
            <button
              onClick={() => onOpenDetails(task)}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer ml-auto"
            >
              <span>Lihat Materi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500">
              Belum ada panduan & materi belajar.
            </span>
            <Button
              id={`btn-analyze-${task.id}`}
              variant="primarySubtle"
              size="sm"
              onClick={() => onAnalyzeWithAI(task.id)}
              className="gap-1.5 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Buat Materi Belajar AI</span>
            </Button>
          </div>
        )}
      </div>

      {/* Action Footer Bar */}
      <div className="mt-3.5 pt-3 flex items-center justify-between gap-2 text-xs border-t border-slate-100">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Ask AI Button */}
          <Button
            id={`btn-chat-task-${task.id}`}
            variant="ghost"
            size="sm"
            onClick={() => onOpenChat(task.id)}
            className="gap-1.5 font-bold text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50"
            title="Tanyakan tugas ini ke Asisten AI"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tanya AI</span>
          </Button>

          {/* Classroom Link */}
          {task.classroomLink && (
            <a
              href={task.classroomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Buka di Google Classroom"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">Classroom</span>
            </a>
          )}

          {/* Debug Date Info */}
          {task.createdAt && !isNaN(new Date(task.createdAt).getTime()) && (
            <span
              className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200"
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
            className="text-slate-400 hover:text-rose-600 hover:bg-slate-100"
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
