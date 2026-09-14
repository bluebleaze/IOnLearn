"use client";

import React from "react";

interface WhyChooseUsSectionProps {
  language?: "ENG" | "IND";
}

export function WhyChooseUsSection({ language = "ENG" }: WhyChooseUsSectionProps) {
  const copy =
    language === "IND"
      ? {
          eyebrow: "mengapa memilih kami",
          heading: ["Mengapa", "IOnLearn", "Adalah", "Pilihan", "Tepat", "Untukmu?"],
          cards: [
            { title: "Chatbot AI Cerdas", text: "Tanya apa saja tentang pelajaran Anda dan dapatkan jawaban cepat seperti berbicara dengan tutor ramah." },
            { title: "Generator Catatan Otomatis", text: "Mengubah materi panjang dan PDF menjadi catatan singkat yang rapi agar Anda bisa review dalam hitungan detik." },
            { title: "Kehilangan Kebingungan Belajar", text: "Memberikan langkah yang jelas dan terstruktur untuk memahami topik sulit dengan mudah, menghemat waktu dan tenaga." },
            { title: "Daftar To-Do Terintegrasi", text: "Membantu Anda mengatur tugas harian dan rencana belajar agar tidak pernah melewatkan tenggat." },
          ],
        }
      : {
          eyebrow: "why choose us",
          heading: ["Why", "IOnLearn", "is", "The Right Choice", "for You?"],
          cards: [
            { title: "Smart AI Study Chatbot", text: "Ask anything about your lessons and get quick, easy answers like talking to a friendly tutor." },
            { title: "Auto-Notes Generator", text: "Instantly turns long lessons and PDFs into neat, short notes so you can review in seconds." },
            { title: "Zero Study Confusion", text: "Gives you a clear, step-by-step path to understand tough topics easily, saving you time and effort." },
            { title: "Built-in To-Do List", text: "Helps you organize your daily tasks and study plans so you never miss a deadline." },
          ],
        };
  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-20">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[0.9fr_1fr_1fr] md:gap-5">
        <div className="flex flex-col justify-center items-start px-2 py-4 md:items-end md:py-6 md:text-right">
          <span className="font-montserrat text-xs sm:text-sm font-bold tracking-wider text-[#4838cc] lowercase dark:text-[#818cf8] mb-2">
            {copy.eyebrow}
          </span>
          <h2 className="font-cal text-2xl sm:text-3xl md:text-[36px] font-black leading-[1.08] tracking-tight text-slate-900 dark:text-white">
            {copy.heading.map((part, index) => (
              <React.Fragment key={part + index}>
                {index === 1 ? (
                  <span className="text-[#4838cc] dark:text-[#818cf8]">{part}</span>
                ) : (
                  <>{part}{" "}</>
                )}
                {index < copy.heading.length - 1 && index !== 0 && index !== 1 ? <br className="hidden md:inline" /> : null}
              </React.Fragment>
            ))}
          </h2>
        </div>

        <article className="group relative overflow-hidden rounded-[30px] border border-indigo-100 bg-[linear-gradient(135deg,#eeedfc_0%,#f5f3ff_100%)] p-5 shadow-[0_16px_36px_rgba(79,70,229,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(79,70,229,0.12)] dark:border-indigo-900/30 dark:bg-[linear-gradient(135deg,#1a1738_0%,#201b46_100%)] sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-sm font-bold text-[#4b43c6] shadow-sm dark:bg-white/10 dark:text-indigo-300">
              01
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-[#4b43c6] dark:bg-[#818cf8]" />
          </div>
          <h3 className="font-montserrat text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {copy.cards[0].title}
          </h3>
          <p className="mt-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300 sm:text-[13px]">
            {copy.cards[0].text}
          </p>
        </article>

        <article className="group relative overflow-hidden rounded-[30px] border border-rose-100 bg-[linear-gradient(135deg,#fdf0ee_0%,#fff4f1_100%)] p-5 shadow-[0_16px_36px_rgba(244,114,182,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(244,114,182,0.12)] dark:border-rose-900/30 dark:bg-[linear-gradient(135deg,#2d1b20_0%,#331e22_100%)] sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-sm font-bold text-rose-600 shadow-sm dark:bg-white/10 dark:text-rose-300">
              02
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 dark:bg-rose-400" />
          </div>
          <h3 className="font-montserrat text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {copy.cards[1].title}
          </h3>
          <p className="mt-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300 sm:text-[13px]">
            {copy.cards[1].text}
          </p>
        </article>

        <article className="group relative overflow-hidden rounded-[30px] border border-amber-100 bg-[linear-gradient(135deg,#fff9eb_0%,#fdf7ed_100%)] p-5 shadow-[0_16px_36px_rgba(251,191,36,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(251,191,36,0.12)] dark:border-amber-900/30 dark:bg-[linear-gradient(135deg,#25231c_0%,#2a2a22_100%)] sm:p-6 md:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-sm font-bold text-amber-600 shadow-sm dark:bg-white/10 dark:text-amber-300">
              03
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 dark:bg-yellow-300" />
          </div>
          <h3 className="font-montserrat text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {copy.cards[2].title}
          </h3>
          <p className="mt-4 max-w-xl text-xs leading-relaxed text-slate-700 dark:text-slate-300 sm:text-[13px]">
            {copy.cards[2].text}
          </p>
        </article>

        <article className="group relative overflow-hidden rounded-[30px] border border-sky-100 bg-[linear-gradient(135deg,#edf6fc_0%,#f5fbff_100%)] p-5 shadow-[0_16px_36px_rgba(59,130,246,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(59,130,246,0.12)] dark:border-sky-900/30 dark:bg-[linear-gradient(135deg,#162433_0%,#1b2f46_100%)] sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-sm font-bold text-sky-600 shadow-sm dark:bg-white/10 dark:text-sky-300">
              04
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 dark:bg-sky-300" />
          </div>
          <h3 className="font-montserrat text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {copy.cards[3].title}
          </h3>
          <p className="mt-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300 sm:text-[13px]">
            {copy.cards[3].text}
          </p>
        </article>
      </div>
    </section>
  );
}
