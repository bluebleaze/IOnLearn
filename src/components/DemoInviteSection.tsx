"use client";

import {
  ArrowUpRight,
  House,
  BookOpen,
  MessageSquareText,
  FileText,
  ListTodo,
  GraduationCap,
  Settings,
} from "lucide-react";

interface DemoInviteSectionProps {
  onDemoMode: () => void;
  language?: "ENG" | "IND";
}

export function DemoInviteSection({ onDemoMode, language = "ENG" }: DemoInviteSectionProps) {
  const copy =
    language === "IND"
      ? {
        eyebrow: "halaman demo",
        headline: ["Masih Ragu", "Apakah", "Harus", "Coba", "atau", "Tidak?"],
        mobileHeadline: "Masih Ragu? Coba Demo Interaktif Sekarang!",
        button: "Coba Dashboard Demo",
        note: "Tenang — Anda bisa merasakan fasilitas kami tanpa perlu masuk atau menyinkronkan akun terlebih dahulu! Kami menjamin Anda akan mendapatkan apa yang Anda butuhkan ;)",
      }
      : {
        eyebrow: "demo page",
        headline: ["Still Not", "Sure", "Whether", "to Try", "It or", "Not?"],
        mobileHeadline: "Still Not Sure? Try The Interactive Demo!",
        button: "Try The Demo Dashboard",
        note: "Don't worry — you can experience our facilities without needing to log in or sync your account in the first place! We promise, you'll get what you need ;)",
      };
  return (
    <section id="demo" className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 lg:pt-28 pb-10 scroll-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 sm:gap-8 lg:gap-14 items-center">

        {/* MOBILE-ONLY CATCHY HEADLINE (Hidden on Desktop) */}
        <div className="block lg:hidden w-full text-left">
          <span className="font-montserrat font-bold text-xs text-[#493fe4] dark:text-[#818cf8] tracking-wide lowercase mb-2 block">
            {copy.eyebrow}
          </span>
          <h2 className="font-cal text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            {copy.mobileHeadline}
          </h2>
        </div>

        {/* DESKTOP-ONLY LEFT COLUMN: Ultra-Bold "OH!" + Headline (Hidden on Mobile) */}
        <div className="hidden lg:flex w-full max-w-[340px] sm:max-w-[380px] flex-col justify-center">
          <div className="flex items-stretch gap-5 sm:gap-6">

            {/* Authentic Condensed Heavy "OH!" SVG (Height ~265px) */}
            <svg
              viewBox="0 0 200 270"
              className="h-[230px] sm:h-[250px] md:h-[268px] w-auto text-[#493fe4] dark:text-[#6355ee] flex-shrink-0 select-none"
              fill="currentColor"
              aria-label="OH!"
            >
              {/* Heavy Rounded O */}
              <path
                fillRule="evenodd"
                d="M38 0h2c21 0 37 16 37 38v194c0 22-16 38-37 38h-2C17 270 0 254 0 232V38C0 16 17 0 38 0zm2 30h-2c-5.5 0-10 4.5-10 10v190c0 5.5 4.5 10 10 10h2c5.5 0 10-4.5 10-10V40c0-5.5-4.5-10-10-10z"
              />
              {/* Heavy Geometric H */}
              <path d="M88 0h26v117h26V0h26v270h-26v-117h-26v117H88V0z" />
              {/* Heavy Segmented ! */}
              <rect x="174" y="0" width="26" height="196" />
              <rect x="174" y="220" width="26" height="50" />
            </svg>

            {/* Stacked multi-line headline spanning exact height */}
            <h2 className="font-montserrat font-bold text-2xl sm:text-3xl md:text-4xl text-slate-900 dark:text-white leading-[1.18] tracking-tight flex flex-col justify-between py-1 select-none">
              {copy.headline.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
          </div>

          {/* Underline divider across the left block */}
          <div className="mt-4 w-full h-[1.5px] bg-slate-200 dark:bg-zinc-800 rounded-full" />
        </div>

        {/* RIGHT COLUMN: Demo Page Preview + Full-Width CTA */}
        <div className="w-full flex flex-col gap-3 group">

          {/* Eyebrow Tag (Desktop only, mobile renders it with the headline) */}
          <div className="hidden lg:block">
            <span className="font-montserrat font-bold text-xs sm:text-sm text-[#493fe4] dark:text-[#818cf8] tracking-wide lowercase">
              {copy.eyebrow}
            </span>
          </div>

          {/* Mock Dashboard Window Preview with Left Vertical Sidebar */}
          <div className="w-full rounded-2xl border border-slate-300/80 dark:border-white/10 bg-white dark:bg-[#161616] shadow-sm flex overflow-hidden select-none transition-all duration-300 hover:shadow-md translate-y-0 scale-100 lg:translate-y-9 lg:scale-95 lg:group-hover:translate-y-0 lg:group-hover:scale-100 relative z-0">

            {/* Left Vertical Sidebar (Matches current app sidebar) */}
            <div className="w-9 sm:w-10 bg-slate-50/80 dark:bg-[#121212] border-r border-slate-200/80 dark:border-white/10 flex flex-col items-center py-3.5 gap-3 text-slate-400 dark:text-zinc-500 flex-shrink-0">
              <div className="w-5 h-5 rounded-md bg-indigo-600/10 dark:bg-indigo-500/15 flex items-center justify-center text-[#4b43c6] dark:text-indigo-400 mb-1">
                <House className="w-3 h-3" />
              </div>
              <BookOpen className="w-3.5 h-3.5 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors" />
              <MessageSquareText className="w-3.5 h-3.5 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors" />
              <FileText className="w-3.5 h-3.5 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors" />
              <ListTodo className="w-3.5 h-3.5 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors" />
              <Settings className="w-3.5 h-3.5 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors mt-auto" />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-3.5 sm:p-5 flex flex-col justify-between space-y-3">

              {/* Top Header of Mockup */}
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-white/5">
                {/* Brand Logo */}
                <div className="flex items-center gap-1.5">
                  <img
                    src="/logos/logoionlearnfulltext.png"
                    alt="IOnLearn"
                    className="h-4 sm:h-5 w-auto object-contain block dark:hidden"
                  />
                  <img
                    src="/logos/logoionlearnfulltext-dark.png"
                    alt="IOnLearn"
                    className="h-4 sm:h-5 w-auto object-contain hidden dark:block"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 text-xs font-montserrat">
                  <span className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 font-medium bg-slate-50 dark:bg-white/5">
                    {language === "IND" ? "Semua Tugas" : "All Tasks"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#4b43c6] dark:bg-indigo-600 text-white font-semibold shadow-xs">
                    {language === "IND" ? "Tanya AI" : "Ask AI"}
                  </span>
                </div>
              </div>

              {/* Overview Welcome Banner */}
              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#1a1a1a] border border-slate-200/60 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400 mb-0.5">
                  <span>{language === "IND" ? "Ikhtisar Belajar" : "Study Overview"}</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{language === "IND" ? "Hari Ini" : "Today"}</span>
                </div>
                <h4 className="font-montserrat text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {language === "IND" ? "Selamat datang kembali, Pelajar" : "Welcome back, Student"}
                </h4>
                <p className="font-inter text-xs text-slate-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  {language === "IND"
                    ? "Terdapat 7 tugas aktif, 2 tenggat mendekat, serta 4 to-do tersisa."
                    : "7 active tasks, 2 deadlines approaching, and 4 to-dos remaining."}
                </p>
              </div>

              {/* 4 Metric Cards (Matching actual current app) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">

                {/* Card 1: Tugas Classroom */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-2 sm:p-2.5 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                    <BookOpen className="w-3 h-3 text-[#4b43c6] dark:text-indigo-400" />
                    <span className="text-xs text-rose-500 font-semibold">{language === "IND" ? "2 Mendesak" : "2 Urgent"}</span>
                  </div>
                  <div className="my-1">
                    <span className="font-cal text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-none">
                      07
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                    {language === "IND" ? "Tugas Aktif" : "Active Tasks"}
                  </span>
                </div>

                {/* Card 2: To-Do Harian */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-2 sm:p-2.5 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                    <ListTodo className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{language === "IND" ? "2 Selesai" : "2 Done"}</span>
                  </div>
                  <div className="my-1">
                    <span className="font-cal text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-none">
                      04
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                    {language === "IND" ? "To-Do List" : "To-Do Goals"}
                  </span>
                </div>

                {/* Card 3: Kelas Aktif */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-2 sm:p-2.5 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                    <GraduationCap className="w-3 h-3 text-sky-500" />
                    <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold">{language === "IND" ? "Tersinkron" : "Synced"}</span>
                  </div>
                  <div className="my-1">
                    <span className="font-cal text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-none">
                      05
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                    {language === "IND" ? "Kelas Aktif" : "Active Classes"}
                  </span>
                </div>

                {/* Card 4: AI Tutor */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-2 sm:p-2.5 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                    <MessageSquareText className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-emerald-500 font-semibold flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  </div>
                  <div className="my-1">
                    <span className="font-cal text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-none">
                      Online
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                    {language === "IND" ? "Tutor AI 24/7" : "24/7 AI Tutor"}
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* Action Button: Exact width as the card */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onDemoMode}
              className="w-full bg-[#493fe4] hover:bg-[#3d32d4] text-white font-montserrat font-bold py-3.5 px-6 rounded-2xl sm:rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/25 transition-all duration-200 cursor-pointer active:scale-[0.99] text-sm sm:text-base group mt-1 z-1"
            >
              <span>{copy.button}</span>
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            {/* Supportive Copy */}
            <p className="font-inter text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed max-w-lg mt-1">
              {copy.note}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
