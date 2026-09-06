"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Shell } from "../../../components/Shell";
import { TaskDetailModal } from "../../../components/TaskDetailModal";
import { TodoTask } from "../../../types";
import {
  loadTasks,
  updateTask,
  loadPreferences,
  loadAIConfig,
} from "../../../lib/taskStore";
import { analyzeTaskWithAI } from "../../../services/aiService";
import { toast } from "@/components/ui/sonner";
import confetti from "canvas-confetti";

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<TodoTask | null>(null);

  useEffect(() => {
    const found = loadTasks().find((t) => t.id === params.id);
    if (!found) {
      router.replace("/");
      return;
    }
    setTask(found);
  }, [params.id, router]);

  const patchTask = (taskId: string, patch: Partial<TodoTask>) => {
    updateTask(taskId, patch);
    setTask(loadTasks().find((t) => t.id === taskId) || null);
  };

  const handleAnalyzeWithAI = async (taskId: string) => {
    const target = loadTasks().find((t) => t.id === taskId);
    if (!target || target.aiLoading) return;

    const CACHE_KEY = `ai_analysis_cache_${taskId}`;
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const parsedAnalysis = JSON.parse(cachedData);
        patchTask(taskId, { aiAnalysis: parsedAnalysis, aiLoading: false });
        return;
      } catch {}
    }

    patchTask(taskId, { aiLoading: true, aiError: undefined });
    try {
      const analysisResult = await analyzeTaskWithAI(
        target,
        loadPreferences(),
        loadAIConfig()
      );
      localStorage.setItem(CACHE_KEY, JSON.stringify(analysisResult));
      patchTask(taskId, { aiAnalysis: analysisResult, aiLoading: false });
      toast.success("Rangkuman dan Referensi Siap", {
        description: `Materi belajar untuk "${target.title}" berhasil disiapkan.`,
      });
    } catch (error: any) {
      patchTask(taskId, {
        aiLoading: false,
        aiError: error.message || "Gagal memproses AI",
      });
      toast.error("Gagal Menganalisis Tugas", {
        description:
          error.message ||
          "Periksa koneksi internet atau kunci API Anda.",
      });
    }
  };

  const handleToggleChecklistItem = (taskId: string, checkId: string) => {
    const current = loadTasks().find((t) => t.id === taskId);
    if (!current?.aiAnalysis?.checklist) return;
    const updatedChecklist = current.aiAnalysis.checklist.map((item) =>
      item.id === checkId ? { ...item, done: !item.done } : item
    );
    patchTask(taskId, {
      aiAnalysis: {
        ...current.aiAnalysis,
        checklist: updatedChecklist,
      },
    });
  };

  const handleSaveNotes = (taskId: string, notes: string) => {
    patchTask(taskId, { customNotes: notes });
  };

  const handleToggleComplete = (taskId: string) => {
    const target = loadTasks().find((t) => t.id === taskId);
    if (!target) return;
    const nowCompleted = !target.isCompleted;
    patchTask(taskId, {
      isCompleted: nowCompleted,
      completedAt: nowCompleted ? new Date().toISOString() : undefined,
    });
    if (nowCompleted) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#6366f1", "#10b981", "#f59e0b", "#ec4899"],
        });
      } catch {}
      toast.success("Tugas Selesai", {
        description: `"${target.title}" telah ditandai selesai.`,
      });
    } else {
      toast.info("Tugas Diaktifkan Kembali", {
        description: `"${target.title}" dipindahkan kembali ke daftar aktif.`,
      });
    }
  };

  return (
    <Shell>
      <div className="h-[calc(100dvh-11rem)]">
        <TaskDetailModal
          task={task}
          isOpen
          pageMode
          pageClassName="h-full flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161616]"
          onClose={() => router.push("/")}
          onAnalyzeWithAI={handleAnalyzeWithAI}
          onToggleChecklistItem={handleToggleChecklistItem}
          onSaveNotes={handleSaveNotes}
          onOpenChat={(taskId) => router.push(`/chat?task=${taskId}`)}
          onToggleComplete={handleToggleComplete}
        />
      </div>
    </Shell>
  );
}