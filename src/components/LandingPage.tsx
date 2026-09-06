"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  CalendarSync,
  Brain,
  BookOpen,
  LayoutDashboard,
  AlertCircle,
  Sun,
  Moon,
  LogIn,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandText } from "@/lib/brand";
import { toggleThemeWithCircularAnimation } from "@/lib/theme";

interface LandingPageProps {
  onConnectGoogle: () => void;
  onDemoMode: () => void;
  loginError?: string | null;
  isAuthenticating?: boolean;
}

export function LandingPage({
  onConnectGoogle,
  onDemoMode,
  loginError,
  isAuthenticating,
}: LandingPageProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const handleToggleTheme = (e: React.MouseEvent) => {
    const nextTheme = toggleThemeWithCircularAnimation(e);
    setIsDark(nextTheme === "dark");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0c0c] text-slate-900 dark:text-[#f5f5f5] flex flex-col font-sans relative overflow-x-hidden">
      {/* Subtle organic Ubur Ubur background wave motif (calm, non-distracting) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
        <svg
          className="absolute top-0 right-0 w-[600px] h-[600px] -mr-32 -mt-24 text-[#818cf8]"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M35 85 C35 38 70 20 100 20 C130 20 165 38 165 85 C165 105 150 115 135 110 C120 105 110 115 100 115 C90 115 80 105 65 110 C50 115 35 105 35 85 Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M60 115 C55 140 65 160 58 185"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
          <path
            d="M85 117 C80 145 92 165 85 190"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M115 117 C120 145 108 165 115 190"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M140 115 C145 140 135 160 142 185"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
        </svg>
      </div>

      {/* Navbar */}
      <header className="px-5 sm:px-8 py-4 flex items-center justify-between border-b border-slate-200 dark:border-[#2b2b2b] bg-white/90 dark:bg-[#0c0c0c]/90 backdrop-blur-md sticky top-0 z-20 w-full">
        <a href="/" className="flex items-center gap-3">
          <img
            src={isDark ? "/logos/logoionlearnfulltext-dark.png" : "/logos/logoionlearnfulltext.png"}
            alt="IOnLearn"
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={handleToggleTheme}
            title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            className="w-9 h-9 rounded-[10px] text-slate-500 hover:text-slate-900 dark:text-[#a3a3a3] dark:hover:text-[#f5f5f5] bg-slate-100 hover:bg-slate-200 dark:bg-[#141414] dark:hover:bg-[#161616] border border-slate-200 dark:border-[#2b2b2b] flex items-center justify-center transition cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Mode Simulasi CTA */}
          <button
            type="button"
            onClick={onDemoMode}
            disabled={isAuthenticating}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-[#141414] dark:hover:bg-[#161616] text-slate-600 hover:text-slate-900 dark:text-[#a3a3a3] dark:hover:text-[#f5f5f5] border border-slate-200 dark:border-[#2b2b2b] hover:border-indigo-300 dark:hover:border-[#7dd3fc]/50 transition cursor-pointer disabled:opacity-50"
          >
            Mode Simulasi
          </button>

          {/* Masuk Google CTA */}
          <button
            type="button"
            onClick={onConnectGoogle}
            disabled={isAuthenticating}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-[10px] bg-slate-900 hover:bg-[#fbbf24] dark:bg-[#f5f5f5] dark:hover:bg-[#fbbf24] text-white dark:text-[#0c0c0c] transition cursor-pointer disabled:opacity-50 active:scale-95 shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{isAuthenticating ? "Menghubungkan..." : "Masuk Google"}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24 text-center max-w-4xl mx-auto w-full relative z-10">
        {/* Academic Purpose Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#141414] border border-slate-200 dark:border-[#2b2b2b] text-xs font-medium text-slate-500 dark:text-[#a3a3a3] mb-8">
          <img
            src="/logos/logoionlearnkecil.png"
            alt="IOnLearn"
            className="w-4 h-4 object-contain shrink-0"
          />
          <span>Platform Produktivitas Akademik Siswa & Mahasiswa</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-[#f5f5f5] leading-[1.18] mb-6">
          Sinkronkan Tugas Kelas, <br className="hidden sm:block" />
          <span className="text-[#818cf8]">Taklukkan dengan AI.</span>
        </h1>

        {/* Supporting Editorial Paragraph */}
        <p className="text-base sm:text-lg text-slate-500 dark:text-[#a3a3a3] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Platform produktivitas akademik yang terhubung langsung dengan Google
          Classroom Anda. Dapatkan kurasi sumber belajar, rekomendasi YouTube,
          dan tutor AI personal secara otomatis untuk setiap tugas.
        </p>

        {/* Login Error Notification */}
        {loginError && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-[#161616] border border-red-200 dark:border-rose-900/60 rounded-xl text-red-700 dark:text-rose-200 text-xs sm:text-sm max-w-lg mx-auto w-full flex items-start gap-3 text-left">
            <AlertCircle className="w-4 h-4 text-red-500 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold text-red-800 dark:text-rose-100 mb-0.5">
                Gagal Masuk Google
              </strong>
              {loginError}
            </div>
          </div>
        )}

        {/* Hero Actions (Primary & Secondary CTA) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          {/* Primary CTA */}
          <button
            type="button"
            onClick={onConnectGoogle}
            disabled={isAuthenticating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[10px] bg-slate-900 hover:bg-[#fbbf24] dark:bg-[#f5f5f5] dark:hover:bg-[#fbbf24] text-white dark:text-[#0c0c0c] font-semibold text-sm sm:text-base transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-95 shadow-xs group"
          >
            <span>
              {isAuthenticating
                ? "Menghubungkan ke Akun Google..."
                : "Masuk Google Classroom"}
            </span>
            {!isAuthenticating && (
              <ArrowRight className="w-4 h-4 text-white dark:text-[#0c0c0c] group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>

          {/* Secondary CTA */}
          <button
            type="button"
            onClick={onDemoMode}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-[#141414] dark:hover:bg-[#161616] border border-slate-200 dark:border-[#2b2b2b] hover:border-indigo-300 dark:hover:border-[#7dd3fc]/50 text-slate-700 hover:text-slate-900 dark:text-[#e5e5e5] dark:hover:text-[#f5f5f5] font-semibold text-sm sm:text-base transition-all duration-150 cursor-pointer active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4 text-[#7dd3fc]" />
            <span>Coba Mode Simulasi</span>
          </button>
        </div>

        {/* Academic Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-20 text-left w-full">
          {/* Card 1: Sinkronisasi Otomatis */}
          <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#2b2b2b] flex flex-col justify-between space-y-4 hover:border-[#7dd3fc]/40 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-[10px] bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#2b2b2b] flex items-center justify-center mb-4 text-[#7dd3fc]">
                <CalendarSync className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-slate-900 dark:text-[#f5f5f5] mb-2">
                Sinkronisasi Otomatis
              </h3>
              <p className="text-sm text-slate-500 dark:text-[#a3a3a3] leading-relaxed">
                Semua tugas, materi, dan tenggat waktu ditarik otomatis dari
                Google Classroom tanpa input manual yang melelahkan.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-[#2b2b2b]/80 flex items-center gap-1.5 text-xs text-[#7dd3fc] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7dd3fc]" />
              <span>Google Classroom API</span>
            </div>
          </div>

          {/* Card 2: Tutor AI Terpersonalisasi */}
          <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#2b2b2b] flex flex-col justify-between space-y-4 hover:border-[#a5b4fc]/40 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-[10px] bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#2b2b2b] flex items-center justify-center mb-4 text-[#a5b4fc]">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-slate-900 dark:text-[#f5f5f5] mb-2">
                Tutor AI Terpersonalisasi
              </h3>
              <p className="text-sm text-slate-500 dark:text-[#a3a3a3] leading-relaxed">
                AI beradaptasi dengan gaya belajarmu, membedah instruksi tugas yang
                rumit, dan menyusun panduan belajar langkah demi langkah.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-[#2b2b2b]/80 flex items-center gap-1.5 text-xs text-[#a5b4fc] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a5b4fc]" />
              <span>Adaptif & Sokratik</span>
            </div>
          </div>

          {/* Card 3: Kurasi Materi Instan */}
          <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#2b2b2b] flex flex-col justify-between space-y-4 hover:border-[#34d399]/40 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-[10px] bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#2b2b2b] flex items-center justify-center mb-4 text-[#34d399]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-slate-900 dark:text-[#f5f5f5] mb-2">
                Kurasi Materi Instan
              </h3>
              <p className="text-sm text-slate-500 dark:text-[#a3a3a3] leading-relaxed">
                Langsung dapatkan rekomendasi video YouTube terpercaya dan ringkasan
                bacaan berkualitas yang tepat sasaran untuk tiap tugas.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-[#2b2b2b]/80 flex items-center gap-1.5 text-xs text-[#34d399] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
              <span>Video & Referensi Terpercaya</span>
            </div>
          </div>
        </div>

        {/* Human Academic Note */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-[#2b2b2b]/80 w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-[#737373]">
          <div className="flex items-center gap-2">
            <img
              src="/logos/logoionlearnkecil.png"
              alt="IOnLearn"
              className="h-4 w-auto object-contain"
            />
            <span>IOnLearn • Asisten Belajar Mandiri & Terstruktur</span>
          </div>
          <span>Dirancang untuk kenyamanan belajar tanpa distraksi</span>
        </div>
      </main>
    </div>
  );
}
