"use client";

import React from "react";

export function WhyChooseUsSection() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        
        {/* CELL 1: Header Block - Right Aligned towards the cards */}
        <div className="flex flex-col justify-center items-start md:items-end text-left md:text-right px-2 py-4 md:py-6">
          <span className="font-montserrat font-bold text-xs sm:text-sm text-[#4838cc] dark:text-[#818cf8] tracking-wider lowercase mb-2">
            why choose us
          </span>
          <h2 className="font-cal text-2xl sm:text-3xl md:text-[36px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.18]">
            Why <span className="text-[#4838cc] dark:text-[#818cf8]">IOnLearn</span> is <br className="hidden md:inline" />
            The Right Choice <br className="hidden md:inline" />
            for You?
          </h2>
        </div>

        {/* CELL 2: Smart AI Study Chatbot (Lavender Pastel) */}
        <div className="bg-[#eeedfc] dark:bg-[#1a1738] rounded-[28px] p-6 sm:p-8 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-indigo-100/60 dark:border-indigo-900/30 group">
          <h3 className="font-montserrat font-bold text-base sm:text-lg text-slate-900 dark:text-white">
            Smart AI Study Chatbot
          </h3>
          <p className="font-inter text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed mt-10">
            Ask anything about your lessons and get quick, easy answers like talking to a friendly tutor.
          </p>
        </div>

        {/* CELL 3: Auto-Notes Generator (Blush Pink Pastel) */}
        <div className="bg-[#fdf0ee] dark:bg-[#2d1b20] rounded-[28px] p-6 sm:p-8 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-rose-100/60 dark:border-rose-900/30 group">
          <h3 className="font-montserrat font-bold text-base sm:text-lg text-slate-900 dark:text-white">
            Auto-Notes Generator
          </h3>
          <p className="font-inter text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed mt-10">
            Instantly turns long lessons and PDFs into neat, short notes so you can review in seconds.
          </p>
        </div>

        {/* CELL 4: Zero Study Confusion (Warm Cream Pastel - Spans 2 Columns) */}
        <div className="md:col-span-2 bg-[#faf7ee] dark:bg-[#25231c] rounded-[28px] p-6 sm:p-8 flex flex-col justify-between min-h-[200px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-amber-100/60 dark:border-amber-900/30 group">
          <h3 className="font-montserrat font-bold text-base sm:text-lg text-slate-900 dark:text-white">
            Zero Study Confusion
          </h3>
          <p className="font-inter text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl mt-10">
            Gives you a clear, step-by-step path to understand tough topics easily, saving you time and effort.
          </p>
        </div>

        {/* CELL 5: Built-in To-Do List: (Ice Blue Pastel) */}
        <div className="bg-[#edf6fc] dark:bg-[#162433] rounded-[28px] p-6 sm:p-8 flex flex-col justify-between min-h-[200px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-sky-100/60 dark:border-sky-900/30 group">
          <h3 className="font-montserrat font-bold text-base sm:text-lg text-slate-900 dark:text-white">
            Built-in To-Do List:
          </h3>
          <p className="font-inter text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed mt-10">
            Helps you organize your daily tasks and study plans so you never miss a deadline.
          </p>
        </div>

      </div>
    </section>
  );
}
