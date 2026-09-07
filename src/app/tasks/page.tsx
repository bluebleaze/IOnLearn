"use client";

import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailModal } from "@/components/TaskDetailModal";
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

type ViewMode = "grid" | "kanban" | "table";
type StatusFilter = "pending" | "ai-ready" | "all" | "completed";

const truncateWords = (text: string, maxWords: number = 12): string => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [statusTab, setStatusTab] = useState<StatusFilter>("pending");
  const [sortBy, setSortBy] = useState<"due-asc" | "due-desc" | "priority" | "newest">("due-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeDetailTask, setActiveDetailTask] = useState<TodoTask | null>(null);
  const [breakingDownTaskId, setBreakingDownTaskId] = useState<string | null>(null);

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

  // Key metrics
  const counts = useMemo(() => {
    const pending = tasks.filter((t) => !t.isCompleted).length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const aiReady = tasks.filter((t) => !t.isCompleted && Boolean(t.aiAnalysis)).length;
    return { all: tasks.length, pending, completed, aiReady };
  }, [tasks]);

  // Filter & Sort
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (viewMode !== "kanban") {
          if (statusTab === "pending" && task.isCompleted) return false;
          if (statusTab === "completed" && !task.isCompleted) return false;
          if (statusTab === "ai-ready" && (!task.aiAnalysis || task.isCompleted)) return false;
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
        if (sortBy === "due-asc") {
          const now = Date.now();
          const aHasDue = typeof a.dueTimestamp === "number" && !isNaN(a.dueTimestamp);
          const bHasDue = typeof b.dueTimestamp === "number" && !isNaN(b.dueTimestamp);

          if (aHasDue && bHasDue) {
            const aIsOverdue = (a.dueTimestamp as number) < now;
            const bIsOverdue = (b.dueTimestamp as number) < now;

            // Tugas yang belum lewat tenggat: urutkan dari tenggat terdekat
            if (!aIsOverdue && !bIsOverdue) {
              return (a.dueTimestamp as number) - (b.dueTimestamp as number);
            }
            // Tugas mendatang/belum lewat tenggat berada di ATAS tugas yang terlewatkan
            if (!aIsOverdue && bIsOverdue) return -1;
            if (aIsOverdue && !bIsOverdue) return 1;

            // Jika sama-sama terlewatkan: urutkan yang paling baru terlewat di atas
            return (b.dueTimestamp as number) - (a.dueTimestamp as number);
          }

          // Tugas bertenggat waktu berada di atas tugas tanpa tenggat waktu
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

  const handleToggleComplete = (taskId: string) => {
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

  const isAllPendingDone = counts.all > 0 && counts.pending === 0;

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
              Semua Tugas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#a3a3a3] mt-0.5">
              Katalog tugas Google Classroom & analisis materi AI.
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
                title="Tampilan Grid"
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
                title="Tampilan Kanban"
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
                title="Tampilan Tabel"
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabel</span>
              </button>
            </div>


          </div>
        </div>

        {/* ── Single Unified Filter & Status Bar ── */}
        <div className="bg-white dark:bg-[#161616] rounded-2xl p-3.5 sm:p-4 space-y-3 border border-slate-200/80 dark:border-[#262626] shadow-2xs">
          {/* Status Segment Filters */}
          <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-slate-100 dark:border-[#222]">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              <button
                onClick={() => setStatusTab("pending")}
                className={
                  statusTab === "pending"
                    ? "min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-semibold flex items-center gap-1.5 bg-amber-500 text-white shadow-2xs"
                    : "min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-semibold flex items-center gap-1.5 text-slate-700 dark:text-[#888] hover:bg-slate-100 dark:hover:bg-[#222]"
                }
              >
                <span>Perlu Dikerjakan</span>
                <span
                  className={
                    statusTab === "pending"
                      ? "px-1.5 py-0.2 rounded-md text-xs bg-amber-600 text-amber-50"
                      : "px-1.5 py-0.2 rounded-md text-xs bg-slate-100 dark:bg-[#222] text-slate-700 dark:text-[#ccc]"
                  }
                >
                  {counts.pending}
                </span>
              </button>

              <button
                onClick={() => setStatusTab("ai-ready")}
                className={
                  statusTab === "ai-ready"
                    ? "min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-semibold flex items-center gap-1.5 bg-indigo-600 text-white shadow-2xs"
                    : "min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-semibold flex items-center gap-1.5 text-slate-700 dark:text-[#888] hover:bg-slate-100 dark:hover:bg-[#222]"
                }
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Siap AI</span>
                <span
                  className={
                    statusTab === "ai-ready"
                      ? "px-1.5 py-0.2 rounded-md text-xs bg-indigo-700 text-indigo-50"
                      : "px-1.5 py-0.2 rounded-md text-xs bg-slate-100 dark:bg-[#222] text-slate-700 dark:text-[#ccc]"
                  }
                >
                  {counts.aiReady}
                </span>
              </button>

              <button
                onClick={() => setStatusTab("all")}
                className={
                  statusTab === "all"
                    ? "min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-semibold flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                    : "min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-semibold flex items-center gap-1.5 text-slate-700 dark:text-[#888] hover:bg-slate-100 dark:hover:bg-[#222]"
                }
              >
                <span>Semua</span>
                <span
                  className={
                    statusTab === "all"
                      ? "px-1.5 py-0.2 rounded-md text-xs bg-slate-700 dark:bg-slate-200 text-slate-100 dark:text-slate-900"
                      : "px-1.5 py-0.2 rounded-md text-xs bg-slate-100 dark:bg-[#222] text-slate-700 dark:text-[#ccc]"
                  }
                >
                  {counts.all}
                </span>
              </button>

              <button
                onClick={() => setStatusTab("completed")}
                className={
                  statusTab === "completed"
                    ? "min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-semibold flex items-center gap-1.5 bg-emerald-600 text-white shadow-2xs"
                    : "min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap font-semibold flex items-center gap-1.5 text-slate-700 dark:text-[#888] hover:bg-slate-100 dark:hover:bg-[#222]"
                }
              >
                <span>Selesai</span>
                <span
                  className={
                    statusTab === "completed"
                      ? "px-1.5 py-0.2 rounded-md text-xs bg-emerald-700 text-emerald-50"
                      : "px-1.5 py-0.2 rounded-md text-xs bg-slate-100 dark:bg-[#222] text-slate-700 dark:text-[#ccc]"
                  }
                >
                  {counts.completed}
                </span>
              </button>
            </div>
          </div>

          {/* Search, Sort, & Course Filter in one unified row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#737373]" />
              <input
                type="text"
                placeholder="Cari tugas kuliah atau materi..."
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

            {/* Course Selector Dropdown */}
            {coursesWithCounts.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#2b2b2b] px-2.5 py-1.5 rounded-xl shrink-0">
                <Filter className="w-3 h-3 text-slate-400" />
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="text-xs bg-transparent border-0 text-slate-800 dark:text-[#e5e5e5] font-medium focus:outline-none cursor-pointer max-w-[140px] truncate"
                >
                  <option value="all" className="bg-white dark:bg-[#181818]">Semua Kelas ({tasks.length})</option>
                  {coursesWithCounts.map(({ name, count }) => (
                    <option key={name} value={name} className="bg-white dark:bg-[#181818]">
                      {name} ({count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#2b2b2b] px-2.5 py-1.5 rounded-xl shrink-0">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-transparent border-0 text-slate-800 dark:text-[#e5e5e5] font-medium focus:outline-none cursor-pointer"
              >
                <option value="due-asc" className="bg-white dark:bg-[#181818]">Tenggat Terdekat</option>
                <option value="due-desc" className="bg-white dark:bg-[#181818]">Tenggat Terjauh</option>
                <option value="priority" className="bg-white dark:bg-[#181818]">Prioritas</option>
                <option value="newest" className="bg-white dark:bg-[#181818]">Terbaru</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Empty State ── */}
        {statusTab === "pending" && isAllPendingDone && !searchQuery && selectedCourse === "all" ? (
          <div className="text-center py-16 px-6 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
              <Coffee className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#f3f3f3] font-heading">
                Semua tugas kuliah sudah selesai 🎉
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#888] leading-relaxed">
                Tidak ada tugas mendesak. Waktunya istirahat atau mengulas materi belajar.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusTab("all")}
                className="text-xs rounded-xl"
              >
                Lihat Arsip ({counts.all})
              </Button>
              <Button
                size="sm"
                onClick={() => router.push("/notes")}
                className="text-xs rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Catatan Materi
              </Button>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-14 px-4 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-[#202020] flex items-center justify-center text-slate-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f3f3f3]">
              Tidak Ada Tugas Ditemukan
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#888] max-w-xs mx-auto">
              Coba sesuaikan filter pencarian atau pilih kategori lainnya.
            </p>
            {(searchQuery || selectedCourse !== "all" || statusTab !== "pending") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCourse("all");
                  setStatusTab("pending");
                }}
                className="mt-1 text-xs rounded-xl"
              >
                Reset Filter
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* ── MODE 1: GRID VIEW ────────────────────────────── */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onAnalyzeWithAI={handleAnalyzeWithAI}
                    onOpenDetails={(t) => setActiveDetailTask(t)}
                    onOpenChat={(taskId) => router.push(`/chat?taskId=${taskId}`)}
                    onDeleteTask={handleDeleteTask}
                    onBreakdownToTodo={handleBreakdownToTodo}
                    isBreakingDown={breakingDownTaskId === task.id}
                  />
                ))}
              </div>
            )}

            {/* ── MODE 2: KANBAN VIEW ──────────────────────────── */}
            {viewMode === "kanban" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {/* Column 1: Perlu Dikerjakan */}
                {(() => {
                  const pendingTasks = filteredTasks.filter((t) => !t.isCompleted && !t.aiAnalysis);
                  return (
                    <div className="bg-slate-50/70 dark:bg-[#141414] p-3.5 rounded-2xl border border-slate-200/70 dark:border-[#222] space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#ccc]">
                            Perlu Dikerjakan
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
                            <p>Tidak ada tugas pending</p>
                          </div>
                        ) : (
                          pendingTasks.map((task) => (
                            <div
                              key={task.id}
                              role="button"
                              tabIndex={0}
                              className="bg-white dark:bg-[#181818] p-3.5 rounded-xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-2.5 hover:border-slate-300 dark:hover:border-[#3a3a3a] transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#141414]"
                              onClick={() => setActiveDetailTask(task)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setActiveDetailTask(task);
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
                                  <span>Analisis AI</span>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Column 2: Siap AI & Materi */}
                {(() => {
                  const aiReadyTasks = filteredTasks.filter((t) => !t.isCompleted && Boolean(t.aiAnalysis));
                  return (
                    <div className="bg-slate-50/70 dark:bg-[#141414] p-3.5 rounded-2xl border border-slate-200/70 dark:border-[#222] space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#ccc]">
                            Siap AI & Materi
                          </h3>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-[#202020] text-slate-600 dark:text-[#888] shadow-2xs">
                          {aiReadyTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2.5 min-h-[180px]">
                        {aiReadyTasks.length === 0 ? (
                          <div className="border border-dashed border-slate-200 dark:border-[#262626] rounded-xl p-5 text-center text-slate-400 text-xs">
                            <Sparkles className="w-4 h-4 mx-auto text-slate-300 dark:text-[#444] mb-1" />
                            <p>Belum ada tugas dianalisis</p>
                          </div>
                        ) : (
                          aiReadyTasks.map((task) => (
                            <div
                              key={task.id}
                              role="button"
                              tabIndex={0}
                              className="bg-white dark:bg-[#181818] p-3.5 rounded-xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-2.5 hover:border-indigo-500/40 transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#141414]"
                              onClick={() => setActiveDetailTask(task)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setActiveDetailTask(task);
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
                                <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-[#818cf8] font-medium">
                                  <span>{task.aiAnalysis?.checklist?.length || 0} Langkah</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Column 3: Selesai */}
                {(() => {
                  const completedTasks = filteredTasks.filter((t) => t.isCompleted);
                  return (
                    <div className="bg-slate-50/70 dark:bg-[#141414] p-3.5 rounded-2xl border border-slate-200/70 dark:border-[#222] space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#ccc]">
                            Selesai
                          </h3>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-[#202020] text-slate-600 dark:text-[#888] shadow-2xs">
                          {completedTasks.length}
                        </span>
                      </div>

                      <div className="space-y-2.5 min-h-[180px]">
                        {completedTasks.length === 0 ? (
                          <div className="border border-dashed border-slate-200 dark:border-[#262626] rounded-xl p-5 text-center text-slate-400 text-xs">
                            <Check className="w-4 h-4 mx-auto text-slate-300 dark:text-[#444] mb-1" />
                            <p>Belum ada tugas selesai</p>
                          </div>
                        ) : (
                          completedTasks.map((task) => (
                            <div
                              key={task.id}
                              role="button"
                              tabIndex={0}
                              className="bg-white dark:bg-[#181818] p-3.5 rounded-xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-2.5 opacity-75 hover:opacity-100 transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#141414]"
                              onClick={() => setActiveDetailTask(task)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setActiveDetailTask(task);
                                }
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs text-slate-600 dark:text-[#a3a3a3] truncate max-w-[140px]">
                                  {task.courseName}
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
                                  title="Batal Selesai"
                                  aria-label={`Tandai "${task.title}" belum selesai`}
                                >
                                  <span className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center transition focus-visible:ring-1 focus-visible:ring-emerald-400">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                </button>
                              </div>
                              <h4 className="text-xs font-semibold text-slate-500 dark:text-[#888] line-through line-clamp-2 leading-relaxed">
                                {truncateWords(task.title, 12)}
                              </h4>
                              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-[#242424] text-slate-500 dark:text-[#a3a3a3]">
                                <div>Selesai</div>
                                <span className="text-xs font-medium">Buka Detail →</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── MODE 3: COMPACT TABLE VIEW ──────────────────── */}
            {viewMode === "table" && (
              <div className="bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 dark:border-[#262626] bg-slate-50/70 dark:bg-[#181818] text-slate-500 dark:text-[#888] font-semibold">
                        <th className="py-3 px-4 w-10">Status</th>
                        <th className="py-3 px-4">Judul Tugas</th>
                        <th className="py-3 px-4">Mata Kuliah</th>
                        <th className="py-3 px-4">Batas Waktu</th>
                        <th className="py-3 px-4">Poin</th>
                        <th className="py-3 px-4">AI Materi</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#222]">
                      {filteredTasks.map((task) => (
                        <tr
                          key={task.id}
                          onClick={() => setActiveDetailTask(task)}
                          className="hover:bg-slate-50/80 dark:hover:bg-[#1c1c1c] transition-colors cursor-pointer"
                        >
                          <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleComplete(task.id)}
                              className={`w-5 h-5 rounded-md flex items-center justify-center transition cursor-pointer ${task.isCompleted
                                  ? "bg-emerald-500 text-white"
                                  : "border border-slate-300 dark:border-[#444] hover:border-indigo-500"
                                }`}
                            >
                              {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-[#f3f3f3]">
                            <span className={task.isCompleted ? "text-slate-500 dark:text-[#888]" : ""}>
                              {truncateWords(task.title, 12)}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-[#a0a0a0]">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#222] text-xs font-medium">
                              {task.courseName || "Umum"}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            {renderDueBadge(task)}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-[#a0a0a0]">
                            {task.points !== undefined ? `${task.points} Pts` : "-"}
                          </td>
                          <td className="py-2.5 px-4">
                            {task.aiAnalysis ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                                <Sparkles className="w-3 h-3" />
                                <span>Siap</span>
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnalyzeWithAI(task.id);
                                }}
                                className="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                              >
                                + Analisis
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
                                Tanya AI
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveDetailTask(task)}
                                className="h-6.5 px-2.5 text-xs rounded-lg border-slate-200 dark:border-[#2b2b2b]"
                              >
                                Detail
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal Task Detail */}
        {activeDetailTask && (
          <TaskDetailModal
            task={activeDetailTask}
            isOpen={Boolean(activeDetailTask)}
            onClose={() => setActiveDetailTask(null)}
            onToggleComplete={handleToggleComplete}
            onToggleChecklistItem={handleToggleChecklistItem}
            onSaveNotes={handleSaveNotes}
            onAnalyzeWithAI={handleAnalyzeWithAI}
            onOpenChat={(taskId) => router.push(`/chat?taskId=${taskId}`)}
          />
        )}
      </div>
    </Shell>
  );
}
