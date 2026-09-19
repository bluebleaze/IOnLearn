"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import {
  UserPreferences,
  AIConfig,
  DEFAULT_DATE_RANGE_MONTHS,
  ToastPosition,
} from "@/types";
import {
  loadPreferences,
  loadAIConfig,
  savePreferences,
  saveAIConfig,
} from "@/lib/taskStore";
import {
  Sun,
  Moon,
  Bell,
  CalendarDays,
  BookOpen,
  Cpu,
  Sparkles,
  Key,
  Server,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  Save,
  ArrowLeft,
  ChevronDown,
  RotateCcw,
  AlertCircle,
  MessageSquare,
  Columns2,
  PanelLeft,
  Brain,
  Zap,
  HelpCircle,
  Globe,
  X,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleThemeWithCircularAnimation } from "@/lib/theme";
import { toast } from "@/components/ui/sonner";

const GEMINI_MODELS = [
  { value: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite (Default Bawaan)" },
  { value: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash Lite" },
  { value: "gemini-3.6-flash", label: "Gemini 3.6 Flash (Rekomendasi)" },
  { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
  { value: "__CUSTOM__", label: "Tulis Nama Model Kustom..." },
];

const OPENAI_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Cepat & Efisien)" },
  { value: "gpt-4o", label: "GPT-4o (Model Flagship Cerdas)" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Klasik)" },
  { value: "deepseek-chat", label: "DeepSeek Chat" },
  { value: "__CUSTOM__", label: "Tulis Nama Model Kustom..." },
];

const DATE_RANGE_OPTIONS = [
  { value: 1, labelId: "1 Bulan", labelEn: "1 Month", descId: "Tugas paling baru", descEn: "Most recent tasks" },
  { value: 2, labelId: "2 Bulan", labelEn: "2 Months", descId: "Rekomendasi ideal (Bawaan)", descEn: "Recommended (Default)" },
  { value: 3, labelId: "3 Bulan", labelEn: "3 Months", descId: "1 Semester berjalan", descEn: "1 Current semester" },
  { value: 6, labelId: "6 Bulan", labelEn: "6 Months", descId: "Setengah tahun ajaran", descEn: "Half academic year" },
  { value: 12, labelId: "1 Tahun", labelEn: "1 Year", descId: "1 Tahun penuh", descEn: "1 Full year" },
  { value: 0, labelId: "Semua", labelEn: "All", descId: "Tanpa batas tanggal", descEn: "No date restrictions" },
];

const TOAST_POSITIONS: { id: ToastPosition; label: string; dotPos: string }[] = [
  { id: "top-left", label: "Kiri Atas", dotPos: "top-0.5 left-0.5" },
  { id: "top-center", label: "Tengah Atas", dotPos: "top-0.5 left-1/2 -translate-x-1/2" },
  { id: "top-right", label: "Kanan Atas (Default)", dotPos: "top-0.5 right-0.5" },
  { id: "bottom-left", label: "Kiri Bawah", dotPos: "bottom-0.5 left-0.5" },
  { id: "bottom-center", label: "Tengah Bawah", dotPos: "bottom-0.5 left-1/2 -translate-x-1/2" },
  { id: "bottom-right", label: "Kanan Bawah", dotPos: "bottom-0.5 right-0.5" },
];

import { useLanguage } from "@/context/LanguageContext";

export default function SettingsPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const { isEn, t, setLanguage: setGlobalLanguage, languageMode, setLanguageMode, detectedLanguage } = useLanguage();

  const [initialPrefs, setInitialPrefs] = useState<UserPreferences>({
    learningStyle: "Netral",
    explanationDetail: "Netral",
    aiTone: "Ramah",
    defaultStudyMode: "socratic",
    classroomDateRangeMonths: DEFAULT_DATE_RANGE_MONTHS,
    toastPosition: "top-right",
    language: "id",
  });

  const [initialConfig, setInitialConfig] = useState<AIConfig>({
    provider: "gemini",
    apiKey: "",
    baseUrl: "",
    model: "gemini-3.1-flash-lite",
  });

  const [prefs, setPrefs] = useState<UserPreferences>({
    learningStyle: "Netral",
    explanationDetail: "Netral",
    aiTone: "Ramah",
    defaultStudyMode: "socratic",
    classroomDateRangeMonths: DEFAULT_DATE_RANGE_MONTHS,
    toastPosition: "top-right",
    language: "id",
  });

  const [config, setConfig] = useState<AIConfig>({
    provider: "gemini",
    apiKey: "",
    baseUrl: "",
    model: "gemini-3.1-flash-lite",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkTheme = () => {
        setIsDark(document.documentElement.classList.contains("dark"));
      };
      checkTheme();

      const observer = new MutationObserver(() => {
        checkTheme();
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      const loadedPrefs = loadPreferences();
      const loadedConfig = loadAIConfig();
      if (loadedPrefs) {
        setPrefs(loadedPrefs);
        setInitialPrefs(loadedPrefs);
      }
      if (loadedConfig) {
        setConfig(loadedConfig);
        setInitialConfig(loadedConfig);
        if (loadedConfig.provider === "gemini_custom") {
          const isStandard = GEMINI_MODELS.some(
            (m) => m.value === loadedConfig.model
          );
          setIsCustomModel(!isStandard && Boolean(loadedConfig.model));
        } else if (loadedConfig.provider === "openai") {
          const isStandard = OPENAI_MODELS.some(
            (m) => m.value === loadedConfig.model
          );
          setIsCustomModel(!isStandard && Boolean(loadedConfig.model));
        }
      }

      return () => observer.disconnect();
    }
  }, []);

  const [pendingNavigationUrl, setPendingNavigationUrl] = useState<string | null>(null);

  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(prefs) !== JSON.stringify(initialPrefs) ||
      JSON.stringify(config) !== JSON.stringify(initialConfig)
    );
  }, [prefs, config, initialPrefs, initialConfig]);

  // Guard against browser tab closing or refreshing when hasChanges is true
  useEffect(() => {
    if (!hasChanges) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  // Guard against in-app link navigation (sidebar, navbar, breadcrumbs) when hasChanges is true
  useEffect(() => {
    if (!hasChanges) return;

    const handleInterceptClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a, button[data-sidebar='menu-button']");
      if (!link) return;

      // Allow clicks within the sticky bottom action bar or confirmation dialog
      if (link.closest("aside[aria-label='Aksi perubahan pengaturan']")) return;
      if (link.closest("[data-unsaved-modal='true']")) return;

      const anchor = link.tagName.toLowerCase() === "a" ? (link as HTMLAnchorElement) : link.querySelector("a");
      const href = anchor?.getAttribute("href");

      if (href && !href.startsWith("#") && !href.startsWith("javascript:") && href !== window.location.pathname) {
        e.preventDefault();
        e.stopPropagation();
        setPendingNavigationUrl(href);
      }
    };

    document.addEventListener("click", handleInterceptClick, true);
    return () => {
      document.removeEventListener("click", handleInterceptClick, true);
    };
  }, [hasChanges]);

  const handleSelectTheme = (targetTheme: "light" | "dark", e: React.MouseEvent) => {
    if (typeof document === "undefined") return;
    const currentIsDark = document.documentElement.classList.contains("dark");
    if ((targetTheme === "dark" && !currentIsDark) || (targetTheme === "light" && currentIsDark)) {
      const nextTheme = toggleThemeWithCircularAnimation(e);
      setIsDark(nextTheme === "dark");
    }
  };

  const handleToastPositionChange = (pos: ToastPosition) => {
    setPrefs((prev) => ({ ...prev, toastPosition: pos }));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("toast-position-changed", { detail: { position: pos } })
      );
    }
  };

  const handleTaskModalStyleChange = (style: "drawer" | "modal") => {
    setPrefs((prev) => ({ ...prev, taskModalStyle: style }));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("task-modal-style-changed", { detail: { style } })
      );
    }
  };

  const handleChatLayoutChange = (layout: "sidebar" | "split" | "minimal") => {
    setPrefs((prev) => ({ ...prev, chatLayout: layout }));
  };

  const handleLanguageChange = (lang: "id" | "en") => {
    setPrefs((prev) => ({ ...prev, language: lang }));
    setGlobalLanguage(lang);
    setLanguageMode(lang);
  };

  const handleLanguageModeAuto = () => {
    setLanguageMode("auto");
    setPrefs((prev) => ({ ...prev, language: detectedLanguage }));
  };

  const handleProviderChange = (
    provider: "gemini" | "gemini_custom" | "openai"
  ) => {
    let defaultModel = "";
    if (provider === "gemini_custom") defaultModel = "gemini-3.1-flash-lite";
    else if (provider === "openai") defaultModel = "gpt-4o-mini";

    setConfig((prev) => ({
      ...prev,
      provider,
      model: prev.model || defaultModel,
      baseUrl:
        provider === "openai"
          ? prev.baseUrl || "https://api.openai.com/v1"
          : "",
    }));
    setIsCustomModel(false);
  };

  const handleSave = () => {
    savePreferences(prefs);
    saveAIConfig(config);
    setInitialPrefs(prefs);
    setInitialConfig(config);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("toast-position-changed", {
          detail: { position: prefs.toastPosition || "top-right" },
        })
      );
      window.dispatchEvent(
        new CustomEvent("task-modal-style-changed", {
          detail: { style: prefs.taskModalStyle || "drawer" },
        })
      );
      window.dispatchEvent(new Event("taskStoreChange"));
    }
    toast.success(isEn ? "Settings Saved Successfully" : "Pengaturan Berhasil Disimpan", {
      description: isEn
        ? "All learning preferences, date filters, and AI configurations have been updated."
        : "Semua preferensi belajar, filter waktu, dan konfigurasi AI telah diperbarui.",
    });
  };

  const handleDiscard = () => {
    setPrefs(initialPrefs);
    setConfig(initialConfig);
    if (initialPrefs.language) {
      setGlobalLanguage(initialPrefs.language);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("toast-position-changed", {
          detail: { position: initialPrefs.toastPosition || "top-right" },
        })
      );
      window.dispatchEvent(
        new CustomEvent("task-modal-style-changed", {
          detail: { style: initialPrefs.taskModalStyle || "drawer" },
        })
      );
    }
    if (initialConfig.provider === "gemini_custom") {
      const isStandard = GEMINI_MODELS.some(
        (m) => m.value === initialConfig.model
      );
      setIsCustomModel(!isStandard && Boolean(initialConfig.model));
    } else if (initialConfig.provider === "openai") {
      const isStandard = OPENAI_MODELS.some(
        (m) => m.value === initialConfig.model
      );
      setIsCustomModel(!isStandard && Boolean(initialConfig.model));
    }
    toast.info(isEn ? "Changes Discarded" : "Perubahan Dibatalkan", {
      description: isEn
        ? "Settings restored to previous saved state."
        : "Pengaturan dikembalikan ke kondisi tersimpan sebelumnya.",
    });
  };

  const getCutoffDescription = (
    months: number = DEFAULT_DATE_RANGE_MONTHS
  ) => {
    if (!months || months <= 0) {
      return isEn
        ? "Displaying all Google Classroom task history without date restrictions."
        : "Menampilkan seluruh riwayat tugas Google Classroom tanpa batasan tanggal waktu.";
    }
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    const monthsIndo = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const monthsEn = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthName = isEn ? monthsEn[d.getMonth()] : monthsIndo[d.getMonth()];
    return isEn
      ? `Displaying tasks due or assigned since ${monthName} ${d.getDate()}, ${d.getFullYear()} to present.`
      : `Menampilkan tugas dengan tenggat atau dibuat sejak ${d.getDate()} ${monthName} ${d.getFullYear()} hingga sekarang.`;
  };

  return (
    <Shell>
      <div className="relative max-w-3xl w-full space-y-8 pb-28">
        {/* Clean Page Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/70 dark:border-white/[0.08]">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f5f5f5] font-heading">
              {t.settings.pageTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#a3a3a3]">
              {t.settings.pageSubtitle}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (hasChanges) {
                setPendingNavigationUrl("/");
              } else {
                router.push("/");
              }
            }}
            className="self-start sm:self-auto h-9 px-3 rounded-[10px] gap-1.5 text-xs text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f5f5f5] border-slate-200/80 dark:border-white/[0.08] dark:bg-[#141414] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEn ? "Back to Dashboard" : "Kembali ke Dashboard"}</span>
          </Button>
        </div>

        {/* SECTION 1: Tampilan & Tema */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">
                {t.settings.secThemeTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                {t.settings.secThemeDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Light Mode */}
            <button
              type="button"
              onClick={(e) => handleSelectTheme("light", e)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${!isDark
                ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/20 shadow-2xs"
                : "border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-[#161616] text-slate-700 dark:text-[#a3a3a3]"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-[#f5f5f5]">
                    {t.settings.themeLight}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                    {t.settings.themeLightDesc}
                  </div>
                </div>
              </div>
              {!isDark && (
                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>

            {/* Dark Mode */}
            <button
              type="button"
              onClick={(e) => handleSelectTheme("dark", e)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${isDark
                ? "border-indigo-500/60 bg-indigo-950/40 text-indigo-200 ring-1 ring-indigo-500/30 shadow-2xs"
                : "border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-[#161616] text-slate-700 dark:text-[#a3a3a3]"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-[#f5f5f5]">
                    {t.settings.themeDark}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                    {t.settings.themeDarkDesc}
                  </div>
                </div>
              </div>
              {isDark && (
                <div className="w-4 h-4 rounded-full bg-slate-100 text-[#0c0c0c] flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          </div>
        </section>

        <hr className="border-slate-200/60 dark:border-white/[0.06]" />

        {/* SECTION: Bahasa Antarmuka (Language) */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">
                {prefs.language === "en" ? "Interface Language" : "Bahasa Antarmuka"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                {prefs.language === "en"
                  ? "Select your preferred language for the Dashboard and platform navigation."
                  : "Pilih bahasa tampilan untuk Dashboard dan navigasi antarmuka."}
              </p>
            </div>
          </div>


          <div className="space-y-2.5 pt-1">
            {/* Otomatis / Auto-detect */}
            <button
              type="button"
              onClick={handleLanguageModeAuto}
              className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                languageMode === "auto"
                  ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/20 shadow-2xs"
                  : "border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-[#161616] text-slate-700 dark:text-[#a3a3a3]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#202020] text-lg flex items-center justify-center shrink-0 shadow-2xs">
                  🌐
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-[#f5f5f5] flex items-center gap-1.5">
                    <span>{prefs.language === "en" ? "Automatic (Detect)" : "Otomatis (Deteksi)"}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-medium">
                      {prefs.language === "en" ? "Recommended" : "Rekomendasi"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                    {prefs.language === "en"
                      ? `Detected: ${detectedLanguage === "id" ? "Bahasa Indonesia 🇮🇩" : "English 🇬🇧"} · via timezone & browser locale`
                      : `Terdeteksi: ${detectedLanguage === "id" ? "Bahasa Indonesia 🇮🇩" : "English 🇬🇧"} · dari timezone & locale browser`}
                  </div>
                </div>
              </div>
              {languageMode === "auto" && (
                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>

            {/* Manual: 2-col grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Bahasa Indonesia */}
              <button
                type="button"
                onClick={() => handleLanguageChange("id")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  languageMode !== "auto" && (prefs.language || "id") === "id"
                    ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/20 shadow-2xs"
                    : "border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-[#161616] text-slate-700 dark:text-[#a3a3a3]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#202020] text-lg flex items-center justify-center shrink-0 shadow-2xs">
                    🇮🇩
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-[#f5f5f5] flex items-center gap-1.5">
                      <span>Bahasa Indonesia</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium">
                        Bawaan
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                      Bahasa standar dengan istilah akademik lokal
                    </div>
                  </div>
                </div>
                {languageMode !== "auto" && (prefs.language || "id") === "id" && (
                  <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* English */}
              <button
                type="button"
                onClick={() => handleLanguageChange("en")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  languageMode !== "auto" && prefs.language === "en"
                    ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/20 shadow-2xs"
                    : "border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-[#161616] text-slate-700 dark:text-[#a3a3a3]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#202020] text-lg flex items-center justify-center shrink-0 shadow-2xs">
                    🇬🇧
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-[#f5f5f5]">
                      English
                    </div>
                    <div className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                      Standard English interface for dashboard & controls
                    </div>
                  </div>
                </div>
                {languageMode !== "auto" && prefs.language === "en" && (
                  <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </section>


        <hr className="border-slate-200/60 dark:border-white/[0.06]" />

        {/* SECTION 2: Posisi Notifikasi */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">
                  {t.settings.secToastTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                  {t.settings.secToastDesc}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentLabel =
                  TOAST_POSITIONS.find(
                    (p) => p.id === (prefs.toastPosition || "top-right")
                  )?.label || "Kanan Atas";
                toast.info(isEn ? `Toast Notification Test (${currentLabel})` : `Uji Coba Notifikasi (${currentLabel})`, {
                  description: isEn ? `Preview notification position at ${currentLabel}.` : `Preview posisi notifikasi pop-up di sudut ${currentLabel}.`,
                });
              }}
              className="h-8 px-2.5 rounded-[8px] gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-900/40 cursor-pointer"
            >
              <Bell className="w-3 h-3" />
              <span>{isEn ? "Test Toast" : "Uji Coba"}</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {TOAST_POSITIONS.map((pos) => {
              const isSelected = (prefs.toastPosition || "top-right") === pos.id;
              const posLabel = isEn ? (
                pos.id === "top-left" ? "Top Left" :
                pos.id === "top-center" ? "Top Center" :
                pos.id === "top-right" ? "Top Right (Default)" :
                pos.id === "bottom-left" ? "Bottom Left" :
                pos.id === "bottom-center" ? "Bottom Center" : "Bottom Right"
              ) : pos.label;
              return (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => handleToastPositionChange(pos.id)}
                  className={`relative p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center justify-between gap-2 ${isSelected
                    ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/20 font-semibold shadow-2xs"
                    : "border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-[#161616] text-slate-700 dark:text-[#a3a3a3]"
                    }`}
                >
                  {/* Miniature Screen Indicator */}
                  <div className="relative w-6 h-4.5 rounded-[4px] border border-slate-300/80 dark:border-white/15 bg-slate-100 dark:bg-[#181818] shrink-0 overflow-hidden shadow-2xs">
                    <span
                      className={`absolute w-2 h-1 rounded-[1px] transition-colors ${isSelected
                        ? "bg-indigo-600 dark:bg-indigo-400"
                        : "bg-slate-400 dark:bg-slate-600"
                        } ${pos.dotPos}`}
                    />
                  </div>

                  <span className="truncate text-left flex-1">{posLabel}</span>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <hr className="border-slate-200/60 dark:border-white/[0.06]" />

        {/* SECTION 2.5: Gaya Pop-up Detail Tugas */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">
                {t.settings.secModalTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                {t.settings.secModalDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Drawer Style */}
            <button
              type="button"
              onClick={() => handleTaskModalStyleChange("drawer")}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${(prefs.taskModalStyle ?? "drawer") === "drawer"
                ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/20 shadow-2xs"
                : "border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-[#161616] text-slate-700 dark:text-[#a3a3a3]"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  {/* Visual mini-drawer icon */}
                  <div className="w-4 h-3.5 border border-current rounded-[2px] flex justify-end">
                    <div className="w-1.5 h-full bg-current opacity-80" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-[#f5f5f5]">
                    Slide-over Drawer
                  </div>
                  <div className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                    {isEn ? "Right sidebar panel, task list stays visible" : "Panel samping kanan, daftar tugas tetap terlihat"}
                  </div>
                </div>
              </div>
              {(prefs.taskModalStyle ?? "drawer") === "drawer" && (
                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>

            {/* Modal Dialog Style */}
            <button
              type="button"
              onClick={() => handleTaskModalStyleChange("modal")}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${prefs.taskModalStyle === "modal"
                ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/20 shadow-2xs"
                : "border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-[#161616] text-slate-700 dark:text-[#a3a3a3]"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 dark:bg-[#202020] dark:text-slate-300 flex items-center justify-center shrink-0">
                  {/* Visual mini-modal icon */}
                  <div className="w-4 h-3.5 border border-current rounded-[2px] flex items-center justify-center">
                    <div className="w-2 h-1.5 bg-current opacity-70 rounded-[1px]" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-[#f5f5f5]">
                    {isEn ? "Centered Modal (Recommended)" : "Centered Modal (Rekomendasi)"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                    {isEn ? "Focused dialog window at center of screen" : "Jendela dialog fokus di tengah layar"}
                  </div>
                </div>
              </div>
              {prefs.taskModalStyle === "modal" && (
                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          </div>
        </section>

        <hr className="border-slate-200/60 dark:border-white/[0.06]" />

        {/* SECTION 2.5: Tata Letak AI Chat */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">
                {isEn ? "AI Chat & Workspace Layout" : "Tata Letak AI Chat & Workspace"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                {isEn
                  ? "Choose your preferred layout for conversation and study guidance (/chat)."
                  : "Pilih format tampilan ruang percakapan dan bimbingan belajar AI (/chat)."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Sidebar + Canvas Layout */}
            <button
              type="button"
              onClick={() => handleChatLayoutChange("sidebar")}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                (prefs.chatLayout ?? "sidebar") === "sidebar"
                  ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/20 shadow-2xs"
                  : "border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-[#161616] text-slate-700 dark:text-[#a3a3a3]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <PanelLeft className="w-4 h-4" />
                </div>
                {(prefs.chatLayout ?? "sidebar") === "sidebar" && (
                  <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-[#f5f5f5]">
                  {isEn ? "Sidebar + Feed (Standard)" : "Sidebar + Feed (Standar)"}
                </div>
                <div className="text-xs text-slate-500 dark:text-[#a3a3a3] mt-0.5 leading-relaxed">
                  {isEn
                    ? "History sidebar on left and focused chat feed in center."
                    : "Sidebar riwayat di kiri dan feed percakapan fokus di tengah."}
                </div>
              </div>
            </button>

            {/* Split Dual Workspace Layout */}
            <button
              type="button"
              onClick={() => handleChatLayoutChange("split")}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                prefs.chatLayout === "split"
                  ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/20 shadow-2xs"
                  : "border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-[#161616] text-slate-700 dark:text-[#a3a3a3]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <Columns2 className="w-4 h-4" />
                </div>
                {prefs.chatLayout === "split" && (
                  <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-[#f5f5f5]">
                  {isEn ? "Dual Split Workspace" : "Dual Split Workspace"}
                </div>
                <div className="text-xs text-slate-500 dark:text-[#a3a3a3] mt-0.5 leading-relaxed">
                  {isEn
                    ? "AI chat on left and study materials / notes side-by-side on right."
                    : "Chat AI di kiri dan panel materi / catatan berdampingan di kanan."}
                </div>
              </div>
            </button>

            {/* Minimalist Focused Layout */}
            <button
              type="button"
              onClick={() => handleChatLayoutChange("minimal")}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                prefs.chatLayout === "minimal"
                  ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/20 shadow-2xs"
                  : "border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-[#161616] text-slate-700 dark:text-[#a3a3a3]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <div className="w-4 h-3.5 border border-current rounded-[2px] flex items-center justify-center">
                    <div className="w-2.5 h-0.5 bg-current rounded-full" />
                  </div>
                </div>
                {prefs.chatLayout === "minimal" && (
                  <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-[#f5f5f5]">
                  {isEn ? "Minimalist Focused" : "Minimalis Terfokus"}
                </div>
                <div className="text-xs text-slate-500 dark:text-[#a3a3a3] mt-0.5 leading-relaxed">
                  {isEn
                    ? "Cleanest workspace, conversation history in slide-over menu."
                    : "Ruang chat bersih maksimal, riwayat percakapan dalam menu geser."}
                </div>
              </div>
            </button>
          </div>
        </section>

        <hr className="border-slate-200/60 dark:border-white/[0.06]" />

        {/* SECTION 3: Filter Rentang Tanggal Classroom */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">
                {isEn ? "Google Classroom Date Range" : "Rentang Waktu Tugas Google Classroom"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                {isEn
                  ? "Limit past assignments so synchronization stays neat and focused on the current semester."
                  : "Batasi tugas lampau agar sinkronisasi tetap rapi dan fokus pada semester ini."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {DATE_RANGE_OPTIONS.map((opt) => {
              const isSelected =
                (prefs.classroomDateRangeMonths ?? DEFAULT_DATE_RANGE_MONTHS) ===
                opt.value;
              const optLabel = isEn ? opt.labelEn : opt.labelId;
              const optDesc = isEn ? opt.descEn : opt.descId;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setPrefs({ ...prefs, classroomDateRangeMonths: opt.value })
                  }
                  className={`p-3 text-left rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${isSelected
                    ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500/20 shadow-2xs"
                    : "border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-[#161616]"
                    }`}
                >
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-semibold ${isSelected
                        ? "text-indigo-950 dark:text-indigo-200"
                        : "text-slate-900 dark:text-[#f5f5f5]"
                        }`}
                    >
                      {optLabel}
                    </div>
                    <div
                      className={`text-xs truncate ${isSelected
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-slate-500 dark:text-[#a3a3a3]"
                        } mt-0.5`}
                    >
                      {optDesc}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-indigo-600 dark:bg-slate-100 text-white dark:text-[#0c0c0c] flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/[0.06] text-xs text-slate-600 dark:text-[#a3a3a3] leading-relaxed">
            <span className="font-semibold text-slate-900 dark:text-[#f5f5f5]">
              {isEn ? "Active Coverage: " : "Cakupan Aktif: "}
            </span>
            {getCutoffDescription(
              prefs.classroomDateRangeMonths ?? DEFAULT_DATE_RANGE_MONTHS
            )}
          </div>
        </section>

        <hr className="border-slate-200/60 dark:border-white/[0.06]" />

        {/* SECTION 4: Preferensi Gaya Belajar & AI */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">
                {isEn ? "Learning Preferences & AI Character" : "Preferensi Belajar & Karakter AI"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                {isEn
                  ? "Customize explanation approach and tone of voice when AI tutor guides you."
                  : "Sesuaikan pendekatan penjelasan dan gaya tutur AI tutor saat mendampingi Anda."}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#d4d4d4]">
                {isEn ? "Personal Learning Style" : "Gaya Belajar Personal"}
              </label>
              <div className="relative">
                <select
                  value={prefs.learningStyle}
                  onChange={(e) =>
                    setPrefs({ ...prefs, learningStyle: e.target.value })
                  }
                  className="w-full appearance-none px-3.5 pr-9 py-2.5 text-xs bg-slate-50/50 dark:bg-[#141414] border border-slate-200/80 dark:border-white/[0.08] rounded-[10px] text-slate-900 dark:text-[#f5f5f5] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition cursor-pointer"
                >
                  <option value="Netral">{isEn ? "Neutral / General" : "Netral / Umum"}</option>
                  <option value="Visual">{isEn ? "Visual (More Visual Examples & Analogies)" : "Visual (Perbanyak Contoh Visual & Analogi)"}</option>
                  <option value="Membaca/Menulis">{isEn ? "Reading/Writing (Detailed Text Explanations)" : "Membaca/Menulis (Penjelasan Teks Mendetail)"}</option>
                  <option value="Praktik">{isEn ? "Kinesthetic / Practical (Focus on Exercises & Steps)" : "Praktik (Fokus Latihan & Langkah Eksekusi)"}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#737373]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#d4d4d4]">
                {isEn ? "AI Tone & Voice" : "Gaya Bahasa (Tone) AI"}
              </label>
              <div className="relative">
                <select
                  value={prefs.aiTone}
                  onChange={(e) =>
                    setPrefs({ ...prefs, aiTone: e.target.value })
                  }
                  className="w-full appearance-none px-3.5 pr-9 py-2.5 text-xs bg-slate-50/50 dark:bg-[#141414] border border-slate-200/80 dark:border-white/[0.08] rounded-[10px] text-slate-900 dark:text-[#f5f5f5] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition cursor-pointer"
                >
                  <option value="Ramah">{isEn ? "Friendly & Motivating" : "Ramah & Memotivasi"}</option>
                  <option value="Tegas">{isEn ? "Direct & Concise (To the point)" : "Tegas & Langsung (To the point)"}</option>
                  <option value="Sokratik">{isEn ? "Socratic (Guiding Reflective Questions)" : "Sokratik (Memancing Pertanyaan Reflektif)"}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#737373]" />
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2 pt-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#d4d4d4]">
                {isEn ? "Default AI Assistant Study Mode" : "Mode Belajar Asisten AI (Default)"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: "socratic",
                    label: isEn ? "Socratic" : "Sokratik",
                    desc: isEn ? "Guided step-by-step thinking with reflective questions." : "Membimbing berpikir bertahap dengan pertanyaan pemantik reflektif.",
                    icon: Brain,
                  },
                  {
                    id: "direct",
                    label: isEn ? "Concise" : "Ringkas",
                    desc: isEn ? "Concise answers, to-the-point, focused on core subject." : "Jawaban padat, to-the-point, fokus inti materi.",
                    icon: Zap,
                  },
                  {
                    id: "quizzer",
                    label: isEn ? "Quiz" : "Kuis",
                    desc: isEn ? "Interactive question challenges & practice drills." : "Tantangan soal interaktif & latihan mandiri.",
                    icon: HelpCircle,
                  },
                ].map((mode) => {
                  const isSelected = (prefs.defaultStudyMode || "socratic") === mode.id;
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPrefs({ ...prefs, defaultStudyMode: mode.id as any })}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/80 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/30"
                          : "bg-slate-50/50 dark:bg-[#141414] border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-[#ccc] hover:bg-slate-100 dark:hover:bg-[#1a1a1a]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                        <span className="font-semibold text-xs text-slate-900 dark:text-[#f5f5f5]">{mode.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-[#888] leading-relaxed">{mode.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <hr className="border-slate-200/60 dark:border-white/[0.06]" />

        {/* SECTION 5: Mesin AI & API Key */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">
                {isEn ? "AI Providers & API Integration" : "Penyedia AI & Integrasi API"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                {isEn
                  ? "Choose built-in cloud AI or connect your personal API keys."
                  : "Pilih model kecerdasan buatan bawaan atau sambungkan kunci API pribadi Anda."}
              </p>
            </div>
          </div>

          {/* 3 Provider Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {[
              {
                id: "gemini",
                label: isEn ? "Built-in Gemini" : "Gemini Bawaan",
                desc: isEn ? "Free & Ready to Use" : "Gratis & Langsung Siap Pakai",
                icon: Sparkles,
              },
              {
                id: "gemini_custom",
                label: isEn ? "Personal Gemini" : "Gemini Pribadi",
                desc: isEn ? "Google AI Studio API Key" : "API Key Google AI Studio",
                icon: Key,
              },
              {
                id: "openai",
                label: "OpenAI / Custom",
                desc: "GPT-4o, DeepSeek, OpenRouter",
                icon: Server,
              },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleProviderChange(opt.id as any)}
                className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${config.provider === opt.id
                  ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500/20 shadow-2xs"
                  : "border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-[#161616]"
                  }`}
              >
                <div className="flex items-center justify-between w-full">
                  <opt.icon
                    className={`w-4 h-4 ${config.provider === opt.id
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-400 dark:text-[#737373]"
                      }`}
                  />
                  {config.provider === opt.id && (
                    <div className="w-4 h-4 rounded-full bg-indigo-600 dark:bg-slate-100 text-white dark:text-[#0c0c0c] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <div
                    className={`text-xs font-semibold ${config.provider === opt.id
                      ? "text-indigo-950 dark:text-indigo-200"
                      : "text-slate-900 dark:text-[#f5f5f5]"
                      }`}
                  >
                    {opt.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-[#a3a3a3] mt-0.5">
                    {opt.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* DEFAULT GEMINI NOTICE */}
          {config.provider === "gemini" && (
            <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
              <div className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{isEn ? "Google Gemini Cloud Server Active" : "Google Gemini Cloud Server Aktif"}</span>
              </div>
              <p className="text-xs text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed">
                {isEn
                  ? "Application connected to default cloud server. No manual API key required to start analyzing tasks and chatting with AI Tutor."
                  : "Aplikasi terhubung ke backend server bawaan. Anda tidak perlu memasukkan API key manual untuk mulai menganalisis tugas dan berdiskusi dengan AI Tutor."}
              </p>
            </div>
          )}

          {/* CUSTOM GEMINI SETTINGS */}
          {config.provider === "gemini_custom" && (
            <div className="space-y-4 p-4 rounded-xl bg-slate-50/60 dark:bg-[#141414] border border-slate-200/80 dark:border-white/[0.08]">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-[#d4d4d4]">
                    <Key className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Google Gemini API Key</span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{isEn ? "Get Free API Key" : "Dapatkan API Key Gratis"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    placeholder="AIzaSy..."
                    value={config.apiKey || ""}
                    onChange={(e) =>
                      setConfig({ ...config, apiKey: e.target.value })
                    }
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-white/[0.08] rounded-[10px] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono text-slate-900 dark:text-[#f5f5f5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    {showApiKey ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-[#d4d4d4] mb-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{isEn ? "Gemini Model" : "Model Gemini"}</span>
                </label>
                {!isCustomModel ? (
                  <div className="relative">
                    <select
                      value={config.model || "gemini-3.1-flash-lite"}
                      onChange={(e) => {
                        if (e.target.value === "__CUSTOM__") {
                          setIsCustomModel(true);
                          setConfig({ ...config, model: "" });
                        } else {
                          setConfig({ ...config, model: e.target.value });
                        }
                      }}
                      className="w-full appearance-none px-3.5 pr-9 py-2.5 text-xs bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-white/[0.08] rounded-[10px] text-slate-900 dark:text-[#f5f5f5] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition cursor-pointer"
                    >
                      {GEMINI_MODELS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.value === "__CUSTOM__"
                            ? (isEn ? "Write Custom Model Name..." : m.label)
                            : isEn
                            ? m.label.replace("Default Bawaan", "Default").replace("Rekomendasi", "Recommended")
                            : m.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#737373]" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. gemini-2.0-flash"
                      value={config.model || ""}
                      onChange={(e) =>
                        setConfig({ ...config, model: e.target.value })
                      }
                      className="flex-1 px-3.5 py-2.5 text-xs bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-white/[0.08] rounded-[10px] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono text-slate-900 dark:text-[#f5f5f5]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCustomModel(false);
                        setConfig({
                          ...config,
                          model: "gemini-3.1-flash-lite",
                        });
                      }}
                      className="text-xs h-9 rounded-[10px]"
                    >
                      {isEn ? "Standard Options" : "Pilihan Standar"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OPENAI / CUSTOM ENDPOINT */}
          {config.provider === "openai" && (
            <div className="space-y-4 p-4 rounded-xl bg-slate-50/60 dark:bg-[#141414] border border-slate-200/80 dark:border-white/[0.08]">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-[#d4d4d4] mb-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Base URL Endpoint</span>
                </label>
                <input
                  type="text"
                  placeholder="https://api.openai.com/v1 atau https://openrouter.ai/api/v1"
                  value={config.baseUrl || ""}
                  onChange={(e) =>
                    setConfig({ ...config, baseUrl: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-white/[0.08] rounded-[10px] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono text-slate-900 dark:text-[#f5f5f5]"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-[#d4d4d4] mb-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>API Key</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    placeholder="sk-..."
                    value={config.apiKey || ""}
                    onChange={(e) =>
                      setConfig({ ...config, apiKey: e.target.value })
                    }
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-white/[0.08] rounded-[10px] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono text-slate-900 dark:text-[#f5f5f5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    {showApiKey ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-[#d4d4d4] mb-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Model</span>
                </label>
                {!isCustomModel ? (
                  <div className="relative">
                    <select
                      value={config.model || "gpt-4o-mini"}
                      onChange={(e) => {
                        if (e.target.value === "__CUSTOM__") {
                          setIsCustomModel(true);
                          setConfig({ ...config, model: "" });
                        } else {
                          setConfig({ ...config, model: e.target.value });
                        }
                      }}
                      className="w-full appearance-none px-3.5 pr-9 py-2.5 text-xs bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-white/[0.08] rounded-[10px] text-slate-900 dark:text-[#f5f5f5] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition cursor-pointer"
                    >
                      {OPENAI_MODELS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.value === "__CUSTOM__"
                            ? (isEn ? "Write Custom Model Name..." : m.label)
                            : isEn
                            ? m.label.replace("Cepat & Efisien", "Fast & Efficient").replace("Model Flagship Cerdas", "Smart Flagship").replace("Klasik", "Classic")
                            : m.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#737373]" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. gpt-4o-mini, deepseek/deepseek-r1"
                      value={config.model || ""}
                      onChange={(e) =>
                        setConfig({ ...config, model: e.target.value })
                      }
                      className="flex-1 px-3.5 py-2.5 text-xs bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-white/[0.08] rounded-[10px] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono text-slate-900 dark:text-[#f5f5f5]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCustomModel(false);
                        setConfig({ ...config, model: "gpt-4o-mini" });
                      }}
                      className="text-xs h-9 rounded-[10px]"
                    >
                      {isEn ? "Standard Options" : "Pilihan Standar"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <hr className="border-slate-200/60 dark:border-white/[0.06]" />

        {/* SECTION: Panduan & Tur Fitur */}
        <section className="space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#141414]/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">
                  {isEn ? "Feature Tour & Learning Guide" : "Panduan & Tur Fitur IOnLearn"}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#a3a3a3]">
                  {isEn
                    ? "Revisit the visual onboarding tour and study workflow overview anytime."
                    : "Buka kembali tur interaktif yang menjelaskan fungsi setiap fitur dan alur kerja di IOnLearn."}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent("start-feature-tour"))}
              className="text-xs h-8.5 px-3.5 rounded-[10px] border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isEn ? "Launch Tour" : "Mulai Tur"}</span>
            </Button>
          </div>
        </section>

        {/* STICKY BOTTOM ACTION BAR (Centered at bottom when there are unsaved changes) */}
        {hasChanges && (
          <aside
            aria-label="Aksi perubahan pengaturan"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg sm:w-auto sm:min-w-[440px] bg-white/95 dark:bg-[#141414]/95 backdrop-blur-md border border-slate-200/80 dark:border-white/[0.1] shadow-2xl shadow-slate-900/15 dark:shadow-black/60 rounded-2xl p-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex size-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2.5 bg-amber-500"></span>
              </div>
              <div className="text-xs font-medium text-slate-800 dark:text-[#e5e5e5] truncate">
                {isEn ? "Unsaved changes" : "Perubahan belum disimpan"}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDiscard}
                className="h-8 px-2.5 rounded-[8px] gap-1 text-xs text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f5f5f5] hover:bg-slate-100 dark:hover:bg-[#202020] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isEn ? "Discard" : "Batalkan"}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                className="h-8 px-3.5 rounded-[8px] gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-[#f5f5f5] dark:text-[#0c0c0c] dark:hover:bg-white shadow-2xs active:scale-95 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isEn ? "Save" : "Simpan"}</span>
              </Button>
            </div>
          </aside>
        )}

        {/* ── UNSAVED CHANGES NAVIGATION CONFIRMATION MODAL ── */}
        {pendingNavigationUrl && (
          <div
            data-unsaved-modal="true"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setPendingNavigationUrl(null)}
          >
            <div
              className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-[#282828] rounded-xl shadow-xl p-3.5 sm:p-4 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close (X) button at top right */}
              <button
                type="button"
                onClick={() => setPendingNavigationUrl(null)}
                className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-[#eee] hover:bg-slate-100 dark:hover:bg-[#222] transition cursor-pointer"
                title={isEn ? "Close dialog" : "Tutup dialog"}
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start gap-2.5 pr-6">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#f0f0f0] leading-snug">
                    {isEn ? "Save Settings Changes?" : "Simpan Perubahan Pengaturan?"}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#a0a0a0] leading-normal">
                    {isEn
                      ? "You have unsaved changes. Would you like to save changes before navigating away?"
                      : "Anda memiliki perubahan yang belum disimpan. Ingin menyimpan perubahan sebelum berpindah halaman?"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2.5 mt-2.5 border-t border-slate-100 dark:border-[#242424]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleDiscard();
                    const target = pendingNavigationUrl;
                    setPendingNavigationUrl(null);
                    if (target) router.push(target);
                  }}
                  className="text-xs text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer h-7.5 px-3 rounded-lg font-medium"
                >
                  {isEn ? "Discard Changes" : "Buang Perubahan"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    handleSave();
                    const target = pendingNavigationUrl;
                    setPendingNavigationUrl(null);
                    if (target) router.push(target);
                  }}
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs cursor-pointer h-7.5 px-3.5 rounded-lg"
                >
                  {isEn ? "Save & Continue" : "Simpan & Lanjutkan"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}