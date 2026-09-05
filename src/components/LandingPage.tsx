"use client";
import React, { useState, useEffect } from "react";
import {
  GraduationCap,
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
    <div className="min-h-screen bg-[#0B0F17] text-[#F1F0EC] flex flex-col font-sans relative selection:bg-[#9294E8] selection:text-[#0B0F17] overflow-x-hidden">
      {/* Subtle organic Ubur Ubur background wave motif (calm, non-distracting) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
        <svg
          className="absolute top-0 right-0 w-[600px] h-[600px] -mr-32 -mt-24 text-[#9294E8]"
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
      <header className="px-5 sm:px-8 py-4 flex items-center justify-between border-b border-[#252F42] bg-[#0B0F17]/90 backdrop-blur-md sticky top-0 z-20 w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#9294E8] rounded-[10px] flex items-center justify-center text-[#0B0F17] shadow-xs shrink-0">
            <GraduationCap className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="font-heading text-lg font-bold tracking-tight text-[#F1F0EC]">
            <BrandText />
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={handleToggleTheme}
            title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            className="w-9 h-9 rounded-[10px] text-[#9AA6B8] hover:text-[#F1F0EC] bg-[#121927] hover:bg-[#161F30] border border-[#252F42] flex items-center justify-center transition cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#E8DFC8]" />
            ) : (
              <Moon className="w-4 h-4 text-[#9294E8]" />
            )}
          </button>

          {/* Mode Simulasi CTA */}
          <button
            type="button"
            onClick={onDemoMode}
            disabled={isAuthenticating}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium rounded-[10px] bg-[#121927] hover:bg-[#161F30] text-[#9AA6B8] hover:text-[#F1F0EC] border border-[#252F42] hover:border-[#8FAFCB]/50 transition cursor-pointer disabled:opacity-50"
          >
            Mode Simulasi
          </button>

          {/* Masuk Google CTA */}
          <button
            type="button"
            onClick={onConnectGoogle}
            disabled={isAuthenticating}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-[10px] bg-[#F1F0EC] hover:bg-[#E8DFC8] text-[#0B0F17] transition cursor-pointer disabled:opacity-50 active:scale-95 shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{isAuthenticating ? "Menghubungkan..." : "Masuk Google"}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24 text-center max-w-4xl mx-auto w-full relative z-10">
        {/* Academic Purpose Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121927] border border-[#252F42] text-xs font-medium text-[#9AA6B8] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#91C9B5]" />
          <span>Platform Produktivitas Akademik Siswa & Mahasiswa</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F1F0EC] leading-[1.18] mb-6">
          Sinkronkan Tugas Kelas, <br className="hidden sm:block" />
          <span className="text-[#9294E8]">Taklukkan dengan AI.</span>
        </h1>

        {/* Supporting Editorial Paragraph */}
        <p className="text-base sm:text-lg text-[#9AA6B8] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Platform produktivitas akademik yang terhubung langsung dengan Google
          Classroom Anda. Dapatkan kurasi sumber belajar, rekomendasi YouTube,
          dan tutor AI personal secara otomatis untuk setiap tugas.
        </p>

        {/* Login Error Notification */}
        {loginError && (
          <div className="mb-8 p-4 bg-[#161F30] border border-rose-900/60 rounded-xl text-rose-200 text-xs sm:text-sm max-w-lg mx-auto w-full flex items-start gap-3 text-left">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold text-rose-100 mb-0.5">
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[10px] bg-[#F1F0EC] hover:bg-[#E8DFC8] text-[#0B0F17] font-semibold text-sm sm:text-base transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-95 shadow-xs group"
          >
            <span>
              {isAuthenticating
                ? "Menghubungkan ke Akun Google..."
                : "Masuk Google Classroom"}
            </span>
            {!isAuthenticating && (
              <ArrowRight className="w-4 h-4 text-[#0B0F17] group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>

          {/* Secondary CTA */}
          <button
            type="button"
            onClick={onDemoMode}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[10px] bg-[#121927] hover:bg-[#161F30] border border-[#252F42] hover:border-[#8FAFCB]/50 text-[#D8DCE5] hover:text-[#F1F0EC] font-semibold text-sm sm:text-base transition-all duration-150 cursor-pointer active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4 text-[#8FAFCB]" />
            <span>Coba Mode Simulasi</span>
          </button>
        </div>

        {/* Academic Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-20 text-left w-full">
          {/* Card 1: Sinkronisasi Otomatis */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#161F30] border border-[#252F42] flex flex-col justify-between space-y-4 hover:border-[#8FAFCB]/40 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-[10px] bg-[#121927] border border-[#252F42] flex items-center justify-center mb-4 text-[#8FAFCB]">
                <CalendarSync className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-[#F1F0EC] mb-2">
                Sinkronisasi Otomatis
              </h3>
              <p className="text-sm text-[#9AA6B8] leading-relaxed">
                Semua tugas, materi, dan tenggat waktu ditarik otomatis dari
                Google Classroom tanpa input manual yang melelahkan.
              </p>
            </div>
            <div className="pt-3 border-t border-[#252F42]/80 flex items-center gap-1.5 text-xs text-[#8FAFCB] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FAFCB]" />
              <span>Google Classroom API</span>
            </div>
          </div>

          {/* Card 2: Tutor AI Terpersonalisasi */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#161F30] border border-[#252F42] flex flex-col justify-between space-y-4 hover:border-[#B0B1F2]/40 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-[10px] bg-[#121927] border border-[#252F42] flex items-center justify-center mb-4 text-[#B0B1F2]">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-[#F1F0EC] mb-2">
                Tutor AI Terpersonalisasi
              </h3>
              <p className="text-sm text-[#9AA6B8] leading-relaxed">
                AI beradaptasi dengan gaya belajarmu, membedah instruksi tugas yang
                rumit, dan menyusun panduan belajar langkah demi langkah.
              </p>
            </div>
            <div className="pt-3 border-t border-[#252F42]/80 flex items-center gap-1.5 text-xs text-[#B0B1F2] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B0B1F2]" />
              <span>Adaptif & Sokratik</span>
            </div>
          </div>

          {/* Card 3: Kurasi Materi Instan */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#161F30] border border-[#252F42] flex flex-col justify-between space-y-4 hover:border-[#91C9B5]/40 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-[10px] bg-[#121927] border border-[#252F42] flex items-center justify-center mb-4 text-[#91C9B5]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-[#F1F0EC] mb-2">
                Kurasi Materi Instan
              </h3>
              <p className="text-sm text-[#9AA6B8] leading-relaxed">
                Langsung dapatkan rekomendasi video YouTube terpercaya dan ringkasan
                bacaan berkualitas yang tepat sasaran untuk tiap tugas.
              </p>
            </div>
            <div className="pt-3 border-t border-[#252F42]/80 flex items-center gap-1.5 text-xs text-[#91C9B5] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#91C9B5]" />
              <span>Video & Referensi Terpercaya</span>
            </div>
          </div>
        </div>

        {/* Human Academic Note */}
        <div className="mt-16 pt-8 border-t border-[#252F42]/80 w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#69758A]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9294E8]" />
            <span>Ubur Ubur • Asisten Belajar Mandiri & Terstruktur</span>
          </div>
          <span>Dirancang untuk kenyamanan belajar tanpa distraksi</span>
        </div>
      </main>
    </div>
  );
}
