"use client";

import React, { useEffect, useState } from "react";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { useRouter } from "next/navigation";
import { ClassroomService } from "@/services/classroomService";
import { setOnboardingCompleted, setSpotlightPending } from "@/lib/taskStore";

export default function OnboardingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = ClassroomService.getStoredToken();
    if (!token) {
      router.replace("/");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleComplete = () => {
    const profile = ClassroomService.getUserProfile();
    setOnboardingCompleted(true, profile?.email);
    setSpotlightPending(true, profile?.email);
    window.location.href = "/dashboard";
  };

  const handleSkip = () => {
    const profile = ClassroomService.getUserProfile();
    setOnboardingCompleted(true, profile?.email);
    setSpotlightPending(true, profile?.email);
    window.location.href = "/dashboard";
  };

  if (isAuthenticated === null) {
    return null; // Don't flash onboarding while checking authentication
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#09090b] flex flex-col justify-center items-center">
      <OnboardingFlow onComplete={handleComplete} onSkip={handleSkip} />
    </div>
  );
}
