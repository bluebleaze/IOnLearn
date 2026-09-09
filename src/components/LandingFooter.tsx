"use client";

import React from "react";
import Link from "next/link";

interface LandingFooterProps {
  onConnectGoogle: () => void;
  language?: "ENG" | "IND";
}

export function LandingFooter({ onConnectGoogle, language = "ENG" }: LandingFooterProps) {
  const copy =
    language === "IND"
      ? {
          quote: '"Belajar Lebih Cerdas, kuasai materi dengan mudah"',
          copyright: "© 2026 IonLearn. Semua hak dilindungi.",
          quickNavigation: "Navigasi Cepat",
          connection: "Koneksi",
          legals: "Legal",
          home: "Beranda",
          features: "Fitur",
          demo: "Demo Interaktif",
          faq: "FAQ",
          startNow: "Mulai Sekarang",
          github: "Kode Sumber - GitHub",
          terms: "Syarat",
          privacy: "Kebijakan Privasi",
        }
      : {
          quote: '"Study Smarter, master any subject effortlessly"',
          copyright: "© 2026 IonLearn. All rights reserved.",
          quickNavigation: "Quick Navigation",
          connection: "Connection",
          legals: "Legals",
          home: "Home",
          features: "Features",
          demo: "Interactive Demo",
          faq: "FAQ",
          startNow: "Start Now",
          github: "Source Code - GitHub",
          terms: "Terms",
          privacy: "Privacy Policy",
        };
  return (
    <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-14 border-t border-slate-200/80 dark:border-white/10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* COLUMN 1: Brand & Identity (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col items-start">
          <div className="flex items-center gap-1 mb-3 select-none">
            <span className="font-cal font-black text-2xl text-[#4838cc] dark:text-[#818cf8] tracking-tight">
              IOn
            </span>
            <span className="bg-[#4838cc] dark:bg-[#5c4ce2] text-white font-cal font-black text-xl px-2 py-0.5 rounded-md tracking-tight">
              Learn.
            </span>
          </div>

          <p className="font-inter text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mb-4 leading-relaxed">
            {copy.quote}
          </p>

          <span className="font-inter text-xs text-slate-400 dark:text-zinc-500">
            {copy.copyright}
          </span>
        </div>

        {/* COLUMN 2: Quick Navigation (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col">
          <h4 className="font-montserrat font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-3">
            {copy.quickNavigation}
          </h4>
          <ul className="flex flex-col gap-2 font-inter text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            <li>
              <a href="#" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                {copy.home}
              </a>
            </li>
            <li>
              <a href="#about-platform" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                {copy.features}
              </a>
            </li>
            <li>
              <a href="#about-platform" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                {copy.demo}
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                {copy.faq}
              </a>
            </li>
            <li>
              <button
                onClick={onConnectGoogle}
                className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors cursor-pointer text-left"
              >
                Start Now
              </button>
            </li>
          </ul>
        </div>

        {/* COLUMN 3: Connection (lg:col-span-2) */}
        <div className="lg:col-span-2 flex flex-col">
          <h4 className="font-montserrat font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-3">
            {copy.connection}
          </h4>
          <ul className="flex flex-col gap-2 font-inter text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors"
              >
                {copy.github}
              </a>
            </li>
            <li>
              <button
                onClick={onConnectGoogle}
                className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors cursor-pointer text-left"
              >
                {copy.startNow}
              </button>
            </li>
          </ul>
        </div>

        {/* COLUMN 4: Legals (lg:col-span-2) */}
        <div className="lg:col-span-2 flex flex-col">
          <h4 className="font-montserrat font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-3">
            {copy.legals}
          </h4>
          <ul className="flex flex-col gap-2 font-inter text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            <li>
              <Link href="/terms" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                {copy.terms}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                {copy.privacy}
              </Link>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
