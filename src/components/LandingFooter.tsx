"use client";

import React from "react";
import Link from "next/link";

interface LandingFooterProps {
  onConnectGoogle: () => void;
}

export function LandingFooter({ onConnectGoogle }: LandingFooterProps) {
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
            &ldquo;Study Smarter, master any subject effortlessly&rdquo;
          </p>

          <span className="font-inter text-xs text-slate-400 dark:text-zinc-500">
            &copy; 2026 IonLearn. All rights reserved.
          </span>
        </div>

        {/* COLUMN 2: Quick Navigation (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col">
          <h4 className="font-montserrat font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-3">
            Quick Navigation
          </h4>
          <ul className="flex flex-col gap-2 font-inter text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            <li>
              <a href="#" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                Home
              </a>
            </li>
            <li>
              <a href="#about-platform" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#about-platform" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                Interactive Demo
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                FAQ
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
            Connection
          </h4>
          <ul className="flex flex-col gap-2 font-inter text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors"
              >
                Source Code - GitHub
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

        {/* COLUMN 4: Legals (lg:col-span-2) */}
        <div className="lg:col-span-2 flex flex-col">
          <h4 className="font-montserrat font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-3">
            Legals
          </h4>
          <ul className="flex flex-col gap-2 font-inter text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            <li>
              <Link href="/terms" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-[#4838cc] dark:hover:text-indigo-400 transition-colors">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
