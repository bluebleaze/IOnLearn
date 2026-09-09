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
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        
        {/* CELL 1: Header Block - Right Aligned towards the cards */}
        <div className="flex flex-col justify-center items-start md:items-end text-left md:text-right px-2 py-4 md:py-6">
          <span className="font-montserrat font-bold text-xs sm:text-sm text-[#4838cc] dark:text-[#818cf8] tracking-wider lowercase mb-2">
            {copy.eyebrow}
          </span>
          <h2 className="font-cal text-2xl sm:text-3xl md:text-[36px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.18]">
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

        {/* CELL 2: Smart AI Study Chatbot (Lavender Pastel) */}
        <div className="bg-[#eeedfc] dark:bg-[#1a1738] rounded-[28px] p-6 sm:p-8 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-indigo-100/60 dark:border-indigo-900/30 group">
          <h3 className="font-montserrat font-bold text-base sm:text-lg text-slate-900 dark:text-white">
            {copy.cards[0].title}
          </h3>
          <p className="font-inter text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed mt-10">
            {copy.cards[0].text}
          </p>
        </div>

        {/* CELL 3: Auto-Notes Generator (Blush Pink Pastel) */}
        <div className="bg-[#fdf0ee] dark:bg-[#2d1b20] rounded-[28px] p-6 sm:p-8 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-rose-100/60 dark:border-rose-900/30 group">
          <h3 className="font-montserrat font-bold text-base sm:text-lg text-slate-900 dark:text-white">
            {copy.cards[1].title}
          </h3>
          <p className="font-inter text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed mt-10">
            {copy.cards[1].text}
          </p>
        </div>

        {/* CELL 4: Zero Study Confusion (Warm Cream Pastel - Spans 2 Columns) */}
        <div className="md:col-span-2 bg-[#faf7ee] dark:bg-[#25231c] rounded-[28px] p-6 sm:p-8 flex flex-col justify-between min-h-[200px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-amber-100/60 dark:border-amber-900/30 group">
          <h3 className="font-montserrat font-bold text-base sm:text-lg text-slate-900 dark:text-white">
            {copy.cards[2].title}
          </h3>
          <p className="font-inter text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl mt-10">
            {copy.cards[2].text}
          </p>
        </div>

        {/* CELL 5: Built-in To-Do List: (Ice Blue Pastel) */}
        <div className="bg-[#edf6fc] dark:bg-[#162433] rounded-[28px] p-6 sm:p-8 flex flex-col justify-between min-h-[200px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-sky-100/60 dark:border-sky-900/30 group">
          <h3 className="font-montserrat font-bold text-base sm:text-lg text-slate-900 dark:text-white">
            {copy.cards[3].title}
          </h3>
          <p className="font-inter text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed mt-10">
            {copy.cards[3].text}
          </p>
        </div>

      </div>
    </section>
  );
}
