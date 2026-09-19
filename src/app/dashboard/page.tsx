"use client";

import { useState, useEffect, useMemo } from "react";
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
  Plus,
  RefreshCw,
  Check,
  ChevronRight,
} from "lucide-react";
import { Shell, useShell } from "@/components/Shell";
import { ActivityChart } from "@/components/ActivityChart";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { TodoTask, PersonalTodo, StudyNote, UserPreferences } from "@/types";
import {
  loadTasks,
  loadTodos,
  loadNotes,
  loadPreferences,
  toggleTaskComplete,
  toggleTodoComplete,
} from "@/lib/taskStore";
import confetti from "canvas-confetti";
import { TaskCompleteConfirmModal } from "@/components/TaskCompleteConfirmModal";
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardPage() {
  return (
    <Shell>
      <DashboardContent />
    </Shell>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { userProfile, isSyncing, syncClassroom } = useShell();
  const { isEn } = useLanguage();

  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [todos, setTodos] = useState<PersonalTodo[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [taskToConfirm, setTaskToConfirm] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    setTasks(loadTasks());
    setTodos(loadTodos());
    setNotes(loadNotes());
    setPrefs(loadPreferences());
    setIsLoaded(true);

    const handleStorage = () => {
      setTasks(loadTasks());
      setTodos(loadTodos());
      setNotes(loadNotes());
      setPrefs(loadPreferences());
    };
    window.addEventListener("taskStoreChange", handleStorage);
    window.addEventListener("language-changed", handleStorage);
    return () => {
      window.removeEventListener("taskStoreChange", handleStorage);
      window.removeEventListener("language-changed", handleStorage);
    };
  }, []);

  const t = useMemo(() => {
    if (isEn) {
      return {
        overviewEyebrow: "Study Overview",
        dateLocale: "en-US",
        welcome: "Welcome back",
        defaultStudentName: "Student",
        tasksSummary: (active: number, urgent: number, todosCount: number) => (
          <>
            You have <span className="font-semibold text-slate-900 dark:text-[#f0f0f0]">{active} active tasks</span>
            {urgent > 0 && (
              <>
                , with <span className="font-semibold text-rose-600 dark:text-rose-400">{urgent} approaching deadlines</span>
              </>
            )}
            , and <span className="font-semibold text-slate-900 dark:text-[#f0f0f0]">{todosCount} to-dos remaining</span> today.
          </>
        ),
        allTasksBtn: "All Tasks",
        askAIBtn: "Ask AI",

        // Metrics cards
        cardTasksTitle: "Active Classroom Tasks",
        cardTasksUrgent: (count: number) => `${count} urgent`,
        cardTasksSafe: "Deadlines safe",
        cardTodosTitle: "Pending To-Dos",
        cardTodosDone: (pct: number) => <>Completed <span className="font-semibold text-slate-800 dark:text-[#ddd]">{pct}%</span></>,
        cardNotesTitle: "Study Notes",
        cardNotesAI: (count: number) => `${count} AI summarized`,
        cardAITitle: "AI Tutor",
        cardAISubtitle: "Active Learning Assistant",
        cardAIDesc: "Assignment Discussion & Analysis",

        // Urgent Deadlines section
        urgentSectionTitle: "Upcoming Deadlines",
        viewAllBtn: "View All",
        noUrgentTitle: "No urgent deadlines",
        noUrgentDesc: "All your coursework is currently well on track 🎉",
        aiReadyBadge: "AI Ready",

        // Daily To-Dos section
        todosSectionTitle: "Daily To-Dos",
        openTodoBtn: "Open To-Do",
        noTodosTitle: "No to-do plans for today yet.",
        addTodoBtn: "Add To-Do",
        priorityHigh: "High",

        // Right column
        activityTitle: "Weekly Study Activity",
        notesSectionTitle: "Recent Study Notes",
        openNotesBtn: "Open Notes",
        noNotesDesc: "No study notes saved yet.",
        untitledNote: "Untitled",
        generalSubject: "General",
        quickAITitle: "Quick AI Prompts:",
        quickPrompts: [
          "Explain the core concepts of my nearest upcoming assignment",
          "Help me create a structured study plan for this week's exams",
          "How can I balance time between coursework and personal projects?",
        ],
        toastTaskCompleted: "Task Completed!",
        toastTodoCompleted: "To-Do Completed!",
      };
    }

    return {
      overviewEyebrow: "Ikhtisar Belajar",
      dateLocale: "id-ID",
      welcome: "Selamat datang kembali",
      defaultStudentName: "Pelajar",
      tasksSummary: (active: number, urgent: number, todosCount: number) => (
        <>
          Terdapat <span className="font-semibold text-slate-900 dark:text-[#f0f0f0]">{active} tugas aktif</span>
          {urgent > 0 && (
            <>
              , dengan <span className="font-semibold text-rose-600 dark:text-rose-400">{urgent} tenggat mendekat</span>
            </>
          )}
          , serta <span className="font-semibold text-slate-900 dark:text-[#f0f0f0]">{todosCount} to-do tersisa</span> hari ini.
        </>
      ),
      allTasksBtn: "Semua Tugas",
      askAIBtn: "Tanya AI",

      // Metrics cards
      cardTasksTitle: "Tugas Classroom Aktif",
      cardTasksUrgent: (count: number) => `${count} mendesak`,
      cardTasksSafe: "Tenggat aman",
      cardTodosTitle: "To-Do Belum Selesai",
      cardTodosDone: (pct: number) => <>Selesai <span className="font-semibold text-slate-800 dark:text-[#ddd]">{pct}%</span></>,
      cardNotesTitle: "Catatan Materi",
      cardNotesAI: (count: number) => `${count} dirangkum AI`,
      cardAITitle: "AI Tutor",
      cardAISubtitle: "Bantuan Belajar Aktif",
      cardAIDesc: "Diskusi & Analisis Tugas",

      // Urgent Deadlines section
      urgentSectionTitle: "Tugas Tenggat Terdekat",
      viewAllBtn: "Lihat Semua",
      noUrgentTitle: "Tidak ada tenggat mendesak",
      noUrgentDesc: "Semua tugas kuliah saat ini terkendali dengan baik 🎉",
      aiReadyBadge: "AI Siap",

      // Daily To-Dos section
      todosSectionTitle: "To-Do Harian",
      openTodoBtn: "Buka To-Do",
      noTodosTitle: "Belum ada rencana To-Do hari ini.",
      addTodoBtn: "Tambah To-Do",
      priorityHigh: "Penting",

      // Right column
      activityTitle: "Aktivitas Belajar Mingguan",
      notesSectionTitle: "Catatan Materi Terkini",
      openNotesBtn: "Buka Catatan",
      noNotesDesc: "Belum ada catatan materi tersimpan.",
      untitledNote: "Tanpa Judul",
      generalSubject: "Umum",
      quickAITitle: "Tanya AI Cepat:",
      quickPrompts: [
        "Jelaskan konsep kunci dari tugas terdekat saya",
        "Bantu saya membuat rencana belajar untuk ujian minggu ini",
        "Bagaimana cara membagi waktu antara tugas kuliah dan proyek pribadi?",
      ],
      toastTaskCompleted: "Tugas Diselesaikan!",
      toastTodoCompleted: "To-Do Selesai!",
    };
  }, [isEn]);

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
    const now = Date.now();
    return tasks
      .filter((t) => !t.isCompleted)
      .sort((a, b) => {
        const aHasDue = typeof a.dueTimestamp === "number" && !isNaN(a.dueTimestamp);
        const bHasDue = typeof b.dueTimestamp === "number" && !isNaN(b.dueTimestamp);

        if (aHasDue && bHasDue) {
          const aIsOverdue = (a.dueTimestamp as number) < now;
          const bIsOverdue = (b.dueTimestamp as number) < now;

          if (!aIsOverdue && !bIsOverdue) {
            return (a.dueTimestamp as number) - (b.dueTimestamp as number);
          }
          if (!aIsOverdue && bIsOverdue) return -1;
          if (aIsOverdue && !bIsOverdue) return 1;

          return (b.dueTimestamp as number) - (a.dueTimestamp as number);
        }
        if (aHasDue && !bHasDue) return -1;
        if (!aHasDue && bHasDue) return 1;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      })
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
      } catch { }
      toast.success(t.toastTaskCompleted, { description: res.title });
    }
  };

  const handleConfirmTaskComplete = () => {
    if (!taskToConfirm) return;
    handleToggleTask(taskToConfirm.id);
    setTaskToConfirm(null);
  };

  const handleToggleTodo = (todoId: string) => {
    const res = toggleTodoComplete(todoId);
    setTodos(loadTodos());
    if (res.nowCompleted) {
      try {
        confetti({ particleCount: 25, spread: 40, origin: { y: 0.8 } });
      } catch { }
      toast.success(t.toastTodoCompleted, { description: res.title });
    }
  };

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Refined Calm Overview Header */}
        <div className="rounded-2xl bg-white dark:bg-[#161616] p-6 sm:p-7 border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-[#888]">
                <span>{t.overviewEyebrow}</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString(t.dateLocale, { weekday: "long", day: "numeric", month: "long" })}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f3f3f3] font-heading">
                {t.welcome}, {userProfile?.name ? userProfile.name.split(" ").slice(0, 2).join(" ") : t.defaultStudentName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#999] leading-relaxed">
                {t.tasksSummary(stats.activeTasksCount, stats.urgentTasksCount, stats.activeTodosCount)}
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
                <span>{t.allTasksBtn}</span>
              </Button>

              <Button
                onClick={() => router.push("/chat")}
                className="h-9 px-3.5 text-xs font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-[#818cf8] dark:hover:bg-[#9ba3fa] text-white dark:text-[#0c0c0c] gap-1.5 shadow-2xs cursor-pointer"
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>{t.askAIBtn}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Key Highlight Metrics (Quiet, Balanced, Vibrant & High Contrast) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Tugas Classroom */}
          <div
            onClick={() => router.push("/tasks")}
            className="bg-white dark:bg-[#161616] p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-200/80 dark:border-[#262626] cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-transform group-hover:scale-105">
                <BookOpen className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f3f3f3] font-heading">
                {stats.activeTasksCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-[#888] mt-0.5">
                {t.cardTasksTitle}
              </div>
            </div>
            {stats.urgentTasksCount > 0 ? (
              <div className="mt-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{t.cardTasksUrgent(stats.urgentTasksCount)}</span>
              </div>
            ) : (
              <div className="mt-2.5 text-xs text-slate-400 dark:text-[#666]">
                {t.cardTasksSafe}
              </div>
            )}
          </div>

          {/* Card 2: To-Do List */}
          <div
            onClick={() => router.push("/todo")}
            className="bg-white dark:bg-[#161616] p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-200/80 dark:border-[#262626] cursor-pointer hover:border-amber-300 dark:hover:border-amber-500/40 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-transform group-hover:scale-105">
                <ListTodo className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f3f3f3] font-heading">
                {stats.activeTodosCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-[#888] mt-0.5">
                {t.cardTodosTitle}
              </div>
            </div>
            <div className="mt-2.5 text-xs text-slate-500 dark:text-[#888]">
              {t.cardTodosDone(stats.todoProgress)}
            </div>
          </div>

          {/* Card 3: Catatan Materi */}
          <div
            onClick={() => router.push("/notes")}
            className="bg-white dark:bg-[#161616] p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-200/80 dark:border-[#262626] cursor-pointer hover:border-purple-300 dark:hover:border-purple-500/40 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center transition-transform group-hover:scale-105">
                <NotebookPen className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f3f3f3] font-heading">
                {stats.notesCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-[#888] mt-0.5">
                {t.cardNotesTitle}
              </div>
            </div>
            <div className="mt-2.5 text-xs text-slate-500 dark:text-[#888] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>{t.cardNotesAI(stats.notesWithAICount)}</span>
            </div>
          </div>

          {/* Card 4: Tanya AI Hub */}
          <div
            onClick={() => router.push("/chat")}
            className="bg-white dark:bg-[#161616] p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-200/80 dark:border-[#262626] cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center transition-transform group-hover:scale-110">
                <img
                  src="/logos/ionlearn_mascot.svg"
                  alt="AI Tutor Mascot"
                  className="w-full h-full object-contain"
                />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f3f3f3] font-heading">
                {t.cardAITitle}
              </div>
              <div className="text-xs text-slate-500 dark:text-[#888] mt-0.5">
                {t.cardAISubtitle}
              </div>
            </div>
            <div className="mt-2.5 text-xs text-slate-500 dark:text-[#888]">
              {t.cardAIDesc}
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
                    {t.urgentSectionTitle}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/tasks")}
                  className="text-xs text-slate-600 dark:text-[#a0a0a0] hover:text-slate-900 dark:hover:text-[#f0f0f0] gap-1 cursor-pointer"
                >
                  <span>{t.viewAllBtn}</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>

              {urgentTasks.length === 0 ? (
                <div className="text-center py-7 px-4 rounded-xl bg-slate-50/50 dark:bg-[#181818]/50 border border-dashed border-slate-200 dark:border-[#262626] text-xs text-slate-500 dark:text-[#888] space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.noUrgentTitle}</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-[#666]">{t.noUrgentDesc}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {urgentTasks.map((tItem) => (
                    <div
                      key={tItem.id}
                      onClick={() => router.push(`/tugas/${tItem.id}`)}
                      className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#181818] hover:bg-slate-100/80 dark:hover:bg-[#202020] border border-slate-100 dark:border-[#242424] transition-colors cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!tItem.isCompleted) {
                              setTaskToConfirm({ id: tItem.id, title: tItem.title });
                            } else {
                              handleToggleTask(tItem.id);
                            }
                          }}
                          className="w-5 h-5 rounded-md border border-slate-300 dark:border-[#444] hover:border-indigo-500 flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          {tItem.isCompleted && <Check className="w-3 h-3 text-emerald-500" />}
                        </button>
                        <div className="min-w-0">
                          <h4 className="text-xs font-medium text-slate-900 dark:text-[#f3f3f3] truncate">
                            {tItem.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#888] mt-0.5">
                            {tItem.courseName && <span>{tItem.courseName}</span>}
                            {tItem.dueDateStr && <span>• {tItem.dueDateStr}</span>}
                          </div>
                        </div>
                      </div>

                      {tItem.aiAnalysis && (
                        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#222] text-slate-600 dark:text-[#aaa] flex items-center gap-1 border border-slate-200/60 dark:border-[#2c2c2c]">
                          <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                          <span>{t.aiReadyBadge}</span>
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
                    {t.todosSectionTitle}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/todo")}
                  className="text-xs text-slate-600 dark:text-[#a0a0a0] hover:text-slate-900 dark:hover:text-[#f0f0f0] gap-1 cursor-pointer"
                >
                  <span>{t.openTodoBtn}</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>

              {todayTodos.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 dark:text-[#888] space-y-2">
                  <p>{t.noTodosTitle}</p>
                  <Button
                    size="sm"
                    onClick={() => router.push("/todo")}
                    className="text-xs bg-slate-900 hover:bg-slate-800 dark:bg-[#f0f0f0] dark:hover:bg-white text-white dark:text-slate-900 rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    {t.addTodoBtn}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`p-2.5 rounded-xl bg-slate-50/70 dark:bg-[#181818] border border-slate-100 dark:border-[#242424] flex items-center justify-between gap-3 ${todo.isCompleted ? "opacity-50 line-through" : ""
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => handleToggleTodo(todo.id)}
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 cursor-pointer transition-colors ${todo.isCompleted
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
                          {t.priorityHigh}
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
                  {t.activityTitle}
                </h3>
              </div>
              <ActivityChart tasks={tasks} language={isEn ? "en" : "id"} />
            </div>

            {/* Recent Notes Preview */}
            <div className="bg-white dark:bg-[#161616] rounded-2xl p-5 sm:p-6 shadow-2xs border border-slate-200/80 dark:border-[#262626] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <NotebookPen className="w-4 h-4 text-slate-500 dark:text-[#888]" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f3f3f3]">
                    {t.notesSectionTitle}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/notes")}
                  className="text-xs text-slate-600 dark:text-[#a0a0a0] hover:text-slate-900 dark:hover:text-[#f0f0f0]"
                >
                  {t.openNotesBtn}
                </Button>
              </div>

              {recentNotes.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 dark:text-[#888]">
                  {t.noNotesDesc}
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
                          {note.title || t.untitledNote}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-[#666] shrink-0">
                          {note.subject || t.generalSubject}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-[#888] line-clamp-1">
                        {(note.content || "").replace(/[#*`~_\[\]()>-]/g, "")}
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
                <span>{t.quickAITitle}</span>
              </div>
              <div className="space-y-1.5">
                {t.quickPrompts.map((prompt, i) => (
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

      <TaskCompleteConfirmModal
        isOpen={Boolean(taskToConfirm)}
        taskTitle={taskToConfirm?.title}
        onClose={() => setTaskToConfirm(null)}
        onConfirm={handleConfirmTaskComplete}
        language={isEn ? "en" : "id"}
      />
    </>
  );
}
