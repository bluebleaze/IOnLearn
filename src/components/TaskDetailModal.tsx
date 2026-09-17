"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ExternalLink,
  Youtube,
  BookOpen,
  Clock,
  MessageSquareText,
  Loader2,
  FileText,
  Save,
  CheckCircle2,
  Paperclip,
  ListChecks,
  Check,
  X,
  Copy,
  AlertCircle,
  Calendar,
  GraduationCap,
  User,
  Link as LinkIcon,
  Globe,
  HelpCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { TodoTask } from "../types";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { loadPreferences } from "@/lib/taskStore";
import { TaskCompleteConfirmModal } from "./TaskCompleteConfirmModal";

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
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [modalStyle, setModalStyle] = useState<"drawer" | "modal">(() => {
    if (typeof window !== "undefined") {
      const prefs = loadPreferences();
      if (prefs?.taskModalStyle) {
        return prefs.taskModalStyle;
      }
    }
    return "drawer";
  });

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

  // Handle ESC key
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
    if (!onToggleComplete || !task) return;
    if (!task.isCompleted) {
      setShowConfirmComplete(true);
    } else {
      onToggleComplete(task.id);
    }
  };

  const handleConfirmDone = () => {
    if (onToggleComplete && task) {
      try {
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.8 },
          colors: ["#818cf8", "#34d399", "#fbbf24"],
        });
      } catch {}
      onToggleComplete(task.id);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedConcept(label);
    setTimeout(() => setCopiedConcept(null), 2000);
    toast.success("Teks Disalin", { description: `"${label}" disalin ke clipboard.` });
  };

  // Status computation for Task Detail
  const getStatusInfo = () => {
    if (task.isCompleted) {
      return {
        label: "Selesai",
        badgeClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50",
        icon: CheckCircle2,
      };
    }
    const now = Date.now();
    if (typeof task.dueTimestamp === "number" && !isNaN(task.dueTimestamp) && task.dueTimestamp < now) {
      return {
        label: "Telat",
        badgeClass: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/50",
        icon: AlertCircle,
      };
    }
    const isUrgent =
      task.priority === "high" ||
      (typeof task.dueTimestamp === "number" && !isNaN(task.dueTimestamp) && task.dueTimestamp - now <= 48 * 3600 * 1000) ||
      (!task.dueTimestamp && task.priority !== "low");

    if (isUrgent) {
      return {
        label: "Perlu Dikerjakan",
        badgeClass: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/50",
        icon: Clock,
      };
    }
    return {
      label: "Nanti",
      badgeClass: "bg-slate-100 dark:bg-[#1e1e24] text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-[#30303a]",
      icon: Calendar,
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const ai = task.aiAnalysis;
  const checklistTotal = ai?.checklist?.length || 0;
  const checklistDone = ai?.checklist?.filter((c) => c.done)?.length || 0;
  const checklistPercent = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  // Extract Course Name and Class (e.g., Pemrograman Web Lanjut (TI-3A))
  const courseRaw = task.courseName || "Mata Kuliah Umum";
  const classMatch = courseRaw.match(/\(([^)]+)\)/);
  const detectedClass = classMatch ? classMatch[1] : "Kelas Utama";
  const detectedSubject = courseRaw.replace(/\s*\([^)]*\)/, "").trim() || courseRaw;

  // ── Inner Content (Top Navigation First -> Overview & Actions -> Detail Content) ──
  const renderModalContent = () => (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-[#141417] text-slate-900 dark:text-[#f3f3f3] animate-in slide-in-from-right duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
      
      {/* ── 1. TOP NAVIGATION / TASK TABS (Sesuai QA #4) ── */}
      <div className="px-3.5 sm:px-6 pt-3 pb-0 border-b border-slate-200/80 dark:border-[#26262e] bg-slate-50/80 dark:bg-[#18181f] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveTab("summary")}
            className={`min-h-[42px] py-2 px-3 sm:px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "summary"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-white dark:bg-[#141417] rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f0f0f0]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Rangkuman AI</span>
          </button>

          <button
            onClick={() => setActiveTab("checklist")}
            className={`min-h-[42px] py-2 px-3 sm:px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "checklist"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-white dark:bg-[#141417] rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f0f0f0]"
            }`}
          >
            <ListChecks className="w-3.5 h-3.5 text-emerald-500" />
            <span>Langkah ({checklistDone}/{checklistTotal})</span>
          </button>

          <button
            onClick={() => setActiveTab("youtube")}
            className={`min-h-[42px] py-2 px-3 sm:px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "youtube"
                ? "border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400 bg-white dark:bg-[#141417] rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f0f0f0]"
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-rose-500" />
            <span>Video ({ai?.youtubeVideos?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`min-h-[42px] py-2 px-3 sm:px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "notes"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-white dark:bg-[#141417] rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f0f0f0]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>Catatan</span>
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-[#fff] hover:bg-slate-200/70 dark:hover:bg-[#25252e] transition cursor-pointer mb-1 shrink-0"
          title="Tutup (Esc)"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── 2. TASK OVERVIEW & ACTIONS (Tepat di bawah tab navigation) ── */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-[#26262e] bg-white dark:bg-[#141417] shrink-0 space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
            {detectedSubject}
          </span>
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-[#202028] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-[#303038]">
            Kelas: {detectedClass}
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${statusInfo.badgeClass}`}>
            <StatusIcon className="w-3 h-3 shrink-0" />
            <span>{statusInfo.label}</span>
          </span>
          {task.dueDateStr && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-[#202028] text-slate-700 dark:text-[#ccc]">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{task.dueDateStr}</span>
            </span>
          )}
          {task.points !== undefined && (
            <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-[#202028] text-slate-600 dark:text-[#aaa]">
              {task.points} Poin
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#f3f3f3] font-heading tracking-tight leading-snug">
          {task.title}
        </h2>

        {/* Action Buttons Row (Generate Semua, Tandai Selesai, Tanya AI, Classroom) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Generate Semua */}
          <Button
            onClick={() => onAnalyzeWithAI(task.id)}
            disabled={task.aiLoading}
            size="sm"
            className="gap-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
            title="Generate Rangkuman, Langkah Kerja, Video, dan Catatan sekaligus"
          >
            {task.aiLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Semua</span>
              </>
            )}
          </Button>

          {/* Tandai Selesai */}
          {onToggleComplete && (
            <Button
              onClick={handleToggleTaskComplete}
              variant={task.isCompleted ? "outline" : "emerald"}
              size="sm"
              className={`text-xs rounded-xl font-semibold gap-1.5 cursor-pointer ${
                task.isCompleted
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : ""
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{task.isCompleted ? "Selesai (Klik Buka)" : "Tandai Selesai"}</span>
            </Button>
          )}

          {/* Tanya AI */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onOpenChat(task.id);
            }}
            className="text-xs rounded-xl border-slate-200 dark:border-[#2b2b35] hover:bg-slate-100 dark:hover:bg-[#202028] gap-1.5 cursor-pointer"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-indigo-500" />
            <span>Tanya AI</span>
          </Button>

          {/* Link Classroom */}
          {task.classroomLink && (
            <a
              href={task.classroomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-[#2b2b35] bg-slate-50 dark:bg-[#1c1c24] hover:bg-slate-100 dark:hover:bg-[#242430] text-slate-700 dark:text-[#ccc] transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Buka di Classroom</span>
            </a>
          )}
        </div>
      </div>

      {/* ── 3. SCROLLABLE TAB & TASK DETAIL BODY (Sesuai QA #5) ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
        
        {/* Comprehensive Task & Class Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-50/90 dark:bg-[#181820] border border-slate-200/80 dark:border-[#282834]">
          {/* Detail Tugas */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#888] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              Detail Tugas
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-[#22222a]">
                <span className="text-slate-500 dark:text-[#888]">Status:</span>
                <span className="font-semibold text-slate-900 dark:text-[#f3f3f3]">{statusInfo.label}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-[#22222a]">
                <span className="text-slate-500 dark:text-[#888]">Tenggat Waktu:</span>
                <span className="font-semibold text-slate-900 dark:text-[#f3f3f3]">{task.dueDateStr || "Tanpa Batas Waktu"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-[#888]">Bobot Poin:</span>
                <span className="font-semibold text-slate-900 dark:text-[#f3f3f3]">{task.points !== undefined ? `${task.points} Poin` : "Tidak Dinilai"}</span>
              </div>
            </div>
          </div>

          {/* Detail Kelas & Pengajar */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#888] flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              Detail Kelas & Pengajar
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-[#22222a]">
                <span className="text-slate-500 dark:text-[#888]">Mata Pelajaran:</span>
                <span className="font-semibold text-slate-900 dark:text-[#f3f3f3] truncate max-w-[180px]">{detectedSubject}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-[#22222a]">
                <span className="text-slate-500 dark:text-[#888]">Kelas:</span>
                <span className="font-semibold text-slate-900 dark:text-[#f3f3f3]">{detectedClass}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-[#888]">Pengajar / Guru:</span>
                <span className="font-semibold text-slate-900 dark:text-[#f3f3f3] flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Pengajar Google Classroom</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Deskripsi Lengkap Tugas */}
        {task.description ? (
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#181820] border border-slate-200/80 dark:border-[#262632] space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#888] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              Deskripsi & Instruksi Tugas
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-[#d4d4d8] whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#181820] text-xs text-slate-400 border border-slate-200/60 dark:border-[#262630]">
            Tidak ada deskripsi tertulis dari pengajar untuk tugas ini.
          </div>
        )}

        {/* Lampiran File dari Pengajar */}
        {task.materials && task.materials.length > 0 && (
          <div className="space-y-2.5 p-4 rounded-2xl bg-white dark:bg-[#181820] border border-slate-200/80 dark:border-[#262632]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#ccc] flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
              File Lampiran Tugas ({task.materials.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {task.materials.map((mat, idx) => {
                const title =
                  mat.driveFile?.driveFile?.title ||
                  mat.youtubeVideo?.title ||
                  mat.link?.title ||
                  mat.form?.title ||
                  "Dokumen Materi";
                const link =
                  mat.driveFile?.driveFile?.alternateLink ||
                  mat.youtubeVideo?.alternateLink ||
                  mat.link?.url ||
                  mat.form?.formUrl ||
                  "#";
                const isVideo = Boolean(mat.youtubeVideo);
                const isForm = Boolean(mat.form);

                return (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#14141a] hover:bg-slate-100 dark:hover:bg-[#1f1f28] border border-slate-200/70 dark:border-[#2a2a35] transition flex items-center justify-between gap-2.5 cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {isVideo ? (
                        <Youtube className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : isForm ? (
                        <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      )}
                      <span className="text-xs font-medium text-slate-800 dark:text-[#eee] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {title}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB CONTENT 1: RANGKUMAN AI ── */}
        {activeTab === "summary" && (
          <div className="space-y-4 pt-2">
            {task.aiLoading ? (
              <div className="text-center py-12 space-y-3 bg-slate-50 dark:bg-[#181820] rounded-2xl border border-slate-200/80 dark:border-[#262632]">
                <Loader2 className="w-7 h-7 mx-auto animate-spin text-indigo-600 dark:text-[#818cf8]" />
                <p className="text-xs font-semibold text-indigo-700 dark:text-[#a5b4fc]">
                  Sedang menganalisis materi & menyusun panduan AI...
                </p>
              </div>
            ) : ai ? (
              <div className="space-y-4">
                {/* Meta Highlights Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 dark:bg-[#181820] rounded-xl border border-slate-200/80 dark:border-[#262632]">
                    <span className="text-xs text-slate-500 dark:text-[#888] block">Estimasi Waktu</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-[#f3f3f3]">
                      ~{ai.estimatedMinutes || 45} Menit
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-[#181820] rounded-xl border border-slate-200/80 dark:border-[#262632]">
                    <span className="text-xs text-slate-500 dark:text-[#888] block">Tingkat Kesulitan</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {ai.difficulty || "Sedang"}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-[#181820] rounded-xl border border-slate-200/80 dark:border-[#262632] col-span-2 sm:col-span-1">
                    <span className="text-xs text-slate-500 dark:text-[#888] block">Langkah Selesai</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {checklistDone} dari {checklistTotal} ({checklistPercent}%)
                    </span>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="p-4 bg-slate-50 dark:bg-[#181820] rounded-xl border border-slate-200/80 dark:border-[#262632] space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-[#f3f3f3] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-[#818cf8]" />
                    Intisari & Ringkasan Materi:
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-[#d4d4d8] leading-relaxed">
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
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-[#202028] dark:hover:bg-[#282834] text-slate-800 dark:text-[#eee] border border-slate-200/80 dark:border-[#2c2c38] transition cursor-pointer flex items-center gap-1.5"
                          title="Klik untuk menyalin konsep"
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

                {/* AI Reference Links (Sesuai QA #5: Link yang tersedia) */}
                {ai.sources && ai.sources.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200/70 dark:border-[#282834]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#888] flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-500" />
                      Tautan & Sumber Referensi Pembelajaran:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ai.sources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#181820] hover:bg-slate-100 dark:hover:bg-[#202028] border border-slate-200/80 dark:border-[#262632] flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 truncate">
                            <p className="font-semibold text-slate-800 dark:text-[#eee] truncate">{src.title}</p>
                            <p className="text-[11px] text-slate-400 truncate">{src.domain}</p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 px-4 bg-slate-50 dark:bg-[#181820] rounded-2xl border border-slate-200/80 dark:border-[#262632] space-y-3">
                <Sparkles className="w-8 h-8 mx-auto text-indigo-500 opacity-60" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-[#f3f3f3]">
                  Belum ada rangkuman AI untuk tugas ini
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#888] max-w-sm mx-auto">
                  Analisis AI akan merangkum materi, memecah langkah pengerjaan, dan mencarikan video rekomendasi.
                </p>
                <Button
                  onClick={() => onAnalyzeWithAI(task.id)}
                  className="text-xs rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Mulai Analisis AI Sekarang
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB CONTENT 2: CHECKLIST LANGKAH ── */}
        {activeTab === "checklist" && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-[#181820] rounded-xl border border-slate-200/80 dark:border-[#262632] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-[#ccc]">Kemajuan Pengerjaan:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{checklistDone} dari {checklistTotal} Langkah ({checklistPercent}%)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-[#252530] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${checklistPercent}%` }}
                />
              </div>
            </div>

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
                    className={`p-3 rounded-xl border transition-all cursor-pointer min-h-[44px] flex items-center gap-3 ${
                      item.done
                        ? "bg-slate-50/70 dark:bg-[#15151b] border-slate-200/70 dark:border-[#22222a] opacity-75"
                        : "bg-white dark:bg-[#181820] border-slate-200/80 dark:border-[#282834] hover:border-indigo-400 dark:hover:border-indigo-800"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition ${
                        item.done ? "bg-emerald-500 text-white" : "border border-slate-300 dark:border-[#444]"
                      }`}
                    >
                      {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={`text-xs sm:text-sm leading-relaxed ${item.done ? "line-through text-slate-400 dark:text-[#777]" : "text-slate-800 dark:text-[#eee]"}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4 bg-slate-50 dark:bg-[#181820] rounded-2xl border border-slate-200/80 dark:border-[#262632] space-y-2">
                <p className="text-xs text-slate-500">Belum ada langkah pengerjaan yang dibuat.</p>
                <Button size="sm" onClick={() => onAnalyzeWithAI(task.id)} className="text-xs rounded-xl">
                  Buat Checklist dengan AI
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB CONTENT 3: VIDEO EDUKASI ── */}
        {activeTab === "youtube" && (
          <div className="space-y-3 pt-2">
            {ai?.youtubeVideos && ai.youtubeVideos.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {ai.youtubeVideos.map((video, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 dark:bg-[#181820] rounded-xl border border-slate-200/80 dark:border-[#262632] space-y-2.5"
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
              <div className="text-center py-10 px-4 bg-slate-50 dark:bg-[#181820] rounded-2xl border border-slate-200/80 dark:border-[#262632] space-y-2">
                <Youtube className="w-8 h-8 mx-auto text-rose-500 opacity-60" />
                <p className="text-xs text-slate-500">Belum ada video rekomendasi.</p>
                <Button size="sm" onClick={() => onAnalyzeWithAI(task.id)} className="text-xs rounded-xl w-full sm:w-auto">
                  Cari Video dengan AI
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB CONTENT 4: CATATAN PRIBADI ── */}
        {activeTab === "notes" && (
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-[#ccc] block">
                Catatan Belajar & Draf Pengerjaan Anda:
              </label>
              <p className="text-xs text-slate-500 dark:text-[#888]">
                Tuliskan poin penting, rumus, atau draf pengerjaan tugas di sini. Tersimpan otomatis di perangkat Anda.
              </p>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tulis catatan Anda di sini..."
              rows={9}
              className="w-full p-3.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200/80 dark:border-[#2b2b35] text-slate-900 dark:text-[#f3f3f3] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 leading-relaxed font-mono"
            />

            <div className="flex justify-end">
              <Button
                onClick={handleSaveNotes}
                size="sm"
                className="gap-1.5 text-xs rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto cursor-pointer"
              >
                {isSavedNotes ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSavedNotes ? "Tersimpan!" : "Simpan Catatan"}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Rail */}
      <div className="p-3.5 sm:p-4 border-t border-slate-200/80 dark:border-[#26262e] bg-slate-50/70 dark:bg-[#15151c] flex items-center justify-between gap-3 shrink-0 text-xs">
        <span className="text-slate-500 dark:text-[#888] truncate text-xs">
          IOnLearn Smart Task Detail
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-xs rounded-xl border-slate-200/80 dark:border-[#2b2b35] px-4 shrink-0 cursor-pointer"
        >
          Tutup
        </Button>
      </div>

      <TaskCompleteConfirmModal
        isOpen={showConfirmComplete}
        onClose={() => setShowConfirmComplete(false)}
        onConfirm={handleConfirmDone}
        taskTitle={task.title}
      />
    </div>
  );

  // ── RENDER MODE 0: EMBEDDED PAGE MODE ──
  if (pageMode) {
    return <div className={pageClassName}>{renderModalContent()}</div>;
  }

  // ── RENDER MODE 1: SLIDE-OVER DRAWER (Panel Samping Kanan dengan animasi kanan -> kiri) ──
  if (modalStyle === "drawer") {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop overlay */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />

        {/* Slide-over sheet from right to left */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 z-50 pointer-events-none">
          <div className="w-full sm:w-[44rem] max-w-full bg-white dark:bg-[#141417] border-l border-slate-200/80 dark:border-[#26262e] shadow-2xl pointer-events-auto flex flex-col h-full animate-in slide-in-from-right duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
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
        className="w-[calc(100%-1rem)] sm:w-full max-w-3xl h-[90dvh] sm:h-[88vh] max-h-[820px] p-0 flex flex-col gap-0 overflow-hidden bg-white dark:bg-[#141417] border-slate-200/80 dark:border-[#26262e] shadow-2xl rounded-2xl animate-in slide-in-from-right duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <DialogTitle className="sr-only">{task.title}</DialogTitle>
        <DialogDescription className="sr-only">Detail tugas dan rangkuman materi pembelajaran</DialogDescription>
        {renderModalContent()}
      </DialogContent>
    </Dialog>
  );
};
