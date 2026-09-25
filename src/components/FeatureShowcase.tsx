"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  MessageSquareText,
  MessageSquarePlus,
  Bot,
  CheckCircle2,
  Circle,
  ListTodo,
  FileText,
  Calendar,
  Play,
  Pause,
  Send,
  Zap,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Clock,
  Eye,
  ChevronRight,
  X,
} from "lucide-react";
import { IonLearnAIIcon } from "./IonLearnAIIcon";

type FeatureTab = "Demo" | "AI Chatbot" | "Tasks Menu" | "To-Do" | "Auto-Notes";

interface FeatureShowcaseProps {
  language?: "ENG" | "IND";
}

export function FeatureShowcase({ language = "ENG" }: FeatureShowcaseProps) {
  const [activeTab, setActiveTab] = useState<FeatureTab>("Demo");
  const [chatStatus, setChatStatus] = useState<"open" | "closing" | "closed">("closed");
  const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [demoStep, setDemoStep] = useState(0);
  // Ketinggian trigger ditetapkan tetap di 680px
  const triggerOffset = 350;
  const triggerRef = React.useRef<HTMLDivElement | null>(null);

  // Observer yang memantau elemen penanda di ketinggian 680px
  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setChatStatus("open");
          }, 100);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Close chat helper with staggered exit animation
  const closeChat = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (chatStatus === "open") {
      setChatStatus("closing");
      closeTimerRef.current = setTimeout(() => {
        setChatStatus("closed");
      }, 380);
    }
  };

  // Toggle chat with staggered open and close animations
  const handleToggleChat = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (chatStatus === "open") {
      closeChat();
    } else {
      setChatStatus("open");
    }
  };

  // Switch tab and automatically close chat bubbles if open
  const handleSelectTab = (tab: FeatureTab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      closeChat();
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // Dynamic interactive state for To-Do tab
  const [todos, setTodos] = useState([
    { id: 1, textInd: "Tonton 1 video kurasi tentang Vektor", textEng: "Watch 1 curated video on Vector Physics", done: true },
    { id: 2, textInd: "Bahas 3 soal latihan Kinematika bersama AI", textEng: "Solve 3 Kinematics practice problems with AI", done: true },
    { id: 3, textInd: "Buat flashcard otomatis dari rangkuman Bab 2", textEng: "Generate flashcards from Chapter 2 notes", done: false },
    { id: 4, textInd: "Kirim draf tugas akhir ke Google Classroom", textEng: "Submit assignment draft to Google Classroom", done: false },
  ]);

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // Auto-advance promo cycle when playing
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying, activeTab]);

  const isExiting = chatStatus === "closing";
  const isShown = chatStatus !== "closed";

  const tabLabels =
    language === "IND"
      ? { Demo: "Demo", "AI Chatbot": "Chatbot AI", "Tasks Menu": "Menu Tugas", "To-Do": "To-Do", "Auto-Notes": "Catatan Otomatis" }
      : { Demo: "Demo", "AI Chatbot": "AI Chatbot", "Tasks Menu": "Tasks Menu", "To-Do": "To-Do", "Auto-Notes": "Auto-Notes" };

  const localizedCopy = {
    eyebrow: language === "IND" ? "fitur kami" : "our features",
    bubble1: language === "IND" ? "Semua yang Anda butuhkan untuk belajar" : "Everything you need for studying and learning",
    bubble2: language === "IND" ? "ada di satu platform" : "is here in one platform",
    bubble3: language === "IND" ? "dan ringankan beban Anda" : "and lighten your burden",
    bubble4: language === "IND" ? "Jadikan hidup lebih mudah dari sebelumnya" : "Make your life easier than before",
    live: language === "IND" ? "Pratinjau Langsung" : "Live Preview",
  };

  return (
    <section id="features" className="w-full mt-24 sm:mt-28 flex flex-col items-center relative z-10 px-2 sm:px-4 scroll-mt-24">
      {/* Invisible Trigger Sentinel at 680px */}
      <div
        ref={triggerRef}
        style={{ top: `${triggerOffset}px` }}
        className="absolute inset-x-0 pointer-events-none h-px w-full"
        aria-hidden="true"
      />

      {/* Section Eyebrow matching reference image */}
      <span className="font-montserrat text-xs sm:text-sm font-bold text-[#4f46e5] dark:text-[#818cf8] tracking-wider lowercase mb-6 sm:mb-8">
        {localizedCopy.eyebrow}
      </span>

      {/* Main Display Container */}
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Left Chat Bubbles (desktop-only accent; hidden on small screens to avoid clutter on mobile) */}
        <div className="absolute -left-4 sm:-left-8 md:-left-12 lg:-left-16 bottom-[10%] sm:bottom-[12%] md:bottom-[14%] z-30 hidden sm:flex flex-col items-start gap-2.5 sm:gap-3 pointer-events-auto select-none">
          {/* Collapsible 4 Message Bubbles with Staggered Open & Close Animation */}
          {isShown && (
            <div className="flex flex-col items-start gap-2.5 sm:gap-3 origin-bottom">
              {/* Bubble 1 (Pops 4th / Closes 1st - Topmost) */}
              <div
                className={`${isExiting ? "animate-bubble-close-1" : "animate-bubble-pop-4"
                  } bg-[#4238c9] dark:bg-[#4f46e5] text-white px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-full shadow-lg text-xs sm:text-sm font-inter font-normal leading-snug w-fit hover:scale-[1.02] transition-transform`}
              >
                {localizedCopy.bubble1}
              </div>

              {/* Bubble 2 (Pops 3rd / Closes 2nd) */}
              <div
                className={`${isExiting ? "animate-bubble-close-2" : "animate-bubble-pop-3"
                  } bg-[#4238c9] dark:bg-[#4f46e5] text-white px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-full shadow-lg text-xs sm:text-sm font-inter font-normal leading-snug w-fit hover:scale-[1.02] transition-transform`}
              >
                {localizedCopy.bubble2}
              </div>

              {/* Bubble 3 (Pops 2nd / Closes 3rd) */}
              <div
                className={`${isExiting ? "animate-bubble-close-3" : "animate-bubble-pop-2"
                  } bg-[#4238c9] dark:bg-[#4f46e5] text-white px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-full shadow-lg text-xs sm:text-sm font-inter font-normal leading-snug w-fit hover:scale-[1.02] transition-transform`}
              >
                {localizedCopy.bubble3}
              </div>

              {/* Bubble 4 (Pops 1st / Closes 4th - Nearest to bottom ...) */}
              <div
                className={`${isExiting ? "animate-bubble-close-4" : "animate-bubble-pop-1"
                  } bg-[#4238c9] dark:bg-[#4f46e5] text-white px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-full shadow-lg text-xs sm:text-sm font-inter font-normal leading-snug w-fit hover:scale-[1.02] transition-transform`}
              >
                {localizedCopy.bubble4}
              </div>
            </div>
          )}

          {/* Interactive Dynamic Chat Trigger Button (Option 1) */}
          <button
            type="button"
            onClick={handleToggleChat}
            className="group bg-[#4238c9] dark:bg-[#4f46e5] hover:bg-[#382ebd] dark:hover:bg-[#4338ca] active:scale-95 text-white w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-lg cursor-pointer transition-all duration-300 flex items-center justify-center border border-white/20 dark:border-white/10 hover:shadow-indigo-500/30"
            title={chatStatus === "open" ? (language === "IND" ? "Sembunyikan pesan" : "Hide messages") : (language === "IND" ? "Lihat pesan" : "View messages")}
            aria-label={chatStatus === "open" ? "Tutup pesan" : "Buka pesan"}
          >
            {chatStatus === "open" ? (
              <X className="w-4 h-4 text-white transition-transform duration-200 group-hover:rotate-90" />
            ) : (
              <MessageSquarePlus className="w-4 h-4 text-white transition-transform duration-200 group-hover:scale-110" />
            )}
          </button>
        </div>

        {/* Computer Screen Outer Frame (Aspect Ratio 858/492 matching frame.svg) */}
        <div className="relative w-full aspect-[858/492] bg-transparent drop-shadow-2xl">
          {/* Inner Display Area (Inset completely inside the 7px frame stroke & notch) */}
          <div className="absolute left-[1%] right-[1%] top-[3.8%] bottom-[1.6%] rounded-[8px] overflow-hidden bg-white dark:bg-[#0f111a] text-slate-800 dark:text-slate-100 flex flex-col border border-slate-100 dark:border-zinc-800/80">
            {/* Top Mock Window Bar / Tab indicator */}
            <div className="h-6 sm:h-7 bg-slate-100/80 dark:bg-zinc-900/90 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-3 sm:px-4 text-xs text-slate-500 dark:text-slate-400 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                <span className="ml-2 font-mono text-xs text-slate-400 dark:text-zinc-500 hidden sm:inline">
                  ionlearn.app/{activeTab.toLowerCase().replace(" ", "-")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {localizedCopy.live}
                </span>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title={isPlaying ? "Jeda animasi" : "Lanjutkan animasi"}
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3 opacity-60" />
                  ) : (
                    <Play className="w-3 h-3 text-[#4b43c6] dark:text-indigo-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Dynamic Screen Content per Active Tab */}
            <div className="flex-1 p-3 sm:p-5 md:p-6 overflow-hidden flex flex-col justify-center items-center relative select-none">
              {/* Subtle background ambient mesh glow */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#4f46e5]/10 dark:bg-[#4f46e5]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#818cf8]/10 dark:bg-[#818cf8]/15 rounded-full blur-3xl pointer-events-none" />

              {/* 1. OVERVIEW DEMO */}
              {activeTab === "Demo" && (
                <div className="w-full max-w-lg flex flex-col items-center text-center space-y-3 z-10 animate-in fade-in duration-300">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[#4b43c6] dark:text-indigo-300 text-xs font-montserrat font-semibold">
                    <IonLearnAIIcon className="w-3 h-3 text-[#4b43c6] dark:text-indigo-400 animate-spin" style={{ animationDuration: "5s" }} />
                    <span>IOnLearn Academic Dashboard</span>
                  </div>

                  <h4 className="font-cal text-base sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {language === "IND"
                      ? "Belajar Mandiri, Terarah, dan Hemat Data"
                      : "Self-Directed, Focused, and Low-Data Learning"}
                  </h4>

                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full mt-1">
                    <div className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-300 ${demoStep === 0
                      ? "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-xs"
                      : "bg-white/80 dark:bg-white/5 border-slate-200/80 dark:border-white/10"
                      }`}>
                      <BookOpen className="w-3.5 h-3.5 text-sky-500 mb-1" />
                      <div className="text-xs font-semibold text-slate-800 dark:text-white">Classroom Sync</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {language === "IND" ? "Otomatis Sinkron" : "Auto-Synced"}
                      </div>
                    </div>

                    <div className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-300 ${demoStep === 1
                      ? "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-xs"
                      : "bg-white/80 dark:bg-white/5 border-slate-200/80 dark:border-white/10"
                      }`}>
                      <MessageSquareText className="w-3.5 h-3.5 text-indigo-500 mb-1" />
                      <div className="text-xs font-semibold text-slate-800 dark:text-white">Tanya AI</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {language === "IND" ? "Tutor Sokratik" : "Socratic Tutor"}
                      </div>
                    </div>

                    <div className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-300 ${demoStep === 2
                      ? "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-xs"
                      : "bg-white/80 dark:bg-white/5 border-slate-200/80 dark:border-white/10"
                      }`}>
                      <FileText className="w-3.5 h-3.5 text-amber-500 mb-1" />
                      <div className="text-xs font-semibold text-slate-800 dark:text-white">Rangkuman</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {language === "IND" ? "Catatan Ringkas" : "Smart Summary"}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Progress indicator */}
                  <div className="w-full max-w-xs bg-slate-200 dark:bg-white/10 h-1 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-[#4b43c6] dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${((demoStep + 1) / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 2. AI CHATBOT */}
              {activeTab === "AI Chatbot" && (
                <div className="w-full max-w-md flex flex-col space-y-2 z-10 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <div className="w-6 h-6 rounded-md bg-[#4b43c6] flex items-center justify-center text-white">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold font-montserrat text-slate-900 dark:text-white">
                        IOnLearn Academic Tutor
                      </div>
                      <div className="text-xs text-slate-500 dark:text-indigo-300">
                        {language === "IND"
                          ? "Membedah rumus & konsep secara Sokratik"
                          : "Deconstructs formulas & concepts socratically"}
                      </div>
                    </div>
                  </div>

                  {/* Chat message bubbles */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-end">
                      <div className="bg-[#4b43c6] text-white px-3 py-1.5 rounded-2xl rounded-tr-xs max-w-[85%] text-left">
                        {language === "IND"
                          ? "Bagaimana konsep kerja Hukum Newton II?"
                          : "How does Newton's Second Law actually work?"}
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-2xl rounded-tl-xs max-w-[90%] text-left leading-relaxed">
                        <span className="font-semibold text-[#4b43c6] dark:text-indigo-300 block text-xs mb-0.5">
                          {language === "IND" ? "Inti Formula: ΣF = m · a" : "Core Formula: ΣF = m · a"}
                        </span>
                        {language === "IND"
                          ? "Gaya dorong (F) sebanding dengan percepatan (a). Semakin berat massa benda (m), semakin besar gaya dorong yang dibutuhkan."
                          : "Net force (F) is directly proportional to acceleration (a). The heavier an object's mass (m), the more force is needed to accelerate it."}
                      </div>
                    </div>
                  </div>

                  {/* Input Mock */}
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-400">
                    <span className="flex-1 text-left">
                      {language === "IND" ? "Tanyakan soal tugas kelasmu..." : "Ask about your course concepts or assignments..."}
                    </span>
                    <Send className="w-3 h-3 text-[#4b43c6] dark:text-indigo-400" />
                  </div>
                </div>
              )}

              {/* 3. TASKS MENU */}
              {activeTab === "Tasks Menu" && (
                <div className="w-full max-w-md flex flex-col space-y-1.5 z-10 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10 text-xs">
                    <span className="font-montserrat font-bold text-slate-900 dark:text-white">
                      Google Classroom Tasks
                    </span>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 px-2 py-0.5 rounded-full">
                      {language === "IND" ? "Tersinkron Otomatis" : "Auto-Synced"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {(language === "IND"
                       ? [
                          { title: "Tugas Fisika: Kinematika Gerak Lurus", class: "Fisika Dasar X-1", due: "Besok, 23:59", tag: "Tinggi", color: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-900" },
                          { title: "Analisis Puisi Chairil Anwar", class: "Bahasa Indonesia", due: "Kamis, 15:00", tag: "Sedang", color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-900" },
                          { title: "Praktikum Kimia Asam Basa", class: "Kimia Terapan", due: "Jumat, 12:00", tag: "Normal", color: "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-900" },
                        ]
                      : [
                          { title: "Physics: Linear Kinematics Motion", class: "Intro Physics 101", due: "Tomorrow, 23:59", tag: "High", color: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-900" },
                          { title: "Literature Essay: Modern Poetry", class: "English Literature", due: "Thursday, 15:00", tag: "Medium", color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-900" },
                          { title: "Chemistry Lab: Acid-Base Analysis", class: "Applied Chemistry", due: "Friday, 12:00", tag: "Normal", color: "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-900" },
                        ]
                    ).map((t, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left hover:border-indigo-400 transition-colors">
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[260px]">
                            {t.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {t.class} • {language === "IND" ? "Tenggat:" : "Due:"} {t.due}
                          </div>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${t.color}`}>
                          {t.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. TO-DO (Interactive Checklist) */}
              {activeTab === "To-Do" && (
                <div className="w-full max-w-md flex flex-col space-y-1.5 z-10 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10 text-xs">
                    <span className="font-montserrat font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5 text-[#4b43c6] dark:text-indigo-400" />
                      {language === "IND" ? "Target Belajar Harian (Klik untuk coba!)" : "Daily Study Goals (Click to interact!)"}
                    </span>
                    <span className="text-xs font-semibold text-[#4b43c6] dark:text-indigo-300">
                      {language === "IND"
                        ? `${todos.filter((t) => t.done).length} dari ${todos.length} selesai`
                        : `${todos.filter((t) => t.done).length} of ${todos.length} completed`}
                    </span>
                  </div>

                  <div className="space-y-1 text-left">
                    {todos.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleTodo(item.id)}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all cursor-pointer select-none ${item.done
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-700/70 dark:text-emerald-300/70 line-through"
                          : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white hover:border-[#4b43c6]"
                          }`}
                      >
                        {item.done ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xs truncate">
                          {language === "IND" ? item.textInd : item.textEng}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. AUTO-NOTES */}
              {activeTab === "Auto-Notes" && (
                <div className="w-full max-w-md flex flex-col space-y-2 z-10 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10 text-xs">
                    <span className="font-montserrat font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Low-Data AI Note Generator
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 px-2 py-0.5 rounded-full font-medium">
                      {language === "IND" ? "Hemat 85% Bandwidth" : "Save 85% Bandwidth"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <div className="text-xs uppercase font-bold text-[#4b43c6] dark:text-indigo-400 mb-0.5">
                        {language === "IND" ? "Ringkasan Poin Kunci" : "Key Concept Summary"}
                      </div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-white mb-1 truncate">
                        {language === "IND" ? "Termodinamika Dasar" : "Basic Thermodynamics"}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {language === "IND" ? (
                          <>
                            • Hukum 0: Kesetimbangan termal.<br />
                            • Hukum 1: Konservasi energi (ΔU = Q - W).<br />
                            • Hukum 2: Entropi sistem tertutup meningkat.
                          </>
                        ) : (
                          <>
                            • 0th Law: Thermal equilibrium.<br />
                            • 1st Law: Energy conservation (ΔU = Q - W).<br />
                            • 2nd Law: Closed-system entropy increases.
                          </>
                        )}
                      </p>
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                      <div className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                        {language === "IND" ? "Flashcard Interaktif" : "Interactive Flashcard"}
                      </div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-white mb-1">
                        {language === "IND" ? "Rumus Usaha Isobarik?" : "Isobaric Work Formula?"}
                      </div>
                      <div className="text-xs text-indigo-900 dark:text-indigo-200 bg-white/80 dark:bg-indigo-900/60 p-1 rounded border border-indigo-200 dark:border-indigo-700">
                        W = P · ΔV = P(V₂ - V₁)
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SVG Frame Overlay (frame.svg with notch and border) */}
          <div className="absolute inset-0 pointer-events-none select-none z-20">
            <svg
              viewBox="0 0 858 492"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-black dark:text-zinc-200"
            >
              <rect
                x="3.5"
                y="3.5"
                width="851"
                height="485"
                rx="11.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
              />
              <path
                d="M322.691 2H535.309C535.309 10.8366 528.146 18 519.309 18H338.691C329.854 18 322.691 10.8366 322.691 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Feature Tabs Selector (Single Selection Only) */}
      <div className="mt-8 sm:mt-10 p-1 flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full max-w-2xl mx-auto">
        {(
          ["Demo", "AI Chatbot", "Tasks Menu", "To-Do", "Auto-Notes"] as FeatureTab[]
        ).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleSelectTab(tab)}
              className={`font-montserrat text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${isActive
                ? "bg-[#4b43c6] text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md scale-105"
                : "bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 px-3.5 sm:px-4 py-2 rounded-full"
                }`}
            >
              {tabLabels[tab]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
