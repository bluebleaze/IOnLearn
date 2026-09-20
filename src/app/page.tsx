"use client";

import React, { useState, useEffect } from "react";
import { LandingPage } from "@/components/LandingPage";
import { useRouter } from "next/navigation";
import { ClassroomService } from "@/services/classroomService";
import { DBService } from "@/services/dbService";
import { SyncManager } from "@/services/syncManager";
import {
  TASKS_STORAGE_KEY,
  TODOS_STORAGE_KEY,
  NOTES_STORAGE_KEY,
  PREFS_STORAGE_KEY,
  ONBOARDING_DONE_KEY,
  isOnboardingCompleted,
  setOnboardingCompleted,
  isSpotlightTourCompleted,
  setSpotlightTourCompleted,
  setSpotlightPending,
  persist,
} from "@/lib/taskStore";
import { TodoTask } from "@/types";

export default function RootHomePage() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = ClassroomService.getStoredToken();
    if (token) {
      const profile = ClassroomService.getUserProfile();
      const targetUrl = !isOnboardingCompleted(profile?.email)
        ? "/onboarding"
        : "/dashboard";
      window.location.href = targetUrl;
    } else {
      setCheckingAuth(false);
    }
  }, []);

  if (checkingAuth) {
    return null; // Prevents flashing landing page when already authenticated
  }

  const handleConnectGoogle = async () => {
    if (isAuthenticating) return;
    setLoginError(null);
    setIsAuthenticating(true);
    try {
      const result = await ClassroomService.requestToken();
      if (result) {
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
          const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 500));
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

        // Run sync in background so login redirect is instantaneous
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

  const handleDemoMode = () => {
    localStorage.setItem("classroom_access_token", "DEMO_TOKEN");
    localStorage.setItem(
      "classroom_token_expiry",
      (Date.now() + 365 * 24 * 3600 * 1000).toString()
    );
    const demoProfile = {
      name: "Pelajar Simulasi",
      email: "pelajar@contoh.com",
      picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pelajar",
    };
    localStorage.setItem(
      "classroom_user_profile",
      JSON.stringify(demoProfile)
    );
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

  return (
    <LandingPage
      onConnectGoogle={handleConnectGoogle}
      onDemoMode={handleDemoMode}
      loginError={loginError}
      isAuthenticating={isAuthenticating}
      isLoggedIn={false}
    />
  );
}