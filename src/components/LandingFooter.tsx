"use client";

import Link from "next/link";
import { ArrowUp, Github, Mail } from "lucide-react";

interface LandingFooterProps {
  onConnectGoogle: () => void;
  language?: "ENG" | "IND";
}

export function LandingFooter({ onConnectGoogle, language = "ENG" }: LandingFooterProps) {
  const isIndo = language === "IND";

  const copy = isIndo
    ? {
      quote: "Platform cerdas berbasis AI untuk sinkronisasi Google Classroom, manajemen tugas, dan belajar lebih efektif.",
      copyright: `© ${new Date().getFullYear()} IOnLearn. Seluruh hak cipta dilindungi.`,
      quickNav: "Navigasi",
      features: "Fitur",
      legals: "Legal",
      home: "Beranda",
      featureList: "Fitur Unggulan",
      demo: "Demo Interaktif",
      faq: "FAQ",
      startNow: "Mulai Sekarang",
      classroomSync: "Sinkronisasi Classroom",
      aiTutor: "Tutor & Chatbot AI",
      smartExport: "Ekspor PDF & Word",
      flashcardGen: "Flashcard & Kuis",
      terms: "Syarat & Ketentuan",
      privacy: "Kebijakan Privasi",
      contact: "Hubungi Kami",
      github: "Repositori GitHub",
      backToTop: "Ke Atas",
    }
    : {
      quote: "AI-powered workspace for Google Classroom synchronization, task management, and smarter learning.",
      copyright: `© ${new Date().getFullYear()} IOnLearn. All rights reserved.`,
      quickNav: "Navigation",
      features: "Features",
      legals: "Legal",
      home: "Home",
      featureList: "Features",
      demo: "Interactive Demo",
      faq: "FAQ",
      startNow: "Start Now",
      classroomSync: "Classroom Sync",
      aiTutor: "AI Tutor & Chat",
      smartExport: "Export PDF & DOCX",
      flashcardGen: "Flashcard & Quiz",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      contact: "Contact Support",
      github: "GitHub Repository",
      backToTop: "Back to Top",
    };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-10 border-t border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-zinc-400 font-inter text-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-10">

        {/* COLUMN 1: Brand & Identity */}
        <div className="lg:col-span-5 flex flex-col items-start space-y-3">
          <Link href="#home" className="inline-block transition-opacity hover:opacity-90">
            {/* Light Mode Logo */}
            <img
              src="/logos/Ionlearnnewfulltext.png"
              alt="IOnLearn"
              className="h-7 sm:h-8 w-auto object-contain block dark:hidden"
            />
            {/* Dark Mode Logo */}
            <img
              src="/logos/Ionlearnnewfulltext-dark.png"
              alt="IOnLearn"
              className="h-7 sm:h-8 w-auto object-contain hidden dark:block"
            />
          </Link>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-sm">
            {copy.quote}
          </p>
        </div>

        {/* COLUMN 2: Navigation */}
        <div className="lg:col-span-2 sm:col-span-1 flex flex-col space-y-2.5">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            {copy.quickNav}
          </h4>
          <ul className="flex flex-col space-y-2 text-xs sm:text-sm">
            <li>
              <a href="#home" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                {copy.home}
              </a>
            </li>
            <li>
              <a href="#features" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                {copy.featureList}
              </a>
            </li>
            <li>
              <a href="#demo" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                {copy.demo}
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                {copy.faq}
              </a>
            </li>
          </ul>
        </div>

        {/* COLUMN 3: Features */}
        <div className="lg:col-span-3 sm:col-span-1 flex flex-col space-y-2.5">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            {copy.features}
          </h4>
          <ul className="flex flex-col space-y-2 text-xs sm:text-sm">
            <li>
              <button
                onClick={onConnectGoogle}
                className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
              >
                {copy.classroomSync}
              </button>
            </li>
            <li>
              <button
                onClick={onConnectGoogle}
                className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
              >
                {copy.aiTutor}
              </button>
            </li>
            <li>
              <button
                onClick={onConnectGoogle}
                className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
              >
                {copy.flashcardGen}
              </button>
            </li>
            <li>
              <button
                onClick={onConnectGoogle}
                className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
              >
                {copy.smartExport}
              </button>
            </li>
          </ul>
        </div>

        {/* COLUMN 4: Legal & Contact */}
        <div className="lg:col-span-2 sm:col-span-1 flex flex-col space-y-2.5">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            {copy.legals}
          </h4>
          <ul className="flex flex-col space-y-2 text-xs sm:text-sm">
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
            <li>
              <a
                href="https://github.com/bluebleaze/IOnLearn"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors"
              >
                {copy.github}
              </a>
            </li>
            <li>
              <a
                href="mailto:wangywangy9999@gmail.com"
                className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors"
              >
                {copy.contact}
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="pt-6 border-t border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-500">
        <div>{copy.copyright}</div>

        <div className="flex items-center gap-2 pt-1">
          <a
            href="https://github.com/bluebleaze/IOnLearn"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            title="GitHub Repository (bluebleaze/IOnLearn)"
            className="w-7 h-7 rounded-md bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
          </a>
          <a
            href="mailto:wangywangy9999@gmail.com"
            aria-label="Email"
            className="w-7 h-7 rounded-md bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={scrollToTop}
            aria-label={copy.backToTop}
            title={copy.backToTop}
            className="h-7 px-2 rounded-md bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center gap-1 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer text-[11px]"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{copy.backToTop}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
