"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  CheckCircle2,
  RefreshCw,
  MessageSquareText,
  Clock,
  ListTodo,
  User,
  Lightbulb,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useLanguage } from "@/context/LanguageContext";
import { setSpotlightTourCompleted } from "@/lib/taskStore";
import { Button } from "@/components/ui/button";

export interface SpotlightStep {
  targetSelector: string;
  emoji?: string;
  icon: React.ReactNode;
  tagId: string;
  tagEn: string;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  userflowTipId: string;
  userflowTipEn: string;
  preferredPlacement?: "bottom" | "top" | "left" | "right" | "auto";
}

interface SpotlightTourProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

const SPOTLIGHT_STEPS: SpotlightStep[] = [
  {
    targetSelector: '[data-tour="sidebar-nav"]',
    icon: <Compass className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
    tagId: "NAVIGASI UTAMA",
    tagEn: "MAIN NAVIGATION",
    titleId: "Menu Ruang Belajar IOnLearn",
    titleEn: "IOnLearn Study Workspaces",
    descId:
      "Beralih dengan cepat antara Dashboard ringkasan, Semua Tugas Classroom, Diskusi AI Tutor, To-Do List mandiri, dan Catatan Materi.",
    descEn:
      "Quickly toggle between your Overview Dashboard, Classroom Tasks, AI Socratic Tutor, Daily To-Dos, and Study Notes.",
    userflowTipId:
      "Alur Utama: Mulai dari Dashboard -> buka detail tugas -> bedah materi bersama AI -> simpan rangkuman di Catatan.",
    userflowTipEn:
      "Core Flow: Start at Dashboard -> open assignments -> discuss with AI Tutor -> save summaries to Notes.",
    preferredPlacement: "right",
  },
  {
    targetSelector: '[data-tour="header-sync"]',
    icon: <RefreshCw className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
    tagId: "GOOGLE CLASSROOM",
    tagEn: "GOOGLE CLASSROOM",
    titleId: "Sinkronisasi Data Classroom",
    titleEn: "Google Classroom Auto-Sync",
    descId:
      "Tombol ini otomatis menarik tugas, pengumuman, dan materi teranyar dari Google Classroom secara strictly read-only tanpa perlu bolak-balik tab.",
    descEn:
      "One-click sync pulls your latest assignments, course attachments, and instructions directly from Google Classroom.",
    userflowTipId:
      "Praktik Terbaik: Klik tombol ini kapan pun guru atau dosenmu mengunggah tugas baru di Classroom.",
    userflowTipEn:
      "Best Practice: Click this button whenever teachers post new materials or assignments in Classroom.",
    preferredPlacement: "bottom",
  },
  {
    targetSelector: '[data-tour="quick-ai-btn"]',
    icon: <MessageSquareText className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
    tagId: "AI SOCRATIC TUTOR",
    tagEn: "AI SOCRATIC TUTOR",
    titleId: "Diskusi & Tanya AI Tutor",
    titleEn: "Ask AI Tutor Workspace",
    descId:
      "Bukan sekadar contekan jawaban instan! AI Tutor mendampingimu dengan pertanyaan Sokrates langkah demi langkah, membedah PDF, dan melatih nalar kritis.",
    descEn:
      "Not just answer-dumping! The AI Tutor scaffolds your problem solving step-by-step using Socratic inquiry and syllabus analysis.",
    userflowTipId:
      "Tips: Jika mentok pada soal tugas, klik tombol ini dan upload lampiran soal untuk dibimbing sampai paham.",
    userflowTipEn:
      "Pro Tip: Whenever stuck on tricky homework, ask AI for hints and analogies to build genuine mastery.",
    preferredPlacement: "bottom",
  },
  {
    targetSelector: '[data-tour="urgent-tasks"]',
    icon: <Clock className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
    tagId: "PRIORITAS TENGGAT",
    tagEn: "DEADLINE RADAR",
    titleId: "Pantauan Tugas Mendekati Deadline",
    titleEn: "Upcoming & Urgent Deadlines",
    descId:
      "Tugas otomatis diurutkan berdasarkan urgensi waktu pengumpulan (<48 jam) agar kamu tidak panik dan tidak pernah terlambat mengumpulkan.",
    descEn:
      "Assignments approaching deadlines (<48 hours) are automatically highlighted here so you never submit late.",
    userflowTipId:
      "Fitur Studio: Di halaman detail tugas, kamu bisa mengekspor makalah rapi (.docx), slide (.pptx), atau tabel (.xlsx).",
    userflowTipEn:
      "Studio Feature: Inside task details, you can generate academic papers (.docx), slides (.pptx), or spreadsheets (.xlsx).",
    preferredPlacement: "top",
  },
  {
    targetSelector: '[data-tour="today-todos"]',
    icon: <ListTodo className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
    tagId: "PRODUKTIVITAS HARIAN",
    tagEn: "DAILY PRODUCTIVITY",
    titleId: "To-Do List Mandiri & Pelacak Progres",
    titleEn: "Daily To-Dos & Progress Tracker",
    descId:
      "Catat target belajar mandiri di luar Classroom. Pecah tugas kuliah besar menjadi langkah-langkah kecil yang mudah diselesaikan.",
    descEn:
      "Set personal study checklists outside Classroom. Break down overwhelming tasks into bite-sized achievable goals.",
    userflowTipId:
      "Motivasi: Setiap kali mencentang to-do selesai, pelacak progres dan perayaan confetti akan menyemangatimu!",
    userflowTipEn:
      "Motivation: Each completed checklist item updates your study momentum with celebratory confetti!",
    preferredPlacement: "top",
  },
  {
    targetSelector: '[data-tour="user-profile"]',
    icon: <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />,
    tagId: "PENGATURAN & AKUN",
    tagEn: "SETTINGS & PROFILE",
    titleId: "Profil Akun, Tema & Bahasa",
    titleEn: "Profile, Theme & Preferences",
    descId:
      "Ganti mode tema Gelap/Terang, ubah bahasa tampilan (ID/EN), sinkronkan akun, atau jalankan ulang kuesioner onboarding jika profil belajarmu berubah.",
    descEn:
      "Switch Dark/Light theme, toggle Indonesian/English, manage Classroom accounts, or recalibrate onboarding preferences.",
    userflowTipId:
      "Selamat! Kamu sudah memahami seluruh alur kerja IOnLearn. Selamat belajar dan berprestasi!",
    userflowTipEn:
      "You're all set! You understand the complete IOnLearn workflow. Happy studying and best of luck!",
    preferredPlacement: "top",
  },
];

