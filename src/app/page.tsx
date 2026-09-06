"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  ListTodo,
  NotebookPen,
  MessageSquareText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Plus,
  RefreshCw,
  Check,
  ChevronRight,
} from "lucide-react";
import { Shell, useShell } from "../components/Shell";
import { ActivityChart } from "../components/ActivityChart";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { TodoTask, PersonalTodo, StudyNote } from "../types";
import { ClassroomService } from "../services/classroomService";
import { DBService } from "../services/dbService";
import {
  loadTasks,
  loadTodos,
  loadNotes,
  toggleTaskComplete,
  toggleTodoComplete,
  syncAllUserDataToCloud,
} from "../lib/taskStore";
import confetti from "canvas-confetti";

export default function HomeHighlightPage() {
  return (
    <Shell>
      <HomeContent />
    </Shell>
  );
}

function HomeContent() {
  const router = useRouter();
  const { userProfile, isSyncing, syncClassroom } = useShell();

  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [todos, setTodos] = useState<PersonalTodo[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTasks(loadTasks());
    setTodos(loadTodos());
    setNotes(loadNotes());
    setIsLoaded(true);

    const handleStorage = () => {
      setTasks(loadTasks());
      setTodos(loadTodos());
      setNotes(loadNotes());
    };
    window.addEventListener("taskStoreChange", handleStorage);
    return () => window.removeEventListener("taskStoreChange", handleStorage);
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.isCompleted);
    const urgentTasks = activeTasks.filter((t) => {
      if (!t.dueTimestamp) return false;
      const hoursLeft = (t.dueTimestamp - Date.now()) / (1000 * 3600);
      return hoursLeft > 0 && hoursLeft <= 48;
    });

    const activeTodos = todos.filter((t) => !t.isCompleted);
    const completedTodos = todos.filter((t) => t.isCompleted);
    const todoProgress =
      todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0;

    const notesWithAI = notes.filter((n) => Boolean(n.summary)).length;

    return {
      activeTasksCount: activeTasks.length,
      urgentTasksCount: urgentTasks.length,
      activeTodosCount: activeTodos.length,
      completedTodosCount: completedTodos.length,
      todoProgress,
      notesCount: notes.length,
      notesWithAICount: notesWithAI,
    };
  }, [tasks, todos, notes]);

  // Urgent tasks list (< 72h or priority high)
  const urgentTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.isCompleted)
      .sort((a, b) => (a.dueTimestamp || Infinity) - (b.dueTimestamp || Infinity))
      .slice(0, 4);
  }, [tasks]);

  // Today's To-Dos
  const todayTodos = useMemo(() => {
    return todos.slice(0, 5);
  }, [todos]);

  // Recent notes
  const recentNotes = useMemo(() => {
    return notes.slice(0, 3);
  }, [notes]);

  const handleToggleTask = (taskId: string) => {
    const res = toggleTaskComplete(taskId);
    setTasks(loadTasks());
    if (res.nowCompleted) {
      try {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
      } catch {}
      toast.success("Tugas Diselesaikan!", { description: res.title });
    }
  };

  const handleToggleTodo = (todoId: string) => {
    const res = toggleTodoComplete(todoId);
    setTodos(loadTodos());
    if (res.nowCompleted) {
      try {
        confetti({ particleCount: 25, spread: 40, origin: { y: 0.8 } });
      } catch {}
      toast.success("To-Do Selesai!", { description: res.title });
    }
  };

  const quickPrompts = [
    "Jelaskan konsep kunci dari tugas terdekat saya",
    "Bantu saya membuat rencana belajar untuk ujian minggu ini",
    "Bagaimana cara membagi waktu antara tugas kuliah dan proyek pribadi?",
  ];

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Refined Calm Overview Header */}
        <div className="rounded-2xl bg-white dark:bg-[#161616] p-6 sm:p-7 border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-[#888]">
                <span>Ikhtisar Belajar</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f3f3f3] font-heading">
                Selamat datang kembali, {userProfile?.name?.split(" ")[0] || "Pelajar"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#999] leading-relaxed">
                Terdapat <span className="font-semibold text-slate-900 dark:text-[#f0f0f0]">{stats.activeTasksCount} tugas aktif</span>
                {stats.urgentTasksCount > 0 && (
                  <>
                    , dengan <span className="font-semibold text-rose-600 dark:text-rose-400">{stats.urgentTasksCount} tenggat mendekat</span>
                  </>
                )}
                , serta <span className="font-semibold text-slate-900 dark:text-[#f0f0f0]">{stats.activeTodosCount} to-do tersisa</span> hari ini.
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                onClick={() => router.push("/tasks")}
                variant="outline"
                className="h-9 px-3.5 text-xs font-medium rounded-xl border-slate-200 dark:border-[#2b2b2b] hover:bg-slate-100 dark:hover:bg-[#202020] text-slate-800 dark:text-[#e0e0e0] gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-[#888]" />
                <span>Semua Tugas</span>
              </Button>

              <Button
                onClick={() => router.push("/chat")}
                className="h-9 px-3.5 text-xs font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-[#818cf8] dark:hover:bg-[#9ba3fa] text-white dark:text-[#0c0c0c] gap-1.5 shadow-2xs cursor-pointer"
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>Tanya AI</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Key Highlight Metrics (Quiet, Balanced) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Tugas Classroom */}
          <div
            onClick={() => router.push("/tasks")}
            className="bg-white dark:bg-[#161616] p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-200/80 dark:border-[#262626] cursor-pointer hover:border-slate-300 dark:hover:border-[#3a3a3a] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-[#d0d0d0] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f3f3f3] font-heading">
                {stats.activeTasksCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-[#888] mt-0.5">
                Tugas Classroom Aktif
              </div>
            </div>
            {stats.urgentTasksCount > 0 ? (
              <div className="mt-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{stats.urgentTasksCount} mendesak</span>
              </div>
            ) : (
              <div className="mt-2.5 text-xs text-slate-400 dark:text-[#666]">
                Tenggat aman
              </div>
            )}
          </div>

          {/* Card 2: To-Do List */}
          <div
            onClick={() => router.push("/todo")}
            className="bg-white dark:bg-[#161616] p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-200/80 dark:border-[#262626] cursor-pointer hover:border-slate-300 dark:hover:border-[#3a3a3a] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-[#d0d0d0] flex items-center justify-center">
                <ListTodo className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f3f3f3] font-heading">
                {stats.activeTodosCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-[#888] mt-0.5">
                To-Do Belum Selesai
              </div>
            </div>
            <div className="mt-2.5 text-xs text-slate-500 dark:text-[#888]">
              Selesai <span className="font-semibold text-slate-800 dark:text-[#ddd]">{stats.todoProgress}%</span>
            </div>
          </div>

          {/* Card 3: Catatan Materi */}
          <div
            onClick={() => router.push("/notes")}
            className="bg-white dark:bg-[#161616] p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-200/80 dark:border-[#262626] cursor-pointer hover:border-slate-300 dark:hover:border-[#3a3a3a] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-[#d0d0d0] flex items-center justify-center">
                <NotebookPen className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f3f3f3] font-heading">
                {stats.notesCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-[#888] mt-0.5">
                Catatan Materi
              </div>
            </div>
            <div className="mt-2.5 text-xs text-slate-500 dark:text-[#888] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>{stats.notesWithAICount} dirangkum AI</span>
            </div>
          </div>

          {/* Card 4: Tanya AI Hub */}
          <div
            onClick={() => router.push("/chat")}
            className="bg-white dark:bg-[#161616] p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-200/80 dark:border-[#262626] cursor-pointer hover:border-slate-300 dark:hover:border-[#3a3a3a] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-[#d0d0d0] flex items-center justify-center">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f3f3f3] font-heading">
                AI Tutor
              </div>
              <div className="text-xs text-slate-500 dark:text-[#888] mt-0.5">
                Bantuan Belajar Aktif
              </div>
            </div>
            <div className="mt-2.5 text-xs text-slate-500 dark:text-[#888]">
              Diskusi & Analisis Tugas
            </div>
          </div>
        </div>

        {/* Main Content Dual Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Urgent Deadlines & Today's To-Do */}
          <div className="lg:col-span-7 space-y-6">
            {/* Urgent Deadlines Snapshot */}
            <div className="bg-white dark:bg-[#161616] rounded-2xl p-5 sm:p-6 shadow-2xs border border-slate-200/80 dark:border-[#262626] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-[#d0d0d0] flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f3f3f3]">
                    Tugas Tenggat Terdekat
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/tasks")}
                  className="text-xs text-slate-600 dark:text-[#a0a0a0] hover:text-slate-900 dark:hover:text-[#f0f0f0] gap-1 cursor-pointer"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>

              {urgentTasks.length === 0 ? (
                <div className="text-center py-7 px-4 rounded-xl bg-slate-50/50 dark:bg-[#181818]/50 border border-dashed border-slate-200 dark:border-[#262626] text-xs text-slate-500 dark:text-[#888] space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Tidak ada tenggat mendesak</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-[#666]">Semua tugas kuliah saat ini terkendali dengan baik 🎉</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {urgentTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => router.push(`/tugas/${t.id}`)}
                      className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#181818] hover:bg-slate-100/80 dark:hover:bg-[#202020] border border-slate-100 dark:border-[#242424] transition-colors cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTask(t.id);
                          }}
                          className="w-5 h-5 rounded-md border border-slate-300 dark:border-[#444] hover:border-indigo-500 flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          {t.isCompleted && <Check className="w-3 h-3 text-emerald-500" />}
                        </button>
                        <div className="min-w-0">
                          <h4 className="text-xs font-medium text-slate-900 dark:text-[#f3f3f3] truncate">
                            {t.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#888] mt-0.5">
                            {t.courseName && <span>{t.courseName}</span>}
                            {t.dueDateStr && <span>• {t.dueDateStr}</span>}
                          </div>
                        </div>
                      </div>

                      {t.aiAnalysis && (
                        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#222] text-slate-600 dark:text-[#aaa] flex items-center gap-1 border border-slate-200/60 dark:border-[#2c2c2c]">
                          <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                          <span>AI Siap</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Today's To-Do List Snapshot */}
            <div className="bg-white dark:bg-[#161616] rounded-2xl p-5 sm:p-6 shadow-2xs border border-slate-200/80 dark:border-[#262626] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-[#d0d0d0] flex items-center justify-center">
                    <ListTodo className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f3f3f3]">
                    To-Do Harian
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/todo")}
                  className="text-xs text-slate-600 dark:text-[#a0a0a0] hover:text-slate-900 dark:hover:text-[#f0f0f0] gap-1 cursor-pointer"
                >
                  <span>Buka To-Do</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>

              {todayTodos.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 dark:text-[#888] space-y-2">
                  <p>Belum ada rencana To-Do hari ini.</p>
                  <Button
                    size="sm"
                    onClick={() => router.push("/todo")}
                    className="text-xs bg-slate-900 hover:bg-slate-800 dark:bg-[#f0f0f0] dark:hover:bg-white text-white dark:text-slate-900 rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Tambah To-Do
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`p-2.5 rounded-xl bg-slate-50/70 dark:bg-[#181818] border border-slate-100 dark:border-[#242424] flex items-center justify-between gap-3 ${
                        todo.isCompleted ? "opacity-50 line-through" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => handleToggleTodo(todo.id)}
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                            todo.isCompleted
                              ? "bg-emerald-500 text-white"
                              : "border border-slate-300 dark:border-[#444]"
                          }`}
                        >
                          {todo.isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </button>
                        <span className="text-xs font-medium text-slate-800 dark:text-[#e0e0e0] truncate">
                          {todo.title}
                        </span>
                      </div>

                      {todo.priority === "high" && (
                        <span className="shrink-0 text-xs font-medium px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                          Penting
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Activity Chart & Recent Notes & AI Prompts */}
          <div className="lg:col-span-5 space-y-6">
            {/* Weekly Activity Chart */}
            <div className="bg-white dark:bg-[#161616] rounded-2xl p-5 sm:p-6 shadow-2xs border border-slate-200/80 dark:border-[#262626]">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-slate-500 dark:text-[#888]" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f3f3f3]">
                  Aktivitas Belajar Mingguan
                </h3>
              </div>
              <ActivityChart tasks={tasks} />
            </div>

            {/* Recent Notes Preview */}
            <div className="bg-white dark:bg-[#161616] rounded-2xl p-5 sm:p-6 shadow-2xs border border-slate-200/80 dark:border-[#262626] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <NotebookPen className="w-4 h-4 text-slate-500 dark:text-[#888]" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f3f3f3]">
                    Catatan Materi Terkini
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/notes")}
                  className="text-xs text-slate-600 dark:text-[#a0a0a0] hover:text-slate-900 dark:hover:text-[#f0f0f0]"
                >
                  Buka Catatan
                </Button>
              </div>

              {recentNotes.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 dark:text-[#888]">
                  Belum ada catatan materi tersimpan.
                </div>
              ) : (
                <div className="space-y-2">
                  {recentNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => router.push(`/notes`)}
                      className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#181818] hover:bg-slate-100/80 dark:hover:bg-[#202020] border border-slate-100 dark:border-[#242424] transition-colors cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-900 dark:text-[#f3f3f3] line-clamp-1">
                          {note.title}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-[#666] shrink-0">
                          {note.subject || "Umum"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-[#888] line-clamp-1">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Prompts Launcher (Quiet, Calm) */}
            <div className="bg-white dark:bg-[#161616] rounded-2xl p-4.5 border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-[#d0d0d0]">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tanya AI Cepat:</span>
              </div>
              <div className="space-y-1.5">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(`/chat?prompt=${encodeURIComponent(prompt)}`)}
                    className="w-full text-left p-2.5 rounded-xl text-xs text-slate-700 dark:text-[#ccc] bg-slate-50/70 dark:bg-[#181818] hover:bg-slate-100 dark:hover:bg-[#222] border border-slate-100 dark:border-[#242424] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className="truncate">{prompt}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}