export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  alternateLink?: string;
  courseState?: string;
}

export interface ClassroomMaterial {
  driveFile?: {
    driveFile: {
      id: string;
      title: string;
      alternateLink: string;
      thumbnailUrl?: string;
    };
    shareMode?: string;
  };
  youtubeVideo?: {
    id: string;
    title: string;
    alternateLink: string;
    thumbnailUrl?: string;
  };
  link?: {
    url: string;
    title?: string;
    thumbnailUrl?: string;
  };
  form?: {
    formUrl: string;
    title?: string;
    thumbnailUrl?: string;
  };
}

export interface ClassroomCourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  materials?: ClassroomMaterial[];
  state: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink?: string;
  creationTime: string;
  updateTime?: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours?: number;
    minutes?: number;
    nanos?: number;
  };
  maxPoints?: number;
  workType?: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
  submissionState?: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
}

export interface AISourceLink {
  title: string;
  url: string;
  domain: string;
  description: string;
  type: 'doc' | 'article' | 'tool' | 'tutorial' | 'academic';
}

export interface AIYouTubeRecommendation {
  title: string;
  channel: string;
  searchQuery: string;
  searchUrl: string;
  reason: string;
  keyTakeaways: string[];
}

export interface AIAnalysisResult {
  summary: string;
  estimatedMinutes: number;
  difficulty: 'Mudah' | 'Sedang' | 'Menantang';
  keyConcepts: string[];
  checklist: { id: string; text: string; done: boolean }[];
  sources: AISourceLink[];
  youtubeVideos: AIYouTubeRecommendation[];
  studyTips: string[];
  recommendedStrategy: string;
  generatedAt: string;
}

export interface TodoTask {
  id: string;
  courseWorkId?: string;
  courseId?: string;
  courseName: string;
  title: string;
  description?: string;
  dueDateStr?: string; // ISO string or formatted
  dueTimestamp?: number | null;
  points?: number;
  isCompleted: boolean;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high';
  syncSource: 'classroom' | 'manual';
  classroomLink?: string;
  materials?: ClassroomMaterial[];
  aiAnalysis?: AIAnalysisResult;
  aiLoading?: boolean;
  aiError?: string;
  customNotes?: string;
  createdAt: string;
  updatedAt: string;
  userEmail?: string;
}

export interface YouTubeVideoInfo {
  videoId: string;
  url: string;
  canonicalUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  title?: string;
  authorName?: string;
  authorUrl?: string;
  description?: string;
}

export interface ChatAttachment {
  name: string;
  size: number;
  type?: 'pdf' | 'image' | 'code' | 'doc' | 'youtube';
  dataUrl?: string;
  extractedText?: string;
  youtubeInfo?: YouTubeVideoInfo;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  taskId?: string;
  taskTitle?: string;
  isError?: boolean;
  isStreaming?: boolean;
  thoughtProcess?: string;
  streamStage?: 'analyzing' | 'searching' | 'thinking' | 'answering';
  streamStageDetail?: string;
  streamSearchQueries?: string[];
  attachments?: ChatAttachment[];
  createdNote?: {
    id?: string;
    title: string;
    content: string;
    subject?: string;
    tags?: string[];
  };
  createdTodo?: {
    id?: string;
    title: string;
    description?: string;
    priority?: 'high' | 'medium' | 'low';
    category?: string;
    subtasks?: {
      id?: string;
      title: string;
      isCompleted?: boolean;
    }[];
  };
  createdTodos?: {
    id?: string;
    title: string;
    description?: string;
    priority?: 'high' | 'medium' | 'low';
    category?: string;
    subtasks?: {
      id?: string;
      title: string;
      isCompleted?: boolean;
    }[];
  }[];
  createdDocument?: CreatedDocument;
  createdSlides?: CreatedSlides;
  createdImage?: CreatedImage;
  groundingSources?: { title: string; url: string }[];
  groundingQueries?: string[];
}

