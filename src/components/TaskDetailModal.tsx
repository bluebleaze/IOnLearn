"use client";
import React, { useState } from "react";
import {
  Sparkles,
  ExternalLink,
  Youtube,
  BookOpen,
  CheckSquare,
  Square,
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
} from "lucide-react";
import confetti from "canvas-confetti";
import { TodoTask } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/brand";
import { toast } from "@/components/ui/sonner";

interface TaskDetailModalProps {
  task: TodoTask | null;
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeWithAI: (taskId: string) => void;
  onToggleChecklistItem: (taskId: string, checkId: string) => void;
  onSaveNotes: (taskId: string, notes: string) => void;
  onOpenChat: (taskId: string) => void;
  onToggleComplete?: (taskId: string) => void;
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
}) => {
  const [notes, setNotes] = useState(task?.customNotes || "");
  const [activeTab, setActiveTab] = useState<
    "summary" | "checklist" | "youtube" | "sources" | "materials" | "tips"
  >("summary");
  const [isSavedNotes, setIsSavedNotes] = useState(false);
  const [copiedConcept, setCopiedConcept] = useState<string | null>(null);

  React.useEffect(() => {
    if (task?.customNotes !== undefined) {
      setNotes(task.customNotes);
    }
  }, [task?.id, task?.customNotes]);

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
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ["#6366f1", "#10b981", "#f59e0b", "#ec4899"],
          });
        } catch (err) {}
      }
      onToggleComplete(task.id);
    }
  };

  if (!isOpen || !task) return null;

  const ai = task.aiAnalysis;
  const checklistTotal = ai?.checklist?.length || 0;
  const checklistDone = ai?.checklist?.filter((c) => c.done)?.length || 0;
  const checklistPercent =
    checklistTotal > 0
      ? Math.round((checklistDone / checklistTotal) * 100)
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent hideCloseButton className="max-w-4xl h-[90vh] max-h-[850px] p-0 flex flex-col gap-0 overflow-hidden dark:bg-[#151D2C] dark:border-slate-800">
        {/* Modal Top Header (TurboLearn Style) */}
        <DialogHeader className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D2C] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60">
                  {task.courseName}
                </span>

                {task.dueDateStr && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    {task.dueDateStr}
                  </span>
                )}

                {task.points !== undefined && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {task.points} Poin
                  </span>
                )}

                {task.syncSource === "classroom" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Google Classroom
                  </span>
                )}
              </div>

              <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug font-heading">
                {task.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detail tugas dan rangkuman materi pembelajaran
              </DialogDescription>
            </div>

            {/* Actions Top Right */}
            <div className="flex items-center gap-2 shrink-0">
              {onToggleComplete && (
                <Button
                  onClick={handleToggleTaskComplete}
                  variant={task.isCompleted ? "outline" : "emerald"}
                  size="sm"
                  className={task.isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" : ""}
                  title={
                    task.isCompleted
                      ? "Tandai tugas belum selesai"
                      : "Tandai tugas sudah selesai"
                  }
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{task.isCompleted ? "Sudah Selesai" : "Tandai Selesai"}</span>
                </Button>
              )}

              {task.classroomLink && (
                <a
                  href={task.classroomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-50 dark:bg-[#151D2C] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 transition cursor-pointer"
                  title="Buka langsung di Google Classroom"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <Button
                variant="ghost"
                size="iconSm"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-50 dark:bg-[#151D2C] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 transition cursor-pointer"
                title="Tutup jendela"
                aria-label="Tutup jendela"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Ask AI Copilot Ribbon inside Modal */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Butuh bantuan atau penjelasan materi lebih dalam?</span>
            </div>
            <Button
              onClick={() => {
                onClose();
                onOpenChat(task.id);
              }}
              size="sm"
              className="gap-1.5"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Tanya Asisten AI</span>
            </Button>
          </div>
        </DialogHeader>

        {/* TurboLearn Tabs Bar */}
        <div className="px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D2C] flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab("summary")}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "summary"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Rangkuman & Catatan</span>
          </button>

          <button
            onClick={() => setActiveTab("checklist")}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "checklist"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Checklist Langkah ({checklistDone}/{checklistTotal})</span>
          </button>

          <button
            onClick={() => setActiveTab("youtube")}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "youtube"
                ? "border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Youtube className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Video YouTube ({ai?.youtubeVideos?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("sources")}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "sources"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Sumber Web ({ai?.sources?.length || 0})</span>
          </button>

          {task.materials && task.materials.length > 0 && (
            <button
              onClick={() => setActiveTab("materials")}
              className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "materials"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Paperclip className="w-4 h-4" />
              <span>Materi Guru ({task.materials.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("tips")}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "tips"
                ? "border-amber-500 text-amber-700 dark:border-amber-400 dark:text-amber-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Tips Belajar</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50 dark:bg-[#0B0F17]">
          {/* AI Banner Prompt if not analyzed yet */}
          {!ai && (
            <div className="p-5 rounded-3xl bg-indigo-600 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <h3 className="font-extrabold text-base">
                    Aktifkan Rangkuman Pintar & Video Belajar AI
                  </h3>
                </div>
                <p className="text-xs text-indigo-100 leading-relaxed">
                  {APP_NAME} akan membuat rangkuman konsep penting, menyusun langkah checklist tugas, dan mengkurasi video YouTube serta referensi terpercaya.
                </p>
              </div>
              <Button
                id="modal-trigger-ai-analyze"
                onClick={() => onAnalyzeWithAI(task.id)}
                disabled={task.aiLoading}
                variant="secondary"
                size="default"
                className="bg-white text-indigo-700 hover:bg-indigo-50 dark:bg-slate-100 dark:text-[#0f172a] dark:hover:bg-white shrink-0 font-extrabold"
              >
                {task.aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Sedang Menyusun...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Susun Materi Sekarang</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* TAB 1: SUMMARY & NOTES */}
          {activeTab === "summary" && (
            <div className="space-y-5">
              {/* Teacher Original Description */}
              {task.description && (
                <div className="bg-white dark:bg-[#151D2C] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Instruksi / Deskripsi Asli dari Guru
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {task.description}
                  </p>
                </div>
              )}

              {/* AI Key Summary & Concepts */}
              {ai && (
                <div className="bg-white dark:bg-[#151D2C] rounded-2xl p-5 border border-indigo-100 dark:border-slate-800 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        Rangkuman Inti Materi
                      </h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      Tingkat: {ai.difficulty}
                    </span>
                  </div>

                  <p className="text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-100/80 dark:border-indigo-800/60">
                    {ai.summary}
                  </p>

                  {/* Key Concepts Chips */}
                  {ai.keyConcepts && ai.keyConcepts.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Topik & Konsep Kunci:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {ai.keyConcepts.map((concept, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              navigator.clipboard.writeText(concept);
                              setCopiedConcept(concept);
                              setTimeout(() => setCopiedConcept(null), 1500);
                              toast.success("Konsep Disalin", {
                                description: `"${concept}" disalin ke clipboard.`,
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                            title="Klik untuk menyalin konsep"
                          >
                            {copiedConcept === concept ? (
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <BookOpen className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                            )}
                            <span>{concept}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Personal Notes Editor */}
              <div className="bg-white dark:bg-[#151D2C] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Catatan Pribadi Kamu</span>
                  </h4>
                  {isSavedNotes && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Tersimpan!
                    </span>
                  )}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tulis catatan pengerjaan, jawaban sementara, atau rumus penting di sini..."
                  rows={4}
                  className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveNotes}
                    size="sm"
                    variant="default"
                    className="gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Catatan</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHECKLIST STEPS */}
          {activeTab === "checklist" && (
            <div className="space-y-4">
              {/* Progress Summary Card */}
              <div className="bg-white dark:bg-[#151D2C] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      Langkah Pengerjaan Tugas
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Centang setiap langkah yang sudah selesai kamu kerjakan.
                    </p>
                  </div>
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {checklistDone} / {checklistTotal} Langkah ({checklistPercent}%)
                  </span>
                </div>

                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${checklistPercent}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              {ai?.checklist && ai.checklist.length > 0 ? (
                <div className="space-y-2.5">
                  {ai.checklist.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      onClick={() => onToggleChecklistItem(task.id, item.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        item.done
                          ? "bg-slate-50 dark:bg-[#0F172A]/50 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                          : "bg-white dark:bg-[#151D2C] border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 text-slate-800 dark:text-slate-200 shadow-2xs"
                      }`}
                    >
                      <button className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400">
                        {item.done ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        )}
                      </button>
                      <div className="flex-1">
                        <span
                          className={`text-sm font-semibold leading-relaxed ${
                            item.done ? "line-through text-slate-400 dark:text-slate-500" : ""
                          }`}
                        >
                          {item.text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-[#151D2C] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                  Belum ada checklist. Klik tombol "Susun Materi Sekarang" di atas untuk membuat checklist otomatis dengan AI.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: YOUTUBE RECOMMENDATIONS */}
          {activeTab === "youtube" && (
            <div className="space-y-4">
              {ai?.youtubeVideos && ai.youtubeVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ai.youtubeVideos.map((video, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-[#151D2C] rounded-3xl p-5 border border-rose-100 dark:border-rose-950/60 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                            <Youtube className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">
                              {video.channel}
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                              {video.title}
                            </h4>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-[#0F172A] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          {video.reason}
                        </p>

                        {video.keyTakeaways && video.keyTakeaways.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                              Topik yang dipelajari:
                            </span>
                            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                              {video.keyTakeaways.map((takeaway, tIdx) => (
                                <li key={tIdx} className="line-clamp-1">
                                  {takeaway}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <a
                        href={video.searchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5 transition shadow-xs active:scale-95"
                      >
                        <Youtube className="w-4 h-4" />
                        <span>Tonton Video di YouTube</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-[#151D2C] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                  Belum ada rekomendasi video YouTube. Klik "Susun Materi Sekarang" untuk mencari video YouTube yang cocok.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WEB SOURCES */}
          {activeTab === "sources" && (
            <div className="space-y-3">
              {ai?.sources && ai.sources.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {ai.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white dark:bg-[#151D2C] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60">
                            {src.domain}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-1">
                          {src.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {src.description}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        Baca Selengkapnya →
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-[#151D2C] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                  Belum ada referensi web terkurasi.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TEACHER MATERIALS */}
          {activeTab === "materials" && task.materials && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {task.materials.map((mat, idx) => {
                  const title =
                    mat.driveFile?.driveFile?.title ||
                    mat.youtubeVideo?.title ||
                    mat.link?.title ||
                    "Lampiran";
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
                      className="bg-white dark:bg-[#151D2C] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition shrink-0">
                          {mat.youtubeVideo ? (
                            <Youtube className="w-5 h-5 text-red-500" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {title}
                          </h4>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Buka dokumen guru
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: STUDY TIPS */}
          {activeTab === "tips" && ai && (
            <div className="space-y-4">
              {ai.recommendedStrategy && (
                <div className="bg-amber-50 dark:bg-amber-950/40 rounded-2xl p-5 border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Strategi Belajar Terbaik
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                    {ai.recommendedStrategy}
                  </p>
                </div>
              )}

              {ai.studyTips && ai.studyTips.length > 0 && (
                <div className="bg-white dark:bg-[#151D2C] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Tips Efektif Mengerjakan:
                  </h4>
                  <ul className="space-y-2">
                    {ai.studyTips.map((tip, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D2C] flex flex-row items-center justify-between sm:justify-between shrink-0">
          <Button
            variant="primarySubtle"
            size="sm"
            onClick={() => {
              onClose();
              onOpenChat(task.id);
            }}
            className="gap-2"
          >
            <MessageSquareText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Tanya AI Soal Tugas Ini</span>
          </Button>

          <Button
            onClick={onClose}
            size="sm"
          >
            Selesai Membaca
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