export function SpotlightTour({ isOpen, onClose, userEmail }: SpotlightTourProps) {
  const { isEn } = useLanguage();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [cardPosition, setCardPosition] = useState<{ top: number; left: number }>({
    top: 100,
    left: 100,
  });

  const currentStep = SPOTLIGHT_STEPS[currentStepIndex];

  // Measure and reposition target
  const updateTargetRect = useCallback(() => {
    if (!isOpen || !currentStep) return;

    const el = document.querySelector(currentStep.targetSelector);
    if (!el) {
      // Fallback: center screen
      setTargetRect(null);
      setCardPosition({
        top: Math.max(20, window.innerHeight / 2 - 160),
        left: Math.max(20, window.innerWidth / 2 - 200),
      });
      return;
    }

    // Scroll element into view if not visible
    el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });

    const rect = el.getBoundingClientRect();
    setTargetRect(rect);

    // Calculate card positioning with safe boundaries
    const cardWidth = Math.min(390, window.innerWidth - 32);
    const cardHeight = 280; // Estimated max height
    const margin = 14;

    let top = 0;
    let left = 0;

    const placement = currentStep.preferredPlacement || "auto";

    if (placement === "right" && rect.right + cardWidth + margin < window.innerWidth) {
      top = Math.max(16, Math.min(window.innerHeight - cardHeight - 16, rect.top));
      left = rect.right + margin;
    } else if (placement === "bottom" && rect.bottom + cardHeight + margin < window.innerHeight) {
      top = rect.bottom + margin;
      left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, rect.left + rect.width / 2 - cardWidth / 2));
    } else if (placement === "top" && rect.top - cardHeight - margin > 0) {
      top = rect.top - cardHeight - margin;
      left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, rect.left + rect.width / 2 - cardWidth / 2));
    } else if (placement === "left" && rect.left - cardWidth - margin > 0) {
      top = Math.max(16, Math.min(window.innerHeight - cardHeight - 16, rect.top));
      left = rect.left - cardWidth - margin;
    } else {
      // Smart Auto Placement
      if (rect.bottom + cardHeight + margin < window.innerHeight) {
        top = rect.bottom + margin;
        left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, rect.left + rect.width / 2 - cardWidth / 2));
      } else if (rect.top - cardHeight - margin > 0) {
        top = rect.top - cardHeight - margin;
        left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, rect.left + rect.width / 2 - cardWidth / 2));
      } else {
        top = Math.max(20, window.innerHeight / 2 - 140);
        left = Math.max(16, window.innerWidth / 2 - cardWidth / 2);
      }
    }

    setCardPosition({ top, left });
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen) return;

    updateTargetRect();
    const timer1 = setTimeout(updateTargetRect, 100);
    const timer2 = setTimeout(updateTargetRect, 300);
    const timer3 = setTimeout(updateTargetRect, 700);

    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [isOpen, currentStepIndex, updateTargetRect]);

  const handleNext = () => {
    if (currentStepIndex < SPOTLIGHT_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    setSpotlightTourCompleted(true, userEmail);
    onClose();
  };

  const handleComplete = () => {
    setSpotlightTourCompleted(true, userEmail);
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
    onClose();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] overflow-hidden select-none">
      {/* SVG Mask Backdrop with transparent cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300">
        <defs>
          <mask id="spotlight-hole-mask">
            {/* White covers entire screen */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black cutout creates transparent hole */}
            {targetRect && (
              <rect
                x={targetRect.x - 8}
                y={targetRect.y - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="18"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(5, 5, 8, 0.78)"
          mask="url(#spotlight-hole-mask)"
        />
      </svg>

      {/* Glowing Pulsing Ring around Target */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-[9995] rounded-2xl ring-4 ring-indigo-500/80 shadow-[0_0_35px_rgba(99,102,241,0.7)] transition-all duration-300 ease-out animate-pulse"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Floating Spotlight Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`step-${currentStepIndex}`}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            top: `${cardPosition.top}px`,
            left: `${cardPosition.left}px`,
            maxWidth: "min(390px, calc(100vw - 32px))",
            zIndex: 9999,
          }}
          className="w-full bg-white dark:bg-[#121215] text-slate-900 dark:text-[#f3f3f3] rounded-2xl p-5 border border-slate-200/90 dark:border-white/[0.12] shadow-2xl shadow-black/40 backdrop-blur-md"
        >
          {/* Top Bar: Tag & Step Counter */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              {currentStep.icon}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60">
                {isEn ? currentStep.tagEn : currentStep.tagId}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#888]">
                {isEn
                  ? `Step ${currentStepIndex + 1} of ${SPOTLIGHT_STEPS.length}`
                  : `Langkah ${currentStepIndex + 1} dari ${SPOTLIGHT_STEPS.length}`}
              </span>
              <button
                onClick={handleSkip}
                className="size-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-[#fff] hover:bg-slate-100 dark:hover:bg-[#1f1f23] transition-colors cursor-pointer"
                title={isEn ? "Close tour (Esc)" : "Tutup tur (Esc)"}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <div className="pt-3.5 space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#f8f8f8] flex items-center gap-2 leading-snug">
              {isEn ? currentStep.titleEn : currentStep.titleId}
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#aaa] leading-relaxed">
              {isEn ? currentStep.descEn : currentStep.descId}
            </p>

            {/* Userflow Callout Box */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#18181e] border border-slate-200/70 dark:border-white/[0.06] text-[11px] text-slate-700 dark:text-[#ccc] leading-relaxed">
              {isEn ? currentStep.userflowTipEn : currentStep.userflowTipId}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-2 pt-4 mt-2 border-t border-slate-100 dark:border-white/[0.06]">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {SPOTLIGHT_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`size-1.5 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? "w-4 bg-indigo-600 dark:bg-indigo-400"
                      : "bg-slate-300 dark:bg-neutral-700 hover:bg-slate-400"
                  }`}
                  aria-label={`Step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  className="h-8 px-2.5 text-xs text-slate-600 dark:text-[#aaa] hover:text-slate-900 dark:hover:text-[#fff] cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>{isEn ? "Back" : "Kembali"}</span>
                </Button>
              )}

              <Button
                size="sm"
                onClick={handleNext}
                className="h-8 px-3.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/25 cursor-pointer gap-1.5"
              >
                <span>
                  {currentStepIndex === SPOTLIGHT_STEPS.length - 1
                    ? isEn
                      ? "Start Learning"
                      : "Mulai Belajar"
                    : isEn
                    ? "Next"
                    : "Lanjut"}
                </span>
                {currentStepIndex < SPOTLIGHT_STEPS.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

