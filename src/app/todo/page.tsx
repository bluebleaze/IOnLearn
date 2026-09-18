"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ListTodo,
  Plus,
  CheckCircle2,
  Circle,
  Sparkles,
  Calendar,
  Tag,
  Trash2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Clock,
  BookOpen,
  Loader2,
  Check,
  Flame,
  ArrowRight,
  Coffee,
  Search,
  X,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { PersonalTodo, TodoSubtask, TodoTask } from "@/types";
import {
  loadTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  loadTasks,
  loadAIConfig,
  loadPreferences,
} from "@/lib/taskStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import confetti from "canvas-confetti";

export default function TodoPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<PersonalTodo[]>([]);
  const [classroomTasks, setClassroomTasks] = useState<TodoTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter State
  const [filterTab, setFilterTab] = useState<"all" | "active" | "completed" | "high">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Subtasks expanded map
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  // Classroom AI Breakdown Modal
  const [showClassroomModal, setShowClassroomModal] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const [isGeneratingBreakdown, setIsGeneratingBreakdown] = useState(false);

  useEffect(() => {
    setTodos(loadTodos());
    setClassroomTasks(loadTasks());
    setIsLoaded(true);

    const handleStorage = () => {
      setTodos(loadTodos());
      setClassroomTasks(loadTasks());
    };
    window.addEventListener("taskStoreChange", handleStorage);
    return () => window.removeEventListener("taskStoreChange", handleStorage);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddQuickTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const now = new Date().toISOString();
    const item: PersonalTodo = {
      id: `todo-${Date.now()}`,
      title: newTitle.trim(),
      isCompleted: false,
      priority: newPriority,
      dueDate: newDueDate || undefined,
      category: newSubject.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    addTodo(item);
    setTodos(loadTodos());
    setNewTitle("");
    setNewDueDate("");
    setNewSubject("");
    setShowAddForm(false);
    toast.success("To-Do Ditambahkan", { description: item.title });
  };

  const handleToggleTodo = (todoId: string) => {
    const res = toggleTodoComplete(todoId);
    setTodos(loadTodos());
    if (res.nowCompleted) {
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.8 },
          colors: ["#6366f1", "#10b981", "#f59e0b"],
        });
      } catch {}
      toast.success("Selesai!", { description: res.title });
    }
  };

  const handleToggleSubtask = (todoId: string, subtaskId: string) => {
    const target = todos.find((t) => t.id === todoId);
    if (!target || !target.subtasks) return;

    const newSubtasks = target.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );

    const allCompleted = newSubtasks.every((st) => st.isCompleted);

    updateTodo(todoId, {
      subtasks: newSubtasks,
      isCompleted: allCompleted ? true : target.isCompleted,
    });
    setTodos(loadTodos());
  };

  const handleDeleteTodo = (todoId: string) => {
    deleteTodo(todoId);
    setTodos(loadTodos());
    toast.info("To-Do Dihapus");
  };

  const handleGenerateClassroomBreakdown = async () => {
    const target = classroomTasks.find((t) => t.id === selectedClassroomId);
    if (!target) return;

    setIsGeneratingBreakdown(true);
    try {
      const res = await fetch("/api/ai/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "breakdown_task",
          payload: target,
          task: target,
          preferences: loadPreferences(),
          aiConfig: loadAIConfig(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal memproses AI breakdown");
      }

      const { data } = await res.json();
      const now = new Date().toISOString();
      const newTodo: PersonalTodo = {
        id: `todo-${Date.now()}`,
        title: data.title || target.title,
        description: data.description || `Pecahan tugas Classroom: ${target.title}`,
        isCompleted: false,
        priority: target.priority || "high",
        dueDate: target.dueDateStr,
        courseName: target.courseName,
        courseWorkId: target.courseWorkId || target.id,
        category: target.courseName || "Kuliah",
        subtasks: data.subtasks || [],
        createdAt: now,
        updatedAt: now,
      };

      addTodo(newTodo);
      setTodos(loadTodos());
      setShowClassroomModal(false);
      setSelectedClassroomId("");
      setExpandedMap((prev) => ({ ...prev, [newTodo.id]: true }));

      toast.success("To-Do dari Classroom Berhasil Dibuat!", {
        description: `Tugas "${target.title}" telah dipecah menjadi ${newTodo.subtasks?.length || 0} sub-langkah.`,
      });
    } catch (err: any) {
      toast.error("Gagal Mengimpor Tugas", {
        description: err.message || "Periksa konfigurasi AI Anda.",
      });
    } finally {
      setIsGeneratingBreakdown(false);
    }
  };

  // Stats
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.isCompleted).length;
  const activeCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered List
  const filteredTodos = useMemo(() => {
    return todos.filter((t) => {
      if (filterTab === "active" && t.isCompleted) return false;
      if (filterTab === "completed" && !t.isCompleted) return false;
      if (filterTab === "high" && t.priority !== "high") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = t.title.toLowerCase().includes(q);
        const mCategory = t.category?.toLowerCase().includes(q);
        const mCourse = t.courseName?.toLowerCase().includes(q);
        const mDesc = t.description?.toLowerCase().includes(q);
        const mSubtasks = t.subtasks?.some((st) => st.title.toLowerCase().includes(q));
        if (!mTitle && !mCategory && !mCourse && !mDesc && !mSubtasks) return false;
      }
      return true;
    });
  }, [todos, filterTab, searchQuery]);

  return (
    <Shell>
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-lexend)] tracking-tight text-slate-900 dark:text-[#f3f3f3]">
              To-Do List
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#a3a3a3] mt-1">
              Catat rencana harian, target belajar, atau pecah tugas kuliah dengan bantuan AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClassroomModal(true)}
              className="gap-2 rounded-xl text-xs font-medium border-slate-200 dark:border-[#2b2b2b] bg-white dark:bg-[#181818] hover:bg-slate-100 dark:hover:bg-[#222] text-slate-800 dark:text-[#f3f3f3] shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Impor Classroom (AI)</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="gap-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah To-Do</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar Card (Quiet, Balanced) */}
        <div className="bg-white dark:bg-[#161616] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#262626] shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 dark:text-[#d4d4d4] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Progress Harian
            </span>
            <span className="text-slate-500 dark:text-[#8e8e8e]">
              {completedCount} dari {totalCount} terselesaikan ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-[#202020] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Modal: Tambah To-Do Form (Centered with Deep Backdrop Blur & Radix Portal) */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent
            hideCloseButton
            className="w-[calc(100%-1.5rem)] sm:w-full max-w-lg p-5 sm:p-6 space-y-4 rounded-2xl bg-white dark:bg-[#171717] border border-slate-100 dark:border-[#262626] shadow-2xl"
          >
            <DialogTitle className="sr-only">Tambah Rencana / Target Baru</DialogTitle>
            <DialogDescription className="sr-only">Catat target belajar atau tugas harianmu.</DialogDescription>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ListTodo className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#f3f3f3]">
                    Tambah Rencana / Target Baru
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#888]">
                    Catat target belajar atau tugas harianmu.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-[#ccc] hover:bg-slate-100 dark:hover:bg-[#222] transition cursor-pointer"
              >
                <span className="sr-only">Tutup</span>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuickTodo} className="space-y-3.5">
              <div>
                <label htmlFor="todo-title-input" className="text-xs font-semibold text-slate-700 dark:text-[#ccc] block mb-1">
                  Judul To-Do
                </label>
                <input
                  id="todo-title-input"
                  type="text"
                  placeholder="Apa yang ingin kamu selesaikan? (Contoh: Selesaikan bab 3 kalkulus)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-900 dark:text-[#f3f3f3] placeholder:text-slate-400 dark:placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label htmlFor="todo-priority-select" className="text-xs font-medium text-slate-600 dark:text-[#a3a3a3] block mb-1">
                    Prioritas
                  </label>
                  <select
                    id="todo-priority-select"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-800 dark:text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="high">Tinggi (Penting & Mendesak)</option>
                    <option value="medium">Sedang (Standar)</option>
                    <option value="low">Rendah (Fleksibel)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="todo-due-date-input" className="text-xs font-medium text-slate-600 dark:text-[#a3a3a3] block mb-1">
                    Batas Waktu (Opsional)
                  </label>
                  <input
                    id="todo-due-date-input"
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-800 dark:text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label htmlFor="todo-category-input" className="text-xs font-medium text-slate-600 dark:text-[#a3a3a3] block mb-1">
                    Kategori / Matkul
                  </label>
                  <input
                    id="todo-category-input"
                    type="text"
                    placeholder="e.g. Algoritma"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-800 dark:text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400 dark:placeholder:text-[#666]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#262626]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-600 dark:text-[#888] rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-2xs"
                >
                  Simpan To-Do
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Filters & Tabs (Clean, Quieter Segmented Design) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-[#181818] p-1 rounded-xl border border-slate-200/70 dark:border-[#262626] text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterTab("all")}
              className={`min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === "all"
                  ? "bg-white dark:bg-[#262626] text-slate-900 dark:text-[#f3f3f3] shadow-xs font-semibold"
                  : "text-slate-500 dark:text-[#888] hover:text-slate-800 dark:hover:text-[#eee]"
              }`}
            >
              <span>Semua</span>
              <span className="opacity-60 text-xs">({totalCount})</span>
            </button>

            <button
              onClick={() => setFilterTab("active")}
              className={`min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === "active"
                  ? "bg-white dark:bg-[#262626] text-slate-900 dark:text-[#f3f3f3] shadow-xs font-semibold"
                  : "text-slate-500 dark:text-[#888] hover:text-slate-800 dark:hover:text-[#eee]"
              }`}
            >
              <span>Belum Selesai</span>
              <span className="opacity-60 text-xs">({activeCount})</span>
            </button>

            <button
              onClick={() => setFilterTab("completed")}
              className={`min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === "completed"
                  ? "bg-white dark:bg-[#262626] text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                  : "text-slate-500 dark:text-[#888] hover:text-slate-800 dark:hover:text-[#eee]"
              }`}
            >
              <span>Selesai</span>
              <span className="opacity-60 text-xs">({completedCount})</span>
            </button>

            <button
              onClick={() => setFilterTab("high")}
              className={`min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                filterTab === "high"
                  ? "bg-white dark:bg-[#262626] text-rose-600 dark:text-rose-400 shadow-xs font-semibold"
                  : "text-slate-500 dark:text-[#888] hover:text-slate-800 dark:hover:text-[#eee]"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Prioritas Tinggi</span>
            </button>
          </div>

          <div className="relative w-full sm:w-60 group">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400" />
            <input
              type="text"
              placeholder="Cari to-do..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-8 py-1.5 text-xs rounded-xl bg-slate-100/90 hover:bg-slate-100 dark:bg-[#181818] dark:hover:bg-[#1c1c1c] border border-slate-200/80 dark:border-[#262626] text-slate-900 dark:text-[#f3f3f3] placeholder:text-slate-400 dark:placeholder:text-[#666] focus:outline-none focus:bg-white dark:focus:bg-[#1e1e1e] focus:border-indigo-500/50 dark:focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-[#ccc] rounded-md transition cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* To-Do Items List */}
        {filteredTodos.length === 0 ? (
          searchQuery.trim() ? (
            /* Search Empty State */
            <div className="text-center py-14 px-4 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-[#202020] flex items-center justify-center text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-[#f3f3f3]">
                Tidak Ada To-Do Ditemukan
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#888] max-w-sm mx-auto">
                Tidak ada rencana to-do atau sub-langkah yang cocok dengan kata kunci &quot;<span className="font-semibold text-slate-800 dark:text-slate-200">{searchQuery}</span>&quot;.
              </p>
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="min-h-[40px] sm:min-h-0 text-xs rounded-xl cursor-pointer"
                >
                  Reset Pencarian
                </Button>
              </div>
            </div>
          ) : filterTab === "active" && totalCount > 0 && activeCount === 0 ? (
            /* Celebratory Empty State */
            <div className="text-center py-16 px-6 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
                <Coffee className="w-8 h-8 stroke-[1.8]" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#f3f3f3] font-heading">
                  Luar biasa! Semua rencana to-do selesai 🎉
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-[#888] leading-relaxed">
                  Kamu telah menyelesaikan seluruh target harian. Waktunya istirahat atau buat rencana baru untuk besok!
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterTab("all")}
                  className="min-h-[44px] sm:min-h-0 text-xs rounded-xl"
                >
                  Lihat Semua To-Do ({totalCount})
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  className="min-h-[44px] sm:min-h-0 text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-[#f0f0f0] dark:hover:bg-white text-white dark:text-slate-900 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Tambah Rencana Baru
                </Button>
              </div>
            </div>
          ) : (
            /* Generic Empty State */
            <div className="text-center py-16 px-4 bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-[#202020] flex items-center justify-center text-slate-400">
                <ListTodo className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-[#f3f3f3]">
                Belum Ada To-Do
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#888] mt-1 max-w-sm mx-auto">
                Mulai buat to-do harianmu sendiri atau impor tugas dari Google Classroom untuk dipecah secara otomatis oleh AI.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  className="min-h-[44px] sm:min-h-0 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Tambah To-Do
                </Button>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {filteredTodos.map((item) => {
              const hasSubtasks = item.subtasks && item.subtasks.length > 0;
              const completedSubtasks = item.subtasks?.filter((s) => s.isCompleted).length || 0;
              const isExpanded = Boolean(expandedMap[item.id]);

              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-[#161616] rounded-2xl p-4 sm:p-5 transition-colors border border-slate-200/80 dark:border-[#262626] shadow-2xs ${
                    item.isCompleted ? "opacity-60 bg-slate-50/70 dark:bg-[#121212]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleTodo(item.id)}
                      className="min-w-[44px] min-h-[44px] -m-2.5 flex items-center justify-center cursor-pointer shrink-0 focus-visible:outline-none"
                      title={item.isCompleted ? "Tandai belum selesai" : "Tandai selesai"}
                      aria-label={item.isCompleted ? `Tandai "${item.title}" belum selesai` : `Tandai "${item.title}" selesai`}
                    >
                      <span
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          item.isCompleted
                            ? "bg-emerald-500 text-white"
                            : "border-2 border-slate-300 dark:border-[#383838] hover:border-indigo-500"
                        }`}
                      >
                        {item.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            item.isCompleted
                              ? "line-through text-slate-400 dark:text-[#666]"
                              : "text-slate-900 dark:text-[#f3f3f3]"
                          }`}
                        >
                          {item.title}
                        </span>

                        {/* Priority Badge */}
                        {item.priority === "high" && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                            Penting
                          </span>
                        )}
                        {item.priority === "medium" && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                            Sedang
                          </span>
                        )}

                        {/* Category / Course Tag */}
                        {(item.category || item.courseName) && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-[#222] text-slate-600 dark:text-[#8e8e8e]">
                            {item.category || item.courseName}
                          </span>
                        )}

                        {/* Due Date */}
                        {item.dueDate && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-[#888]">
                            <Clock className="w-3 h-3" />
                            {item.dueDate}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-500 dark:text-[#888] mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* Subtasks Progress / Trigger */}
                      {hasSubtasks && (
                        <div className="mt-2.5">
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id)}
                            className="inline-flex items-center gap-1.5 min-h-[36px] sm:min-h-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            aria-expanded={isExpanded}
                            aria-label={`${isExpanded ? "Tutup" : "Buka"} sub-langkah ${item.title}`}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                            <span>
                              Sub-langkah ({completedSubtasks}/{item.subtasks?.length})
                            </span>
                          </button>

                          {/* Subtasks List */}
                          {isExpanded && (
                            <div className="mt-2 pl-2 space-y-1.5 border-l-2 border-slate-100 dark:border-[#222]">
                              {item.subtasks?.map((subtask) => (
                                <div
                                  key={subtask.id}
                                  className="flex items-start gap-2 text-xs py-0.5"
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSubtask(item.id, subtask.id)}
                                    className="min-w-[44px] min-h-[44px] -my-2.5 -ml-2.5 flex items-center justify-center cursor-pointer shrink-0 focus-visible:outline-none"
                                    title={subtask.isCompleted ? "Tandai subtask belum selesai" : "Tandai subtask selesai"}
                                    aria-label={subtask.isCompleted ? `Tandai subtask "${subtask.title}" belum selesai` : `Tandai subtask "${subtask.title}" selesai`}
                                  >
                                    <span
                                      className={`w-4 h-4 rounded flex items-center justify-center transition-all focus-visible:ring-1 focus-visible:ring-emerald-500 ${
                                        subtask.isCompleted
                                          ? "bg-emerald-500 text-white"
                                          : "border border-slate-300 dark:border-[#444]"
                                      }`}
                                    >
                                      {subtask.isCompleted && (
                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                      )}
                                    </span>
                                  </button>
                                  <span
                                    className={
                                      subtask.isCompleted
                                        ? "line-through text-slate-400 dark:text-[#666]"
                                        : "text-slate-700 dark:text-[#ccc]"
                                    }
                                  >
                                    {subtask.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDeleteTodo(item.id)}
                        className="min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 dark:text-[#737373] dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        title="Hapus To-Do"
                        aria-label={`Hapus to-do "${item.title}"`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Classroom Task Breakdown to To-Do with AI */}
        <Dialog open={showClassroomModal} onOpenChange={setShowClassroomModal}>
          <DialogContent
            hideCloseButton
            className="w-[calc(100%-1.5rem)] sm:w-full max-w-lg p-5 space-y-4 rounded-2xl bg-white dark:bg-[#171717] border border-slate-100 dark:border-[#262626] shadow-2xl"
          >
            <DialogTitle className="sr-only">Impor & Pecah Tugas Classroom</DialogTitle>
            <DialogDescription className="sr-only">Pilih tugas kuliah dan AI akan memecahnya menjadi langkah kerja harian.</DialogDescription>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#f3f3f3]">
                    Impor & Pecah Tugas Classroom
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#888]">
                    Pilih tugas kuliah dan AI akan memecahnya menjadi langkah kerja harian.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowClassroomModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-[#ccc] hover:bg-slate-100 dark:hover:bg-[#222] transition cursor-pointer"
              >
                <span className="sr-only">Tutup</span>
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-[#ccc] block">
                Pilih Tugas dari Classroom:
              </label>
              {classroomTasks.filter((t) => !t.isCompleted).length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-[#888] italic py-2">
                  Tidak ada tugas pending di Classroom.
                </p>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {classroomTasks
                    .filter((t) => !t.isCompleted)
                    .map((task) => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedClassroomId(task.id)}
                        className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                          selectedClassroomId === task.id
                            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 font-medium"
                            : "border-slate-100 dark:border-[#222] bg-slate-50 dark:bg-[#1a1a1a] hover:bg-slate-100 dark:hover:bg-[#202020]"
                        }`}
                      >
                        <div className="font-semibold text-slate-900 dark:text-[#f3f3f3]">
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#888] mt-1">
                          {task.courseName && <span>{task.courseName}</span>}
                          {task.dueDateStr && <span>• {task.dueDateStr}</span>}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#222]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClassroomModal(false)}
                disabled={isGeneratingBreakdown}
                className="text-xs text-slate-600 dark:text-[#888] rounded-xl"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateClassroomBreakdown}
                disabled={!selectedClassroomId || isGeneratingBreakdown}
                className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-2xs"
              >
                {isGeneratingBreakdown ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sedang Menganalisis...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Pecah dengan AI</span>
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
