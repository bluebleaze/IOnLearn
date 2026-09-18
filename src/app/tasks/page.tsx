"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpDown,
  ListTodo,
  Loader2,
  LayoutGrid,
  Columns3,
  TableProperties,
  AlertCircle,
  MessageSquareText,
  ExternalLink,
  Trash2,
  ArrowRight,
  Coffee,
  Check,
  ListChecks,
  Youtube,
  Plus,
  Filter,
  Calendar,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { TaskCompleteConfirmModal } from "@/components/TaskCompleteConfirmModal";
import { TodoTask, PersonalTodo } from "@/types";
import {
  loadTasks,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  loadPreferences,
  loadAIConfig,
  addTodo,
} from "@/lib/taskStore";
import { analyzeTaskWithAI } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import confetti from "canvas-confetti";
import { useLanguage } from "@/context/LanguageContext";

type ViewMode = "grid" | "kanban" | "table";
type StatusFilter = "all" | "urgent" | "later" | "overdue" | "completed";

const truncateWords = (text: string, maxWords: number = 12): string => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};

export default function TasksPage() {
  const router = useRouter();
  const { isEn, t } = useLanguage();
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [statusTab, setStatusTab] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<"due-asc" | "due-desc" | "priority" | "newest">("due-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeDetailTaskId, setActiveDetailTaskId] = useState<string | null>(null);
  const [breakingDownTaskId, setBreakingDownTaskId] = useState<string | null>(null);
  const [taskToComplete, setTaskToComplete] = useState<TodoTask | null>(null);

  const activeDetailTask = useMemo(() => {
    if (!activeDetailTaskId) return null;
    return tasks.find((t) => t.id === activeDetailTaskId) || null;
  }, [tasks, activeDetailTaskId]);

  useEffect(() => {
    setTasks(loadTasks());
    setIsLoaded(true);

    const handleStorage = () => setTasks(loadTasks());
    window.addEventListener("taskStoreChange", handleStorage);
    return () => window.removeEventListener("taskStoreChange", handleStorage);
  }, []);

  // Extract unique courses with counts
  const coursesWithCounts = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t) => {
      const cName = t.courseName?.trim() || "Umum";
      map.set(cName, (map.get(cName) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [tasks]);

  // Key metrics & Priority Counts
  const counts = useMemo(() => {
    const now = Date.now();
    let urgent = 0;
    let later = 0;
    let overdue = 0;
    let completed = 0;

    tasks.forEach((t) => {
      if (t.isCompleted) {
        completed++;
      } else if (typeof t.dueTimestamp === "number" && !isNaN(t.dueTimestamp) && t.dueTimestamp < now) {
        overdue++;
      } else if (
        t.priority === "high" ||
        (typeof t.dueTimestamp === "number" && !isNaN(t.dueTimestamp) && t.dueTimestamp - now <= 48 * 3600 * 1000) ||
        (!t.dueTimestamp && t.priority !== "low")
      ) {
        urgent++;
      } else {
        later++;
      }
    });

    return { all: tasks.length, urgent, later, overdue, completed };
  }, [tasks]);

  // Filter & Sort
  const filteredTasks = useMemo(() => {
    const now = Date.now();
    return tasks
      .filter((task) => {
        if (viewMode !== "kanban") {
          if (statusTab === "urgent") {
            if (task.isCompleted) return false;
            const isOverdue = typeof task.dueTimestamp === "number" && !isNaN(task.dueTimestamp) && task.dueTimestamp < now;
            if (isOverdue) return false;
            const isUrgent =
              task.priority === "high" ||
              (typeof task.dueTimestamp === "number" && !isNaN(task.dueTimestamp) && task.dueTimestamp - now <= 48 * 3600 * 1000) ||
              (!task.dueTimestamp && task.priority !== "low");
            if (!isUrgent) return false;
          } else if (statusTab === "later") {
            if (task.isCompleted) return false;
            const isOverdue = typeof task.dueTimestamp === "number" && !isNaN(task.dueTimestamp) && task.dueTimestamp < now;
            if (isOverdue) return false;
            const isUrgent =
              task.priority === "high" ||
              (typeof task.dueTimestamp === "number" && !isNaN(task.dueTimestamp) && task.dueTimestamp - now <= 48 * 3600 * 1000) ||
              (!task.dueTimestamp && task.priority !== "low");
            if (isUrgent) return false;
          } else if (statusTab === "overdue") {
            if (task.isCompleted) return false;
            const isOverdue = typeof task.dueTimestamp === "number" && !isNaN(task.dueTimestamp) && task.dueTimestamp < now;
            if (!isOverdue) return false;
          } else if (statusTab === "completed") {
            if (!task.isCompleted) return false;
          }
        }

        if (selectedCourse !== "all" && (task.courseName?.trim() || "Umum") !== selectedCourse) {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q);
          const matchCourse = task.courseName?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCourse) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const now = Date.now();
        const getStatusRank = (t: TodoTask): number => {
          // Urutan prioritas QA #7: 1. Perlu Dikerjakan, 2. Nanti, 3. Telat, 4. Selesai
          if (t.isCompleted) return 4;
          if (typeof t.dueTimestamp === "number" && !isNaN(t.dueTimestamp) && t.dueTimestamp < now) {
            return 3;
          }
          const isUrgent =
            t.priority === "high" ||
            (typeof t.dueTimestamp === "number" && !isNaN(t.dueTimestamp) && t.dueTimestamp - now <= 48 * 3600 * 1000) ||
            (!t.dueTimestamp && t.priority !== "low");
          if (isUrgent) return 1;
          return 2;
        };

        const aRank = getStatusRank(a);
        const bRank = getStatusRank(b);

        // Tugas yang belum selesai harus selalu diprioritaskan di atas tugas selesai
        // dan diurutkan berdasarkan status: Perlu Dikerjakan -> Nanti -> Telat -> Selesai
        if (aRank !== bRank) {
          return aRank - bRank;
        }

        if (sortBy === "due-asc") {
          const aHasDue = typeof a.dueTimestamp === "number" && !isNaN(a.dueTimestamp);
          const bHasDue = typeof b.dueTimestamp === "number" && !isNaN(b.dueTimestamp);

          if (aHasDue && bHasDue) {
            return (a.dueTimestamp as number) - (b.dueTimestamp as number);
          }
          if (aHasDue && !bHasDue) return -1;
          if (!aHasDue && bHasDue) return 1;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === "due-desc") {
          const aDue = a.dueTimestamp || -Infinity;
          const bDue = b.dueTimestamp || -Infinity;
          return bDue - aDue;
        }
        if (sortBy === "priority") {
          const pScore: Record<string, number> = { high: 3, medium: 2, low: 1 };
          const aScore = pScore[a.priority || "medium"] || 1;
          const bScore = pScore[b.priority || "medium"] || 1;
          return bScore - aScore;
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [tasks, statusTab, selectedCourse, searchQuery, sortBy, viewMode]);

  const patchTask = (taskId: string, patch: Partial<TodoTask>) => {
    updateTask(taskId, patch);
    setTasks(loadTasks());
  };

  const getTaskStatusInfo = (t: TodoTask) => {
    if (t.isCompleted) {
      return {
        label: "Selesai",
        badgeClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50",
        icon: CheckCircle2,
      };
    }
    const now = Date.now();
    if (typeof t.dueTimestamp === "number" && !isNaN(t.dueTimestamp) && t.dueTimestamp < now) {
      return {
        label: "Telat",
        badgeClass: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/50",
        icon: AlertCircle,
      };
    }
    const isUrgent =
      t.priority === "high" ||
      (typeof t.dueTimestamp === "number" && !isNaN(t.dueTimestamp) && t.dueTimestamp - now <= 48 * 3600 * 1000) ||
      (!t.dueTimestamp && t.priority !== "low");

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

  const handleToggleComplete = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    if (!target.isCompleted) {
      setTaskToComplete(target);
    } else {
      executeToggleComplete(taskId);
    }
  };

  const executeToggleComplete = (taskId: string) => {
    const res = toggleTaskComplete(taskId);
    setTasks(loadTasks());
    if (res.nowCompleted) {
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.85 },
          colors: ["#818cf8", "#34d399", "#fbbf24"],
        });
      } catch { }
      toast.success("Tugas Selesai", {
        description: res.title ? `"${res.title}"` : "Tugas berhasil diselesaikan.",
      });
    }
  };

  const handleToggleChecklistItem = (taskId: string, checkId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target?.aiAnalysis?.checklist) return;

    const newChecklist = target.aiAnalysis.checklist.map((item) =>
      item.id === checkId ? { ...item, done: !item.done } : item
    );

    patchTask(taskId, {
      aiAnalysis: {
        ...target.aiAnalysis,
        checklist: newChecklist,
      },
    });
  };

  const handleSaveNotes = (taskId: string, notes: string) => {
    patchTask(taskId, { customNotes: notes });
    toast.success("Catatan tugas disimpan.");
  };

  const handleAnalyzeWithAI = async (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target || target.aiLoading) return;

    patchTask(taskId, { aiLoading: true, aiError: undefined });
    try {
      const analysis = await analyzeTaskWithAI(target, loadPreferences(), loadAIConfig());
      patchTask(taskId, { aiAnalysis: analysis, aiLoading: false });
      toast.success("Analisis AI Selesai", {
        description: `Materi & panduan untuk "${target.title}" siap dipelajari.`,
      });
    } catch (err: any) {
      patchTask(taskId, {
        aiLoading: false,
        aiError: err.message || "Gagal menganalisis tugas.",
      });
      toast.error("Gagal Analisis AI", {
        description: err.message || "Silakan periksa API Key atau coba lagi.",
      });
    }
  };

  const handleBreakdownToTodo = async (task: TodoTask) => {
    setBreakingDownTaskId(task.id);
    try {
      const config = loadAIConfig();
      const prefs = loadPreferences();
      const res = await fetch("/api/ai/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "breakdown_task",
          payload: task,
          task,
          preferences: prefs,
          aiConfig: config,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Gagal melakukan breakdown tugas");
      }

      const { data } = await res.json();
      const now = new Date().toISOString();
      const newTodo: PersonalTodo = {
        id: `todo-${Date.now()}`,
        title: data.title || task.title,
        description: data.description || `Langkah pengerjaan untuk: ${task.title}`,
        isCompleted: false,
        priority: task.priority || "high",
        dueDate: task.dueDateStr,
        courseName: task.courseName,
        courseWorkId: task.courseWorkId || task.id,
        category: task.courseName || "Tugas",
        subtasks: data.subtasks || [],
        createdAt: now,
        updatedAt: now,
      };

      addTodo(newTodo);
      toast.success("Ditambahkan ke To-Do", {
        description: `"${task.title}" dipecah menjadi ${newTodo.subtasks?.length || 0} sub-langkah.`,
        action: {
          label: "Buka To-Do",
          onClick: () => router.push("/todo"),
        },
      });
    } catch (err: any) {
      toast.error("Gagal Breakdown Tugas", {
        description: err.message || "Terjadi kesalahan saat memproses.",
      });
    } finally {
      setBreakingDownTaskId(null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    setTasks(loadTasks());
    toast.info("Tugas Dihapus", { description: "Tugas telah dihapus dari daftar." });
  };

  const isAllPendingDone = counts.all > 0 && counts.completed === counts.all;

  const renderDueBadge = (task: TodoTask) => {
    if (!task.dueDateStr) return <span className="text-slate-500 dark:text-[#a3a3a3]">-</span>;
    if (task.isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-[#a3a3a3]">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{task.dueDateStr}</span>
        </span>
      );
    }
    if (task.dueTimestamp) {
      const diffHours = (task.dueTimestamp - Date.now()) / (1000 * 3600);
      if (diffHours < 0) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-[#f87171]">
            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-[#f87171]" />
            <span>Terlewat</span>
          </span>
        );
      }
      if (diffHours <= 24) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-[#fbbf24]">
            <Clock className="w-3 h-3 text-amber-600 dark:text-[#fbbf24]" />
            <span>Hari Ini</span>
          </span>
        );
      }
      if (diffHours <= 48) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300">
            <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />
            <span>Besok</span>
          </span>
        );
      }
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-[#999]">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>{task.dueDateStr}</span>
      </span>
    );
  };

  return (
    <Shell>
      <div className="space-y-5 max-w-7xl mx-auto pb-16">
        {/* Distilled Header & Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-slate-900 dark:text-[#f3f3f3]">
              {t.tasks.pageTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#a3a3a3] mt-0.5">
              {t.tasks.pageSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-[#252525] text-slate-900 dark:text-[#f3f3f3] shadow-2xs font-semibold"
                    : "text-slate-500 dark:text-[#777] hover:text-slate-800 dark:hover:text-[#eee]"
                }`}
                title={isEn ? "Grid View" : "Tampilan Grid"}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === "kanban"
                    ? "bg-white dark:bg-[#252525] text-slate-900 dark:text-[#f3f3f3] shadow-2xs font-semibold"
                    : "text-slate-500 dark:text-[#777] hover:text-slate-800 dark:hover:text-[#eee]"
                }`}
                title={isEn ? "Kanban Board View" : "Tampilan Kanban"}
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-[#252525] text-slate-900 dark:text-[#f3f3f3] shadow-2xs font-semibold"
                    : "text-slate-500 dark:text-[#777] hover:text-slate-800 dark:hover:text-[#eee]"
                }`}
                title={isEn ? "Table View" : "Tampilan Tabel"}
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isEn ? "Table" : "Tabel"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161616] rounded-2xl p-3.5 sm:p-4 space-y-3 border border-slate-200/80 dark:border-[#262626] shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              <button
                onClick={() => setStatusTab("all")}
                className={`min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-semibold flex items-center gap-1.5 ${
                  statusTab === "all"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                    : "text-slate-700 dark:text-[#888] hover:bg-slate-100 dark:hover:bg-[#222]"
                }`}
              >
                <span>{t.tasks.tabAll}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-xs ${
                    statusTab === "all"
                      ? "bg-slate-700 dark:bg-slate-200 text-slate-100 dark:text-slate-900"
                      : "bg-slate-100 dark:bg-[#222] text-slate-700 dark:text-[#ccc]"
                  }`}
                >
                  {counts.all}
                </span>
              </button>

              <button
                onClick={() => setStatusTab("urgent")}
                className={`min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-semibold flex items-center gap-1.5 ${
                  statusTab === "urgent"
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>{isEn ? "Action Needed" : "Perlu Dikerjakan"}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-xs ${
                    statusTab === "urgent"
                      ? "bg-rose-700 text-rose-50"
                      : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {counts.urgent}
                </span>
              </button>

              <button
                onClick={() => setStatusTab("later")}
                className={`min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-semibold flex items-center gap-1.5 ${
                  statusTab === "later"
                    ? "bg-slate-700 text-white shadow-2xs"
                    : "text-slate-600 dark:text-[#aaa] hover:bg-slate-100 dark:hover:bg-[#222]"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                <span>{isEn ? "Later" : "Nanti"}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-xs ${
                    statusTab === "later"
                      ? "bg-slate-800 text-slate-100"
                      : "bg-slate-100 dark:bg-[#222] text-slate-700 dark:text-[#ccc]"
                  }`}
                >
                  {counts.later}
                </span>
              </button>

              <button
                onClick={() => setStatusTab("overdue")}
                className={`min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-semibold flex items-center gap-1.5 ${
                  statusTab === "overdue"
                    ? "bg-amber-500 text-white shadow-2xs"
                    : "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span>{isEn ? "Overdue" : "Telat"}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-xs ${
                    statusTab === "overdue"
                      ? "bg-amber-600 text-amber-50"
                      : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                  }`}
                >
                  {counts.overdue}
                </span>
              </button>

              <button
                onClick={() => setStatusTab("completed")}
                className={`min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-semibold flex items-center gap-1.5 ${
                  statusTab === "completed"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>{t.tasks.tabCompleted}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-xs ${
                    statusTab === "completed"
                      ? "bg-emerald-700 text-emerald-50"
                      : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                  }`}
                >
                  {counts.completed}
                </span>
              </button>
            </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#737373]" />
              <input
                type="text"
                placeholder={t.tasks.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-900 dark:text-[#f3f3f3] placeholder:text-slate-400 dark:placeholder:text-[#666] focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-[#ccc]"
                >
                  Clear
                </button>
              )}
            </div>

            {coursesWithCounts.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#2b2b2b] px-2.5 py-1.5 rounded-xl shrink-0">
                <Filter className="w-3 h-3 text-slate-400" />
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="text-xs bg-transparent border-0 text-slate-800 dark:text-[#e5e5e5] font-medium focus:outline-none cursor-pointer max-w-[140px] truncate"
                >
                  <option value="all" className="bg-white dark:bg-[#181818]">
                    {isEn ? `All Courses (${tasks.length})` : `Semua Kelas (${tasks.length})`}
                  </option>
                  {coursesWithCounts.map(({ name, count }) => (
                    <option key={name} value={name} className="bg-white dark:bg-[#181818]">
                      {name} ({count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#2b2b2b] px-2.5 py-1.5 rounded-xl shrink-0">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-transparent border-0 text-slate-800 dark:text-[#e5e5e5] font-medium focus:outline-none cursor-pointer"
              >
                <option value="due-asc" className="bg-white dark:bg-[#181818]">{t.tasks.sortDueAsc}</option>
                <option value="due-desc" className="bg-white dark:bg-[#181818]">{t.tasks.sortDueDesc}</option>
                <option value="priority" className="bg-white dark:bg-[#181818]">{t.tasks.sortPriority}</option>
                <option value="newest" className="bg-white dark:bg-[#181818]">{t.tasks.sortNewest}</option>
              </select>
            </div>
          </div>
        </div>

        {!isLoaded ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-500">Memuat daftar tugas...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-[#202020] flex items-center justify-center text-slate-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#f3f3f3]">
              {t.tasks.emptyTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#888] max-w-sm mx-auto">
              {t.tasks.emptyDesc}
            </p>
          </div>
        ) : statusTab !== "all" && filteredTasks.length === 0 && counts.all > 0 ? (
          <div className="text-center py-14 px-6 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#f3f3f3] font-heading">
                {isEn ? "No tasks in this category" : "Tidak ada tugas di kategori ini"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#888] leading-relaxed">
                {isEn ? "All tasks under this filter have been addressed or none are available." : "Semua tugas pada filter ini telah ditangani atau belum tersedia."}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusTab("all")}
                className="text-xs rounded-xl"
              >
                {isEn ? `View All Tasks (${counts.all})` : `Lihat Semua Tugas (${counts.all})`}
              </Button>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-14 px-4 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-[#202020] flex items-center justify-center text-slate-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f3f3f3]">
              {isEn ? "No Tasks Found" : "Tidak Ada Tugas Ditemukan"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#888] max-w-xs mx-auto">
              {isEn ? "Try adjusting your search filters or select another category." : "Coba sesuaikan filter pencarian atau pilih kategori lainnya."}
            </p>
            {(searchQuery || selectedCourse !== "all" || statusTab !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCourse("all");
                  setStatusTab("all");
                }}
                className="mt-1 text-xs rounded-xl"
              >
                {isEn ? "Reset Filters" : "Reset Filter"}
              </Button>
            )}
          </div>
        ) : (
          <>
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onAnalyzeWithAI={handleAnalyzeWithAI}
                    onOpenDetails={(t) => setActiveDetailTaskId(t.id)}
                    onOpenChat={(taskId) => router.push(`/chat?taskId=${taskId}`)}
                    onDeleteTask={handleDeleteTask}
                    onBreakdownToTodo={handleBreakdownToTodo}
                    isBreakingDown={breakingDownTaskId === task.id}
                  />
                ))}
              </div>
            )}

            {viewMode === "kanban" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {(() => {
                  const pendingTasks = filteredTasks.filter((t) => !t.isCompleted && !t.aiAnalysis);
                  return (
                    <div className="bg-slate-50/70 dark:bg-[#141414] p-3.5 rounded-2xl border border-slate-200/70 dark:border-[#222] space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#ccc]">
                            {isEn ? "Action Needed" : "Perlu Dikerjakan"}
                          </h3>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-[#202020] text-slate-600 dark:text-[#888] shadow-2xs">
                          {pendingTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2.5 min-h-[180px]">
                        {pendingTasks.length === 0 ? (
                          <div className="border border-dashed border-slate-200 dark:border-[#262626] rounded-xl p-5 text-center text-slate-400 text-xs">
                            <CheckCircle2 className="w-4 h-4 mx-auto text-slate-300 dark:text-[#444] mb-1" />
                            <p>{isEn ? "No pending tasks" : "Tidak ada tugas pending"}</p>
                          </div>
                        ) : (
                          pendingTasks.map((task) => (
                            <div
                              key={task.id}
                              role="button"
                              tabIndex={0}
                              className="bg-white dark:bg-[#181818] p-3.5 rounded-xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-2.5 hover:border-slate-300 dark:hover:border-[#3a3a3a] transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#141414]"
                              onClick={() => setActiveDetailTaskId(task.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setActiveDetailTaskId(task.id);
                                }
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-[#1f1f28] text-indigo-700 dark:text-[#a5b4fc] truncate max-w-[140px]">
                                  {task.courseName || "Kuliah"}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleComplete(task.id);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.stopPropagation();
                                    }
                                  }}
                                  className="min-w-[44px] min-h-[44px] -m-2.5 flex items-center justify-center cursor-pointer shrink-0 focus-visible:outline-none"
                                  title="Tandai Selesai"
                                  aria-label={`Tandai "${task.title}" selesai`}
                                >
                                  <span className="w-5 h-5 rounded-md border border-slate-300 dark:border-[#444] hover:border-emerald-500 flex items-center justify-center transition focus-visible:ring-1 focus-visible:ring-emerald-500">
                                    {task.isCompleted && <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />}
                                  </span>
                                </button>
                              </div>

                              <h4 className="text-xs font-semibold text-slate-900 dark:text-[#f3f3f3] line-clamp-2 leading-relaxed group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {truncateWords(task.title, 12)}
                              </h4>

                              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-[#242424]">
                                <div>{renderDueBadge(task)}</div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAnalyzeWithAI(task.id);
                                  }}
                                  className="min-h-[36px] sm:min-h-0 text-indigo-600 dark:text-[#818cf8] hover:underline flex items-center gap-1 font-medium"
                                  aria-label={`Analisis AI untuk "${task.title}"`}
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>{isEn ? "AI Analysis" : "Analisis AI"}</span>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })()}

                {(() => {
                  const readyTasks = filteredTasks.filter((t) => !t.isCompleted && t.aiAnalysis);
                  return (
                    <div className="bg-slate-50/70 dark:bg-[#141414] p-3.5 rounded-2xl border border-slate-200/70 dark:border-[#222] space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#ccc]">
                            {isEn ? "AI Ready" : "Siap Belajar (AI)"}
                          </h3>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-[#202020] text-slate-600 dark:text-[#888] shadow-2xs">
                          {readyTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2.5 min-h-[180px]">
                        {readyTasks.length === 0 ? (
                          <div className="border border-dashed border-slate-200 dark:border-[#262626] rounded-xl p-5 text-center text-slate-400 text-xs">
                            <Sparkles className="w-4 h-4 mx-auto text-slate-300 dark:text-[#444] mb-1" />
                            <p>{isEn ? "No AI analysis yet" : "Belum ada analisis AI"}</p>
                          </div>
                        ) : (
                          readyTasks.map((task) => (
                            <div
                              key={task.id}
                              role="button"
                              tabIndex={0}
                              className="bg-white dark:bg-[#181818] p-3.5 rounded-xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-2.5 hover:border-slate-300 dark:hover:border-[#3a3a3a] transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#141414]"
                              onClick={() => setActiveDetailTaskId(task.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setActiveDetailTaskId(task.id);
                                }
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-[#1f1f28] text-indigo-700 dark:text-[#a5b4fc] truncate max-w-[140px]">
                                  {task.courseName || "Kuliah"}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleComplete(task.id);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.stopPropagation();
                                    }
                                  }}
                                  className="min-w-[44px] min-h-[44px] -m-2.5 flex items-center justify-center cursor-pointer shrink-0 focus-visible:outline-none"
                                  title="Tandai Selesai"
                                  aria-label={`Tandai "${task.title}" selesai`}
                                >
                                  <span className="w-5 h-5 rounded-md border border-slate-300 dark:border-[#444] hover:border-emerald-500 flex items-center justify-center transition focus-visible:ring-1 focus-visible:ring-emerald-500">
                                    {task.isCompleted && <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />}
                                  </span>
                                </button>
                              </div>

                              <h4 className="text-xs font-semibold text-slate-900 dark:text-[#f3f3f3] line-clamp-2 leading-relaxed group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {truncateWords(task.title, 12)}
                              </h4>

                              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-[#242424]">
                                <div>{renderDueBadge(task)}</div>
                                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Tersedia</span>
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })()}

                {(() => {
                  const completedTasks = filteredTasks.filter((t) => t.isCompleted);
                  return (
                    <div className="bg-slate-50/70 dark:bg-[#141414] p-3.5 rounded-2xl border border-slate-200/70 dark:border-[#222] space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#ccc]">
                            {isEn ? "Completed" : "Selesai"}
                          </h3>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-[#202020] text-slate-600 dark:text-[#888] shadow-2xs">
                          {completedTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2.5 min-h-[180px]">
                        {completedTasks.length === 0 ? (
                          <div className="border border-dashed border-slate-200 dark:border-[#262626] rounded-xl p-5 text-center text-slate-400 text-xs">
                            <p>{isEn ? "No completed tasks yet" : "Belum ada tugas selesai"}</p>
                          </div>
                        ) : (
                          completedTasks.map((task) => (
                            <div
                              key={task.id}
                              role="button"
                              tabIndex={0}
                              className="bg-white/60 dark:bg-[#141414] p-3.5 rounded-xl border border-slate-200/70 dark:border-[#202020] shadow-2xs space-y-2 opacity-80 hover:opacity-100 transition cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                              onClick={() => setActiveDetailTaskId(task.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setActiveDetailTaskId(task.id);
                                }
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1e1e1e] text-slate-600 dark:text-[#8e8e8e] truncate max-w-[140px]">
                                  {task.courseName || "Kuliah"}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleComplete(task.id);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.stopPropagation();
                                    }
                                  }}
                                  className="min-w-[44px] min-h-[44px] -m-2.5 flex items-center justify-center cursor-pointer shrink-0 focus-visible:outline-none"
                                  title="Tandai Belum Selesai"
                                  aria-label={`Tandai "${task.title}" belum selesai`}
                                >
                                  <span className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center transition">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                </button>
                              </div>

                              <h4 className="text-xs font-medium line-through text-slate-500 dark:text-[#777] line-clamp-2 leading-relaxed">
                                {truncateWords(task.title, 12)}
                              </h4>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {viewMode === "table" && (
              <div className="bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 dark:border-[#262626] bg-slate-50/70 dark:bg-[#181818] text-slate-600 dark:text-[#888]">
                        <th className="py-3 px-4 w-12 text-center">{isEn ? "Check" : "Centang"}</th>
                        <th className="py-3 px-4">{isEn ? "Task Title" : "Judul Tugas"}</th>
                        <th className="py-3 px-4 hidden md:table-cell">{isEn ? "Course" : "Mata Kuliah"}</th>
                        <th className="py-3 px-4">{isEn ? "Status" : "Status"}</th>
                        <th className="py-3 px-4">{isEn ? "Due Date" : "Batas Waktu"}</th>
                        <th className="py-3 px-4 hidden sm:table-cell">{isEn ? "AI Ready" : "AI Ready"}</th>
                        <th className="py-3 px-4 text-right">{isEn ? "Actions" : "Aksi"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#222]">
                      {filteredTasks.map((task) => {
                        const sInfo = getTaskStatusInfo(task);
                        const SIcon = sInfo.icon;
                        return (
                          <tr
                            key={task.id}
                            className="hover:bg-slate-50/60 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                            onClick={() => setActiveDetailTaskId(task.id)}
                          >
                            <td className="py-2.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleToggleComplete(task.id)}
                                className="min-w-[40px] min-h-[40px] -m-2 flex items-center justify-center cursor-pointer mx-auto focus-visible:outline-none"
                                title={task.isCompleted ? "Tandai Belum Selesai" : "Tandai Selesai"}
                                aria-label={task.isCompleted ? `Tandai "${task.title}" belum selesai` : `Tandai "${task.title}" selesai`}
                              >
                                <span
                                  className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition ${
                                    task.isCompleted
                                      ? "bg-emerald-500 text-white shadow-2xs"
                                      : "border-2 border-slate-300 dark:border-[#444] hover:border-emerald-500"
                                  }`}
                                >
                                  {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                                </span>
                              </button>
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-[#f3f3f3] max-w-xs truncate">
                              <span className={task.isCompleted ? "line-through text-slate-400 dark:text-[#777]" : ""}>
                                {task.title}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-600 dark:text-[#aaa] hidden md:table-cell truncate max-w-[160px]">
                              {task.courseName || "Kuliah"}
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold border ${sInfo.badgeClass}`}>
                                <SIcon className="w-3 h-3 shrink-0" />
                                <span>{sInfo.label}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap">{renderDueBadge(task)}</td>
                            <td className="py-2.5 px-4 hidden sm:table-cell">
                              {task.aiAnalysis ? (
                                <span className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                                  <Sparkles className="w-3 h-3" />
                                  {isEn ? "Ready" : "Siap"}
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAnalyzeWithAI(task.id);
                                  }}
                                  className="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                                >
                                  {isEn ? "+ Analyze" : "+ Analisis"}
                                </button>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/chat?taskId=${task.id}`)}
                                  className="h-6.5 px-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold"
                                >
                                  {isEn ? "Ask AI" : "Tanya AI"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setActiveDetailTaskId(task.id)}
                                  className="h-6.5 px-2.5 text-xs rounded-lg border-slate-200 dark:border-[#2b2b2b]"
                                >
                                  {isEn ? "Details" : "Detail"}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {activeDetailTask && (
          <TaskDetailModal
            task={activeDetailTask}
            isOpen={Boolean(activeDetailTask)}
            onClose={() => setActiveDetailTaskId(null)}
            onToggleComplete={handleToggleComplete}
            onToggleChecklistItem={handleToggleChecklistItem}
            onSaveNotes={handleSaveNotes}
            onAnalyzeWithAI={handleAnalyzeWithAI}
            onOpenChat={(taskId) => router.push(`/chat?taskId=${taskId}`)}
          />
        )}

        <TaskCompleteConfirmModal
          isOpen={Boolean(taskToComplete)}
          onClose={() => setTaskToComplete(null)}
          onConfirm={() => {
            if (taskToComplete) {
              executeToggleComplete(taskToComplete.id);
            }
          }}
          taskTitle={taskToComplete?.title}
          language={isEn ? "en" : "id"}
        />
      </div>
    </Shell>
  );
}
