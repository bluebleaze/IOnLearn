"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  BookOpen,
  GraduationCap,
  Briefcase,
  School,
  Compass,
  Eye,
  BookText,
  Hammer,
  Headphones,
  Zap,
  Layers,
  ListOrdered,
  Smile,
  ShieldCheck,
  Brain,
  Target,
  Trophy,
  Clock,
  Rocket,
  Code2,
  Atom,
  Building2,
  HeartPulse,
  Palette,
  Sun,
  Moon,
  Globe,
  X,
  Loader2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserPreferences } from "@/types";
import {
  loadPreferences,
  savePreferences,
  loadTasks,
  loadAIConfig,
  loadTodos,
  loadNotes,
  ONBOARDING_DONE_KEY,
  isOnboardingCompleted,
  setOnboardingCompleted,
} from "@/lib/taskStore";
import { ClassroomService } from "@/services/classroomService";
import { DBService } from "@/services/dbService";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/context/LanguageContext";
import { toggleThemeWithCircularAnimation } from "@/lib/theme";

interface OnboardingFlowProps {
  onComplete?: (prefs: UserPreferences) => void;
  onSkip?: () => void;
  isModal?: boolean;
  initialStep?: number;
}

interface StepOption {
  id: string;
  labelId: string;
  labelEn: string;
  descId?: string;
  descEn?: string;
  emoji?: string;
  icon?: React.ReactNode;
}

interface QuestionStep {
  type: "question";
  sectionIndex: number; // 0, 1, 2, 3
  categoryId: string;
  categoryEn: string;
  questionId: string;
  questionEn: string;
  descId?: string;
  descEn?: string;
  key: keyof UserPreferences;
  isMultiSelect?: boolean;
  options: StepOption[];
}

interface InterstitialStep {
  type: "interstitial";
  sectionIndex: number;
  categoryId: string;
  categoryEn: string;
  titleId: string;
  titleEn: string;
  subtitleId: string;
  subtitleEn: string;
  highlightsId: string[];
  highlightsEn: string[];
  emoji: string;
  nextSectionId: string;
  nextSectionEn: string;
}

type StepItem = QuestionStep | InterstitialStep;