export interface CreatedDocument {
  id?: string;
  type: 'pdf' | 'docx' | 'xlsx';
  title: string;
  content: string;
  fileName?: string;
  description?: string;
  subject?: string;
}

export interface DocumentStyleOptions {
  author?: string; // Default: "IOnLearn"
  userName?: string; // Nama Penyusun / Siswa
  studentId?: string; // NIM / NIS / ID
  institution?: string; // Sekolah / Universitas / Instansi
  facultyOrClass?: string; // Jurusan / Program Studi / Kelas
  fontFamily?: 'Calibri' | 'Times New Roman' | 'Arial' | 'Georgia' | 'Courier New';
  fontSize?: 'compact' | 'normal' | 'large';
  lineSpacing?: 'single' | 'normal' | 'relaxed';
  pageSize?: 'A4' | 'Letter' | 'F4'; // Ukuran Kertas
  pageMargin?: 'normal' | 'skripsi' | 'narrow' | 'wide'; // skripsi = Aturan 4-4-3-3 cm
  headerStyle?: 'modern' | 'formal_academic' | 'minimalist'; // Desain Kop / Header Dokumen
  includeCoverPage?: boolean; // Halaman Sampul / Cover Tugas Terpisah
  coverSubtitle?: string; // Subjudul Sampul
  accentColor?: 'indigo' | 'navy' | 'emerald' | 'maroon' | 'slate'; // Skema Warna Aksen
  textAlign?: 'justify' | 'left'; // Format Perataan Teks
  firstLineIndent?: boolean; // Indentasi Alinea Pertama Paragraf (1 cm)
  includePageNumbers?: boolean; // Nomor Halaman Otomatis di Footer
  includeToc?: boolean; // Ringkasan / Daftar Isi Otomatis
  logoBase64?: string; // Data URL logo institusi / sekolah (data:image/...;base64,...)
  customHeaderText?: string; // Teks kustom kop surat / header instansi
  logoPosition?: 'left' | 'center' | 'right'; // Posisi penempatan logo pada kop
  watermark?: boolean; // Default true
  watermarkText?: string; // Default "IOnLearn Study Copilot"
  // Excel / Spreadsheet specific customization options
  sheetName?: string; // Nama Sheet / Lembar Kerja (maks 31 karakter)
  tableTitle?: string; // Judul Tabel Utama di Excel
  excelTheme?: 'emerald' | 'teal' | 'indigo' | 'blue' | 'slate' | 'amber'; // Tema Warna Excel
  autoFitColumns?: boolean; // Auto-fit lebar kolom (default true)
  showGridLines?: boolean; // Tampilkan garis kisi gridlines (default true)
}

export interface CreatedSlides {
  id?: string;
  title: string;
  theme?: 'indigo' | 'dark' | 'emerald' | 'amber' | 'slate';
  slides: {
    title: string;
    bullets: string[];
    notes?: string;
  }[];
  fileName?: string;
  subject?: string;
}

export interface CreatedImage {
  id?: string;
  url: string;
  prompt: string;
  caption?: string;
  aspectRatio?: '1:1' | '16:9' | '4:3' | '9:16';
}

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface UserPreferences {
  learningStyle: string; // e.g., 'Visual', 'Membaca/Menulis', 'Praktik'
  explanationDetail: string; // e.g., 'Singkat', 'Detail', 'Bertahap'
  aiTone: string; // e.g., 'Santai', 'Tegas', 'Socratic'
  defaultStudyMode?: 'socratic' | 'direct' | 'quizzer'; // Mode default AI Chat: 'socratic', 'direct', 'quizzer'
  classroomDateRangeMonths?: number; // Filter rentang bulan sinkronisasi tugas: 1, 2 (default), 3, 6, 12, atau 0 (semua)
  toastPosition?: ToastPosition; // Posisi notifikasi toast sonner (default: 'top-right')
  taskModalStyle?: 'modal' | 'drawer'; // Gaya pop-up detail tugas: 'drawer' (panel samping) atau 'modal' (tengah layar)
  chatLayout?: 'sidebar' | 'split' | 'minimal'; // Tata letak AI Chat: 'sidebar' (default), 'split' (dual workspace), atau 'minimal'
}

