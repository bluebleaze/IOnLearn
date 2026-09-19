"use client";
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  NotebookPen,
  ListTodo,
  Settings,
  ArrowRight,
  ArrowLeft,
  Rocket,
  Workflow,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { toggleThemeWithCircularAnimation } from "@/lib/theme";

interface FeatureTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TourStep {
  emoji: string;
  icon: React.ReactNode;
  tagId: string;
  tagEn: string;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  highlights: { id: string; en: string }[];
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    emoji: "🎉",
    icon: <Rocket className="w-8 h-8 sm:w-10 sm:h-10" />,
    tagId: "PENGANTAR",
    tagEn: "WELCOME",
    titleId: "Selamat Datang di IOnLearn",
    titleEn: "Welcome to IOnLearn",
    descId:
      "Platform belajar cerdas all-in-one yang menghubungkan Google Classroom dengan AI Tutor. Semua tugas, catatan materi, dan bimbingan belajar personal siap menemanimu.",
    descEn:
      "An all-in-one smart learning platform connecting Google Classroom with an AI Tutor. All your assignments, study notes, and personal tutoring in one place.",
    highlights: [
      {
        id: "🔗 Terhubung langsung dengan Google Classroom secara otomatis",
        en: "🔗 Automatic synchronization with your Google Classroom account",
      },
      {
        id: "🤖 AI Tutor cerdas yang memahami konteks tugas dan materi kuliah",
        en: "🤖 Intelligent AI Tutor tailored to your assignments and subjects",
      },
      {
        id: "📊 Dashboard ringkasan deadline, to-do, dan progres belajar",
        en: "📊 Real-time overview of deadlines, to-dos, and learning progress",
      },
    ],
    accentColor: "text-indigo-600 dark:text-indigo-400",
    accentBg: "bg-indigo-50 dark:bg-indigo-950/50",
    accentBorder: "border-indigo-100 dark:border-indigo-900/60",
  },
  {
    emoji: "📚",
    icon: <BookOpen className="w-8 h-8 sm:w-10 sm:h-10" />,
    tagId: "AKADEMIK",
    tagEn: "ACADEMIC",
    titleId: "Tugas Classroom Terintegrasi",
    titleEn: "Integrated Classroom Tasks",
    descId:
      "Tidak perlu bolak-balik buka tab Classroom. Semua tugas otomatis tersinkronisasi lengkap dengan tanggal tenggat, prioritas, serta instruksi pengumpulan.",
    descEn:
      "No need to switch tabs constantly. All assignments sync automatically with due dates, priority tags, and detailed teacher instructions.",
    highlights: [
      {
        id: "📅 Peringatan otomatis untuk tugas yang mendekati deadline (urgent)",
        en: "📅 Smart alerts for approaching deadlines and overdue items",
      },
      {
        id: "🏷️ Pengelompokan praktis berdasarkan mata pelajaran & prioritas",
        en: "🏷️ Flexible filtering by subject and custom priority levels",
      },
      {
        id: "✅ Tandai status selesai & sinkronkan kemajuan belajar",
        en: "✅ Mark completed status & synchronize your learning progress",
      },
    ],
    accentColor: "text-blue-600 dark:text-blue-400",
    accentBg: "bg-blue-50 dark:bg-blue-950/50",
    accentBorder: "border-blue-100 dark:border-blue-900/60",
  },
  {
    emoji: "🤖",
    icon: (
      <img
        src="/logos/ionlearn_mascot.svg"
        alt="AI Mascot"
        className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
      />
    ),
    tagId: "ASISTEN BELAJAR",
    tagEn: "STUDY ASSISTANT",
    titleId: "AI Tutor — Asisten Pribadimu",
    titleEn: "AI Tutor — Your Personal Assistant",
    descId:
      "Punya kendala saat belajar? Diskusikan dengan AI Tutor. Bisa menjelaskan teori rumit, membedah soal latihan, hingga merangkum dokumen materi.",
    descEn:
      "Stuck on a tricky problem? Discuss it with your AI Tutor. It breaks down difficult theories, solves practice questions, and analyzes documents.",
    highlights: [
      {
        id: "💬 Chat interaktif kontekstual yang otomatis memahami tugas aktifmu",
        en: "💬 Context-aware chat automatically tuned to your active coursework",
      },
      {
        id: "📎 Upload dokumen & gambar soal untuk dianalisis secara instan",
        en: "📎 Upload assignment documents and images for immediate breakdown",
      },
      {
        id: "🧠 Mode Socratic untuk melatih logika dan pemecahan masalah mandiri",
        en: "🧠 Socratic study mode fostering independent analytical thinking",
      },
    ],
    accentColor: "text-emerald-600 dark:text-emerald-400",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/50",
    accentBorder: "border-emerald-100 dark:border-emerald-900/60",
  },
  {
    emoji: "📝",
    icon: <NotebookPen className="w-8 h-8 sm:w-10 sm:h-10" />,
    tagId: "CATATAN",
    tagEn: "NOTES",
    titleId: "Catatan Materi & Ringkasan AI",
    titleEn: "Study Notes & AI Summary",
    descId:
      "Simpan dan rapikan intisari belajar tiap mata pelajaran. AI dapat merangkum catatan panjang menjadi poin-poin singkat yang mudah dihafal.",
    descEn:
      "Organize learning takeaways by course. Let AI condense long notes into bite-sized key points ready for exam reviews.",
    highlights: [
      {
        id: "✍️ Editor teks kaya yang nyaman untuk mencatat rumus & poin penting",
        en: "✍️ Rich-text editor crafted for equations, code, and quick bullet points",
      },
      {
        id: "🤖 Generator rangkuman AI sekali klik untuk persiapan ujian",
        en: "🤖 One-click AI summarizer ideal for exam cramming and review",
      },
      {
        id: "🔍 Pencarian cepat dan penyusunan catatan tanpa batas",
        en: "🔍 Instant search across titles, tags, and note content",
      },
    ],
    accentColor: "text-purple-600 dark:text-purple-400",
    accentBg: "bg-purple-50 dark:bg-purple-950/50",
    accentBorder: "border-purple-100 dark:border-purple-900/60",
  },
  {
    emoji: "✅",
    icon: <ListTodo className="w-8 h-8 sm:w-10 sm:h-10" />,
    tagId: "PRODUKTIVITAS",
    tagEn: "PRODUCTIVITY",
    titleId: "To-Do List Belajar Mandiri",
    titleEn: "Personal Study To-Do List",
    descId:
      "Kelola agenda belajar di luar Google Classroom — seperti jadwal membaca modul, persiapan ujian mandiri, atau target proyek kelompok.",
    descEn:
      "Track self-study milestones outside Google Classroom — like reading goals, project timelines, and exam preparation checklists.",
    highlights: [
      {
        id: "➕ Tambah agenda harian dan checklist tugas mandiri dengan cepat",
        en: "➕ Fast task creation for daily study goals and personal routines",
      },
      {
        id: "📊 Indikator progres penyelesaian tugas untuk menjaga motivasi",
        en: "📊 Visual completion progress bar keeping study motivation high",
      },
      {
        id: "🎯 Terpisah rapi dari tugas sekolah agar fokus belajarmu teratur",
        en: "🎯 Clean separation between institutional coursework and personal goals",
      },
    ],
    accentColor: "text-amber-600 dark:text-amber-400",
    accentBg: "bg-amber-50 dark:bg-amber-950/50",
    accentBorder: "border-amber-100 dark:border-amber-900/60",
  },
  {
    emoji: "🔄",
    icon: <Workflow className="w-8 h-8 sm:w-10 sm:h-10" />,
    tagId: "ALUR KERJA",
    tagEn: "WORKFLOW",
    titleId: "Workflow Belajar yang Efektif",
    titleEn: "Effective Study Workflow",
    descId:
      "Alur harian yang direkomendasikan agar belajarmu teratur, hemat waktu, dan tugas selesai tepat waktu tanpa stres:",
    descEn:
      "The recommended daily study loop to stay organized, save time, and hit deadlines without feeling overwhelmed:",
    highlights: [
      {
        id: "1️⃣ Cek Dashboard: Pantau deadline tugas Classroom terdekat & to-do hari ini.",
        en: "1️⃣ Check Dashboard: Review upcoming Classroom deadlines & priority to-dos.",
      },
      {
        id: "2️⃣ Bedah Tugas: Buka materi yang membingungkan & diskusikan solusinya bersama AI.",
        en: "2️⃣ Deconstruct: Open tough assignments and brainstorm solutions with AI Tutor.",
      },
      {
        id: "3️⃣ Tulis Catatan: Simpan rangkuman penting ke Catatan Materi untuk review berkala.",
        en: "3️⃣ Take Notes: Save synthesized key points to Study Notes for fast retrieval.",
      },
      {
        id: "4️⃣ Checklist Selesai: Tandai tugas tuntas dan nikmati waktu istirahat belajarmu!",
        en: "4️⃣ Check Off: Mark completed tasks and celebrate steady academic progress!",
      },
    ],
    accentColor: "text-sky-600 dark:text-sky-400",
    accentBg: "bg-sky-50 dark:bg-sky-950/50",
    accentBorder: "border-sky-100 dark:border-sky-900/60",
  },
  {
    emoji: "⚙️",
    icon: <Settings className="w-8 h-8 sm:w-10 sm:h-10" />,
    tagId: "PENGATURAN",
    tagEn: "SETTINGS",
    titleId: "Kustomisasi Pengalamanmu",
    titleEn: "Customize Your Experience",
    descId:
      "Atur antarmuka sesuai seleramu! Pilih bahasa (otomatis dari lokasi atau manual), ganti tema, dan sesuaikan preferensi AI kapan saja.",
    descEn:
      "Tailor your workspace! Switch languages (automatic or manual), toggle themes, and refine AI model behavior whenever you wish.",
    highlights: [
      {
        id: "🌐 Bahasa otomatis via lokasi/locale atau manual (Indonesia / English)",
        en: "🌐 Auto-language detection based on location/locale or manual toggle",
      },
      {
        id: "🌙 Mode gelap & terang dengan transisi melingkar yang halus",
        en: "🌙 Dark & light themes with sleek circular ripple transitions",
      },
      {
        id: "💡 Buka kembali panduan ini kapan saja dari menu Akun atau Pengaturan",
        en: "💡 Revisit this full guide anytime via Account menu or Settings page",
      },
    ],
    accentColor: "text-slate-600 dark:text-slate-400",
    accentBg: "bg-slate-100 dark:bg-slate-800/50",
    accentBorder: "border-slate-200 dark:border-slate-700/60",
  },
];

