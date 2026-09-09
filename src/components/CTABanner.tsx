"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface CTABannerProps {
  onConnectGoogle: () => void;
  language?: "ENG" | "IND";
}

export function CTABanner({ onConnectGoogle, language = "ENG" }: CTABannerProps) {
  const copy =
    language === "IND"
      ? {
          title: "Siap Memulai Pengalaman Baru?",
          description: "Mulai perjalanan belajar Anda dengan pengalaman yang lebih ringkas, lebih cepat, dan lebih terarah.",
          button: "Mulai Sekarang",
        }
      : {
          title: "Ready to Start Your New Experience?",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut a mollis turpis. Mauris hendrerit laoreet arcu, in hendrerit enim vestibulum ut.",
          button: "Start Now",
        };
  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-16 sm:my-20">
      <div className="relative overflow-hidden bg-[#4838cc] dark:bg-[#4335c0] text-white rounded-3xl p-7 sm:p-10 md:p-12 shadow-xl shadow-indigo-600/20 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        
        {/* Subtle decorative wave background */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full pointer-events-none blur-2xl" />
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-400/10 rounded-full pointer-events-none blur-2xl" />

        {/* Content */}
        <div className="flex flex-col relative z-10 text-center md:text-left">
          <h2 className="font-cal text-2xl sm:text-3xl md:text-[32px] font-bold tracking-tight text-white">
            {copy.title}
          </h2>
          <p className="font-inter text-xs sm:text-sm text-white/85 leading-relaxed max-w-xl mt-2.5">
            {copy.description}
          </p>
        </div>

        {/* Button */}
        <div className="relative z-10 flex-shrink-0 w-full md:w-auto">
          <button
            onClick={onConnectGoogle}
            className="w-full md:w-auto bg-white hover:bg-slate-50 text-[#4838cc] font-montserrat font-bold px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer text-sm sm:text-base flex items-center justify-center gap-2 active:scale-[0.98] group"
          >
            <span>{copy.button}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </section>
  );
}
