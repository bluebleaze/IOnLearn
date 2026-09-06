"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import Markdown from "react-markdown";
import confetti from "canvas-confetti";
import {
  AIConfig,
  ChatAttachment,
  ChatMessage,
  TodoTask,
  UserPreferences,
  StudyNote,
  PersonalTodo,
} from "../types";
import { sendChatMessageToAI } from "../services/aiService";
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
  type: "pdf" | "image" | "code" | "doc";
  dataUrl?: string;
  extractedText?: string;
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

  // Drawer History state
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

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

  // @mention Autocomplete
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contextRef = useRef<HTMLDivElement>(null);

  // Synchronize Tasks and Notes
  useEffect(() => {
    setTasks(loadTasks());
    setNotes(loadNotes());
  }, [propTasks, propNotes]);

  // Close context dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setIsContextOpen(false);
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
    const newSession = createSession(taskId, noteId, currentMode);
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
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentId
          ? { ...s, taskId: taskId || undefined, noteId: undefined }
          : s
      )
    );
    setIsContextOpen(false);
    setMentionQuery(null);
  };

  const handleSelectNoteContext = (noteId: string | undefined) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentId
          ? { ...s, noteId: noteId || undefined, taskId: undefined }
          : s
      )
    );
    setIsContextOpen(false);
    setMentionQuery(null);
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
    if (typeof msg !== "string" && msg.createdNote) {
      const newNote: StudyNote = {
        id: `note-${Date.now()}`,
        title: msg.createdNote.title,
        content: msg.createdNote.content,
        subject: msg.createdNote.subject || activeTask?.courseName || activeNote?.subject || "Belajar AI",
        tags: msg.createdNote.tags && msg.createdNote.tags.length > 0 ? msg.createdNote.tags : ["AI Copilot", currentMode],
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

    const messageContent = typeof msg === "string" ? msg : msg.content;
    const cleanContent = messageContent.replace(/```json[\s\S]*?```/g, "").trim();
    const noteTitle = activeTask
      ? `Catatan AI: ${activeTask.title}`
      : activeNote
        ? `Lanjutan: ${activeNote.title}`
        : `Catatan AI (${new Date().toLocaleDateString("id-ID")})`;

    const newNote: StudyNote = {
      id: `note-${Date.now()}`,
      title: noteTitle,
      content: cleanContent || messageContent,
      subject: activeTask?.courseName || activeNote?.subject || "Belajar AI",
      tags: ["AI Copilot", currentMode],
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

  const handleRemoveAttachment = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Textarea input and @mention detector
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputPrompt(val);

    // Auto resize
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;

    // Detect @mention trigger
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtMatch = textBeforeCursor.match(/@([\w\s-]*)$/);

    if (lastAtMatch) {
      setMentionQuery(lastAtMatch[1].toLowerCase());
    } else {
      setMentionQuery(null);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    let userPromptText = (customPrompt || inputPrompt).trim();
    if (!userPromptText && attachedFiles.length === 0) return;
    if (isLoading) return;

    // Build the AI prompt with attached file context safely
    let defaultPrompt = "Tolong analisa dokumen/materi yang saya lampirkan ini.";
    if (attachedFiles.some((f) => f.type === "image")) {
      defaultPrompt =
        "Tolong analisa dan jelaskan foto/gambar yang saya lampirkan ini.";
    } else if (attachedFiles.some((f) => f.type === "pdf")) {
      defaultPrompt =
        "Tolong analisa dan jelaskan isi materi dari file PDF yang saya lampirkan ini.";
    }

    let aiPromptPayload = userPromptText || defaultPrompt;
    const textDocs = attachedFiles.filter((f) => f.extractedText);
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
        title: activeNote.title,
        description: `${activeNote.content}\n\n${activeNote.summary ? `Rangkuman AI:\n${activeNote.summary}` : ""
          }`,
        courseName: activeNote.subject || "Catatan Materi",
        isCompleted: false,
        priority: "medium",
        syncSource: "manual",
        createdAt: activeNote.createdAt,
        updatedAt: activeNote.updatedAt || activeNote.createdAt,
      };
    }

    const currentAttachments: ChatAttachment[] = attachedFiles.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      dataUrl: f.dataUrl,
      extractedText: f.extractedText,
    }));

    setInputPrompt("");
    setAttachedFiles([]);
    setMentionQuery(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Store clean display text in chat history (so huge file dump doesn't freeze the DOM or localStorage)
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content:
        userPromptText ||
        (attachedFiles.some((f) => f.type === "image")
          ? "Analisis Foto/Gambar"
          : "Analisis Dokumen Terlampir"),
      attachments: currentAttachments.map((a) => ({
        name: a.name,
        size: a.size,
        type: a.type,
        dataUrl: a.dataUrl,
        extractedText: a.extractedText,
      })),
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMessage];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentId
          ? { ...s, messages: nextMessages, updatedAt: Date.now() }
          : s
      )
    );

    setIsLoading(true);

    try {
      const chatHistory = nextMessages.map((m, idx) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content:
          idx === nextMessages.length - 1 ? aiPromptPayload : m.content,
        attachments:
          idx === nextMessages.length - 1 ? currentAttachments : undefined,
      }));

      const res = await sendChatMessageToAI(
        chatHistory,
        contextualTask,
        userPreferences,
        aiConfig,
        currentMode
      );

      // Automatically handle Note creation if AI produced createdNote
      let noteCreatedId: string | undefined;
      if (res.createdNote && res.createdNote.title && res.createdNote.content) {
        noteCreatedId = `note-${Date.now()}`;
        const newStudyNote: StudyNote = {
          id: noteCreatedId,
          title: res.createdNote.title,
          content: res.createdNote.content,
          subject: res.createdNote.subject || activeTask?.courseName || activeNote?.subject || "Catatan AI",
          tags: res.createdNote.tags && res.createdNote.tags.length > 0 ? res.createdNote.tags : ["AI Copilot", currentMode],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addNote(newStudyNote);
        setNotes(loadNotes());
        try {
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
        } catch {}
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
        } catch {}
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
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: res.reply,
        createdNote: res.createdNote ? { ...res.createdNote, id: noteCreatedId } : undefined,
        createdTodo: createdTodoObj || undefined,
        timestamp: res.timestamp || Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentId
            ? {
              ...s,
              messages: [...nextMessages, assistantMessage],
              suggestedPrompts: res.suggestedPrompts || [],
              updatedAt: Date.now(),
            }
            : s
        )
      );
    } catch (err: any) {
      toast.error("Gagal memproses pesan AI", {
        description: err.message || "Periksa koneksi atau API key Anda.",
      });
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `⚠️ Maaf, terjadi kendala saat menghubungi AI: ${err.message || "Gagal memproses permintaan."
          }. Silakan cek konfigurasi API Key di menu Pengaturan.`,
        timestamp: Date.now(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentId
            ? {
              ...s,
              messages: [...nextMessages, errorMessage],
              updatedAt: Date.now(),
            }
            : s
        )
      );
    } finally {
      setIsLoading(false);
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

    setIsLoading(true);

    // Update sessions to roll back to that user message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentId
          ? {
              ...s,
              messages: historyToKeep,
              updatedAt: Date.now(),
            }
          : s
      )
    );

    try {
      let contextualTask = activeTask;
      if (!contextualTask && activeNote) {
        contextualTask = {
          id: activeNote.id,
          title: activeNote.title,
          description: `${activeNote.content}\n\n${activeNote.summary ? `Rangkuman AI:\n${activeNote.summary}` : ""}`,
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

      const res = await sendChatMessageToAI(
        apiMessages,
        contextualTask,
        userPreferences,
        aiConfig,
        currentMode
      );

      let noteCreatedId: string | undefined = undefined;
      if (res.createdNote && res.createdNote.title && res.createdNote.content) {
        noteCreatedId = `note-${Date.now()}`;
        const newStudyNote: StudyNote = {
          id: noteCreatedId,
          title: res.createdNote.title,
          content: res.createdNote.content,
          subject: res.createdNote.subject || activeTask?.courseName || activeNote?.subject || "Catatan AI",
          tags: res.createdNote.tags && res.createdNote.tags.length > 0 ? res.createdNote.tags : ["AI Copilot", currentMode],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addNote(newStudyNote);
        setNotes(loadNotes());
        try {
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
        } catch {}
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
        } catch {}
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
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: res.reply,
        createdNote: res.createdNote ? { ...res.createdNote, id: noteCreatedId } : undefined,
        createdTodo: createdTodoObj || undefined,
        timestamp: res.timestamp || Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentId
            ? {
                ...s,
                messages: [...historyToKeep, assistantMessage],
                suggestedPrompts: res.suggestedPrompts || [],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } catch (err: any) {
      toast.error("Gagal mengirim ulang pesan", {
        description: err.message || "Periksa koneksi atau API key Anda.",
      });
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `⚠️ Maaf, terjadi kendala saat mengirim ulang pesan: ${
          err.message || "Gagal memproses permintaan."
        }`,
        timestamp: Date.now(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentId
            ? {
                ...s,
                messages: [...historyToKeep, errorMessage],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } finally {
      setIsLoading(false);
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

  // Mention Suggestions Filter
  const mentionSuggestions = useMemo(() => {
    if (mentionQuery === null) return [];
    const taskMatches = tasks
      .filter((t) => t.title.toLowerCase().includes(mentionQuery))
      .slice(0, 4)
      .map((t) => ({ type: "task" as const, id: t.id, title: t.title, subtitle: t.courseName || "Tugas" }));
    const noteMatches = notes
      .filter((n) => n.title.toLowerCase().includes(mentionQuery))
      .slice(0, 4)
      .map((n) => ({ type: "note" as const, id: n.id, title: n.title, subtitle: n.subject || "Catatan" }));
    return [...taskMatches, ...noteMatches];
  }, [mentionQuery, tasks, notes]);

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
                        className="hover:text-rose-500 text-slate-400 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition"
                        title="Hapus lampiran"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mention Popover Menu */}
          {mentionQuery !== null && mentionSuggestions.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 bg-white dark:bg-[#181818] rounded-2xl shadow-xl border border-slate-200/80 dark:border-[#2b2b2b] p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                <AtSign className="w-3 h-3 text-indigo-500" />
                <span>Pilih Konteks (@mention)</span>
              </div>
              <div className="space-y-1 mt-1 max-h-48 overflow-y-auto pr-1 text-xs">
                {mentionSuggestions.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    onClick={() => {
                      if (item.type === "task") handleSelectTaskContext(item.id);
                      else handleSelectNoteContext(item.id);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#242424] transition flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-[#f0f0f0] truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-[#888] truncate">
                        {item.type === "task" ? "📌 " : "📝 "}
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Box Shell */}
        <div className="relative flex flex-col bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-[#262626] rounded-2xl shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/40 transition-all">
          <textarea
            ref={textareaRef}
            rows={isCentered ? 3 : 1}
            value={inputPrompt}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              activeTask
                ? `Tanyakan tentang tugas "${activeTask.title}"…`
                : activeNote
                  ? `Tanyakan tentang catatan "${activeNote.title}"…`
                  : "Tanyakan konsep, rumus, kirim foto/PDF, atau ketik @ untuk panggil materi… (Enter untuk kirim)"
            }
            className="w-full bg-transparent border-0 focus:outline-none text-xs sm:text-sm text-slate-900 dark:text-[#ececec] placeholder:text-slate-400 dark:placeholder:text-[#666] pt-3.5 px-3.5 resize-none max-h-40 min-h-[24px] leading-relaxed"
          />

          {/* Action Row inside Textarea */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <div className="flex items-center gap-1 text-slate-400">
              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-[#222]"
                title="Lampirkan Dokumen (PDF, Foto/Gambar, Catatan, Kode)"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.json,.js,.ts,.tsx,.py,.java,.c,.cpp,.html,.css,.csv,image/*,application/pdf,text/*"
              />

              {/* @mention Shortcut Trigger */}
              <button
                type="button"
                onClick={() => {
                  setInputPrompt((prev) => prev + "@");
                  setMentionQuery("");
                  textareaRef.current?.focus();
                }}
                className="p-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-[#222]"
                title="Panggil tugas atau catatan (@)"
              >
                <AtSign className="w-4 h-4" />
              </button>

              {/* Quick Context Selector Indicator */}
              <button
                type="button"
                onClick={() => setIsContextOpen(true)}
                className="text-xs px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#222] font-medium text-slate-500 dark:text-[#888] flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3 h-3" />
                <span className="hidden sm:inline">Pilih Materi</span>
              </button>
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={
                (!inputPrompt.trim() && attachedFiles.length === 0) || isLoading
              }
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white transition-all shrink-0 shadow-2xs cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 dark:text-[#555] text-center mt-2">
          AI dapat melakukan kekeliruan. Selalu verifikasi jawaban sebelum dikumpulkan.
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#0e0e0e] overflow-hidden">
      {/* ── 1. SUB-HEADER CONTROL STRIP (Integrated, Non-Overlapping) ── */}
      <div className="shrink-0 flex items-center justify-between px-3 sm:px-5 py-2 border-b border-slate-200/80 dark:border-[#202020] bg-slate-50/60 dark:bg-[#121212] gap-2">
        {/* Left: Context Selector Pill */}
        <div className="relative" ref={contextRef}>
          <button
            type="button"
            onClick={() => setIsContextOpen(!isContextOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#1c1c1c] hover:bg-slate-200/80 dark:hover:bg-[#252525] text-xs font-semibold text-slate-700 dark:text-[#d0d0d0] transition cursor-pointer"
          >
            {activeTask ? (
              <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            ) : activeNote ? (
              <NotebookPen className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            )}
            <span className="max-w-[140px] sm:max-w-[240px] truncate">
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
            <div className="absolute left-0 top-full mt-1.5 w-80 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-slate-200/80 dark:border-[#2a2a2a] p-2.5 z-50 animate-in fade-in">
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

        {/* Right: Study Mode Switcher & History Drawer Button */}
        <div className="flex items-center gap-2">
          {/* Study Mode Selector Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-[#1c1c1c] p-0.5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleSetStudyMode("socratic")}
              className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${currentMode === "socratic"
                ? "bg-white dark:bg-[#282828] text-indigo-600 dark:text-indigo-300 shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-[#eee]"
                }`}
              title="Tutor Sokratik: Membimbing berpikir bertahap"
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sokratik</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetStudyMode("direct")}
              className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${currentMode === "direct"
                ? "bg-white dark:bg-[#282828] text-amber-600 dark:text-amber-300 shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-[#eee]"
                }`}
              title="Penjelasan Ringkas: Jawaban padat to-the-point"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ringkas</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetStudyMode("quizzer")}
              className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${currentMode === "quizzer"
                ? "bg-white dark:bg-[#282828] text-emerald-600 dark:text-emerald-300 shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-[#eee]"
                }`}
              title="Latihan & Kuis: Tantangan soal interaktif"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kuis</span>
            </button>
          </div>

          {/* History Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-[#1c1c1c] text-slate-700 dark:text-[#d0d0d0] hover:bg-slate-200/80 dark:hover:bg-[#252525] transition cursor-pointer"
            title="Buka Riwayat Percakapan"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Riwayat</span>
          </button>

          {/* New Chat Button */}
          <Button
            size="sm"
            onClick={() => handleNewChat()}
            className="gap-1 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white h-7 sm:h-8 px-2.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Baru</span>
          </Button>
        </div>
      </div>

      {/* ── SLIDE-OVER HISTORY DRAWER ── */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsHistoryDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50">
            <div className="w-screen max-w-xs bg-white dark:bg-[#141414] border-l border-slate-200/80 dark:border-[#262626] shadow-2xl animate-in slide-in-from-right flex flex-col">
              {/* Drawer Header */}
              <div className="p-3.5 border-b border-slate-200/70 dark:border-[#202020] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-[#f0f0f0]">
                    Riwayat Percakapan
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#202020] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Actions: New Chat & Search */}
              <div className="p-3 border-b border-slate-100 dark:border-[#1e1e1e] space-y-2">
                <Button
                  onClick={() => handleNewChat()}
                  className="w-full justify-center gap-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs h-9"
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

              {/* Drawer Sessions List */}
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
                          setIsHistoryDrawerOpen(false);
                        }}
                        className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer ${isSelected
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
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-slate-200/80 dark:hover:bg-[#282828] text-slate-400 hover:text-rose-600 transition shrink-0"
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
          </div>
        </div>
      )}

      {/* ── 2. Message Feed Area ── */}
      <div ref={scrollAreaRef} className="flex-1 min-h-0 overflow-y-auto">
        {messages.length === 0 ? (
          /* ── EMPTY STATE: CLEAN MINIMALIST CENTERED HERO ── */
          <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 sm:px-6 text-center max-w-2xl mx-auto">
            {/* Logo / Brand Mark */}
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-[#141414] border border-indigo-100 dark:border-[#262626] flex items-center justify-center mb-3.5 shadow-2xs">
              <img
                src="/logos/Logoionlearnkecil.png"
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
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {messages.map((m) => {
              const isUser = m.role === "user";

              return (
                <div
                  key={m.id}
                  className={`group flex gap-3.5 ${
                    isUser ? "justify-end" : "justify-start items-start"
                  }`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  {isUser ? (
                    <div className="flex flex-col items-end max-w-[86%] sm:max-w-[80%]">
                      {/* User Bubble */}
                      <div className="w-full bg-indigo-600 dark:bg-[#ececec] text-white dark:text-[#111] rounded-2xl rounded-br-xs px-4 py-3 text-xs sm:text-sm font-medium shadow-2xs">
                        <div className="space-y-2">
                          <p className="whitespace-pre-wrap">{m.content}</p>

                          {/* Render Attached Files as Rich Document Cards inside User Bubble */}
                          {m.attachments && m.attachments.length > 0 && (
                            <div className="space-y-2 pt-2">
                              {m.attachments.map((att, attIdx) => {
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
                        <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed break-words">
                          <Markdown
                            components={{
                              code: CodeBlock,
                              pre: ({ children }) => <>{children}</>,
                            }}
                          >
                            {m.content}
                          </Markdown>
                        </div>

                        {/* Interactive Created Note Card if AI made a note */}
                        {m.createdNote && (
                          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 dark:border-purple-400/20 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs shadow-xs">
                                  <NotebookPen className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-bold text-purple-900 dark:text-purple-300">
                                  Catatan Materi Tersimpan Otomatis
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => router.push("/notes")}
                                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>Buka Catatan</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="bg-white/80 dark:bg-[#1c1c1c] p-2.5 rounded-xl border border-purple-200/50 dark:border-[#333]">
                              <p className="text-xs font-bold text-slate-900 dark:text-[#eee]">
                                {m.createdNote.title}
                              </p>
                              {m.createdNote.subject && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
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
                            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 dark:border-emerald-400/20 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                                    Tugas To-Do Tersimpan Otomatis
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

                              <div className="bg-white/80 dark:bg-[#1c1c1c] p-3 rounded-xl border border-emerald-200/50 dark:border-[#333] space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-[#eee]">
                                      {todoData.title}
                                    </p>
                                    {todoData.description && (
                                      <p className="text-[11px] text-slate-500 dark:text-[#888] mt-0.5 leading-relaxed">
                                        {todoData.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {todoData.priority && (
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                          todoData.priority === "high"
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
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                        {todoData.category}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {subtasksList.length > 0 && (
                                  <div className="pt-2 border-t border-slate-100 dark:border-[#282828] space-y-1.5">
                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-[#888] block">
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

                        {/* Message Quick Action Rail */}
                        <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-[#222]">
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

            {/* Loading Thinking Indicator */}
            {isLoading && (
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
                        ✨ {p}
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
        <div className="shrink-0 px-4 sm:px-6 pb-4 pt-2 bg-gradient-to-t from-white via-white dark:from-[#141414] dark:via-[#141414] to-transparent">
          {renderInputBar(false)}
        </div>
      )}

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
                  className={`px-2 py-0.5 rounded-md text-xs font-black uppercase tracking-wider shrink-0 ${
                    getFileFormatBadge(previewFile.name, previewFile.type).badgeClass
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
    </div>
  );
};