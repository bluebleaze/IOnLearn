"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LegalNav, LegalLang } from "@/components/LegalNav";
import {
  FileText,
  CheckCircle2,
  ExternalLink,
  Languages,
} from "lucide-react";

export function TermsContent() {
  const [lang, setLang] = useState<LegalLang>("id");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get("lang");
      if (urlLang === "en" || urlLang === "id") {
        setLang(urlLang);
        localStorage.setItem("ionlearn_legal_lang", urlLang);
      } else {
        const savedLang = localStorage.getItem("ionlearn_legal_lang") as LegalLang | null;
        if (savedLang === "en" || savedLang === "id") {
          setLang(savedLang);
        }
      }
    }
  }, []);

  const handleToggleLang = (newLang: LegalLang) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("ionlearn_legal_lang", newLang);
      const url = new URL(window.location.href);
      url.searchParams.set("lang", newLang);
      window.history.replaceState(null, "", url.toString());
    }
  };

  const isEn = lang === "en";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-200 flex flex-col font-sans transition-colors">
      <LegalNav currentPage="terms" currentLang={lang} onToggleLang={handleToggleLang} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Document Header */}
        <div className="mb-10 pb-8 border-b border-slate-200 dark:border-[#222222]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <FileText className="w-3.5 h-3.5" />
              <span>{isEn ? "Official Terms of Service" : "Dokumen Resmi Layanan"}</span>
            </div>

            {/* In-page language indicator badge */}
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#888888] bg-slate-100 dark:bg-[#161616] px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-[#262626]">
              <Languages className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isEn ? "Language:" : "Bahasa:"}</span>
              <button
                type="button"
                onClick={() => handleToggleLang(isEn ? "id" : "en")}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer ml-0.5"
              >
                {isEn ? "Switch to Bahasa Indonesia" : "Ganti ke English"}
              </button>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading mb-3">
            {isEn ? "Terms of Service" : "Ketentuan Layanan (Terms of Service)"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#888888] leading-relaxed">
            {isEn ? (
              <>
                Last updated: <strong>September 6, 2026</strong> • Applicable to domain{" "}
                <span className="font-mono text-xs bg-slate-200/60 dark:bg-[#181818] px-1.5 py-0.5 rounded">
                  ionlearn.my.id
                </span>{" "}
                and all associated sub-domains.
              </>
            ) : (
              <>
                Terakhir diperbarui: <strong>6 September 2026</strong> • Berlaku untuk domain{" "}
                <span className="font-mono text-xs bg-slate-200/60 dark:bg-[#181818] px-1.5 py-0.5 rounded">
                  ionlearn.my.id
                </span>{" "}
                dan seluruh sub-domain terkait.
              </>
            )}
          </p>
        </div>

        {/* Content Body */}
        {isEn ? (
          /* ============================================================
             ENGLISH CONTENT
             ============================================================ */
          <div className="space-y-10 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-[#c4c4c4]">
            {/* Section 1: Acceptance of Terms */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  1
                </span>
                <h2>Acceptance of Terms</h2>
              </div>
              <p>
                Welcome to <strong>IOnLearn</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;service&rdquo;, or &ldquo;platform&rdquo;), accessible via{" "}
                <a
                  href="https://www.ionlearn.my.id"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  https://www.ionlearn.my.id
                </a>
                . By accessing, signing in, or utilizing any features of IOnLearn, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service and our Privacy Policy.
              </p>
              <p>
                If you do not agree with any part of these terms, you should immediately cease all access and use of the platform.
              </p>
            </section>

            {/* Section 2: Description of Services */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  2
                </span>
                <h2>Description of Services</h2>
              </div>
              <p>
                IOnLearn is an academic productivity and learning scaffold designed to support students, educators, and lifelong learners through:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-indigo-600 dark:marker:text-indigo-400">
                <li>
                  <strong>Google Classroom Task Synchronization:</strong> Securely fetching enrolled coursework, submission statuses, and deadlines via official Google APIs.
                </li>
                <li>
                  <strong>Personal Task & To-Do Management:</strong> Structuring coursework into actionable sub-tasks and personalized study routines.
                </li>
                <li>
                  <strong>Academic Study Notes:</strong> Creating and preserving rich study notes attached to specific courses.
                </li>
                <li>
                  <strong>AI Study Assistant:</strong> Providing conceptual explanations, step-by-step homework breakdowns, and curated educational YouTube video recommendations.
                </li>
                <li>
                  <strong>Document Studio:</strong> Generating and customizing structured academic documents (.docx, .pptx, .xlsx) via an interactive GUI.
                </li>
              </ul>
            </section>

            {/* Section 3: Google Account Integration */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  3
                </span>
                <h2>Google Account Integration & API Compliance</h2>
              </div>
              <p>
                To provide coursework synchronization, IOnLearn connects via standard Google OAuth 2.0. By linking your Google account:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-indigo-600 dark:marker:text-indigo-400">
                <li>
                  You authorize IOnLearn to read basic profile information and Google Classroom enrolled courses/coursework under read-only permissions.
                </li>
                <li>
                  IOnLearn <strong>never</strong> requests permissions to submit assignments on your behalf, alter academic grades, or modify course settings without explicit user actions.
                </li>
                <li>
                  IOnLearn&apos;s use and transfer of information received from Google APIs will adhere strictly to the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    Google API Services User Data Policy
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                  , including the Limited Use requirements.
                </li>
              </ul>
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-xs sm:text-sm text-emerald-900 dark:text-emerald-300">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Right to Revoke Permissions at Any Time:
                </p>
                You can disconnect Google Classroom at any time using the &ldquo;Disconnect Account&rdquo; button in IOnLearn, or via your Google Account Permissions portal at{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold"
                >
                  https://myaccount.google.com/permissions
                </a>
                .
              </div>
            </section>

            {/* Section 4: User Responsibilities & Academic Integrity */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  4
                </span>
                <h2>User Responsibilities & Academic Integrity</h2>
              </div>
              <p>When using IOnLearn, you explicitly agree to:</p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-indigo-600 dark:marker:text-indigo-400">
                <li>Safeguard your authentication credentials and prevent unauthorized access.</li>
                <li>Refrain from using the platform for unlawful activities, security probing, or network disruption.</li>
                <li>
                  <strong>Commitment to Academic Integrity:</strong> The AI Assistant and Document Studio are engineered as learning scaffolds and conceptual guides. Users bear individual responsibility for honoring their educational institution&apos;s academic honor codes. You agree not to submit AI outputs verbatim or engage in academic dishonesty.
                </li>
              </ul>
            </section>

            {/* Section 5: Disclaimer & AI Limitation */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  5
                </span>
                <h2>Disclaimer & Limitation of Liability</h2>
              </div>
              <p>
                IOnLearn is provided on an <em>&ldquo;as is&rdquo;</em> and <em>&ldquo;as available&rdquo;</em> basis. While we strive for maximum reliability:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-indigo-600 dark:marker:text-indigo-400">
                <li>We do not warrant that service operations will be uninterrupted or immune to third-party API latency.</li>
                <li>AI responses may occasionally contain inaccuracies or hallucinated details. Users are strongly advised to cross-check formulas, factual claims, and code against authoritative course textbooks and teacher instructions.</li>
                <li>IOnLearn is not liable for missed academic deadlines resulting from personal user scheduling or third-party network outages.</li>
              </ul>
            </section>

            {/* Section 6: Intellectual Property */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  6
                </span>
                <h2>Intellectual Property Rights</h2>
              </div>
              <p>
                The platform user interface, codebase, logos, and documentation are the intellectual property of IOnLearn and its open-source contributors, licensed under the MIT License.
              </p>
              <p>
                All coursework materials, assignment briefs, and study content synchronized from your Google Classroom remain the exclusive intellectual property of you or your academic institution.
              </p>
            </section>

            {/* Section 7: Modifications */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  7
                </span>
                <h2>Modifications to Terms</h2>
              </div>
              <p>
                We reserve the right to revise these Terms of Service to match feature enhancements or legal requirements. Continued use of the platform after updates constitutes acceptance of the revised terms.
              </p>
            </section>

            {/* Section 8: Contact */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  8
                </span>
                <h2>Contact & Official Support</h2>
              </div>
              <p>
                If you have questions, inquiries, or feedback regarding these terms, please contact:
              </p>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200/60 dark:border-[#262626] space-y-1 text-xs sm:text-sm">
                <p>
                  <strong>Platform:</strong> IOnLearn
                </p>
                <p>
                  <strong>Website:</strong>{" "}
                  <a
                    href="https://www.ionlearn.my.id"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    https://www.ionlearn.my.id
                  </a>
                </p>
                <p>
                  <strong>Support Email:</strong>{" "}
                  <a
                    href="mailto:support@ionlearn.my.id"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    support@ionlearn.my.id
                  </a>{" "}
                  /{" "}
                  <a
                    href="mailto:wangywangy9999@gmail.com"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    wangywangy9999@gmail.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        ) : (
          /* ============================================================
             INDONESIAN CONTENT
             ============================================================ */
          <div className="space-y-10 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-[#c4c4c4]">
            {/* Section 1: Pengantar & Penerimaan */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  1
                </span>
                <h2>Penerimaan Ketentuan</h2>
              </div>
              <p>
                Selamat datang di <strong>IOnLearn</strong> (&ldquo;kami&rdquo;, &ldquo;layanan&rdquo;, atau &ldquo;platform&rdquo;), yang dapat diakses melalui situs web{" "}
                <a
                  href="https://www.ionlearn.my.id"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  https://www.ionlearn.my.id
                </a>
                . Dengan mengakses, membuat akun, atau menggunakan layanan IOnLearn, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat secara hukum oleh Ketentuan Layanan ini serta Kebijakan Privasi kami.
              </p>
              <p>
                Jika Anda tidak menyetujui salah satu bagian dari ketentuan ini, Anda dipersilakan untuk tidak menggunakan atau menghentikan penggunaan platform IOnLearn.
              </p>
            </section>

            {/* Section 2: Deskripsi Layanan */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  2
                </span>
                <h2>Deskripsi Layanan IOnLearn</h2>
              </div>
              <p>
                IOnLearn adalah platform produktivitas akademik yang dirancang untuk mendukung siswa, mahasiswa, dan pembelajar mandiri dalam:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-indigo-600 dark:marker:text-indigo-400">
                <li>
                  <strong>Sinkronisasi Tugas Google Classroom:</strong> Mengambil dan merapikan daftar tugas kuliah/sekolah, tenggat waktu (*deadline*), dan status penyelesaian melalui API resmi Google Classroom.
                </li>
                <li>
                  <strong>Manajemen Tugas & To-Do Mandiri:</strong> Menyediakan sistem pelacakan to-do list pribadi beserta subtugas terstruktur.
                </li>
                <li>
                  <strong>Pencatatan Materi (*Study Notes*):</strong> Fasilitas membuat dan menyimpan catatan belajar terkurasi.
                </li>
                <li>
                  <strong>Pendamping Belajar Berbasis AI (*AI Study Assistant*):</strong> Memberikan rangkuman materi, penjelasan konsep langkah demi langkah, dan kurasi referensi video pembelajaran YouTube yang relevan dengan tugas.
                </li>
                <li>
                  <strong>Studio Dokumen AI:</strong> Menghasilkan dan mengkustomisasi dokumen akademik terstruktur (.docx, .pptx, .xlsx) langsung melalui antarmuka GUI interaktif.
                </li>
              </ul>
            </section>

            {/* Section 3: Integrasi Google Account & API */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  3
                </span>
                <h2>Integrasi Akun Google & Kepatuhan Google API</h2>
              </div>
              <p>
                Untuk memanfaatkan fitur sinkronisasi tugas, IOnLearn menggunakan integrasi OAuth 2.0 resmi dari Google. Dengan menghubungkan akun Google Anda:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-indigo-600 dark:marker:text-indigo-400">
                <li>
                  Anda memberikan izin bagi IOnLearn untuk mengakses data profil dasar (nama, email, avatar) serta data Google Classroom (daftar kelas dan tugas yang ditugaskan kepada Anda) dengan cakupan izin baca (*read-only*).
                </li>
                <li>
                  IOnLearn <strong>tidak pernah</strong> meminta izin untuk mengubah nilai, menghapus kelas, atau mengirimkan penugasan atas nama Anda tanpa tindakan eksplisit Anda.
                </li>
                <li>
                  Penggunaan dan transfer informasi yang diterima dari Google API oleh IOnLearn ke aplikasi lain akan mematuhi{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    Google API Services User Data Policy
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                  , termasuk persyaratan Penggunaan Terbatas (*Limited Use requirements*).
                </li>
              </ul>
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-xs sm:text-sm text-emerald-900 dark:text-emerald-300">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Hak Pencabutan Akses Sewaktu-waktu:
                </p>
                Anda dapat memutuskan integrasi Google Classroom kapan saja melalui tombol &ldquo;Putuskan Akun&rdquo; di pengaturan IOnLearn, atau langsung melalui pengaturan keamanan akun Google Anda di{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold"
                >
                  https://myaccount.google.com/permissions
                </a>
                .
              </div>
            </section>

            {/* Section 4: Kewajiban & Perilaku Pengguna */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  4
                </span>
                <h2>Kewajiban Pengguna & Integritas Akademik</h2>
              </div>
              <p>Dalam menggunakan platform IOnLearn, Anda menyetujui untuk:</p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-indigo-600 dark:marker:text-indigo-400">
                <li>Menjaga kerahasiaan dan keamanan kredensial akun Google Anda.</li>
                <li>Tidak menggunakan layanan untuk kegiatan ilegal, penipuan, pelanggaran hak cipta, atau merusak infrastruktur server.</li>
                <li>
                  <strong>Integritas Akademik:</strong> Fitur Asisten AI ditujukan sebagai sarana pembelajaran mandiri, pembimbing konsep, dan penjelas materi. Pengguna bertanggung jawab secara pribadi untuk menjunjung tinggi kode etik akademik di institusi masing-masing dan tidak menggunakan AI untuk plagiarisme atau kecurangan akademik.
                </li>
              </ul>
            </section>

            {/* Section 5: Batasan Tanggung Jawab & Disclaimer AI */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  5
                </span>
                <h2>Batasan Tanggung Jawab (Disclaimer)</h2>
              </div>
              <p>
                Layanan IOnLearn disediakan atas dasar <em>&ldquo;sebagaimana adanya&rdquo;</em> (*as is*) dan <em>&ldquo;sebagaimana tersedia&rdquo;</em> (*as available*). Kami berusaha semaksimal mungkin memberikan layanan yang stabil, akurat, dan andal, namun kami tidak menjamin bahwa:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-indigo-600 dark:marker:text-indigo-400">
                <li>Layanan akan selalu bebas dari gangguan, penundaan sinkronisasi, atau kendala jaringan pihak ketiga.</li>
                <li>Seluruh respons yang dihasilkan oleh model kecerdasan buatan (*AI*) selalu bebas dari kekeliruan (halusinasi AI). Pengguna disarankan untuk selalu memverifikasi ulang rumus, data, dan fakta teknis terhadap buku teks atau arahan pengajar resmi.</li>
                <li>IOnLearn tidak bertanggung jawab atas keterlambatan pengumpulan tugas akademik yang disebabkan oleh kelalaian pribadi pengguna atau kendala konektivitas eksternal.</li>
              </ul>
            </section>

            {/* Section 6: Hak Kekayaan Intelektual */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  6
                </span>
                <h2>Hak Kekayaan Intelektual</h2>
              </div>
              <p>
                Seluruh antarmuka, desain, logo resmi IOnLearn, merek dagang, kode sumber, dan dokumentasi platform adalah milik pengembang IOnLearn dan dilindungi oleh hukum hak cipta yang berlaku.
              </p>
              <p>
                Konten materi, deskripsi tugas kelas, dan dokumen yang Anda unggah atau sinkronkan tetap menjadi milik Anda atau institusi pendidikan terkait. IOnLearn tidak mengklaim kepemilikan atas materi akademik pengguna.
              </p>
            </section>

            {/* Section 7: Perubahan Ketentuan */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  7
                </span>
                <h2>Perubahan Ketentuan Layanan</h2>
              </div>
              <p>
                Kami dapat memperbarui Ketentuan Layanan ini dari waktu ke waktu untuk mencerminkan perubahan pada fitur aplikasi atau kepatuhan regulasi hukum. Setiap perubahan substansial akan diumumkan melalui tanggal pembaruan di bagian atas halaman ini. Melanjutkan penggunaan layanan setelah perubahan menandakan persetujuan Anda terhadap ketentuan yang diperbarui.
              </p>
            </section>

            {/* Section 8: Kontak Resmi */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  8
                </span>
                <h2>Kontak & Layanan Bantuan</h2>
              </div>
              <p>
                Apabila Anda memiliki pertanyaan, saran, atau memerlukan informasi lebih lanjut mengenai Ketentuan Layanan ini, silakan hubungi tim kami melalui:
              </p>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200/60 dark:border-[#262626] space-y-1 text-xs sm:text-sm">
                <p>
                  <strong>Platform:</strong> IOnLearn
                </p>
                <p>
                  <strong>Website:</strong>{" "}
                  <a
                    href="https://www.ionlearn.my.id"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    https://www.ionlearn.my.id
                  </a>
                </p>
                <p>
                  <strong>Email Dukungan:</strong>{" "}
                  <a
                    href="mailto:support@ionlearn.my.id"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    support@ionlearn.my.id
                  </a>{" "}
                  /{" "}
                  <a
                    href="mailto:wangywangy9999@gmail.com"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    wangywangy9999@gmail.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        )}

        {/* Footer Navigation link */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-[#777777]">
          <p>© {new Date().getFullYear()} IOnLearn. {isEn ? "All rights reserved." : "Seluruh hak cipta dilindungi undang-undang."}</p>
          <div className="flex items-center gap-4">
            <Link href={`/privacy?lang=${lang}`} className="hover:text-slate-900 dark:hover:text-white transition-colors underline">
              {isEn ? "Privacy Policy" : "Kebijakan Privasi"}
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors underline">
              {isEn ? "Application Home" : "Beranda Aplikasi"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

