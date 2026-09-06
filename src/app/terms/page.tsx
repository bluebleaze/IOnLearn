import type { Metadata } from "next";
import Link from "next/link";
import { LegalNav } from "@/components/LegalNav";
import {
  FileText,
  ShieldCheck,
  Sparkles,
  Lock,
  UserCheck,
  AlertTriangle,
  Mail,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Ketentuan Layanan (Terms of Service) - IOnLearn",
  description:
    "Ketentuan Layanan resmi penggunaan platform IOnLearn, integrasi Google Classroom, dan asisten belajar berbasis kecerdasan buatan.",
  alternates: {
    canonical: "https://www.ionlearn.my.id/terms",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-200 flex flex-col font-sans transition-colors">
      <LegalNav currentPage="terms" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Document Header */}
        <div className="mb-10 pb-8 border-b border-slate-200 dark:border-[#222222]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
            <FileText className="w-3.5 h-3.5" />
            <span>Dokumen Resmi Layanan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading mb-3">
            Ketentuan Layanan (Terms of Service)
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#888888] leading-relaxed">
            Terakhir diperbarui: <strong>6 September 2026</strong> • Berlaku untuk domain{" "}
            <span className="font-mono text-xs bg-slate-200/60 dark:bg-[#181818] px-1.5 py-0.5 rounded">
              ionlearn.my.id
            </span>{" "}
            dan seluruh sub-domain terkait.
          </p>
        </div>

        {/* Content Body */}
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

        {/* Footer Navigation link */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-[#777777]">
          <p>© {new Date().getFullYear()} IOnLearn. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors underline">
              Kebijakan Privasi
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
