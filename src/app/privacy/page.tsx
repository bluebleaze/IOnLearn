import type { Metadata } from "next";
import Link from "next/link";
import { LegalNav } from "@/components/LegalNav";
import {
  Shield,
  Lock,
  EyeOff,
  Database,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Kebijakan Privasi (Privacy Policy) - IOnLearn",
  description:
    "Kebijakan Privasi resmi IOnLearn yang mengatur perlindungan data pengguna, integrasi Google Classroom, dan kepatuhan Google API Limited Use Policy.",
  alternates: {
    canonical: "https://www.ionlearn.my.id/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-200 flex flex-col font-sans transition-colors">
      <LegalNav currentPage="privacy" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Document Header */}
        <div className="mb-10 pb-8 border-b border-slate-200 dark:border-[#222222]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Dokumen Resmi Perlindungan Data</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading mb-3">
            Kebijakan Privasi (Privacy Policy)
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#888888] leading-relaxed">
            Terakhir diperbarui: <strong>6 September 2026</strong> • Berlaku untuk platform{" "}
            <span className="font-mono text-xs bg-slate-200/60 dark:bg-[#181818] px-1.5 py-0.5 rounded">
              ionlearn.my.id
            </span>{" "}
            dan seluruh layanan terkait.
          </p>
        </div>

        {/* Content Body */}
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

          {/* Section 3: Pernyataan Kepatuhan Khusus Google API (Wajib untuk Google Verification) */}
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

        {/* Footer Navigation link */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-[#777777]">
          <p>© {new Date().getFullYear()} IOnLearn. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors underline">
              Ketentuan Layanan
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors underline">
              Beranda Aplikasi
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
