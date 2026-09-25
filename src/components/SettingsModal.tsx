"use client";
import React, { useState, useEffect } from 'react';
import { UserPreferences, AIConfig, DEFAULT_DATE_RANGE_MONTHS, ToastPosition } from '../types';
import {
  Save,
  Key,
  Cpu,
  CalendarDays,
  Check,
  BookOpen,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
  Server,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import { PageDialog } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { toggleThemeWithCircularAnimation } from '@/lib/theme';
import { toast } from '@/components/ui/sonner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPreferences: UserPreferences | null;
  aiConfig: AIConfig | null;
  onSave: (prefs: UserPreferences, config: AIConfig) => void;
  pageMode?: boolean;
  pageClassName?: string;
}

const GEMINI_MODELS = [
  { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite (Default)' },
  { value: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite' },
  { value: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash (Rekomendasi)' },
  { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
  { value: '__CUSTOM__', label: 'Tulis Nama Model Kustom...' },
];

const OPENAI_MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Cepat & Efisien)' },
  { value: 'gpt-4o', label: 'GPT-4o (Model Flagship Cerdas)' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Klasik)' },
  { value: 'deepseek-chat', label: 'DeepSeek Chat' },
  { value: '__CUSTOM__', label: 'Tulis Nama Model Kustom...' },
];

export function SettingsModal({ isOpen, onClose, userPreferences, aiConfig, onSave, pageMode = false, pageClassName }: SettingsModalProps) {
  const [prefs, setPrefs] = useState<UserPreferences>(userPreferences || {
    learningStyle: 'Netral',
    explanationDetail: 'Netral',
    aiTone: 'Ramah',
    classroomDateRangeMonths: DEFAULT_DATE_RANGE_MONTHS,
    toastPosition: 'top-right',
  });

  const [config, setConfig] = useState<AIConfig>(aiConfig || {
    provider: 'gemini',
    apiKey: '',
    baseUrl: '',
    model: 'gemini-3.1-flash-lite'
  });

  const [geminiModelSelect, setGeminiModelSelect] = useState<string>('gemini-3.1-flash-lite');
  const [openaiModelSelect, setOpenaiModelSelect] = useState<string>('gpt-4o-mini');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, [isOpen]);

  const handleToggleTheme = (e: React.MouseEvent) => {
    const nextTheme = toggleThemeWithCircularAnimation(e);
    setIsDark(nextTheme === 'dark');
  };

  const handleToastPositionChange = (pos: ToastPosition) => {
    setPrefs(prev => ({ ...prev, toastPosition: pos }));
    try {
      const saved = localStorage.getItem("classroom_ai_user_prefs_v1");
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.toastPosition = pos;
      localStorage.setItem("classroom_ai_user_prefs_v1", JSON.stringify(parsed));
      window.dispatchEvent(new Event("toast-position-changed"));
    } catch (e) {}

    const labelMap: Record<ToastPosition, string> = {
      'top-left': 'Kiri Atas',
      'top-center': 'Tengah Atas',
      'top-right': 'Kanan Atas',
      'bottom-left': 'Kiri Bawah',
      'bottom-center': 'Tengah Bawah',
      'bottom-right': 'Kanan Bawah',
    };
    toast.dismiss();
    toast.success("Posisi Notifikasi Diperbarui", {
      description: `Notifikasi kini muncul di sudut ${labelMap[pos]}.`,
    });
  };

  // Sync state when props change
  useEffect(() => {
    if (userPreferences) {
      setPrefs({
        ...userPreferences,
        classroomDateRangeMonths: userPreferences.classroomDateRangeMonths ?? DEFAULT_DATE_RANGE_MONTHS,
        toastPosition: userPreferences.toastPosition ?? 'top-right',
      });
    }
  }, [userPreferences]);

  useEffect(() => {
    if (aiConfig) {
      setConfig(aiConfig);
      // Check if current model is outside default lists
      if (aiConfig.provider === 'gemini_custom') {
        const isStandard = GEMINI_MODELS.some(m => m.value === aiConfig.model);
        setIsCustomModel(!isStandard && Boolean(aiConfig.model));
      } else if (aiConfig.provider === 'openai') {
        const isStandard = OPENAI_MODELS.some(m => m.value === aiConfig.model);
        setIsCustomModel(!isStandard && Boolean(aiConfig.model));
      }
    }
  }, [aiConfig]);

  const handleProviderChange = (provider: 'gemini' | 'gemini_custom' | 'openai') => {
    let defaultModel = '';
    if (provider === 'gemini_custom') defaultModel = 'gemini-3.1-flash-lite';
    else if (provider === 'openai') defaultModel = 'gpt-4o-mini';

    setConfig(prev => ({
      ...prev,
      provider,
      model: prev.model || defaultModel,
      baseUrl: provider === 'openai' ? (prev.baseUrl || 'https://api.openai.com/v1') : '',
    }));
    setIsCustomModel(false);
  };

  const handleSave = () => {
    onSave({
      ...prefs,
      classroomDateRangeMonths: prefs.classroomDateRangeMonths ?? DEFAULT_DATE_RANGE_MONTHS,
    }, config);
    onClose();
  };

  const getCutoffDescription = (months: number = DEFAULT_DATE_RANGE_MONTHS) => {
    if (!months || months <= 0) {
      return "Menampilkan seluruh riwayat tugas Google Classroom tanpa batasan tanggal waktu.";
    }
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    const monthsIndo = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    return `Menampilkan tugas dengan tenggat atau dibuat sejak ${d.getDate()} ${monthsIndo[d.getMonth()]} ${d.getFullYear()} hingga sekarang.`;
  };

  const dateRangeOptions = [
    { value: 1, label: '1 Bulan Terakhir', desc: 'Hanya tugas paling baru' },
    { value: 2, label: '2 Bulan Terakhir (Bawaan)', desc: 'Rekomendasi ideal' },
    { value: 3, label: '3 Bulan Terakhir', desc: '1 Semester berjalan' },
    { value: 6, label: '6 Bulan Terakhir', desc: 'Setengah tahun akademik' },
    { value: 12, label: '1 Tahun Terakhir', desc: '1 Tahun ajaran penuh' },
    { value: 0, label: 'Semua Waktu', desc: 'Tanpa batas tanggal' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <PageDialog
        pageMode={pageMode}
        className="max-w-2xl max-h-[90vh] p-0 flex flex-col gap-0 overflow-hidden dark:bg-[#0c0c0c] dark:border-slate-800"
        pageClassName={pageClassName}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-left pr-12">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            Pengaturan Aplikasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Filter rentang tanggal Classroom, tema antarmuka, preferensi belajar, dan AI
          </p>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-7 flex-1 dark:bg-[#0c0c0c]">

          {/* SECTION 0: Theme Selection */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />} Tema & Tampilan
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Animasi Wave Aktif
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={(e) => {
                  if (isDark) handleToggleTheme(e);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  !isDark
                    ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500/20 text-indigo-950 font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141414] hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 dark:hover:text-slate-100'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    !isDark
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">Mode Terang</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Kontras tinggi & bersih</div>
                </div>
                {!isDark && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  if (!isDark) handleToggleTheme(e);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  isDark
                    ? 'border-indigo-500/60 bg-indigo-950/60 ring-1 ring-indigo-500/30 text-indigo-200 font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141414] hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 dark:hover:text-slate-100'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isDark
                      ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">Mode Gelap</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Nyaman di mata saat malam</div>
                </div>
                {isDark && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-indigo-600 dark:bg-slate-100 text-white dark:text-[#0c0c0c] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Toast Notification Position */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Posisi Notifikasi
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                {({
                  'top-left': 'Kiri Atas',
                  'top-center': 'Tengah Atas',
                  'top-right': 'Kanan Atas',
                  'bottom-left': 'Kiri Bawah',
                  'bottom-center': 'Tengah Bawah',
                  'bottom-right': 'Kanan Bawah',
                }[prefs.toastPosition || 'top-right']) || 'Kanan Atas'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Pilih posisi sudut layar tempat pop-up notifikasi aplikasi akan muncul.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'top-left' as ToastPosition, label: 'Kiri Atas' },
                { id: 'top-center' as ToastPosition, label: 'Tengah Atas' },
                { id: 'top-right' as ToastPosition, label: 'Kanan Atas' },
                { id: 'bottom-left' as ToastPosition, label: 'Kiri Bawah' },
                { id: 'bottom-center' as ToastPosition, label: 'Tengah Bawah' },
                { id: 'bottom-right' as ToastPosition, label: 'Kanan Bawah' },
              ].map((pos) => {
                const isSelected = (prefs.toastPosition || 'top-right') === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => handleToastPositionChange(pos.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 dark:bg-indigo-950/60 dark:border-indigo-500/60 dark:text-indigo-200 ring-1 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141414] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                    }`}
                  >
                    <span className="truncate">{pos.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Notification Test and Close Info */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tombol tutup (X) tersedia di setiap notifikasi pop-up.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.info("Uji Coba Notifikasi", {
                    description: "Notifikasi berhasil ditampilkan dengan tombol tutup.",
                  });
                }}
                className="gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 shrink-0 transition-colors"
              >
                <Bell className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Uji Coba Notifikasi</span>
              </Button>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* SECTION 1: Google Classroom Date Range Filter */}
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Rentang Tanggal Tugas Google Classroom
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                Filter Waktu
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tentukan batas waktu tugas yang akan disinkronkan dan ditampilkan. Tugas yang memiliki tenggat waktu atau dibuat sebelum batas ini akan disembunyikan agar daftar tugas tetap relevan dan rapi.
            </p>

            {/* Date Range Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dateRangeOptions.map((opt) => {
                const isSelected = (prefs.classroomDateRangeMonths ?? DEFAULT_DATE_RANGE_MONTHS) === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPrefs({ ...prefs, classroomDateRangeMonths: opt.value })}
                    className={`p-3.5 text-left rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500/20 dark:bg-indigo-950/60 dark:border-indigo-500/60 dark:ring-indigo-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#141414] dark:hover:border-slate-700 dark:hover:bg-slate-800/60'
                      }`}
                  >
                    <div>
                      <div className={`text-xs font-bold ${isSelected ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}`}>
                        {opt.label}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-slate-500 dark:text-slate-400'} mt-0.5`}>
                        {opt.desc}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-slate-100 text-white dark:text-[#0c0c0c] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Informative Helper Pill */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-semibold text-slate-900 dark:text-slate-100 block">Status Filter Aktif:</strong>
                {getCutoffDescription(prefs.classroomDateRangeMonths ?? DEFAULT_DATE_RANGE_MONTHS)}
              </div>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* SECTION 2: User Learning Preferences */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Preferensi Gaya Belajar & AI
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Gaya Belajar Personal</label>
                <select
                  value={prefs.learningStyle}
                  onChange={e => setPrefs({ ...prefs, learningStyle: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                >
                  <option value="Netral">Netral / Umum</option>
                  <option value="Visual">Visual (Perbanyak Contoh Visual / Analogi)</option>
                  <option value="Membaca/Menulis">Membaca/Menulis (Penjelasan Teks Mendetail)</option>
                  <option value="Praktik">Praktik (Fokus pada Latihan & Kode/Soal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Gaya Bahasa (Tone) AI</label>
                <select
                  value={prefs.aiTone}
                  onChange={e => setPrefs({ ...prefs, aiTone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                >
                  <option value="Ramah">Ramah & Memotivasi</option>
                  <option value="Tegas">Tegas & Langsung (To the point)</option>
                  <option value="Sokratik">Sokratik (Memancing dengan Pertanyaan)</option>
                </select>
              </div>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* SECTION 3: AI Provider Settings */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Penyedia AI (AI Engine & API Key)
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
                Aktif & Terhubung
              </span>
            </div>

            {/* 3 Provider Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'gemini', label: 'Gemini Bawaan', desc: 'Gratis & Siap Pakai', icon: Sparkles },
                { id: 'gemini_custom', label: 'Gemini', desc: 'Gunakan API Key Pribadi & Pilih Model', icon: Key },
                { id: 'openai', label: 'OpenAI / OpenRouter', desc: 'GPT-4o / DeepSeek / Custom URL', icon: Server }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleProviderChange(opt.id as any)}
                  className={`p-3.5 text-left rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${config.provider === opt.id
                    ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500/20 dark:bg-indigo-950/60 dark:border-indigo-500/60 dark:ring-indigo-500/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#141414] dark:hover:border-slate-700 dark:hover:bg-slate-800/60'
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <opt.icon className={`w-4 h-4 ${config.provider === opt.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    {config.provider === opt.id && (
                      <div className="w-4 h-4 rounded-full bg-indigo-600 dark:bg-slate-100 text-white dark:text-[#0c0c0c] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${config.provider === opt.id ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}`}>{opt.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* DEFAULT AI NOTICE */}
            {config.provider === 'gemini' && (
              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100/80 dark:border-indigo-900/50 space-y-1.5 text-xs text-indigo-950 dark:text-indigo-200">
                <div className="font-bold flex items-center gap-1.5 text-indigo-900 dark:text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>AI Tutor Cerdas Aktif & Siap Pakai</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  AI Tutor telah aktif dan siap mendampingi sesi belajarmu. Kamu bisa langsung berdiskusi dan menganalisis tugas tanpa perlu konfigurasi tambahan.
                </p>
              </div>
            )}

            {/* CUSTOM GEMINI SETTINGS */}
            {config.provider === 'gemini_custom' && (
              <div className="space-y-4 p-4.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
                {/* API Key Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Key className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Google Gemini API Key
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-1"
                    >
                      <span>Dapatkan API Key Gratis di Google AI Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      placeholder="AIzaSy..."
                      value={config.apiKey || ''}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono text-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Model Selector */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Pilihan Model Gemini
                  </label>
                  {!isCustomModel ? (
                    <div className="space-y-2">
                      <select
                        value={config.model || 'gemini-1.5-flash'}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomModel(true);
                            setConfig({ ...config, model: '' });
                          } else {
                            setConfig({ ...config, model: e.target.value });
                          }
                        }}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                      >
                        {GEMINI_MODELS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. gemini-2.0-flash-exp"
                          value={config.model || ''}
                          onChange={(e) => setConfig({ ...config, model: e.target.value })}
                          className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono text-slate-900 dark:text-slate-100"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsCustomModel(false);
                            setConfig({ ...config, model: 'gemini-1.5-flash' });
                          }}
                        >
                          Pilihan Standar
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Masukkan nama model eksperimental atau spesifik dari Google Gemini API.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* OPENAI / OPENROUTER SETTINGS */}
            {config.provider === 'openai' && (
              <div className="space-y-4 p-4.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
                {/* Base URL */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Server className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Base URL (Endpoint OpenAI Compatible)
                  </label>
                  <input
                    type="text"
                    placeholder="https://api.openai.com/v1 atau https://openrouter.ai/api/v1"
                    value={config.baseUrl || ''}
                    onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono text-slate-900 dark:text-slate-100"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Mendukung OpenAI, OpenRouter, DeepSeek, Together AI, atau proxy lokal.
                  </p>
                </div>

                {/* API Key */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-..."
                      value={config.apiKey || ''}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono text-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Model */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Model
                  </label>
                  {!isCustomModel ? (
                    <select
                      value={config.model || 'gpt-4o-mini'}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setIsCustomModel(true);
                          setConfig({ ...config, model: '' });
                        } else {
                          setConfig({ ...config, model: e.target.value });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                    >
                      {OPENAI_MODELS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. gpt-4o-mini, deepseek/deepseek-r1"
                          value={config.model || ''}
                          onChange={(e) => setConfig({ ...config, model: e.target.value })}
                          className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono text-slate-900 dark:text-slate-100"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsCustomModel(false);
                            setConfig({ ...config, model: 'gpt-4o-mini' });
                          }}
                        >
                          Pilihan Standar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5 bg-slate-50 dark:bg-slate-900">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleSave}
            className="gap-2 font-bold"
          >
            <Save className="w-4 h-4" /> Simpan Pengaturan
          </Button>
        </DialogFooter>
      </PageDialog>
    </Dialog>
  );
}
