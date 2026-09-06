"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  NotebookPen,
  Plus,
  Sparkles,
  Search,
  BookOpen,
  Trash2,
  Edit3,
  MessageSquareText,
  BrainCircuit,
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Share2,
  Tag,
  Clock,
  Send,
  Layers,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Link2,
  Table,
  Eye,
  Check,
  Copy,
} from "lucide-react";
import Markdown from "react-markdown";
import { Shell } from "@/components/Shell";
import { StudyNote, StudyNoteQuizItem } from "@/types";
import {
  loadNotes,
  addNote,
  updateNote,
  deleteNote,
  loadPreferences,
  loadAIConfig,
} from "@/lib/taskStore";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import confetti from "canvas-confetti";

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

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Active / selected note for viewing or editing
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Editor View State: Write or Preview
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  // Edit / Create Form state
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState("");

  // AI Actions State
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Quiz Modal / Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<StudyNoteQuizItem[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    const loaded = loadNotes();
    setNotes(loaded);
    setIsLoaded(true);

    const handleStorage = () => setNotes(loadNotes());
    window.addEventListener("taskStoreChange", handleStorage);
    return () => window.removeEventListener("taskStoreChange", handleStorage);
  }, []);

  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || null;
  }, [notes, activeNoteId]);

  // Unique subjects
  const subjects = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => {
      if (n.subject && n.subject.trim()) {
        set.add(n.subject.trim());
      }
    });
    return Array.from(set);
  }, [notes]);

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (selectedSubject !== "all" && n.subject !== selectedSubject) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = n.title.toLowerCase().includes(q);
        const mContent = n.content.toLowerCase().includes(q);
        const mSubj = n.subject?.toLowerCase().includes(q);
        if (!mTitle && !mContent && !mSubj) return false;
      }
      return true;
    });
  }, [notes, selectedSubject, searchQuery]);

  const handleStartCreate = () => {
    setActiveNoteId(null);
    setFormTitle("");
    setFormSubject("");
    setFormContent("");
    setFormTags("");
    setEditorTab("write");
    setIsEditing(true);
  };

  const handleStartEdit = (note: StudyNote) => {
    setActiveNoteId(note.id);
    setFormTitle(note.title);
    setFormSubject(note.subject || "");
    setFormContent(note.content);
    setFormTags(note.tags ? note.tags.join(", ") : "");
    setEditorTab("write");
    setIsEditing(true);
  };

  // Helper for inserting Markdown formatting syntax
  const insertMarkdown = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formContent.substring(start, end);
    let replacement = "";
    let cursorStartOffset = 0;
    let cursorEndOffset = 0;

    switch (format) {
      case "bold":
        replacement = selectedText ? `**${selectedText}**` : `**teks tebal**`;
        cursorStartOffset = selectedText ? start : start + 2;
        cursorEndOffset = selectedText ? start + replacement.length : start + 12;
        break;
      case "italic":
        replacement = selectedText ? `*${selectedText}*` : `*teks miring*`;
        cursorStartOffset = selectedText ? start : start + 1;
        cursorEndOffset = selectedText ? start + replacement.length : start + 12;
        break;
      case "strikethrough":
        replacement = selectedText ? `~~${selectedText}~~` : `~~teks coret~~`;
        cursorStartOffset = selectedText ? start : start + 2;
        cursorEndOffset = selectedText ? start + replacement.length : start + 12;
        break;
      case "h1":
        replacement = `\n# ${selectedText || "Judul Utama"}\n`;
        cursorStartOffset = start + 3;
        cursorEndOffset = start + replacement.length - 1;
        break;
      case "h2":
        replacement = `\n## ${selectedText || "Sub Judul"}\n`;
        cursorStartOffset = start + 4;
        cursorEndOffset = start + replacement.length - 1;
        break;
      case "h3":
        replacement = `\n### ${selectedText || "Poin Topik"}\n`;
        cursorStartOffset = start + 5;
        cursorEndOffset = start + replacement.length - 1;
        break;
      case "bullet":
        if (selectedText.includes("\n")) {
          replacement = selectedText
            .split("\n")
            .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
            .join("\n");
        } else {
          replacement = `- ${selectedText || "Poin daftar"}`;
        }
        cursorStartOffset = start;
        cursorEndOffset = start + replacement.length;
        break;
      case "number":
        if (selectedText.includes("\n")) {
          replacement = selectedText
            .split("\n")
            .map((line, idx) => `${idx + 1}. ${line.replace(/^\d+\.\s*/, "")}`)
            .join("\n");
        } else {
          replacement = `1. ${selectedText || "Poin bernomor"}`;
        }
        cursorStartOffset = start;
        cursorEndOffset = start + replacement.length;
        break;
      case "quote":
        if (selectedText.includes("\n")) {
          replacement = selectedText
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n");
        } else {
          replacement = `> ${selectedText || "Kutipan atau catatan penting"}`;
        }
        cursorStartOffset = start;
        cursorEndOffset = start + replacement.length;
        break;
      case "code":
        if (selectedText.includes("\n") || selectedText.length > 20) {
          replacement = `\`\`\`javascript\n${selectedText || "// Kode program di sini"}\n\`\`\``;
        } else {
          replacement = selectedText ? `\`${selectedText}\`` : `\`kode\``;
        }
        cursorStartOffset = start;
        cursorEndOffset = start + replacement.length;
        break;
      case "link":
        replacement = selectedText
          ? `[${selectedText}](https://contoh.com)`
          : `[Teks tautan](https://contoh.com)`;
        cursorStartOffset = start;
        cursorEndOffset = start + replacement.length;
        break;
      case "table":
        replacement = `\n| Kolom 1 | Kolom 2 | Kolom 3 |\n| :--- | :--- | :--- |\n| Data 1 | Data 2 | Data 3 |\n| Data 4 | Data 5 | Data 6 |\n`;
        cursorStartOffset = start;
        cursorEndOffset = start + replacement.length;
        break;
      default:
        return;
    }

    const newContent =
      formContent.substring(0, start) + replacement + formContent.substring(end);
    setFormContent(newContent);

    // Restore focus and precise selection range
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(cursorStartOffset, cursorEndOffset);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        insertMarkdown("bold");
      } else if (e.key.toLowerCase() === "i") {
        e.preventDefault();
        insertMarkdown("italic");
      } else if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        insertMarkdown("link");
      }
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error("Judul dan isi catatan wajib diisi.");
      return;
    }

    const tagsArray = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const now = new Date().toISOString();

    if (activeNoteId) {
      updateNote(activeNoteId, {
        title: formTitle.trim(),
        subject: formSubject.trim() || undefined,
        content: formContent.trim(),
        tags: tagsArray,
        updatedAt: now,
      });
      toast.success("Catatan berhasil diperbarui.");
    } else {
      const newNote: StudyNote = {
        id: `note-${Date.now()}`,
        title: formTitle.trim(),
        subject: formSubject.trim() || undefined,
        content: formContent.trim(),
        tags: tagsArray,
        createdAt: now,
        updatedAt: now,
      };
      addNote(newNote);
      setActiveNoteId(newNote.id);
      toast.success("Catatan baru berhasil disimpan.");
    }

    setNotes(loadNotes());
    setIsEditing(false);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Apakah kamu yakin ingin menghapus catatan materi ini?")) {
      deleteNote(id);
      setNotes(loadNotes());
      if (activeNoteId === id) {
        setActiveNoteId(null);
        setIsEditing(false);
        setActiveQuiz(null);
      }
      toast.success("Catatan berhasil dihapus.");
    }
  };

  // AI Feature: Summarize Note
  const handleAISummarize = async () => {
    if (!activeNote) return;
    setIsSummarizing(true);
    try {
      const prefs = loadPreferences();
      const aiConf = loadAIConfig();
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: `Kamu adalah AI asisten perangkum catatan akademik pintar. Buat rangkuman terstruktur, padat, dan jelas dari catatan materi siswa berikut. Gunakan bullet point untuk poin-poin utama dan highlight konsep terpenting. Berikan penjelasan dalam Bahasa Indonesia yang ramah dan mudah dimengerti.`,
          messages: [
            {
              role: "user",
              content: `Tolong buatkan rangkuman inti yang komprehensif untuk catatan materi berikut:\n\nJudul: ${activeNote.title}\nMata Pelajaran: ${activeNote.subject || "-"}\n\nIsi Catatan:\n${activeNote.content}`,
            },
          ],
          userPreferences: prefs,
          aiConfig: aiConf,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menghasilkan rangkuman AI.");
      }

      const data = await res.json();
      const summaryText = data.text;

      if (summaryText) {
        updateNote(activeNote.id, {
          summary: summaryText,
          updatedAt: new Date().toISOString(),
        });
        setNotes(loadNotes());
        toast.success("Rangkuman AI Berhasil Dibuat!");
      }
    } catch (err: any) {
      toast.error("Gagal Merangkum", { description: err.message });
    } finally {
      setIsSummarizing(false);
    }
  };

  // AI Feature: Generate Practice Quiz
  const handleAIGenerateQuiz = async () => {
    if (!activeNote) return;
    setIsGeneratingQuiz(true);
    try {
      const prefs = loadPreferences();
      const aiConf = loadAIConfig();
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: `Kamu adalah pembuat soal kuis akademik evaluatif. Berdasarkan materi yang diberikan, buatlah 3-5 soal pilihan ganda (4 opsi A, B, C, D) untuk menguji pemahaman siswa.
KEMBALIKAN HANYA ARRAY JSON VALID tanpa backtick markdown tambahan, dengan format:
[
  {
    "question": "Pertanyaan soal...",
    "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
    "correctAnswer": 0,
    "explanation": "Penjelasan mengapa jawaban ini benar..."
  }
]`,
          messages: [
            {
              role: "user",
              content: `Materi:\nJudul: ${activeNote.title}\n\nIsi:\n${activeNote.content}`,
            },
          ],
          userPreferences: prefs,
          aiConfig: aiConf,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal membuat kuis AI.");
      }

      const data = await res.json();
      let rawJson = data.text.trim();

      // Clean markdown code blocks if any
      if (rawJson.startsWith("```json")) {
        rawJson = rawJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (rawJson.startsWith("```")) {
        rawJson = rawJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const quizItems: StudyNoteQuizItem[] = JSON.parse(rawJson);

      if (Array.isArray(quizItems) && quizItems.length > 0) {
        updateNote(activeNote.id, {
          aiQuiz: quizItems,
          updatedAt: new Date().toISOString(),
        });
        setNotes(loadNotes());
        setActiveQuiz(quizItems);
        setUserAnswers({});
        setQuizSubmitted(false);
        toast.success("Kuis Latihan Siap!", {
          description: `${quizItems.length} soal latihan telah digenerate dari catatan ini.`,
        });
      }
    } catch (err: any) {
      toast.error("Gagal Membuat Kuis", { description: err.message });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleOpenInChat = () => {
    if (!activeNote) return;
    sessionStorage.setItem("chat_context_note", JSON.stringify(activeNote));
    router.push(`/chat?noteId=${activeNote.id}`);
  };

  return (
    <Shell>
      <div className="max-w-7xl mx-auto pb-16 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-lexend)] tracking-tight text-slate-900 dark:text-[#f3f3f3]">
              Catatan Materi
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#a3a3a3] mt-1">
              Ruang belajar mandiri untuk menyimpan materi kuliah berbasis Markdown, membuat rangkuman AI, dan latihan kuis interaktif.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleStartCreate}
              className="gap-1.5 rounded-[10px] text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tulis Catatan Baru</span>
            </Button>
          </div>
        </div>

        {/* Workspace Layout: Left (Notes List) & Right (Active View / Editor) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Note Directory */}
          <div className="lg:col-span-4 space-y-3">
            {/* Search & Subject Filters */}
            <div className="bg-white dark:bg-[#161616] rounded-2xl p-3.5 space-y-2.5 border border-slate-200/80 dark:border-[#262626] shadow-2xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari catatan atau materi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-900 dark:text-[#f3f3f3] placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {subjects.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  <button
                    onClick={() => setSelectedSubject("all")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      selectedSubject === "all"
                        ? "bg-white dark:bg-[#252525] text-slate-900 dark:text-[#f3f3f3] shadow-sm font-semibold"
                        : "text-slate-600 dark:text-[#888]"
                    }`}
                  >
                    Semua ({notes.length})
                  </button>
                  {subjects.map((subj) => (
                    <button
                      key={subj}
                      onClick={() => setSelectedSubject(subj)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                        selectedSubject === subj
                          ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold"
                          : "text-slate-600 dark:text-[#888]"
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Note Cards List */}
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50/50 dark:bg-[#141414]/50 rounded-2xl">
                <NotebookPen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-[#888]">
                  {notes.length === 0
                    ? "Belum ada catatan. Buat catatan pertamamu!"
                    : "Tidak ada catatan yang cocok dengan filter."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotes.map((note) => {
                  const isSelected = activeNoteId === note.id;
                  return (
                    <div
                      key={note.id}
                      onClick={() => {
                        setActiveNoteId(note.id);
                        setIsEditing(false);
                        setActiveQuiz(note.aiQuiz || null);
                        setUserAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left group ${
                        isSelected
                          ? "bg-white dark:bg-[#1c1c1c] border-indigo-500/80 dark:border-indigo-500/80 shadow-sm ring-1 ring-indigo-500/20"
                          : "bg-white dark:bg-[#161616] border-slate-200/80 dark:border-[#262626] hover:border-slate-300 dark:hover:border-[#333]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            {note.subject && (
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                                {note.subject}
                              </span>
                            )}
                            {note.summary && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                Rangkuman AI
                              </span>
                            )}
                          </div>
                          <h3 className="text-xs font-semibold text-slate-900 dark:text-[#f3f3f3] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {note.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-[#888] line-clamp-2 mt-1 leading-relaxed">
                            {note.content.replace(/[#*`~_\[\]()>-]/g, "")}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#222] flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(note.updatedAt || note.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex items-center gap-1 truncate max-w-[140px]">
                            <Tag className="w-2.5 h-2.5" />
                            <span>{note.tags.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Note Editor / Detailed Viewer */}
          <div className="lg:col-span-8">
            {isEditing ? (
              /* Note Edit / Create Form with Rich Markdown Toolbar */
              <form
                onSubmit={handleSaveNote}
                className="bg-white dark:bg-[#161616] rounded-2xl p-5 sm:p-6 shadow-2xs border border-slate-200/80 dark:border-[#262626] space-y-4"
              >
                {/* Form Header with Action Buttons */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#262626]">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-[#f3f3f3]">
                    {activeNoteId ? "Edit Catatan Materi" : "Tulis Catatan Materi Baru"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      className="text-xs rounded-xl"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                    >
                      Simpan Catatan
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Title Input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-[#ccc] block mb-1">
                      Judul Catatan / Topik Materi
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Algoritma Pencarian Binary Search & Kompleksitas Waktu"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-900 dark:text-[#f3f3f3] placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/80"
                      autoFocus
                    />
                  </div>

                  {/* Subject & Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-[#ccc] block mb-1">
                        Mata Pelajaran / Mata Kuliah
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Algoritma & Pemrograman"
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-900 dark:text-[#f3f3f3] placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/80"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-[#ccc] block mb-1">
                        Label / Tag (Pisahkan koma)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: uas, sorting, search"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-200/80 dark:border-[#2b2b2b] text-slate-900 dark:text-[#f3f3f3] placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/80"
                      />
                    </div>
                  </div>

                  {/* Markdown Editor Container */}
                  <div className="border border-slate-200/80 dark:border-[#2b2b2b] rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-[#181818]/60">
                    {/* Toolbar Header with Tab Switch & Formatting Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-slate-100/90 dark:bg-[#1c1c1c] border-b border-slate-200/80 dark:border-[#2b2b2b]">
                      {/* Write vs Preview Mode Toggle */}
                      <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-[#262626] p-0.5 rounded-lg shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditorTab("write")}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                            editorTab === "write"
                              ? "bg-white dark:bg-[#181818] text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                              : "text-slate-600 dark:text-[#888] hover:text-slate-900 dark:hover:text-[#eee]"
                          }`}
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Tulis</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorTab("preview")}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                            editorTab === "preview"
                              ? "bg-white dark:bg-[#181818] text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                              : "text-slate-600 dark:text-[#888] hover:text-slate-900 dark:hover:text-[#eee]"
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          <span>Pratinjau</span>
                        </button>
                      </div>

                      {/* Formatting Buttons Toolbar (Active when typing in Write mode) */}
                      {editorTab === "write" && (
                        <div className="flex items-center gap-0.5 flex-wrap overflow-x-auto no-scrollbar py-0.5">
                          {/* Bold */}
                          <button
                            type="button"
                            onClick={() => insertMarkdown("bold")}
                            title="Tebal / Bold (Ctrl+B)"
                            className="p-1.5 rounded-lg text-slate-700 dark:text-[#ccc] hover:bg-white dark:hover:bg-[#282828] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                          >
                            <Bold className="w-3.5 h-3.5" />
                          </button>
                          {/* Italic */}
                          <button
                            type="button"
                            onClick={() => insertMarkdown("italic")}
                            title="Miring / Italic (Ctrl+I)"
                            className="p-1.5 rounded-lg text-slate-700 dark:text-[#ccc] hover:bg-white dark:hover:bg-[#282828] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                          >
                            <Italic className="w-3.5 h-3.5" />
                          </button>
                          {/* Strikethrough */}
                          <button
                            type="button"
                            onClick={() => insertMarkdown("strikethrough")}
                            title="Coret / Strikethrough"
                            className="p-1.5 rounded-lg text-slate-700 dark:text-[#ccc] hover:bg-white dark:hover:bg-[#282828] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                          >
                            <Strikethrough className="w-3.5 h-3.5" />
                          </button>

                          <div className="h-4 w-px bg-slate-300 dark:bg-[#333] mx-1" />

                          {/* Headings */}
                          <button
                            type="button"
                            onClick={() => insertMarkdown("h1")}
                            title="Judul Utama H1 (# Judul)"
                            className="p-1.5 rounded-lg text-slate-700 dark:text-[#ccc] hover:bg-white dark:hover:bg-[#282828] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                          >
                            <Heading1 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown("h2")}
                            title="Sub Judul H2 (## Sub Judul)"
                            className="p-1.5 rounded-lg text-slate-700 dark:text-[#ccc] hover:bg-white dark:hover:bg-[#282828] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                          >
                            <Heading2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown("h3")}
                            title="Poin H3 (### Poin)"
                            className="p-1.5 rounded-lg text-slate-700 dark:text-[#ccc] hover:bg-white dark:hover:bg-[#282828] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                          >
                            <Heading3 className="w-3.5 h-3.5" />
                          </button>

                          <div className="h-4 w-px bg-slate-300 dark:bg-[#333] mx-1" />

                          {/* Lists */}
                          <button
                            type="button"
                            onClick={() => insertMarkdown("bullet")}
                            title="Daftar Poin / Bullet List (- Item)"
                            className="p-1.5 rounded-lg text-slate-700 dark:text-[#ccc] hover:bg-white dark:hover:bg-[#282828] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                          >
                            <List className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown("number")}
                            title="Daftar Nomor / Numbered List (1. Item)"
                            className="p-1.5 rounded-lg text-slate-700 dark:text-[#ccc] hover:bg-white dark:hover:bg-[#282828] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                          >
                            <ListOrdered className="w-3.5 h-3.5" />
                          </button>

                          <div className="h-4 w-px bg-slate-300 dark:bg-[#333] mx-1" />

                          {/* Quote & Code & Link & Table */}
                          <button
                            type="button"
                            onClick={() => insertMarkdown("quote")}
                            title="Kutipan / Quote (> Catatan)"
                            className="p-1.5 rounded-lg text-slate-700 dark:text-[#ccc] hover:bg-white dark:hover:bg-[#282828] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                          >
                            <Quote className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown("code")}
                            title="Kode / Code Block (`kode` atau ```)"
                            className="p-1.5 rounded-lg text-slate-700 dark:text-[#ccc] hover:bg-white dark:hover:bg-[#282828] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                          >
                            <Code className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown("link")}
                            title="Tautan / Link (Ctrl+K)"
                            className="p-1.5 rounded-lg text-slate-700 dark:text-[#ccc] hover:bg-white dark:hover:bg-[#282828] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown("table")}
                            title="Tabel Markdown"
                            className="p-1.5 rounded-lg text-slate-700 dark:text-[#ccc] hover:bg-white dark:hover:bg-[#282828] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                          >
                            <Table className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Editor / Live Preview Body */}
                    {editorTab === "write" ? (
                      <textarea
                        ref={textareaRef}
                        rows={14}
                        onKeyDown={handleKeyDown}
                        placeholder="Tuliskan materi kuliah, rumus, konsep penting, atau tempelkan catatan di sini... Gunakan Markdown seperti **tebal**, *miring*, # Judul, ``` kode, atau gunakan tombol toolbar di atas."
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        className="w-full p-4 text-xs bg-transparent border-0 text-slate-900 dark:text-[#f3f3f3] placeholder:text-slate-400 focus:outline-none leading-relaxed font-mono"
                      />
                    ) : (
                      <div className="p-5 min-h-[320px] max-h-[500px] overflow-y-auto bg-white/50 dark:bg-[#161616]/50">
                        {formContent.trim() ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed break-words font-sans">
                            <Markdown
                              components={{
                                code: CodeBlock,
                                pre: ({ children }) => <>{children}</>,
                              }}
                            >
                              {formContent}
                            </Markdown>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs">
                            <NotebookPen className="w-6 h-6 mb-2 opacity-50" />
                            <span>Belum ada isi catatan untuk dipratinjau.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Keyboard Shortcuts Cheatsheet Info */}
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#888] px-1">
                    <div className="flex items-center gap-3">
                      <span>
                        Pintasan keyboard: <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#252525] border border-slate-200 dark:border-[#333] font-mono text-xs">Ctrl+B</kbd> Tebal, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#252525] border border-slate-200 dark:border-[#333] font-mono text-xs">Ctrl+I</kbd> Miring, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#252525] border border-slate-200 dark:border-[#333] font-mono text-xs">Ctrl+K</kbd> Link
                      </span>
                    </div>
                    <span className="text-slate-400">
                      {formContent.length} karakter • {formContent.trim() ? formContent.trim().split(/\s+/).length : 0} kata
                    </span>
                  </div>
                </div>
              </form>
            ) : activeNote ? (
              /* Note Detail View with AI Tools & Markdown Prose */
              <div className="bg-white dark:bg-[#161616] rounded-2xl p-5 sm:p-6 shadow-2xs border border-slate-200/80 dark:border-[#262626] space-y-5">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#262626]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                        {activeNote.subject || "Catatan Umum"}
                      </span>
                      {activeNote.tags?.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded text-xs bg-slate-100 dark:bg-[#222] text-slate-600 dark:text-[#888]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-[#f3f3f3] mt-1">
                      {activeNote.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEdit(activeNote)}
                      className="text-xs h-8 gap-1.5 rounded-lg border-0 bg-slate-100 dark:bg-[#222]"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600 dark:text-[#aaa]" />
                      <span>Edit Markdown</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(activeNote.id)}
                      className="text-xs h-8 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* AI Interactive Toolbar */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-100/90 dark:bg-[#181818] border border-slate-200/80 dark:border-[#262626] p-3 rounded-xl">
                  <span className="text-xs font-bold text-slate-800 dark:text-[#e0e0e0] flex items-center gap-1.5 mr-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    AI Assistant:
                  </span>

                  <Button
                    size="sm"
                    onClick={handleAISummarize}
                    disabled={isSummarizing}
                    className="h-7 text-xs font-semibold bg-white hover:bg-slate-50 text-indigo-700 shadow-sm border-0 dark:bg-[#222] dark:hover:bg-[#2a2a2a] dark:text-indigo-300 rounded-lg gap-1.5"
                  >
                    {isSummarizing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <FileText className="w-3 h-3" />
                    )}
                    <span>{activeNote.summary ? "Rangkum Ulang" : "Rangkum Catatan"}</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleAIGenerateQuiz}
                    disabled={isGeneratingQuiz}
                    className="h-7 text-xs font-semibold bg-white hover:bg-slate-50 text-purple-700 shadow-sm border-0 dark:bg-[#222] dark:hover:bg-[#2a2a2a] dark:text-purple-300 rounded-lg gap-1.5"
                  >
                    {isGeneratingQuiz ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <BrainCircuit className="w-3 h-3" />
                    )}
                    <span>
                      {activeNote.aiQuiz && activeNote.aiQuiz.length > 0
                        ? `Latihan Kuis (${activeNote.aiQuiz.length} Soal)`
                        : "Buat Kuis Latihan"}
                    </span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleOpenInChat}
                    className="h-7 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 shadow-sm border-0 dark:bg-[#222] dark:hover:bg-[#2a2a2a] dark:text-[#eee] rounded-lg gap-1.5"
                  >
                    <MessageSquareText className="w-3 h-3 text-indigo-500" />
                    <span>Tanya AI Tutor</span>
                  </Button>
                </div>

                {/* AI Summary Box if available */}
                {activeNote.summary && (
                  <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Rangkuman Inti AI</span>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-slate-700 dark:text-[#d4d4d4] leading-relaxed">
                      <Markdown
                        components={{
                          code: CodeBlock,
                          pre: ({ children }) => <>{children}</>,
                        }}
                      >
                        {activeNote.summary}
                      </Markdown>
                    </div>
                  </div>
                )}

                {/* Main Note Content rendered in Markdown Prose */}
                <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed break-words font-sans bg-slate-50/50 dark:bg-[#191919] p-5 rounded-2xl border border-slate-100 dark:border-[#262626]">
                  <Markdown
                    components={{
                      code: CodeBlock,
                      pre: ({ children }) => <>{children}</>,
                    }}
                  >
                    {activeNote.content}
                  </Markdown>
                </div>

                {/* Practice Quiz Panel */}
                {activeQuiz && (
                  <div className="pt-4 border-t border-slate-100 dark:border-[#222] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-[#f3f3f3]">
                          Kuis Evaluasi Pemahaman
                        </h4>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-[#888]">
                        {activeQuiz.length} Pertanyaan
                      </span>
                    </div>

                    <div className="space-y-4">
                      {activeQuiz.map((q, qIndex) => {
                        const isAnswered = userAnswers[qIndex] !== undefined;
                        const isCorrect = userAnswers[qIndex] === q.correctAnswer;

                        return (
                          <div
                            key={qIndex}
                            className="bg-slate-50 dark:bg-[#1c1c1c] p-3.5 rounded-xl space-y-2.5"
                          >
                            <div className="text-xs font-semibold text-slate-900 dark:text-[#f3f3f3]">
                              {qIndex + 1}. {q.question}
                            </div>

                            <div className="space-y-1.5">
                              {q.options.map((opt, optIndex) => {
                                const selected = userAnswers[qIndex] === optIndex;
                                let btnStyle =
                                  "bg-white dark:bg-[#252525] border border-slate-200 dark:border-[#333] text-slate-700 dark:text-[#ccc]";

                                if (quizSubmitted) {
                                  if (optIndex === q.correctAnswer) {
                                    btnStyle =
                                      "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold";
                                  } else if (selected && !isCorrect) {
                                    btnStyle =
                                      "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-700 dark:text-rose-300";
                                  }
                                } else if (selected) {
                                  btnStyle =
                                    "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold";
                                }

                                return (
                                  <button
                                    key={optIndex}
                                    disabled={quizSubmitted}
                                    onClick={() =>
                                      setUserAnswers((prev) => ({ ...prev, [qIndex]: optIndex }))
                                    }
                                    className={`w-full text-left p-2 rounded-lg text-xs transition-all cursor-pointer ${btnStyle}`}
                                  >
                                    <span className="font-semibold mr-2">
                                      {String.fromCharCode(65 + optIndex)}.
                                    </span>
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>

                            {quizSubmitted && q.explanation && (
                              <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                                <span className="font-bold">Penjelasan: </span>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {!quizSubmitted ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setQuizSubmitted(true);
                            const correctCount = activeQuiz.reduce(
                              (acc, q, idx) =>
                                userAnswers[idx] === q.correctAnswer ? acc + 1 : acc,
                              0
                            );
                            if (correctCount === activeQuiz.length) {
                              try {
                                confetti({
                                  particleCount: 50,
                                  spread: 60,
                                  origin: { y: 0.7 },
                                });
                              } catch {}
                            }
                          }}
                          disabled={Object.keys(userAnswers).length < activeQuiz.length}
                          className="text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                        >
                          Periksa Jawaban
                        </Button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-800 dark:text-[#f3f3f3]">
                            Skor:{" "}
                            {
                              activeQuiz.filter((q, i) => userAnswers[i] === q.correctAnswer)
                                .length
                            }{" "}
                            / {activeQuiz.length} Benar
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setUserAnswers({});
                              setQuizSubmitted(false);
                            }}
                            className="text-xs rounded-xl"
                          >
                            Coba Lagi
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty state when no note selected */
              <div className="bg-slate-50/50 dark:bg-[#141414]/50 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 flex items-center justify-center mx-auto">
                  <NotebookPen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-[#f3f3f3]">
                  Pilih Catatan untuk Membaca
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#888] max-w-sm mx-auto">
                  Pilih salah satu catatan materi di kolom kiri untuk melihat isinya, menghasilkan rangkuman cerdas AI, atau mulai latihan kuis.
                </p>
                <Button
                  size="sm"
                  onClick={handleStartCreate}
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Tulis Catatan Baru
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
