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
import { TodoTask, AIAnalysisResult, UserPreferences } from "../types";
import { ClassroomService, UserProfile } from "../services/classroomService";
import { analyzeTaskWithAI } from "../services/aiService";

const TASKS_STORAGE_KEY = "classroom_ai_todo_tasks_v1";
const PREFS_STORAGE_KEY = "classroom_ai_user_prefs_v1";
const ONBOARDING_DONE_KEY = "classroom_ai_onboarding_done_v1";

export default function App() {
    // Application State
    const [tasks, setTasks] = useState<TodoTask[]>([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(TASKS_STORAGE_KEY);
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
                    setUserPreferences(JSON.parse(saved));
                } catch (e) {}
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
    >("all");
    const [sortBy, setSortBy] = useState<"due" | "newest" | "priority">("due");

    // Modals & Chat state
    const [selectedTask, setSelectedTask] = useState<TodoTask | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatTaskId, setChatTaskId] = useState<string | undefined>(undefined);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isSimulateOpen, setIsSimulateOpen] = useState(false);

    // Onboarding / Settings Mode
    const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
    const [isSettingsMode, setIsSettingsMode] = useState(false);

    // Persist tasks to localStorage
    useEffect(() => {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }, [tasks]);

    // Persist preferences
    useEffect(() => {
        if (userPreferences) {
            localStorage.setItem(
                PREFS_STORAGE_KEY,
                JSON.stringify(userPreferences),
            );
        }
    }, [userPreferences]);

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
            const { updatedTasks, newCount } =
                await ClassroomService.syncAllClassrooms(activeToken, tasks);
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
            setSyncNotification(
                `ℹ️ Menggunakan data sinkronisasi lokal: ${error.message || "Gagal terhubung ke API Classroom"}`,
            );
        } finally {
            setIsSyncing(false);
        }
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

                return true;
            })
            .sort((a, b) => {
                if (sortBy === "newest") {
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    );
                }
                if (sortBy === "priority") {
                    const priorityScore = { high: 3, medium: 2, low: 1 };
                    return (
                        priorityScore[b.priority] - priorityScore[a.priority]
                    );
                }
                // default: 'due'
                if (!a.dueTimestamp && !b.dueTimestamp) return 0;
                if (!a.dueTimestamp) return 1;
                if (!b.dueTimestamp) return -1;
                return a.dueTimestamp - b.dueTimestamp;
            });
    }, [tasks, searchQuery, selectedCourse, statusFilter, sortBy]);

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
            localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(seed));
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
                onOpenSettings={() => {
                    setIsSettingsMode(true);
                    setIsOnboardingModalOpen(true);
                }}
                pendingCount={pendingTasksCount}
            />

            {/* Main Container */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Welcome / Header Brief */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Daftar Tugas & Asisten Belajar
                        </h2>
                        <p className="text-slate-600 text-sm mt-1">
                            Tersinkronisasi otomatis dari Google Classroom
                            lengkap dengan kurasi materi, referensi YouTube, dan
                            AI Tutor.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            id="main-simulate-task-btn"
                            onClick={() => setIsSimulateOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 transition cursor-pointer">
                            <FolderSync className="w-4 h-4 text-amber-600" />
                            <span>Simulasi Tugas Baru</span>
                        </button>

                        <button
                            id="main-open-ai-chat-btn"
                            onClick={() => handleOpenChat()}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer">
                            <MessageSquareText className="w-4 h-4" />
                            <span>Buka Chatbot AI</span>
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
                ) : (
                    <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/90 shadow-xs max-w-lg mx-auto my-8 space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                            <Search className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">
                                Tidak ada tugas yang cocok
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Coba ubah kata kunci pencarian atau reset filter
                                mata pelajaran.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCourse("all");
                                setStatusFilter("all");
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer">
                            Reset Semua Filter
                        </button>
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
            />

            <AIChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                tasks={tasks}
                activeTaskId={chatTaskId}
                onSelectTaskContext={(id) => setChatTaskId(id)}
                userPreferences={userPreferences}
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

            <OnboardingModal
                isOpen={isOnboardingModalOpen}
                isSettingsMode={isSettingsMode}
                onSave={(prefs) => {
                    setUserPreferences(prefs);
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
