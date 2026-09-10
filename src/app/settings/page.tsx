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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleThemeWithCircularAnimation } from "@/lib/theme";
import { toast } from "@/components/ui/sonner";

const GEMINI_MODELS = [
  { value: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite (Default Bawaan)" },
  { value: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash Lite" },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
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
  { value: 1, label: "1 Bulan", desc: "Tugas paling baru" },
  { value: 2, label: "2 Bulan", desc: "Rekomendasi ideal (Bawaan)" },
  { value: 3, label: "3 Bulan", desc: "1 Semester berjalan" },
  { value: 6, label: "6 Bulan", desc: "Setengah tahun ajaran" },
  { value: 12, label: "1 Tahun", desc: "1 Tahun penuh" },
  { value: 0, label: "Semua", desc: "Tanpa batas tanggal" },
];

const TOAST_POSITIONS: { id: ToastPosition; label: string; dotPos: string }[] = [
  { id: "top-left", label: "Kiri Atas", dotPos: "top-0.5 left-0.5" },
  { id: "top-center", label: "Tengah Atas", dotPos: "top-0.5 left-1/2 -translate-x-1/2" },
  { id: "top-right", label: "Kanan Atas (Default)", dotPos: "top-0.5 right-0.5" },
  { id: "bottom-left", label: "Kiri Bawah", dotPos: "bottom-0.5 left-0.5" },
  { id: "bottom-center", label: "Tengah Bawah", dotPos: "bottom-0.5 left-1/2 -translate-x-1/2" },
  { id: "bottom-right", label: "Kanan Bawah", dotPos: "bottom-0.5 right-0.5" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);

  const [initialPrefs, setInitialPrefs] = useState<UserPreferences>({
    learningStyle: "Netral",
    explanationDetail: "Netral",
    aiTone: "Ramah",
    defaultStudyMode: "socratic",
    classroomDateRangeMonths: DEFAULT_DATE_RANGE_MONTHS,
    toastPosition: "top-right",
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

  const hasChanges = useMemo(() => {
    return (
      JSON.stringify(prefs) !== JSON.stringify(initialPrefs) ||
      JSON.stringify(config) !== JSON.stringify(initialConfig)
    );
  }, [prefs, config, initialPrefs, initialConfig]);

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
    try {
      const saved = localStorage.getItem("classroom_ai_user_prefs_v1");
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.toastPosition = pos;
      localStorage.setItem(
        "classroom_ai_user_prefs_v1",
        JSON.stringify(parsed)
      );
      window.dispatchEvent(new Event("toast-position-changed"));
    } catch (e) { }

    const labelMap: Record<ToastPosition, string> = {
      "top-left": "Kiri Atas",
      "top-center": "Tengah Atas",
      "top-right": "Kanan Atas",
      "bottom-left": "Kiri Bawah",
      "bottom-center": "Tengah Bawah",
      "bottom-right": "Kanan Bawah",
    };
    // Dismiss all previous toasts immediately when switching position
    toast.dismiss();
    toast.success("Posisi Notifikasi Diperbarui", {
      description: `Notifikasi pop-up kini muncul di sudut ${labelMap[pos]}.`,
    });
  };

  const handleTaskModalStyleChange = (style: "drawer" | "modal") => {
    setPrefs((prev) => ({ ...prev, taskModalStyle: style }));
    try {
      const saved = localStorage.getItem("classroom_ai_user_prefs_v1");
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.taskModalStyle = style;
      localStorage.setItem(
        "classroom_ai_user_prefs_v1",
        JSON.stringify(parsed)
      );
      window.dispatchEvent(new Event("task-modal-style-changed"));
      window.dispatchEvent(new Event("taskStoreChange"));
    } catch (e) { }

    toast.dismiss();
    toast.success("Tampilan Pop-up Diperbarui", {
      description:
        style === "modal"
          ? "Detail tugas kini ditampilkan sebagai Dialog Modal melayang di tengah layar."
          : "Detail tugas kini ditampilkan sebagai Slide-over Drawer di samping kanan."
    });
  };

  const handleChatLayoutChange = (layout: "sidebar" | "split" | "minimal") => {
    setPrefs((prev) => ({ ...prev, chatLayout: layout }));
    try {
      const saved = localStorage.getItem("classroom_ai_user_prefs_v1");
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.chatLayout = layout;
      localStorage.setItem(
        "classroom_ai_user_prefs_v1",
        JSON.stringify(parsed)
      );
      window.dispatchEvent(new Event("chat-layout-changed"));
      window.dispatchEvent(new Event("taskStoreChange"));
    } catch (e) { }

    const descMap: Record<"sidebar" | "split" | "minimal", string> = {
      sidebar: "Tata letak AI Chat diubah ke Sidebar & Feed Percakapan.",
      split: "Tata letak AI Chat diubah ke Dual Workspace Split Pane.",
      minimal: "Tata letak AI Chat diubah ke Tampilan Minimalis Terfokus.",
    };

    toast.dismiss();
    toast.success("Tata Letak Chat Diperbarui", {
      description: descMap[layout],
    });
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
    toast.success("Pengaturan Berhasil Disimpan", {
      description:
        "Semua preferensi belajar, filter waktu, dan konfigurasi AI telah diperbarui.",
    });
  };

  const handleDiscard = () => {
    setPrefs(initialPrefs);
    setConfig(initialConfig);
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
    toast.info("Perubahan Dibatalkan", {
      description: "Pengaturan dikembalikan ke kondisi tersimpan sebelumnya.",
    });
  };

  const getCutoffDescription = (
    months: number = DEFAULT_DATE_RANGE_MONTHS
  ) => {
    if (!months || months <= 0) {
      return "Menampilkan seluruh riwayat tugas Google Classroom tanpa batasan tanggal waktu.";
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
    return `Menampilkan tugas dengan tenggat atau dibuat sejak ${d.getDate()} ${monthsIndo[d.getMonth()]
      } ${d.getFullYear()} hingga sekarang.`;
  };

  return (
    <Shell>
      <div className="relative max-w-3xl w-full space-y-8 pb-28">
        {/* Clean Page Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/70 dark:border-white/[0.08]">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#f5f5f5] font-heading">
              Pengaturan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#a3a3a3]">
              Sesuaikan tampilan antarmuka, preferensi belajar, filter Classroom, dan integrasi AI.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
            className="self-start sm:self-auto h-9 px-3 rounded-[10px] gap-1.5 text-xs text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f5f5f5] border-slate-200/80 dark:border-white/[0.08] dark:bg-[#141414] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Dashboard</span>
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
                Tema & Tampilan
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                Pilih skema warna yang nyaman untuk pengalaman belajar Anda.
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
                    Mode Terang (Light)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                    Kontras bersih dan cerah di siang hari
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
                    Mode Gelap (Dark)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                    Nyaman di mata untuk sesi belajar malam
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

        {/* SECTION 2: Posisi Notifikasi */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-[#f5f5f5]">
                  Posisi Notifikasi Pop-up (Toast)
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                  Tentukan sudut layar tempat pesan status dan pemberitahuan muncul.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                toast.info("Uji Coba Notifikasi", {
                  description:
                    "Notifikasi pop-up berhasil ditampilkan pada sudut ini.",
                });
              }}
              className="h-8 px-2.5 rounded-[8px] gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-900/40 cursor-pointer"
            >
              <Bell className="w-3 h-3" />
              <span>Uji Coba</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {TOAST_POSITIONS.map((pos) => {
              const isSelected = (prefs.toastPosition || "top-right") === pos.id;
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

                  <span className="truncate text-left flex-1">{pos.label}</span>

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
                Gaya Pop-up Detail Tugas
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                Pilih format jendela yang muncul saat membuka detail tugas & materi AI.
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
                    Panel samping kanan, daftar tugas tetap terlihat
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
                    Centered Modal (Rekomendasi)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                    Jendela dialog fokus di tengah layar
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
                Tata Letak AI Chat & Workspace
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                Pilih format tampilan ruang percakapan dan bimbingan belajar AI (/chat).
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
                  Sidebar + Feed (Standar)
                </div>
                <div className="text-xs text-slate-500 dark:text-[#a3a3a3] mt-0.5 leading-relaxed">
                  Sidebar riwayat di kiri dan feed percakapan fokus di tengah.
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
                  Dual Split Workspace
                </div>
                <div className="text-xs text-slate-500 dark:text-[#a3a3a3] mt-0.5 leading-relaxed">
                  Chat AI di kiri dan panel materi / catatan berdampingan di kanan.
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
                  Minimalis Terfokus
                </div>
                <div className="text-xs text-slate-500 dark:text-[#a3a3a3] mt-0.5 leading-relaxed">
                  Ruang chat bersih maksimal, riwayat percakapan dalam menu geser.
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
                Rentang Waktu Tugas Google Classroom
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                Batasi tugas lampau agar sinkronisasi tetap rapi dan fokus pada semester ini.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {DATE_RANGE_OPTIONS.map((opt) => {
              const isSelected =
                (prefs.classroomDateRangeMonths ?? DEFAULT_DATE_RANGE_MONTHS) ===
                opt.value;
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
                      {opt.label}
                    </div>
                    <div
                      className={`text-xs truncate ${isSelected
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-slate-500 dark:text-[#a3a3a3]"
                        } mt-0.5`}
                    >
                      {opt.desc}
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
              Cakupan Aktif:{" "}
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
                Preferensi Belajar & Karakter AI
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                Sesuaikan pendekatan penjelasan dan gaya tutur AI tutor saat mendampingi Anda.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#d4d4d4]">
                Gaya Belajar Personal
              </label>
              <div className="relative">
                <select
                  value={prefs.learningStyle}
                  onChange={(e) =>
                    setPrefs({ ...prefs, learningStyle: e.target.value })
                  }
                  className="w-full appearance-none px-3.5 pr-9 py-2.5 text-xs bg-slate-50/50 dark:bg-[#141414] border border-slate-200/80 dark:border-white/[0.08] rounded-[10px] text-slate-900 dark:text-[#f5f5f5] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition cursor-pointer"
                >
                  <option value="Netral">Netral / Umum</option>
                  <option value="Visual">Visual (Perbanyak Contoh Visual & Analogi)</option>
                  <option value="Membaca/Menulis">Membaca/Menulis (Penjelasan Teks Mendetail)</option>
                  <option value="Praktik">Praktik (Fokus Latihan & Langkah Eksekusi)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#737373]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#d4d4d4]">
                Gaya Bahasa (Tone) AI
              </label>
              <div className="relative">
                <select
                  value={prefs.aiTone}
                  onChange={(e) =>
                    setPrefs({ ...prefs, aiTone: e.target.value })
                  }
                  className="w-full appearance-none px-3.5 pr-9 py-2.5 text-xs bg-slate-50/50 dark:bg-[#141414] border border-slate-200/80 dark:border-white/[0.08] rounded-[10px] text-slate-900 dark:text-[#f5f5f5] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition cursor-pointer"
                >
                  <option value="Ramah">Ramah & Memotivasi</option>
                  <option value="Tegas">Tegas & Langsung (To the point)</option>
                  <option value="Sokratik">Sokratik (Memancing Pertanyaan Reflektif)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#737373]" />
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2 pt-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-[#d4d4d4]">
                Mode Belajar Asisten AI (Default)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: "socratic",
                    label: "Sokratik",
                    desc: "Membimbing berpikir bertahap dengan pertanyaan pemantik reflektif.",
                    icon: Brain,
                  },
                  {
                    id: "direct",
                    label: "Ringkas",
                    desc: "Jawaban padat, to-the-point, fokus inti materi.",
                    icon: Zap,
                  },
                  {
                    id: "quizzer",
                    label: "Kuis",
                    desc: "Tantangan soal interaktif & latihan mandiri.",
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
                Penyedia AI & Integrasi API
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#a3a3a3]">
                Pilih model kecerdasan buatan bawaan atau sambungkan kunci API pribadi Anda.
              </p>
            </div>
          </div>

          {/* 3 Provider Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {[
              {
                id: "gemini",
                label: "Gemini Bawaan",
                desc: "Gratis & Langsung Siap Pakai",
                icon: Sparkles,
              },
              {
                id: "gemini_custom",
                label: "Gemini Pribadi",
                desc: "API Key Google AI Studio",
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
                <span>Google Gemini Cloud Server Aktif</span>
              </div>
              <p className="text-xs text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed">
                Aplikasi terhubung ke backend server bawaan. Anda tidak perlu memasukkan API key manual untuk mulai menganalisis tugas dan berdiskusi dengan AI Tutor.
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
                    <span>Dapatkan API Key Gratis</span>
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
                  <span>Model Gemini</span>
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
                          {m.label}
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
                      Pilihan Standar
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
                          {m.label}
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
                      Pilihan Standar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
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
                Perubahan belum disimpan
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
                <span>Batalkan</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                className="h-8 px-3.5 rounded-[8px] gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-[#f5f5f5] dark:text-[#0c0c0c] dark:hover:bg-white shadow-2xs active:scale-95 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan</span>
              </Button>
            </div>
          </aside>
        )}
      </div>
    </Shell>
  );
}