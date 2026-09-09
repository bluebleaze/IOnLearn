"use client";
import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Sun,
  Moon,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { toggleThemeWithCircularAnimation } from "@/lib/theme";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { DemoInviteSection } from "@/components/DemoInviteSection";
import { WhyChooseUsSection } from "@/components/WhyChooseUsSection";
import { FAQSection } from "@/components/FAQSection";
import { CTABanner } from "@/components/CTABanner";
import { LandingFooter } from "@/components/LandingFooter";

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
            src="/logos/logoionlearnfulltext.png"
            alt="IOnLearn"
            className="h-8 sm:h-9 w-auto object-contain block dark:hidden"
          />
          <img
            src="/logos/logoionlearnfulltext-dark.png"
            alt="IOnLearn"
            className="h-8 sm:h-9 w-auto object-contain hidden dark:block"
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
            className="font-montserrat px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-[#141414] dark:hover:bg-[#161616] text-slate-600 hover:text-slate-900 dark:text-[#a3a3a3] dark:hover:text-[#f5f5f5] border border-slate-200 dark:border-[#2b2b2b] hover:border-indigo-300 dark:hover:border-[#7dd3fc]/50 transition cursor-pointer disabled:opacity-50"
          >
            Mode Simulasi
          </button>

          {/* Masuk Google CTA */}
          <button
            type="button"
            onClick={onConnectGoogle}
            disabled={isAuthenticating}
            className="font-montserrat inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-[10px] bg-slate-900 hover:bg-[#fbbf24] dark:bg-[#f5f5f5] dark:hover:bg-[#fbbf24] text-white dark:text-[#0c0c0c] transition cursor-pointer disabled:opacity-50 active:scale-95 shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{isAuthenticating ? "Menghubungkan..." : "Masuk Google"}</span>
          </button>
        </div>
      </header>

      {/* SECTION 1: 100VH HERO BANNER */}
      <section className="relative w-full min-h-[calc(100svh-68px)] flex flex-col items-center justify-center overflow-hidden">
        {/* Floating Decorative Elements (Puzzle Pieces, Stars, Sparkles) with Entrance Animation */}
        <div
          className="absolute inset-0 pointer-events-none select-none overflow-hidden max-w-[1440px] mx-auto z-0"
          aria-hidden="true"
        >
          {/* Left Floating Cluster */}
          {/* 1. Top-Left Blue Puzzle */}
          <img
            src="/assets/puzzle-blue.svg"
            alt="Puzzle Decor"
            className="animate-hero-decor animate-hero-float-1 absolute top-[8%] sm:top-[12%] lg:top-[14%] left-[-5%] sm:left-[1%] md:left-[3%] lg:left-[5%] xl:left-[7%] w-24 sm:w-32 md:w-40 lg:w-48 xl:w-52 h-auto object-contain drop-shadow-md dark:drop-shadow-[0_10px_25px_rgba(59,130,246,0.3)] transition-transform max-sm:opacity-75"
            style={{ "--rot": "-8deg" } as React.CSSProperties}
          />
          {/* 2. Top-Left Blue Sparkle */}
          <img
            src="/assets/sparkle-blue.svg"
            alt="Sparkle Decor"
            className="animate-hero-decor animate-hero-float-sparkle absolute top-[12%] sm:top-[15%] lg:top-[17%] left-[18%] sm:left-[20%] md:left-[22%] lg:left-[24%] w-6 sm:w-8 md:w-9 lg:w-11 h-auto object-contain drop-shadow-sm max-sm:opacity-85"
            style={{ "--rot": "-10deg" } as React.CSSProperties}
          />
          {/* 3. Mid-Left Red 5-Point Star (Depth Blur) */}
          <img
            src="/assets/star-red.svg"
            alt="Star Decor"
            className="animate-hero-decor animate-hero-float-2 absolute top-[44%] sm:top-[46%] lg:top-[48%] left-[4%] sm:left-[6%] md:left-[8%] lg:left-[10%] w-10 sm:w-12 md:w-15 lg:w-18 h-auto object-contain blur-[2px] sm:blur-[2.5px] opacity-90 dark:opacity-85"
            style={{ "--rot": "-12deg" } as React.CSSProperties}
          />
          {/* 4. Bottom-Left Lime-Green Soft Star (Soft Blur) */}
          <img
            src="/assets/star-lime.svg"
            alt="Star Decor"
            className="animate-hero-decor animate-hero-float-1 absolute top-[70%] sm:top-[72%] lg:top-[74%] left-[8%] sm:left-[11%] md:left-[13%] lg:left-[15%] w-12 sm:w-16 md:w-19 lg:w-22 h-auto object-contain blur-[1.5px] sm:blur-[2px] opacity-90 dark:opacity-85"
            style={{ "--rot": "14deg" } as React.CSSProperties}
          />

          {/* Right Floating Cluster */}
          {/* 5. Top-Right Lime-Green Soft Star (Soft Blur) */}
          <img
            src="/assets/star-lime.svg"
            alt="Star Decor"
            className="animate-hero-decor animate-hero-float-2 absolute top-[8%] sm:top-[10%] lg:top-[12%] right-[8%] sm:right-[11%] md:right-[13%] lg:right-[15%] w-11 sm:w-14 md:w-17 lg:w-20 h-auto object-contain blur-[1.5px] sm:blur-[2px] opacity-90 dark:opacity-85"
            style={{ "--rot": "-16deg" } as React.CSSProperties}
          />
          {/* 6. Mid-Right Blue Puzzle */}
          <img
            src="/assets/puzzle-blue.svg"
            alt="Puzzle Decor"
            className="animate-hero-decor animate-hero-float-1 absolute top-[30%] sm:top-[32%] lg:top-[34%] right-[-5%] sm:right-[1%] md:right-[3%] lg:right-[5%] xl:right-[7%] w-24 sm:w-30 md:w-38 lg:w-46 xl:w-50 h-auto object-contain drop-shadow-md dark:drop-shadow-[0_10px_25px_rgba(59,130,246,0.3)] transition-transform max-sm:opacity-75"
            style={{ "--rot": "18deg" } as React.CSSProperties}
          />
          {/* 7. Mid-Right Blue Sparkle */}
          <img
            src="/assets/sparkle-blue.svg"
            alt="Sparkle Decor"
            className="animate-hero-decor animate-hero-float-sparkle absolute top-[52%] sm:top-[54%] lg:top-[56%] right-[17%] sm:right-[19%] md:right-[21%] lg:right-[23%] w-5 sm:w-7 md:w-8 lg:w-10 h-auto object-contain drop-shadow-sm max-sm:opacity-85"
            style={{ "--rot": "12deg" } as React.CSSProperties}
          />
          {/* 8. Bottom-Right Red Star (Depth Blur) */}
          <img
            src="/assets/star-red.svg"
            alt="Star Decor"
            className="animate-hero-decor animate-hero-float-2 absolute top-[70%] sm:top-[72%] lg:top-[74%] right-[6%] sm:right-[8%] md:right-[10%] lg:right-[12%] w-10 sm:w-12 md:w-15 lg:w-18 h-auto object-contain blur-[2px] sm:blur-[2.5px] opacity-90 dark:opacity-85"
            style={{ "--rot": "15deg" } as React.CSSProperties}
          />
        </div>

        {/* Hero Main Content (Centered in 100vh Banner) */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center max-w-4xl mx-auto w-full relative z-10 font-inter py-12 sm:py-16">
          {/* Hero Brand Logo Title with Pop Entrance */}
          <h1 className="animate-hero-logo mb-6 sm:mb-8 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform duration-300">
            <span className="sr-only">IOnLearn - Sinkronkan Tugas Kelas, Taklukkan dengan AI</span>
            {/* Light Mode Logo */}
            <img
              src="/logos/logoionlearnfulltext.png"
              alt="IOnLearn"
              className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain block dark:hidden drop-shadow-sm select-none"
            />
            {/* Dark Mode Logo */}
            <img
              src="/logos/logoionlearnfulltext-dark.png"
              alt="IOnLearn"
              className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain hidden dark:block drop-shadow-sm select-none"
            />
          </h1>

          {/* Hero Tagline with Fade-Up Entrance */}
          <p className="animate-hero-tagline font-cal text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-[#f5f5f5] max-w-2xl mx-auto mb-10 leading-snug">
            a perfect place for you <br className="hidden sm:block" />
            to study
          </p>

          {loginError && (
            <div className="font-inter mb-8 p-4 bg-red-50 dark:bg-[#161616] border border-red-200 dark:border-rose-900/60 rounded-xl text-red-700 dark:text-rose-200 text-xs sm:text-sm max-w-lg mx-auto w-full flex items-start gap-3 text-left animate-in fade-in duration-300">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-red-800 dark:text-rose-100 mb-0.5 font-montserrat">
                  Gagal Masuk Google
                </strong>
                {loginError}
              </div>
            </div>
          )}

          {/* Hero Actions (Demo Mode & Sync Now) with Bounce-Up Entrance */}
          <div className="animate-hero-btn font-montserrat flex flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            {/* Demo Mode Button (Secondary) */}
            <button
              type="button"
              onClick={onDemoMode}
              className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-2xl bg-white dark:bg-[#121212] border border-slate-300 dark:border-[#333333] hover:border-slate-400 dark:hover:border-[#555555] text-slate-800 hover:text-slate-900 dark:text-[#e5e5e5] dark:hover:text-white font-medium text-sm sm:text-base transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs hover:shadow-sm"
            >
              Demo Mode
            </button>

            {/* Sync Now Button (Primary) */}
            <button
              type="button"
              onClick={onConnectGoogle}
              disabled={isAuthenticating}
              className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-2xl bg-[#4b43c6] hover:bg-[#3e36b8] dark:bg-[#5b52e0] dark:hover:bg-[#4d44d0] text-white font-medium text-sm sm:text-base transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-95 shadow-sm hover:shadow-md hover:scale-[1.02]"
            >
              {isAuthenticating ? "Menghubungkan..." : "Sync Now"}
            </button>
          </div>
        </main>

        {/* Interactive Scroll Down Indicator Cue */}
        <a
          href="#about-platform"
          className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-slate-400 hover:text-[#4b43c6] dark:text-zinc-500 dark:hover:text-indigo-400 transition-all duration-200 cursor-pointer group select-none"
          title="Gulir ke bawah untuk melihat fitur"
        >
          <span className="text-[10px] font-montserrat font-semibold tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
            Scroll
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </a>
      </section>

      {/* SECTION 2: ABOUT OUR PLATFORM */}
      <section id="about-platform" className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 text-center scroll-mt-20">
        <span className="font-montserrat text-xs sm:text-sm font-bold text-[#4f46e5] dark:text-[#818cf8] tracking-wider lowercase mb-2 inline-block">
          about our platform
        </span>

        <h2 className="font-cal text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-[#f5f5f5] uppercase mb-2">
          WHAT IS IONLEARN?
        </h2>

        <h3 className="font-montserrat text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-[#f5f5f5] mb-6">
          About IOnLearn Itself
        </h3>

        <p className="font-inter text-sm sm:text-base md:text-[17px] text-slate-600 dark:text-[#a3a3a3] leading-relaxed max-w-3xl mx-auto font-normal text-center">
          IonLearn is an innovative, low-data learning platform designed to make quality education accessible for everyone, especially students in regions with limited internet connectivity. By converting heavy study materials and complex documents into lightweight AI-generated summaries, interactive flashcards, and quick quizzes, IonLearn breaks down digital barriers and optimizes bandwidth usage without sacrificing learning quality. Aligned with UN Sustainable Development Goal 4 (Quality Education), IonLearn empowers students to study smarter, save data, and master key concepts effortlessly on any device.
        </p>
      </section>

      {/* SECTION 3: INTERACTIVE FEATURE SHOWCASE */}
      <FeatureShowcase />

      {/* SECTION 4: DEMO INVITATION (OH! Still Not Sure Whether to Try It or Not?) */}
      <DemoInviteSection onDemoMode={onDemoMode} />

      {/* SECTION 5: WHY CHOOSE US (Bento Grid) */}
      <WhyChooseUsSection />

      {/* SECTION 6: FREQUENTLY ASKED QUESTIONS */}
      <FAQSection />

      {/* SECTION 7: CTA BANNER */}
      <CTABanner onConnectGoogle={onConnectGoogle} />

      {/* SECTION 8: MODERN MULTI-COLUMN FOOTER */}
      <LandingFooter onConnectGoogle={onConnectGoogle} />
    </div>
  );
}
