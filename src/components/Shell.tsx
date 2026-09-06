"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { LandingPage } from "./LandingPage";
import { OnboardingModal } from "./OnboardingModal";
import { toast } from "@/components/ui/sonner";
import { ClassroomService, UserProfile } from "../services/classroomService";
import { DBService } from "../services/dbService";
import { TodoTask, UserPreferences, DEFAULT_DATE_RANGE_MONTHS } from "../types";
import {
  TASKS_STORAGE_KEY,
  ONBOARDING_DONE_KEY,
  loadTasks,
  persist,
  loadPreferences,
  savePreferences,
} from "../lib/taskStore";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CheckCircle2, RefreshCw, Sun, Moon } from "lucide-react";
import { toggleThemeWithCircularAnimation } from "../lib/theme";

interface ShellContextValue {
  userProfile: UserProfile | null;
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncClassroom: () => Promise<void>;
}

const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within <Shell>");
  return ctx;
}

interface ShellProps {
  children: React.ReactNode;
  fullBleed?: boolean;
}

export const Shell: React.FC<ShellProps> = ({ children, fullBleed = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setToken(ClassroomService.getStoredToken());
    setUserProfile(ClassroomService.getUserProfile());
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
      const savedSync = localStorage.getItem("last_classroom_sync");
      if (savedSync) {
        setLastSyncedAt(new Date(savedSync));
      }
    }
  }, []);

  const handleToggleTheme = (e: React.MouseEvent) => {
    const nextTheme = toggleThemeWithCircularAnimation(e);
    setIsDark(nextTheme === "dark");
  };

  useEffect(() => {
    if (hydrated && !token) router.replace("/");
  }, [hydrated, token, router]);

  useEffect(() => {
    if (
      token &&
      typeof window !== "undefined" &&
      localStorage.getItem(ONBOARDING_DONE_KEY) !== "true"
    ) {
      setShowOnboarding(true);
    }
  }, [token]);

  const syncWithToken = async (
    activeToken: string,
    overrideTasks?: TodoTask[],
    overrideEmail?: string
  ) => {
    setIsSyncing(true);
    try {
      const rangeMonths =
        loadPreferences()?.classroomDateRangeMonths ??
        DEFAULT_DATE_RANGE_MONTHS;
      let currentTasks = overrideTasks ?? loadTasks();
      const email = overrideEmail || userProfile?.email;

      if (email && !overrideTasks) {
        try {
          const cloudData = await DBService.loadUserData(email);
          if (cloudData?.tasks && cloudData.tasks.length > 0) {
            const cloudTasks = cloudData.tasks.filter(
              (t) =>
                (!t.userEmail || t.userEmail === email) &&
                !t.id.startsWith("seed-")
            );
            if (cloudTasks.length > 0) {
              const cloudMap = new Map(cloudTasks.map((t) => [t.id, t]));
              currentTasks = currentTasks.map((t) => {
                const ct = cloudMap.get(t.id);
                if (ct) {
                  return {
                    ...t,
                    isCompleted: ct.isCompleted || t.isCompleted,
                    completedAt: ct.completedAt || t.completedAt,
                    customNotes: ct.customNotes || t.customNotes,
                    aiAnalysis: ct.aiAnalysis || t.aiAnalysis,
                  };
                }
                return t;
              });
              const existingIds = new Set(currentTasks.map((t) => t.id));
              for (const ct of cloudTasks) {
                if (!existingIds.has(ct.id)) currentTasks.push(ct);
              }
            }
          }
        } catch {}
      }

      const { updatedTasks, newCount } =
        await ClassroomService.syncAllClassrooms(
          activeToken,
          currentTasks,
          rangeMonths,
          email
        );
      persist(updatedTasks);
      const now = new Date();
      setLastSyncedAt(now);
      if (typeof window !== "undefined") {
        localStorage.setItem("last_classroom_sync", now.toISOString());
      }

      if (newCount > 0) {
        toast.success("Sinkronisasi Selesai", {
          description: `Ditemukan ${newCount} tugas baru dari Google Classroom.`,
        });
      } else {
        toast.info("Classroom Sudah Terkini", {
          description: "Semua tugas Google Classroom Anda sudah sinkron.",
        });
      }
    } catch (error: any) {
      const is401 =
        error.message?.includes("401") ||
        error.message?.includes("kadaluwarsa");
      if (is401) {
        setToken(null);
        setUserProfile(null);
        setLoginError(
          "Sesi token Google Classroom Anda telah kadaluwarsa (401). Silakan klik 'Masuk dengan Google' untuk memperbarui akses."
        );
        toast.error("Sesi Google Kadaluwarsa", {
          description: "Silakan masuk kembali dengan akun Google Anda.",
        });
      } else {
        toast.warning("Sinkronisasi Offline", {
          description:
            error.message ||
            "Gagal terhubung ke API Classroom. Menggunakan data lokal.",
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const syncClassroom = async () => {
    if (!token || isSyncing) return;
    await syncWithToken(token);
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

        const key = result.profile.email
          ? `${TASKS_STORAGE_KEY}_${result.profile.email}`
          : TASKS_STORAGE_KEY;
        const saved = localStorage.getItem(key);
        let newTasks: TodoTask[] = [];
        if (saved) {
          try {
            const parsed: TodoTask[] = JSON.parse(saved);
            newTasks = parsed.filter(
              (t) =>
                (!t.userEmail || t.userEmail === result.profile.email) &&
                !t.id.startsWith("seed-")
            );
          } catch {}
        }

        try {
          const cloudData = await DBService.loadUserData(result.profile.email);
          if (cloudData?.tasks && cloudData.tasks.length > 0) {
            const cloudTasks = cloudData.tasks.filter(
              (t) =>
                (!t.userEmail || t.userEmail === result.profile.email) &&
                !t.id.startsWith("seed-")
            );
            if (cloudTasks.length > 0) {
              const cloudMap = new Map(cloudTasks.map((t) => [t.id, t]));
              if (newTasks.length > 0) {
                newTasks = newTasks.map((t) => {
                  const ct = cloudMap.get(t.id);
                  if (ct) {
                    return {
                      ...t,
                      isCompleted: ct.isCompleted || t.isCompleted,
                      completedAt: ct.completedAt || t.completedAt,
                      customNotes: ct.customNotes || t.customNotes,
                      aiAnalysis: ct.aiAnalysis || t.aiAnalysis,
                    };
                  }
                  return t;
                });
                const existingIds = new Set(newTasks.map((t) => t.id));
                for (const ct of cloudTasks) {
                  if (!existingIds.has(ct.id)) newTasks.push(ct);
                }
              } else {
                newTasks = cloudTasks;
              }
            }
          }
        } catch {}

        localStorage.setItem(key, JSON.stringify(newTasks));
        persist(newTasks);
        await syncWithToken(result.token, newTasks, result.profile.email);
        router.replace("/");
      } else {
        setLoginError("Gagal mendapatkan akses dari Google.");
      }
    } catch (error: any) {
      setLoginError(
        error.message ||
          "Gagal terhubung ke sistem login Google. Pastikan popup tidak diblokir atau buka di tab baru."
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnectGoogle = () => {
    ClassroomService.logout();
    setToken(null);
    setUserProfile(null);
    toast.info("Koneksi Google Diputuskan", {
      description: "Akun Google Classroom telah keluar dan sesi ditutup.",
    });
  };

  const handleDemoMode = () => {
    setToken("DEMO_TOKEN");
    localStorage.setItem("classroom_access_token", "DEMO_TOKEN");
    setUserProfile({
      name: "Pelajar Simulasi",
      email: "pelajar@contoh.com",
      picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pelajar",
    });
    const seed = ClassroomService.getInitialSeedTasks();
    localStorage.setItem(
      `${TASKS_STORAGE_KEY}_pelajar@contoh.com`,
      JSON.stringify(seed)
    );
    setLoginError(null);
  };

  const handleOnboardingSave = (prefs: UserPreferences) => {
    const existing = loadPreferences();
    savePreferences({
      ...prefs,
      classroomDateRangeMonths:
        existing?.classroomDateRangeMonths ?? DEFAULT_DATE_RANGE_MONTHS,
      toastPosition: existing?.toastPosition ?? "top-right",
    });
    localStorage.setItem(ONBOARDING_DONE_KEY, "true");
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem(ONBOARDING_DONE_KEY, "true");
    setShowOnboarding(false);
  };

  if (!hydrated) return null;

  if (!token) {
    return (
      <LandingPage
        onConnectGoogle={handleConnectGoogle}
        onDemoMode={handleDemoMode}
        loginError={loginError}
        isAuthenticating={isAuthenticating}
      />
    );
  }

  const getPageTitle = (path: string) => {
    if (path === "/") return "Dashboard";
    if (path.startsWith("/tasks")) return "Semua Tugas";
    if (path.startsWith("/chat")) return "Tanya AI";
    if (path.startsWith("/todo")) return "To-Do List";
    if (path.startsWith("/notes")) return "Catatan Materi";
    if (path === "/settings") return "Pengaturan";
    if (path.startsWith("/tugas")) return "Detail Tugas";
    return "Halaman";
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <ShellContext.Provider
      value={{
        userProfile,
        isConnected: true,
        isSyncing,
        lastSyncedAt,
        syncClassroom,
      }}
    >
      <SidebarProvider defaultOpen>
        <AppSidebar
          userProfile={userProfile}
          isConnected={true}
          isSyncing={isSyncing}
          onSyncClassroom={syncClassroom}
          onDisconnectGoogle={handleDisconnectGoogle}
        />

        <SidebarInset
          className={`bg-[#f5f6f8] dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 flex flex-col ${
            fullBleed || pathname === "/chat"
              ? "h-screen max-h-screen overflow-hidden"
              : "min-h-screen"
          }`}
        >
          {/* Minimalist Header with SidebarTrigger & Breadcrumbs */}
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/50 dark:border-white/[0.04] bg-white/90 dark:bg-[#0a0a0a]/90 px-4 backdrop-blur-md shadow-[0_1px_4px_0_rgba(0,0,0,0.04)] dark:shadow-[0_1px_4px_0_rgba(0,0,0,0.3)] transition-colors">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#161616] rounded-xl" />
              <Separator
                orientation="vertical"
                className="mr-2 h-4 bg-slate-200/40 dark:bg-[#222222]/60"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/");
                      }}
                      className="text-xs font-medium text-slate-500 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f5f5f5]"
                    >
                      IOnLearn
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {pathname !== "/" && (
                    <>
                      <BreadcrumbSeparator className="hidden md:block text-slate-400 dark:text-[#737373]" />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-xs font-semibold text-slate-900 dark:text-[#f5f5f5]">
                          {pageTitle}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                  {pathname === "/" && (
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-xs font-semibold text-slate-900 dark:text-[#f5f5f5]">
                        Dashboard
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2">
              {/* Navbar Classroom Sync Button */}
              <button
                onClick={syncClassroom}
                disabled={isSyncing}
                title={
                  lastSyncedAt
                    ? `Terakhir disinkronkan: ${new Date(lastSyncedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} (Klik untuk update)`
                    : "Sinkronkan data Google Classroom"
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-[#161616] text-slate-700 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f5f5f5] border border-slate-200/60 dark:border-[#262626] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-emerald-600 dark:text-[#34d399] ${
                    isSyncing ? "animate-spin text-indigo-500" : ""
                  }`}
                />
                <span className="hidden sm:inline">
                  {isSyncing ? "Sinkronisasi..." : "Sinkron Classroom"}
                </span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={handleToggleTheme}
                title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
                aria-label="Toggle theme"
                className="size-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-[#161616] text-slate-700 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f5f5f5] shadow-2xs hover:bg-slate-200/70 dark:hover:bg-[#202020] transition-all cursor-pointer"
              >
                {isDark ? (
                  <Sun className="size-4 text-amber-500" />
                ) : (
                  <Moon className="size-4 text-indigo-600 dark:text-[#818cf8]" />
                )}
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <main
            className={`flex-1 w-full min-h-0 ${
              fullBleed || pathname === "/chat"
                ? "h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] p-0 overflow-hidden flex flex-col"
                : "max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6"
            }`}
          >
            {children}
          </main>
        </SidebarInset>

        <OnboardingModal
          isOpen={showOnboarding}
          onSave={handleOnboardingSave}
          onSkip={handleOnboardingSkip}
        />
      </SidebarProvider>
    </ShellContext.Provider>
  );
};