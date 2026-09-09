"use client";

import React from "react";
import { LandingPage } from "@/components/LandingPage";
import { useRouter } from "next/navigation";

export default function LandingPageRoute() {
  const router = useRouter();

  const handleConnectGoogle = () => {
    // Redirect or trigger connection
    router.push("/");
  };

  const handleDemoMode = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("classroom_access_token", "DEMO_TOKEN");
    }
    router.push("/");
  };

  return (
    <LandingPage
      onConnectGoogle={handleConnectGoogle}
      onDemoMode={handleDemoMode}
    />
  );
}
