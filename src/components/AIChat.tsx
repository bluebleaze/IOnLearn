"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  Sparkles,
  MessageSquare,
  History,
  BookOpen,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  GraduationCap,
  Paperclip,
  PanelLeft,
  Columns2,
  X,
  FileText,
  ImageIcon,
  Code2,
  Eye,
  Download,
  ExternalLink,
  NotebookPen,
  ListTodo,
  BookmarkPlus,
  Search,
  AtSign,
  Brain,
  Zap,
  HelpCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Presentation,
  FileSpreadsheet,
  Layers,
  ChevronLeft,
  Link2,
  FileDown,
  Globe,
  Square,
  Sliders,
  MoreHorizontal,
  Youtube,
  Play,
  Pause,
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import confetti from "canvas-confetti";
import { DocumentCustomizerModal } from "./DocumentCustomizerModal";
import {
  AIConfig,
  ChatAttachment,
  ChatMessage,
  CreatedDocument,
  CreatedSlides,
  TodoTask,
  UserPreferences,
  StudyNote,
  PersonalTodo,
  YouTubeVideoInfo,
} from "../types";
import { sendChatMessageToAI, sendChatMessageToAIStream } from "../services/aiService";
import {
  downloadCreatedDocument,
  downloadCreatedSlides,
  generatePdfDocument,
  generateWordDocument,
  generateXlsxDocument,
  generatePptxPresentation,
  triggerFileDownload,
  cleanLatexMath,
  parseBulletPoint,
} from "@/lib/exportUtils";
import {
  isGoogleWorkspaceUrl,
  parseGoogleWorkspaceUrl,
  getWorkspaceBadge,
} from "@/lib/workspaceUtils";
import {
  isYouTubeUrl,
  parseYouTubeUrl,
  extractYouTubeUrls,
} from "@/lib/youtubeUtils";
import {
  addNote,
  addTodo,
  loadNotes,
  loadPreferences,
  loadTasks,
} from "@/lib/taskStore";
import { APP_NAME } from "@/lib/brand";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

const SESSIONS_KEY = "classroom_ai_chat_sessions_v1";
const MAX_SESSIONS = 30;
const MAX_FILE_CHARS = 15000;
const MAX_FILE_BYTES = 1.5 * 1024 * 1024; // 1.5MB

export type StudyMode = "socratic" | "direct" | "quizzer";

interface ChatSession {
  id: string;
  taskId?: string;
  noteId?: string;
  studyMode?: StudyMode;
  messages: ChatMessage[];
  suggestedPrompts?: string[];
  createdAt: number;
  updatedAt: number;
}

interface AttachedFile {
  name: string;
  size: number;
  type: "pdf" | "image" | "code" | "doc" | "youtube";
  dataUrl?: string;
  extractedText?: string;
  youtubeInfo?: YouTubeVideoInfo;
}

const compressImageIfNeeded = async (
  file: File
): Promise<{ dataUrl: string; size: number }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = (e.target?.result as string) || "";
      if (!result) {
        resolve({ dataUrl: "", size: file.size });
        return;
      }

      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          resolve({
            dataUrl: compressedDataUrl,
            size: Math.round((compressedDataUrl.length * 3) / 4),
          });
          return;
        }
        resolve({ dataUrl: result, size: file.size });
      };
      img.onerror = () => resolve({ dataUrl: result, size: file.size });
      img.src = result;
    };
    reader.onerror = () => resolve({ dataUrl: "", size: file.size });
    reader.readAsDataURL(file);
  });
};

interface AIChatProps {
  tasks: TodoTask[];
  notes?: StudyNote[];
  initialTaskId?: string;
  initialNoteId?: string;
  initialPrompt?: string;
  userPreferences?: UserPreferences | null;
  aiConfig?: AIConfig | null;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileFormatBadge = (name: string, type?: string) => {
  if (type === "youtube" || isYouTubeUrl(name)) {
    return {
      label: "YOUTUBE",
      badgeClass: "bg-red-600 dark:bg-red-500 text-white",
      borderClass: "border-red-200 dark:border-red-900/50",
      bgLight: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300",
    };
  }
  if (type === "pdf" || name.toLowerCase().endsWith(".pdf")) {
    return {
      label: "PDF",
      badgeClass: "bg-rose-600 dark:bg-rose-500 text-white",
      borderClass: "border-rose-200 dark:border-rose-900/50",
      bgLight: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
    };
  }
  const ext = (name.split(".").pop() || "").toUpperCase();
  if (
    ["PNG", "JPG", "JPEG", "WEBP", "GIF", "SVG", "BMP"].includes(ext) ||
    type === "image"
  ) {
    return {
      label: ext || "PNG",
      badgeClass: "bg-sky-600 dark:bg-sky-500 text-white",
      borderClass: "border-sky-200 dark:border-sky-900/50",
      bgLight: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300",
    };
  }
  if (
    [
      "TS",
      "TSX",
      "JS",
      "JSX",
      "PY",
      "JAVA",
      "CPP",
      "C",
      "HTML",
      "CSS",
      "JSON",
      "SQL",
      "GO",
      "RS",
    ].includes(ext) ||
    type === "code"
  ) {
    return {
      label: ext || "CODE",
      badgeClass: "bg-emerald-600 dark:bg-emerald-500 text-white",
      borderClass: "border-emerald-200 dark:border-emerald-900/50",
      bgLight:
        "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
    };
  }
  return {
    label: ext || "DOC",
    badgeClass: "bg-indigo-600 dark:bg-indigo-500 text-white",
    borderClass: "border-indigo-200 dark:border-indigo-900/50",
    bgLight:
      "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300",
  };
};

// Convert Base64 Data URL to Native Blob URL so browser PDF plugins render with full fidelity
const getBlobUrlFromDataUrl = (dataUrl?: string): string => {
  if (!dataUrl) return "";
  if (dataUrl.startsWith("blob:") || dataUrl.startsWith("http")) return dataUrl;
  try {
    const commaIdx = dataUrl.indexOf(",");
    if (commaIdx === -1) return dataUrl;
    const header = dataUrl.slice(0, commaIdx);
    const base64 = dataUrl.slice(commaIdx + 1);
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
    const byteCharacters = atob(base64);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteNumbers], { type: mime });
    return URL.createObjectURL(blob);
  } catch {
    return dataUrl;
  }
};

