"use client";

import { useEffect, useState } from "react";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";
import { ToastPosition } from "@/types";
import { loadPreferences } from "@/lib/taskStore";

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [position, setPosition] = useState<ToastPosition>("top-right");

  useEffect(() => {
    // 1. Initial theme check
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    // 2. Observe html class changes (for theme switching)
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark");
      setTheme(dark ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // 3. Initial toast position from user preferences
    const updatePosition = (e?: Event) => {
      const customEvent = e as CustomEvent<{ position?: ToastPosition }>;
      if (customEvent?.detail?.position) {
        setPosition(customEvent.detail.position);
        return;
      }
      const prefs = loadPreferences();
      if (prefs?.toastPosition) {
        setPosition(prefs.toastPosition);
      }
    };
    updatePosition();

    // 4. Listen for toast position change events
    window.addEventListener("toast-position-changed", updatePosition as EventListener);

    return () => {
      observer.disconnect();
      window.removeEventListener("toast-position-changed", updatePosition as EventListener);
    };
  }, []);

  return (
    <Sonner
      theme={theme}
      position={position}
      closeButton
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-[#34d399]" />,
        info: <InfoIcon className="size-4 text-[#7dd3fc]" />,
        warning: <TriangleAlertIcon className="size-4 text-[#fbbf24]" />,
        error: <OctagonXIcon className="size-4 text-[#f87171]" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!bg-white !border !border-slate-200 !text-slate-800 shadow-md font-sans dark:!bg-[#161616] dark:!border-[#2b2b2b] dark:!text-[#f5f5f5] px-4 py-3 rounded-2xl",
          description: "!text-slate-500 dark:!text-[#a3a3a3]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };