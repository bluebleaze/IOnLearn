"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ExternalLink,
  Youtube,
  BookOpen,
  Clock,
  Lightbulb,
  MessageSquareText,
  Loader2,
  FileText,
  Save,
  CheckCircle2,
  Paperclip,
  ListChecks,
  Check,
  CheckCircle,
  X,
  Copy,
  CheckCheck,
  AlertCircle,
  Share2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { TodoTask } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { loadPreferences } from "@/lib/taskStore";

interface TaskDetailModalProps {
  task: TodoTask | null;
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeWithAI: (taskId: string) => void;
  onToggleChecklistItem: (taskId: string, checkId: string) => void;
  onSaveNotes: (taskId: string, notes: string) => void;
  onOpenChat: (taskId: string) => void;
  onToggleComplete?: (taskId: string) => void;
  pageMode?: boolean;
  pageClassName?: string;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onAnalyzeWithAI,
  onToggleChecklistItem,
  onSaveNotes,
  onOpenChat,
  onToggleComplete,
  pageMode = false,
  pageClassName = "h-full flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 dark:border-[#262626] bg-white dark:bg-[#161616]",
}) => {
  const [notes, setNotes] = useState(task?.customNotes || "");
  const [activeTab, setActiveTab] = useState<"summary" | "checklist" | "youtube" | "notes">("summary");
  const [isSavedNotes, setIsSavedNotes] = useState(false);
  const [copiedConcept, setCopiedConcept] = useState<string | null>(null);
  const [modalStyle, setModalStyle] = useState<"drawer" | "modal">(() => {
    if (typeof window !== "undefined") {
      const prefs = loadPreferences();
      if (prefs?.taskModalStyle) {
        return prefs.taskModalStyle;
      }
    }
    return "drawer";
  });

  // Keep modalStyle synchronized immediately when preference changes or when modal is opened
  useEffect(() => {
    const syncStyle = () => {
      const prefs = loadPreferences();
      if (prefs?.taskModalStyle) {
        setModalStyle(prefs.taskModalStyle);
      }
    };

    syncStyle();

    window.addEventListener("taskStoreChange", syncStyle);
    window.addEventListener("task-modal-style-changed", syncStyle);
    window.addEventListener("storage", syncStyle);

    return () => {
      window.removeEventListener("taskStoreChange", syncStyle);
      window.removeEventListener("task-modal-style-changed", syncStyle);
      window.removeEventListener("storage", syncStyle);
    };
  }, [isOpen]);

  useEffect(() => {
    if (task?.customNotes !== undefined) {
      setNotes(task.customNotes);
    }
  }, [task?.id, task?.customNotes]);

  // Handle ESC key for drawer mode
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!task || !isOpen) return null;

  const handleSaveNotes = () => {
    if (!task) return;
    onSaveNotes(task.id, notes);
    setIsSavedNotes(true);
    setTimeout(() => setIsSavedNotes(false), 2000);
    toast.success("Catatan Disimpan", {
      description: "Catatan belajar personal Anda berhasil diperbarui.",
    });
  };

  const handleToggleTaskComplete = () => {
    if (onToggleComplete && task) {
      if (!task.isCompleted) {
        try {
          confetti({
            particleCount: 40,
            spread: 55,
            origin: { y: 0.8 },
            colors: ["#818cf8", "#34d399", "#fbbf24"],
          });
        } catch {}
      }
      onToggleComplete(task.id);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedConcept(label);
    setTimeout(() => setCopiedConcept(null), 2000);
    toast.success("Teks Disalin", { description: `"${label}" disalin ke clipboard.` });
  };

  const ai = task.aiAnalysis;
  const checklistTotal = ai?.checklist?.length || 0;
  const checklistDone = ai?.checklist?.filter((c) => c.done)?.length || 0;
  const checklistPercent = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  // ── Inner Content (Shared between Page, Drawer, and Centered Modal) ──
  const renderModalContent = () => (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-[#161616] text-slate-900 dark:text-[#f3f3f3]">
      {/* 1. Header Section */}
      <div className="p-3.5 sm:p-6 border-b border-slate-200/80 dark:border-[#262626] bg-white dark:bg-[#161616] shrink-0 space-y-2.5 sm:space-y-3">
        {/* Top Utility Row: Badges & Action Buttons */}
        <div className="flex items-center justify-between gap-2.5">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-[#1f1f28] text-indigo-700 dark:text-[#a5b4fc] border border-indigo-100/80 dark:border-indigo-900/40 truncate max-w-[160px] sm:max-w-none">
              {task.courseName || "Kuliah"}
            </span>

            {task.dueDateStr && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-[#a3a3a3] shrink-0">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{task.dueDateStr}</span>
              </span>
            )}

            {task.points !== undefined && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-[#202020] text-slate-600 dark:text-[#a3a3a3] shrink-0">
                {task.points} Poin
              </span>
            )}

            {task.syncSource === "classroom" && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Classroom
              </span>
            )}
          </div>

          {/* Top-Right Close Button for Mobile */}
          <div className="flex items-center gap-1.5 shrink-0 sm:hidden">
            <Button
              onClick={() => onAnalyzeWithAI(task.id)}
              disabled={task.aiLoading}
              size="sm"
              className="min-h-[40px] px-2.5 gap-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
              title="Generate Semua (Rangkuman, Langkah, Video)"
            >
              {task.aiLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{task.aiLoading ? "AI..." : "Generate Semua"}</span>
            </Button>

            <Button
              variant="ghost"
              size="iconSm"
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-[#202020] hover:bg-slate-200 dark:hover:bg-[#2a2a2a] rounded-xl border border-slate-200/80 dark:border-[#2b2b2b] transition cursor-pointer"
              title="Tutup"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0 ml-auto">
            <Button
              onClick={() => onAnalyzeWithAI(task.id)}
              disabled={task.aiLoading}
              size="sm"
              className="gap-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              title="Generate Rangkuman, Langkah Kerja, Video, dan Catatan sekaligus dalam 1 klik"
            >
              {task.aiLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sedang Generate...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Semua</span>
                </>
              )}
            </Button>

            {onToggleComplete && (
              <Button
                onClick={handleToggleTaskComplete}
                variant={task.isCompleted ? "outline" : "emerald"}
                size="sm"
                className={
                  task.isCompleted
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-xs rounded-xl"
                    : "text-xs rounded-xl"
                }
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{task.isCompleted ? "Selesai" : "Tandai Selesai"}</span>
              </Button>
            )}

            {task.classroomLink && (
              <a
                href={task.classroomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-[#aaa] dark:hover:text-[#fff] bg-slate-100 dark:bg-[#202020] hover:bg-slate-200 dark:hover:bg-[#2a2a2a] rounded-xl border border-slate-200/80 dark:border-[#2b2b2b] transition cursor-pointer"
                title="Buka di Google Classroom"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <Button
              variant="ghost"
              size="iconSm"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-[#202020] hover:bg-slate-200 dark:hover:bg-[#2a2a2a] rounded-xl border border-slate-200/80 dark:border-[#2b2b2b] transition cursor-pointer"
              title="Tutup (Esc)"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Full-Width Title */}
        <div>
          <h2
            className="text-base sm:text-xl font-bold text-slate-900 dark:text-[#f3f3f3] tracking-tight font-heading leading-snug break-words"
            title={task.title}
          >
            {task.title}
          </h2>
        </div>

        {/* Mobile Quick Action Row (Tandai Selesai & Classroom Link) */}
        <div className="flex sm:hidden items-center gap-2 pt-0.5">
          {onToggleComplete && (
            <Button
              onClick={handleToggleTaskComplete}
              variant={task.isCompleted ? "outline" : "emerald"}
              size="sm"
              className={`flex-1 min-h-[44px] text-xs rounded-xl font-medium ${
                task.isCompleted
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : ""
              }`}
            >
              <Check className="w-4 h-4 stroke-[3] mr-1.5" />
              <span>{task.isCompleted ? "Ditandai Selesai" : "Tandai Selesai"}</span>
            </Button>
          )}

          {task.classroomLink && (
            <a
              href={task.classroomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-3.5 text-slate-600 hover:text-slate-900 dark:text-[#aaa] dark:hover:text-[#fff] bg-slate-100 dark:bg-[#202020] hover:bg-slate-200 dark:hover:bg-[#2a2a2a] rounded-xl border border-slate-200/80 dark:border-[#2b2b2b] transition cursor-pointer flex items-center gap-1.5 text-xs font-medium shrink-0"
              title="Buka di Google Classroom"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Classroom</span>
            </a>
          )}
        </div>

        {/* Ask AI Copilot Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 sm:p-3 bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] rounded-xl text-xs">
          <div className="flex items-center gap-2 text-slate-800 dark:text-[#e5e5e5] font-medium">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-[#818cf8] shrink-0" />
            <span>Butuh penjelasan konsep atau panduan tugas ini?</span>
          </div>
          <Button
            onClick={() => {
              onClose();
              onOpenChat(task.id);
            }}
            size="sm"
            className="min-h-[44px] sm:min-h-7 text-xs rounded-lg gap-1.5 font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 w-full sm:w-auto shrink-0"
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Tanya Asisten AI</span>
          </Button>
        </div>
      </div>

      {/* 2. Unified 4 Tabs Bar */}
      <div className="px-3.5 sm:px-6 border-b border-slate-200/80 dark:border-[#262626] bg-white dark:bg-[#161616] flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 text-xs scroll-smooth">
        <button
          onClick={() => setActiveTab("summary")}
          className={`min-h-[44px] py-2.5 sm:py-3 px-3 sm:px-3.5 font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "summary"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 dark:text-[#888] hover:text-slate-800 dark:hover:text-[#eee]"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Rangkuman AI</span>
        </button>

        <button
          onClick={() => setActiveTab("checklist")}
          className={`min-h-[44px] py-2.5 sm:py-3 px-3 sm:px-3.5 font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "checklist"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 dark:text-[#888] hover:text-slate-800 dark:hover:text-[#eee]"
          }`}
        >
          <ListChecks className="w-3.5 h-3.5" />
          <span>Langkah ({checklistDone}/{checklistTotal})</span>
        </button>

        <button
          onClick={() => setActiveTab("youtube")}
          className={`min-h-[44px] py-2.5 sm:py-3 px-3 sm:px-3.5 font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "youtube"
              ? "border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400"
              : "border-transparent text-slate-500 dark:text-[#888] hover:text-slate-800 dark:hover:text-[#eee]"
          }`}
        >
          <Youtube className="w-3.5 h-3.5 text-red-500" />
          <span>Video ({ai?.youtubeVideos?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          className={`min-h-[44px] py-2.5 sm:py-3 px-3 sm:px-3.5 font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "notes"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 dark:text-[#888] hover:text-slate-800 dark:hover:text-[#eee]"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Catatan Pribadi</span>
        </button>
      </div>

      {/* 3. Tab Body Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs sm:text-sm">
        {/* TAB 1: RANGKUMAN AI */}
        {activeTab === "summary" && (
          <div className="space-y-5">
            {/* Teacher Instructions */}
            {task.description && (
              <div className="bg-slate-50 dark:bg-[#181818] p-4 rounded-xl border border-slate-200/80 dark:border-[#262626] space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#888]">
                  Instruksi Pengajar / Dosen:
                </h4>
                <p className="text-xs text-slate-700 dark:text-[#ccc] whitespace-pre-wrap leading-relaxed">
                  {task.description}
                </p>
              </div>
            )}

            {/* AI Summary Banner */}
            {task.aiLoading ? (
              <div className="text-center py-12 space-y-3 bg-slate-50 dark:bg-[#181818] rounded-2xl border border-slate-200/80 dark:border-[#262626]">
                <Loader2 className="w-7 h-7 mx-auto animate-spin text-indigo-600 dark:text-[#818cf8]" />
                <p className="text-xs font-semibold text-indigo-700 dark:text-[#a5b4fc]">
                  Sedang menganalisis materi & menyusun panduan belajar...
                </p>
              </div>
            ) : ai ? (
              <div className="space-y-4">
                {/* Meta Highlights Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-[#181818] rounded-xl border border-slate-200/80 dark:border-[#262626]">
                    <span className="text-xs text-slate-500 dark:text-[#888] block">Estimasi Waktu</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-[#f3f3f3]">
                      ~{ai.estimatedMinutes || 45} Menit
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-[#181818] rounded-xl border border-slate-200/80 dark:border-[#262626]">
                    <span className="text-xs text-slate-500 dark:text-[#888] block">Tingkat Kesulitan</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {ai.difficulty || "Sedang"}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-[#181818] rounded-xl border border-slate-200/80 dark:border-[#262626] col-span-2 sm:col-span-1">
                    <span className="text-xs text-slate-500 dark:text-[#888] block">Langkah Selesai</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {checklistDone} dari {checklistTotal} ({checklistPercent}%)
                    </span>
                  </div>
                </div>

                {/* Summary Text */}
                <div className="p-4 bg-slate-50 dark:bg-[#181818] rounded-xl border border-slate-200/80 dark:border-[#262626] space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-[#f3f3f3] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-[#818cf8]" />
                    Ringkasan Materi & Intisari:
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-[#d4d4d4] leading-relaxed">
                    {ai.summary}
                  </p>
                </div>

                {/* Key Concepts Chips */}
                {ai.keyConcepts && ai.keyConcepts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#888]">
                      Konsep Kunci yang Dipelajari:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {ai.keyConcepts.map((concept, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => copyToClipboard(concept, concept)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-[#202020] dark:hover:bg-[#282828] text-slate-800 dark:text-[#eee] border border-slate-200/80 dark:border-[#2b2b2b] transition cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                          title="Klik untuk menyalin konsep"
                          aria-label={`Salin konsep "${concept}"`}
                        >
                          <span>{concept}</span>
                          {copiedConcept === concept ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-40" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 px-4 bg-slate-50 dark:bg-[#181818] rounded-2xl border border-slate-200/80 dark:border-[#262626] space-y-3">
                <Sparkles className="w-8 h-8 mx-auto text-indigo-500 opacity-60" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-[#f3f3f3]">
                  Belum ada rangkuman AI untuk tugas ini
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#888] max-w-sm mx-auto">
                  Analisis AI akan merangkum materi, memecah langkah pengerjaan, dan mencarikan video pembelajaran YouTube.
                </p>
                <Button
                  onClick={() => onAnalyzeWithAI(task.id)}
                  className="text-xs rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Mulai Analisis AI Sekarang
                </Button>
              </div>
            )}

            {/* Teacher Attachments */}
            {task.materials && task.materials.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#242424]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#888] flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" />
                  Lampiran File dari Pengajar ({task.materials.length}):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {task.materials.map((mat, idx) => {
                    const title =
                      mat.driveFile?.driveFile?.title ||
                      mat.youtubeVideo?.title ||
                      mat.link?.title ||
                      "File Materi";
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
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#181818] hover:bg-slate-100 dark:hover:bg-[#222] border border-slate-200/80 dark:border-[#262626] transition flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                        aria-label={`Buka lampiran "${title}"`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {mat.youtubeVideo ? (
                            <Youtube className="w-4 h-4 text-red-500 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          )}
                          <span className="text-xs font-medium text-slate-800 dark:text-[#eee] truncate">{title}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CHECKLIST LANGKAH */}
        {activeTab === "checklist" && (
          <div className="space-y-4">
            {/* Progress Header */}
            <div className="p-4 bg-slate-50 dark:bg-[#181818] rounded-xl border border-slate-200/80 dark:border-[#262626] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-[#ccc]">Kemajuan Pengerjaan:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{checklistDone} dari {checklistTotal} Langkah ({checklistPercent}%)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-[#252525] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${checklistPercent}%` }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            {ai?.checklist && ai.checklist.length > 0 ? (
              <div className="space-y-2">
                {ai.checklist.map((item) => (
                  <div
                    key={item.id}
                    role="checkbox"
                    tabIndex={0}
                    aria-checked={item.done}
                    onClick={() => onToggleChecklistItem(task.id, item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onToggleChecklistItem(task.id, item.id);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer min-h-[44px] flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      item.done
                        ? "bg-slate-50/70 dark:bg-[#151515] border-slate-200/70 dark:border-[#222] opacity-75"
                        : "bg-white dark:bg-[#181818] border-slate-200/80 dark:border-[#262626] hover:border-indigo-400 dark:hover:border-indigo-900/50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition ${
                        item.done
                          ? "bg-emerald-500 text-white"
                          : "border border-slate-300 dark:border-[#444]"
                      }`}
                    >
                      {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={`text-xs leading-relaxed ${item.done ? "line-through text-slate-400 dark:text-[#777]" : "text-slate-800 dark:text-[#eee]"}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4 bg-slate-50 dark:bg-[#181818] rounded-2xl border border-slate-200/80 dark:border-[#262626] space-y-2">
                <p className="text-xs text-slate-500">Belum ada langkah pengerjaan yang dibuat.</p>
                <Button size="sm" onClick={() => onAnalyzeWithAI(task.id)} className="text-xs rounded-xl">
                  Buat Checklist dengan AI
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VIDEO MATERI YOUTUBE */}
        {activeTab === "youtube" && (
          <div className="space-y-3">
            {ai?.youtubeVideos && ai.youtubeVideos.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {ai.youtubeVideos.map((video, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 dark:bg-[#181818] rounded-xl border border-slate-200/80 dark:border-[#262626] space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <Youtube className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{video.channel || "YouTube Edukasi"}</span>
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#f3f3f3] break-words">
                          {video.title}
                        </h4>
                      </div>
                      <a
                        href={video.searchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5 shrink-0 shadow-2xs transition w-full sm:w-auto"
                      >
                        <span>Tonton Video</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {video.reason && (
                      <p className="text-xs text-slate-600 dark:text-[#aaa] leading-relaxed">
                        {video.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4 bg-slate-50 dark:bg-[#181818] rounded-2xl border border-slate-200/80 dark:border-[#262626] space-y-2">
                <Youtube className="w-8 h-8 mx-auto text-red-500 opacity-60" />
                <p className="text-xs text-slate-500">Belum ada video rekomendasi.</p>
                <Button size="sm" onClick={() => onAnalyzeWithAI(task.id)} className="text-xs rounded-xl w-full sm:w-auto">
                  Cari Video dengan AI
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CATATAN PRIBADI */}
        {activeTab === "notes" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-[#ccc] block">
                Catatan Belajar & Draf Jawaban Anda:
              </label>
              <p className="text-xs text-slate-600 dark:text-[#a3a3a3]">
                Tuliskan poin penting, rumus, atau draf pengerjaan tugas di sini.
              </p>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tulis catatan Anda di sini..."
              rows={9}
              className="w-full p-3.5 text-xs rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-900 dark:text-[#f3f3f3] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 leading-relaxed font-mono"
            />

            <div className="flex justify-end">
              <Button
                onClick={handleSaveNotes}
                size="sm"
                className="gap-1.5 text-xs rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
              >
                {isSavedNotes ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSavedNotes ? "Tersimpan!" : "Simpan Catatan"}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Footer Rail */}
      <div className="p-3.5 sm:p-4 border-t border-slate-200/80 dark:border-[#262626] bg-slate-50/70 dark:bg-[#141414] flex items-center justify-between gap-3 shrink-0 text-xs pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))]">
        <span className="text-slate-500 dark:text-[#a3a3a3] truncate text-xs">
          IOnLearn Study Copilot
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-xs rounded-xl border-slate-200/80 dark:border-[#2b2b2b] px-4 shrink-0"
        >
          Tutup
        </Button>
      </div>
    </div>
  );

  // ── RENDER MODE 0: EMBEDDED PAGE MODE ──
  if (pageMode) {
    return <div className={pageClassName}>{renderModalContent()}</div>;
  }

  // ── RENDER MODE 1: SLIDE-OVER DRAWER (Panel Samping Kanan) ──
  if (modalStyle === "drawer") {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop overlay */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />

        {/* Slide-over sheet from right */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 z-50">
          <div className="w-full sm:w-[42rem] max-w-full bg-white dark:bg-[#161616] border-l border-slate-200/80 dark:border-[#262626] shadow-2xl animate-in slide-in-from-right duration-250 flex flex-col h-full">
            {renderModalContent()}
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER MODE 2: CENTERED MODAL DIALOG ──
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideCloseButton
        className="w-[calc(100%-1rem)] sm:w-full max-w-3xl h-[90dvh] sm:h-[88vh] max-h-[820px] p-0 flex flex-col gap-0 overflow-hidden bg-white dark:bg-[#161616] border-slate-200/80 dark:border-[#262626] shadow-2xl rounded-2xl"
      >
        <DialogTitle className="sr-only">{task.title}</DialogTitle>
        <DialogDescription className="sr-only">Detail tugas dan rangkuman materi pembelajaran</DialogDescription>
        {renderModalContent()}
      </DialogContent>
    </Dialog>
  );
};
