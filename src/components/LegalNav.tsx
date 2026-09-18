"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sun, Moon, Shield, FileText } from "lucide-react";
import { toggleThemeWithCircularAnimation } from "@/lib/theme";

interface LegalNavProps {
  currentPage: "terms" | "privacy";
}

export function LegalNav({ currentPage }: LegalNavProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
      const observer = new MutationObserver(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    }
  }, []);

  const handleToggleTheme = (e: React.MouseEvent) => {
    const nextTheme = toggleThemeWithCircularAnimation(e);
    setIsDark(nextTheme === "dark");
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-[#222222] bg-white/90 dark:bg-[#0c0c0c]/90 backdrop-blur-md transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Back to Home */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-[#a3a3a3] dark:hover:text-[#f5f5f5] hover:bg-slate-100 dark:hover:bg-[#181818] transition-colors"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="text-xs font-medium hidden sm:inline">Beranda</span>
          </Link>

          <div className="h-4 w-px bg-slate-200 dark:bg-[#2b2b2b]" />

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src={isDark ? "/logos/Ionlearnnewfulltext-dark.png" : "/logos/Ionlearnnewfulltext.png"}
              alt="IOnLearn"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Tab switcher & Theme toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <nav className="flex items-center bg-slate-100 dark:bg-[#161616] p-1 rounded-xl border border-slate-200/60 dark:border-[#262626] text-xs font-medium">
            <Link
              href="/terms"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentPage === "terms"
                  ? "bg-white dark:bg-[#222222] text-slate-900 dark:text-[#f5f5f5] shadow-xs font-semibold"
                  : "text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f5f5f5]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ketentuan Layanan</span>
            </Link>
            <Link
              href="/privacy"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentPage === "privacy"
                  ? "bg-white dark:bg-[#222222] text-slate-900 dark:text-[#f5f5f5] shadow-xs font-semibold"
                  : "text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f5f5f5]"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Kebijakan Privasi</span>
            </Link>
          </nav>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={handleToggleTheme}
            title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            aria-label="Ganti Tema"
            className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 dark:text-[#a3a3a3] dark:hover:text-[#f5f5f5] bg-slate-100 hover:bg-slate-200/80 dark:bg-[#161616] dark:hover:bg-[#202020] border border-slate-200/60 dark:border-[#262626] flex items-center justify-center transition cursor-pointer shrink-0"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
