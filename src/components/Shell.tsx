"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { LandingPage } from "./LandingPage";
import { OnboardingModal } from "./OnboardingModal";
import { SpotlightTour } from "./SpotlightTour";
import { toast } from "@/components/ui/sonner";
import { ClassroomService, UserProfile } from "../services/classroomService";
import { DBService } from "../services/dbService";
import { TodoTask, UserPreferences, DEFAULT_DATE_RANGE_MONTHS, ClassroomSyncProgress } from "../types";
import { SyncManager, useSyncManager } from "../services/syncManager";
import {
  TASKS_STORAGE_KEY,
  TODOS_STORAGE_KEY,
  NOTES_STORAGE_KEY,
  PREFS_STORAGE_KEY,
  ONBOARDING_DONE_KEY,
  SPOTLIGHT_TOUR_DONE_KEY,
  SPOTLIGHT_PENDING_KEY,
  isOnboardingCompleted,
  setOnboardingCompleted,
  isSpotlightTourCompleted,
  setSpotlightTourCompleted,
  isSpotlightPending,
  setSpotlightPending,
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
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLanguage } from "@/context/LanguageContext";

interface ShellContextValue {
  userProfile: UserProfile | null;
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncProgress: ClassroomSyncProgress | null;
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
  const syncState = useSyncManager();
  const isSyncing = syncState.isSyncing;
  const lastSyncedAt = syncState.lastSyncedAt;
  const syncProgress = syncState.syncProgress;
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSpotlightTour, setShowSpotlightTour] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { isEn, t } = useLanguage();

  useEffect(() => {
    const storedToken = ClassroomService.getStoredToken();
    const storedProfile = ClassroomService.getUserProfile();
    setToken(storedToken);
    setUserProfile(storedProfile);
    setHydrated(true);

    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUserProfile((prev) => {
          const updated: UserProfile = {
            name: firebaseUser.displayName || prev?.name || firebaseUser.email || "Pelajar",
            email: firebaseUser.email || prev?.email || "",
            picture: firebaseUser.photoURL || prev?.picture || undefined,
          };
          localStorage.setItem("classroom_user_profile", JSON.stringify(updated));
          return updated;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleTriggerOnboarding = () => {
      setShowOnboarding(true);
    };
    const handleTriggerSpotlight = () => {
      setShowSpotlightTour(true);
    };

    window.addEventListener("start-onboarding-flow", handleTriggerOnboarding);
    window.addEventListener("start-feature-tour", handleTriggerOnboarding);
    window.addEventListener("start-spotlight-tour", handleTriggerSpotlight);

    return () => {
      window.removeEventListener("start-onboarding-flow", handleTriggerOnboarding);
      window.removeEventListener("start-feature-tour", handleTriggerOnboarding);
      window.removeEventListener("start-spotlight-tour", handleTriggerSpotlight);
    };
  }, []);

  // Listen to global session expiration events (e.g. 401 Unauthorized or expiry) and auto-redirect to Landing Page
  useEffect(() => {
    const onSessionExpired = (e: any) => {
      const reason =
        e.detail?.reason || t.nav.sessionExpiredDesc;
      setToken(null);
      setUserProfile(null);
      router.replace("/");
      toast.warning(t.nav.sessionExpiredTitle, {
        description: reason,
      });
    };

    window.addEventListener("ionlearn:session-expired", onSessionExpired as EventListener);
    return () => window.removeEventListener("ionlearn:session-expired", onSessionExpired as EventListener);
  }, [router]);

  // Proactive periodic heartbeat & visibility check to detect expired sessions automatically
  useEffect(() => {
    if (!hydrated || !token || token === "DEMO_TOKEN") return;

    const checkSession = () => {
      if (ClassroomService.isTokenExpired()) {
        ClassroomService.handleSessionExpired(
          "Sesi Google Classroom Anda telah berakhir. Silakan masuk kembali."
        );
      }
    };

    const refreshCloudPreferences = async () => {
      const email = userProfile?.email;
      if (!email) return;
      try {
        const cloudData = await DBService.loadUserData(email);
        if (cloudData?.preferences) {
          localStorage.setItem(
            `${PREFS_STORAGE_KEY}_${email}`,
            JSON.stringify(cloudData.preferences)
          );
          localStorage.setItem(
            PREFS_STORAGE_KEY,
            JSON.stringify(cloudData.preferences)
          );
          window.dispatchEvent(new Event("taskStoreChange"));
          window.dispatchEvent(new Event("task-modal-style-changed"));
          window.dispatchEvent(new Event("chat-layout-changed"));
        }
        if (cloudData?.aiConfig) {
          localStorage.setItem(
            "classroom_ai_config",
            JSON.stringify(cloudData.aiConfig)
          );
        }
      } catch {}
    };

    // Periodic check every 30 seconds
    const interval = setInterval(() => {
      checkSession();
      refreshCloudPreferences();
    }, 30000);

    // Check immediately when user switches back to tab or focuses window
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkSession();
        refreshCloudPreferences();
      }
    };

    const handleFocus = () => {
      checkSession();
      refreshCloudPreferences();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    // Initial check
    refreshCloudPreferences();

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [hydrated, token, userProfile?.email]);

  // Proactive background sync on initial load to verify token validity against Google Classroom API immediately
  useEffect(() => {
    if (!hydrated || !token || token === "DEMO_TOKEN") return;

    SyncManager.sync(token, {
      silent: true,
      overrideEmail: userProfile?.email,
    }).catch((err) => {
      console.warn("Initial silent sync check error:", err);
    });
  }, [hydrated, token, userProfile?.email]);

  const handleToggleTheme = (e: React.MouseEvent) => {
    const nextTheme = toggleThemeWithCircularAnimation(e);
    setIsDark(nextTheme === "dark");
  };

  useEffect(() => {
    if (!hydrated) return;

    const currentToken = token || ClassroomService.getStoredToken();
    if (!currentToken) {
      if (
        pathname !== "/" &&
        pathname !== "/landing" &&
        pathname !== "/privacy" &&
        pathname !== "/terms"
      ) {
        window.location.href = "/";
      }
      return;
    }

    if (!token && currentToken) {
      setToken(currentToken);
    }

    // If logged in, check onboarding status for this specific account
    let isMounted = true;
    const checkUserOnboarding = async () => {
      const storedProfile = ClassroomService.getUserProfile();
      const email = userProfile?.email || storedProfile?.email;
      let isDone = isOnboardingCompleted(email);

      // If not done locally in this browser, check if cloud already has the completed onboarding profile or existing data
      if (!isDone && email) {
        try {
          const cloudData = await DBService.loadUserData(email);
          const isReturning =
            Boolean(
              cloudData &&
                (cloudData.onboardingCompleted ||
                  cloudData.spotlightCompleted ||
                  cloudData.hasLoggedInBefore ||
                  cloudData.preferences ||
                  (cloudData.tasks && cloudData.tasks.length > 0) ||
                  (cloudData.todos && cloudData.todos.length > 0) ||
                  (cloudData.notes && cloudData.notes.length > 0))
            );

          if (isReturning) {
            if (cloudData?.preferences) {
              localStorage.setItem(
                `${PREFS_STORAGE_KEY}_${email}`,
                JSON.stringify(cloudData.preferences)
              );
            }
            setOnboardingCompleted(true, email);
            setSpotlightTourCompleted(true, email);
            setSpotlightPending(false, email);
            isDone = true;
            window.dispatchEvent(new Event("taskStoreChange"));
          }
        } catch {}
      }

      if (isMounted) {
        if (!isDone) {
          // Flag as pending so when onboarding is completed or dismissed, spotlight will trigger
          setSpotlightPending(true, email);
          if (
            pathname !== "/onboarding" &&
            pathname !== "/landing" &&
            pathname !== "/privacy" &&
            pathname !== "/terms"
          ) {
            router.replace("/onboarding");
          }
        } else if (
          (pathname === "/dashboard" || pathname === "/") &&
          !isSpotlightTourCompleted(email) &&
          isSpotlightPending(email)
        ) {
          // Reliable delay ensuring dashboard layout and data-tour target elements are mounted
          setTimeout(() => {
            if (isMounted && !isSpotlightTourCompleted(email) && isSpotlightPending(email)) {
              setSpotlightPending(false, email);
              setShowSpotlightTour(true);
            }
          }, 500);
        }
      }
    };

    checkUserOnboarding();

    const handleTaskStoreChange = () => {
      checkUserOnboarding();
    };
    window.addEventListener("taskStoreChange", handleTaskStoreChange);

    return () => {
      isMounted = false;
      window.removeEventListener("taskStoreChange", handleTaskStoreChange);
    };
  }, [hydrated, token, userProfile?.email, pathname, router]);

  const syncClassroom = async () => {
    if (!token) return;
    if (ClassroomService.isTokenExpired()) {
      ClassroomService.handleSessionExpired(
        "Sesi Google Classroom Anda telah berakhir. Silakan masuk kembali."
      );
      return;
    }
    await SyncManager.sync(token, {
      overrideEmail: userProfile?.email,
    });
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

        const email = result.profile.email;
        const key = email
          ? `${TASKS_STORAGE_KEY}_${email}`
          : TASKS_STORAGE_KEY;
        const saved = localStorage.getItem(key);
        let newTasks: TodoTask[] = [];
        if (saved) {
          try {
            const parsed: TodoTask[] = JSON.parse(saved);
            newTasks = parsed.filter(
              (t) =>
                (!t.userEmail || t.userEmail === email) &&
                !t.id.startsWith("seed-")
            );
          } catch {}
        }

        // Fast, non-blocking cloud preferences & data hydrate (maximum 500ms race)
        try {
          const cloudDataPromise = DBService.loadUserData(email);
          const timeoutPromise = new Promise<null>((r) => setTimeout(() => r(null), 500));
          const cloudData = await Promise.race([cloudDataPromise, timeoutPromise]);

          if (cloudData?.preferences) {
            localStorage.setItem(
              `${PREFS_STORAGE_KEY}_${email}`,
              JSON.stringify(cloudData.preferences)
            );
            if (
              cloudData.preferences.educationLevel &&
              cloudData.preferences.learningStyle &&
              cloudData.preferences.aiTone
            ) {
              setOnboardingCompleted(true, email);
            }
          }
          if (cloudData?.todos && cloudData.todos.length > 0) {
            localStorage.setItem(
              `${TODOS_STORAGE_KEY}_${email}`,
              JSON.stringify(cloudData.todos)
            );
          }
          if (cloudData?.notes && cloudData.notes.length > 0) {
            localStorage.setItem(
              `${NOTES_STORAGE_KEY}_${email}`,
              JSON.stringify(cloudData.notes)
            );
          }
          if (cloudData?.tasks && cloudData.tasks.length > 0) {
            const cloudTasks = cloudData.tasks.filter(
              (t) =>
                (!t.userEmail || t.userEmail === email) &&
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
        } catch (cloudErr) {
          console.warn("Non-blocking cloud load skipped on login:", cloudErr);
        }

        try {
          localStorage.setItem(key, JSON.stringify(newTasks));
          persist(newTasks);
        } catch {}

        // Run sync in background so redirection is instantaneous and never hangs
        SyncManager.sync(result.token, {
          overrideTasks: newTasks,
          overrideEmail: email,
          silent: true,
        }).catch((err) => console.warn("Background sync error on login:", err));

        const targetUrl = !isOnboardingCompleted(email)
          ? "/onboarding"
          : "/dashboard";

        // Guaranteed instant redirect
        window.location.replace(targetUrl);
        return;
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
    const currentEmail = userProfile?.email || ClassroomService.getUserProfile()?.email;
    if (currentEmail === "pelajar@contoh.com") {
      localStorage.removeItem(`${ONBOARDING_DONE_KEY}_pelajar@contoh.com`);
      localStorage.removeItem(`${SPOTLIGHT_TOUR_DONE_KEY}_pelajar@contoh.com`);
      localStorage.removeItem(`${SPOTLIGHT_PENDING_KEY}_pelajar@contoh.com`);
      localStorage.removeItem(`onboarding_draft_pelajar@contoh.com`);
    }
    ClassroomService.logout();
    setToken(null);
    setUserProfile(null);
    router.replace("/");
    toast.info(t.nav.logoutConfirmTitle, {
      description: t.nav.logoutConfirmDesc,
    });
  };

  const handleDemoMode = () => {
    setToken("DEMO_TOKEN");
    localStorage.setItem("classroom_access_token", "DEMO_TOKEN");
    localStorage.setItem("classroom_token_expiry", (Date.now() + 365 * 24 * 3600 * 1000).toString());
    const demoProfile = {
      name: "Pelajar Simulasi",
      email: "pelajar@contoh.com",
      picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pelajar",
    };
    setUserProfile(demoProfile);
    localStorage.setItem("classroom_user_profile", JSON.stringify(demoProfile));
    const seed = ClassroomService.getInitialSeedTasks();
    localStorage.setItem(
      `${TASKS_STORAGE_KEY}_pelajar@contoh.com`,
      JSON.stringify(seed)
    );
    setLoginError(null);

    if (!isSpotlightTourCompleted("pelajar@contoh.com")) {
      localStorage.removeItem(`${ONBOARDING_DONE_KEY}_pelajar@contoh.com`);
      setSpotlightPending(true, "pelajar@contoh.com");
    }

    const targetUrl = !isOnboardingCompleted("pelajar@contoh.com")
      ? "/onboarding"
      : "/dashboard";
    window.location.href = targetUrl;
  };

  const handleOnboardingSave = (prefs: UserPreferences) => {
    const existing = loadPreferences();
    savePreferences(
      {
        ...prefs,
        classroomDateRangeMonths:
          existing?.classroomDateRangeMonths ?? DEFAULT_DATE_RANGE_MONTHS,
        toastPosition: existing?.toastPosition ?? "top-right",
      },
      userProfile?.email
    );
    setOnboardingCompleted(true, userProfile?.email);
    setShowOnboarding(false);
    if (!isSpotlightTourCompleted(userProfile?.email)) {
      setSpotlightPending(false, userProfile?.email);
      setShowSpotlightTour(true);
    }
  };

  const handleOnboardingSkip = () => {
    setOnboardingCompleted(true, userProfile?.email);
    setShowOnboarding(false);
    if (!isSpotlightTourCompleted(userProfile?.email)) {
      setSpotlightPending(false, userProfile?.email);
      setShowSpotlightTour(true);
    }
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
    if (path === "/dashboard" || path === "/") return t.nav.dashboard;
    if (path.startsWith("/tasks")) return t.nav.allTasks;
    if (path.startsWith("/chat")) return t.nav.askAI;
    if (path.startsWith("/todo")) return t.nav.todoList;
    if (path.startsWith("/notes")) return t.nav.studyNotes;
    if (path === "/settings") return t.nav.settings;
    if (path.startsWith("/tugas")) return t.nav.taskDetails;
    return isEn ? "Page" : "Halaman";
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <ShellContext.Provider
      value={{
        userProfile,
        isConnected: true,
        isSyncing,
        lastSyncedAt,
        syncProgress,
        syncClassroom,
      }}
    >
      <SidebarProvider>
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
                className="mr-1 sm:mr-2 h-4 bg-slate-200/40 dark:bg-[#222222]/60"
              />
              <img
                src="/logos/Ionlearnnewkecil.png"
                alt="IOnLearn"
                className="md:hidden size-5 object-contain"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink
                      href="/dashboard"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/dashboard");
                      }}
                      className="text-xs font-medium text-slate-500 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f5f5f5]"
                    >
                      IOnLearn
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {pathname !== "/dashboard" && (
                    <>
                      <BreadcrumbSeparator className="hidden md:block text-slate-400 dark:text-[#737373]" />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-xs font-semibold text-slate-900 dark:text-[#f5f5f5]">
                          {pageTitle}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                  {pathname === "/dashboard" && (
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-xs font-semibold text-slate-900 dark:text-[#f5f5f5]">
                        {t.nav.dashboard}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Refresh Sinkronisasi Button */}
              <button
                data-tour="header-sync"
                onClick={syncClassroom}
                disabled={isSyncing}
                title={
                  isSyncing
                    ? syncProgress?.message || (isEn ? "Syncing Google Classroom data..." : "Sedang menyinkronkan data Google Classroom...")
                    : lastSyncedAt
                    ? `${t.nav.lastSynced}: ${new Date(lastSyncedAt).toLocaleTimeString(isEn ? "en-US" : "id-ID", { hour: "2-digit", minute: "2-digit" })}`
                    : (isEn ? "Refresh Google Classroom sync" : "Refresh Sinkronisasi data Google Classroom")
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-[#18181f] text-slate-700 dark:text-[#ccc] hover:text-slate-900 dark:hover:text-[#fff] border border-slate-200/80 dark:border-[#282834] shadow-2xs hover:bg-slate-200/60 dark:hover:bg-[#22222c] transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-emerald-600 dark:text-[#34d399] ${
                    isSyncing ? "animate-spin text-indigo-500" : ""
                  }`}
                />
                <span className="hidden sm:inline">
                  {isSyncing
                    ? syncProgress?.percent
                      ? `${isEn ? "Sync" : "Sinkron"} (${syncProgress.percent}%)`
                      : t.nav.syncing
                    : t.nav.refreshSync}
                </span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={handleToggleTheme}
                title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
                aria-label="Toggle theme"
                className="size-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-[#18181f] text-slate-700 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f5f5f5] border border-slate-200/80 dark:border-[#282834] shadow-2xs hover:bg-slate-200/70 dark:hover:bg-[#22222c] transition-all cursor-pointer shrink-0"
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

        <SpotlightTour
          isOpen={showSpotlightTour}
          onClose={() => setShowSpotlightTour(false)}
          userEmail={userProfile?.email}
        />
      </SidebarProvider>
    </ShellContext.Provider>
  );
};