export function OnboardingFlow({
  onComplete,
  onSkip,
  isModal = false,
  initialStep = 1,
}: OnboardingFlowProps) {
  const router = useRouter();
  const { isEn, language, setLanguage } = useLanguage();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const handleToggleTheme = (e: React.MouseEvent) => {
    const nextTheme = toggleThemeWithCircularAnimation(e);
    setIsDark(nextTheme === "dark");
  };

  const handleToggleLanguage = () => {
    const nextLang = language === "id" ? "en" : "id";
    setLanguage(nextLang);
  };

  // 4 Sections metadata
  const SECTIONS = [
    { titleId: "Identitas & AI Tutor", titleEn: "Identity & AI Tutor", emoji: "🎓" },
    { titleId: "Metode & Format Catatan", titleEn: "Method & Note Format", emoji: "🧠" },
    { titleId: "Mode Belajar AI & Tugas", titleEn: "AI Study Mode & Tasks", emoji: "🤖" },
    { titleId: "Fokus & Target Akademik", titleEn: "Focus & Academic Goals", emoji: "🎯" },
  ];

  // 19 Distinct, Non-repetitive Question Steps + 3 Interstitial Cards
  const allSteps: StepItem[] = useMemo(
    () => [
      // ─────────────────────────────────────────────────────────────
      // BAGIAN 1: Identitas & AI Tutor (Step 1 - 4)
      // ─────────────────────────────────────────────────────────────
      {
        type: "question",
        sectionIndex: 0,
        categoryId: "Identitas & AI Tutor",
        categoryEn: "Identity & AI Tutor",
        questionId: "Siapa yang sedang kita bantu hari ini?",
        questionEn: "Who are we empowering today?",
        descId: "Pilih jenjang pendidikan agar AI menyesuaikan kosakata dan kedalaman materi.",
        descEn: "Select your education level so AI calibrates vocabulary and complexity.",
        key: "educationLevel",
        options: [
          {
            id: "SMP",
            labelId: "SMP",
            labelEn: "Middle School (SMP)",
            descId: "Sekolah Menengah Pertama",
            descEn: "Junior High School / Secondary",
            emoji: "📚",
            icon: <School className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
          },
          {
            id: "SMA/SMK",
            labelId: "SMA/SMK",
            labelEn: "High School (SMA/SMK)",
            descId: "Sekolah Menengah Atas / Kejuruan",
            descEn: "Senior High School / Vocational",
            emoji: "🎒",
            icon: <BookOpen className="w-5 h-5 text-pink-500 dark:text-pink-400" />,
          },
          {
            id: "Mahasiswa S1",
            labelId: "Mahasiswa S1",
            labelEn: "Undergraduate (S1)",
            descId: "Pendidikan Sarjana / Diploma",
            descEn: "Bachelor's / Diploma Student",
            emoji: "🎓",
            icon: <GraduationCap className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
          },
          {
            id: "Pascasarjana",
            labelId: "Pascasarjana",
            labelEn: "Postgraduate (S2/S3)",
            descId: "Magister (S2) / Doktoral (S3)",
            descEn: "Master's or Doctoral Candidate",
            emoji: "🧑‍🎓",
            icon: <Compass className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
          },
          {
            id: "Profesional",
            labelId: "Profesional",
            labelEn: "Professional",
            descId: "Karier & Belajar Mandiri",
            descEn: "Career Growth & Self-taught",
            emoji: "💼",
            icon: <Briefcase className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
          },
        ],
      },
      {
        type: "question",
        sectionIndex: 0,
        categoryId: "Identitas & AI Tutor",
        categoryEn: "Identity & AI Tutor",
        questionId: "Apa bidang studi atau jurusan utamamu?",
        questionEn: "What is your primary field of study?",
        descId: "AI akan memprioritaskan istilah teknis dan contoh relevan di bidang ini.",
        descEn: "AI will tailor industry analogies and terminology to this domain.",
        key: "majorOrField",
        options: [
          {
            id: "Teknologi & Ilmu Komputer",
            labelId: "Teknologi & Ilmu Komputer",
            labelEn: "Computer Science & Tech",
            descId: "Informatika, Software, AI & Jaringan",
            descEn: "Software, Data, AI & IT Systems",
            emoji: "💻",
            icon: <Code2 className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />,
          },
          {
            id: "Sains & Teknik (STEM)",
            labelId: "Sains & Rekayasa Teknik",
            labelEn: "Science & Engineering (STEM)",
            descId: "Teknik Mesin, Sipil, Elektro, Fisika & Kimia",
            descEn: "Engineering, Physics, Math & Chemistry",
            emoji: "🔬",
            icon: <Atom className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
          },
          {
            id: "Ekonomi, Bisnis & Manajemen",
            labelId: "Bisnis & Manajemen",
            labelEn: "Business & Management",
            descId: "Manajemen, Akuntansi & Keuangan",
            descEn: "Economics, Finance & Marketing",
            emoji: "📈",
            icon: <Building2 className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
          },
          {
            id: "Kesehatan & Kedokteran",
            labelId: "Kesehatan & Medis",
            labelEn: "Health & Medicine",
            descId: "Kedokteran, Keperawatan & Farmasi",
            descEn: "Medical, Nursing & Pharmacy",
            emoji: "🩺",
            icon: <HeartPulse className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
          },
          {
            id: "Sosial, Hukum & Humaniora",
            labelId: "Sosial & Humaniora",
            labelEn: "Social & Humanities",
            descId: "Hukum, Psikologi, Komunikasi, Bahasa & Seni",
            descEn: "Law, Psychology, Arts & Languages",
            emoji: "🎨",
            icon: <Palette className="w-5 h-5 text-violet-500 dark:text-violet-400" />,
          },
        ],
      },
      {
        type: "question",
        sectionIndex: 0,
        categoryId: "Identitas & AI Tutor",
        categoryEn: "Identity & AI Tutor",
        questionId: "Gaya komunikasi AI seperti apa yang paling nyaman buatmu?",
        questionEn: "What conversational tone do you prefer from your AI Tutor?",
        descId: "Menentukan nada bicara asisten AI saat berdiskusi dan menjawab pertanyaanmu.",
        descEn: "Sets the tone of voice AI uses across all conversations.",
        key: "aiTone",
        options: [
          {
            id: "Santai & Ramah",
            labelId: "Santai, Hangat & Suportif",
            labelEn: "Casual, Warm & Supportive",
            descId: "Bahasa bersahabat, kasual, suportif dan mudah dipahami",
            descEn: "Friendly, empathetic, approachable conversational style",
            emoji: "😊",
            icon: <Smile className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
          },
          {
            id: "Profesional & Tegas",
            labelId: "Profesional & Terstruktur",
            labelEn: "Professional & Academic",
            descId: "Bahasa formal, baku, terstruktur dan berbobot akademik",
            descEn: "Formal, academic rigor, structured and objective",
            emoji: "👔",
            icon: <ShieldCheck className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
          },
          {
            id: "Inspiratif & Dinamis",
            labelId: "Inspiratif & Energik",
            labelEn: "Inspiring & Energetic",
            descId: "Antusias, memotivasi, dan selalu mendorong aksi nyata",
            descEn: "Enthusiastic, motivating, and action-oriented",
            emoji: "✨",
            icon: <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
          },
        ],
      },
      {
        type: "question",
        sectionIndex: 0,
        categoryId: "Identitas & AI Tutor",
        categoryEn: "Identity & AI Tutor",
        questionId: "Peran utama apa yang paling kamu harapkan dari AI Tutor?",
        questionEn: "What primary role should AI Tutor play in your study routine?",
        descId: "AI akan memprioritaskan fungsi ini dalam setiap pendampingan belajar.",
        descEn: "AI will lead with this approach during homework and study sessions.",
        key: "aiRole",
        options: [
          {
            id: "Mentor & Pembimbing Pemecahan Soal",
            labelId: "Mentor Pembimbing",
            labelEn: "Guiding Mentor",
            descId: "Membimbing langkah demi langkah saat kamu menemui kebuntuan",
            descEn: "Guides step-by-step when you hit difficult roadblocks",
            emoji: "🧭",
          },
          {
            id: "Kolega Diskusi / Sparring Partner",
            labelId: "Teman Diskusi (Sparring Partner)",
            labelEn: "Discussion & Debate Partner",
            descId: "Teman bertukar pikiran untuk menguji argumen dan pemikiran",
            descEn: "Bounces ideas back and forth to sharpen your logic",
            emoji: "🤝",
          },
          {
            id: "Korektor & Validator Jawaban",
            labelId: "Korektor & Validator Jawaban",
            labelEn: "Validator & Proofreader",
            descId: "Memeriksa ketepatan logika, rumus, dan kualitas draf tulisan",
            descEn: "Reviews draft essays, equations, and factual accuracy",
            emoji: "🔍",
          },
          {
            id: "Perangkum Cepat & Pustakawan",
            labelId: "Perangkum Cepat Materi",
            labelEn: "Quick Summarizer & Synthesizer",
            descId: "Mengekstrak intisari penting dari dokumen atau buku tebal",
            descEn: "Extracts key takeaways from heavy lecture documents",
            emoji: "📚",
          },
        ],
      },

      // ── INTERSTITIAL 1 ──
      {
        type: "interstitial",
        sectionIndex: 0,
        categoryId: "Identitas Selesai",
        categoryEn: "Identity Configured",
        titleId: "Persona AI Berhasil Dikonfigurasi! 🎓",
        titleEn: "AI Persona Successfully Configured! 🎓",
        subtitleId: "AI Tutor kini mengenali jenjang, jurusan, dan nada bicaramu.",
        subtitleEn: "Your AI Tutor now understands your domain, level, and voice.",
        highlightsId: [
          "Kosakata dan kedalaman materi disesuaikan dengan jenjangmu",
          "AI Tutor akan menyapa dengan persona pilihanmu",
        ],
        highlightsEn: [
          "Terminology calibrated to your academic stage",
          "AI Tutor greets and guides in your chosen tone",
        ],
        emoji: "🚀",
        nextSectionId: "Metode & Format Catatan",
        nextSectionEn: "Method & Note Format",
      },

      // ─────────────────────────────────────────────────────────────
      // BAGIAN 2: Metode & Format Catatan (Step 5 - 9)
      // ─────────────────────────────────────────────────────────────
      {
        type: "question",
        sectionIndex: 1,
        categoryId: "Metode & Format Catatan",
        categoryEn: "Method & Note Format",
        questionId: "Bagaimana cara belajar yang paling membuat materi mudah kamu pahami?",
        questionEn: "What learning method helps you understand concepts easiest?",
        descId: "AI akan menyajikan rangkuman & penjelasan sesuai gaya kognitifmu.",
        descEn: "AI formats study breakdowns to match your cognitive preference.",
        key: "learningStyle",
        options: [
          {
            id: "Visual (Gambar, Video, Diagram)",
            labelId: "Visual & Ilustratif",
            labelEn: "Visual & Illustrative",
            descId: "Diagram alur, peta konsep, infografis dan rangkuman visual",
            descEn: "Flowcharts, mindmaps, infographics and visual schemas",
            emoji: "👁️",
            icon: <Eye className="w-5 h-5 text-sky-500 dark:text-sky-400" />,
          },
          {
            id: "Membaca / Menulis (Teks Ekstensif)",
            labelId: "Membaca & Menulis Teks",
            labelEn: "Reading & Writing (Textual)",
            descId: "Teks terstruktur, artikel runut dan catatan poin mendalam",
            descEn: "Structured text, detailed articles and comprehensive bullet notes",
            emoji: "📖",
            icon: <BookText className="w-5 h-5 text-violet-500 dark:text-violet-400" />,
          },
          {
            id: "Praktik (Studi Kasus, Latihan)",
            labelId: "Praktik Langsung & Studi Kasus",
            labelEn: "Hands-on Practice & Cases",
            descId: "Latihan soal terstruktur, koding, dan pemecahan kasus nyata",
            descEn: "Problem solving drills, coding, and real-world case studies",
            emoji: "🛠️",
            icon: <Hammer className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
          },
          {
            id: "Auditori & Diskusi Interaktif",
            labelId: "Auditori & Tanya-Jawab Lisan",
            labelEn: "Auditory & Dialogue",
            descId: "Tanya jawab dua arah yang aktif seperti percakapan lisan",
            descEn: "Back-and-forth conversational explanations and verbal drills",
            emoji: "🎧",
            icon: <Headphones className="w-5 h-5 text-teal-500 dark:text-teal-400" />,
          },
        ],
      },
      {
        type: "question",
        sectionIndex: 1,
        categoryId: "Metode & Format Catatan",
        categoryEn: "Method & Note Format",
        questionId: "Format catatan seperti apa yang paling kamu sukai saat AI merangkum?",
        questionEn: "What note format do you prefer when AI generates summaries?",
        descId: "Format standar yang otomatis digunakan saat kamu menyimpan catatan materi.",
        descEn: "Default structure used when saving AI summaries to Study Notes.",
        key: "noteFormat",
        options: [
          {
            id: "Poin-poin Bullet Terstruktur",
            labelId: "Bullet Points & Hierarki Rapi",
            labelEn: "Structured Bullet Hierarchy",
            descId: "Daftar poin ringkas dengan sub-poin yang mudah dipindai cepat",
            descEn: "Scannable bullet points with organized nested sub-items",
            emoji: "📋",
          },
          {
            id: "Tabel Perbandingan & Analisis",
            labelId: "Tabel & Komparasi Data",
            labelEn: "Comparison Tables",
            descId: "Menjajarkan perbedaan konsep, rumus, dan definisi penting",
            descEn: "Side-by-side tables contrasting key formulas and concepts",
            emoji: "📊",
          },
          {
            id: "Flashcard & Tanya-Jawab Kuis",
            labelId: "Flashcard & Format Q&A",
            labelEn: "Flashcards & Q&A Format",
            descId: "Format pertanyaan dan jawaban singkat untuk melatih daya ingat",
            descEn: "Question-and-answer pairs designed for active memory recall",
            emoji: "🃏",
          },
          {
            id: "Penjelasan Naratif Lengkap",
            labelId: "Naratif & Ulasan Mendalam",
            labelEn: "Comprehensive Narrative",
            descId: "Paragraf ulasan komprehensif seperti buku teks akademik",
            descEn: "In-depth analytical paragraphs with rich contextual background",
            emoji: "📑",
          },
        ],
      },
      {
        type: "question",
        sectionIndex: 1,
        categoryId: "Metode & Format Catatan",
        categoryEn: "Method & Note Format",
        questionId: "Bagaimana cara AI menjelaskan materi rumit kepadamu?",
        questionEn: "How should AI deconstruct complex theories for you?",
        descId: "Menentukan pendekatan penjelasan AI saat kamu menghadapi konsep sulit.",
        descEn: "Determines AI's pedagogical angle when explaining difficult topics.",
        key: "problemSolvingStyle",
        options: [
          {
            id: "Minta Pembongkaran Step-by-Step",
            labelId: "Bongkar Langkah Demi Langkah",
            labelEn: "Step-by-Step Breakdown",
            descId: "Uraikan solusinya secara teratur dari awal hingga akhir",
            descEn: "Break the concept into sequential, bite-sized milestones",
            emoji: "🪜",
          },
          {
            id: "Pahami Konsep Fundamental Dulu",
            labelId: "Konsep Dasar & Fondasi Teori",
            labelEn: "Core Fundamentals First",
            descId: "Kuasai teori fondasi sebelum masuk ke rumus atau soal lanjutan",
            descEn: "Master first-principles before moving to formulas and tasks",
            emoji: "💡",
          },
          {
            id: "Coba Latihan Soal Serupa",
            labelId: "Contoh Soal & Kasus Serupa",
            labelEn: "Worked Examples & Parallel Problems",
            descId: "Pahami pola melalui contoh soal dan studi kasus yang mirip",
            descEn: "Learn patterns from analogous worked examples and problems",
            emoji: "🎯",
          },
          {
            id: "Minta Analogi Sederhana di Dunia Nyata",
            labelId: "Analogi Kehidupan Nyata",
            labelEn: "Real-world Analogies",
            descId: "Gunakan perumpamaan simpel sehari-hari yang gampang dibayangkan",
            descEn: "Use everyday relatable metaphors to visualize abstract ideas",
            emoji: "🌟",
          },
        ],
      },
      {
        type: "question",
        sectionIndex: 1,
        categoryId: "Metode & Format Catatan",
        categoryEn: "Method & Note Format",
        questionId: "Seberapa panjang dan detail penjelasan yang kamu inginkan?",
        questionEn: "How detailed should AI explanations be by default?",
        descId: "Mengatur kedalaman jawaban asisten AI saat menganalisis materi tugas.",
        descEn: "Regulates default response density and depth across the app.",
        key: "explanationDetail",
        options: [
          {
            id: "Singkat & Padat (To the point)",
            labelId: "Singkat & Padat (To the Point)",
            labelEn: "Concise & Direct (To the Point)",
            descId: "Langsung ke inti jawaban tanpa basa-basi atau pengantar panjang",
            descEn: "Direct answers focused purely on core points without filler",
            emoji: "⚡",
            icon: <Zap className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
          },
          {
            id: "Bertahap (Step-by-step)",
            labelId: "Bertahap & Seimbang",
            labelEn: "Balanced & Step-by-Step",
            descId: "Penjelasan terukur dengan poin penting dan langkah terstruktur",
            descEn: "Paced explanations with clear bullet milestones and takeaways",
            emoji: "🪜",
            icon: <ListOrdered className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
          },
          {
            id: "Sangat Detail (Mendalam)",
            labelId: "Sangat Detail & Mendalam",
            labelEn: "Deep & Comprehensive",
            descId: "Analisis menyeluruh mencakup teori fundamental, bukti, dan contoh",
            descEn: "Exhaustive breakdown covering background, theory, and citations",
            emoji: "🔍",
            icon: <Layers className="w-5 h-5 text-purple-500 dark:text-purple-400" />,
          },
        ],
      },
      {
        type: "question",
        sectionIndex: 1,
        categoryId: "Metode & Format Catatan",
        categoryEn: "Method & Note Format",
        questionId: "Bagaimana caramu biasanya mengelola tenggat waktu tugas?",
        questionEn: "How do you usually handle assignment deadlines?",
        descId: "Membantu AI mengatur intensitas pengingat deadline di Dashboard.",
        descEn: "Calibrates urgency highlights and deadline alerts in your view.",
        key: "deadlineHandling",
        options: [
          {
            id: "Selalu Dicicil Jauh-jauh Hari",
            labelId: "Dicicil Jauh-Jauh Hari",
            labelEn: "Planned Well in Advance",
            descId: "Suka menyelesaikan tugas seawal mungkin dengan tenang",
            descEn: "Finishes tasks comfortably before the deadline arrives",
            emoji: "🛡️",
          },
          {
            id: "Fokus Maksimal Menjelang Deadline",
            labelId: "Fokus Dekat Deadline (Fast Finisher)",
            labelEn: "High-focus Near Deadline",
            descId: "Paling produktif dan berenergi saat ada tekanan batas waktu",
            descEn: "Peak productivity occurs under tight deadline pressure",
            emoji: "⚡",
          },
          {
            id: "Sering Lupa Jika Tidak Diingatkan",
            labelId: "Butuh Peringatan Visual Rutin",
            labelEn: "Need Visual Reminders & Alerts",
            descId: "Sangat terbantu oleh tanda urgent, warna deadline, dan notifikasi",
            descEn: "Relies heavily on urgent badges, countdowns, and alert colors",
            emoji: "🔔",
          },
        ],
      },

      // ── INTERSTITIAL 2 ──
      {
        type: "interstitial",
        sectionIndex: 1,
        categoryId: "Format Catatan Siap",
        categoryEn: "Notes Configured",
        titleId: "Format Catatan & Problem Solving Siap! 📝",
        titleEn: "Note & Problem-Solving Setup Ready! 📝",
        subtitleId: "AI akan menyajikan rangkuman dalam format kesukaanmu.",
        subtitleEn: "AI summaries and breakdowns will now match your study habits.",
        highlightsId: [
          "Format catatan AI otomatis sesuai preferensimu",
          "Analisis tugas disesuaikan dengan pola pemecahan masalahmu",
        ],
        highlightsEn: [
          "AI note generator adopts your preferred layout",
          "Task analysis aligns with your problem-solving style",
        ],
        emoji: "✨",
        nextSectionId: "Mode Belajar AI & Tugas",
        nextSectionEn: "AI Study Mode & Tasks",
      },

      // ─────────────────────────────────────────────────────────────
      // BAGIAN 3: Mode Belajar AI & Tugas (Step 10 - 14)
      // ─────────────────────────────────────────────────────────────
      {
        type: "question",
        sectionIndex: 2,
        categoryId: "Mode Belajar AI & Tugas",
        categoryEn: "AI Study Mode & Tasks",
        questionId: "Bagaimana pendekatan interaksi utama yang kamu inginkan dari AI Chat?",
        questionEn: "What core interaction model do you want from AI Chat?",
        descId: "Bisa kamu ganti kapan saja di tombol switcher mode pada halaman AI Chat.",
        descEn: "You can toggle this mode anytime within the AI Chat window.",
        key: "defaultStudyMode",
        options: [
          {
            id: "socratic",
            labelId: "Bimbingan Kritis (Mode Socratic)",
            labelEn: "Critical Guidance (Socratic Mode)",
            descId: "AI membimbing alur berpikir dengan pertanyaan nalar tanpa langsung memberi contekan",
            descEn: "AI guides your thought process with probing hints instead of raw answer dumps",
            emoji: "💡",
          },
          {
            id: "direct",
            labelId: "Jawaban Langsung (Mode Direct)",
            labelEn: "Direct Solutions (Direct Mode)",
            descId: "AI langsung memberikan solusi to-the-point yang terstruktur dan siap dipraktikkan",
            descEn: "AI provides immediate, actionable, well-structured solutions on demand",
            emoji: "🎯",
          },
          {
            id: "quizzer",
            labelId: "Latihan & Kuis (Mode Quizzer)",
            labelEn: "Interactive Drills (Quizzer Mode)",
            descId: "AI menjelaskan materi lalu otomatis menguji pemahamanmu dengan kuis interaktif",
            descEn: "AI explains concepts then tests your understanding with practice questions",
            emoji: "🏆",
          },
        ],
      },
      {
        type: "question",
        sectionIndex: 2,
        categoryId: "Mode Belajar AI & Tugas",
        categoryEn: "AI Study Mode & Tasks",
        questionId: "Seberapa proaktif kamu ingin AI memberikan saran lanjutan?",
        questionEn: "How proactive should AI be with follow-up suggestions?",
        descId: "Mengatur apakah AI otomatis menawarkan tips tambahan atau hanya menjawab persis pertanyaan.",
        descEn: "Controls whether AI offers extended tips or strictly answers your prompt.",
        key: "socraticFrequency",
        options: [
          {
            id: "Proaktif (Saran Topik & Tips Lanjutan)",
            labelId: "Proaktif — Berikan Tips & Topik Terkait",
            labelEn: "Proactive — Offer Follow-up Tips & Topics",
            descId: "AI aktif menyarankan ide eksplorasi tambahan dan strategi belajar terkait",
            descEn: "AI actively suggests related subtopics, study tips, and next steps",
            emoji: "🚀",
          },
          {
            id: "Seimbang (Saran Singkat Jika Relevan)",
            labelId: "Seimbang — Saran Singkat Bila Perlu",
            labelEn: "Balanced — Brief Suggestions When Relevant",
            descId: "Kombinasi jawaban fokus dengan rekomendasi singkat jika sangat membantu",
            descEn: "Focused answers accompanied by brief, highly relevant recommendations",
            emoji: "⚖️",
          },
          {
            id: "Minimalis (Hanya Jawab yang Diminta)",
            labelId: "Minimalis — Hanya Jawab Pertanyaan",
            labelEn: "Minimalist — Strictly Answer the Prompt",
            descId: "Hanya berikan jawaban presisi tanpa saran tambahan yang tidak diminta",
            descEn: "Strictly provide concise answers without unsolicited extras",
            emoji: "⚡",
          },
        ],
      },
      {
        type: "question",
        sectionIndex: 2,
        categoryId: "Mode Belajar AI & Tugas",
        categoryEn: "AI Study Mode & Tasks",
        questionId: "Fitur apa yang paling ingin kamu maksimalkan di IOnLearn?",
        questionEn: "Which features do you plan to utilize most heavily?",
        descId: "Kamu dapat memilih lebih dari satu fitur favorit.",
        descEn: "Select one or more essential tools for your study flow.",
        key: "favoriteFeatures",
        isMultiSelect: true,
        options: [
          {
            id: "Sinkronisasi Otomatis Google Classroom",
            labelId: "Sinkronisasi Classroom",
            labelEn: "Classroom Auto-Sync",
            descId: "Semua tugas, materi, dan deadline terhubung otomatis tanpa buka tab lain",
            descEn: "Auto-sync assignments, attachments, and due dates from Google Classroom",
            emoji: "🔗",
          },
          {
            id: "AI Tutor Interaktif & Diskusi Soal",
            labelId: "AI Tutor & Chat Asisten",
            labelEn: "AI Tutor & Study Chat",
            descId: "Tanya jawab materi kuliah, bedah dokumen tugas, dan bimbingan belajar",
            descEn: "Dissect homework documents and get personal concept tutoring",
            emoji: "🤖",
          },
          {
            id: "Catatan Materi & AI Summarizer",
            labelId: "Catatan Materi AI",
            labelEn: "AI Notes & Summaries",
            descId: "Generator rangkuman materi sekali klik dan penyimpanan catatan rapi",
            descEn: "One-click exam summaries and organized personal study repository",
            emoji: "📝",
          },
          {
            id: "Manajemen To-Do & Pelacak Progres",
            labelId: "To-Do & Deadline Tracker",
            labelEn: "Personal To-Dos & Tracker",
            descId: "Pengingat tenggat waktu, checklist tugas mandiri, dan pelacak progres",
            descEn: "Personal task checklists, deadline urgency badges, and study tracker",
            emoji: "✅",
          },
        ],
      },
      {
        type: "question",
        sectionIndex: 2,
        categoryId: "Mode Belajar AI & Tugas",
        categoryEn: "AI Study Mode & Tasks",
        questionId: "Berapa jam rata-rata waktu yang kamu luangkan untuk belajar per hari?",
        questionEn: "How many hours do you allocate for studying each day?",
        descId: "Menentukan rekomendasi pacing dan pembagian jadwal tugas di Dashboard.",
        descEn: "Calibrates daily pacing and study schedule recommendations.",
        key: "dailyStudyHours",
        options: [
          {
            id: "< 1 Jam per Hari",
            labelId: "Kurang dari 1 Jam",
            labelEn: "Under 1 Hour per Day",
            descId: "Sesi cepat, ringkas, dan fokus to-the-point di sela kesibukan",
            descEn: "Short, ultra-focused study sprints between busy routines",
            emoji: "⚡",
          },
          {
            id: "1 - 2 Jam per Hari",
            labelId: "1 - 2 Jam per Hari",
            labelEn: "1 - 2 Hours per Day",
            descId: "Porsi seimbang untuk mengerjakan tugas harian dan review catatan",
            descEn: "Balanced daily allocation for homework tasks and note reviews",
            emoji: "⏱️",
          },
          {
            id: "2 - 4 Jam per Hari",
            labelId: "2 - 4 Jam per Hari",
            labelEn: "2 - 4 Hours per Day",
            descId: "Belajar mendalam dengan latihan soal intensif dan membaca materi",
            descEn: "Deep work sessions with practice drills and extensive reading",
            emoji: "📚",
          },
          {
            id: "> 4 Jam (Intensif)",
            labelId: "Lebih dari 4 Jam (Intensif)",
            labelEn: "Over 4 Hours (Intensive)",
            descId: "Persiapan skripsi, riset akademik, dan persiapan ujian besar",
            descEn: "Thesis research, academic projects, and major exam prep",
            emoji: "🔥",
          },
        ],
      },
      {
        type: "question",
        sectionIndex: 2,
        categoryId: "Mode Belajar AI & Tugas",
        categoryEn: "AI Study Mode & Tasks",
        questionId: "Bagaimana situasi lingkungan belajarmu sehari-hari?",
        questionEn: "What is your typical study environment?",
        descId: "Menyesuaikan kemudahan navigasi dan tata letak informasi.",
        descEn: "Tailors workspace layout and responsive accessibility.",
        key: "studyEnvironment",
        options: [
          {
            id: "Mandiri & Hening di Rumah/Kamar",
            labelId: "Mandiri & Hening (Rumah/Kamar)",
            labelEn: "Quiet & Solitary (Home/Room)",
            descId: "Fokus sendiri dalam suasana hening tanpa banyak distraksi",
            descEn: "Deep focused work in quiet personal space without interruptions",
            emoji: "🎧",
          },
          {
            id: "Di Kelas / Kampus / Perpustakaan",
            labelId: "Kampus & Perpustakaan",
            labelEn: "Campus & Library",
            descId: "Sering belajar secara mobile dan berpindah-pindah lokasi",
            descEn: "Mobile studying across classrooms, cafes, and libraries",
            emoji: "🏫",
          },
          {
            id: "Sambil Bekerja / Aktivitas Padat",
            labelId: "Sambil Bekerja / Jadwal Padat",
            labelEn: "Working / Busy Schedule",
            descId: "Waktu terbagi, butuh asisten belajar yang super cepat dan efisien",
            descEn: "Split schedule requiring maximum efficiency and fast access",
            emoji: "💼",
          },
        ],
      },

      // ── INTERSTITIAL 3 ──
      {
        type: "interstitial",
        sectionIndex: 2,
        categoryId: "Mode AI Siap",
        categoryEn: "AI Mode Ready",
        titleId: "Mode Belajar AI Terkalibrasi! 🤖",
        titleEn: "AI Study Mode Calibrated! 🤖",
        subtitleId: "AI Chat siap berinteraksi sesuai mode percakapan favoritmu.",
        subtitleEn: "AI Chat is primed with your preferred reasoning & study mode.",
        highlightsId: [
          "Mode interaksi AI telah diaktifkan sesuai pilihanmu",
          "Tingkat proaktif saran AI disesuaikan dengan kebutuhanmu",
        ],
        highlightsEn: [
          "AI interaction mode initialized to your preference",
          "Follow-up proactive suggestions calibrated",
        ],
        emoji: "🎉",
        nextSectionId: "Fokus & Target Akademik",
        nextSectionEn: "Focus & Academic Goals",
      },

      // ─────────────────────────────────────────────────────────────
      // BAGIAN 4: Fokus & Target Belajar (Step 15 - 19)
      // ─────────────────────────────────────────────────────────────
      {
        type: "question",
        sectionIndex: 3,
        categoryId: "Fokus & Target Akademik",
        categoryEn: "Focus & Academic Goals",
        questionId: "Apa target utama yang ingin kamu capai dalam waktu dekat?",
        questionEn: "What is your primary academic goal right now?",
        descId: "IOnLearn akan memprioritaskan rekomendasi untuk target ini.",
        descEn: "IOnLearn will spotlight tools that accelerate this milestone.",
        key: "studyGoal",
        options: [
          {
            id: "Manajemen Tugas & Deadline Tepat Waktu",
            labelId: "Tuntas Tugas Tepat Waktu",
            labelEn: "Complete Tasks on Time",
            descId: "Bebas dari stres menumpuk tugas dan tidak pernah terlambat mengumpulkan",
            descEn: "Eliminate deadline stress with zero late assignment submissions",
            emoji: "🎯",
            icon: <Target className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
          },
          {
            id: "Menaikkan Nilai Ujian & IPK Akademik",
            labelId: "Menaikkan Nilai & IPK",
            labelEn: "Boost GPA & Exam Scores",
            descId: "Paham materi ujian dengan mudah dan raih nilai optimal di setiap mata kuliah",
            descEn: "Master exam concepts easily and secure top grades across courses",
            emoji: "🏆",
            icon: <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
          },
          {
            id: "Meningkatkan Fokus & Produktivitas Belajar",
            labelId: "Fokus & Produktivitas Tinggi",
            labelEn: "Peak Focus & Productivity",
            descId: "Belajar lebih efisien dalam waktu singkat tanpa distraksi dan tanpa burnout",
            descEn: "Study efficiently in less time without mental fatigue or distractions",
            emoji: "⏱️",
            icon: <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
          },
          {
            id: "Persiapan Riset, Skripsi & Karier Masa Depan",
            labelId: "Riset & Penguasaan Skill Karier",
            labelEn: "Research & Career Readiness",
            descId: "Menguasai keahlian praktis, riset skripsi, dan portofolio profesional",
            descEn: "Master practical industry skills, thesis research, and portfolio pieces",
            emoji: "🚀",
            icon: <Rocket className="w-5 h-5 text-purple-500 dark:text-purple-400" />,
          },
        ],
      },
      {
        type: "question",
        sectionIndex: 3,
        categoryId: "Fokus & Target Akademik",
        categoryEn: "Focus & Academic Goals",
        questionId: "Topik atau keahlian apa yang ingin kamu pelajari lebih dalam?",
        questionEn: "What subjects or skills do you want to master?",
        descId: "Pilih satu atau beberapa topik utama yang ingin kamu prioritaskan.",
        descEn: "Select one or more domains to prioritize in AI recommendations.",
        key: "focusTopics",
        isMultiSelect: true,
        options: [
          {
            id: "Matematika, Logika & Algoritma",
            labelId: "Matematika & Logika",
            labelEn: "Mathematics & Logic",
            descId: "Kalkulus, aljabar linear, statistika, dan pemecahan rumus",
            descEn: "Calculus, statistics, algebra, and mathematical reasoning",
            emoji: "📐",
          },
          {
            id: "Pemrograman, Coding & AI",
            labelId: "Coding & Rekayasa Software",
            labelEn: "Coding & Software Engineering",
            descId: "Python, Web Development, Data Science, AI, dan algoritma",
            descEn: "Python, Full-Stack web, Data Science, AI, and algorithms",
            emoji: "💻",
          },
          {
            id: "Bahasa Asing & Komunikasi",
            labelId: "Bahasa & Komunikasi",
            labelEn: "Languages & Communication",
            descId: "Bahasa Inggris akademik, TOEFL/IELTS, dan penulisan esai",
            descEn: "Academic English, TOEFL/IELTS prep, and essay writing",
            emoji: "🌐",
          },
          {
            id: "Sains Alam & Eksperimen",
            labelId: "Sains & Eksperimen",
            labelEn: "Natural Sciences & Lab",
            descId: "Fisika, Kimia, Biologi, dan pemahaman konsep sains",
            descEn: "Physics, Chemistry, Biology, and scientific methods",
            emoji: "🧪",
          },
          {
            id: "Manajemen, Finansial & Bisnis",
            labelId: "Bisnis & Keuangan",
            labelEn: "Business & Finance",
            descId: "Analisis pasar, akuntansi, pemasaran, dan strategi bisnis",
            descEn: "Market analysis, accounting, marketing, and business strategy",
            emoji: "💼",
          },
        ],
      },
      {
        type: "question",
        sectionIndex: 3,
        categoryId: "Fokus & Target Akademik",
        categoryEn: "Focus & Academic Goals",
        questionId: "Apa tantangan terbesar yang sering kamu hadapi saat belajar?",
        questionEn: "What is your biggest obstacle when studying?",
        descId: "Fitur IOnLearn akan secara khusus disesuaikan untuk membantumu mengatasi hal ini.",
        descEn: "IOnLearn will provide targeted suggestions to overcome this hurdle.",
        key: "biggestChallenge",
        options: [
          {
            id: "Prokrastinasi & Suka Menunda Tugas",
            labelId: "Suka Menunda (Prokrastinasi)",
            labelEn: "Procrastination & Starting Friction",
            descId: "Sulit memulai mengerjakan tugas sebelum mendekati hari deadline",
            descEn: "Difficult to initiate tasks until deadline pressure kicks in",
            emoji: "⏳",
          },
          {
            id: "Materi Dosen/Guru Terlalu Cepat & Sulit Dipahami",
            labelId: "Materi di Kelas Sulit Dipahami",
            labelEn: "Complex Lecture Materials",
            descId: "Butuh penjelasan ulang yang ramah dengan bahasa lebih sederhana",
            descEn: "Needs approachable re-explanations using simpler language",
            emoji: "🧩",
          },
          {
            id: "Waktu Terbatas Karena Jadwal Terlalu Padat",
            labelId: "Jadwal Padat & Waktu Terbatas",
            labelEn: "Limited Time & Busy Schedule",
            descId: "Perlu rangkuman super ringkas dan poin kunci agar hemat waktu",
            descEn: "Requires high-density key point summaries to save valuable time",
            emoji: "🏃",
          },
          {
            id: "Kurang Bahan Latihan & Referensi Berkualitas",
            labelId: "Kurang Referensi & Contoh Soal",
            labelEn: "Lack of High-Quality Practice Problems",
            descId: "Butuh bank soal tambahan, studi kasus, dan rekomendasi referensi",
            descEn: "Needs curated question banks, case studies, and reference materials",
            emoji: "📖",
          },
        ],
      },
      {
        type: "question",
        sectionIndex: 3,
        categoryId: "Fokus & Target Akademik",
        categoryEn: "Focus & Academic Goals",
        questionId: "Kapan jam paling produktifmu untuk belajar?",
        questionEn: "When is your most productive study window?",
        descId: "Membantu mengatur prioritas dashboard di jam optimalmu.",
        descEn: "Helps tailor dashboard focus at your peak energy hours.",
        key: "productiveTime",
        options: [
          {
            id: "Pagi Hari (06:00 - 11:00)",
            labelId: "Pagi Hari yang Segar",
            labelEn: "Fresh Morning (06:00 - 11:00)",
            descId: "Pikiran masih segar, jernih, dan berenergi penuh",
            descEn: "Clear mind, high mental stamina, and fresh focus",
            emoji: "🌅",
          },
          {
            id: "Siang / Sore Hari (13:00 - 18:00)",
            labelId: "Siang / Sore Hari",
            labelEn: "Afternoon (13:00 - 18:00)",
            descId: "Waktu produktif di sela-sela jeda kelas atau aktivitas harian",
            descEn: "Productive momentum between classes and daily activities",
            emoji: "☀️",
          },
          {
            id: "Malam Hari (19:00 - 00:00)",
            labelId: "Malam Hari yang Tenang",
            labelEn: "Quiet Night (19:00 - 00:00)",
            descId: "Suasana hening, tenang, dan fokus tanpa gangguan",
            descEn: "Peaceful environment with minimal outside distractions",
            emoji: "🌙",
          },
          {
            id: "Akhir Pekan Intensif",
            labelId: "Akhir Pekan (Weekend Focused)",
            labelEn: "Weekend Deep Focus",
            descId: "Sesi maraton belajar dan mengejar materi di hari Sabtu & Minggu",
            descEn: "Extended weekend catch-up sessions on Saturdays and Sundays",
            emoji: "🗓️",
          },
        ],
      },
      {
        type: "question",
        sectionIndex: 3,
        categoryId: "Fokus & Target Akademik",
        categoryEn: "Focus & Academic Goals",
        questionId: "Bagaimana gaya notifikasi yang paling kamu sukai?",
        questionEn: "What notification style do you prefer?",
        descId: "Pengaturan notifikasi toast dan banner peringatan deadline.",
        descEn: "Controls toast notifications and urgent alerts across the app.",
        key: "notificationStyle",
        options: [
          {
            id: "Toast Interaktif & Banner Visual",
            labelId: "Toast Interaktif & Visual",
            labelEn: "Interactive Toasts & Visual Banners",
            descId: "Notifikasi responsif di sudut layar saat tugas mendekati deadline",
            descEn: "Responsive corner popups when assignment deadlines approach",
            emoji: "🔔",
          },
          {
            id: "Minimalis di Dashboard Saja",
            labelId: "Minimalis di Dashboard",
            labelEn: "Minimalist Dashboard Only",
            descId: "Cukup tampilkan ringkasan di dashboard tanpa popup interaktif berlebih",
            descEn: "Keep it quiet; only display status alerts within dashboard widgets",
            emoji: "🔕",
          },
        ],
      },
    ],
    []
  );

  const totalQuestions = useMemo(
    () => allSteps.filter((s) => s.type === "question").length,
    [allSteps]
  );

  const [currentStepIndex, setCurrentStepIndex] = useState(
    Math.max(0, Math.min(initialStep - 1, allSteps.length - 1))
  );

  const [selectedPrefs, setSelectedPrefs] = useState<UserPreferences>(() => {
    const profile = ClassroomService.getUserProfile();
    const draftKey = profile?.email ? `onboarding_draft_${profile.email}` : "onboarding_draft";
    let draftData: Partial<UserPreferences> = {};
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(draftKey);
        if (raw) draftData = JSON.parse(raw);
      } catch {}
    }
    const existing = loadPreferences();
    return {
      educationLevel: draftData.educationLevel || existing?.educationLevel || "",
      majorOrField: draftData.majorOrField || existing?.majorOrField || "",
      dailyStudyHours: draftData.dailyStudyHours || existing?.dailyStudyHours || "",
      studyEnvironment: draftData.studyEnvironment || existing?.studyEnvironment || "",
      learningStyle: draftData.learningStyle || existing?.learningStyle || "",
      problemSolvingStyle: draftData.problemSolvingStyle || existing?.problemSolvingStyle || "",
      noteFormat: draftData.noteFormat || existing?.noteFormat || "",
      favoriteFeatures: draftData.favoriteFeatures || existing?.favoriteFeatures || [],
      deadlineHandling: draftData.deadlineHandling || existing?.deadlineHandling || "",
      explanationDetail: draftData.explanationDetail || existing?.explanationDetail || "",
      aiTone: draftData.aiTone || existing?.aiTone || "",
      aiRole: draftData.aiRole || existing?.aiRole || "",
      socraticFrequency: draftData.socraticFrequency || existing?.socraticFrequency || "",
      studyGoal: draftData.studyGoal || existing?.studyGoal || "",
      focusTopics: draftData.focusTopics || existing?.focusTopics || [],
      biggestChallenge: draftData.biggestChallenge || existing?.biggestChallenge || "",
      productiveTime: draftData.productiveTime || existing?.productiveTime || "",
      notificationStyle: draftData.notificationStyle || existing?.notificationStyle || "",
      defaultStudyMode: draftData.defaultStudyMode || existing?.defaultStudyMode || "socratic",
      classroomDateRangeMonths: draftData.classroomDateRangeMonths || existing?.classroomDateRangeMonths || 2,
      toastPosition: draftData.toastPosition || existing?.toastPosition || "top-right",
      taskModalStyle: draftData.taskModalStyle || existing?.taskModalStyle || "drawer",
      chatLayout: draftData.chatLayout || existing?.chatLayout || "minimal",
      language: draftData.language || existing?.language || (isEn ? "en" : "id"),
    };
  });

  // Save draft whenever selectedPrefs changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const profile = ClassroomService.getUserProfile();
    const draftKey = profile?.email ? `onboarding_draft_${profile.email}` : "onboarding_draft";
    try {
      localStorage.setItem(draftKey, JSON.stringify(selectedPrefs));
    } catch {}
  }, [selectedPrefs]);

  const currentStep = allSteps[currentStepIndex];

  // Global question number (1 to 19)
  const currentQuestionNumber = useMemo(() => {
    let count = 0;
    for (let i = 0; i <= currentStepIndex; i++) {
      if (allSteps[i].type === "question") {
        count++;
      }
    }
    return Math.max(1, count);
  }, [allSteps, currentStepIndex]);

  // CRITICAL REQUIREMENT: Tombol Lanjut TIDAK dapat diklik sebelum pertanyaan diisi
  const isCurrentStepAnswered = useMemo(() => {
    if (currentStep.type === "interstitial") {
      return true;
    }
    const val = selectedPrefs[currentStep.key];
    if (currentStep.isMultiSelect) {
      return Array.isArray(val) && val.length > 0;
    }
    return typeof val === "string" && val.trim().length > 0;
  }, [currentStep, selectedPrefs]);

  const handleSelectOption = (value: string) => {
    if (currentStep.type !== "question") return;
    setSelectedPrefs((prev) => ({
      ...prev,
      [currentStep.key]: value,
    }));
  };

  const handleToggleMultiOption = (value: string) => {
    if (currentStep.type !== "question") return;
    setSelectedPrefs((prev) => {
      const currentList = (prev[currentStep.key] as string[]) || [];
      const exists = currentList.includes(value);
      const updated = exists
        ? currentList.filter((item) => item !== value)
        : [...currentList, value];
      return {
        ...prev,
        [currentStep.key]: updated,
      };
    });
  };

  const handleNext = () => {
    if (!isCurrentStepAnswered) {
      toast.warning(
        isEn
          ? "Please choose an option before continuing."
          : "Silakan pilih opsi terlebih dahulu sebelum melanjutkan.",
        {
          description: isEn
            ? "Your choice helps calibrate AI Tutor to your learning style."
            : "Pilihan ini membantu AI menyesuaikan pengalaman belajarmu.",
        }
      );
      return;
    }

    if (currentStepIndex < allSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const [isSavingCloud, setIsSavingCloud] = useState(false);

  const finishOnboarding = async () => {
    if (isSavingCloud) return;
    setIsSavingCloud(true);

    const profile = ClassroomService.getUserProfile();
    const finalPrefs: UserPreferences = {
      ...selectedPrefs,
      educationLevel: selectedPrefs.educationLevel || "Mahasiswa S1",
      learningStyle: selectedPrefs.learningStyle || "Visual (Gambar, Video, Diagram)",
      explanationDetail: selectedPrefs.explanationDetail || "Singkat & Padat (To the point)",
      aiTone: selectedPrefs.aiTone || "Santai & Ramah",
      studyGoal: selectedPrefs.studyGoal || "Manajemen Tugas & Deadline Tepat Waktu",
      language: language,
    };

    // 1. Persist locally IMMEDIATELY for instant UI responsiveness & zero delay
    try {
      savePreferences(finalPrefs, profile?.email);
      setOnboardingCompleted(true, profile?.email);
    } catch (e) {
      console.warn("Local storage save warning:", e);
    }

    const draftKey = profile?.email ? `onboarding_draft_${profile.email}` : "onboarding_draft";
    try {
      localStorage.removeItem(draftKey);
    } catch {}

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#818cf8", "#3b82f6", "#10b981", "#a855f7"],
      });
    } catch {}

    toast.success(
      isEn
        ? "AI Learning Profile Successfully Configured! 🎉"
        : "Personalisasi profil belajar AI berhasil! 🎉",
      {
        description: isEn
          ? "Your AI Tutor and Dashboard are fully primed."
          : "AI Tutor dan Dashboard telah siap menemani belajarmu.",
      }
    );

    // 2. Primary: Save directly to Firebase Firestore Cloud & Server with a safe timeout
    try {
      await Promise.race([
        DBService.saveUserData(
          loadTasks(),
          finalPrefs,
          loadAIConfig(),
          profile?.email,
          loadTodos(),
          loadNotes()
        ),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
    } catch (e) {
      console.warn("Cloud save warning:", e);
    }

    setIsSavingCloud(false);
    if (onComplete) {
      onComplete(finalPrefs);
    } else {
      router.push("/dashboard");
    }
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_DONE_KEY, "true");
    }
    if (onSkip) {
      onSkip();
    } else {
      router.push("/dashboard");
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (isCurrentStepAnswered) {
          e.preventDefault();
          handleNext();
        }
      } else if (e.key === "ArrowLeft" && currentStepIndex > 0) {
        handleBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStepIndex, isCurrentStepAnswered]);

  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    const profile = ClassroomService.getUserProfile();
    if (isOnboardingCompleted(profile?.email)) {
      setAlreadyCompleted(true);
    }
  }, []);

  const activeSectionIdx = currentStep.sectionIndex;

  const sectionSteps = useMemo(() => {
    return allSteps.filter(
      (s) => s.sectionIndex === activeSectionIdx && s.type === "question"
    );
  }, [allSteps, activeSectionIdx]);

  const answeredInSection = useMemo(() => {
    let count = 0;
    for (const s of sectionSteps) {
      if (s.type === "question") {
        const val = selectedPrefs[s.key];
        if (Array.isArray(val) ? val.length > 0 : Boolean(val)) {
          count++;
        }
      }
    }
    return count;
  }, [sectionSteps, selectedPrefs]);

  return (
    <div
      className={`relative w-full flex flex-col justify-between overflow-hidden select-none transition-colors duration-300 ${isModal
        ? "min-h-[620px] p-6 md:p-8 bg-slate-50/90 dark:bg-[#09090b] text-slate-900 dark:text-[#f5f5f5] rounded-3xl"
        : "min-h-screen p-6 md:p-10 bg-slate-50/70 dark:bg-[#09090b] text-slate-900 dark:text-[#f5f5f5]"
        }`}
    >
      {/* Ambient Lighting Glow (Indigo & Violet Brand Palette) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-violet-500/5 to-transparent blur-3xl pointer-events-none rounded-full -z-0" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[250px] bg-blue-600/5 blur-3xl pointer-events-none rounded-full -z-0" />

      {/* Top Utility Controls (Language Toggle, Theme Toggle & Conditional Close Button) */}
      <div className="relative z-10 w-full max-w-2xl mx-auto flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center scale-200">
            <img
              src="/logos/ionlearn_mascot.svg"
              alt="IOnLearn"
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-tight font-heading text-slate-900 dark:text-[#f5f5f5]">
            IOnLearn
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bilingual Language Switcher */}
          <button
            type="button"
            onClick={handleToggleLanguage}
            className="px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#161616] text-slate-700 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors cursor-pointer shadow-2xs"
            title="Ganti Bahasa / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={handleToggleTheme}
            className="size-7.5 rounded-xl flex items-center justify-center border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#161616] text-slate-700 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors cursor-pointer shadow-2xs"
            title={isDark ? "Light Mode" : "Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
            )}
          </button>

          {/* Close / Exit Button - Always available so user is never trapped */}
          <button
            type="button"
            onClick={() => {
              if (onSkip) {
                onSkip();
              } else {
                router.push("/");
              }
            }}
            className="px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#161616] text-slate-700 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors cursor-pointer shadow-2xs"
            title={isEn ? "Exit & Return to Home" : "Tutup & Kembali ke Beranda"}
          >
            <X className="w-3.5 h-3.5 text-slate-500 hover:text-slate-900 dark:hover:text-white" />
            <span className="hidden sm:inline">{isEn ? "Exit" : "Tutup"}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOP HEADER: Segmented Progress Bar & Category/Step Text
          ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-2xl mx-auto pt-2 pb-6">
        {/* 4 Segmented Pill Bars */}
        <div className="flex items-center gap-2.5 w-full">
          {SECTIONS.map((sec, idx) => {
            const isCompleted = idx < activeSectionIdx;
            const isActive = idx === activeSectionIdx;

            const subFillPercent = isActive
              ? sectionSteps.length > 0
                ? Math.min(100, Math.max(15, (answeredInSection / sectionSteps.length) * 100))
                : 50
              : isCompleted
                ? 100
                : 0;

            return (
              <div
                key={sec.titleId}
                className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.1] relative overflow-hidden transition-all duration-300"
                title={`${isEn ? "Section" : "Bagian"} ${idx + 1}: ${isEn ? sec.titleEn : sec.titleId
                  }`}
              >
                {(isCompleted || isActive) && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subFillPercent}%` }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`h-full rounded-full ${isCompleted
                      ? "bg-indigo-600 dark:bg-indigo-500"
                      : "bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                      }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Category Title (Left) & Global Step Counter (Right e.g., '1 / 19') */}
        <div className="flex items-center justify-between mt-3 text-xs md:text-sm font-medium">
          <span className="text-indigo-600 dark:text-indigo-400 tracking-wide flex items-center gap-1.5 font-semibold">
            {isEn ? currentStep.categoryEn : currentStep.categoryId}
          </span>
          <span className="text-slate-500 dark:text-[#a0a0a0] font-mono text-xs md:text-sm tracking-wider">
            {currentQuestionNumber} / {totalQuestions}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT AREA: Question or Interstitial Card
          ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center max-w-2xl w-full mx-auto py-4">
        <AnimatePresence mode="wait">
          {currentStep.type === "question" ? (
            <motion.div
              key={`q-${currentStepIndex}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full text-center"
            >
              {/* Question Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug mb-2 font-heading">
                {isEn ? currentStep.questionEn : currentStep.questionId}
              </h1>

              {(currentStep.descId || currentStep.descEn) && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0] max-w-lg mx-auto mb-6 leading-relaxed">
                  {isEn ? currentStep.descEn : currentStep.descId}
                  {currentStep.isMultiSelect && (
                    <span className="ml-1.5 text-indigo-600 dark:text-indigo-400 font-medium text-xs">
                      {isEn ? "(Select all that apply)" : "(Bisa pilih lebih dari satu)"}
                    </span>
                  )}
                </p>
              )}

              {/* Options Grid (2 Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full mt-4 text-left">
                {currentStep.options.map((opt) => {
                  const isSelected = currentStep.isMultiSelect
                    ? ((selectedPrefs[currentStep.key] as string[]) || []).includes(opt.id)
                    : selectedPrefs[currentStep.key] === opt.id;

                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      whileHover={{ scale: 1.012 }}
                      whileTap={{ scale: 0.988 }}
                      onClick={() =>
                        currentStep.isMultiSelect
                          ? handleToggleMultiOption(opt.id)
                          : handleSelectOption(opt.id)
                      }
                      className={`relative flex items-start gap-3.5 p-4 md:p-4.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer overflow-hidden ${isSelected
                        ? "bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-600 dark:border-indigo-500 shadow-[0_0_24px_rgba(99,102,241,0.18)] ring-1 ring-indigo-500/40"
                        : "bg-white dark:bg-[#121214] border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16] hover:bg-slate-50/80 dark:hover:bg-[#18181c] shadow-2xs"
                        }`}
                    >
                      {/* Left Icon / Emoji Badge */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl transition-all duration-200 mt-0.5 ${isSelected
                          ? "bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                          : "bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200"
                          }`}
                      >
                        {opt.emoji ? (
                          <span className="leading-none select-none">{opt.emoji}</span>
                        ) : (
                          opt.icon
                        )}
                      </div>

                      {/* Label & Full Unclipped Description */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold text-sm md:text-base leading-tight transition-colors ${isSelected
                              ? "text-indigo-950 dark:text-indigo-200 font-bold"
                              : "text-slate-900 dark:text-slate-200"
                              }`}
                          >
                            {isEn ? opt.labelEn : opt.labelId}
                          </span>
                        </div>
                        {(opt.descId || opt.descEn) && (
                          <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-1.5 leading-relaxed">
                            {isEn ? opt.descEn : opt.descId}
                          </p>
                        )}
                      </div>

                      {/* Checkmark Indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shrink-0 text-white shadow-sm shadow-indigo-500/50 mt-1"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* Interstitial Section Transition Card */
            <motion.div
              key={`interstitial-${currentStepIndex}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg bg-white dark:bg-[#121214] border border-indigo-200/80 dark:border-indigo-900/50 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none" />

              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-3xl mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                {currentStep.emoji}
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 font-heading">
                {isEn ? currentStep.titleEn : currentStep.titleId}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a0a0a0] mb-6 leading-relaxed">
                {isEn ? currentStep.subtitleEn : currentStep.subtitleId}
              </p>

              <div className="space-y-2.5 text-left mb-6">
                {(isEn ? currentStep.highlightsEn : currentStep.highlightsId).map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium"
                  >
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 stroke-[3]" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-slate-500 dark:text-[#a0a0a0] bg-slate-100 dark:bg-[#18181c] py-2 px-4 rounded-full inline-block border border-slate-200 dark:border-white/[0.08]">
                {isEn ? "Next Up:" : "Selanjutnya:"}{" "}
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  {isEn ? currentStep.nextSectionEn : currentStep.nextSectionId}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM FOOTER: Back Button & Next Button
          RULE: Tombol 'Lanjut' disabled jika pertanyaan belum diisi!
          ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-2xl mx-auto pt-6 pb-2 flex items-center justify-between border-t border-slate-200/80 dark:border-white/[0.08] mt-4">
        {/* Back Button */}
        {currentStepIndex > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-[#a0a0a0] hover:text-slate-900 dark:hover:text-white px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isEn ? "Back" : "Kembali"}</span>
          </button>
        ) : (
          <div className="w-16" />
        )}

        {/* Next / Finish Button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={!isCurrentStepAnswered || isSavingCloud}
          className={`flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
            isCurrentStepAnswered && !isSavingCloud
              ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/25 active:scale-95 cursor-pointer"
              : "bg-slate-200 dark:bg-white/[0.06] text-slate-400 dark:text-[#707070] border border-slate-300/60 dark:border-white/[0.08] cursor-not-allowed opacity-50 shadow-none"
          }`}
          title={
            !isCurrentStepAnswered
              ? isEn
                ? "Please choose an option to proceed"
                : "Pilih opsi terlebih dahulu untuk melanjutkan"
              : isEn
                ? "Proceed to next step"
                : "Lanjut ke langkah berikutnya"
          }
        >
          <span>
            {isSavingCloud
              ? isEn
                ? "Setting up AI Dashboard..."
                : "Menyiapkan Dashboard..."
              : currentStepIndex === allSteps.length - 1
              ? isEn
                ? "Start Learning"
                : "Mulai Belajar"
              : currentStep.type === "interstitial"
              ? isEn
                ? "Continue to Next Section"
                : "Lanjut Bagian Berikutnya"
              : isEn
              ? "Continue"
              : "Lanjut"}
          </span>
          {isSavingCloud ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : currentStepIndex === allSteps.length - 1 ? (
            <Sparkles className="w-3.5 h-3.5" />
          ) : (
            <ArrowRight className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