export function FeatureTour({ onComplete, onSkip }: FeatureTourProps) {
  const [step, setStep] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const { isEn } = useLanguage();

  const totalSteps = TOUR_STEPS.length;
  const current = TOUR_STEPS[step];
  const isLast = step === totalSteps - 1;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (isLast) onComplete();
        else setStep((prev) => Math.min(prev + 1, totalSteps - 1));
      } else if (e.key === "ArrowLeft") {
        setStep((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        onSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLast, totalSteps, onComplete, onSkip]);

  const handleNext = () => {
    if (isLast) onComplete();
    else setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  const handleThemeToggle = (e: React.MouseEvent) => {
    const next = toggleThemeWithCircularAnimation(e);
    setIsDark(next === "dark");
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/70 dark:bg-[#09090b] text-slate-900 dark:text-[#f3f3f3] flex flex-col justify-between select-none">
      {/* Top Navbar */}
      <header className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-black/40 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center">
            <img
              src="/logos/ionlearn_mascot.svg"
              alt="IOnLearn Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-base sm:text-lg font-heading">
              IOnLearn
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40">
              {isEn ? "Onboarding Guide" : "Panduan Pengguna Baru"}
            </span>
          </div>
        </div>

        {/* Step Indicator & Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#a0a0a0]">
            <span>{isEn ? "Step" : "Langkah"}</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {step + 1}
            </span>
            <span>/</span>
            <span>{totalSteps}</span>
          </div>

          <button
            type="button"
            onClick={handleThemeToggle}
            title={isDark ? "Light Mode" : "Dark Mode"}
            className="size-8.5 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-[#181818] transition-colors cursor-pointer text-slate-600 dark:text-[#a0a0a0]"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-xs text-slate-500 hover:text-slate-800 dark:text-[#a0a0a0] dark:hover:text-white font-medium cursor-pointer h-8.5 px-3"
          >
            <X className="w-3.5 h-3.5 mr-1 sm:hidden" />
            <span>{isEn ? "Skip Tour" : "Lewati Tur"}</span>
          </Button>
        </div>
      </header>

      {/* Main Feature Showcase Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl bg-white dark:bg-[#121214] border border-slate-200/90 dark:border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-900/5 dark:shadow-black/40 space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Row: Icon Badge & Tag */}
          <div className="flex items-start justify-between gap-4">
            <div
              className={`size-16 sm:size-20 rounded-2xl ${current.accentBg} border ${current.accentBorder} flex items-center justify-center shrink-0 ${current.accentColor} shadow-inner`}
            >
              {current.icon}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] sm:text-xs font-bold tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-[#a0a0a0]">
                {isEn ? current.tagEn : current.tagId}
              </span>
              <span className="text-xs text-slate-400 dark:text-[#707070] mt-1 font-mono">
                {step + 1} / {totalSteps}
              </span>
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-2.5">
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-heading flex items-center gap-2.5">
              <span>{current.emoji}</span>
              <span>{isEn ? current.titleEn : current.titleId}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0] leading-relaxed">
              {isEn ? current.descEn : current.descId}
            </p>
          </div>

          {/* Highlights List */}
          <div className="space-y-2.5 pt-1">
            {current.highlights.map((h, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border ${current.accentBorder} ${current.accentBg} transition-all`}
              >
                <span className="text-xs sm:text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                  {isEn ? h.en : h.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Floating Control Bar */}
      <footer className="h-20 px-4 sm:px-8 flex items-center justify-between border-t border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-black/40 backdrop-blur-md sticky bottom-0 z-20">
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <div>
            {step > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="text-xs h-9 px-3.5 rounded-xl border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-[#ccc] hover:bg-slate-100 dark:hover:bg-[#181818] gap-1.5 cursor-pointer font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isEn ? "Back" : "Kembali"}</span>
              </Button>
            ) : (
              <div className="w-20" />
            )}
          </div>

          {/* Dots Navigator */}
          <div className="flex items-center gap-2">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setStep(idx)}
                title={`Langkah ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === step
                    ? "w-8 h-2.5 bg-indigo-600 dark:bg-indigo-400"
                    : idx < step
                    ? "w-2.5 h-2.5 bg-indigo-300 dark:bg-indigo-700"
                    : "w-2.5 h-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                }`}
              />
            ))}
          </div>

          {/* Next / Finish Button */}
          <div>
            <Button
              size="sm"
              onClick={handleNext}
              className="text-xs h-9 px-4 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20 gap-1.5 cursor-pointer"
            >
              <span>
                {isLast
                  ? isEn
                    ? "Start Learning!"
                    : "Mulai Belajar!"
                  : isEn
                  ? "Next"
                  : "Lanjut"}
              </span>
              {isLast ? (
                <Rocket className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
