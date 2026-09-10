"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Lenis from "lenis";
import {
  AlertCircle,
  Sun,
  Moon,
  LogIn,
  ChevronDown,
  MonitorPlay,
  ArrowUpRight,
} from "lucide-react";
import { toggleThemeWithCircularAnimation } from "@/lib/theme";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { DemoInviteSection } from "@/components/DemoInviteSection";
import { WhyChooseUsSection } from "@/components/WhyChooseUsSection";
import { FAQSection } from "@/components/FAQSection";
import { CTABanner } from "@/components/CTABanner";
import { LandingFooter } from "@/components/LandingFooter";

type Language = "ENG" | "IND";

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
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("ENG");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroParallax, setHeroParallax] = useState(0);
  const [heroScale, setHeroScale] = useState(1);
  const [aboutDrift, setAboutDrift] = useState(0);
  const [heroPointer, setHeroPointer] = useState({ x: 0, y: 0, active: false });
  const languageMenuRef = useRef<HTMLDivElement | null>(null);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const aboutSectionRef = useRef<HTMLElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const uiText = {
    nav: {
      home: selectedLanguage === "IND" ? "Home" : "Home",
      features: selectedLanguage === "IND" ? "Fitur" : "Features",
      demo: selectedLanguage === "IND" ? "Demo" : "Demo",
      qna: selectedLanguage === "IND" ? "QnA" : "QnA",
    },
    hero: {
      tagline: selectedLanguage === "IND" ? "tempat belajar yang tepat\nuntukmu" : "a perfect place for you\nto study",
      demoButton: selectedLanguage === "IND" ? "Mode Demo" : "Demo Mode",
      syncButton: selectedLanguage === "IND" ? "Sinkron Sekarang" : "Sync Now",
      loading: selectedLanguage === "IND" ? "Menghubungkan..." : "Connecting...",
      signIn: selectedLanguage === "IND" ? "Masuk Google" : "Sign in with Google",
      simulation: selectedLanguage === "IND" ? "Mode Simulasi" : "Simulation Mode",
      scroll: selectedLanguage === "IND" ? "Gulir" : "Scroll",
      loginErrorTitle: selectedLanguage === "IND" ? "Gagal Masuk Google" : "Google Sign-In Failed",
    },
    sections: {
      aboutEyebrow: selectedLanguage === "IND" ? "tentang platform kami" : "about our platform",
      aboutTitle: selectedLanguage === "IND" ? "APA ITU IONLEARN?" : "WHAT IS IONLEARN?",
      aboutSubtitle: selectedLanguage === "IND" ? "Tentang IOnLearn" : "About IOnLearn Itself",
      aboutDescription:
        selectedLanguage === "IND"
          ? "IonLearn adalah platform pembelajaran inovatif berdata rendah yang dirancang untuk membuat pendidikan berkualitas lebih mudah diakses bagi semua orang, terutama mahasiswa di wilayah dengan koneksi internet terbatas. Dengan mengubah materi belajar yang berat dan dokumen kompleks menjadi ringkasan AI yang ringan, flashcard interaktif, dan kuis cepat, IonLearn memecah hambatan digital dan mengoptimalkan penggunaan bandwidth tanpa mengorbankan kualitas belajar. Selaras dengan Tujuan Pembangunan Berkelanjutan ke-4 (Pendidikan Berkualitas), IonLearn memberdayakan siswa untuk belajar lebih cerdas, menghemat data, dan menguasai konsep inti dengan mudah di perangkat apa pun."
          : "IonLearn is an innovative, low-data learning platform designed to make quality education accessible for everyone, especially students in regions with limited internet connectivity. By converting heavy study materials and complex documents into lightweight AI-generated summaries, interactive flashcards, and quick quizzes, IonLearn breaks down digital barriers and optimizes bandwidth usage without sacrificing learning quality. Aligned with UN Sustainable Development Goal 4 (Quality Education), IonLearn empowers students to study smarter, save data, and master key concepts effortlessly on any device.",
    },
    footer: {
      quickNavigation: selectedLanguage === "IND" ? "Navigasi Cepat" : "Quick Navigation",
      connection: selectedLanguage === "IND" ? "Koneksi" : "Connection",
      legals: selectedLanguage === "IND" ? "Legal" : "Legals",
      home: selectedLanguage === "IND" ? "Beranda" : "Home",
      features: selectedLanguage === "IND" ? "Fitur" : "Features",
      demo: selectedLanguage === "IND" ? "Demo Interaktif" : "Interactive Demo",
      faq: selectedLanguage === "IND" ? "FAQ" : "FAQ",
      startNow: selectedLanguage === "IND" ? "Mulai Sekarang" : "Start Now",
      quote: selectedLanguage === "IND" ? "Belajar Lebih Cerdas, kuasai materi dengan mudah" : "Study Smarter, master any subject effortlessly",
      copyright: selectedLanguage === "IND" ? "© 2026 IonLearn. Semua hak dilindungi." : "© 2026 IonLearn. All rights reserved.",
      terms: selectedLanguage === "IND" ? "Syarat" : "Terms",
      privacy: selectedLanguage === "IND" ? "Kebijakan Privasi" : "Privacy Policy",
      github: selectedLanguage === "IND" ? "Kode Sumber - GitHub" : "Source Code - GitHub",
    },
    cta: {
      title: selectedLanguage === "IND" ? "Siap Memulai Pengalaman Baru?" : "Ready to Start Your New Experience?",
      description:
        selectedLanguage === "IND"
          ? "Mulai perjalanan belajar Anda dengan pengalaman yang lebih ringkas, lebih cepat, dan lebih terarah."
          : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut a mollis turpis. Mauris hendrerit laoreet arcu, in hendrerit enim vestibulum ut.",
      button: selectedLanguage === "IND" ? "Mulai Sekarang" : "Start Now",
    },
  };

  const updateHeroParallax = useCallback(() => {
    const heroElement = heroSectionRef.current;
    if (heroElement) {
      const rect = heroElement.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const sectionCenter = rect.top + rect.height / 2;
      const relativeOffset = viewportCenter - sectionCenter;
      const normalized = Math.max(-1, Math.min(1, relativeOffset / (window.innerHeight * 0.9)));
      const cinematicLift = normalized * 140;
      const cinematicScale = 1 + Math.abs(normalized) * 0.06;

      setHeroParallax(cinematicLift);
      setHeroScale(cinematicScale);
    }

    const aboutElement = aboutSectionRef.current;
    if (aboutElement) {
      const aboutRect = aboutElement.getBoundingClientRect();
      const aboutDistance = window.innerHeight * 0.68 - aboutRect.top;
      const aboutProgress = Math.max(0, Math.min(1, aboutDistance / (window.innerHeight * 0.95)));
      setAboutDrift(aboutProgress);
    }
  }, []);

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.8,
      infinite: false,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Sync scroll event with navbar and parallax calculations
    const onLenisScroll = (e: { scroll: number }) => {
      setIsScrolled(e.scroll > 12);
      updateHeroParallax();
    };

    lenis.on("scroll", onLenisScroll);
    document.documentElement.classList.add("lenis");

    // Intercept smooth anchor navigation across the landing page
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(href, {
            offset: -70,
            duration: 1.2,
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    // Run initial scroll update
    updateHeroParallax();

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleAnchorClick);
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove("lenis");
    };
  }, [updateHeroParallax]);

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

  useEffect(() => {
    const revealSections = document.querySelectorAll("[data-reveal]");
    if (!revealSections.length) return;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -2% 0px",
      }
    );

    revealSections.forEach((section) => revealObserver.observe(section));

    return () => revealObserver.disconnect();
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateHeroParallax);
    return () => {
      window.removeEventListener("resize", updateHeroParallax);
    };
  }, [updateHeroParallax]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleTheme = (e: React.MouseEvent) => {
    const nextTheme = toggleThemeWithCircularAnimation(e);
    setIsDark(nextTheme === "dark");
  };

  const handleHeroPointerMove = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    setHeroPointer({
      x: (px - 0.5) * 2,
      y: (py - 0.5) * 2,
      active: true,
    });
  };

  const handleHeroPointerLeave = () => {
    setHeroPointer({ x: 0, y: 0, active: false });
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
      <header
        className={`fixed left-1/2 top-0 z-30 w-[calc(100%-2rem)] -translate-x-1/2 transition-all duration-300 ease-out ${isScrolled
          ? "mt-3 max-w-6xl rounded-[30px] border border-white/60 bg-white/50 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-[50px] dark:border-white/10 dark:bg-[#0c0c0c]/50"
          : "mt-0 max-w-none rounded-none border-b border-slate-200/70 bg-white/50 dark:border-[#2b2b2b] dark:bg-[#0c0c0c]/50 backdrop-blur-[50px]"
          }`}
      >
        <div className={`mx-auto flex items-center gap-4 px-5 sm:px-8 transition-all duration-300 ease-out ${isScrolled ? "max-w-6xl py-2.5" : "max-w-6xl py-3.5"}`}>
          <div className="flex items-center gap-3 shrink-0">
            <a href="#home" className="flex items-center gap-3">
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

            <div ref={languageMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsLanguageMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-100 px-2.5 py-2 text-slate-600 transition hover:bg-slate-200 dark:border-[#2b2b2b] dark:bg-[#141414] dark:text-[#a3a3a3] dark:hover:bg-[#161616]"
                aria-expanded={isLanguageMenuOpen}
                aria-label="Pilih bahasa"
              >
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <span>{selectedLanguage === "IND" ? "🇮🇩" : "🇬🇧"}</span>
                  <span>{selectedLanguage}</span>
                </span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isLanguageMenuOpen ? "rotate-180" : "rotate-0"}`} />
              </button>

              {isLanguageMenuOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 min-w-[160px] overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm dark:border-[#2b2b2b] dark:bg-[#141414]">
                  {[
                    { code: "IND", flag: "🇮🇩", label: "Indonesia" },
                    { code: "ENG", flag: "🇬🇧", label: "English" },
                  ].map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(language.code as "ENG" | "IND");
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium transition ${selectedLanguage === language.code
                        ? "bg-slate-100 text-slate-900 dark:bg-[#1d1d1d] dark:text-white"
                        : "text-slate-600 hover:bg-slate-50 dark:text-[#c8c8c8] dark:hover:bg-[#1b1b1b]"
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{language.flag}</span>
                        <span>{language.code}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-[#888]">{language.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex items-center justify-center gap-2 sm:gap-3">
              {[
                { label: uiText.nav.home, href: "#home" },
                { label: uiText.nav.features, href: "#features" },
                { label: uiText.nav.demo, href: "#demo" },
                { label: uiText.nav.qna, href: "#faq" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-2 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-[#b8b8b8] dark:hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
            <div className="group relative flex items-center justify-center">
              <button
                type="button"
                onClick={onDemoMode}
                disabled={isAuthenticating}
                title="Mode Simulasi"
                className="group/button flex items-center justify-center gap-0 overflow-hidden rounded-[10px] border border-slate-200 bg-slate-100 px-2.5 py-2 text-slate-600 transition-all duration-300 ease-out hover:bg-slate-200 hover:px-3 dark:border-[#2b2b2b] dark:bg-[#141414] dark:text-[#a3a3a3] dark:hover:bg-[#161616] dark:hover:text-[#f5f5f5] disabled:opacity-50 cursor-pointer"
              >
                <MonitorPlay className="h-4 w-4 shrink-0" />
                <span className="max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-medium opacity-0 transition-all duration-300 ease-out group-hover/button:max-w-[110px] group-hover/button:opacity-100 group-hover/button:ml-1.5">
                  {uiText.hero.simulation}
                </span>
              </button>
            </div>

            {/* Masuk Google CTA */}
            <button
              type="button"
              onClick={onConnectGoogle}
              disabled={isAuthenticating}
              className="font-montserrat inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-[10px] bg-slate-900 hover:bg-[#fbbf24] dark:bg-[#f5f5f5] dark:hover:bg-[#fbbf24] text-white dark:text-[#0c0c0c] transition cursor-pointer disabled:opacity-50 active:scale-95 shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isAuthenticating ? uiText.hero.loading : uiText.hero.signIn}</span>
            </button>
          </div>
        </div>
      </header>

      {/* SECTION 1: 100VH HERO BANNER */}
      <section
        id="home"
        ref={heroSectionRef}
        data-scroll-section="home"
        onMouseMove={handleHeroPointerMove}
        onMouseLeave={handleHeroPointerLeave}
        className="landing-scroll-section relative w-full min-h-[calc(100svh-68px)] pt-[90px] sm:pt-[100px] flex flex-col items-center justify-center overflow-hidden scroll-mt-24"
      >
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
            style={{
              "--rot": "-8deg",
              "--scroll-lift": `${-heroParallax * 0.8}px`,
              "--tx": `${-Math.min(120, aboutDrift * 180)}px`,
              "--hover-shift-x": `${heroPointer.active ? heroPointer.x * -14 : 0}px`,
              "--hover-shift-y": `${heroPointer.active ? heroPointer.y * -10 : 0}px`,
              opacity: `${1 - aboutDrift * 0.85}`,
            } as React.CSSProperties}
          />
          {/* 2. Top-Left Blue Sparkle */}
          <img
            src="/assets/sparkle-blue.svg"
            alt="Sparkle Decor"
            className="animate-hero-decor animate-hero-float-sparkle absolute top-[12%] sm:top-[15%] lg:top-[17%] left-[18%] sm:left-[20%] md:left-[22%] lg:left-[24%] w-6 sm:w-8 md:w-9 lg:w-11 h-auto object-contain drop-shadow-sm max-sm:opacity-85"
            style={{
              "--rot": "-10deg",
              "--scroll-lift": `${-heroParallax * 0.95}px`,
              "--tx": `${-Math.min(140, aboutDrift * 220)}px`,
              "--hover-shift-x": `${heroPointer.active ? heroPointer.x * -18 : 0}px`,
              "--hover-shift-y": `${heroPointer.active ? heroPointer.y * -12 : 0}px`,
              opacity: `${1 - aboutDrift * 0.9}`,
            } as React.CSSProperties}
          />
          {/* 3. Mid-Left Red 5-Point Star (Depth Blur) */}
          <img
            src="/assets/star-red.svg"
            alt="Star Decor"
            className="animate-hero-decor animate-hero-float-2 absolute top-[44%] sm:top-[46%] lg:top-[48%] left-[4%] sm:left-[6%] md:left-[8%] lg:left-[10%] w-10 sm:w-12 md:w-15 lg:w-18 h-auto object-contain blur-[2px] sm:blur-[2.5px] opacity-90 dark:opacity-85"
            style={{
              "--rot": "-12deg",
              "--scroll-lift": `${-heroParallax * 1.1}px`,
              "--tx": `${-Math.min(170, aboutDrift * 260)}px`,
              "--hover-shift-x": `${heroPointer.active ? heroPointer.x * -22 : 0}px`,
              "--hover-shift-y": `${heroPointer.active ? heroPointer.y * -8 : 0}px`,
              opacity: `${Math.max(0.1, 1 - aboutDrift * 0.92)}`,
            } as React.CSSProperties}
          />
          {/* 4. Bottom-Left Lime-Green Soft Star (Soft Blur) */}
          <img
            src="/assets/star-lime.svg"
            alt="Star Decor"
            className="animate-hero-decor animate-hero-float-1 absolute top-[70%] sm:top-[72%] lg:top-[74%] left-[8%] sm:left-[11%] md:left-[13%] lg:left-[15%] w-12 sm:w-16 md:w-19 lg:w-22 h-auto object-contain blur-[1.5px] sm:blur-[2px] opacity-90 dark:opacity-85"
            style={{
              "--rot": "14deg",
              "--scroll-lift": `${-heroParallax * 1.2}px`,
              "--tx": `${-Math.min(180, aboutDrift * 280)}px`,
              "--hover-shift-x": `${heroPointer.active ? heroPointer.x * -20 : 0}px`,
              "--hover-shift-y": `${heroPointer.active ? heroPointer.y * -10 : 0}px`,
              opacity: `${Math.max(0.08, 1 - aboutDrift * 0.96)}`,
            } as React.CSSProperties}
          />

          {/* Right Floating Cluster */}
          {/* 5. Top-Right Lime-Green Soft Star (Soft Blur) */}
          <img
            src="/assets/star-lime.svg"
            alt="Star Decor"
            className="animate-hero-decor animate-hero-float-2 absolute top-[8%] sm:top-[10%] lg:top-[12%] right-[8%] sm:right-[11%] md:right-[13%] lg:right-[15%] w-11 sm:w-14 md:w-17 lg:w-20 h-auto object-contain blur-[1.5px] sm:blur-[2px] opacity-90 dark:opacity-85"
            style={{
              "--rot": "-16deg",
              "--scroll-lift": `${-heroParallax * 0.9}px`,
              "--tx": `${Math.min(180, aboutDrift * 280)}px`,
              "--hover-shift-x": `${heroPointer.active ? heroPointer.x * 18 : 0}px`,
              "--hover-shift-y": `${heroPointer.active ? heroPointer.y * -9 : 0}px`,
              opacity: `${1 - aboutDrift * 0.9}`,
            } as React.CSSProperties}
          />
          {/* 6. Mid-Right Blue Puzzle */}
          <img
            src="/assets/puzzle-blue.svg"
            alt="Puzzle Decor"
            className="animate-hero-decor animate-hero-float-1 absolute top-[30%] sm:top-[32%] lg:top-[34%] right-[-5%] sm:right-[1%] md:right-[3%] lg:right-[5%] xl:right-[7%] w-24 sm:w-30 md:w-38 lg:w-46 xl:w-50 h-auto object-contain drop-shadow-md dark:drop-shadow-[0_10px_25px_rgba(59,130,246,0.3)] transition-transform max-sm:opacity-75"
            style={{
              "--rot": "18deg",
              "--scroll-lift": `${-heroParallax * 1.05}px`,
              "--tx": `${Math.min(200, aboutDrift * 320)}px`,
              "--hover-shift-x": `${heroPointer.active ? heroPointer.x * 20 : 0}px`,
              "--hover-shift-y": `${heroPointer.active ? heroPointer.y * -11 : 0}px`,
              opacity: `${1 - aboutDrift * 0.88}`,
            } as React.CSSProperties}
          />
          {/* 7. Mid-Right Blue Sparkle */}
          <img
            src="/assets/sparkle-blue.svg"
            alt="Sparkle Decor"
            className="animate-hero-decor animate-hero-float-sparkle absolute top-[52%] sm:top-[54%] lg:top-[56%] right-[17%] sm:right-[19%] md:right-[21%] lg:right-[23%] w-5 sm:w-7 md:w-8 lg:w-10 h-auto object-contain drop-shadow-sm max-sm:opacity-85"
            style={{
              "--rot": "12deg",
              "--scroll-lift": `${-heroParallax * 1.15}px`,
              "--tx": `${Math.min(150, aboutDrift * 240)}px`,
              "--hover-shift-x": `${heroPointer.active ? heroPointer.x * 16 : 0}px`,
              "--hover-shift-y": `${heroPointer.active ? heroPointer.y * -9 : 0}px`,
              opacity: `${1 - aboutDrift * 0.86}`,
            } as React.CSSProperties}
          />
          {/* 8. Bottom-Right Red Star (Depth Blur) */}
          <img
            src="/assets/star-red.svg"
            alt="Star Decor"
            className="animate-hero-decor animate-hero-float-2 absolute top-[70%] sm:top-[72%] lg:top-[74%] right-[6%] sm:right-[8%] md:right-[10%] lg:right-[12%] w-10 sm:w-12 md:w-15 lg:w-18 h-auto object-contain blur-[2px] sm:blur-[2.5px] opacity-90 dark:opacity-85"
            style={{
              "--rot": "15deg",
              "--scroll-lift": `${-heroParallax * 1.3}px`,
              "--tx": `${Math.min(170, aboutDrift * 260)}px`,
              "--hover-shift-x": `${heroPointer.active ? heroPointer.x * 22 : 0}px`,
              "--hover-shift-y": `${heroPointer.active ? heroPointer.y * -8 : 0}px`,
              opacity: `${Math.max(0.1, 1 - aboutDrift * 0.92)}`,
            } as React.CSSProperties}
          />
        </div>

        {/* Hero Main Content (Centered in 100vh Banner) */}
        <main
          className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center max-w-4xl mx-auto w-full relative z-10 font-inter py-12 sm:py-16"
          style={{
            transform: `translate3d(0, ${heroParallax * -0.8}px, 0)`,
            transformOrigin: "center center",
            transition: "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform",
          }}
        >
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
          <p className="animate-hero-tagline font-cal text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-[#f5f5f5] max-w-2xl mx-auto mb-10 leading-snug whitespace-pre-line">
            {uiText.hero.tagline}
          </p>

          {loginError && (
            <div className="font-inter mb-8 p-4 bg-red-50 dark:bg-[#161616] border border-red-200 dark:border-rose-900/60 rounded-xl text-red-700 dark:text-rose-200 text-xs sm:text-sm max-w-lg mx-auto w-full flex items-start gap-3 text-left animate-in fade-in duration-300">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-red-800 dark:text-rose-100 mb-0.5 font-montserrat">
                  {uiText.hero.loginErrorTitle}
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
              className="group relative overflow-hidden rounded-2xl border border-slate-300 bg-white px-5 sm:px-6 py-2.5 sm:py-3 text-slate-800 shadow-[0_4px_14px_rgba(15,23,42,0.05)] transition-all duration-300 ease-out hover:border-slate-400 hover:shadow-[0_12px_30px_rgba(79,70,229,0.12)] hover:px-6 sm:hover:px-7 dark:border-[#333333] dark:bg-[#121212] dark:text-[#e5e5e5] dark:hover:border-[#555555] dark:hover:text-white cursor-pointer active:scale-95"
            >
              <span className="absolute inset-y-0 left-0 w-0 origin-left scale-x-0 rounded-full bg-gradient-to-r from-indigo-100 to-indigo-50 transition-all duration-300 ease-out group-hover:w-full group-hover:scale-x-100 dark:from-indigo-500/10 dark:to-indigo-400/10" />
              <span className="relative flex items-center justify-center gap-0 text-sm sm:text-base font-medium transition-all duration-300 ease-out group-hover:gap-2">
                <span>{uiText.hero.demoButton}</span>
                <ArrowUpRight className="h-0 w-0 opacity-0 overflow-hidden transition-all duration-300 ease-out group-hover:h-4 group-hover:w-4 group-hover:opacity-100" />
              </span>
            </button>

            {/* Sync Now Button (Primary) */}
            <button
              type="button"
              onClick={onConnectGoogle}
              disabled={isAuthenticating}
              className="group relative overflow-hidden rounded-2xl bg-[#4b43c6] px-5 sm:px-6 py-2.5 sm:py-3 text-white shadow-[0_10px_28px_rgba(79,70,229,0.28)] transition-all duration-300 ease-out hover:bg-[#3e36b8] hover:px-6 sm:hover:px-7 hover:shadow-[0_18px_36px_rgba(79,70,229,0.35)] dark:bg-[#5b52e0] dark:hover:bg-[#4d44d0] cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <span className="absolute inset-y-0 left-0 w-0 origin-left scale-x-0 rounded-full bg-white/10 transition-all duration-300 ease-out group-hover:w-full group-hover:scale-x-100" />
              <span className="relative flex items-center justify-center gap-0 text-sm sm:text-base font-medium transition-all duration-300 ease-out group-hover:gap-2">
                <span>{isAuthenticating ? uiText.hero.loading : uiText.hero.syncButton}</span>
                <ArrowUpRight className="h-0 w-0 opacity-0 overflow-hidden transition-all duration-300 ease-out group-hover:h-4 group-hover:w-4 group-hover:opacity-100" />
              </span>
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
            {uiText.hero.scroll}
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </a>
      </section>

      {/* SECTION 2: ABOUT OUR PLATFORM */}
      <section
        id="about-platform"
        ref={aboutSectionRef}
        data-scroll-section="about-platform"
        data-reveal
        className="landing-scroll-section w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 text-center scroll-mt-20"
      >
        <span className="font-montserrat text-xs sm:text-sm font-bold text-[#4f46e5] dark:text-[#818cf8] tracking-wider lowercase mb-2 inline-block">
          {uiText.sections.aboutEyebrow}
        </span>

        <h2 className="font-cal text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-[#f5f5f5] uppercase mb-2">
          {uiText.sections.aboutTitle}
        </h2>

        <h3 className="font-montserrat text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-[#f5f5f5] mb-6">
          {uiText.sections.aboutSubtitle}
        </h3>

        <p className="font-inter text-sm sm:text-base md:text-[17px] text-slate-600 dark:text-[#a3a3a3] leading-relaxed max-w-3xl mx-auto font-normal text-center">
          {uiText.sections.aboutDescription}
        </p>
      </section>

      {/* SECTION 3: INTERACTIVE FEATURE SHOWCASE */}
      <div data-scroll-section="features" data-reveal className="landing-scroll-section">
        <FeatureShowcase language={selectedLanguage} />
      </div>

      {/* SECTION 4: DEMO INVITATION (OH! Still Not Sure Whether to Try It or Not?) */}
      <div data-scroll-section="demo" data-reveal className="landing-scroll-section">
        <DemoInviteSection onDemoMode={onDemoMode} language={selectedLanguage} />
      </div>

      {/* SECTION 5: WHY CHOOSE US (Bento Grid) */}
      <div data-scroll-section="why-choose-us" data-reveal className="landing-scroll-section">
        <WhyChooseUsSection language={selectedLanguage} />
      </div>

      {/* SECTION 6: FREQUENTLY ASKED QUESTIONS */}
      <div data-scroll-section="faq-cta" data-reveal className="landing-scroll-section">
        <FAQSection language={selectedLanguage} />
        <CTABanner onConnectGoogle={onConnectGoogle} language={selectedLanguage} />
      </div>

      {/* SECTION 8: MODERN MULTI-COLUMN FOOTER */}
      <div data-scroll-section="footer" data-reveal className="landing-scroll-section is-footer">
        <LandingFooter onConnectGoogle={onConnectGoogle} language={selectedLanguage} />
      </div>
    </div>
  );
}
