"use client";

import React from "react";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push("/");
  };

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#09090b] flex flex-col justify-center items-center">
      <OnboardingFlow onComplete={handleComplete} onSkip={handleSkip} />
    </div>
  );
}
