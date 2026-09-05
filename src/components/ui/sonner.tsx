"use client";

import React, { useEffect, useState } from "react";
import { Toaster as SonnerToaster, ToasterProps } from "sonner";
import { X, CheckCircle2, Info, AlertTriangle, AlertCircle } from "lucide-react";

export interface CustomToasterProps extends Omit<ToasterProps, "theme"> {
  theme?: "light" | "dark" | "system";
}

export function Toaster({
  position: propPosition,
  ...props
}: CustomToasterProps) {
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  const [position, setPosition] = useState<any>(propPosition || "top-right");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setCurrentTheme(isDark ? "dark" : "light");
    };

    const loadPosition = () => {
      try {
        const saved = localStorage.getItem("classroom_ai_user_prefs_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.toastPosition) {
            setPosition(parsed.toastPosition);
            return;
          }
        }
      } catch (e) {}
      if (propPosition) setPosition(propPosition);
    };

    checkTheme();
    loadPosition();

    // Observe changes to html class for real-time theme synchronization
    const observer = new MutationObserver(() => {
      checkTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const handlePosChange = () => loadPosition();
    window.addEventListener("toast-position-changed", handlePosChange);
    window.addEventListener("storage", handlePosChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("toast-position-changed", handlePosChange);
      window.removeEventListener("storage", handlePosChange);
    };
  }, [propPosition]);

  return (
    <SonnerToaster
      theme={props.theme ?? currentTheme}
      position={position}
      closeButton={true}
      richColors={false}
      offset="20px"
      mobileOffset={{ top: "12px", bottom: "12px", left: "12px", right: "12px" }}
      gap={10}
      duration={5000}
      swipeDirections={["left", "right", "top", "bottom"]}
      className="toaster group font-sans"
      icons={{
        close: <X className="w-3.5 h-3.5" strokeWidth={2.2} />,
        success: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        info: <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />,
        warning: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
        error: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans rounded-2xl border shadow-xl text-xs sm:text-sm p-4 backdrop-blur-md transition-all " +
            "w-[calc(100vw-24px)] sm:w-[380px] max-w-full " +
            "bg-white/95 text-slate-900 border-slate-200/90 " +
            "dark:bg-[#151D2C]/95 dark:text-slate-100 dark:border-slate-800 dark:shadow-2xl",
          title: "font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug pr-7",
          description: "text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed pr-7",
          actionButton:
            "!bg-indigo-600 hover:!bg-indigo-700 !text-white !rounded-xl !text-xs !font-bold !px-3 !py-1.5 transition active:scale-95 shadow-xs cursor-pointer shrink-0 dark:!bg-slate-100 dark:!text-[#0f172a] dark:hover:!bg-white",
          cancelButton:
            "!bg-slate-100 hover:!bg-slate-200 !text-slate-700 dark:!bg-slate-800 dark:hover:!bg-slate-700 dark:!text-slate-200 dark:!border dark:!border-slate-700/60 !rounded-xl !text-xs !font-semibold !px-3 !py-1.5 transition cursor-pointer shrink-0",
          closeButton: "!rounded-lg !border !shadow-2xs cursor-pointer",
          success:
            "!bg-emerald-50/95 !border-emerald-200 !text-emerald-950 dark:!bg-emerald-950/80 dark:!border-emerald-800/80 dark:!text-emerald-100",
          error:
            "!bg-rose-50/95 !border-rose-200 !text-rose-950 dark:!bg-rose-950/80 dark:!border-rose-800/80 dark:!text-rose-100",
          warning:
            "!bg-amber-50/95 !border-amber-200 !text-amber-950 dark:!bg-amber-950/80 dark:!border-amber-800/80 dark:!text-amber-100",
          info:
            "!bg-indigo-50/95 !border-indigo-200 !text-indigo-950 dark:!bg-indigo-950/80 dark:!border-indigo-800/80 dark:!text-indigo-100",
        },
      }}
      {...props}
    />
  );
}

export { toast } from "sonner";