export const DEFAULT_DATE_RANGE_MONTHS = 2;

/**
 * Memeriksa apakah tugas berada dalam rentang tanggal yang dipilih
 * @param task Objek TodoTask
 * @param dateRangeMonths Batas bulan ke belakang (default: 2 bulan). Nilai 0 berarti semua waktu.
 */
export function isTaskWithinDateRange(task: TodoTask, dateRangeMonths: number = DEFAULT_DATE_RANGE_MONTHS): boolean {
  if (!dateRangeMonths || dateRangeMonths <= 0) return true;

  const now = new Date();
  const cutoffDate = new Date(now.getFullYear(), now.getMonth() - dateRangeMonths, now.getDate(), 0, 0, 0, 0);
  const cutoffTimestamp = cutoffDate.getTime();

  // Jika tugas memiliki due date (tenggat waktu)
  if (task.dueTimestamp) {
    return task.dueTimestamp >= cutoffTimestamp;
  }

  // Jika tugas tidak memiliki due date, gunakan waktu pembuatan (createdAt)
  if (task.createdAt) {
    const createdTimestamp = new Date(task.createdAt).getTime();
    if (!isNaN(createdTimestamp)) {
      return createdTimestamp >= cutoffTimestamp;
    }
  }

  return true;
}

/**
 * Memeriksa apakah CourseWork dari Google Classroom berada dalam rentang tanggal yang ditentukan
 * @param cw Objek ClassroomCourseWork
 * @param dateRangeMonths Batas bulan ke belakang (default: 2 bulan)
 */
export function isCourseWorkWithinDateRange(cw: ClassroomCourseWork, dateRangeMonths: number = DEFAULT_DATE_RANGE_MONTHS): boolean {
  if (!dateRangeMonths || dateRangeMonths <= 0) return true;

  const now = new Date();
  const cutoffDate = new Date(now.getFullYear(), now.getMonth() - dateRangeMonths, now.getDate(), 0, 0, 0, 0);
  const cutoffTimestamp = cutoffDate.getTime();

  // Jika memiliki due date
  if (cw.dueDate && cw.dueDate.year && cw.dueDate.month && cw.dueDate.day) {
    const dueTime = cw.dueTime;
    const timestamp = Date.UTC(
      cw.dueDate.year,
      cw.dueDate.month - 1,
      cw.dueDate.day,
      dueTime?.hours ?? 23,
      dueTime?.minutes ?? 59
    );
    return timestamp >= cutoffTimestamp;
  }

  // Jika tidak ada due date, cek creationTime
  if (cw.creationTime) {
    const createdTimestamp = new Date(cw.creationTime).getTime();
    if (!isNaN(createdTimestamp)) {
      return createdTimestamp >= cutoffTimestamp;
    }
  }

  return true;
}

export interface AIConfig {
  provider: 'gemini' | 'gemini_custom' | 'openai';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface ClassroomSyncProgress {
  current: number;
  total: number;
  percent: number;
  message: string;
  courseName?: string;
}

export interface SyncStats {
  lastSyncTime: string | null;
  totalCourses: number;
  totalSyncedTasks: number;
  newTasksFound: number;
  isSyncing: boolean;
}

export interface TodoSubtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface PersonalTodo {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string; // YYYY-MM-DD
  category?: string; // e.g., 'Belajar', 'Tugas', 'Pribadi', 'Ujian'
  courseWorkId?: string; // If converted from classroom task
  courseName?: string;
  subtasks?: TodoSubtask[];
  createdAt: string;
  updatedAt: string;
  userEmail?: string;
}

export interface StudyNoteQuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string; // Markdown / rich text
  subject?: string; // e.g., 'Matematika', 'Pemrograman'
  tags?: string[];
  summary?: string;
  aiQuiz?: StudyNoteQuizItem[];
  createdAt: string;
  updatedAt: string;
  userEmail?: string;
}
