"use client";
import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
} from "react";
import {
    Plus,
    Sparkles,
    RefreshCw,
    BookOpen,
    CheckCircle2,
    Clock,
    MessageSquareText,
    GraduationCap,
    FolderSync,
    AlertCircle,
    HelpCircle,
    Lightbulb,
    Search,
    Filter,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { StatsBanner } from "../components/StatsBanner";
import { FilterBar } from "../components/FilterBar";
import { TaskCard } from "../components/TaskCard";
import { TaskDetailModal } from "../components/TaskDetailModal";
import { AIChatModal } from "../components/AIChatModal";
import { CreateManualTaskModal } from "../components/CreateManualTaskModal";
import { SimulateTaskModal } from "../components/SimulateTaskModal";
import { LandingPage } from "../components/LandingPage";
import { OnboardingModal } from "../components/OnboardingModal";
import { SettingsModal } from "../components/SettingsModal";
import { Button } from "@/components/ui/button";
import {
    TodoTask,
    AIAnalysisResult,
    UserPreferences,
    AIConfig,
    DEFAULT_DATE_RANGE_MONTHS,
    isTaskWithinDateRange,
} from "../types";
import { ClassroomService, UserProfile } from "../services/classroomService";
import { analyzeTaskWithAI } from "../services/aiService";

const TASKS_STORAGE_KEY = "classroom_ai_todo_tasks_v1";
const PREFS_STORAGE_KEY = "classroom_ai_user_prefs_v1";
const AI_CONFIG_STORAGE_KEY = "classroom_ai_config_v1";
const ONBOARDING_DONE_KEY = "classroom_ai_onboarding_done_v1";

export default function App() {
    // Application State
    const [tasks, setTasks] = useState<TodoTask[]>([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const profile = ClassroomService.getUserProfile();
            const key = profile?.email ? `${TASKS_STORAGE_KEY}_${profile.email}` : TASKS_STORAGE_KEY;
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    setTasks(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse saved tasks:", e);
                }
            } else {
                setTasks(ClassroomService.getInitialSeedTasks());
            }
        }
    }, []);

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setUserProfile(ClassroomService.getUserProfile());
        }
    }, []);

    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setToken(ClassroomService.getStoredToken());
        }
    }, []);

    const [userPreferences, setUserPreferences] =
        useState<UserPreferences | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(PREFS_STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setUserPreferences({
                        ...parsed,
                        classroomDateRangeMonths:
                            parsed.classroomDateRangeMonths ??
                            DEFAULT_DATE_RANGE_MONTHS,
                    });
                } catch (e) { }
            } else {
                setUserPreferences({
                    learningStyle: "Netral",
                    explanationDetail: "Netral",
                    aiTone: "Ramah",
                    classroomDateRangeMonths: DEFAULT_DATE_RANGE_MONTHS,
                });
            }
        }
    }, []);

    const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
            if (saved) {
                try {
                    setAiConfig(JSON.parse(saved));
                } catch (e) { }
            }
        }
    }, []);

    const [hasCompletedOnboarding, setHasCompletedOnboarding] =
        useState<boolean>(true);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setHasCompletedOnboarding(
                localStorage.getItem(ONBOARDING_DONE_KEY) === "true",
            );
        }
    }, []);

    const [isSyncing, setIsSyncing] = useState(false);
    const [syncNotification, setSyncNotification] = useState<string | null>(
        null,
    );
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Filters and Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("all");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "pending" | "completed" | "ai-ready"
    >("pending");
    const [sortBy, setSortBy] = useState<"due" | "newest" | "priority">("due");

    // Modals & Chat state
    const [selectedTask, setSelectedTask] = useState<TodoTask | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatTaskId, setChatTaskId] = useState<string | undefined>(undefined);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isSimulateOpen, setIsSimulateOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Onboarding Mode
    const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
    const [isSettingsMode, setIsSettingsMode] = useState(false);

    // Persist tasks to localStorage
    useEffect(() => {
        if (tasks.length > 0 || token) {
            const key = userProfile?.email ? `${TASKS_STORAGE_KEY}_${userProfile.email}` : TASKS_STORAGE_KEY;
            localStorage.setItem(key, JSON.stringify(tasks));
        }
    }, [tasks, userProfile, token]);

    // Persist preferences
    useEffect(() => {
        if (userPreferences) {
            localStorage.setItem(
                PREFS_STORAGE_KEY,
                JSON.stringify(userPreferences),
            );
        }
    }, [userPreferences]);

    // Persist AI Config
    useEffect(() => {
        if (aiConfig) {
            localStorage.setItem(
                AI_CONFIG_STORAGE_KEY,
                JSON.stringify(aiConfig),
            );
        }
    }, [aiConfig]);

    // Handle opening onboarding modal right after login if not completed
    useEffect(() => {
        if (token && !hasCompletedOnboarding) {
            setIsOnboardingModalOpen(true);
            setIsSettingsMode(false);
        }
    }, [token, hasCompletedOnboarding]);

    // AI Task Analyzer runner
    const handleAnalyzeTask = useCallback(
        async (taskId: string) => {
            const targetTask = tasks.find((t) => t.id === taskId);
            if (!targetTask || targetTask.aiLoading) return;

            // Check Cache First
            const CACHE_KEY = `ai_analysis_cache_${taskId}`;
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (cachedData) {
                try {
                    const parsedAnalysis = JSON.parse(cachedData);
                    setTasks((prev) =>
                        prev.map((t) => {
                            if (t.id === taskId) {
                                return {
                                    ...t,
                                    aiAnalysis: parsedAnalysis,
                                    aiLoading: false,
                                    updatedAt: new Date().toISOString(),
                                };
                            }
                            return t;
                        }),
                    );
                    if (selectedTask?.id === taskId) {
                        setSelectedTask((prev) =>
                            prev
                                ? {
                                    ...prev,
                                    aiAnalysis: parsedAnalysis,
                                    aiLoading: false,
                                }
                                : null,
                        );
                    }
                    return; // Early return to avoid calling AI again
                } catch (e) {
                    console.error("Failed to parse cached analysis:", e);
                }
            }

            // Set loading state
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === taskId
                        ? { ...t, aiLoading: true, aiError: undefined }
                        : t,
                ),
            );
            if (selectedTask?.id === taskId) {
                setSelectedTask((prev) =>
                    prev
                        ? { ...prev, aiLoading: true, aiError: undefined }
                        : null,
                );
            }

            try {
                const analysisResult = await analyzeTaskWithAI(
                    targetTask,
                    userPreferences,
                    aiConfig,
                );

                // Save to cache
                localStorage.setItem(CACHE_KEY, JSON.stringify(analysisResult));

                setTasks((prev) =>
                    prev.map((t) => {
                        if (t.id === taskId) {
                            return {
                                ...t,
                                aiAnalysis: analysisResult,
                                aiLoading: false,
                                updatedAt: new Date().toISOString(),
                            };
                        }
                        return t;
                    }),
                );

                if (selectedTask?.id === taskId) {
                    setSelectedTask((prev) =>
                        prev
                            ? {
                                ...prev,
                                aiAnalysis: analysisResult,
                                aiLoading: false,
                            }
                            : null,
                    );
                }
            } catch (error: any) {
                console.error("Failed to analyze task with AI:", error);
                setTasks((prev) =>
                    prev.map((t) =>
                        t.id === taskId
                            ? {
                                ...t,
                                aiLoading: false,
                                aiError:
                                    error.message || "Gagal memproses AI",
                            }
                            : t,
                    ),
                );
                if (selectedTask?.id === taskId) {
                    setSelectedTask((prev) =>
                        prev
                            ? {
                                ...prev,
                                aiLoading: false,
                                aiError: error.message,
                            }
                            : null,
                    );
                }
            }
        },
        [tasks, selectedTask, userPreferences],
    );

    const prevTasksCount = useRef(0);

    // Auto-analyze HANYA jika ada dibawah 20 tugas baru yang ditambahkan (bukan bulk sync yang sangat banyak)
    useEffect(() => {
        const diff = tasks.length - prevTasksCount.current;
        prevTasksCount.current = tasks.length;

        if (diff <= 20) {
            const newestTask = [...tasks].sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            )[0];
            if (
                newestTask &&
                !newestTask.isCompleted &&
                !newestTask.aiAnalysis &&
                !newestTask.aiLoading &&
                !newestTask.aiError
            ) {
                handleAnalyzeTask(newestTask.id);
            }
        }
    }, [tasks, handleAnalyzeTask]);

    // Sync Google Classroom
    const handleSyncWithToken = async (activeToken: string) => {
        setIsSyncing(true);
        try {
            const rangeMonths =
                userPreferences?.classroomDateRangeMonths ??
                DEFAULT_DATE_RANGE_MONTHS;
            const { updatedTasks, newCount } =
                await ClassroomService.syncAllClassrooms(
                    activeToken,
                    tasks,
                    rangeMonths,
                );
            setTasks(updatedTasks);

            if (newCount > 0) {
                setSyncNotification(
                    `✨ Berhasil menyinkronkan! Ditemukan ${newCount} tugas baru dari Google Classroom.`,
                );
            } else {
                setSyncNotification(
                    "✅ Sinkronisasi selesai: Semua tugas Google Classroom Anda sudah up-to-date!",
                );
            }
        } catch (error: any) {
            console.error("Sync error:", error);
            const is401 =
                error.message?.includes("401") ||
                error.message?.includes("kadaluwarsa");
            if (is401) {
                setToken(null);
                setUserProfile(null);
                setLoginError(
                    "Sesi token Google Classroom Anda telah kadaluwarsa (401). Silakan klik 'Masuk dengan Google' untuk memperbarui akses.",
                );
                setSyncNotification(
                    "⚠️ Sesi Google kadaluwarsa. Silakan masuk kembali dengan akun Google Anda.",
                );
            } else {
                setSyncNotification(
                    `ℹ️ Menggunakan data sinkronisasi lokal: ${error.message || "Gagal terhubung ke API Classroom"}`,
                );
            }
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSaveSettings = (
        prefs: UserPreferences,
        config: AIConfig,
    ) => {
        setUserPreferences(prefs);
        setAiConfig(config);
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
        localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(config));
        setSyncNotification("⚙️ Pengaturan aplikasi dan filter tugas berhasil disimpan.");
    };

    const handleConnectGoogle = async () => {
        if (isAuthenticating) return;
        setLoginError(null);
        setIsAuthenticating(true);
        try {
            const result = await ClassroomService.requestToken();
            if (result) {
                setToken(result.token);
                setUserProfile(result.profile);
                
                const key = result.profile.email ? `${TASKS_STORAGE_KEY}_${result.profile.email}` : TASKS_STORAGE_KEY;
                const saved = localStorage.getItem(key);
                if (saved) {
                    try { setTasks(JSON.parse(saved)); } catch (e) {}
                } else {
                    setTasks([]);
                }
                
                handleSyncWithToken(result.token);
            } else {
                setLoginError("Gagal mendapatkan akses dari Google.");
            }
        } catch (error: any) {
            console.warn("Google Auth Error:", error);
            setLoginError(
                error.message ||
                "Gagal terhubung ke sistem login Google. Pastikan popup tidak diblokir atau buka di tab baru.",
            );
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleDisconnectGoogle = () => {
        ClassroomService.logout();
        setToken(null);
        setUserProfile(null);
        setTasks([]);
        setSyncNotification("Koneksi Google Classroom diputuskan.");
    };

    const handleManualSync = () => {
        if (token) {
            handleSyncWithToken(token);
        } else {
            setIsSyncing(true);
            setTimeout(() => {
                setIsSyncing(false);
                setSyncNotification(
                    "✅ Daftar tugas tersinkronisasi dan diperbarui.",
                );
            }, 800);
        }
    };

    // Toggle task completion
    const handleToggleComplete = (taskId: string) => {
        setTasks((prev) =>
            prev.map((t) => {
                if (t.id === taskId) {
                    const nextState = !t.isCompleted;
                    return {
                        ...t,
                        isCompleted: nextState,
                        completedAt: nextState
                            ? new Date().toISOString()
                            : undefined,
                        updatedAt: new Date().toISOString(),
                    };
                }
                return t;
            }),
        );
    };

    // Delete task
    const handleDeleteTask = (taskId: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        if (selectedTask?.id === taskId) {
            setIsDetailModalOpen(false);
            setSelectedTask(null);
        }
    };

    // Toggle checklist sub-item inside AI Analysis
    const handleToggleChecklistItem = (taskId: string, checkId: string) => {
        setTasks((prev) =>
            prev.map((t) => {
                if (t.id === taskId && t.aiAnalysis?.checklist) {
                    const updatedChecklist = t.aiAnalysis.checklist.map(
                        (item) =>
                            item.id === checkId
                                ? { ...item, done: !item.done }
                                : item,
                    );
                    return {
                        ...t,
                        aiAnalysis: {
                            ...t.aiAnalysis,
                            checklist: updatedChecklist,
                        },
                    };
                }
                return t;
            }),
        );

        if (selectedTask?.id === taskId && selectedTask.aiAnalysis?.checklist) {
            const updatedChecklist = selectedTask.aiAnalysis.checklist.map(
                (item) =>
                    item.id === checkId ? { ...item, done: !item.done } : item,
            );
            setSelectedTask((prev) =>
                prev && prev.aiAnalysis
                    ? {
                        ...prev,
                        aiAnalysis: {
                            ...prev.aiAnalysis,
                            checklist: updatedChecklist,
                        },
                    }
                    : null,
            );
        }
    };

    // Save personal notes for task
    const handleSaveNotes = (taskId: string, notes: string) => {
        setTasks((prev) =>
            prev.map((t) =>
                t.id === taskId
                    ? {
                        ...t,
                        customNotes: notes,
                        updatedAt: new Date().toISOString(),
                    }
                    : t,
            ),
        );
        if (selectedTask?.id === taskId) {
            setSelectedTask((prev) =>
                prev ? { ...prev, customNotes: notes } : null,
            );
        }
    };

    // Add manual task
    const handleAddManualTask = (
        taskData: Omit<
            TodoTask,
            "id" | "createdAt" | "updatedAt" | "isCompleted"
        >,
    ) => {
        const newTask: TodoTask = {
            ...taskData,
            id: `manual_${Date.now()}`,
            isCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setTasks((prev) => [newTask, ...prev]);
        setSyncNotification(
            `📝 Tugas baru "${newTask.title}" berhasil ditambahkan ke To-Do List!`,
        );
    };

    // Simulate new Google Classroom task received
    const handleSimulateNewTask = (
        taskData: Omit<
            TodoTask,
            "id" | "createdAt" | "updatedAt" | "isCompleted"
        >,
    ) => {
        const simulatedId = `sim_gc_${Date.now()}`;
        const newTask: TodoTask = {
            ...taskData,
            id: simulatedId,
            isCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setTasks((prev) => [newTask, ...prev]);
        setSyncNotification(
            `🔔 [Google Classroom] Tugas baru masuk: "${newTask.title}". AI sedang menyiapkan kurasi sumber & YouTube...`,
        );
    };

    // Open Chat with specific task context
    const handleOpenChat = (taskId?: string) => {
        setChatTaskId(taskId);
        setIsChatOpen(true);
    };

    // Open Details modal
    const handleOpenDetails = (task: TodoTask) => {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
    };

    // Extract unique course list
    const coursesList = useMemo(() => {
        const set = new Set<string>();
        tasks.forEach((t) => {
            if (t.courseName) set.add(t.courseName);
        });
        return Array.from(set);
    }, [tasks]);

    // Filtered and Sorted Tasks
    const filteredTasks = useMemo(() => {
        return tasks
            .filter((t) => {
                // Search filter
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    const matchTitle = t.title.toLowerCase().includes(q);
                    const matchDesc =
                        t.description?.toLowerCase().includes(q) || false;
                    const matchCourse = t.courseName.toLowerCase().includes(q);
                    const matchConcepts =
                        t.aiAnalysis?.keyConcepts?.some((k) =>
                            k.toLowerCase().includes(q),
                        ) || false;
                    if (
                        !matchTitle &&
                        !matchDesc &&
                        !matchCourse &&
                        !matchConcepts
                    )
                        return false;
                }

                // Course filter
                if (
                    selectedCourse !== "all" &&
                    t.courseName !== selectedCourse
                ) {
                    return false;
                }

                // Status filter
                if (statusFilter === "pending" && t.isCompleted) return false;
                if (statusFilter === "completed" && !t.isCompleted)
                    return false;
                if (
                    statusFilter === "ai-ready" &&
                    (!t.aiAnalysis || t.isCompleted)
                )
                    return false;

                // Date range filter from Settings (default 2 months)
                const dateRangeMonths =
                    userPreferences?.classroomDateRangeMonths ??
                    DEFAULT_DATE_RANGE_MONTHS;
                if (!isTaskWithinDateRange(t, dateRangeMonths)) {
                    return false;
                }

                return true;
            })
            .sort((a, b) => {
                if (sortBy === "newest") {
                    const getCreatedTime = (t: TodoTask) => {
                        if (t.createdAt) {
                            const parsed = new Date(t.createdAt).getTime();
                            if (!isNaN(parsed) && parsed > 0) return parsed;
                        }
                        if (t.updatedAt) {
                            const parsed = new Date(t.updatedAt).getTime();
                            if (!isNaN(parsed) && parsed > 0) return parsed;
                        }
                        if (t.id.startsWith("manual_") || t.id.startsWith("sim_gc_")) {
                            const parts = t.id.split("_");
                            const ts = parseInt(parts[parts.length - 1], 10);
                            if (!isNaN(ts) && ts > 0) return ts;
                        }
                        return t.dueTimestamp || 0;
                    };

                    const timeA = getCreatedTime(a);
                    const timeB = getCreatedTime(b);
                    if (timeB !== timeA) {
                        return timeB - timeA; // Tugas paling baru berada di paling atas
                    }
                    return (b.dueTimestamp || 0) - (a.dueTimestamp || 0);
                }
                if (sortBy === "priority") {
                    const priorityScore = { high: 3, medium: 2, low: 1 };
                    const scoreDiff = priorityScore[b.priority] - priorityScore[a.priority];
                    if (scoreDiff !== 0) return scoreDiff;
                    if (!a.dueTimestamp && !b.dueTimestamp) return 0;
                    if (!a.dueTimestamp) return 1;
                    if (!b.dueTimestamp) return -1;
                    return a.dueTimestamp - b.dueTimestamp;
                }
                // default: 'due' (Batas Waktu Terdekat)
                if (!a.dueTimestamp && !b.dueTimestamp) return 0;
                if (!a.dueTimestamp) return 1;
                if (!b.dueTimestamp) return -1;
                return a.dueTimestamp - b.dueTimestamp;
            });
    }, [
        tasks,
        searchQuery,
        selectedCourse,
        statusFilter,
        sortBy,
        userPreferences?.classroomDateRangeMonths,
    ]);

    const pendingTasksCount = tasks.filter((t) => !t.isCompleted).length;

    if (!token) {
        const handleDemoMode = () => {
            setToken("DEMO_TOKEN");
            localStorage.setItem("classroom_access_token", "DEMO_TOKEN");
            setUserProfile({
                name: "Pelajar Simulasi",
                email: "pelajar@contoh.com",
                picture:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Pelajar",
            });
            const seed = ClassroomService.getInitialSeedTasks();
            setTasks(seed);
            localStorage.setItem(`${TASKS_STORAGE_KEY}_pelajar@contoh.com`, JSON.stringify(seed));
        };
        return (
            <LandingPage
                onConnectGoogle={handleConnectGoogle}
                onDemoMode={handleDemoMode}
                loginError={loginError}
                isAuthenticating={isAuthenticating}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
            {/* Navigation Bar */}
            <Navbar
                userProfile={userProfile}
                isConnected={Boolean(token)}
                isSyncing={isSyncing}
                onConnectGoogle={handleConnectGoogle}
                onDisconnectGoogle={handleDisconnectGoogle}
                onSyncClassroom={handleManualSync}
                onOpenCreateTask={() => setIsCreateTaskOpen(true)}
                onOpenChat={() => handleOpenChat()}
                onSimulateNewTask={() => setIsSimulateOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                pendingCount={pendingTasksCount}
            />

            {/* Main Container */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-6">
                {/* Welcome / Header Brief */}
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            {userProfile?.name
                                ? `Halo, ${userProfile.name.split(" ")[0]}`
                                : "Daftar Tugas & Belajar"}
                        </h2>
                        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                            Semua tugas sekolah tersusun rapi dengan bantuan rangkuman materi & video belajar.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            id="main-open-ai-chat-btn"
                            onClick={() => handleOpenChat()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer active:scale-95">
                            <MessageSquareText className="w-4 h-4" />
                            <span>Tanya Asisten AI</span>
                        </button>
                    </div>
                </div>

                {/* Dynamic Metric Cards & Quick Filters */}
                <StatsBanner
                    tasks={tasks}
                    onQuickFilter={(filter) => setStatusFilter(filter)}
                    currentFilter={statusFilter}
                    syncNotification={syncNotification}
                    onDismissNotification={() => setSyncNotification(null)}
                />

                {/* Search, Filter by Course, Status & Sort */}
                <FilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    courses={coursesList}
                    selectedCourse={selectedCourse}
                    onCourseChange={setSelectedCourse}
                    statusFilter={statusFilter}
                    onStatusChange={(s: any) => setStatusFilter(s)}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                />

                {/* Task Cards Grid */}
                {filteredTasks.length > 0 ? (
                    <div className="space-y-3.5">
                        {filteredTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onToggleComplete={handleToggleComplete}
                                onAnalyzeWithAI={handleAnalyzeTask}
                                onOpenDetails={handleOpenDetails}
                                onOpenChat={handleOpenChat}
                                onDeleteTask={handleDeleteTask}
                            />
                        ))}
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-slate-200 shadow-2xs max-w-md mx-auto my-6 space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                            <Sparkles className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                                Belum Ada Catatan Tugas
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                                Tambahkan tugas pertamamu atau sinkronkan tugas dari Google Classroom secara otomatis.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                            <Button
                                onClick={() => setIsCreateTaskOpen(true)}
                                variant="default"
                                size="sm"
                                className="font-bold gap-1.5"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Tugas Baru</span>
                            </Button>
                            <Button
                                onClick={handleManualSync}
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Cek Google Classroom</span>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-slate-200 shadow-2xs max-w-md mx-auto my-6 space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center mx-auto">
                            <Search className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                                Tidak ada tugas yang sesuai
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Coba ganti kata kunci pencarian atau tampilkan semua tugas.
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCourse("all");
                                setStatusFilter("all");
                            }}
                            variant="primarySubtle"
                            size="sm"
                            className="font-bold"
                        >
                            Tampilkan Semua Tugas
                        </Button>
                    </div>
                )}
            </main>

            {/* Floating Action Button for Mobile Chat Trigger */}
            <button
                id="floating-chatbot-btn"
                onClick={() => handleOpenChat()}
                className="fixed bottom-6 right-6 z-40 md:hidden w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl flex items-center justify-center hover:bg-indigo-700 transition cursor-pointer active:scale-95"
                title="Buka Chatbot AI">
                <MessageSquareText className="w-6 h-6" />
            </button>

            {/* Modals */}
            <TaskDetailModal
                task={selectedTask}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onAnalyzeWithAI={handleAnalyzeTask}
                onToggleChecklistItem={handleToggleChecklistItem}
                onSaveNotes={handleSaveNotes}
                onOpenChat={handleOpenChat}
                onToggleComplete={handleToggleComplete}
            />

            <AIChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                tasks={tasks}
                activeTaskId={chatTaskId}
                onSelectTaskContext={(id) => setChatTaskId(id)}
                userPreferences={userPreferences}
                aiConfig={aiConfig}
            />

            <CreateManualTaskModal
                isOpen={isCreateTaskOpen}
                onClose={() => setIsCreateTaskOpen(false)}
                onAddTask={handleAddManualTask}
                existingCourses={coursesList}
            />

            <SimulateTaskModal
                isOpen={isSimulateOpen}
                onClose={() => setIsSimulateOpen(false)}
                onSimulate={handleSimulateNewTask}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                userPreferences={userPreferences}
                aiConfig={aiConfig}
                onSave={handleSaveSettings}
            />

            <OnboardingModal
                isOpen={isOnboardingModalOpen}
                isSettingsMode={isSettingsMode}
                onSave={(prefs) => {
                    setUserPreferences({
                        ...prefs,
                        classroomDateRangeMonths:
                            userPreferences?.classroomDateRangeMonths ??
                            DEFAULT_DATE_RANGE_MONTHS,
                    });
                    setHasCompletedOnboarding(true);
                    localStorage.setItem(ONBOARDING_DONE_KEY, "true");
                    setIsOnboardingModalOpen(false);
                }}
                onSkip={() => {
                    if (!isSettingsMode) {
                        setUserPreferences({
                            learningStyle: "Netral",
                            explanationDetail: "Netral",
                            aiTone: "Ramah",
                            classroomDateRangeMonths:
                                userPreferences?.classroomDateRangeMonths ??
                                DEFAULT_DATE_RANGE_MONTHS,
                        });
                        setHasCompletedOnboarding(true);
                        localStorage.setItem(ONBOARDING_DONE_KEY, "true");
                    }
                    setIsOnboardingModalOpen(false);
                }}
            />
        </div>
    );
}
