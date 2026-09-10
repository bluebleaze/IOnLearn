"use client";

import React from "react";
import {
  ArrowUpRight,
  Menu,
  Home,
  ClipboardList,
  Bot,
  Layers,
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
          button: "Coba Dashboard Demo",
          note: "Tenang — Anda bisa merasakan fasilitas kami tanpa perlu masuk atau menyinkronkan akun terlebih dahulu! Kami menjamin Anda akan mendapatkan apa yang Anda butuhkan ;)",
        }
      : {
          eyebrow: "demo page",
          headline: ["Still Not", "Sure", "Whether", "to Try", "It or", "Not?"],
          button: "Try The Demo Dashboard",
          note: "Don't worry — you can experience our facilities without needing to log in or sync your account in the first place! We promise, you'll get what you need ;)",
        };
  return (
    <section id="demo" className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-10 scroll-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-10 lg:gap-14 items-center">

        {/* LEFT COLUMN: Ultra-Bold "OH!" + Headline */}
        <div className="w-full max-w-[340px] sm:max-w-[380px] flex flex-col justify-center">
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
            <h2 className="font-montserrat font-bold text-2xl sm:text-[28px] md:text-[32px] text-slate-900 dark:text-white leading-[1.18] tracking-tight flex flex-col justify-between py-1 select-none">
              {copy.headline.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h2>
          </div>

          {/* Underline divider across the left block */}
          <div className="mt-4 w-full h-[1.5px] bg-slate-200 dark:bg-zinc-800 rounded-full" />
        </div>

        {/* RIGHT COLUMN: Demo Page Preview + Full-Width CTA */}
        <div className="w-full flex flex-col gap-3">

          {/* Eyebrow Tag */}
          <div>
            <span className="font-montserrat font-bold text-xs sm:text-sm text-[#493fe4] dark:text-[#818cf8] tracking-wide lowercase">
              {copy.eyebrow}
            </span>
          </div>

          {/* Mock Dashboard Window Preview with Left Vertical Sidebar */}
          <div className="w-full rounded-2xl border border-slate-300/80 dark:border-white/10 bg-white dark:bg-[#121216] shadow-sm flex overflow-hidden select-none transition-all duration-300 hover:shadow-md">

            {/* Left Vertical Sidebar (Authentic Mockup Detail) */}
            <div className="w-9 sm:w-10 bg-slate-50/70 dark:bg-[#16161c] border-r border-slate-200/80 dark:border-white/10 flex flex-col items-center py-4 gap-3 text-slate-400 dark:text-zinc-500 flex-shrink-0">
              <Menu className="w-3.5 h-3.5 hover:text-slate-600" />
              <Home className="w-3.5 h-3.5 text-[#493fe4]" />
              <ClipboardList className="w-3.5 h-3.5 hover:text-slate-600" />
              <Bot className="w-3.5 h-3.5 hover:text-slate-600" />
              <Layers className="w-3.5 h-3.5 hover:text-slate-600" />
              <Settings className="w-3.5 h-3.5 hover:text-slate-600 mt-auto" />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-3.5 sm:p-5 flex flex-col justify-between">

              {/* Top Header of Mockup */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5">
                {/* Brand Logo */}
                <div className="flex items-center gap-1">
                  <span className="bg-[#493fe4] text-white font-black text-[10px] px-1.5 py-0.5 rounded">
                    IOn
                  </span>
                  <span className="font-cal font-bold text-xs text-[#493fe4] dark:text-indigo-400">
                    IOnLearn
                  </span>
                </div>

                {/* Action Tag Pills */}
                <div className="flex items-center gap-1.5 text-[9px] font-montserrat">
                  <span className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300">
                    @ Chatbot
                  </span>
                  <span className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300">
                    + Add New Task
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#493fe4] text-white font-semibold shadow-xs">
                    Sync Account
                  </span>
                </div>
              </div>

              {/* Greeting & Subtitle */}
              <div className="py-2">
                <div className="font-montserrat text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                  <span>Good Morning,</span>
                  <span className="bg-[#493fe4] text-white px-2 py-0.5 rounded font-bold text-xs">
                    Ubur Ubur.
                  </span>
                </div>
                <p className="font-inter text-[10.5px] text-slate-400 dark:text-zinc-500 mt-1 leading-relaxed line-clamp-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut a mollis turpis. Mauris hendrerit laoreet arcu, in hendrerit enim vestibulum ut.
                </p>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1.5">

                {/* Card 1: All Task (Solid Purple) */}
                <div className="bg-[#493fe4] text-white rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-xs min-h-[64px]">
                  <span className="text-[9px] font-montserrat opacity-90">
                    All Task
                  </span>
                  <div className="my-0.5">
                    <span className="font-cal text-base sm:text-lg font-black leading-none">
                      07
                    </span>
                  </div>
                  <span className="text-[7px] font-montserrat tracking-wider opacity-75 uppercase">
                    TOTAL NUMBER
                  </span>
                </div>

                {/* Card 2: AI Chatbot (White) */}
                <div className="bg-white dark:bg-zinc-800/80 rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between min-h-[64px]">
                  <span className="text-[9px] font-montserrat font-bold text-slate-800 dark:text-zinc-200">
                    AI Chatbot
                  </span>
                  <div className="my-0.5 flex items-center gap-1 text-[#493fe4] dark:text-indigo-400">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[7.5px] font-inter text-slate-400 dark:text-zinc-400">
                    chat your complex problem
                  </span>
                </div>

                {/* Card 3: uburubur Account (White) */}
                <div className="bg-white dark:bg-zinc-800/80 rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between min-h-[64px]">
                  <span className="text-[9px] font-montserrat font-semibold text-slate-700 dark:text-zinc-300">
                    UburUbur Account
                  </span>
                  <div className="my-0.5">
                    <span className="font-cal text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-none">
                      07
                    </span>
                  </div>
                  <span className="text-[7px] font-montserrat tracking-wider text-slate-400 dark:text-zinc-400 uppercase">
                    VIEW ACCOUNT
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* Action Button: Exact width as the card */}
          <button
            onClick={onDemoMode}
            className="w-full bg-[#493fe4] hover:bg-[#3d32d4] text-white font-montserrat font-bold py-3.5 px-6 rounded-2xl sm:rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/25 transition-all duration-200 cursor-pointer active:scale-[0.99] text-sm sm:text-base group mt-1"
          >
            <span>{copy.button}</span>
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          {/* Supportive Copy */}
          <p className="font-inter text-xs sm:text-[13px] text-slate-700 dark:text-zinc-300 leading-relaxed max-w-lg mt-1">
            {copy.note}
          </p>

        </div>

      </div>
    </section>
  );
}
