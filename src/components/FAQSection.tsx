"use client";

import React, { useState } from "react";
import { ChevronDown, Mail } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  language?: "ENG" | "IND";
}

export function FAQSection({ language = "ENG" }: FAQSectionProps) {
  const FAQ_DATA: FAQItem[] =
    language === "IND"
      ? [
          {
            question: "Bahan studi apa yang bisa saya proses dengan IOnLearn?",
            answer:
              "Anda dapat mengunggah PDF, buku teks, slide kuliah, dokumen penelitian, dan catatan kelas. Mesin AI berdata rendah kami mengekstraksi konsep inti, menghasilkan rangkuman poin penting, flashcard interaktif, dan kuis latihan dalam hitungan detik.",
          },
          {
            question: "Bagaimana IonLearn membantu saya belajar lebih cepat?",
            answer:
              "Dengan menghilangkan detail yang tidak perlu dan meringkas teks panjang menjadi ringkasan singkat serta flashcard yang memicu ingatan aktif, IonLearn memangkas waktu membaca hingga 60% sambil meningkatkan retensi untuk ujian.",
          },
          {
            question: "Apakah saya perlu membuat akun untuk mencoba fitur?",
            answer:
              "Tidak! Anda dapat langsung mencoba Demo interaktif kami tanpa perlu masuk atau menyinkronkan akun Google. Semua alat belajar utama dapat dicoba langsung di browser Anda.",
          },
          {
            question: "Apakah IonLearn gratis untuk mahasiswa?",
            answer:
              "Ya, IonLearn sepenuhnya gratis untuk mahasiswa. Selaras dengan Tujuan Pembangunan Berkelanjutan ke-4 (Pendidikan Berkualitas), misi kami adalah menyediakan alat pembelajaran yang terjangkau dan hemat bandwidth bagi setiap pelajar di seluruh dunia.",
          },
        ]
      : [
          {
            question: "What study materials can I process with IOnLearn?",
            answer:
              "You can upload PDFs, textbooks, lecture slides, research documents, and class notes. Our low-data AI engine extracts the key concepts, generates structured bullet notes, interactive flashcards, and practice quizzes in seconds.",
          },
          {
            question: "How does IonLearn help me study faster?",
            answer:
              "By eliminating academic fluff and condensing long texts into bite-sized summaries and active-recall flashcards, IonLearn cuts reading time by up to 60% while dramatically improving retention for exams.",
          },
          {
            question: "Do I need to create an account to try the features?",
            answer:
              "No! You can immediately try our interactive Demo Mode without needing to log in or sync your Google account. All core study tools are fully testable right in your browser.",
          },
          {
            question: "Is IonLearn free to use for students?",
            answer:
              "Yes, IonLearn is completely free for students. In alignment with UN Sustainable Development Goal 4 (Quality Education), our mission is to provide accessible, low-bandwidth learning tools for every learner worldwide.",
          },
        ];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-10 scroll-mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* LEFT COLUMN: FAQ List */}
        <div className="lg:col-span-7 flex flex-col">
          <span className="font-montserrat font-bold text-xs sm:text-sm text-[#4838cc] dark:text-[#818cf8] tracking-wider lowercase mb-2">
            {language === "IND" ? "pertanyaan umum" : "frequently asked questions"}
          </span>
          <h2 className="font-cal text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 sm:mb-8">
            {language === "IND" ? "Pertanyaan yang Sering Diajukan" : "Frequently Asked Questions"}
          </h2>

          <div className="flex flex-col">
            {FAQ_DATA.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="border-b border-slate-200/90 dark:border-zinc-800 transition-colors"
                >
                  <button
                    onClick={() => toggleIndex(index)}
                    className="w-full py-4 sm:py-5 flex items-center justify-between gap-4 text-left group cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="font-montserrat font-semibold text-sm sm:text-base text-slate-900 dark:text-zinc-100 group-hover:text-[#4838cc] dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 dark:text-zinc-400 transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? "rotate-180 text-[#4838cc] dark:text-indigo-400" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-60 pb-5 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="font-inter text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed pr-6">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Have Any Questions on Your Mind? Ask Us! */}
        <div className="lg:col-span-5 flex flex-col pt-2 lg:pt-8">
          <h3 className="font-cal text-3xl sm:text-4xl md:text-[44px] font-black text-slate-900 dark:text-white leading-[1.15] mb-6 select-none">
            {language === "IND" ? (
              <>
                Ada <br />
                Pertanyaan di <br />
                Pikiran Anda? <br />
                Tanyakan!
              </>
            ) : (
              <>
                Have Any <br />
                Questions on <br />
                Your Mind? <br />
                Ask Us!
              </>
            )}
          </h3>

          {/* Contact Pastel Card */}
          <div className="bg-[#f3f2ff] dark:bg-[#1a1738] rounded-2xl p-6 sm:p-7 border border-indigo-100/70 dark:border-indigo-900/30 transition-all hover:shadow-md">
            <div className="flex items-center gap-2 text-[#4838cc] dark:text-[#818cf8] mb-2">
              <Mail className="w-4 h-4" />
              <span className="font-inter text-xs sm:text-sm font-semibold text-slate-600 dark:text-zinc-300">
                {language === "IND" ? "Email Kontak:" : "Contact Email:"}
              </span>
            </div>

            <div className="flex flex-col gap-1 mt-1">
              <a
                href="mailto:support@ionlearn.app"
                className="font-montserrat font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-[#4838cc] dark:hover:text-[#818cf8] transition-colors"
              >
                support@ionlearn.app
              </a>
              <a
                href="mailto:contact@ionlearn.app"
                className="font-montserrat font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-[#4838cc] dark:hover:text-[#818cf8] transition-colors"
              >
                contact@ionlearn.app
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
