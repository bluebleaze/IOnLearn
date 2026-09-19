"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LegalNav, LegalLang } from "@/components/LegalNav";
import {
  Shield,
  Lock,
  ExternalLink,
  CheckCircle2,
  Trash2,
  Mail,
  Languages,
} from "lucide-react";

export function PrivacyContent() {
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
      <LegalNav currentPage="privacy" currentLang={lang} onToggleLang={handleToggleLang} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Document Header */}
        <div className="mb-10 pb-8 border-b border-slate-200 dark:border-[#222222]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Shield className="w-3.5 h-3.5" />
              <span>{isEn ? "Official Data Protection Document" : "Dokumen Resmi Perlindungan Data"}</span>
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
            {isEn ? "Privacy Policy" : "Kebijakan Privasi (Privacy Policy)"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#888888] leading-relaxed">
            {isEn ? (
              <>
                Last updated: <strong>September 6, 2026</strong> • Applicable to platform{" "}
                <span className="font-mono text-xs bg-slate-200/60 dark:bg-[#181818] px-1.5 py-0.5 rounded">
                  ionlearn.my.id
                </span>{" "}
                and all associated educational services.
              </>
            ) : (
              <>
                Terakhir diperbarui: <strong>6 September 2026</strong> • Berlaku untuk platform{" "}
                <span className="font-mono text-xs bg-slate-200/60 dark:bg-[#181818] px-1.5 py-0.5 rounded">
                  ionlearn.my.id
                </span>{" "}
                dan seluruh layanan terkait.
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
            {/* Section 1: Privacy Commitment */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  1
                </span>
                <h2>Our Privacy Commitment</h2>
              </div>
              <p>
                Your privacy is of utmost priority at <strong>IOnLearn</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;platform&rdquo;), accessible at{" "}
                <a
                  href="https://www.ionlearn.my.id"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  https://www.ionlearn.my.id
                </a>
                . This Privacy Policy details how we collect, process, store, and safeguard your personal information when utilizing our academic productivity platform, specifically regarding our integration with <strong>Google Classroom</strong> and <strong>Google Sign-In</strong>.
              </p>
              <p>
                By accessing or using IOnLearn, you acknowledge and agree to the data collection and usage practices described in this policy.
              </p>
            </section>

            {/* Section 2: Data We Collect */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  2
                </span>
                <h2>Data We Collect</h2>
              </div>
              <p>We adhere to strict data minimization, gathering only data that is strictly essential for core application functionalities:</p>
              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200/60 dark:border-[#262626]">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    A. Google Profile Information (Authentication Data)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0]">
                    When authenticating with Google Sign-In, we receive your full name, email address, profile picture URL, and unique Google account identifier to authenticate and customize your study session.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200/60 dark:border-[#262626]">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    B. Google Classroom & Google Drive Data (Read-Only Scopes)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0]">
                    With your explicit user consent, we request read-only permissions under the principle of least privilege:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0] font-mono">
                    <li>https://www.googleapis.com/auth/classroom.courses.readonly</li>
                    <li>https://www.googleapis.com/auth/classroom.coursework.me.readonly</li>
                    <li>https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly</li>
                    <li>https://www.googleapis.com/auth/classroom.student-submissions.me.readonly</li>
                    <li>https://www.googleapis.com/auth/drive.readonly</li>
                  </ul>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0] mt-2">
                    Synchronized data includes enrolled class titles, coursework names and descriptions, due dates, submission statuses, and attached study files (such as reference documents and assignment instructions) needed for in-app student review and AI-assisted comprehension.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200/60 dark:border-[#262626]">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    C. User-Generated Data
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0]">
                    Custom study notes, private to-do list tasks, in-session questions asked to the AI Assistant, and interface preference settings (e.g., dark/light theme).
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Google Limited Use & AI/ML Training Compliance */}
            <section className="space-y-4 bg-indigo-50/50 dark:bg-indigo-950/20 p-6 sm:p-8 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/60 shadow-xs">
              <div className="flex items-center gap-2.5 text-indigo-950 dark:text-indigo-200 font-heading font-bold text-lg">
                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <h2>Google API User Data Policy Compliance (Limited Use Requirements)</h2>
              </div>

              {/* Official English Affirmative Statement */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#141414] border border-indigo-200/80 dark:border-indigo-800/80 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed space-y-2">
                <p className="font-semibold text-indigo-700 dark:text-indigo-300">
                  Affirmative Limited Use Compliance Statement:
                </p>
                <blockquote className="border-l-2 border-indigo-500 pl-3 italic text-slate-700 dark:text-[#d0d0d0]">
                  &ldquo;IOnLearn&apos;s use and transfer of information received from Google APIs to any other app will adhere to the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 underline font-semibold inline-flex items-center gap-0.5"
                  >
                    Google API Services User Data Policy
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                  , including the Limited Use requirements. The use of raw or derived user data received from Workspace APIs will adhere to the Google User Data Policy, including the Limited Use requirements. User data is never used to develop, improve, or train generalized AI and/or ML models.&rdquo;
                </blockquote>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-[#c0c0c0]">
                Strictly and without exception, we enforce the following principles regarding Google API user data:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Direct Service Functionality Only:</strong> Google Classroom and Drive data are utilized exclusively to display assignments, organize academic deadlines, and provide personalized AI study guidance in the user&apos;s active learning session.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>NEVER Selling User Data:</strong> We never sell, rent, license, or trade user data received from Google APIs to any third parties, advertisers, or data brokers.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>NO Advertising:</strong> User data from Google APIs is never used for serving targeted advertising, promotional marketing, or user profiling.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Strictly NO Generalized AI/ML Model Training:</strong> Raw or derived data obtained via Workspace APIs is never transferred or used to train, develop, or improve generalized foundation AI/ML models.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>No Human Reading:</strong> No IOnLearn personnel or contractors read your Google Classroom or Drive documents unless you explicitly request technical support or where legally mandated.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 4: Purposes of Information Use */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  4
                </span>
                <h2>Purposes of Information Use</h2>
              </div>
              <p>Collected data is strictly leveraged to:</p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-indigo-600 dark:marker:text-indigo-400">
                <li>Present an organized, deadline-aware academic dashboard.</li>
                <li>Connect homework topics with curated educational YouTube tutorials.</li>
                <li>Offer concept breakdowns, step-by-step explanations, and learning scaffolding via the AI Assistant.</li>
                <li>Persist user interface preferences (dark/light mode).</li>
              </ul>
            </section>

            {/* Section 5: Data Storage & Security */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  5
                </span>
                <h2>Data Storage, Retention & Security</h2>
              </div>
              <p>We apply robust organizational and technical safeguards:</p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-indigo-600 dark:marker:text-indigo-400">
                <li>
                  <strong>In-Transit Encryption:</strong> All data communication between your client browser, IOnLearn servers, and Google APIs is encrypted using industry-standard HTTPS / TLS 1.3 protocols.
                </li>
                <li>
                  <strong>Enterprise Authentication:</strong> Identity sessions are authenticated through Google Identity Services and Firebase Authentication.
                </li>
                <li>
                  <strong>Ephemeral Access Tokens:</strong> OAuth access tokens are handled securely and refreshed strictly adhering to official Google token lifecycles.
                </li>
              </ul>
            </section>

            {/* Section 6: User Rights & Data Deletion */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  6
                </span>
                <h2>User Rights, Access Revocation, and Data Deletion</h2>
              </div>
              <p>You retain complete control over your personal data at all times:</p>
              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200/60 dark:border-[#262626]">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                    1. Disconnect Within IOnLearn
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0]">
                    You can open the user profile dropdown in the IOnLearn sidebar and select <strong>&ldquo;Disconnect Account&rdquo;</strong>. All OAuth tokens, cached task data, and browser session state are cleared immediately.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200/60 dark:border-[#262626]">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-indigo-500 shrink-0" />
                    2. Revoke Permissions via Google Account Security
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0]">
                    You can unilaterally revoke IOnLearn&apos;s permissions at any time via your Google Account Permissions dashboard:{" "}
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 font-semibold underline"
                    >
                      https://myaccount.google.com/permissions
                    </a>
                    .
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200/60 dark:border-[#262626]">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                    3. Permanent Account & Data Deletion Request
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0]">
                    To request permanent deletion of your account and all associated study notes from our database, email us at{" "}
                    <a
                      href="mailto:support@ionlearn.my.id"
                      className="text-indigo-600 dark:text-indigo-400 font-medium underline"
                    >
                      support@ionlearn.my.id
                    </a>{" "}
                    with the subject <em>&ldquo;Account Data Deletion Request&rdquo;</em>. Your request will be processed within 7 business days.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7: Cookies & Local Storage */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  7
                </span>
                <h2>Cookies & Local Storage Usage</h2>
              </div>
              <p>
                IOnLearn uses cookies and browser storage (such as localStorage) solely for strictly necessary functional purposes:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-indigo-600 dark:marker:text-indigo-400">
                <li>Maintaining authentication sessions.</li>
                <li>Saving your preferred visual theme (dark or light mode).</li>
                <li>Storing local task cache to provide fast and responsive navigation.</li>
              </ul>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#888888]">
                We do not utilize third-party cross-site advertising or tracking cookies.
              </p>
            </section>

            {/* Section 8: Policy Updates */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  8
                </span>
                <h2>Privacy Policy Updates</h2>
              </div>
              <p>
                We may revise this Privacy Policy periodically to reflect technological improvements or regulatory developments. The latest revision date is always posted at the top of this page.
              </p>
            </section>

            {/* Section 9: Privacy Contact */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  9
                </span>
                <h2>Contact & Data Protection Inquiries</h2>
              </div>
              <p>
                For inquiries regarding data privacy or to exercise your privacy rights, please reach out to:
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
                  <strong>Privacy Contact:</strong>{" "}
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
            {/* Section 1: Komitmen Privasi */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  1
                </span>
                <h2>Komitmen Privasi Kami</h2>
              </div>
              <p>
                Privasi Anda adalah prioritas utama di <strong>IOnLearn</strong> (&ldquo;kami&rdquo; atau &ldquo;platform&rdquo;), yang beralamat di{" "}
                <a
                  href="https://www.ionlearn.my.id"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  https://www.ionlearn.my.id
                </a>
                . Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan platform produktivitas akademik kami, khususnya terkait dengan integrasi layanan <strong>Google Classroom</strong> dan <strong>Google Sign-In</strong>.
              </p>
              <p>
                Dengan menggunakan IOnLearn, Anda menyetujui praktik pengumpulan dan penggunaan data sesuai yang diuraikan dalam kebijakan ini.
              </p>
            </section>

            {/* Section 2: Data yang Kami Kumpulkan */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  2
                </span>
                <h2>Data yang Kami Kumpulkan</h2>
              </div>
              <p>Kami hanya mengumpulkan data yang benar-benar esensial untuk menyediakan fungsi utama aplikasi:</p>
              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200/60 dark:border-[#262626]">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    A. Informasi Akun Google (Google Profile Data)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0]">
                    Saat Anda masuk menggunakan akun Google, kami menerima nama lengkap, alamat email, URL foto profil, dan pengenal unik akun Google Anda guna mempersonalisasi sesi belajar dan otentikasi.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200/60 dark:border-[#262626]">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    B. Data Google Classroom & Google Drive (Cakupan Izin Read-Only)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0]">
                    Dengan persetujuan eksplisit Anda saat otentikasi Google, kami meminta izin baca (*read-only scopes*) API berikut dengan prinsip hak akses minimal (*least privilege*):
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0] font-mono">
                    <li>https://www.googleapis.com/auth/classroom.courses.readonly</li>
                    <li>https://www.googleapis.com/auth/classroom.coursework.me.readonly</li>
                    <li>https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly</li>
                    <li>https://www.googleapis.com/auth/classroom.student-submissions.me.readonly</li>
                    <li>https://www.googleapis.com/auth/drive.readonly</li>
                  </ul>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0] mt-2">
                    Data yang disinkronkan meliputi: daftar kelas yang Anda ikuti, judul dan deskripsi tugas (*courseWork*), batas waktu (*due dates*), status pengumpulan, serta dokumen materi/lampiran tugas yang relevan untuk dibaca di dalam aplikasi atau dianalisis bersama asisten belajar AI.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200/60 dark:border-[#262626]">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    C. Data Penggunaan Mandiri (User-Generated Data)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0]">
                    Catatan materi belajar (*study notes*) yang Anda buat secara mandiri, to-do list tugas pribadi, riwayat percakapan dengan Asisten AI, dan preferensi gaya belajar (*learning style preferences*).
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Pernyataan Kepatuhan Khusus Google API */}
            <section className="space-y-4 bg-indigo-50/50 dark:bg-indigo-950/20 p-6 sm:p-8 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/60 shadow-xs">
              <div className="flex items-center gap-2.5 text-indigo-950 dark:text-indigo-200 font-heading font-bold text-lg">
                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <h2>Kepatuhan Kebijakan Data Pengguna Google API (Limited Use Policy)</h2>
              </div>

              {/* Official English Affirmative Statement for Google OAuth Reviewers */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#141414] border border-indigo-200/80 dark:border-indigo-800/80 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed space-y-2">
                <p className="font-semibold text-indigo-700 dark:text-indigo-300">
                  Official Limited Use Compliance Statement (English):
                </p>
                <blockquote className="border-l-2 border-indigo-500 pl-3 italic text-slate-700 dark:text-[#d0d0d0]">
                  &ldquo;IOnLearn&apos;s use and transfer of information received from Google APIs to any other app will adhere to the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 underline font-semibold inline-flex items-center gap-0.5"
                  >
                    Google API Services User Data Policy
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                  , including the Limited Use requirements. The use of raw or derived user data received from Workspace APIs will adhere to the Google User Data Policy, including the Limited Use requirements. User data is never used to develop, improve, or train generalized AI and/or ML models.&rdquo;
                </blockquote>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#141414] border border-slate-200/70 dark:border-[#222222] text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>
                  <strong>Terjemahan Bahasa Indonesia:</strong> &ldquo;Penggunaan dan transfer informasi yang diterima dari Google API oleh IOnLearn ke aplikasi lain akan mematuhi Kebijakan Data Pengguna Layanan Google API, termasuk persyaratan Penggunaan Terbatas (*Limited Use requirements*). Penggunaan data pengguna mentah atau turunan yang diterima dari Workspace API akan mematuhi Kebijakan Data Pengguna Google. Data pengguna tidak pernah digunakan untuk mengembangkan, meningkatkan, atau melatih model kecerdasan buatan (AI) atau pembelajaran mesin (ML) umum.&rdquo;
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-[#c0c0c0]">
                Secara tegas dan tanpa pengecualian, kami menerapkan prinsip-prinsip berikut terhadap data pengguna yang diperoleh melalui Google API:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Hanya untuk Fungsi Layanan Langsung:</strong> Data tugas Google Classroom dan dokumen lampiran Google Drive hanya digunakan untuk menampilkan jadwal tugas, memfasilitasi manajemen waktu belajar Anda, dan menyediakan referensi materi belajar melalui Asisten AI secara personal untuk sesi pengguna tersebut.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>TIDAK PERNAH Menjual Data:</strong> Kami tidak pernah menjual, menyewakan, mentransfer, atau memperdagangkan data pengguna Google kepada pihak ketiga, pengiklan, atau pialang data (*data brokers*).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>TIDAK untuk Iklan:</strong> Data Google pengguna tidak pernah digunakan untuk menayangkan iklan bertarget (*targeted advertising*), promosi berbayar, atau profiling pemasaran.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>TIDAK untuk Melatih Model AI Umum (*Strictly No AI/ML Training*):</strong> Data mentah maupun turunan dari Workspace API tidak pernah ditransfer atau digunakan untuk mengembangkan, meningkatkan, atau melatih model AI/ML pihak ketiga maupun model dasar kecerdasan buatan umum (*generalized foundation models*).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Tidak Ada Pembacaan Manusia (*No Human Reading*):</strong> Tidak ada personel atau karyawan yang membaca konten tugas Google Classroom atau dokumen Drive Anda, kecuali jika Anda secara eksplisit meminta dukungan teknis atas persetujuan Anda atau diwajibkan oleh proses hukum resmi.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 4: Cara Kami Menggunakan Data */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  4
                </span>
                <h2>Tujuan Penggunaan Informasi</h2>
              </div>
              <p>Data yang dikumpulkan semata-mata dimanfaatkan untuk:</p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-indigo-600 dark:marker:text-indigo-400">
                <li>Menampilkan antarmuka daftar tugas terorganisir beserta status tenggat waktu.</li>
                <li>Menghubungkan tugas dengan kurasi video referensi edukatif dan materi belajar dari YouTube.</li>
                <li>Memberikan panduan langkah pengerjaan tugas dan penjelasan konsep akademik saat Anda bertanya kepada Asisten AI.</li>
                <li>Menyimpan preferensi tampilan (tema gelap/terang) dan pengaturan akun pengguna.</li>
              </ul>
            </section>

            {/* Section 5: Penyimpanan & Keamanan Data */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  5
                </span>
                <h2>Penyimpanan & Keamanan Data</h2>
              </div>
              <p>Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang ketat:</p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-indigo-600 dark:marker:text-indigo-400">
                <li>
                  <strong>Enkripsi Transportasi Data:</strong> Seluruh pertukaran data antara peramban Anda, server IOnLearn, dan API Google dilindungi menggunakan protokol enkripsi standar industri HTTPS/TLS 1.3.
                </li>
                <li>
                  <strong>Infrastruktur Tepercaya:</strong> Otentikasi dan otorisasi sesi dikelola melalui Google Identity Services dan Firebase Authentication yang memiliki standar keamanan tingkat perusahaan (*enterprise-grade*).
                </li>
                <li>
                  <strong>Penyimpanan Sesi Klien:</strong> Token akses OAuth disimpan secara aman dalam sesi terenkripsi dan otomatis diperbarui (*refresh token*) sesuai masa kedaluwarsa resmi Google.
                </li>
              </ul>
            </section>

            {/* Section 6: Hak Pengguna, Pencabutan Akses, & Penghapusan Data */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  6
                </span>
                <h2>Hak Pengguna, Pencabutan Akses, dan Penghapusan Data</h2>
              </div>
              <p>
                Anda memiliki kendali penuh atas data pribadi Anda setiap saat:
              </p>
              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200/60 dark:border-[#262626]">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                    1. Memutuskan Akses dari Aplikasi IOnLearn
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0]">
                    Kapan saja Anda dapat membuka menu profil di bilah sisi (*sidebar*) IOnLearn dan menekan tombol <strong>&ldquo;Putuskan Akun&rdquo;</strong> (*Disconnect*). Seluruh token akses Google, cache tugas, dan sesi aktif pada peramban akan langsung dibersihkan seketika.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200/60 dark:border-[#262626]">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-indigo-500 shrink-0" />
                    2. Mencabut Akses Melalui Akun Google
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0]">
                    Anda juga dapat mencabut izin IOnLearn secara sepihak langsung dari dasbor keamanan akun Google Anda di:{" "}
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 font-semibold underline"
                    >
                      https://myaccount.google.com/permissions
                    </a>
                    . Setelah dicabut, IOnLearn tidak lagi dapat mengakses data Google Classroom Anda.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200/60 dark:border-[#262626]">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                    3. Permintaan Penghapusan Data Permanen
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0]">
                    Untuk meminta penghapusan akun beserta seluruh data catatan materi dan riwayat tugas secara permanen dari basis data server, Anda dapat mengirimkan email ke{" "}
                    <a
                      href="mailto:support@ionlearn.my.id"
                      className="text-indigo-600 dark:text-indigo-400 font-medium underline"
                    >
                      support@ionlearn.my.id
                    </a>{" "}
                    dengan subjek <em>&ldquo;Permintaan Penghapusan Data Akun&rdquo;</em>. Permintaan Anda akan diselesaikan dalam waktu maksimal 7 (tujuh) hari kerja.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7: Cookie & Penyimpanan Lokal */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  7
                </span>
                <h2>Penggunaan Cookie & Local Storage</h2>
              </div>
              <p>
                IOnLearn menggunakan <em>cookies</em> dan mekanisme <em>web storage</em> (seperti localStorage) semata-mata untuk kebutuhan fungsional esensial:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-indigo-600 dark:marker:text-indigo-400">
                <li>Mempertahankan status login dan sesi aktif Anda.</li>
                <li>Menyimpan preferensi tema tampilan (mode gelap / terang).</li>
                <li>Menyimpan cache tugas lokal agar aplikasi dapat diakses secara cepat dan hemat kuota.</li>
              </ul>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#888888]">
                Kami tidak menggunakan cookie pelacak pihak ketiga (*third-party tracking cookies*) untuk periklanan lintas situs.
              </p>
            </section>

            {/* Section 8: Pembaruan Kebijakan */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  8
                </span>
                <h2>Pembaruan Kebijakan Privasi</h2>
              </div>
              <p>
                Kami dapat merevisi Kebijakan Privasi ini sewaktu-waktu seiring pengembangan fitur platform atau perubahan regulasi privasi data. Tanggal revisi terbaru akan selalu tercantum jelas di bagian atas dokumen ini. Kami menyarankan Anda untuk meninjau halaman ini secara berkala.
              </p>
            </section>

            {/* Section 9: Kontak Perlindungan Data */}
            <section className="space-y-3 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-[#202020] shadow-2xs">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-heading font-bold text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  9
                </span>
                <h2>Kontak & Layanan Privasi</h2>
              </div>
              <p>
                Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini atau ingin mengajukan hak privasi data Anda, silakan hubungi kami di:
              </p>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200/60 dark:border-[#262626] space-y-1 text-xs sm:text-sm">
                <p>
                  <strong>Nama Layanan:</strong> IOnLearn
                </p>
                <p>
                  <strong>Domain Resmi:</strong>{" "}
                  <a
                    href="https://www.ionlearn.my.id"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    https://www.ionlearn.my.id
                  </a>
                </p>
                <p>
                  <strong>Email Privasi & Dukungan:</strong>{" "}
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
            <Link href={`/terms?lang=${lang}`} className="hover:text-slate-900 dark:hover:text-white transition-colors underline">
              {isEn ? "Terms of Service" : "Ketentuan Layanan"}
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