const createSession = (
  taskId?: string,
  noteId?: string,
  studyMode: StudyMode = "socratic"
): ChatSession => ({
  id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  taskId,
  noteId,
  studyMode,
  messages: [],
  suggestedPrompts: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Custom Markdown Code Block with Language Tag & Copy Action
const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  if (inline || (!match && !codeString.includes("\n"))) {
    return (
      <code
        className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#202020] text-indigo-600 dark:text-indigo-400 font-mono text-xs font-semibold"
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    toast.success("Kode berhasil disalin");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-200/80 dark:border-[#262626] bg-[#111111] text-slate-100 shadow-2xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#181818] border-b border-[#262626] text-xs text-slate-400 font-mono">
        <span className="uppercase text-xs font-bold tracking-wider text-slate-300">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition cursor-pointer"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          <span>{copied ? "Tersalin" : "Salin Kode"}</span>
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200">
        <pre>{children}</pre>
      </div>
    </div>
  );
};

// Clean and normalize markdown content, formatting tables and converting LaTeX math to clean Unicode
const formatMarkdownTables = (content: string): string => {
  if (!content) return "";
  let text = cleanLatexMath(content);
  // 1. Split concatenated table rows `| ... | | ... |` or `|:---| | 1 |` into separate lines
  text = text.replace(/\|\s*\|\s*(?=[^|\n]+?\|)/g, "|\n|");

  // 2. Process line by line to ensure consecutive table rows stay together, with blank lines around the table block
  const lines = text.split("\n");
  const result: string[] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableRow = /^\s*\|.+?\|\s*$/.test(line);

    if (isTableRow) {
      if (!inTable) {
        // Start of table block: ensure preceding blank line if previous line had content
        if (result.length > 0 && result[result.length - 1].trim() !== "") {
          result.push("");
        }
        inTable = true;
      }
      result.push(line.trim());
    } else {
      if (inTable) {
        // End of table block: ensure a blank line after the table block
        if (line.trim() !== "") {
          result.push("");
        }
        inTable = false;
      }
      result.push(line);
    }
  }

  return result.join("\n");
};

// Real-time live status indicator badge for streaming stages
const LiveStreamStatusBadge: React.FC<{
  stage?: "analyzing" | "searching" | "thinking" | "answering";
  detail?: string;
  queries?: string[];
}> = ({ stage = "analyzing", detail, queries }) => {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/50 text-xs text-indigo-950 dark:text-indigo-200 transition-all shadow-2xs">
      {stage === "searching" ? (
        <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 animate-spin shrink-0" />
      ) : stage === "thinking" ? (
        <Brain className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
      ) : stage === "answering" ? (
        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse shrink-0" />
      ) : (
        <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse shrink-0" />
      )}
      <span className="font-medium text-xs">
        {detail || "AI sedang memproses..."}
      </span>
      {queries && queries.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          {queries.map((q, idx) => (
            <span
              key={idx}
              className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-[#1e1e1e] text-slate-700 dark:text-slate-300 border border-indigo-200/50 dark:border-[#333] font-mono"
            >
              &ldquo;{q}&rdquo;
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Collapsible Chain-of-Thought / reasoning process box
const ThoughtProcessAccordion: React.FC<{
  thought?: string;
  isStreaming?: boolean;
}> = ({ thought, isStreaming }) => {
  const [isOpen, setIsOpen] = useState(Boolean(isStreaming));

  useEffect(() => {
    if (isStreaming) {
      setIsOpen(true);
    }
  }, [isStreaming]);

  if (!thought || !thought.trim()) return null;

  return (
    <div className="my-1.5 rounded-2xl border border-slate-200/80 dark:border-[#282828] bg-slate-50/80 dark:bg-[#181818]/70 overflow-hidden text-xs transition-all shadow-2xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-100/70 dark:hover:bg-[#202020] transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-md bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Brain className="w-3 h-3" />
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
            {isStreaming ? "Sedang Menalar & Verifikasi Logika..." : "Alur Penalaran & Verifikasi Fakta (Chain of Thought)"}
          </span>
          {isStreaming && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 shrink-0 ml-2">
          <span className="text-[11px] font-medium hidden sm:inline">
            {isOpen ? "Sembunyikan" : "Lihat Analisis"}
          </span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-3 pb-2.5 pt-1 text-slate-600 dark:text-slate-300 text-xs leading-relaxed border-t border-slate-200/50 dark:border-[#242424] whitespace-pre-wrap break-words bg-white/40 dark:bg-[#141414]/40 font-mono sm:font-sans">
          {thought}
          {isStreaming && (
            <span className="inline-block w-1.5 h-3.5 ml-1 align-middle bg-amber-500 rounded-xs animate-pulse" />
          )}
        </div>
      )}
    </div>
  );
};

export const AIChat: React.FC<AIChatProps> = ({
  tasks: propTasks,
  notes: propNotes = [],
  initialTaskId,
  initialNoteId,
  initialPrompt,
  userPreferences,
  aiConfig,
}) => {
  const router = useRouter();
  const [tasks, setTasks] = useState<TodoTask[]>(propTasks);
  const [notes, setNotes] = useState<StudyNote[]>(propNotes);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Layout Modes: 'sidebar' | 'split' | 'minimal'
  const [layoutMode, setLayoutMode] = useState<"sidebar" | "split" | "minimal">(() => {
    return userPreferences?.chatLayout || loadPreferences()?.chatLayout || "sidebar";
  });
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [splitWorkspaceTab, setSplitWorkspaceTab] = useState<"task" | "note">("task");

  // Drawer History state
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  useEffect(() => {
    if (userPreferences?.chatLayout) {
      setLayoutMode(userPreferences.chatLayout);
    }
  }, [userPreferences?.chatLayout]);

  useEffect(() => {
    const handleLayoutChange = () => {
      const p = loadPreferences();
      if (p?.chatLayout) {
        setLayoutMode(p.chatLayout);
      }
    };
    window.addEventListener("chat-layout-changed", handleLayoutChange);
    window.addEventListener("taskStoreChange", handleLayoutChange);
    return () => {
      window.removeEventListener("chat-layout-changed", handleLayoutChange);
      window.removeEventListener("taskStoreChange", handleLayoutChange);
    };
  }, []);

  // Speech-to-Text (STT) and Text-to-Speech (TTS)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Popover States
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [contextTab, setContextTab] = useState<"tasks" | "notes">("tasks");
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    size: number;
    type?: string;
    dataUrl?: string;
    extractedText?: string;
  } | null>(null);
  const [previewPdfBlobUrl, setPreviewPdfBlobUrl] = useState<string | null>(null);

  // Slides Carousel index tracking per message
  const [activeSlideIndices, setActiveSlideIndices] = useState<Record<string, number>>({});
  // Google Workspace link modal
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [workspaceUrlInput, setWorkspaceUrlInput] = useState("");
  // YouTube Video link & player modal
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [youtubeUrlInput, setYoutubeUrlInput] = useState("");
  const [isLoadingYouTubeMeta, setIsLoadingYouTubeMeta] = useState(false);
  const [youtubeMetaPreview, setYoutubeMetaPreview] = useState<YouTubeVideoInfo | null>(null);
  const [youtubeAnalysisPreset, setYoutubeAnalysisPreset] = useState<"summary" | "timestamps" | "quiz" | "notes">("summary");
  const [activePlayingVideoId, setActivePlayingVideoId] = useState<string | null>(null);
  // Message export menu state
  const [activeExportMenuMsgId, setActiveExportMenuMsgId] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  // Document and presentation visual style customizer
  const [customizingDoc, setCustomizingDoc] = useState<{
    doc: CreatedDocument;
    fallbackText?: string;
  } | null>(null);
  const [customizingSlides, setCustomizingSlides] = useState<CreatedSlides | null>(null);

  // Stop speech recognition and synthesis on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch { }
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speech-to-Text handler
  const toggleVoiceRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Browser tidak mendukung Speech-to-Text", {
        description:
          "Fitur ini memerlukan browser berbasis Chromium (Google Chrome, Edge) atau Safari terbaru.",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "id-ID";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("Mendengarkan suara...", {
          description: "Bicaralah sekarang. Suara akan otomatis dikonversi ke teks.",
        });
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputPrompt((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript.trim()}` : transcript.trim();
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error !== "no-speech") {
          toast.error("Gagal merekam suara: " + event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      toast.error("Gagal memulai mikrofon: " + err.message);
    }
  };

  // Text-to-Speech handler
  const handleToggleSpeechSynthesis = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Browser tidak mendukung Text-to-Speech.");
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Strip markdown code blocks, URLs, bold tags for natural speech
    const cleanSpeechText = text
      .replace(/```[\s\S]*?```/g, " Bagian kode program dilewati. ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .replace(/[*_#~>]/g, "")
      .replace(/\{[\s\S]*?\}/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanSpeechText) {
      toast.info("Tidak ada teks yang dapat dibacakan.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.lang = "id-ID";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(
      (v) => v.lang.startsWith("id") || v.lang.includes("ID")
    );
    if (idVoice) {
      utterance.voice = idVoice;
    }

    utterance.onstart = () => {
      setSpeakingMessageId(msgId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Generate clean Blob URL for PDF preview in modal
  useEffect(() => {
    if (!previewFile) {
      if (previewPdfBlobUrl && previewPdfBlobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewPdfBlobUrl);
      }
      setPreviewPdfBlobUrl(null);
      return;
    }

    const isPdf =
      previewFile.type === "pdf" ||
      previewFile.name.toLowerCase().endsWith(".pdf");

    if (isPdf && previewFile.dataUrl) {
      const blobUrl = getBlobUrlFromDataUrl(previewFile.dataUrl);
      setPreviewPdfBlobUrl(blobUrl);
    } else {
      setPreviewPdfBlobUrl(null);
    }

    return () => {
      if (previewPdfBlobUrl && previewPdfBlobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewPdfBlobUrl);
      }
    };
  }, [previewFile]);

  // AI Tools & Attachment Menu State
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<"none" | "uploads" | "tools">("none");
  const [isGroundingEnabled, setIsGroundingEnabled] = useState(true);
  const [isGroundingAvailable, setIsGroundingAvailable] = useState(true);
  const [isCheckingGrounding, setIsCheckingGrounding] = useState(false);
  const [isDeepResearchEnabled, setIsDeepResearchEnabled] = useState(false);
  const [isPersonalizationActive, setIsPersonalizationActive] = useState(true);

  // Format Selector Popover State
  const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false);
  const [activeAcceptFilter, setActiveAcceptFilter] = useState<string>(
    ".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.json,.js,.ts,.tsx,.py,.java,.c,.cpp,.html,.css,.csv,image/*,application/pdf,text/*"
  );

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const formatMenuRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load saved Grounding preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedG = localStorage.getItem("ionlearn_grounding_enabled");
      if (savedG !== null) setIsGroundingEnabled(savedG !== "false");
      const savedGA = localStorage.getItem("ionlearn_grounding_available");
      if (savedGA !== null) setIsGroundingAvailable(savedGA !== "false");
    }
  }, []);

  const handleCheckGrounding = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsCheckingGrounding(true);
    try {
      const res = await fetch("/api/ai/chat?check=grounding");
      const data = await res.json();
      if (data.available) {
        setIsGroundingAvailable(true);
        setIsGroundingEnabled(true);
        localStorage.setItem("ionlearn_grounding_available", "true");
        localStorage.setItem("ionlearn_grounding_enabled", "true");
      } else {
        setIsGroundingAvailable(false);
        localStorage.setItem("ionlearn_grounding_available", "false");
      }
    } catch {
      // Retain current state
    } finally {
      setIsCheckingGrounding(false);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentId
          ? {
            ...s,
            messages: s.messages.map((m) =>
              m.isStreaming ? { ...m, isStreaming: false } : m
            ),
          }
          : s
      )
    );
  };

  const handleSelectFormat = (acceptString: string) => {
    setActiveAcceptFilter(acceptString);
    setIsFormatMenuOpen(false);
    setIsToolsMenuOpen(false);
    setActiveSubmenu("none");
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  // Synchronize Tasks and Notes
  useEffect(() => {
    setTasks(loadTasks());
    setNotes(loadNotes());
  }, [propTasks, propNotes]);

  // Close context dropdown & tools menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setIsContextOpen(false);
      }
      if (formatMenuRef.current && !formatMenuRef.current.contains(e.target as Node)) {
        setIsFormatMenuOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsToolsMenuOpen(false);
        setActiveSubmenu("none");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load chat sessions from localStorage
  useEffect(() => {
    let stored: ChatSession[] = [];
    try {
      stored = JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
    } catch {
      stored = [];
    }
    let list =
      stored.length > 0
        ? stored
        : [createSession(initialTaskId, initialNoteId)];

    if (initialTaskId || initialNoteId) {
      const existing = list
        .filter((s) =>
          initialTaskId ? s.taskId === initialTaskId : s.noteId === initialNoteId
        )
        .sort((a, b) => b.updatedAt - a.updatedAt);
      if (existing.length > 0) {
        setCurrentId(existing[0].id);
      } else {
        const s = createSession(initialTaskId, initialNoteId);
        list = [s, ...list];
        setCurrentId(s.id);
      }
    } else {
      const sorted = [...list].sort((a, b) => b.updatedAt - a.updatedAt);
      setCurrentId(sorted[0].id);
    }
    setSessions(list);
    setLoaded(true);

    if (initialPrompt) {
      setInputPrompt(initialPrompt);
    }
  }, [initialTaskId, initialNoteId, initialPrompt]);

  // Persist sessions
  useEffect(() => {
    if (!loaded) return;
    const trimmed = [...sessions]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_SESSIONS);
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed));
    } catch { }
  }, [sessions, loaded]);

  const current = sessions.find((s) => s.id === currentId);
  const messages = current?.messages ?? [];
  const currentMode: StudyMode = current?.studyMode || "socratic";
  const activeTask = tasks.find((t) => t.id === current?.taskId);
  const activeNote = notes.find((n) => n.id === current?.noteId);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading, currentId]);

  const handleNewChat = (taskId?: string, noteId?: string) => {
    const preferredMode = userPreferences?.defaultStudyMode || currentMode || "socratic";
    const newSession = createSession(taskId, noteId, preferredMode);
    setSessions((prev) => [newSession, ...prev]);
    setCurrentId(newSession.id);
    setIsHistoryDrawerOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSetStudyMode = (mode: StudyMode) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === currentId ? { ...s, studyMode: mode } : s))
    );
  };

  const handleSelectTaskContext = (taskId: string | undefined) => {
    if (taskId) {
      const current = sessions.find((s) => s.id === currentId);
      if (current?.taskId === taskId) {
        setIsContextOpen(false);
        return;
      }
      if (current && current.messages.length === 0) {
        setSessions((prev) =>
          prev.map((s) => (s.id === currentId ? { ...s, taskId, noteId: undefined } : s))
        );
      } else {
        const existing = sessions.find((s) => s.taskId === taskId);
        if (existing) {
          setCurrentId(existing.id);
        } else {
          const preferredMode = userPreferences?.defaultStudyMode || currentMode || "socratic";
          const newSession = createSession(taskId, undefined, preferredMode);
          setSessions((prev) => [newSession, ...prev]);
          setCurrentId(newSession.id);
        }
      }
    } else {
      const current = sessions.find((s) => s.id === currentId);
      if (current && current.messages.length === 0) {
        setSessions((prev) =>
          prev.map((s) => (s.id === currentId ? { ...s, taskId: undefined } : s))
        );
      } else {
        const preferredMode = userPreferences?.defaultStudyMode || currentMode || "socratic";
        const newSession = createSession(undefined, undefined, preferredMode);
        setSessions((prev) => [newSession, ...prev]);
        setCurrentId(newSession.id);
      }
    }
    setIsContextOpen(false);
  };

  const handleSelectNoteContext = (noteId: string | undefined) => {
    if (noteId) {
      const current = sessions.find((s) => s.id === currentId);
      if (current?.noteId === noteId) {
        setIsContextOpen(false);
        return;
      }
      if (current && current.messages.length === 0) {
        setSessions((prev) =>
          prev.map((s) => (s.id === currentId ? { ...s, noteId, taskId: undefined } : s))
        );
      } else {
        const existing = sessions.find((s) => s.noteId === noteId);
        if (existing) {
          setCurrentId(existing.id);
        } else {
          const preferredMode = userPreferences?.defaultStudyMode || currentMode || "socratic";
          const newSession = createSession(undefined, noteId, preferredMode);
          setSessions((prev) => [newSession, ...prev]);
          setCurrentId(newSession.id);
        }
      }
    } else {
      const current = sessions.find((s) => s.id === currentId);
      if (current && current.messages.length === 0) {
        setSessions((prev) =>
          prev.map((s) => (s.id === currentId ? { ...s, noteId: undefined } : s))
        );
      } else {
        const preferredMode = userPreferences?.defaultStudyMode || currentMode || "socratic";
        const newSession = createSession(undefined, undefined, preferredMode);
        setSessions((prev) => [newSession, ...prev]);
        setCurrentId(newSession.id);
      }
    }
    setIsContextOpen(false);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = sessions.filter((s) => s.id !== sessionId);
    if (remaining.length === 0) {
      const fresh = createSession();
      setSessions([fresh]);
      setCurrentId(fresh.id);
    } else {
      setSessions(remaining);
      if (currentId === sessionId) {
        setCurrentId(remaining[0].id);
      }
    }
    toast.info("Riwayat percakapan dihapus");
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Teks berhasil disalin");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick Action: Export AI answer to Study Notes
  const handleExportToNotes = (msg: ChatMessage | string) => {
    const messageContent = typeof msg === "string" ? msg : msg.content;
    const cleanContent = messageContent.replace(/```json[\s\S]*?```/g, "").trim();

    if (typeof msg !== "string" && msg.createdNote) {
      const rawTitle = msg.createdNote.title || "";
      const rawContent = msg.createdNote.content || cleanContent || messageContent;
      const newNote: StudyNote = {
        id: `note-${Date.now()}`,
        title: rawTitle,
        content: rawContent,
        subject: msg.createdNote.subject || activeTask?.courseName || activeNote?.subject || "",
        tags: Array.isArray(msg.createdNote.tags) ? msg.createdNote.tags : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addNote(newNote);
      setNotes(loadNotes());
      toast.success("Tersimpan di Catatan Belajar!", {
        description: `"${newNote.title}" berhasil ditambahkan ke halaman Catatan.`,
        action: { label: "Buka Catatan", onClick: () => router.push("/notes") },
      });
      return;
    }

    const noteTitle = activeTask
      ? `Catatan: ${activeTask.title}`
      : activeNote
        ? `Lanjutan: ${activeNote.title}`
        : `Catatan Materi (${new Date().toLocaleDateString("id-ID")})`;

    const newNote: StudyNote = {
      id: `note-${Date.now()}`,
      title: noteTitle,
      content: cleanContent || messageContent,
      subject: activeTask?.courseName || activeNote?.subject || "",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addNote(newNote);
    setNotes(loadNotes());
    toast.success("Tersimpan di Catatan Belajar!", {
      description: `"${newNote.title}" berhasil ditambahkan ke halaman Catatan.`,
      action: {
        label: "Buka Catatan",
        onClick: () => router.push("/notes"),
      },
    });
  };

  // Quick Action: Export AI action items to Personal To-Do
  const handleExportToTodo = (msg: ChatMessage | string) => {
    if (typeof msg !== "string" && msg.createdTodo) {
      const rawSubtasks = Array.isArray(msg.createdTodo.subtasks) ? msg.createdTodo.subtasks : [];
      const formattedSubtasks = rawSubtasks.map((st: any, idx: number) => ({
        id: `sub-${Date.now()}-${idx}`,
        title: typeof st === "string" ? st : st.title || `Langkah ${idx + 1}`,
        isCompleted: false,
      }));

      const newTodo: PersonalTodo = {
        id: `todo-${Date.now()}`,
        title: msg.createdTodo.title,
        description: msg.createdTodo.description || "",
        isCompleted: false,
        priority: msg.createdTodo.priority || "medium",
        category: msg.createdTodo.category || activeTask?.courseName || "Belajar AI",
        subtasks: formattedSubtasks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addTodo(newTodo);
      toast.success("Ditambahkan ke To-Do List!", {
        description: formattedSubtasks.length > 0
          ? `"${newTodo.title}" dibuat dengan ${formattedSubtasks.length} sub-langkah.`
          : `"${newTodo.title}" berhasil dimasukkan ke daftar tugas harian.`,
        action: { label: "Buka To-Do", onClick: () => router.push("/todo") },
      });
      return;
    }

    const messageContent = typeof msg === "string" ? msg : msg.content;
    const cleanContent = messageContent.replace(/```json[\s\S]*?```/g, "").trim();
    const lines = cleanContent.split("\n").map(l => l.trim()).filter(Boolean);
    const firstLine = lines.find(l => l.length > 3 && !l.startsWith("{") && !l.includes('"title"')) || "Tugas dari AI Chat";
    const cleanTitle = firstLine.replace(/^[#*->.\d\s]+/, "").replace(/["'{}]/g, "").slice(0, 80);

    // Extract potential subtasks from bullets/numbered lines
    const subtaskLines = lines
      .filter(l => (/^[*-]\s+/.test(l) || /^\d+\.\s+/.test(l)) && !l.includes('"'))
      .map((l, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        title: l.replace(/^[*-]\s+/, "").replace(/^\d+\.\s+/, "").replace(/\*\*/g, "").slice(0, 100),
        isCompleted: false,
      }))
      .slice(0, 8);

    const newTodo: PersonalTodo = {
      id: `todo-${Date.now()}`,
      title: cleanTitle,
      description: cleanContent.slice(0, 300),
      isCompleted: false,
      priority: "medium",
      category: activeTask?.courseName || "Belajar AI",
      subtasks: subtaskLines.length > 0 ? subtaskLines : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTodo(newTodo);
    toast.success("Ditambahkan ke To-Do List!", {
      description: subtaskLines.length > 0
        ? `"${newTodo.title}" dibuat dengan ${subtaskLines.length} sub-langkah.`
        : `"${newTodo.title}" berhasil dimasukkan ke daftar tugas harian.`,
      action: {
        label: "Buka To-Do",
        onClick: () => router.push("/todo"),
      },
    });
  };

  // Quick Action: Export AI message to Word (.docx), PDF (.pdf), or Excel (.xlsx)
  const handleExportDocument = async (msg: ChatMessage, format: "pdf" | "docx" | "xlsx") => {
    try {
      setExportingFormat(`${msg.id}-${format}`);
      const cleanContent = msg.content.replace(/```json[\s\S]*?```/g, "").trim();
      const isFiller = (t?: string) => {
        if (!t || t.trim().length < 200) return true;
        const l = t.toLowerCase().trim();
        return (
          (l.startsWith("tentu saja") || l.startsWith("halo") || l.startsWith("hai") || l.startsWith("berikut adalah") || l.startsWith("saya telah") || l.startsWith("aku telah")) &&
          !t.includes("\n#") &&
          t.length < 400
        );
      };

      let finalContent = cleanContent;
      if (msg.createdDocument?.content && !isFiller(msg.createdDocument.content)) {
        finalContent = msg.createdDocument.content;
      } else if (isFiller(cleanContent)) {
        const currentIdx = messages.findIndex((mItem: ChatMessage) => mItem.id === msg.id);
        const searchRange = currentIdx >= 0 ? messages.slice(0, currentIdx) : messages;
        const prevRich = [...searchRange].reverse().find(
          (mItem: ChatMessage) => mItem.role === "assistant" && mItem.content && !isFiller(mItem.content) && mItem.content.length > 250
        );
        if (prevRich) {
          finalContent = prevRich.content.replace(/```json[\s\S]*?```/g, "").trim();
        } else if (msg.createdDocument?.content && msg.createdDocument.content.trim().length > 30) {
          finalContent = msg.createdDocument.content;
        } else if (activeTask && activeTask.description && activeTask.description.trim().length > 30) {
          finalContent = `# ${activeTask.title || "Tugas"}\n\n## Informasi Tugas & Topik\n- **Topik / Mata Pelajaran:** ${activeTask.courseName || "-"}\n- **Judul Tugas:** ${activeTask.title || "-"}\n${activeTask.dueDateStr ? `- **Batas Waktu:** ${activeTask.dueDateStr}\n` : ""}\n## Deskripsi & Rincian Praktikum\n${activeTask.description}`;
        }
      }

      const contentLines = finalContent.split("\n").map((l: string) => l.trim()).filter(Boolean);
      const heading = contentLines.find((l: string) => l.startsWith("#"));
      const title =
        heading ? heading.replace(/^[#\s*]+/, "").trim().slice(0, 80) : activeTask?.title || msg.createdDocument?.title || "Dokumen Materi AI";
      const fileName = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.${format}`;

      if (format === "pdf") {
        const blob = await generatePdfDocument({
          title,
          content: finalContent,
          subject: msg.createdDocument?.subject || activeTask?.courseName,
          fileName,
        });
        triggerFileDownload(blob, fileName);
        toast.success("📄 File PDF Berhasil Dibuat!", {
          description: `Tersimpan sebagai ${fileName}`,
        });
      } else if (format === "xlsx") {
        const blob = await generateXlsxDocument({
          title,
          content: finalContent,
          subject: msg.createdDocument?.subject || activeTask?.courseName,
          fileName,
        });
        triggerFileDownload(blob, fileName);
        toast.success("📊 File Excel (.xlsx) Berhasil Dibuat!", {
          description: `Tersimpan sebagai ${fileName}`,
        });
      } else {
        const blob = await generateWordDocument({
          title,
          content: finalContent,
          subject: msg.createdDocument?.subject || activeTask?.courseName,
          fileName,
        });
        triggerFileDownload(blob, fileName);
        toast.success("📝 File Word (.docx) Berhasil Dibuat!", {
          description: `Tersimpan sebagai ${fileName}`,
        });
      }
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error(`Gagal membuat file ${format.toUpperCase()}`, {
        description: err.message || "Terjadi kesalahan pembuatan dokumen.",
      });
    } finally {
      setExportingFormat(null);
      setActiveExportMenuMsgId(null);
    }
  };

  // Extract or parse slide deck from message with rich pedagogical structure
  const extractSlidesFromMessage = (
    msg: ChatMessage,
    activeTaskTitle?: string,
    courseName?: string
  ): CreatedSlides => {
    if (msg.createdSlides) {
      return msg.createdSlides;
    }

    const cleanContent = msg.content.replace(/```json[\s\S]*?```/g, "").trim();
    const lines = cleanContent.split("\n").map((l) => l.trim()).filter(Boolean);
    const title =
      activeTaskTitle ||
      lines.find((l) => l.startsWith("#"))?.replace(/^[#\s*]+/, "").trim() ||
      "Materi Presentasi AI";
    const subtitle = courseName
      ? `Mata Pelajaran: ${courseName}`
      : lines.find((l) => !l.startsWith("#") && l.length > 15 && l.length < 90)?.replace(/^[-*•]+\s*/, "") ||
      "Ringkasan Materi Pembelajaran Komprehensif";

    const sections = cleanContent.split(/(?:^|\n)(?=#+\s*)/);
    const slides: { title: string; bullets: string[]; notes?: string }[] = [];

    for (const sec of sections) {
      const secLines = sec.trim().split("\n").map((l) => l.trim()).filter(Boolean);
      if (secLines.length === 0) continue;
      const slideTitle = secLines[0].replace(/^[#\s*]+/, "").slice(0, 70);
      const bullets: string[] = [];
      for (let i = 1; i < secLines.length; i++) {
        const l = secLines[i];
        if (/^[-*•\d\.]\s+/.test(l)) {
          bullets.push(l.replace(/^[-*•\d\.]\s+/, ""));
        } else if (bullets.length < 5 && l.length > 5 && !l.startsWith("#")) {
          bullets.push(l);
        }
      }
      if (slideTitle && bullets.length > 0) {
        slides.push({
          title: slideTitle,
          bullets: bullets.slice(0, 5),
          notes: `Fokus pembahasan: ${slideTitle}. Jelaskan poin-poin penting secara mendalam dan interaktif.`,
        });
      }
    }

    if (slides.length === 0) {
      slides.push({
        title: "Ringkasan Materi",
        bullets: lines.filter((l) => l.length > 10).slice(0, 5),
        notes: "Ringkasan intisari materi pembelajaran.",
      });
    }

    // Prepend an Agenda slide if we have 3 or more slides
    if (slides.length >= 3 && !slides.some((s) => s.title.toLowerCase().includes("agenda") || s.title.toLowerCase().includes("daftar isi"))) {
      const agendaBullets = slides.slice(0, 5).map((s, idx) => `**Topik ${idx + 1}**: ${s.title}`);
      slides.unshift({
        title: "Agenda Pembahasan",
        bullets: agendaBullets,
        notes: "Tinjauan singkat pokok bahasan yang akan dipelajari pada sesi presentasi ini.",
      });
    }

    const fileName = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.pptx`;
    return {
      title,
      subtitle,
      theme: "indigo",
      slides,
      fileName,
      subject: courseName || "Presentasi Materi",
    };
  };

  // Quick Action: Export AI message to PowerPoint presentation (.pptx)
  const handleExportSlides = async (msg: ChatMessage) => {
    try {
      setExportingFormat(`${msg.id}-pptx`);
      const slideDeck = extractSlidesFromMessage(msg, activeTask?.title, activeTask?.courseName);
      await downloadCreatedSlides(slideDeck);
      toast.success("📊 Presentasi PowerPoint (.pptx) Berhasil Diunduh!", {
        description: `Tersimpan sebagai ${slideDeck.fileName || "presentasi.pptx"}`,
      });
    } catch (err: any) {
      console.error("Export slides error:", err);
      toast.error("Gagal membuat slide PowerPoint", {
        description: err.message || "Terjadi kesalahan.",
      });
    } finally {
      setExportingFormat(null);
      setActiveExportMenuMsgId(null);
    }
  };

  // Open customizer modal directly for message export in any format (pdf, docx, xlsx, pptx)
  const handleCustomizeExport = (msg: ChatMessage, format: "pdf" | "docx" | "xlsx" | "pptx") => {
    setActiveExportMenuMsgId(null);
    if (format === "pptx") {
      const slideDeck = extractSlidesFromMessage(msg, activeTask?.title, activeTask?.courseName);
      setCustomizingSlides(slideDeck);
      return;
    }

    const isFiller = (t?: string) => {
      if (!t || t.trim().length < 200) return true;
      const l = t.toLowerCase().trim();
      return (
        (l.startsWith("tentu saja") || l.startsWith("halo") || l.startsWith("hai") || l.startsWith("berikut adalah") || l.startsWith("saya telah") || l.startsWith("aku telah")) &&
        !t.includes("\n#") &&
        t.length < 400
      );
    };

    let finalContent = msg.content.replace(/```json[\s\S]*?```/g, "").trim();
    if (msg.createdDocument?.content && !isFiller(msg.createdDocument.content)) {
      finalContent = msg.createdDocument.content;
    } else if (isFiller(finalContent)) {
      const currentIdx = messages.findIndex((mItem: ChatMessage) => mItem.id === msg.id);
      const searchRange = currentIdx >= 0 ? messages.slice(0, currentIdx) : messages;
      const prevRich = [...searchRange].reverse().find(
        (mItem: ChatMessage) => mItem.role === "assistant" && mItem.content && !isFiller(mItem.content) && mItem.content.length > 250
      );
      if (prevRich) {
        finalContent = prevRich.content.replace(/```json[\s\S]*?```/g, "").trim();
      }
    }

    const contentLines = finalContent.split("\n").map((l: string) => l.trim()).filter(Boolean);
    const heading = contentLines.find((l: string) => l.startsWith("#"));
    const title =
      heading ? heading.replace(/^[#\s*]+/, "").trim().slice(0, 80) : activeTask?.title || msg.createdDocument?.title || (format === "xlsx" ? "Tabel Data AI" : "Dokumen Materi AI");
    const fileName = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.${format}`;

    setCustomizingDoc({
      doc: {
        type: format,
        title,
        content: finalContent,
        subject: msg.createdDocument?.subject || activeTask?.courseName,
        fileName,
      },
      fallbackText: finalContent,
    });
  };

  const handleGenerateImageForMessage = (msg: ChatMessage) => {
    setActiveExportMenuMsgId(null);
    const cleanContent = msg.content.replace(/```json[\s\S]*?```/g, "").trim();
    const firstLine = cleanContent.split("\n")[0]?.replace(/^[#*-\s]+/, "").slice(0, 60) || "materi ini";
    handleSendMessage(`Tolong buatkan gambar ilustrasi visual diagram untuk: ${firstLine}`);
  };

  const handleInsertWorkspaceLink = (autoSend: boolean = false) => {
    const trimmed = workspaceUrlInput.trim();
    if (!trimmed) {
      toast.error("Masukkan link Google Workspace terlebih dahulu.");
      return;
    }

    const parsed = parseGoogleWorkspaceUrl(trimmed);
    const badge = getWorkspaceBadge(parsed?.type || "drive");

    setIsWorkspaceModalOpen(false);
    setWorkspaceUrlInput("");

    if (autoSend) {
      handleSendMessage(`Tolong baca dan analisa materi dari link ${badge.label} ini:\n${trimmed}`);
    } else {
      setInputPrompt((prev) => {
        const prefix = prev.trim() ? `${prev.trim()}\n` : "";
        return `${prefix}${trimmed} `;
      });
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      toast.success(`Link ${badge.label} berhasil disisipkan ke pesan!`, {
        description: "AI akan otomatis mengunduh & membaca isi dokumen ini saat dikirim.",
      });
    }
  };

  // Fetch YouTube metadata preview when input changes
  useEffect(() => {
    const trimmed = youtubeUrlInput.trim();
    if (!trimmed) {
      setYoutubeMetaPreview(null);
      setIsLoadingYouTubeMeta(false);
      return;
    }
    const parsed = parseYouTubeUrl(trimmed);
    if (!parsed) {
      setYoutubeMetaPreview(null);
      setIsLoadingYouTubeMeta(false);
      return;
    }

    setYoutubeMetaPreview(parsed);
    setIsLoadingYouTubeMeta(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/youtube/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: parsed.canonicalUrl, includeTranscript: false }),
        });
        if (res.ok) {
          const data = await res.json();
          setYoutubeMetaPreview(data);
        }
      } catch (err) {
        console.warn("Could not fetch YouTube info:", err);
      } finally {
        setIsLoadingYouTubeMeta(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [youtubeUrlInput]);

  const handleInsertYouTubeVideo = (autoSend: boolean = false) => {
    const trimmed = youtubeUrlInput.trim();
    if (!trimmed) {
      toast.error("Masukkan URL video YouTube terlebih dahulu.");
      return;
    }

    const parsed = parseYouTubeUrl(trimmed);
    if (!parsed) {
      toast.error("Format tautan YouTube tidak valid.");
      return;
    }

    const videoInfo: YouTubeVideoInfo = youtubeMetaPreview || parsed;
    const attachment: AttachedFile = {
      name: videoInfo.title || `Video YouTube (${videoInfo.videoId})`,
      size: 0,
      type: "youtube",
      youtubeInfo: videoInfo,
    };

    setIsYouTubeModalOpen(false);
    setYoutubeUrlInput("");
    setYoutubeMetaPreview(null);

    let promptText = "";
    if (youtubeAnalysisPreset === "summary") {
      promptText = `Tolong tonton dan analisa video YouTube "${videoInfo.title || videoInfo.canonicalUrl}". Uraikan ringkasan materi, konsep kunci yang diajarkan, dan pesan utamanya.`;
    } else if (youtubeAnalysisPreset === "timestamps") {
      promptText = `Tolong bedah video YouTube "${videoInfo.title || videoInfo.canonicalUrl}" berdasarkan garis waktu (timestamps). Petakan alur materi penting dalam format [MM:SS].`;
    } else if (youtubeAnalysisPreset === "quiz") {
      promptText = `Tolong buatkan 3-5 latihan soal / kuis pemahaman konsep berdasarkan materi video YouTube "${videoInfo.title || videoInfo.canonicalUrl}", lengkap dengan opsi dan pembahasan.`;
    } else if (youtubeAnalysisPreset === "notes") {
      promptText = `Tolong susun catatan materi belajar terstruktur dari video YouTube "${videoInfo.title || videoInfo.canonicalUrl}" dan simpan ke catatan materi.`;
    }

    const nextAttachments = [...attachedFiles, attachment];
    if (autoSend) {
      setAttachedFiles(nextAttachments);
      handleSendMessage(promptText, nextAttachments);
    } else {
      setAttachedFiles(nextAttachments);
      setInputPrompt((prev) => {
        const prefix = prev.trim() ? `${prev.trim()}\n` : "";
        return `${prefix}${promptText || videoInfo.canonicalUrl} `;
      });
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      toast.success("Video YouTube berhasil dilampirkan!", {
        description: "AI siap membuka dan menganalisis video pembelajaran ini.",
      });
    }
  };

  const handlePrevSlide = (msgId: string, totalSlides: number) => {
    setActiveSlideIndices((prev) => {
      const current = prev[msgId] || 0;
      return { ...prev, [msgId]: (current - 1 + totalSlides) % totalSlides };
    });
  };

  const handleNextSlide = (msgId: string, totalSlides: number) => {
    setActiveSlideIndices((prev) => {
      const current = prev[msgId] || 0;
      return { ...prev, [msgId]: (current + 1) % totalSlides };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const isImage =
        file.type.startsWith("image/") ||
        /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name);
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (isImage) {
        try {
          const { dataUrl, size } = await compressImageIfNeeded(file);
          if (dataUrl) {
            setAttachedFiles((prev) => [
              ...prev,
              {
                name: file.name,
                size: size || file.size,
                type: "image",
                dataUrl,
              },
            ]);
            toast.success(`Foto "${file.name}" siap dianalisis`);
          }
        } catch {
          toast.error(`Gagal memuat gambar "${file.name}"`);
        }
      } else if (isPdf) {
        if (file.size > 20 * 1024 * 1024) {
          toast.error(
            `Ukuran PDF "${file.name}" terlalu besar (maksimal 20 MB)`
          );
          continue;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const dataUrl = event.target?.result as string;
            if (!dataUrl) {
              toast.error(`Gagal membaca file PDF "${file.name}"`);
              return;
            }

            setAttachedFiles((prev) => [
              ...prev,
              {
                name: file.name,
                size: file.size,
                type: "pdf",
                dataUrl,
              },
            ]);

            toast.success(`PDF "${file.name}" terlampir`, {
              description: "Siap dianalisis oleh AI.",
            });
          } catch {
            toast.error(`Gagal memproses file PDF "${file.name}"`);
          }
        };
        reader.onerror = () => {
          toast.error(`Gagal membaca file PDF "${file.name}"`);
        };
        reader.readAsDataURL(file);
      } else {
        if (file.size > MAX_FILE_BYTES) {
          toast.error(`Ukuran file "${file.name}" terlalu besar`, {
            description: "Batas ukuran dokumen teks adalah 1.5 MB.",
          });
          continue;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const rawContent = (event.target?.result as string) || "";
            const cleanContent = rawContent
              .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "")
              .trim();

            if (!cleanContent) {
              toast.error(`File "${file.name}" tidak dapat dibaca`, {
                description:
                  "Pastikan file berupa teks, dokumen markdown, atau kode sumber.",
              });
              return;
            }

            const truncated =
              cleanContent.length > MAX_FILE_CHARS
                ? cleanContent.slice(0, MAX_FILE_CHARS) +
                "\n\n... [Konten dipotong agar pas dengan konteks AI]"
                : cleanContent;

            const isCode =
              /\.(js|ts|tsx|jsx|py|java|c|cpp|cs|php|html|css|json|sql|sh|go|rs|rb)$/i.test(
                file.name
              );

            setAttachedFiles((prev) => [
              ...prev,
              {
                name: file.name,
                size: file.size,
                type: isCode ? "code" : "doc",
                extractedText: truncated,
              },
            ]);

            toast.success(`File "${file.name}" terlampir`, {
              description: formatFileSize(file.size),
            });
          } catch {
            toast.error(`Gagal memproses file "${file.name}"`);
          }
        };
        reader.onerror = () => {
          toast.error(`Gagal membaca file "${file.name}"`);
        };
        reader.readAsText(file);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const dismissedYouTubeIds = useRef<Set<string>>(new Set());

  const handleRemoveAttachment = (index: number) => {
    const file = attachedFiles[index];
    if (file?.type === "youtube" && file.youtubeInfo?.videoId) {
      dismissedYouTubeIds.current.add(file.youtubeInfo.videoId);
    }
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const autoDetectAndAttachYouTube = useCallback(
    (urlOrText: string) => {
      const urls = extractYouTubeUrls(urlOrText);
      if (urls.length === 0) return false;

      const targetUrl = urls[0];
      const parsed = parseYouTubeUrl(targetUrl);
      if (!parsed) return false;

      if (dismissedYouTubeIds.current.has(parsed.videoId)) return false;
      const isAlreadyAttached = attachedFiles.some(
        (f) => f.type === "youtube" && f.youtubeInfo?.videoId === parsed.videoId
      );
      if (isAlreadyAttached) return false;

      const newAttachment: AttachedFile = {
        name: `Video YouTube (${parsed.videoId})`,
        size: 0,
        type: "youtube",
        youtubeInfo: parsed,
      };

      setAttachedFiles((prev) => {
        if (prev.some((f) => f.type === "youtube" && f.youtubeInfo?.videoId === parsed.videoId)) {
          return prev;
        }
        return [...prev, newAttachment];
      });

      toast.success("Video YouTube Terdeteksi!", {
        description: "Video otomatis dilampirkan dan siap dianalisis oleh AI.",
      });

      fetch("/api/youtube/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: parsed.canonicalUrl, includeTranscript: false }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.title) {
            setAttachedFiles((prev) =>
              prev.map((f) => {
                if (f.type === "youtube" && f.youtubeInfo?.videoId === parsed.videoId) {
                  return {
                    ...f,
                    name: data.title,
                    youtubeInfo: {
                      ...f.youtubeInfo,
                      title: data.title,
                      authorName: data.authorName,
                      thumbnailUrl: data.thumbnailUrl,
                    },
                  };
                }
                return f;
              })
            );
          }
        })
        .catch((err) => console.warn("Failed fetching auto-detected YouTube metadata:", err));

      return true;
    },
    [attachedFiles]
  );

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;

    const urls = extractYouTubeUrls(text);
    if (urls.length > 0) {
      const parsed = parseYouTubeUrl(urls[0]);
      if (parsed) {
        dismissedYouTubeIds.current.delete(parsed.videoId);

        // If pasted content is solely a YouTube link, attach cleanly without cluttering textarea
        if (text.trim() === urls[0].trim()) {
          e.preventDefault();
          autoDetectAndAttachYouTube(urls[0]);
          return;
        }

        autoDetectAndAttachYouTube(urls[0]);
      }
    }
  };

  // Auto-detect YouTube URLs when typing or editing textarea input
  useEffect(() => {
    if (!inputPrompt.trim()) return;

    const urls = extractYouTubeUrls(inputPrompt);
    if (urls.length === 0) return;

    const firstUrl = urls[0];
    const parsed = parseYouTubeUrl(firstUrl);
    if (!parsed) return;

    if (dismissedYouTubeIds.current.has(parsed.videoId)) return;
    if (attachedFiles.some((f) => f.type === "youtube" && f.youtubeInfo?.videoId === parsed.videoId)) {
      return;
    }

    const timer = setTimeout(() => {
      const attached = autoDetectAndAttachYouTube(firstUrl);
      if (attached && inputPrompt.trim() === firstUrl.trim()) {
        setInputPrompt("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [inputPrompt, attachedFiles, autoDetectAndAttachYouTube]);

  // Textarea input and @mention detector
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputPrompt(val);

    // Auto resize
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleSendMessage = async (customPrompt?: string, overrideAttachments?: AttachedFile[]) => {
    const activeAttachedFiles = overrideAttachments !== undefined ? overrideAttachments : attachedFiles;
    let userPromptText = (customPrompt || inputPrompt).trim();
    if (!userPromptText && activeAttachedFiles.length === 0) return;
    if (isLoading) return;

    // Build the AI prompt with attached file context safely
    let defaultPrompt = "Tolong analisa dokumen/materi yang saya lampirkan ini.";
    if (activeAttachedFiles.some((f) => f.type === "youtube")) {
      const yt = activeAttachedFiles.find((f) => f.type === "youtube");
      defaultPrompt = `Tolong buka dan analisa video YouTube "${yt?.youtubeInfo?.title || yt?.name}":\nLink: ${yt?.youtubeInfo?.canonicalUrl || yt?.name}\n\nBerikan analisis materi mendalam, rangkuman konsep kunci, garis waktu (timestamps), dan pertanyaan kuis evaluasi pemahaman.`;
    } else if (activeAttachedFiles.some((f) => f.type === "image")) {
      defaultPrompt =
        "Tolong analisa dan jelaskan foto/gambar yang saya lampirkan ini.";
    } else if (activeAttachedFiles.some((f) => f.type === "pdf")) {
      defaultPrompt =
        "Tolong analisa dan jelaskan isi materi dari file PDF yang saya lampirkan ini.";
    }

    let aiPromptPayload = userPromptText || defaultPrompt;
    const textDocs = activeAttachedFiles.filter((f) => f.extractedText);
    if (textDocs.length > 0) {
      const fileContext = textDocs
        .map(
          (f) =>
            `--- File Lampiran [${f.type.toUpperCase()}]: ${f.name} (${formatFileSize(f.size)}) ---\n${f.extractedText}\n--- Akhir File ---`
        )
        .join("\n\n");
      aiPromptPayload = `${aiPromptPayload}\n\n[Dokumen/File Terlampir]:\n${fileContext}`;
    }

    let contextualTask = activeTask;
    if (!contextualTask && activeNote) {
      contextualTask = {
        id: activeNote.id,
        title: activeNote.title || "Catatan Materi",
        description: `${activeNote.content || ""}\n\n${activeNote.summary ? `Rangkuman:\n${activeNote.summary}` : ""
          }`,
        courseName: activeNote.subject || "Catatan Materi",
        isCompleted: false,
        priority: "medium",
        syncSource: "manual",
        createdAt: activeNote.createdAt,
        updatedAt: activeNote.updatedAt || activeNote.createdAt,
      };
    }

    const currentAttachments: ChatAttachment[] = activeAttachedFiles.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      dataUrl: f.dataUrl,
      extractedText: f.extractedText,
      youtubeInfo: f.youtubeInfo,
    }));

    // Auto-detect inline YouTube links typed or pasted in prompt
    const inlineYt = extractYouTubeUrls(userPromptText);
    if (inlineYt.length > 0 && !currentAttachments.some((a) => a.type === "youtube")) {
      const parsedInline = parseYouTubeUrl(inlineYt[0]);
      if (parsedInline) {
        currentAttachments.push({
          name: `Video YouTube (${parsedInline.videoId})`,
          size: 0,
          type: "youtube",
          youtubeInfo: parsedInline,
        });
      }
    }

    setInputPrompt("");
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Store clean display text in chat history (so huge file dump doesn't freeze the DOM or localStorage)
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content:
        userPromptText ||
        (currentAttachments.some((f) => f.type === "youtube")
          ? `Analisis Video YouTube: ${currentAttachments.find((f) => f.type === "youtube")?.youtubeInfo?.title || "Video Pembelajaran"}`
          : currentAttachments.some((f) => f.type === "image")
            ? "Analisis Foto/Gambar"
            : "Analisis Dokumen Terlampir"),
      attachments: currentAttachments.map((a) => ({
        name: a.name,
        size: a.size,
        type: a.type,
        dataUrl: a.dataUrl,
        extractedText: a.extractedText,
        youtubeInfo: a.youtubeInfo,
      })),
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMessage];

    const assistantMsgId = `msg-${Date.now() + 1}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      isStreaming: true,
      streamStage: "analyzing",
      streamStageDetail: "Menganalisis pertanyaan & konteks materi...",
      thoughtProcess: "",
      timestamp: Date.now(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentId
          ? { ...s, messages: [...nextMessages, assistantPlaceholder], updatedAt: Date.now() }
          : s
      )
    );

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    // If inline YouTube URLs were present in user prompt, fetch metadata to enrich the message card in UI
    if (inlineYt.length > 0) {
      const parsedInline = parseYouTubeUrl(inlineYt[0]);
      if (parsedInline) {
        fetch("/api/youtube/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: parsedInline.canonicalUrl, includeTranscript: false }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.title) {
              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id !== currentId) return s;
                  return {
                    ...s,
                    messages: s.messages.map((msg) => {
                      if (msg.id !== userMessage.id || !msg.attachments) return msg;
                      return {
                        ...msg,
                        attachments: msg.attachments.map((att) => {
                          if (att.type === "youtube" && att.youtubeInfo?.videoId === parsedInline.videoId) {
                            return {
                              ...att,
                              name: data.title,
                              youtubeInfo: {
                                ...att.youtubeInfo,
                                title: data.title,
                                authorName: data.authorName,
                                thumbnailUrl: data.thumbnailUrl,
                              },
                            };
                          }
                          return att;
                        }),
                      };
                    }),
                  };
                })
              );
            }
          })
          .catch(() => { });
      }
    }

    try {
      const chatHistory = nextMessages.map((m, idx) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content:
          idx === nextMessages.length - 1
            ? (isDeepResearchEnabled
              ? `[MODE DEEP RESEARCH AKTIF]: Berikan riset mendalam, tinjau berbagai dimensi materi secara komprehensif, dan sertakan fakta pendukung terstruktur.\n\n${aiPromptPayload}`
              : aiPromptPayload)
            : m.content,
        attachments:
          idx === nextMessages.length - 1 ? currentAttachments : undefined,
      }));

      const res = await sendChatMessageToAIStream(
        chatHistory,
        {
          onStatus: (stage, detail, searchQueries) => {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === currentId
                  ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                          ...m,
                          streamStage: stage,
                          streamStageDetail: detail,
                          ...(searchQueries && searchQueries.length > 0
                            ? { streamSearchQueries: searchQueries }
                            : {}),
                        }
                        : m
                    ),
                  }
                  : s
              )
            );
          },
          onThought: (_delta, accumulated) => {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === currentId
                  ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                          ...m,
                          thoughtProcess: accumulated,
                          streamStage: "thinking",
                          streamStageDetail: "Memverifikasi data & merumuskan analisis...",
                        }
                        : m
                    ),
                  }
                  : s
              )
            );
          },
          onChunk: (_delta, accumulated) => {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === currentId
                  ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                          ...m,
                          content: accumulated,
                          isStreaming: true,
                          streamStage: "answering",
                          streamStageDetail: "Menyusun jawaban terstruktur...",
                        }
                        : m
                    ),
                  }
                  : s
              )
            );
          },
          onGrounding: (sources) => {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === currentId
                  ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? { ...m, groundingSources: sources }
                        : m
                    ),
                  }
                  : s
              )
            );
          },
          onGroundingStatus: (available) => {
            if (!available) {
              setIsGroundingAvailable(false);
              localStorage.setItem("ionlearn_grounding_available", "false");
            }
          },
          signal: abortControllerRef.current?.signal,
        },
        contextualTask,
        isPersonalizationActive ? userPreferences : null,
        aiConfig,
        currentMode,
        isGroundingEnabled && isGroundingAvailable
      );

      // Automatically handle Note creation if AI produced createdNote
      let noteCreatedId: string | undefined;
      if (res.createdNote && (res.createdNote.title || res.createdNote.content)) {
        noteCreatedId = `note-${Date.now()}`;
        const newStudyNote: StudyNote = {
          id: noteCreatedId,
          title: res.createdNote.title || "Catatan Materi AI",
          content: res.createdNote.content || res.reply,
          subject: res.createdNote.subject || activeTask?.courseName || activeNote?.subject || "",
          tags: Array.isArray(res.createdNote.tags) ? res.createdNote.tags : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addNote(newStudyNote);
        setNotes(loadNotes());
        try {
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
        } catch { }
        toast.success("📝 Catatan Materi Baru Berhasil Disimpan!", {
          description: `"${newStudyNote.title}" telah ditambahkan ke Catatan Belajar.`,
          action: {
            label: "Buka Catatan",
            onClick: () => router.push("/notes"),
          },
        });
      }

      // Automatically handle To-Do creation if AI produced createdTodo or createdTodos
      let createdTodoObj: any = res.createdTodo;
      if (!createdTodoObj && res.createdTodos && Array.isArray(res.createdTodos) && res.createdTodos.length > 0) {
        if (res.createdTodos.length === 1 && !res.createdTodos[0].subtasks) {
          createdTodoObj = res.createdTodos[0];
        } else {
          // Consolidate multiple items into 1 parent task with subtasks
          const first = res.createdTodos[0];
          const catName = first.category || activeTask?.courseName || "Belajar AI";
          createdTodoObj = {
            title: activeTask?.title ? `Rencana Belajar: ${activeTask.title}` : `Rencana Belajar: ${catName}`,
            description: "Daftar sub-langkah belajar yang dibuat otomatis oleh AI",
            priority: first.priority || "medium",
            category: catName,
            subtasks: res.createdTodos.map((t: any) => ({ title: t.title })),
          };
        }
      }

      if (createdTodoObj && createdTodoObj.title) {
        const rawSubtasks = Array.isArray(createdTodoObj.subtasks) ? createdTodoObj.subtasks : [];
        const formattedSubtasks = rawSubtasks.map((st: any, idx: number) => ({
          id: `sub-${Date.now()}-${idx}`,
          title: typeof st === "string" ? st : st.title || `Langkah ${idx + 1}`,
          isCompleted: false,
        }));

        const newTodo: PersonalTodo = {
          id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: createdTodoObj.title,
          description: createdTodoObj.description || "",
          isCompleted: false,
          priority: createdTodoObj.priority || "medium",
          category: createdTodoObj.category || activeTask?.courseName || "Belajar AI",
          subtasks: formattedSubtasks,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        addTodo(newTodo);
        try {
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
        } catch { }
        toast.success(`✅ Tugas To-Do Berhasil Dibuat!`, {
          description: formattedSubtasks.length > 0
            ? `"${newTodo.title}" dibuat dengan ${formattedSubtasks.length} sub-langkah.`
            : `"${newTodo.title}" telah ditambahkan ke daftar To-Do.`,
          action: {
            label: "Buka To-Do",
            onClick: () => router.push("/todo"),
          },
        });
        createdTodoObj = {
          ...createdTodoObj,
          id: newTodo.id,
          subtasks: formattedSubtasks,
        };
      }

      if (res.createdDocument) {
        toast.success(
          res.createdDocument.type === "pdf"
            ? "📄 File PDF Telah Dibuat!"
            : res.createdDocument.type === "xlsx"
              ? "📊 File Excel (.xlsx) Telah Dibuat!"
              : "📝 File Word Telah Dibuat!",
          {
            description: `"${res.createdDocument.title}" siap diunduh di dalam percakapan.`,
          }
        );
      }
      if (res.createdSlides) {
        toast.success("📊 Slide Presentasi Telah Dibuat!", {
          description: `"${res.createdSlides.title}" dengan ${res.createdSlides.slides?.length ?? 0} slide siap diunduh.`,
        });
      }

      const assistantMessage: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: res.reply,
        thoughtProcess: res.thoughtProcess,
        isStreaming: false,
        createdNote: res.createdNote ? { ...res.createdNote, id: noteCreatedId } : undefined,
        createdTodo: createdTodoObj || undefined,
        createdDocument: res.createdDocument || undefined,
        createdSlides: res.createdSlides || undefined,
        groundingSources: res.groundingSources || undefined,
        timestamp: res.timestamp || Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentId
            ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantMsgId ? assistantMessage : m
              ),
              suggestedPrompts: res.suggestedPrompts || [],
              updatedAt: Date.now(),
            }
            : s
        )
      );
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentId
              ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                      ...m,
                      content: m.content || "*(Jawaban dihentikan)*",
                      isStreaming: false,
                    }
                    : m
                ),
              }
              : s
          )
        );
        return;
      }

      toast.error("Gagal memproses pesan AI", {
        description: err.message || "Periksa koneksi atau API key Anda.",
      });
      const errorMessage: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: `⚠️ Maaf, terjadi kendala saat menghubungi AI: ${err.message || "Gagal memproses permintaan."
          }. Silakan cek konfigurasi API Key di menu Pengaturan.`,
        isStreaming: false,
        isError: true,
        timestamp: Date.now(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentId
            ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantMsgId ? errorMessage : m
              ),
              updatedAt: Date.now(),
            }
            : s
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    if (isLoading) return;
    const msgIdx = messages.findIndex((m) => m.id === messageId);
    if (msgIdx === -1) return;

    const targetMsg = messages[msgIdx];
    let historyToKeep: ChatMessage[] = [];

    if (targetMsg.role === "user") {
      historyToKeep = messages.slice(0, msgIdx + 1);
    } else {
      // Find the latest user message before this assistant message
      for (let i = msgIdx - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          historyToKeep = messages.slice(0, i + 1);
          break;
        }
      }
    }

    if (historyToKeep.length === 0) return;

    const assistantMsgId = `msg-${Date.now() + 1}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      isStreaming: true,
      streamStage: "analyzing",
      streamStageDetail: "Menganalisis pertanyaan & konteks materi...",
      thoughtProcess: "",
      timestamp: Date.now(),
    };

    // Update sessions to roll back to that user message and place streaming assistant placeholder
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentId
          ? {
            ...s,
            messages: [...historyToKeep, assistantPlaceholder],
            updatedAt: Date.now(),
          }
          : s
      )
    );

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      let contextualTask = activeTask;
      if (!contextualTask && activeNote) {
        contextualTask = {
          id: activeNote.id,
          title: activeNote.title || "Catatan Materi",
          description: `${activeNote.content || ""}\n\n${activeNote.summary ? `Rangkuman:\n${activeNote.summary}` : ""}`,
          courseName: activeNote.subject || "Catatan Materi",
          isCompleted: false,
          priority: "medium",
          syncSource: "manual",
          createdAt: activeNote.createdAt,
          updatedAt: activeNote.updatedAt || activeNote.createdAt,
        };
      }

      const apiMessages = historyToKeep.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        attachments: m.attachments,
      }));

      const res = await sendChatMessageToAIStream(
        apiMessages,
        {
          onStatus: (stage, detail, searchQueries) => {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === currentId
                  ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                          ...m,
                          streamStage: stage,
                          streamStageDetail: detail,
                          ...(searchQueries && searchQueries.length > 0
                            ? { streamSearchQueries: searchQueries }
                            : {}),
                        }
                        : m
                    ),
                  }
                  : s
              )
            );
          },
          onThought: (_delta, accumulated) => {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === currentId
                  ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                          ...m,
                          thoughtProcess: accumulated,
                          streamStage: "thinking",
                          streamStageDetail: "Memverifikasi data & merumuskan analisis...",
                        }
                        : m
                    ),
                  }
                  : s
              )
            );
          },
          onChunk: (_delta, accumulated) => {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === currentId
                  ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                          ...m,
                          content: accumulated,
                          isStreaming: true,
                          streamStage: "answering",
                          streamStageDetail: "Menyusun jawaban terstruktur...",
                        }
                        : m
                    ),
                  }
                  : s
              )
            );
          },
          onGrounding: (sources) => {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === currentId
                  ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? { ...m, groundingSources: sources }
                        : m
                    ),
                  }
                  : s
              )
            );
          },
          onGroundingStatus: (available) => {
            if (!available) {
              setIsGroundingAvailable(false);
              localStorage.setItem("ionlearn_grounding_available", "false");
            }
          },
          signal: abortControllerRef.current?.signal,
        },
        contextualTask,
        isPersonalizationActive ? userPreferences : null,
        aiConfig,
        currentMode,
        isGroundingEnabled && isGroundingAvailable
      );

      let noteCreatedId: string | undefined = undefined;
      if (res.createdNote && (res.createdNote.title || res.createdNote.content)) {
        noteCreatedId = `note-${Date.now()}`;
        const newStudyNote: StudyNote = {
          id: noteCreatedId,
          title: res.createdNote.title || "Catatan Materi AI",
          content: res.createdNote.content || res.reply,
          subject: res.createdNote.subject || activeTask?.courseName || activeNote?.subject || "",
          tags: Array.isArray(res.createdNote.tags) ? res.createdNote.tags : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addNote(newStudyNote);
        setNotes(loadNotes());
        try {
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
        } catch { }
        toast.success("📝 Catatan Materi Baru Berhasil Disimpan!", {
          description: `"${newStudyNote.title}" telah ditambahkan ke Catatan Belajar.`,
          action: {
            label: "Buka Catatan",
            onClick: () => router.push("/notes"),
          },
        });
      }

      let createdTodoObj: any = res.createdTodo;
      if (!createdTodoObj && res.createdTodos && Array.isArray(res.createdTodos) && res.createdTodos.length > 0) {
        if (res.createdTodos.length === 1 && !res.createdTodos[0].subtasks) {
          createdTodoObj = res.createdTodos[0];
        } else {
          const first = res.createdTodos[0];
          const catName = first.category || activeTask?.courseName || "Belajar AI";
          createdTodoObj = {
            title: activeTask?.title ? `Rencana Belajar: ${activeTask.title}` : `Rencana Belajar: ${catName}`,
            description: "Daftar sub-langkah belajar yang dibuat otomatis oleh AI",
            priority: first.priority || "medium",
            category: catName,
            subtasks: res.createdTodos.map((t: any) => ({ title: t.title })),
          };
        }
      }

      if (createdTodoObj && createdTodoObj.title) {
        const rawSubtasks = Array.isArray(createdTodoObj.subtasks) ? createdTodoObj.subtasks : [];
        const formattedSubtasks = rawSubtasks.map((st: any, idx: number) => ({
          id: `sub-${Date.now()}-${idx}`,
          title: typeof st === "string" ? st : st.title || `Langkah ${idx + 1}`,
          isCompleted: false,
        }));

        const newTodo: PersonalTodo = {
          id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: createdTodoObj.title,
          description: createdTodoObj.description || "",
          isCompleted: false,
          priority: createdTodoObj.priority || "medium",
          category: createdTodoObj.category || activeTask?.courseName || "Belajar AI",
          subtasks: formattedSubtasks,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        addTodo(newTodo);
        try {
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
        } catch { }
        toast.success(`✅ Tugas To-Do Berhasil Dibuat!`, {
          description: formattedSubtasks.length > 0
            ? `"${newTodo.title}" dibuat dengan ${formattedSubtasks.length} sub-langkah.`
            : `"${newTodo.title}" telah ditambahkan ke daftar To-Do.`,
          action: {
            label: "Buka To-Do",
            onClick: () => router.push("/todo"),
          },
        });
        createdTodoObj = {
          ...createdTodoObj,
          id: newTodo.id,
          subtasks: formattedSubtasks,
        };
      }

      const assistantMessage: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: res.reply,
        thoughtProcess: res.thoughtProcess,
        isStreaming: false,
        createdNote: res.createdNote ? { ...res.createdNote, id: noteCreatedId } : undefined,
        createdTodo: createdTodoObj || undefined,
        createdDocument: res.createdDocument || undefined,
        createdSlides: res.createdSlides || undefined,
        groundingSources: res.groundingSources || undefined,
        timestamp: res.timestamp || Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentId
            ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantMsgId ? assistantMessage : m
              ),
              suggestedPrompts: res.suggestedPrompts || [],
              updatedAt: Date.now(),
            }
            : s
        )
      );
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentId
              ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                      ...m,
                      content: m.content || "*(Jawaban dihentikan)*",
                      isStreaming: false,
                    }
                    : m
                ),
              }
              : s
          )
        );
        return;
      }

      toast.error("Gagal mengirim ulang pesan", {
        description: err.message || "Periksa koneksi atau API key Anda.",
      });
      const errorMessage: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: `⚠️ Maaf, terjadi kendala saat mengirim ulang pesan: ${err.message || "Gagal memproses permintaan."
          }`,
        isStreaming: false,
        isError: true,
        timestamp: Date.now(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentId
            ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantMsgId ? errorMessage : m
              ),
              updatedAt: Date.now(),
            }
            : s
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSessionTitle = (session: ChatSession) => {
    if (session.messages.length > 0) {
      const firstUser = session.messages.find((m) => m.role === "user");
      if (firstUser) {
        return (
          firstUser.content.slice(0, 32) +
          (firstUser.content.length > 32 ? "…" : "")
        );
      }
    }
    if (session.taskId) {
      const t = tasks.find((x) => x.id === session.taskId);
      if (t) return `Tugas: ${t.title.slice(0, 24)}`;
    }
    if (session.noteId) {
      const n = notes.find((x) => x.id === session.noteId);
      if (n) return `Catatan: ${n.title.slice(0, 24)}`;
    }
    return "Percakapan Baru";
  };

  const filteredSessions = useMemo(() => {
    if (!sessionSearchQuery.trim()) return sessions;
    const q = sessionSearchQuery.toLowerCase();
    return sessions.filter((s) => {
      const title = getSessionTitle(s).toLowerCase();
      const hasContent = s.messages.some((m) =>
        m.content.toLowerCase().includes(q)
      );
      return title.includes(q) || hasContent;
    });
  }, [sessions, sessionSearchQuery]);



  const quickPrompts = [
    {
      label: "Jelaskan konsep materi ini dengan analogi sederhana",
      mode: "socratic" as StudyMode,
      icon: Brain,
    },
    {
      label: "Rangkum dan simpan menjadi Catatan Materi lengkap",
      mode: "direct" as StudyMode,
      icon: NotebookPen,
    },
    {
      label: "Buatkan daftar to-do belajar bertahap untuk materi ini",
      mode: "direct" as StudyMode,
      icon: ListTodo,
    },
    {
      label: "Beri 2 contoh soal latihan beserta pembahasannya",
      mode: "quizzer" as StudyMode,
      icon: HelpCircle,
    },
  ];

  // ── RENDER INPUT COMPONENT (Reusable for Center Hero & Bottom Dock) ──
  const renderInputBar = (isCentered: boolean = false) => {
    return (
      <div
        className={`w-full transition-all duration-300 ${isCentered ? "max-w-2xl mx-auto" : "max-w-3xl mx-auto"
          }`}
      >
        {/* Context Chip & Mention Popover Area */}
        <div className="relative mb-2 flex flex-wrap items-center justify-between gap-2">
          {/* Active Context Chip */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeTask ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="max-w-[180px] sm:max-w-[240px] truncate">
                  {activeTask.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectTaskContext(undefined)}
                  className="hover:text-rose-500 ml-0.5 cursor-pointer"
                  title="Lepas konteks tugas"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : activeNote ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
                <NotebookPen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="max-w-[180px] sm:max-w-[240px] truncate">
                  {activeNote.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectNoteContext(undefined)}
                  className="hover:text-rose-500 ml-0.5 cursor-pointer"
                  title="Lepas konteks catatan"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null}

            {/* Attached Files Preview Strip */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pb-2">
                {attachedFiles.map((file, idx) => {
                  if (file.type === "youtube") {
                    return (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2.5 p-1.5 pr-2 rounded-xl text-xs bg-red-50/90 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 shadow-2xs group animate-in fade-in"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center shrink-0 text-white shadow-xs">
                          <Youtube className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 max-w-[150px] sm:max-w-[220px]">
                          <p className="font-semibold truncate text-slate-800 dark:text-[#eee]">
                            {file.youtubeInfo?.title || file.name}
                          </p>
                          <p className="text-[10px] text-red-600 dark:text-red-400 font-medium truncate">
                            {file.youtubeInfo?.authorName || "Video YouTube"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-950/50 cursor-pointer transition"
                          title="Hapus video YouTube ini"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }
                  const badgeInfo = getFileFormatBadge(file.name, file.type);
                  return (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2.5 p-1.5 pr-2 rounded-xl text-xs bg-slate-100 dark:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#333] shadow-2xs group"
                    >
                      {/* Box format label with file icon */}
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className={`p-1.5 rounded-lg shrink-0 flex items-center justify-center cursor-pointer ${badgeInfo.badgeClass}`}
                        title="Klik untuk pratinjau isi file"
                      >
                        <FileText className="w-3.5 h-3.5 text-white" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="font-semibold max-w-[130px] sm:max-w-[180px] truncate hover:underline text-left cursor-pointer text-slate-800 dark:text-[#eee]"
                        title="Klik untuk melihat isi file"
                      >
                        {file.name}
                      </button>

                      <span className="text-xs text-slate-400 shrink-0">
                        ({formatFileSize(file.size)})
                      </span>

                      {/* Eye Preview Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewFile(file)}
                        className="hover:opacity-100 opacity-60 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-[#333] text-indigo-600 dark:text-indigo-400 transition cursor-pointer"
                        title="Lihat isi file"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition"
                        title="Hapus lampiran"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}

                {/* Quick YouTube Action Pills when a YouTube video is attached */}
                {attachedFiles.some((f) => f.type === "youtube") && (
                  <div className="w-full flex flex-wrap items-center gap-1.5 pt-1.5 animate-in fade-in duration-200">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                      <Sparkles className="w-3 h-3 text-red-500" />
                      Analisis Cepat:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSendMessage("Tolong tonton dan rangkum inti materi serta konsep kunci dari video YouTube ini.")}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200/80 dark:border-red-900/50 transition cursor-pointer flex items-center gap-1"
                    >
                      <span>📝 Rangkum Materi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage("Tolong bedah video YouTube ini berdasarkan garis waktu (timestamps [MM:SS]) per topik.")}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200/80 dark:border-red-900/50 transition cursor-pointer flex items-center gap-1"
                    >
                      <span>⏱️ Garis Waktu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage("Tolong buatkan 3-5 latihan soal / kuis pemahaman konsep berdasarkan materi video YouTube ini.")}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200/80 dark:border-red-900/50 transition cursor-pointer flex items-center gap-1"
                    >
                      <span>❓ Buat Kuis</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage("Tolong susun catatan materi terstruktur dari video YouTube ini dan simpan ke catatan belajar.")}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200/80 dark:border-red-900/50 transition cursor-pointer flex items-center gap-1"
                    >
                      <span>📄 Buat Catatan</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input Box Shell */}
        <div className="relative flex flex-col bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-[#262626] rounded-2xl shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/40 transition-all">
          <textarea
            ref={textareaRef}
            rows={isCentered ? 3 : 1}
            value={inputPrompt}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              attachedFiles.some((f) => f.type === "youtube")
                ? `Tanyakan materi tentang "${attachedFiles.find((f) => f.type === "youtube")?.youtubeInfo?.title || "Video YouTube"}"… (atau tekan Enter untuk analisis lengkap)`
                : activeTask
                  ? `Tanyakan tentang tugas "${activeTask.title}"…`
                  : activeNote
                    ? `Tanyakan tentang catatan "${activeNote.title}"…`
                    : "Tanyakan konsep, rumus, lampirkan berkas, atau tempel link YouTube… (Enter untuk kirim)"
            }
            className="w-full bg-transparent border-0 focus:outline-none text-xs sm:text-sm text-slate-900 dark:text-[#ececec] placeholder:text-slate-400 dark:placeholder:text-[#666] pt-3.5 px-3.5 resize-none max-h-40 min-h-[24px] leading-relaxed"
          />

          {/* Action Row inside Textarea */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <div className="flex items-center gap-1 text-slate-400">
              {/* AI Tools & Attachments Floating Menu */}
              <div className="relative" ref={toolsMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsMenuOpen(!isToolsMenuOpen);
                    setActiveSubmenu("none");
                  }}
                  className={`p-1.5 transition-all cursor-pointer rounded-xl flex items-center justify-center ${isToolsMenuOpen
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                    : "text-slate-500 dark:text-[#888] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#222]"
                    }`}
                  title="Menu Alat AI, Pencarian Web & Lampiran"
                >
                  <Plus className={`w-4 h-4 transition-transform duration-200 ${isToolsMenuOpen ? "rotate-45" : ""}`} />
                </button>

                {isToolsMenuOpen && (
                  <div className="absolute left-0 bottom-full mb-2.5 z-50 flex items-end animate-in fade-in slide-in-from-bottom-2 duration-150 select-none">
                    {/* Main Tools Menu Card */}
                    <div className="w-64 sm:w-72 bg-[#181818] dark:bg-[#181818] text-[#ececec] rounded-2xl shadow-2xl border border-[#2e2e2e] p-1.5 space-y-0.5">
                      {/* 1. Upload files */}
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectFormat(".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,.json,.csv,application/pdf,image/*,text/*");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#ededed] hover:bg-[#262626] transition cursor-pointer text-left"
                      >
                        <Paperclip className="w-4 h-4 text-[#aaa]" />
                        <span>Upload files</span>
                      </button>

                      {/* 2. Add from Drive */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          setActiveSubmenu("none");
                          setIsWorkspaceModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#ededed] hover:bg-[#262626] transition cursor-pointer text-left"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 87.3 78" fill="none">
                          <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
                          <path d="M43.65 25 29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.5C.4 49.9 0 51.45 0 53h27.5z" fill="#00ac47" />
                          <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 10.15z" fill="#ea4335" />
                          <path d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.4-4.45 1.2z" fill="#00832d" />
                          <path d="m59.8 53-16.15-28H16.15L29.9 48.8l13.75 23.8h27.5c1.55 0 3.1-.4 4.45-1.2z" fill="#2684fc" />
                          <path d="m73.55 76.8-13.75-23.8-5.85 10.15 13.75 23.8c1.55 0 3.1-.4 4.45-1.2.5-.3.95-.65 1.4-1.05l-73.55-73.55" fill="#ffba00" />
                        </svg>
                        <span>Add from Drive</span>
                      </button>

                      {/* 3. Analisis Video YouTube */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          setActiveSubmenu("none");
                          setIsYouTubeModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#ededed] hover:bg-[#262626] transition cursor-pointer text-left"
                      >
                        <div className="w-4 h-4 rounded-md bg-red-600 flex items-center justify-center shrink-0">
                          <Youtube className="w-3 h-3 text-white" />
                        </div>
                        <span>Analisis Video YouTube</span>
                      </button>

                      {/* 4. More uploads > */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveSubmenu(activeSubmenu === "uploads" ? "none" : "uploads")}
                          onMouseEnter={() => setActiveSubmenu("uploads")}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${activeSubmenu === "uploads" ? "bg-[#262626] text-white" : "text-[#ededed] hover:bg-[#262626]"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <MoreHorizontal className="w-4 h-4 text-[#aaa]" />
                            <span>More uploads</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#888]" />
                        </button>

                        {/* Submenu for More uploads */}
                        {activeSubmenu === "uploads" && (
                          <div className="absolute left-full bottom-0 ml-1.5 w-60 bg-[#181818] rounded-2xl shadow-2xl border border-[#2e2e2e] p-1.5 space-y-0.5 z-50 animate-in fade-in slide-in-from-left-2 duration-150">
                            <button
                              type="button"
                              onClick={() => handleSelectFormat(".pdf,.doc,.docx,.txt,.md,application/pdf")}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#ededed] hover:bg-[#262626] transition cursor-pointer text-left"
                            >
                              <FileText className="w-4 h-4 text-indigo-400" />
                              <div>
                                <div className="font-semibold">Dokumen & PDF</div>
                                <div className="text-[10px] text-[#888]">PDF, Word, Markdown</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectFormat("image/*,.png,.jpg,.jpeg,.webp")}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#ededed] hover:bg-[#262626] transition cursor-pointer text-left"
                            >
                              <ImageIcon className="w-4 h-4 text-emerald-400" />
                              <div>
                                <div className="font-semibold">Foto & Gambar Soal</div>
                                <div className="text-[10px] text-[#888]">PNG, JPG, Screenshot</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectFormat(".js,.ts,.tsx,.py,.java,.c,.cpp,.html,.css,.json,.sql")}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#ededed] hover:bg-[#262626] transition cursor-pointer text-left"
                            >
                              <Code2 className="w-4 h-4 text-purple-400" />
                              <div>
                                <div className="font-semibold">Kode Pemrograman</div>
                                <div className="text-[10px] text-[#888]">Python, JS, Java, C++</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectFormat(".txt,.md,.json,.csv,text/*")}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#ededed] hover:bg-[#262626] transition cursor-pointer text-left"
                            >
                              <NotebookPen className="w-4 h-4 text-amber-400" />
                              <div>
                                <div className="font-semibold">Catatan Teks / CSV</div>
                                <div className="text-[10px] text-[#888]">Teks, Markdown, Spreadsheet</div>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="my-1 border-t border-[#2a2a2a]" />

                      {/* 4. Dokumen Word / PDF */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          setActiveSubmenu("none");
                          setInputPrompt((prev) =>
                            prev.trim()
                              ? `${prev} - tolong buatkan naskah laporan lengkap dalam format Dokumen Word/PDF resmi`
                              : "Tolong buatkan dokumen laporan lengkap terstruktur mengenai: "
                          );
                          textareaRef.current?.focus();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#ededed] hover:bg-[#262626] transition cursor-pointer text-left"
                      >
                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Dokumen (Word / PDF)</span>
                      </button>

                      {/* 6. Presentasi Slide PPTX */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          setActiveSubmenu("none");
                          setInputPrompt((prev) =>
                            prev.trim()
                              ? `${prev} - tolong buatkan naskah slide presentasi PowerPoint (PPTX) lengkap`
                              : "Tolong buatkan materi slide presentasi PowerPoint (PPTX) mengenai: "
                          );
                          textareaRef.current?.focus();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#ededed] hover:bg-[#262626] transition cursor-pointer text-left"
                      >
                        <Presentation className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Presentasi (PPTX)</span>
                      </button>

                      {/* 7. Spreadsheet Excel */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsMenuOpen(false);
                          setActiveSubmenu("none");
                          setInputPrompt((prev) =>
                            prev.trim()
                              ? `${prev} - tolong buatkan tabel data komparasi dalam format Spreadsheet Excel (XLSX)`
                              : "Tolong buatkan tabel data terstruktur / spreadsheet Excel untuk: "
                          );
                          textareaRef.current?.focus();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#ededed] hover:bg-[#262626] transition cursor-pointer text-left"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Spreadsheet (Excel)</span>
                      </button>

                      {/* 8. Grounding Web (Google Search) with Toggle & Disabled Quota State */}
                      <div
                        onClick={() => {
                          if (isGroundingAvailable) {
                            const nextVal = !isGroundingEnabled;
                            setIsGroundingEnabled(nextVal);
                            localStorage.setItem("ionlearn_grounding_enabled", String(nextVal));
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${isGroundingAvailable
                          ? "text-[#ededed] hover:bg-[#262626] cursor-pointer"
                          : "text-[#777] bg-[#141414] opacity-50 cursor-not-allowed"
                          }`}
                        title={
                          isGroundingAvailable
                            ? (isGroundingEnabled ? "Grounding Web Aktif: AI memvalidasi fakta via Google Search" : "Grounding Web Nonaktif")
                            : "Kuota pencarian web Google Search saat ini sedang habis. AI akan menggunakan pengetahuan internal."
                        }
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <Globe className={`w-4 h-4 shrink-0 ${!isGroundingAvailable ? 'text-[#555]' : isGroundingEnabled ? 'text-blue-400' : 'text-[#888]'}`} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={!isGroundingAvailable ? "line-through text-[#888]" : ""}>
                                Grounding Web
                              </span>
                              {!isGroundingAvailable && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/80 font-bold shrink-0">
                                  Kuota Habis
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#777] truncate">
                              {!isGroundingAvailable
                                ? "Pencarian web nonaktif (kuota habis)"
                                : isGroundingEnabled
                                  ? "Google Search real-time aktif"
                                  : "Pencarian web dinonaktifkan"}
                            </div>
                          </div>
                        </div>

                        {/* Toggle Switch */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isGroundingAvailable && (
                            <button
                              type="button"
                              onClick={handleCheckGrounding}
                              disabled={isCheckingGrounding}
                              className="p-1 text-[10px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                              title="Cek ulang kuota Google Search"
                            >
                              {isCheckingGrounding ? <Loader2 className="w-3 h-3 animate-spin" /> : "Cek"}
                            </button>
                          )}
                          <div
                            className={`w-9 h-5 rounded-full transition-colors relative flex items-center ${isGroundingAvailable && isGroundingEnabled
                              ? "bg-blue-600"
                              : "bg-[#333]"
                              }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform flex items-center justify-center ${isGroundingAvailable && isGroundingEnabled
                                ? "translate-x-4.5"
                                : "translate-x-0.5"
                                }`}
                            >
                              {isGroundingAvailable && isGroundingEnabled && (
                                <Check className="w-2.5 h-2.5 text-blue-600 stroke-[3]" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 9. Mode Belajar > */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveSubmenu(activeSubmenu === "tools" ? "none" : "tools")}
                          onMouseEnter={() => setActiveSubmenu("tools")}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${activeSubmenu === "tools" ? "bg-[#262626] text-white" : "text-[#ededed] hover:bg-[#262626]"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <GraduationCap className="w-4 h-4 text-[#aaa]" />
                            <span>Mode Belajar</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#888]" />
                        </button>

                        {/* Submenu for Mode Belajar */}
                        {activeSubmenu === "tools" && (
                          <div className="absolute left-full bottom-0 ml-1.5 w-60 bg-[#181818] rounded-2xl shadow-2xl border border-[#2e2e2e] p-1.5 space-y-0.5 z-50 animate-in fade-in slide-in-from-left-2 duration-150">
                            {/* Tutor Sokratik */}
                            <button
                              type="button"
                              onClick={() => {
                                setIsToolsMenuOpen(false);
                                setActiveSubmenu("none");
                                handleSetStudyMode("socratic");
                              }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#ededed] hover:bg-[#262626] transition cursor-pointer text-left"
                            >
                              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                              <div>
                                <div className="font-semibold">Tutor Sokratik</div>
                                <div className="text-[10px] text-[#888]">Tanya-jawab terbimbing</div>
                              </div>
                            </button>

                            {/* Kuis & Evaluasi */}
                            <button
                              type="button"
                              onClick={() => {
                                setIsToolsMenuOpen(false);
                                setActiveSubmenu("none");
                                handleSetStudyMode("quizzer");
                              }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#ededed] hover:bg-[#262626] transition cursor-pointer text-left"
                            >
                              <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
                              <div>
                                <div className="font-semibold">Kuis & Latihan</div>
                                <div className="text-[10px] text-[#888]">Soal uji pemahaman</div>
                              </div>
                            </button>

                            {/* Ringkasan Catatan */}
                            <button
                              type="button"
                              onClick={() => {
                                setIsToolsMenuOpen(false);
                                setActiveSubmenu("none");
                                setInputPrompt((prev) =>
                                  prev.trim()
                                    ? `${prev} - tolong buatkan ringkasan intisari materi dan simpan ke catatan belajar`
                                    : "Tolong buatkan ringkasan komprehensif materi ini dan simpan sebagai catatan belajar: "
                                );
                                textareaRef.current?.focus();
                              }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#ededed] hover:bg-[#262626] transition cursor-pointer text-left"
                            >
                              <NotebookPen className="w-4 h-4 text-violet-400 shrink-0" />
                              <div>
                                <div className="font-semibold">Ringkasan Catatan</div>
                                <div className="text-[10px] text-[#888]">Poin inti materi</div>
                              </div>
                            </button>

                            {/* Breakdown Tugas */}
                            <button
                              type="button"
                              onClick={() => {
                                setIsToolsMenuOpen(false);
                                setActiveSubmenu("none");
                                setInputPrompt((prev) =>
                                  prev.trim()
                                    ? `${prev} - tolong buatkan rencana breakdown to-do langkah kerja terukur`
                                    : "Tolong pecah tugas ini menjadi to-do list langkah kerja yang terukur:"
                                );
                                textareaRef.current?.focus();
                              }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-[#ededed] hover:bg-[#262626] transition cursor-pointer text-left"
                            >
                              <ListTodo className="w-4 h-4 text-amber-400 shrink-0" />
                              <div>
                                <div className="font-semibold">Breakdown Tugas</div>
                                <div className="text-[10px] text-[#888]">To-do list terukur</div>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Context Selector Dropdown Pill */}
              <div className="relative" ref={contextRef}>
                <button
                  type="button"
                  onClick={() => setIsContextOpen(!isContextOpen)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-[#202020] dark:hover:bg-[#282828] text-xs font-semibold text-slate-700 dark:text-[#d0d0d0] transition cursor-pointer"
                  title="Pilih konteks materi / tugas"
                >
                  {activeTask ? (
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  ) : activeNote ? (
                    <NotebookPen className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  ) : (
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  )}
                  <span className="max-w-[120px] sm:max-w-[200px] truncate">
                    {activeTask
                      ? activeTask.title
                      : activeNote
                        ? activeNote.title
                        : "Pilih Materi Belajar"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {/* Context Dropdown Popover */}
                {isContextOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-72 sm:w-80 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-slate-200/80 dark:border-[#2a2a2a] p-2.5 z-50 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-1 pb-2 mb-1.5 border-b border-slate-100 dark:border-[#262626] text-xs">
                      <button
                        type="button"
                        onClick={() => setContextTab("tasks")}
                        className={`flex-1 py-1 rounded-lg font-semibold transition cursor-pointer ${contextTab === "tasks"
                          ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                          : "text-slate-500 hover:bg-slate-50 dark:hover:bg-[#202020]"
                          }`}
                      >
                        Tugas Classroom ({tasks.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setContextTab("notes")}
                        className={`flex-1 py-1 rounded-lg font-semibold transition cursor-pointer ${contextTab === "notes"
                          ? "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400"
                          : "text-slate-500 hover:bg-slate-50 dark:hover:bg-[#202020]"
                          }`}
                      >
                        Catatan ({notes.length})
                      </button>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectTaskContext(undefined);
                          handleSelectNoteContext(undefined);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#222] text-slate-700 dark:text-[#ccc] font-medium transition cursor-pointer"
                      >
                        🌐 Mode Bebas (Tanpa Konteks Khusus)
                      </button>

                      {contextTab === "tasks" ? (
                        tasks.length === 0 ? (
                          <p className="text-xs text-slate-400 p-3 text-center">
                            Tidak ada tugas.
                          </p>
                        ) : (
                          tasks.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleSelectTaskContext(t.id)}
                              className={`w-full text-left px-2.5 py-2 rounded-xl transition truncate cursor-pointer ${activeTask?.id === t.id
                                ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold"
                                : "hover:bg-slate-100 dark:hover:bg-[#222] text-slate-700 dark:text-[#ccc]"
                                }`}
                            >
                              <div className="font-semibold truncate">{t.title}</div>
                              <div className="text-xs text-slate-400 truncate">
                                {t.courseName || "Classroom"}
                              </div>
                            </button>
                          ))
                        )
                      ) : notes.length === 0 ? (
                        <p className="text-xs text-slate-400 p-3 text-center">
                          Tidak ada catatan.
                        </p>
                      ) : (
                        notes.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => handleSelectNoteContext(n.id)}
                            className={`w-full text-left px-2.5 py-2 rounded-xl transition truncate cursor-pointer ${activeNote?.id === n.id
                              ? "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-semibold"
                              : "hover:bg-slate-100 dark:hover:bg-[#222] text-slate-700 dark:text-[#ccc]"
                              }`}
                          >
                            <div className="font-semibold truncate">{n.title}</div>
                            <div className="text-xs text-slate-400 truncate">
                              {n.subject || "Catatan"}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                multiple
                accept={activeAcceptFilter}
              />
            </div>

            {/* Right: Dynamic Action Button (Mic / Stop / Send) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Dynamic Action Button: Mic / Send */}
              {isListening ? (
                <button
                  type="button"
                  onClick={toggleVoiceRecognition}
                  className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30 transition-all cursor-pointer"
                  title="Sedang merekam suara... Klik untuk berhenti"
                >
                  <MicOff className="w-4 h-4" />
                </button>
              ) : isLoading ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-all shrink-0 shadow-2xs cursor-pointer animate-in zoom-in-90 duration-150"
                  title="Hentikan respons (Stop)"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : inputPrompt.trim() || attachedFiles.length > 0 ? (
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim() && attachedFiles.length === 0}
                  className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white transition-all shrink-0 shadow-2xs cursor-pointer disabled:cursor-not-allowed animate-in zoom-in-90 duration-150"
                  title="Kirim pesan (Enter)"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleVoiceRecognition}
                  className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-[#202020] text-slate-600 dark:text-[#aaa] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/80 dark:hover:bg-[#282828] transition-all cursor-pointer animate-in zoom-in-90 duration-150"
                  title="Input dengan Suara (Speech-to-Text)"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 dark:text-[#555] text-center mt-2">
          AI dapat melakukan kekeliruan. Selalu verifikasi jawaban sebelum dikumpulkan.
        </p>
      </div>
    );
  };

  // Reusable History List & Search
  const renderHistoryContent = (isDrawer = false) => (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-[#131313]">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200/70 dark:border-[#202020] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-[#f0f0f0]">
            Riwayat Percakapan
          </span>
        </div>
        {isDrawer && (
          <button
            type="button"
            onClick={() => setIsHistoryDrawerOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#202020] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Actions: New Chat & Search */}
      <div className="p-3 border-b border-slate-100 dark:border-[#1e1e1e] space-y-2">
        <Button
          onClick={() => handleNewChat()}
          className="w-full justify-center gap-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs h-9 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Percakapan Baru</span>
        </Button>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={sessionSearchQuery}
            onChange={(e) => setSessionSearchQuery(e.target.value)}
            placeholder="Cari percakapan…"
            className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200/70 dark:border-[#262626] text-slate-900 dark:text-[#eee] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-10 px-4 text-xs text-slate-400">
            Tidak ada percakapan ditemukan.
          </div>
        ) : (
          filteredSessions.map((s) => {
            const isSelected = s.id === currentId;
            const hasTask = Boolean(s.taskId);
            const hasNote = Boolean(s.noteId);

            return (
              <div
                key={s.id}
                onClick={() => {
                  setCurrentId(s.id);
                  if (isDrawer) setIsHistoryDrawerOpen(false);
                }}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer ${
                  isSelected
                    ? "bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 text-indigo-950 dark:text-indigo-200 font-semibold"
                    : "text-slate-600 dark:text-[#a0a0a0] hover:bg-slate-100 dark:hover:bg-[#1a1a1a]"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  {hasTask ? (
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  ) : hasNote ? (
                    <NotebookPen className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-70" />
                  )}
                  <span className="truncate">{getSessionTitle(s)}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-slate-200/80 dark:hover:bg-[#282828] text-slate-400 hover:text-rose-600 transition shrink-0 cursor-pointer"
                  title="Hapus sesi ini"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // Split Workspace Panel (Right Column for 'split' mode)
  const renderSplitWorkspace = () => {
    return (
      <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] flex-col h-full bg-slate-50/50 dark:bg-[#111111] border-l border-slate-200/80 dark:border-[#202020] overflow-hidden shrink-0">
        {/* Workspace Tab Header */}
        <div className="p-3 border-b border-slate-200/70 dark:border-[#202020] flex items-center justify-between bg-white/70 dark:bg-[#141414]/70 backdrop-blur-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSplitWorkspaceTab("task")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                splitWorkspaceTab === "task"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-[#aaa] hover:bg-slate-100 dark:hover:bg-[#202020]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Tugas Classroom</span>
              {activeTask && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-indigo-600" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setSplitWorkspaceTab("note")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                splitWorkspaceTab === "note"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-[#aaa] hover:bg-slate-100 dark:hover:bg-[#202020]"
              }`}
            >
              <NotebookPen className="w-3.5 h-3.5" />
              <span>Catatan Belajar</span>
              {activeNote && (
                <span className="w-2 h-2 rounded-full bg-purple-400 ring-2 ring-indigo-600" />
              )}
            </button>
          </div>

          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {splitWorkspaceTab === "task" ? (
            activeTask ? (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Task Header Card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold truncate">
                      {activeTask.courseName || "Classroom"}
                    </span>
                    {(activeTask.dueTimestamp || activeTask.dueDateStr) && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(activeTask.dueTimestamp || activeTask.dueDateStr || "").toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#f0f0f0]">
                    {activeTask.title}
                  </h3>
                </div>

                {/* Quick Prompts to discuss this task with AI */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Aksi Bimbingan AI
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInputPrompt(`Jelaskan konsep utama dan langkah-langkah untuk mengerjakan tugas "${activeTask.title}".`);
                        textareaRef.current?.focus();
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-[#181818] border border-slate-200/70 dark:border-[#282828] hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 text-xs text-slate-700 dark:text-[#ccc] transition cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Bimbing langkah demi langkah tugas ini</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputPrompt(`Buatkan rangkuman materi dan poin penting yang diperlukan untuk menjawab tugas "${activeTask.title}".`);
                        textareaRef.current?.focus();
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-[#181818] border border-slate-200/70 dark:border-[#282828] hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 text-xs text-slate-700 dark:text-[#ccc] transition cursor-pointer flex items-center gap-2"
                    >
                      <Brain className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Rangkum poin kunci tugas</span>
                    </button>
                  </div>
                </div>

                {/* Task Description */}
                {activeTask.description && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-[#262626] space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-[#ddd]">
                      Deskripsi & Instruksi Tugas
                    </h4>
                    <div className="text-xs text-slate-600 dark:text-[#a0a0a0] leading-relaxed whitespace-pre-wrap">
                      {activeTask.description}
                    </div>
                  </div>
                )}

                {/* Task Materials / Attachments */}
                {activeTask.materials && activeTask.materials.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-[#262626] space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-[#ddd]">
                      Lampiran & Materi Tugas
                    </h4>
                    <div className="space-y-1.5">
                      {activeTask.materials.map((m, idx) => {
                        const fileLink = m.driveFile?.driveFile?.alternateLink || m.link?.url || m.youtubeVideo?.alternateLink || activeTask.classroomLink || "#";
                        const fileTitle = m.driveFile?.driveFile?.title || m.link?.title || m.youtubeVideo?.title || "Lampiran Materi";
                        return (
                          <a
                            key={idx}
                            href={fileLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#1f1f1f] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-[#2a2a2a] text-xs text-slate-700 dark:text-[#ccc] transition"
                          >
                            <span className="truncate pr-2 font-medium">
                              {fileTitle}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-[#262626] text-center space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-[#ccc]">
                    Pilih Tugas untuk Ditampilkan
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Klik tugas di bawah untuk membuka panel bimbingan berdampingan.
                  </p>
                </div>
                <div className="space-y-1.5">
                  {tasks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTaskContext(t.id)}
                      className="w-full text-left p-3 rounded-xl bg-white dark:bg-[#161616] border border-slate-200/70 dark:border-[#262626] hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {t.courseName || "Classroom"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : activeNote ? (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 text-xs font-bold truncate">
                    {activeNote.subject || "Catatan Belajar"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(activeNote.updatedAt || activeNote.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#f0f0f0]">
                  {activeNote.title}
                </h3>
              </div>

              {/* Quick Prompts for Note */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Aksi Cepat Catatan
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInputPrompt(`Buatkan rangkuman ringkas dan poin-poin utama dari catatan "${activeNote.title}".`);
                      textareaRef.current?.focus();
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-[#181818] border border-slate-200/70 dark:border-[#282828] hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 text-xs text-slate-700 dark:text-[#ccc] transition cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Rangkum poin penting catatan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputPrompt(`Buatkan 5 soal latihan pilihan ganda beserta pembahasannya dari materi catatan "${activeNote.title}".`);
                      textareaRef.current?.focus();
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-[#181818] border border-slate-200/70 dark:border-[#282828] hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 text-xs text-slate-700 dark:text-[#ccc] transition cursor-pointer flex items-center gap-2"
                  >
                    <Brain className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Uji pemahaman dengan 5 soal latihan</span>
                  </button>
                </div>
              </div>

              {/* Note Content */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-[#262626] space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-[#ddd]">
                  Isi Catatan
                </h4>
                <div className="text-xs text-slate-600 dark:text-[#a0a0a0] leading-relaxed whitespace-pre-wrap">
                  {activeNote.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-[#262626] text-center space-y-1">
                <p className="text-xs font-bold text-slate-700 dark:text-[#ccc]">
                  Pilih Catatan untuk Ditampilkan
                </p>
                <p className="text-[11px] text-slate-400">
                  Pilih catatan untuk mendiskusikan materinya berdampingan dengan AI.
                </p>
              </div>
              <div className="space-y-1.5">
                {notes.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleSelectNoteContext(n.id)}
                    className="w-full text-left p-3 rounded-xl bg-white dark:bg-[#161616] border border-slate-200/70 dark:border-[#262626] hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 transition cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {n.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {n.subject || "Catatan"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      {/* ── 1. DESKTOP SIDEBAR (FOR 'sidebar' MODE) ── */}
      {layoutMode === "sidebar" && (
        <div
          className={`hidden md:flex flex-col h-full bg-white dark:bg-[#131313] border-r border-slate-200/80 dark:border-[#202020] transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
            isDesktopSidebarOpen ? "w-64 lg:w-72" : "w-0 border-r-0"
          }`}
        >
          {renderHistoryContent(false)}
        </div>
      )}

      {/* ── 2. MAIN WORKSPACE AREA (CHAT FEED + OPTIONAL SPLIT PANEL) ── */}
      <div className="flex-1 flex flex-row h-full min-w-0 overflow-hidden relative">
        {/* Chat Feed Column */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
          {/* Top Floating / Action Capsule */}
          <div className="absolute top-3 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
            {/* Left: Desktop Sidebar Toggle button (only in 'sidebar' mode) */}
            <div className="pointer-events-auto flex items-center gap-1.5">
              {layoutMode === "sidebar" && (
                <button
                  type="button"
                  onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/90 dark:bg-[#181818]/90 hover:bg-white dark:hover:bg-[#222] border border-slate-200/80 dark:border-[#2a2a2a] shadow-xs backdrop-blur-md text-slate-600 dark:text-[#ccc] hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-xs font-medium"
                  title={isDesktopSidebarOpen ? "Tutup Sidebar Riwayat" : "Buka Sidebar Riwayat"}
                >
                  <PanelLeft className="w-3.5 h-3.5 text-slate-500 dark:text-[#aaa]" />
                  <span className="hidden sm:inline">
                    {isDesktopSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
                  </span>
                </button>
              )}
            </div>

            {/* Right: Floating Riwayat button (for 'minimal' & 'split' modes, or on mobile in 'sidebar' mode) */}
            <div className="pointer-events-auto flex items-center gap-1.5">
              {layoutMode !== "sidebar" ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-[#181818]/90 hover:bg-white dark:hover:bg-[#222] border border-slate-200/80 dark:border-[#2a2a2a] shadow-xs backdrop-blur-md text-slate-600 dark:text-[#ccc] hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-xs font-medium"
                  title="Buka Riwayat Percakapan"
                >
                  <History className="w-3.5 h-3.5 text-slate-500 dark:text-[#aaa]" />
                  <span>Riwayat</span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(true)}
                  className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-[#181818]/90 hover:bg-white dark:hover:bg-[#222] border border-slate-200/80 dark:border-[#2a2a2a] shadow-xs backdrop-blur-md text-slate-600 dark:text-[#ccc] hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-xs font-medium"
                  title="Buka Riwayat Percakapan"
                >
                  <History className="w-3.5 h-3.5 text-slate-500 dark:text-[#aaa]" />
                  <span>Riwayat</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* ── SLIDE-OVER HISTORY DRAWER WITH SPRING ANIMATION ── */}
          <AnimatePresence>
            {isHistoryDrawerOpen && (
              <div className="fixed inset-0 z-50 overflow-hidden">
                {/* Smooth Fade Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="fixed inset-0 bg-black/45 backdrop-blur-xs cursor-pointer"
                />

                {/* Smooth Spring Sliding Panel */}
                <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50 pointer-events-none">
                  <motion.div
                    initial={{ x: "100%", opacity: 0.9 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0.9 }}
                    transition={{ type: "spring", damping: 28, stiffness: 280 }}
                    className="pointer-events-auto w-screen max-w-xs bg-white dark:bg-[#141414] border-l border-slate-200/80 dark:border-[#262626] shadow-2xl flex flex-col"
                  >
                    {renderHistoryContent(true)}
                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>

      {/* ── 2. Message Feed Area ── */}
      <div ref={scrollAreaRef} className="flex-1 min-h-0 overflow-y-auto">
        {messages.length === 0 ? (
          /* ── EMPTY STATE: CLEAN MINIMALIST CENTERED HERO ── */
          <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 sm:px-6 text-center max-w-2xl mx-auto">
            {/* Logo / Brand Mark */}
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-[#141414] border border-indigo-100 dark:border-[#262626] flex items-center justify-center mb-3.5 shadow-2xs">
              <img
                src="/logos/logoionlearnkecil.png"
                alt="IOnLearn"
                className="w-7 h-7 object-contain"
              />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#f3f3f3] mb-1.5 tracking-tight">
              {activeTask
                ? `Membimbing "${activeTask.title}"`
                : activeNote
                  ? `Membahas "${activeNote.title}"`
                  : `Hai, ada materi yang ingin dibahas?`}
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#7f7f7f] max-w-md leading-relaxed mb-6">
              {activeTask
                ? `AI siap membimbing pengerjaan tugas ${activeTask.courseName || ""} secara bertahap.`
                : activeNote
                  ? `AI siap mengulas materi, merangkum poin penting, dan menguji pemahaman catatan ini.`
                  : `Tanyakan rumus, konsep sulit, minta rangkuman, atau lampirkan dokumen materi.`}
            </p>

            {/* 🌟 CENTERED INPUT BAR */}
            <div className="w-full mb-6 text-left">
              {renderInputBar(true)}
            </div>

            {/* Curated Quick Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
              {quickPrompts.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleSetStudyMode(p.mode);
                      handleSendMessage(p.label);
                    }}
                    className="group flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-[#161616] hover:bg-slate-100 dark:hover:bg-[#1f1f1f] border border-slate-200/80 dark:border-[#262626] text-xs text-slate-700 dark:text-[#ccc] hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-2xs cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-white dark:bg-[#202020] text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 shrink-0 transition">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium leading-relaxed">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── ACTIVE CONVERSATION FEED ── */
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 sm:py-5 space-y-4">
            {messages.map((m) => {
              const isUser = m.role === "user";

              return (
                <div
                  key={m.id}
                  className={`group flex gap-3 ${isUser ? "justify-end" : "justify-start items-start"
                    }`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  )}

                  {isUser ? (
                    <div className="flex flex-col items-end max-w-[88%] sm:max-w-[80%]">
                      {/* User Bubble */}
                      <div className="w-full bg-indigo-600 dark:bg-[#ececec] text-white dark:text-[#111] rounded-2xl rounded-br-xs px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-medium shadow-2xs leading-relaxed">
                        <div className="space-y-2">
                          <p className="whitespace-pre-wrap">{m.content}</p>

                          {/* Render Attached Files as Rich Document Cards inside User Bubble */}
                          {m.attachments && m.attachments.length > 0 && (
                            <div className="space-y-2 pt-2">
                              {m.attachments.map((att, attIdx) => {
                                if (att.type === "youtube" || att.youtubeInfo) {
                                  const yt = att.youtubeInfo || parseYouTubeUrl(att.name);
                                  const videoId = yt?.videoId;
                                  const isPlaying = activePlayingVideoId === videoId;

                                  return (
                                    <div
                                      key={attIdx}
                                      className="w-full rounded-2xl overflow-hidden border border-white/20 dark:border-black/10 bg-black/30 dark:bg-black/5 backdrop-blur-sm shadow-md transition-all text-left"
                                    >
                                      {isPlaying && videoId ? (
                                        <div className="relative w-full aspect-video bg-black">
                                          <iframe
                                            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                                            title={yt?.title || "YouTube Video Player"}
                                            className="w-full h-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          />
                                        </div>
                                      ) : (
                                        <div className="relative w-full aspect-video bg-slate-900 overflow-hidden group/thumb">
                                          {yt?.thumbnailUrl ? (
                                            <img
                                              src={yt.thumbnailUrl}
                                              alt={yt.title || "Thumbnail Video"}
                                              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                                              <Youtube className="w-10 h-10 text-red-500" />
                                            </div>
                                          )}
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-center justify-center">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActivePlayingVideoId(videoId || null);
                                              }}
                                              className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform transform group-hover/thumb:scale-110 cursor-pointer"
                                              title="Buka & Putar Video di Chat"
                                            >
                                              <Play className="w-5 h-5 ml-0.5 fill-white text-white" />
                                            </button>
                                          </div>
                                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[10px] font-bold tracking-wider flex items-center gap-1 shadow-xs">
                                            <Youtube className="w-3 h-3" />
                                            <span>YOUTUBE</span>
                                          </div>
                                        </div>
                                      )}

                                      <div className="p-3 bg-white/10 dark:bg-black/5">
                                        <p className="text-xs sm:text-sm font-semibold truncate text-white dark:text-slate-900">
                                          {yt?.title || att.name}
                                        </p>
                                        <div className="flex items-center justify-between mt-1 text-[11px] text-white/80 dark:text-slate-700">
                                          <span className="truncate">{yt?.authorName || "YouTube Video"}</span>
                                          <div className="flex items-center gap-2 shrink-0">
                                            {isPlaying ? (
                                              <button
                                                type="button"
                                                onClick={() => setActivePlayingVideoId(null)}
                                                className="inline-flex items-center gap-1 text-xs font-semibold underline text-amber-300 dark:text-amber-700 hover:opacity-80 cursor-pointer"
                                              >
                                                Tutup Pemutar
                                              </button>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => setActivePlayingVideoId(videoId || null)}
                                                className="inline-flex items-center gap-1 text-xs font-semibold underline text-red-300 dark:text-red-700 hover:opacity-80 cursor-pointer"
                                              >
                                                <Play className="w-3 h-3 fill-current" />
                                                Putar di Chat
                                              </button>
                                            )}
                                            <a
                                              href={yt?.canonicalUrl || yt?.url || `https://www.youtube.com/watch?v=${videoId}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-0.5 hover:underline text-white/90 dark:text-slate-800 font-medium"
                                              onClick={(e) => e.stopPropagation()}
                                              title="Buka video di YouTube pada tab baru"
                                            >
                                              <span>Buka di YouTube</span>
                                              <ExternalLink className="w-3 h-3" />
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }

                                const badgeInfo = getFileFormatBadge(att.name, att.type);
                                return (
                                  <button
                                    key={attIdx}
                                    type="button"
                                    onClick={() => setPreviewFile(att)}
                                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 dark:bg-black/25 dark:hover:bg-black/40 border border-white/20 dark:border-white/10 backdrop-blur-sm transition-all cursor-pointer group text-left shadow-xs"
                                    title="Klik untuk melihat isi file PDF / dokumen"
                                  >
                                    {/* File Icon Box */}
                                    <div
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${badgeInfo.badgeClass} shadow-xs`}
                                    >
                                      <FileText className="w-5 h-5 text-white" />
                                    </div>

                                    {/* File Details */}
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-semibold text-white truncate group-hover:underline">
                                        {att.name}
                                      </p>
                                      <p className="text-xs text-white/75 dark:text-white/70 mt-0.5 flex items-center gap-1.5">
                                        <span>{formatFileSize(att.size)}</span>
                                        <span>•</span>
                                        <span className="inline-flex items-center gap-1 text-indigo-200 dark:text-indigo-300 font-medium">
                                          <Eye className="w-3 h-3" />
                                          Lihat Isi File
                                        </span>
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Clean Hover Action Toolbar outside User Bubble (Copy & Resend) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-0.5 mt-1 pr-1">
                        <button
                          type="button"
                          onClick={() => handleCopyText(m.content, m.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-[#eee] hover:bg-slate-100 dark:hover:bg-[#202020] transition cursor-pointer"
                          title="Salin teks chat"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRetryMessage(m.id)}
                          disabled={isLoading}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#202020] transition cursor-pointer disabled:opacity-40"
                          title="Kirim ulang chat ini (Resend / Retry)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[86%] sm:max-w-[80%] text-slate-900 dark:text-[#e8e8e8] text-xs sm:text-sm leading-relaxed">
                      <div className="space-y-3">
                        {/* Live Real-time Status Badge while streaming */}
                        {m.isStreaming && (
                          <div className="pb-1">
                            <LiveStreamStatusBadge
                              stage={m.streamStage}
                              detail={m.streamStageDetail}
                              queries={m.streamSearchQueries}
                            />
                          </div>
                        )}

                        {/* Collapsible Chain-of-Thought / Reasoning Process */}
                        {m.thoughtProcess ? (
                          <ThoughtProcessAccordion
                            thought={m.thoughtProcess}
                            isStreaming={m.isStreaming && !m.content}
                          />
                        ) : null}

                        {m.isStreaming && !m.content && !m.thoughtProcess ? (
                          <div className="flex items-center gap-2.5 py-1 text-slate-500 dark:text-[#888]">
                            <span className="text-xs font-medium">{APP_NAME} sedang menyusun bimbingan...</span>
                            <span className="flex gap-1 items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse [animation-delay:200ms]" />
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse [animation-delay:400ms]" />
                            </span>
                          </div>
                        ) : m.content ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed break-words relative">
                            <Markdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code: CodeBlock,
                                pre: ({ children }) => <>{children}</>,
                                table: ({ children }) => (
                                  <div className="my-3.5 w-full overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-[#2b2b2b] shadow-xs">
                                    <table className="w-full min-w-[340px] text-xs sm:text-sm text-left border-collapse bg-white dark:bg-[#151515]">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                thead: ({ children }) => (
                                  <thead className="bg-slate-100/90 dark:bg-[#1f1f1f] text-slate-900 dark:text-[#f2f2f2] font-bold border-b border-slate-200/80 dark:border-[#2b2b2b]">
                                    {children}
                                  </thead>
                                ),
                                tbody: ({ children }) => (
                                  <tbody className="divide-y divide-slate-100 dark:divide-[#242424]">
                                    {children}
                                  </tbody>
                                ),
                                tr: ({ children }) => (
                                  <tr className="hover:bg-slate-50/75 dark:hover:bg-[#1a1a1a] transition-colors">
                                    {children}
                                  </tr>
                                ),
                                th: ({ children }) => (
                                  <th className="px-3.5 py-2.5 font-bold text-slate-900 dark:text-white border-r border-slate-200/60 dark:border-[#2a2a2a] last:border-r-0">
                                    {children}
                                  </th>
                                ),
                                td: ({ children }) => (
                                  <td className="px-3.5 py-2.5 text-slate-700 dark:text-[#ccc] border-r border-slate-100 dark:border-[#222] last:border-r-0 leading-relaxed">
                                    {children}
                                  </td>
                                ),
                              }}
                            >
                              {formatMarkdownTables(m.content)}
                            </Markdown>
                            {m.isStreaming && (
                              <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-indigo-600 dark:bg-indigo-400 rounded-xs animate-pulse" />
                            )}
                          </div>
                        ) : null}

                        {/* Web Grounding Citations / Sumber Rujukan Terverifikasi */}
                        {m.groundingSources && m.groundingSources.length > 0 && (
                          <div className="p-3 rounded-2xl bg-sky-50/70 dark:bg-[#101b2b]/60 border border-sky-200/70 dark:border-sky-900/40 shadow-2xs space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-md bg-sky-600 dark:bg-sky-500 text-white flex items-center justify-center shrink-0">
                                <Globe className="w-3 h-3" />
                              </div>
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <span className="text-xs font-bold text-sky-950 dark:text-sky-200 truncate">
                                  Sumber Rujukan Terverifikasi
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-sky-200/70 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 shrink-0">
                                  Google Search
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {m.groundingSources.map((source, sIdx) => {
                                let hostname = "";
                                try {
                                  hostname = new URL(source.url).hostname.replace(/^www\./, "");
                                } catch {
                                  hostname = "Sumber Web";
                                }
                                return (
                                  <a
                                    key={sIdx}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-[#152338] hover:bg-sky-100/80 dark:hover:bg-sky-900/50 border border-sky-200/60 dark:border-sky-800/40 transition shadow-2xs group max-w-full"
                                    title={source.title || source.url}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    <span className="truncate max-w-[180px] sm:max-w-[240px] font-semibold text-sky-900 dark:text-sky-300">
                                      {source.title || hostname}
                                    </span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate hidden sm:inline">
                                      ({hostname})
                                    </span>
                                    <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 shrink-0" />
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Interactive Created Note Card if AI made a note */}
                        {m.createdNote && (
                          <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#161616] border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center text-xs">
                                  <NotebookPen className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-bold text-slate-900 dark:text-[#f3f3f3]">
                                  Catatan Materi Tersimpan
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => router.push("/notes")}
                                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>Buka Catatan</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="bg-white dark:bg-[#1a1a1a] p-2.5 rounded-xl border border-slate-200/70 dark:border-[#2b2b2b]">
                              <p className="text-xs font-bold text-slate-900 dark:text-[#eee]">
                                {m.createdNote.title}
                              </p>
                              {m.createdNote.subject && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-[#242424] text-slate-700 dark:text-slate-300">
                                  {m.createdNote.subject}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Interactive Created To-Do Card if AI made a to-do with subtasks */}
                        {(m.createdTodo || (m.createdTodos && m.createdTodos.length > 0)) && (() => {
                          const todoData = m.createdTodo || (m.createdTodos ? {
                            title: m.createdTodos.length === 1 ? m.createdTodos[0].title : `Rencana Belajar: ${m.createdTodos[0]?.category || "Belajar"}`,
                            description: m.createdTodos[0]?.description,
                            priority: m.createdTodos[0]?.priority || "medium",
                            category: m.createdTodos[0]?.category || "Belajar AI",
                            subtasks: m.createdTodos.length > 1
                              ? m.createdTodos.map((t, idx) => ({ id: `st-${idx}`, title: t.title, isCompleted: false }))
                              : m.createdTodos[0]?.subtasks,
                          } : null);

                          if (!todoData) return null;
                          const subtasksList = todoData.subtasks || [];

                          return (
                            <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#161616] border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center text-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-xs font-bold text-slate-900 dark:text-[#f3f3f3]">
                                    To-Do Tersimpan
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => router.push("/todo")}
                                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>Buka To-Do</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="bg-white dark:bg-[#1a1a1a] p-3 rounded-xl border border-slate-200/70 dark:border-[#2b2b2b] space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-[#eee]">
                                      {todoData.title}
                                    </p>
                                    {todoData.description && (
                                      <p className="text-xs text-slate-500 dark:text-[#888] mt-0.5 leading-relaxed">
                                        {todoData.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {todoData.priority && (
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-xs font-bold uppercase ${todoData.priority === "high"
                                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                          : todoData.priority === "low"
                                            ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                                          }`}
                                      >
                                        {todoData.priority === "high" ? "Penting" : todoData.priority === "low" ? "Rendah" : "Sedang"}
                                      </span>
                                    )}
                                    {todoData.category && (
                                      <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                        {todoData.category}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {subtasksList.length > 0 && (
                                  <div className="pt-2 border-t border-slate-100 dark:border-[#282828] space-y-1.5">
                                    <span className="text-xs font-semibold text-slate-500 dark:text-[#888] block">
                                      Sub-langkah ({subtasksList.length} langkah):
                                    </span>
                                    <div className="space-y-1">
                                      {subtasksList.map((st: any, sIdx: number) => (
                                        <div
                                          key={sIdx}
                                          className="flex items-center gap-2 text-xs text-slate-700 dark:text-[#ccc]"
                                        >
                                          <div className="w-3.5 h-3.5 rounded-md border border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                                            <Check className="w-2 h-2 text-emerald-600" />
                                          </div>
                                          <span className="truncate">{typeof st === "string" ? st : st.title}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Interactive Created Document Card (PDF / DOCX / XLSX) */}
                        {m.createdDocument && (
                          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 dark:bg-[#161616] border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-2xs shrink-0 ${m.createdDocument.type === "pdf"
                                    ? "bg-rose-600 dark:bg-rose-500"
                                    : m.createdDocument.type === "xlsx"
                                      ? "bg-emerald-600 dark:bg-emerald-500"
                                      : "bg-blue-600 dark:bg-blue-500"
                                    }`}
                                >
                                  {m.createdDocument.type === "pdf" ? "PDF" : m.createdDocument.type === "xlsx" ? "XLSX" : "DOCX"}
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-slate-900 dark:text-[#f3f3f3] block truncate">
                                    {m.createdDocument.type === "pdf"
                                      ? "Dokumen PDF Siap Unduh"
                                      : m.createdDocument.type === "xlsx"
                                        ? "Spreadsheet Excel (.xlsx) Siap Unduh"
                                        : "Dokumen Word (.docx) Siap Unduh"}
                                  </span>
                                  <span className="text-[11px] text-slate-500 dark:text-[#888] truncate block">
                                    {m.createdDocument.fileName || (m.createdDocument.type === "pdf" ? "dokumen.pdf" : m.createdDocument.type === "xlsx" ? "tabel_data.xlsx" : "dokumen.docx")}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentIdx = messages.findIndex((msgItem: ChatMessage) => msgItem.id === m.id);
                                    const searchRange = currentIdx >= 0 ? messages.slice(0, currentIdx) : messages;
                                    const prevRich = [...searchRange].reverse().find(
                                      (msgItem: ChatMessage) => msgItem.role === "assistant" && msgItem.content && msgItem.content.length > 250
                                    );
                                    const fallbackText = (m.content && m.content.length > 250 ? m.content : prevRich?.content) || "";
                                    setCustomizingDoc({ doc: m.createdDocument!, fallbackText });
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#202020] border border-slate-200 dark:border-[#333] hover:bg-slate-100 dark:hover:bg-[#2a2a2a] active:scale-95 shadow-2xs transition-all cursor-pointer"
                                  title={
                                    m.createdDocument.type === "xlsx"
                                      ? "Kustomisasi nama sheet, tema warna header, dan layout kolom Excel"
                                      : "Kustomisasi nama siswa, pilihan font, ukuran teks, dan watermark IOnLearn"
                                  }
                                >
                                  <Sliders className={`w-3.5 h-3.5 ${m.createdDocument.type === "xlsx"
                                    ? "text-emerald-500"
                                    : m.createdDocument.type === "pdf"
                                      ? "text-rose-500"
                                      : "text-blue-500"
                                    }`} />
                                  <span>Kustomisasi</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentIdx = messages.findIndex((msgItem: ChatMessage) => msgItem.id === m.id);
                                    const searchRange = currentIdx >= 0 ? messages.slice(0, currentIdx) : messages;
                                    const prevRich = [...searchRange].reverse().find(
                                      (msgItem: ChatMessage) => msgItem.role === "assistant" && msgItem.content && msgItem.content.length > 250
                                    );
                                    const fallbackText = (m.content && m.content.length > 250 ? m.content : prevRich?.content) || "";
                                    downloadCreatedDocument(m.createdDocument!, fallbackText);
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs transition-all cursor-pointer shrink-0 ${m.createdDocument.type === "pdf"
                                    ? "bg-rose-600 hover:bg-rose-700 active:scale-95"
                                    : m.createdDocument.type === "xlsx"
                                      ? "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
                                      : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                                    }`}
                                  title="Klik untuk mengunduh file dokumen langsung"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Unduh {m.createdDocument.type === "pdf" ? "PDF" : m.createdDocument.type === "xlsx" ? "Excel" : "Word"}</span>
                                </button>
                              </div>
                            </div>

                            <div className="bg-white dark:bg-[#1a1a1a] p-3 rounded-xl border border-slate-200/70 dark:border-[#2b2b2b] space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-bold text-slate-900 dark:text-[#eee]">
                                  {cleanLatexMath(m.createdDocument.title)}
                                </p>
                                {m.createdDocument.subject && (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-[#252525] text-slate-700 dark:text-slate-300 shrink-0">
                                    {cleanLatexMath(m.createdDocument.subject)}
                                  </span>
                                )}
                              </div>
                              {m.createdDocument.description && (
                                <p className="text-xs text-slate-500 dark:text-[#888] leading-relaxed">
                                  {cleanLatexMath(m.createdDocument.description)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Interactive Created Slides Carousel (.PPTX) */}
                        {m.createdSlides && m.createdSlides.slides && m.createdSlides.slides.length > 0 && (() => {
                          const slides = m.createdSlides.slides;
                          const currentIdx = (activeSlideIndices[m.id] || 0) % slides.length;
                          const activeSlide = slides[currentIdx] || slides[0];

                          return (
                            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 dark:bg-[#161616] border border-slate-200/80 dark:border-[#262626] shadow-2xs space-y-3">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-amber-500 dark:bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                                    <Presentation className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-bold text-slate-900 dark:text-[#f3f3f3]">
                                        Slide Presentasi ({slides.length} Slide)
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                                        PPTX
                                      </span>
                                      {m.createdSlides.theme && (
                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                                          {m.createdSlides.theme}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-[#888] truncate max-w-[200px] sm:max-w-xs">
                                      {cleanLatexMath(m.createdSlides.title)}
                                      {m.createdSlides.subtitle ? ` — ${cleanLatexMath(m.createdSlides.subtitle)}` : ""}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setCustomizingSlides(m.createdSlides!)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#202020] border border-slate-200 dark:border-[#333] hover:bg-slate-100 dark:hover:bg-[#2a2a2a] active:scale-95 shadow-2xs transition-all cursor-pointer"
                                    title="Kustomisasi identitas presenter, instansi, dan watermark slide presentasi"
                                  >
                                    <Sliders className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Kustomisasi</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => downloadCreatedSlides(m.createdSlides!)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 shadow-xs transition-all cursor-pointer shrink-0"
                                    title="Unduh file presentasi PowerPoint (.pptx)"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Unduh PPTX</span>
                                  </button>
                                </div>
                              </div>

                              {/* Slide Preview Viewer Box */}
                              <div className="relative rounded-2xl border border-slate-200/90 dark:border-[#2d2d2d] bg-slate-50/50 dark:bg-[#141414] p-4 sm:p-5 shadow-xs flex flex-col justify-between overflow-hidden">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-[#242424] pb-2.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shrink-0">
                                        Slide {currentIdx + 1}
                                      </span>
                                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug truncate">
                                        {cleanLatexMath(activeSlide.title)}
                                      </h4>
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-400 dark:text-[#777] shrink-0 ml-2">
                                      {currentIdx + 1} dari {slides.length}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                                    {activeSlide.bullets.map((bullet, bIdx) => {
                                      const parsed = parseBulletPoint(bullet);
                                      return (
                                        <div
                                          key={bIdx}
                                          className="p-2.5 rounded-xl bg-white dark:bg-[#1c1c1c] border border-slate-200/80 dark:border-[#2a2a2a] shadow-2xs flex items-start gap-2.5"
                                        >
                                          <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                            0{bIdx + 1}
                                          </span>
                                          <div className="min-w-0 text-xs">
                                            {parsed.desc ? (
                                              <>
                                                <span className="font-semibold text-slate-900 dark:text-white block leading-snug">
                                                  {parsed.title}
                                                </span>
                                                <span className="text-slate-600 dark:text-[#aaa] text-[11px] leading-relaxed block mt-0.5">
                                                  {parsed.desc}
                                                </span>
                                              </>
                                            ) : (
                                              <span className="text-slate-700 dark:text-[#ccc] leading-relaxed block">
                                                {parsed.title}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {activeSlide.notes && (
                                    <div className="mt-2 p-2.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-[11px] text-slate-600 dark:text-[#bbb] flex items-start gap-2">
                                      <span className="shrink-0 text-xs">💡</span>
                                      <div>
                                        <strong className="text-amber-700 dark:text-amber-400 font-semibold mr-1">Catatan Pemateri:</strong>
                                        <span className="italic">{cleanLatexMath(activeSlide.notes)}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/70 dark:border-[#242424]">
                                  <div className="flex items-center gap-1">
                                    {slides.map((_, dotIdx) => (
                                      <button
                                        key={dotIdx}
                                        type="button"
                                        onClick={() => setActiveSlideIndices((prev) => ({ ...prev, [m.id]: dotIdx }))}
                                        className={`h-1.5 rounded-full transition-all cursor-pointer ${dotIdx === currentIdx
                                          ? "w-5 bg-amber-500"
                                          : "w-1.5 bg-slate-300 dark:bg-[#333] hover:bg-slate-400"
                                          }`}
                                        title={`Lihat Slide ${dotIdx + 1}`}
                                      />
                                    ))}
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handlePrevSlide(m.id, slides.length)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#252525] transition cursor-pointer"
                                      title="Slide Sebelumnya"
                                    >
                                      <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-[#888]">
                                      {currentIdx + 1}/{slides.length}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleNextSlide(m.id, slides.length)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#252525] transition cursor-pointer"
                                      title="Slide Berikutnya"
                                    >
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Message Quick Action Rail */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-[#222]">
                          <button
                            type="button"
                            onClick={() => handleCopyText(m.content, m.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-800 dark:hover:text-[#eee] hover:bg-slate-100 dark:hover:bg-[#202020] transition cursor-pointer"
                            title="Salin jawaban AI"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === m.id ? "Tersalin" : "Salin"}</span>
                          </button>

                          {/* Ekspor Dropdown Menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveExportMenuMsgId(activeExportMenuMsgId === m.id ? null : m.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#202020] transition cursor-pointer"
                              title="Ekspor pesan ke PDF, Word, atau Slide"
                            >
                              <FileDown className="w-3 h-3" />
                              <span>Ekspor</span>
                              <ChevronDown className="w-2.5 h-2.5" />
                            </button>

                            {activeExportMenuMsgId === m.id && (
                              <div className="absolute left-0 bottom-full mb-1.5 w-60 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-slate-200/80 dark:border-[#2a2a2a] p-1.5 z-40 animate-in fade-in slide-in-from-bottom-2">
                                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-[#777] border-b border-slate-100 dark:border-[#252525] mb-1 flex items-center justify-between">
                                  <span>UNDUH / KUSTOMISASI</span>
                                  <Sliders className="w-3 h-3 text-slate-400" />
                                </div>

                                {/* PDF Export & Customize */}
                                <div className="flex items-center w-full group/item hover:bg-slate-100 dark:hover:bg-[#252525] rounded-lg transition">
                                  <button
                                    type="button"
                                    onClick={() => handleExportDocument(m, "pdf")}
                                    disabled={exportingFormat === `${m.id}-pdf`}
                                    className="flex-1 flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-[#ddd] transition cursor-pointer text-left"
                                  >
                                    <div className="w-5 h-5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-[10px]">
                                      PDF
                                    </div>
                                    <span className="flex-1">Dokumen PDF (.pdf)</span>
                                    {exportingFormat === `${m.id}-pdf` && <Loader2 className="w-3 h-3 animate-spin text-rose-600" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCustomizeExport(m, "pdf")}
                                    className="p-1.5 mr-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-200/60 dark:hover:bg-[#333] transition cursor-pointer"
                                    title="Kustomisasi identitas, font & kop surat PDF"
                                  >
                                    <Sliders className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Word DOCX Export & Customize */}
                                <div className="flex items-center w-full group/item hover:bg-slate-100 dark:hover:bg-[#252525] rounded-lg transition">
                                  <button
                                    type="button"
                                    onClick={() => handleExportDocument(m, "docx")}
                                    disabled={exportingFormat === `${m.id}-docx`}
                                    className="flex-1 flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-[#ddd] transition cursor-pointer text-left"
                                  >
                                    <div className="w-5 h-5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                                      DOC
                                    </div>
                                    <span className="flex-1">Dokumen Word (.docx)</span>
                                    {exportingFormat === `${m.id}-docx` && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCustomizeExport(m, "docx")}
                                    className="p-1.5 mr-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-slate-200/60 dark:hover:bg-[#333] transition cursor-pointer"
                                    title="Kustomisasi identitas, font & kop surat Word"
                                  >
                                    <Sliders className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Excel XLSX Export & Customize */}
                                <div className="flex items-center w-full group/item hover:bg-slate-100 dark:hover:bg-[#252525] rounded-lg transition">
                                  <button
                                    type="button"
                                    onClick={() => handleExportDocument(m, "xlsx")}
                                    disabled={exportingFormat === `${m.id}-xlsx`}
                                    className="flex-1 flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-[#ddd] transition cursor-pointer text-left"
                                  >
                                    <div className="w-5 h-5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                                      XLS
                                    </div>
                                    <span className="flex-1">Spreadsheet Excel (.xlsx)</span>
                                    {exportingFormat === `${m.id}-xlsx` && <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCustomizeExport(m, "xlsx")}
                                    className="p-1.5 mr-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md hover:bg-slate-200/60 dark:hover:bg-[#333] transition cursor-pointer"
                                    title="Kustomisasi tema warna, sheet & layout tabel Excel"
                                  >
                                    <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  </button>
                                </div>

                                {/* PPTX Export & Customize */}
                                <div className="flex items-center w-full group/item hover:bg-slate-100 dark:hover:bg-[#252525] rounded-lg transition">
                                  <button
                                    type="button"
                                    onClick={() => handleExportSlides(m)}
                                    disabled={exportingFormat === `${m.id}-pptx`}
                                    className="flex-1 flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-[#ddd] transition cursor-pointer text-left"
                                  >
                                    <div className="w-5 h-5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-[10px]">
                                      PPT
                                    </div>
                                    <span className="flex-1">Slide Presentasi (.pptx)</span>
                                    {exportingFormat === `${m.id}-pptx` && <Loader2 className="w-3 h-3 animate-spin text-amber-600" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCustomizeExport(m, "pptx")}
                                    className="p-1.5 mr-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-md hover:bg-slate-200/60 dark:hover:bg-[#333] transition cursor-pointer"
                                    title="Kustomisasi tema & presenter slide presentasi"
                                  >
                                    <Sliders className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleGenerateImageForMessage(m)}
                                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-[#ddd] hover:bg-slate-100 dark:hover:bg-[#252525] transition cursor-pointer text-left"
                                >
                                  <div className="w-5 h-5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                    <ImageIcon className="w-3 h-3" />
                                  </div>
                                  <span className="flex-1">Bikin Gambar AI</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Text-to-Speech Read Aloud Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleSpeechSynthesis(m.id, m.content)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition cursor-pointer ${speakingMessageId === m.id
                              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 font-semibold"
                              : "text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#202020]"
                              }`}
                            title={speakingMessageId === m.id ? "Hentikan pembacaan suara" : "Dengarkan jawaban (Text-to-Speech)"}
                          >
                            {speakingMessageId === m.id ? (
                              <VolumeX className="w-3 h-3 text-indigo-600 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3 h-3" />
                            )}
                            <span>{speakingMessageId === m.id ? "Berhenti" : "Dengarkan"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRetryMessage(m.id)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#202020] transition cursor-pointer disabled:opacity-40"
                            title="Muatkan ulang jawaban AI"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Muatkan ulang</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExportToNotes(m)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-[#202020] transition cursor-pointer"
                            title="Simpan ke Catatan Belajar"
                          >
                            <BookmarkPlus className="w-3 h-3" />
                            <span>Simpan Catatan</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExportToTodo(m)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#202020] transition cursor-pointer"
                            title="Tambah sebagai Tugas To-Do"
                          >
                            <ListTodo className="w-3 h-3" />
                            <span>Buat To-Do</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Thinking Indicator (only shown if not already rendering inline streaming placeholder) */}
            {isLoading && !messages.some((m) => m.isStreaming) && (
              <div className="flex gap-3.5 justify-start">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#7f7f7f] py-2">
                  <span>{APP_NAME} sedang menyusun bimbingan</span>
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse [animation-delay:200ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse [animation-delay:400ms]" />
                  </span>
                </div>
              </div>
            )}

            {/* Suggested Follow-up Prompts */}
            {!isLoading &&
              current?.suggestedPrompts &&
              current.suggestedPrompts.length > 0 && (
                <div className="pt-2 pl-11 space-y-1.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Langkah Diskusi Selanjutnya:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {current.suggestedPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(p)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1c1c1c] hover:bg-slate-200/80 dark:hover:bg-[#282828] text-xs text-slate-700 dark:text-[#ccc] hover:text-slate-900 dark:hover:text-[#fff] border border-slate-200/60 dark:border-[#282828] transition-all cursor-pointer text-left font-medium"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      {/* ── 3. Docked Bottom Input Bar (When Messages Exist) ── */}
      {messages.length > 0 && (
        <div className="shrink-0 px-3 sm:px-6 pb-2.5 pt-1.5 bg-gradient-to-t from-white via-white/95 dark:from-[#0e0e0e] dark:via-[#0e0e0e]/95 to-transparent">
          {renderInputBar(false)}
        </div>
      )}
        </div>

        {/* ── 3.5 DUAL SPLIT WORKSPACE (FOR 'split' MODE) ── */}
        {layoutMode === "split" && renderSplitWorkspace()}
      </div>

      {/* ── 4. File Content Preview Modal (PDF, Images, Code, Docs) ── */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#282828] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/80 dark:border-[#262626] bg-slate-50/70 dark:bg-[#1a1a1a]/70">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {/* Format Box Badge */}
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-black uppercase tracking-wider shrink-0 ${getFileFormatBadge(previewFile.name, previewFile.type).badgeClass
                    }`}
                >
                  {getFileFormatBadge(previewFile.name, previewFile.type).label}
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-[#f0f0f0] truncate">
                    {previewFile.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#888]">
                    {formatFileSize(previewFile.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {previewFile.dataUrl && (
                  <a
                    href={previewPdfBlobUrl || previewFile.dataUrl}
                    download={previewFile.name}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#242424] text-slate-700 dark:text-[#ddd] hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-[#333] shadow-2xs transition cursor-pointer"
                    title="Buka dokumen di tab baru / unduh"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Tab Baru</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#282828] transition cursor-pointer"
                  title="Tutup pratinjau"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-3 sm:p-4 bg-slate-100/50 dark:bg-[#111111]/80 min-h-[400px]">
              {previewFile.type === "image" ||
                /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(previewFile.name) ? (
                <div className="flex flex-col items-center justify-center min-h-[350px]">
                  {previewFile.dataUrl ? (
                    <img
                      src={previewFile.dataUrl}
                      alt={previewFile.name}
                      className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-md border border-slate-200 dark:border-[#333]"
                    />
                  ) : (
                    <p className="text-xs text-slate-400">
                      Pratinjau gambar tidak tersedia.
                    </p>
                  )}
                </div>
              ) : previewFile.type === "pdf" ||
                previewFile.name.toLowerCase().endsWith(".pdf") ? (
                <div className="w-full h-full flex flex-col min-h-[500px] h-[75vh]">
                  {previewPdfBlobUrl ? (
                    <iframe
                      src={`${previewPdfBlobUrl}#toolbar=1&navpanes=1`}
                      className="w-full h-full rounded-xl border border-slate-200 dark:border-[#2b2b2b] bg-white shadow-sm"
                      title={previewFile.name}
                    />
                  ) : (
                    <div className="p-4 bg-white dark:bg-[#161616] rounded-xl border border-slate-200 dark:border-[#262626] max-h-[70vh] overflow-y-auto">
                      <pre className="text-xs text-slate-800 dark:text-[#ddd] whitespace-pre-wrap font-mono leading-relaxed">
                        {previewFile.extractedText || "File PDF terlampir."}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-[#141414] text-slate-100 rounded-xl border border-[#2b2b2b] max-h-[70vh] overflow-y-auto font-mono text-xs leading-relaxed">
                  <pre className="whitespace-pre-wrap break-words">
                    {previewFile.extractedText ||
                      "Tidak ada konten teks yang dapat ditampilkan."}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Google Workspace Link Input Modal ── */}
      {isWorkspaceModalOpen && (() => {
        const parsed = workspaceUrlInput.trim() ? parseGoogleWorkspaceUrl(workspaceUrlInput.trim()) : null;
        const badge = parsed ? getWorkspaceBadge(parsed.type) : null;

        return (
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setIsWorkspaceModalOpen(false)}
          >
            <div
              className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-[#151515] border border-slate-200/80 dark:border-[#2a2a2a] flex flex-col animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#242424]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Tautkan Google Workspace
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#888]">
                      Akses Google Docs, Sheets, Slides, & Drive
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWorkspaceModalOpen(false)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-[#eee] hover:bg-slate-100 dark:hover:bg-[#202020] flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#ccc]">
                    URL / Tautan Google Workspace
                  </label>
                  <input
                    type="url"
                    value={workspaceUrlInput}
                    onChange={(e) => setWorkspaceUrlInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/... atau document/d/..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
                    autoFocus
                  />
                </div>

                {/* Detected Type Badge */}
                {badge && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/80 dark:bg-[#1e1e1e] border border-slate-200/60 dark:border-[#2c2c2c] animate-in fade-in">
                    <span className="text-xs font-bold text-slate-600 dark:text-[#aaa]">Terdeteksi:</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${badge.badgeClass}`}>
                      {badge.label}
                    </span>
                    {parsed?.gid && (
                      <span className="text-xs text-slate-400">Sheet Tab #{parsed.gid}</span>
                    )}
                  </div>
                )}

                {/* Helpful Instruction Box */}
                <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                  <p className="font-semibold">💡 Tips Akses Dokumen:</p>
                  <p className="leading-relaxed text-[11px] text-amber-800 dark:text-amber-400">
                    Pastikan pengaturan tautan di Google Drive / Docs / Sheets disetel ke <strong>&quot;Siapa saja yang memiliki link&quot;</strong> (Anyone with the link can view) agar AI dapat mengunduh dan membaca isinya secara instan tanpa kendala autentikasi.
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50/80 dark:bg-[#181818] border-t border-slate-100 dark:border-[#242424]">
                <button
                  type="button"
                  onClick={() => setIsWorkspaceModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#aaa] hover:bg-slate-200/70 dark:hover:bg-[#252525] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertWorkspaceLink(false)}
                  disabled={!workspaceUrlInput.trim()}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-[#282828] text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-[#333] transition cursor-pointer disabled:opacity-40"
                >
                  Sisipkan ke Chat
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertWorkspaceLink(true)}
                  disabled={!workspaceUrlInput.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analisis Langsung</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 6.5 YouTube Video Link & Analysis Modal ── */}
      {isYouTubeModalOpen && (() => {
        const parsed = youtubeUrlInput.trim() ? parseYouTubeUrl(youtubeUrlInput.trim()) : null;
        const currentMeta = youtubeMetaPreview || parsed;

        return (
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setIsYouTubeModalOpen(false)}
          >
            <div
              className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-[#151515] border border-slate-200/80 dark:border-[#2a2a2a] flex flex-col animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#242424]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shadow-2xs">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Buka & Analisis Video YouTube
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#888]">
                      AI akan menonton, merangkum, dan menganalisis materi video
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsYouTubeModalOpen(false)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-[#eee] hover:bg-slate-100 dark:hover:bg-[#202020] flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#ccc] flex items-center justify-between">
                    <span>URL / Tautan Video YouTube</span>
                    {isLoadingYouTubeMeta && (
                      <span className="text-[11px] text-red-500 flex items-center gap-1 font-normal">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Mengambil info video...
                      </span>
                    )}
                  </label>
                  <input
                    type="url"
                    value={youtubeUrlInput}
                    onChange={(e) => setYoutubeUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500 transition"
                    autoFocus
                  />
                </div>

                {/* Video Preview Card when URL is recognized */}
                {currentMeta && (
                  <div className="rounded-2xl border border-red-200/80 dark:border-red-950/60 bg-red-50/40 dark:bg-red-950/20 p-3 space-y-2.5 animate-in fade-in">
                    <div className="flex items-start gap-3">
                      <div className="w-24 aspect-video rounded-xl bg-slate-900 overflow-hidden shrink-0 relative border border-slate-200/40 dark:border-[#333]">
                        {currentMeta.thumbnailUrl ? (
                          <img
                            src={currentMeta.thumbnailUrl}
                            alt={currentMeta.title || "Thumbnail"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-red-500">
                            <Youtube className="w-6 h-6" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="w-5 h-5 text-white/90 fill-white" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white inline-block mb-1">
                          Video Siap
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                          {currentMeta.title || `YouTube Video (${currentMeta.videoId})`}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {currentMeta.authorName || "YouTube Channel"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Preset Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#ccc]">
                    Tujuan Analisis Video AI
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setYoutubeAnalysisPreset("summary")}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col gap-1 ${youtubeAnalysisPreset === "summary"
                        ? "bg-red-50 dark:bg-red-950/40 border-red-500 dark:border-red-500 text-red-900 dark:text-red-200 font-semibold"
                        : "bg-slate-50 dark:bg-[#1c1c1c] border-slate-200 dark:border-[#333] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-[#444]"
                        }`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        <span>📝 Rangkum Materi</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Konsep inti & pesan utama
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setYoutubeAnalysisPreset("timestamps")}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col gap-1 ${youtubeAnalysisPreset === "timestamps"
                        ? "bg-red-50 dark:bg-red-950/40 border-red-500 dark:border-red-500 text-red-900 dark:text-red-200 font-semibold"
                        : "bg-slate-50 dark:bg-[#1c1c1c] border-slate-200 dark:border-[#333] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-[#444]"
                        }`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        <span>⏱️ Garis Waktu</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Poin penting & timeline [MM:SS]
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setYoutubeAnalysisPreset("quiz")}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col gap-1 ${youtubeAnalysisPreset === "quiz"
                        ? "bg-red-50 dark:bg-red-950/40 border-red-500 dark:border-red-500 text-red-900 dark:text-red-200 font-semibold"
                        : "bg-slate-50 dark:bg-[#1c1c1c] border-slate-200 dark:border-[#333] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-[#444]"
                        }`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        <span>❓ Kuis Pemahaman</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Soal latihan dari video
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setYoutubeAnalysisPreset("notes")}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col gap-1 ${youtubeAnalysisPreset === "notes"
                        ? "bg-red-50 dark:bg-red-950/40 border-red-500 dark:border-red-500 text-red-900 dark:text-red-200 font-semibold"
                        : "bg-slate-50 dark:bg-[#1c1c1c] border-slate-200 dark:border-[#333] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-[#444]"
                        }`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        <span>📄 Catatan Materi</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Simpan otomatis ke catatan
                      </span>
                    </button>
                  </div>
                </div>

                {/* Info Note */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#1e1e1e] border border-slate-200/80 dark:border-[#2a2a2a] text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-red-500" />
                    <span>Kemampuan Gemini Multimodal Video:</span>
                  </p>
                  <p className="leading-relaxed text-[11px]">
                    Gemini secara native menonton video publik YouTube (konten visual & percakapan). Video dapat langsung diputar di dalam bubble chat saat analisis selesai.
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50/80 dark:bg-[#181818] border-t border-slate-100 dark:border-[#242424]">
                <button
                  type="button"
                  onClick={() => setIsYouTubeModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-[#aaa] hover:bg-slate-200/70 dark:hover:bg-[#252525] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertYouTubeVideo(false)}
                  disabled={!youtubeUrlInput.trim()}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-[#282828] text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-[#333] transition cursor-pointer disabled:opacity-40"
                >
                  Sisipkan ke Chat
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertYouTubeVideo(true)}
                  disabled={!youtubeUrlInput.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Analisis Video Langsung</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 7. Document & Presentation Style Customizer Modal ── */}
      <DocumentCustomizerModal
        isOpen={!!customizingDoc || !!customizingSlides}
        onClose={() => {
          setCustomizingDoc(null);
          setCustomizingSlides(null);
        }}
        document={customizingDoc?.doc}
        slides={customizingSlides}
        fallbackContent={customizingDoc?.fallbackText}
        onSuccess={(msg) => {
          toast.success(msg);
        }}
      />
    </div>
  );
};