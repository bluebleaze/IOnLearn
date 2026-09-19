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
  Image as ImageIcon,
  Eye,
  Check,
  Copy,
  LayoutGrid,
  X,
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Shell } from "@/components/Shell";
import { StudyNote, StudyNoteQuizItem } from "@/types";
import {
  loadNotes,
  addNote,
  updateNote,
  deleteNote,
  loadPreferences,
  loadAIConfig,
  cleanAndNormalizeTags,
} from "@/lib/taskStore";
import { markdownToHtml, htmlToMarkdown } from "@/lib/richTextConverter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import confetti from "canvas-confetti";
import { useLanguage } from "@/context/LanguageContext";

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
    toast.success(typeof window !== "undefined" && document.documentElement.lang === "en" ? "Code copied to clipboard" : "Kode berhasil disalin");
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
          <span>{copied ? "Copied" : "Copy Code"}</span>
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200">
        <pre>{children}</pre>
      </div>
    </div>
  );
};

// Clean and normalize markdown table strings if rows lack proper newlines or dividers
const formatMarkdownTables = (content: string): string => {
  if (!content) return "";
  let text = content;

  // 1. Split concatenated table rows `| ... | | ... |` or `|:---| | 1 |` into separate lines
  text = text.replace(/\|\s*\|\s*(?=[^|\n]+?\|)/g, "|\n|");

  const lines = text.split("\n");
  const result: string[] = [];
  let tableBuffer: string[] = [];

  const flushTableBuffer = () => {
    if (tableBuffer.length === 0) return;

    const normalizedRows: string[] = [];
    for (const r of tableBuffer) {
      let trimmed = r.trim();
      if (!trimmed.startsWith("|")) trimmed = "| " + trimmed;
      if (!trimmed.endsWith("|")) trimmed = trimmed + " |";
      normalizedRows.push(trimmed);
    }

    if (normalizedRows.length > 0) {
      // Check if second row is a valid Markdown table divider (e.g., |:---|:---| or |---|---|)
      const isDivider = (row: string) => {
        const cells = row.split("|").slice(1, -1);
        return cells.length > 0 && cells.every((c) => /^[\s:-]+$/.test(c.trim()) && c.includes("-"));
      };

      if (normalizedRows.length === 1 || !isDivider(normalizedRows[1])) {
        // Insert auto-generated divider row after header
        const headerCells = normalizedRows[0].split("|").slice(1, -1);
        const colCount = Math.max(headerCells.length, 1);
        const autoDivider = `| ${Array(colCount).fill("---").join(" | ")} |`;
        normalizedRows.splice(1, 0, autoDivider);
      }

      // Ensure preceding blank line if previous line had content
      if (result.length > 0 && result[result.length - 1].trim() !== "") {
        result.push("");
      }

      result.push(...normalizedRows);

      // Ensure trailing blank line after table block
      result.push("");
    }

    tableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if line is a table row (starts/ends with pipe or has multiple pipe delimiters)
    const isTableRow =
      trimmed.length > 0 &&
      (/^\s*\|.+?\|\s*$/.test(trimmed) || (trimmed.includes("|") && trimmed.split("|").length >= 3));

    if (isTableRow) {
      tableBuffer.push(trimmed);
    } else {
      if (tableBuffer.length > 0) {
        flushTableBuffer();
      }
      result.push(line);
    }
  }

  if (tableBuffer.length > 0) {
    flushTableBuffer();
  }

  return result.join("\n");
};

// Reusable Markdown components with custom table, code, and block formatting
const noteMarkdownComponents = {
  code: CodeBlock,
  pre: ({ children }: any) => <>{children}</>,
  table: ({ children }: any) => (
    <div className="my-3.5 w-full overflow-x-auto rounded-xl border border-slate-200/80 dark:border-[#2b2b2b] shadow-xs">
      <table className="w-full min-w-[340px] text-xs sm:text-sm text-left border-collapse bg-white dark:bg-[#151515]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-slate-100/90 dark:bg-[#1f1f1f] text-slate-900 dark:text-[#f2f2f2] font-bold border-b border-slate-200/80 dark:border-[#2b2b2b]">
      {children}
    </thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-slate-100 dark:divide-[#242424]">
      {children}
    </tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-slate-50/75 dark:hover:bg-[#1a1a1a] transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }: any) => (
    <th className="px-3.5 py-2.5 font-bold text-slate-900 dark:text-white border-r border-slate-200/60 dark:border-[#2a2a2a] last:border-r-0">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-3.5 py-2.5 text-slate-700 dark:text-[#ccc] border-r border-slate-100 dark:border-[#222] last:border-r-0 leading-relaxed">
      {children}
    </td>
  ),
};

export default function NotesPage() {
  const router = useRouter();
  const { language, isEn, t } = useLanguage();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Active / selected note for viewing or editing
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // Editor View State: Visual (WYSIWYG), Markdown, or Preview
  const [editorTab, setEditorTab] = useState<"visual" | "markdown" | "preview">("visual");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const visualEditorRef = useRef<HTMLDivElement>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [sidebarLayout, setSidebarLayout] = useState<"list" | "grid">("list");

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
        const mTitle = (n.title || "").toLowerCase().includes(q);
        const mContent = (n.content || "").toLowerCase().includes(q);
        const mSubj = (n.subject || "").toLowerCase().includes(q);
        if (!mTitle && !mContent && !mSubj) return false;
      }
      return true;
    });
  }, [notes, selectedSubject, searchQuery]);

  const handleSelectNote = (note: StudyNote) => {
    setActiveNoteId(note.id);
    setIsEditing(false);
    setActiveQuiz(note.aiQuiz || null);
    setUserAnswers({});
    setQuizSubmitted(false);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileDetailOpen(true);
    }
  };

  const handleStartCreate = () => {
    setIsMobileDetailOpen(false);
    setActiveNoteId(null);
    setFormTitle("");
    setFormSubject("");
    setFormContent("");
    setFormTags("");
    setEditorTab("visual");
    setIsEditing(true);
    setTimeout(() => {
      if (visualEditorRef.current) {
        visualEditorRef.current.innerHTML = "";
        visualEditorRef.current.focus();
      }
    }, 50);
  };

  const handleStartEdit = (note: StudyNote) => {
    setIsMobileDetailOpen(false);
    setActiveNoteId(note.id);
    setFormTitle(note.title || "");
    setFormSubject(note.subject || "");

    // Strip trailing tag line if present in raw content
    const cleanedContent = (note.content || "")
      .replace(/(?:\r?\n)+\s*(?:###?\s*)?(?:Tag|Tags|Label|Labels|Hashtags)\s*:\s*[^\n]+$/i, "")
      .replace(/(?:\r?\n)+\s*(?:#[a-zA-Z0-9_-]+\s*){1,10}$/i, "")
      .trim();

    const cleanedTags = cleanAndNormalizeTags(note.tags || []);
    setFormContent(cleanedContent);
    setFormTags(cleanedTags.join(", "));
    setEditorTab("visual");
    setIsEditing(true);
    setTimeout(() => {
      if (visualEditorRef.current) {
        visualEditorRef.current.innerHTML = markdownToHtml(cleanedContent);
      }
    }, 50);
  };

  const handleSwitchEditorTab = (tab: "visual" | "markdown" | "preview") => {
    let currentMd = formContent;
    if (editorTab === "visual" && visualEditorRef.current) {
      currentMd = htmlToMarkdown(visualEditorRef.current.innerHTML);
      setFormContent(currentMd);
    }

    if (tab === "visual") {
      setTimeout(() => {
        if (visualEditorRef.current) {
          visualEditorRef.current.innerHTML = markdownToHtml(currentMd);
        }
      }, 50);
    }
    setEditorTab(tab);
  };

  // Helper for applying formatting (WYSIWYG execCommand in visual mode, or Markdown syntax in markdown mode)
  const applyFormat = (format: string) => {
    if (editorTab === "visual") {
      if (visualEditorRef.current) {
        visualEditorRef.current.focus();
      }
      switch (format) {
        case "bold":
          document.execCommand("bold", false);
          break;
        case "italic":
          document.execCommand("italic", false);
          break;
        case "strikethrough":
          document.execCommand("strikeThrough", false);
          break;
        case "h1":
          document.execCommand("formatBlock", false, "<h1>");
          break;
        case "h2":
          document.execCommand("formatBlock", false, "<h2>");
          break;
        case "h3":
          document.execCommand("formatBlock", false, "<h3>");
          break;
        case "bullet":
          document.execCommand("insertUnorderedList", false);
          break;
        case "number":
          document.execCommand("insertOrderedList", false);
          break;
        case "quote":
          document.execCommand("formatBlock", false, "<blockquote>");
          break;
        case "code": {
          const sel = window.getSelection()?.toString() || "kode";
          document.execCommand(
            "insertHTML",
            false,
            `<code class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs">${sel}</code>`
          );
          break;
        }
        case "link": {
          const url = prompt("Masukkan tautan URL:", "https://");
          if (url) {
            document.execCommand("createLink", false, url);
          }
          break;
        }
        case "image": {
          const url = prompt("Masukkan tautan URL Gambar / Foto:", "https://");
          if (url) {
            document.execCommand(
              "insertHTML",
              false,
              `<img src="${url}" alt="gambar" class="rounded-xl my-2 max-h-96 object-contain" /><p><br></p>`
            );
          }
          break;
        }
        case "table": {
          const tableHtml = `<table class="border border-slate-300 dark:border-slate-700 my-2 w-full text-xs"><thead><tr class="bg-slate-100 dark:bg-slate-800"><th class="border border-slate-300 dark:border-slate-700 p-1.5 font-bold">Kolom 1</th><th class="border border-slate-300 dark:border-slate-700 p-1.5 font-bold">Kolom 2</th><th class="border border-slate-300 dark:border-slate-700 p-1.5 font-bold">Kolom 3</th></tr></thead><tbody><tr><td class="border border-slate-300 dark:border-slate-700 p-1.5">Data 1</td><td class="border border-slate-300 dark:border-slate-700 p-1.5">Data 2</td><td class="border border-slate-300 dark:border-slate-700 p-1.5">Data 3</td></tr></tbody></table><p><br></p>`;
          document.execCommand("insertHTML", false, tableHtml);
          break;
        }
      }
      if (visualEditorRef.current) {
        setFormContent(htmlToMarkdown(visualEditorRef.current.innerHTML));
      }
    } else {
      insertMarkdown(format);
    }
  };

  const handleVisualPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            const base64 = loadEvent.target?.result as string;
            if (base64) {
              document.execCommand(
                "insertHTML",
                false,
                `<img src="${base64}" alt="foto" class="rounded-xl my-2 max-h-96 object-contain" /><p><br></p>`
              );
              if (visualEditorRef.current) {
                setFormContent(htmlToMarkdown(visualEditorRef.current.innerHTML));
              }
            }
          };
          reader.readAsDataURL(file);
        }
        return;
      }
    }
  };

  const handleVisualKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        applyFormat("bold");
      } else if (e.key.toLowerCase() === "i") {
        e.preventDefault();
        applyFormat("italic");
      } else if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        applyFormat("link");
      }
    }
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
      case "image": {
        const url = prompt("Masukkan tautan URL Gambar / Foto:", "https://");
        if (url) {
          replacement = `\n![${selectedText || "gambar"}](${url})\n`;
          cursorStartOffset = start;
          cursorEndOffset = start + replacement.length;
        } else {
          return;
        }
        break;
      }
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

    let contentToSave = formContent;
    if (editorTab === "visual" && visualEditorRef.current) {
      contentToSave = htmlToMarkdown(visualEditorRef.current.innerHTML);
    }

    if (!formTitle.trim() || !contentToSave.trim()) {
      toast.error(isEn ? "Note title and content are required." : "Judul dan isi catatan wajib diisi.");
      return;
    }

    // Strip trailing tag lines from content
    const cleanedContent = contentToSave
      .replace(/(?:\r?\n)+\s*(?:###?\s*)?(?:Tag|Tags|Label|Labels|Hashtags)\s*:\s*[^\n]+$/i, "")
      .replace(/(?:\r?\n)+\s*(?:#[a-zA-Z0-9_-]+\s*){1,10}$/i, "")
      .trim();

    const tagsArray = cleanAndNormalizeTags(formTags.split(","));

    const now = new Date().toISOString();

    if (activeNoteId) {
      updateNote(activeNoteId, {
        title: formTitle.trim(),
        subject: formSubject.trim() || undefined,
        content: cleanedContent,
        tags: tagsArray,
        updatedAt: now,
      });
      toast.success(t.notes.toastSaved);
    } else {
      const newNote: StudyNote = {
        id: `note-${Date.now()}`,
        title: formTitle.trim(),
        subject: formSubject.trim() || undefined,
        content: cleanedContent,
        tags: tagsArray,
        createdAt: now,
        updatedAt: now,
      };
      addNote(newNote);
      setActiveNoteId(newNote.id);
      toast.success(t.notes.toastCreated);
    }

    setNotes(loadNotes());
    setIsEditing(false);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm(t.notes.deleteConfirm)) {
      deleteNote(id);
      setNotes(loadNotes());
      if (activeNoteId === id) {
        setActiveNoteId(null);
        setIsEditing(false);
        setActiveQuiz(null);
        setIsMobileDetailOpen(false);
      }
      toast.success(t.notes.toastDeleted);
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
        throw new Error(errorData.error || "Gagal menghasilkan rangkuman.");
      }

      const data = await res.json();
      const summaryText = data.text;

      if (summaryText) {
        updateNote(activeNote.id, {
          summary: summaryText,
          updatedAt: new Date().toISOString(),
        });
        setNotes(loadNotes());
        toast.success(isEn ? "Summary Generated Successfully!" : "Rangkuman Berhasil Dibuat!");
      }
    } catch (err: any) {
      toast.error(isEn ? "Summarization Failed" : "Gagal Merangkum", { description: err.message });
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
          systemPrompt: isEn
            ? `You are an academic quiz creator. Based on the provided notes, create 3-5 multiple choice questions (4 options A, B, C, D) to test student comprehension. RETURN ONLY A VALID JSON ARRAY without markdown backticks, in format: [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "..."}]`
            : `Kamu adalah pembuat soal kuis akademik evaluatif. Berdasarkan materi yang diberikan, buatlah 3-5 soal pilihan ganda (4 opsi A, B, C, D) untuk menguji pemahaman siswa.
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
        throw new Error(errorData.error || (isEn ? "Failed to create AI quiz." : "Gagal membuat kuis AI."));
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
        toast.success(isEn ? "Practice Quiz Ready!" : "Kuis Latihan Siap!", {
          description: isEn
            ? `${quizItems.length} practice questions generated from this note.`
            : `${quizItems.length} soal latihan telah digenerate dari catatan ini.`,
        });
      }
    } catch (err: any) {
      toast.error(isEn ? "Failed to Create Quiz" : "Gagal Membuat Kuis", { description: err.message });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  const handleCopyNote = async (note: StudyNote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      let textToCopy = `# ${note.title || "Catatan"}\n`;
      if (note.subject) {
        textToCopy += `📚 Mata Kuliah / Pelajaran: ${note.subject}\n`;
      }
      if (note.tags && note.tags.length > 0) {
        textToCopy += `🏷️ Tags: ${note.tags.map((t) => `#${t}`).join(" ")}\n`;
      }
      textToCopy += `\n${note.content || ""}\n`;
      if (note.summary) {
        textToCopy += `\n---\n✨ Rangkuman AI:\n${note.summary}\n`;
      }

      await navigator.clipboard.writeText(textToCopy.trim());
      setCopiedNoteId(note.id);
      toast.success(
        isEn ? "Full note copied to clipboard! 📋" : "Seluruh isi catatan berhasil disalin! 📋",
        {
          description: isEn
            ? "Title, subject, content, and AI summary copied."
            : "Judul, materi, dan rangkuman AI tersalin rapi.",
        }
      );
      setTimeout(() => {
        setCopiedNoteId(null);
      }, 2000);
    } catch {
      toast.error(isEn ? "Failed to copy note to clipboard." : "Gagal menyalin catatan ke clipboard.");
    }
  };

  const handleCopyAllNotes = async () => {
    if (filteredNotes.length === 0) {
      toast.info(isEn ? "No notes to copy." : "Tidak ada catatan untuk disalin.");
      return;
    }
    try {
      let allText = `# 📚 Kumpulan Catatan Materi (${filteredNotes.length} Catatan)\n\n`;
      filteredNotes.forEach((note, idx) => {
        allText += `## ${idx + 1}. ${note.title || (isEn ? "Untitled" : "Tanpa Judul")}\n`;
        if (note.subject) allText += `*Mata Kuliah / Pelajaran: ${note.subject}*\n`;
        if (note.tags && note.tags.length > 0) allText += `*Tags: ${note.tags.map((t) => `#${t}`).join(" ")}*\n`;
        allText += `\n${note.content || ""}\n`;
        if (note.summary) allText += `\n> **Rangkuman AI:**\n> ${note.summary.replace(/\n/g, "\n> ")}\n`;
        allText += `\n---\n\n`;
      });

      await navigator.clipboard.writeText(allText.trim());
      toast.success(
        isEn
          ? `All ${filteredNotes.length} notes copied to clipboard! 📋`
          : `Semua ${filteredNotes.length} catatan berhasil disalin ke clipboard! 📋`,
        {
          description: isEn
            ? "All notes formatted in Markdown and ready to paste."
            : "Semua catatan tersalin rapi dalam format Markdown.",
        }
      );
    } catch {
      toast.error(isEn ? "Failed to copy notes." : "Gagal menyalin semua catatan.");
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
            <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-lexend)] tracking-tight text-slate-900 dark:text-zinc-100">
              {t.notes.pageTitle}
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              {t.notes.pageSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {filteredNotes.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAllNotes}
                className="gap-1.5 rounded-[10px] text-xs font-semibold border-slate-200/80 dark:border-[#27272a] bg-white dark:bg-[#1c1c20] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#25252b] shadow-2xs cursor-pointer"
                title={isEn ? "Copy all notes" : "Salin semua catatan sekaligus"}
              >
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                <span>{isEn ? "Copy All Notes" : "Salin Semua Catatan"}</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleStartCreate}
              className="gap-1.5 rounded-[10px] text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.notes.newNoteBtn}</span>
            </Button>
          </div>
        </div>

        {/* ── FULL-WIDTH SEARCH BAR (KIRI -> KANAN) SEBAGAI PRIMARY CONTROL (Sesuai QA #9) ── */}
        <div className="w-full bg-white dark:bg-[#151518] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#27272a] shadow-xs space-y-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder={t.notes.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#1c1c20] border border-slate-200/80 dark:border-[#2c2c32] text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-100 px-2 py-1 rounded-md bg-slate-200/70 dark:bg-[#282830] transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Subject Pills Filter underneath search input */}
          <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <span className="text-xs font-medium text-slate-400 dark:text-zinc-400 mr-1 hidden sm:inline">{isEn ? "Course:" : "Mata Kuliah:"}</span>
              <button
                onClick={() => setSelectedSubject("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${selectedSubject === "all"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-[#202026] text-slate-700 dark:text-zinc-300 border border-transparent dark:border-[#2e2e36] hover:bg-slate-200 dark:hover:bg-[#282830] dark:hover:text-zinc-100"
                  }`}
              >
                {t.notes.allSubjects} ({notes.length})
              </button>
              {subjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${selectedSubject === subj
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 dark:bg-[#202026] text-slate-700 dark:text-zinc-300 border border-transparent dark:border-[#2e2e36] hover:bg-slate-200 dark:hover:bg-[#282830] dark:hover:text-zinc-100"
                    }`}
                >
                  {subj}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500 dark:text-zinc-400">
              {isEn ? "Showing " : "Menampilkan "}<strong className="text-slate-800 dark:text-zinc-200">{filteredNotes.length}</strong> {isEn ? "notes" : "catatan"}
            </span>
          </div>
        </div>

        {/* Workspace Layout: Left (Sidebar Notes Directory) & Right (Active View / Editor) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Note Directory (Sidebar) */}
          <div className="lg:col-span-4 space-y-3">
            {/* Sidebar Controls: Title & Layout Switcher (List vs Grid) Sesuai QA #9 */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                  {isEn ? "Notes List" : "Hasil Catatan"}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#202026] text-slate-600 dark:text-zinc-400 border border-transparent dark:border-[#2e2e36] text-xs font-semibold">
                  {filteredNotes.length}
                </span>
              </div>

              {/* Layout Switcher (List vs Grid) */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1c1c20] p-0.5 rounded-xl border border-slate-200/80 dark:border-[#2c2c32]">
                <button
                  type="button"
                  onClick={() => setSidebarLayout("list")}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${sidebarLayout === "list"
                      ? "bg-white dark:bg-[#282830] text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
                    }`}
                  title={isEn ? "List View" : "Tampilan List"}
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="text-[11px]">List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarLayout("grid")}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${sidebarLayout === "grid"
                      ? "bg-white dark:bg-[#282830] text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
                    }`}
                  title={isEn ? "Grid View" : "Tampilan Grid"}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Grid</span>
                </button>
              </div>
            </div>

            {/* Note Cards List / Grid */}
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50/50 dark:bg-[#151518] rounded-2xl border border-dashed border-slate-200 dark:border-[#2b2b32]">
                <NotebookPen className="w-8 h-8 text-slate-400 dark:text-zinc-500 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {notes.length === 0 ? t.notes.emptyDesc : t.notes.searchEmptyDesc}
                </p>
              </div>
            ) : sidebarLayout === "grid" ? (
              /* Grid Layout */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5">
                {filteredNotes.map((note) => {
                  const isSelected = activeNoteId === note.id;
                  const isCopied = copiedNoteId === note.id;
                  return (
                    <div
                      key={note.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectNote(note)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectNote(note);
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between group ${isSelected
                          ? "bg-white dark:bg-[#1c1c22] border-indigo-500/80 dark:border-indigo-500/80 shadow-xs ring-1 ring-indigo-500/30"
                          : "bg-white dark:bg-[#151518] border-slate-200/80 dark:border-[#27272a] hover:border-slate-300 dark:hover:border-[#3a3a40] dark:hover:bg-[#19191d]"
                        }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1 flex-wrap min-w-0">
                            {note.subject && (
                              <span className="px-1.5 py-0.5 rounded text-[10.5px] font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-transparent dark:border-indigo-500/30 truncate max-w-[140px]">
                                {note.subject}
                              </span>
                            )}
                            {note.summary && (
                              <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-transparent dark:border-purple-500/30 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>AI</span>
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleCopyNote(note, e)}
                            className={`p-1 rounded-md transition cursor-pointer shrink-0 ${
                              isCopied
                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                                : "text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#202026]"
                            }`}
                            title={isEn ? "Copy Note" : "Salin Catatan"}
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 line-clamp-2">
                          {note.title || "Tanpa Judul"}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {(note.content || "").replace(/\|/g, " ").replace(/[#*`~_\[\]()>-]/g, "").replace(/\s+/g, " ").trim() || "Catatan kosong..."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List Layout */
              <div className="space-y-2">
                {filteredNotes.map((note) => {
                  const isSelected = activeNoteId === note.id;
                  const isCopied = copiedNoteId === note.id;
                  return (
                    <div
                      key={note.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectNote(note)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectNote(note);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#121212] ${isSelected
                          ? "bg-white dark:bg-[#1c1c22] border-indigo-500/80 dark:border-indigo-500/80 shadow-sm ring-1 ring-indigo-500/30"
                          : "bg-white dark:bg-[#151518] border-slate-200/80 dark:border-[#27272a] hover:border-slate-300 dark:hover:border-[#3a3a40] dark:hover:bg-[#19191d]"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            {note.subject && (
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-transparent dark:border-indigo-500/30">
                                {note.subject}
                              </span>
                            )}
                            {note.summary && (
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-transparent dark:border-purple-500/30 flex items-center">
                                {isEn ? "Summary" : "Rangkuman"}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {note.title || (isEn ? "Untitled" : "Tanpa Judul")}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                            {(note.content || "").replace(/\|/g, " ").replace(/[#*`~_\[\]()>-]/g, "").replace(/\s+/g, " ").trim() || (isEn ? "Empty note..." : "Catatan kosong...")}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#242428] flex items-center justify-between text-xs text-slate-400 dark:text-zinc-500">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(note.updatedAt || note.createdAt).toLocaleDateString(isEn ? "en-US" : "id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleCopyNote(note, e)}
                            className={`p-1 rounded-md text-[11px] font-medium transition cursor-pointer flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-[#202026] ${
                              isCopied
                                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                                : "text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                            }`}
                            title={isEn ? "Copy Note" : "Salin Catatan"}
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{isCopied ? (isEn ? "Copied" : "Tersalin") : (isEn ? "Copy" : "Salin")}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                          <span>{isEn ? "View Note" : "Lihat Catatan"}</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Note Reader / Detailed Viewer (Desktop Only - hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-8">
            {activeNote ? (
              /* Note Detail View with AI Tools & Markdown Prose */
              <div className="bg-white dark:bg-[#151518] rounded-2xl p-5 sm:p-6 shadow-2xs border border-slate-200/80 dark:border-[#27272a] space-y-5">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#242428]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-transparent dark:border-indigo-500/30">
                        {activeNote.subject || (isEn ? "General Note" : "Catatan Umum")}
                      </span>
                      {activeNote.tags?.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded text-xs bg-slate-100 dark:bg-[#202026] text-slate-600 dark:text-zinc-400 border border-transparent dark:border-[#2e2e36]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">
                      {activeNote.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyNote(activeNote)}
                      className={`text-xs h-8 gap-1.5 rounded-lg border-0 transition-all cursor-pointer ${
                        copiedNoteId === activeNote.id
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold"
                          : "bg-slate-100 dark:bg-[#222228] text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#2a2a32]"
                      }`}
                      title={isEn ? "Copy full note" : "Salin semua isi catatan"}
                    >
                      {copiedNoteId === activeNote.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />
                      )}
                      <span>{copiedNoteId === activeNote.id ? (isEn ? "Copied!" : "Tersalin!") : (isEn ? "Copy Note" : "Salin Catatan")}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEdit(activeNote)}
                      className="text-xs h-8 gap-1.5 rounded-lg border-0 bg-slate-100 dark:bg-[#222228] text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#2a2a32] cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />
                      <span>Edit Markdown</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(activeNote.id)}
                      className="text-xs h-8 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg p-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* AI Interactive Toolbar */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-100/90 dark:bg-[#1c1c22] border border-slate-200/80 dark:border-[#2c2c34] p-3 rounded-xl">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 mr-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    AI Assistant:
                  </span>

                  <Button
                    size="sm"
                    onClick={handleAISummarize}
                    disabled={isSummarizing}
                    className="h-7 text-xs font-semibold bg-white hover:bg-slate-50 text-indigo-700 shadow-sm border border-transparent dark:border-[#363642] dark:bg-[#26262e] dark:hover:bg-[#2e2e38] dark:text-indigo-300 rounded-lg gap-1.5 cursor-pointer"
                  >
                    {isSummarizing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <FileText className="w-3 h-3" />
                    )}
                    <span>{isSummarizing ? t.notes.summarizing : (activeNote.summary ? t.notes.resummarizeBtn : t.notes.summarizeBtn)}</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleAIGenerateQuiz}
                    disabled={isGeneratingQuiz}
                    className="h-7 text-xs font-semibold bg-white hover:bg-slate-50 text-purple-700 shadow-sm border border-transparent dark:border-[#363642] dark:bg-[#26262e] dark:hover:bg-[#2e2e38] dark:text-purple-300 rounded-lg gap-1.5 cursor-pointer"
                  >
                    {isGeneratingQuiz ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <BrainCircuit className="w-3 h-3" />
                    )}
                    <span>
                      {isGeneratingQuiz ? t.notes.generatingQuiz : (activeNote.aiQuiz && activeNote.aiQuiz.length > 0
                        ? (isEn ? `Practice Quiz (${activeNote.aiQuiz.length} Questions)` : `Latihan Kuis (${activeNote.aiQuiz.length} Soal)`)
                        : t.notes.quizBtn)}
                    </span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleOpenInChat}
                    className="h-7 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 shadow-sm border border-transparent dark:border-[#363642] dark:bg-[#26262e] dark:hover:bg-[#2e2e38] dark:text-zinc-100 rounded-lg gap-1.5 cursor-pointer"
                  >
                    <MessageSquareText className="w-3 h-3 text-indigo-500" />
                    <span>{t.notes.askAITutor}</span>
                  </Button>
                </div>

                {/* AI Summary Box if available */}
                {activeNote.summary && (
                  <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isEn ? "AI Summary" : "Rangkuman AI"}</span>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={noteMarkdownComponents}
                      >
                        {formatMarkdownTables(activeNote.summary)}
                      </Markdown>
                    </div>
                  </div>
                )}

                {/* Main Note Content rendered in Markdown Prose */}
                <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed break-words font-sans bg-slate-50/50 dark:bg-[#18181d] p-5 rounded-2xl border border-slate-100 dark:border-[#27272e]">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={noteMarkdownComponents}
                  >
                    {formatMarkdownTables(activeNote.content || "")}
                  </Markdown>
                </div>

                {/* Practice Quiz Panel */}
                {activeQuiz && (
                  <div className="pt-4 border-t border-slate-100 dark:border-[#242428] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                          {isEn ? "Comprehension Evaluation Quiz" : "Kuis Evaluasi Pemahaman"}
                        </h4>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-zinc-400">
                        {activeQuiz.length} {isEn ? "Questions" : "Pertanyaan"}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {activeQuiz.map((q, qIndex) => {
                        const isCorrect = userAnswers[qIndex] === q.correctAnswer;

                        return (
                          <div
                            key={qIndex}
                            className="bg-slate-50 dark:bg-[#1c1c22] border border-slate-200/80 dark:border-[#2c2c34] p-3.5 rounded-xl space-y-2.5"
                          >
                            <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                              {qIndex + 1}. {q.question}
                            </div>

                            <div className="space-y-1.5">
                              {q.options.map((opt, optIndex) => {
                                const selected = userAnswers[qIndex] === optIndex;
                                let btnStyle =
                                  "bg-white dark:bg-[#222228] border border-slate-200 dark:border-[#2e2e36] text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-[#3e3e48]";

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
                              <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed border border-indigo-100 dark:border-indigo-900/40">
                                <span className="font-bold">{isEn ? "Explanation: " : "Penjelasan: "}</span>
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
                              } catch { }
                            }
                          }}
                          disabled={Object.keys(userAnswers).length < activeQuiz.length}
                          className="text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl cursor-pointer"
                        >
                          {isEn ? "Check Answers" : "Periksa Jawaban"}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                            {isEn ? "Score: " : "Skor: "}
                            {
                              activeQuiz.filter((q, i) => userAnswers[i] === q.correctAnswer)
                                .length
                            }{" "}
                            / {activeQuiz.length} {isEn ? "Correct" : "Benar"}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setUserAnswers({});
                              setQuizSubmitted(false);
                            }}
                            className="text-xs rounded-xl cursor-pointer"
                          >
                            {isEn ? "Try Again" : "Coba Lagi"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty state when no note selected */
              <div className="bg-white dark:bg-[#151518] rounded-2xl p-10 sm:p-14 text-center space-y-4 border border-slate-200/80 dark:border-[#27272a] shadow-2xs">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
                  <NotebookPen className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                    {t.notes.selectNoteToRead}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    {t.notes.selectNoteToReadDesc}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleStartCreate}
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {t.notes.newNoteBtn}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile Popup: Note Viewer Modal / Sheet (Seperti fitur catatan di HP) ── */}
        {activeNote && (
          <Dialog open={isMobileDetailOpen} onOpenChange={setIsMobileDetailOpen}>
            <DialogContent
              hideCloseButton
              className="w-[calc(100%-1.25rem)] max-w-lg max-h-[90dvh] h-[90dvh] p-0 flex flex-col shadow-2xl rounded-2xl sm:rounded-3xl bg-white dark:bg-[#151518] border border-slate-200/80 dark:border-[#27272a] font-inter overflow-hidden outline-none"
            >
              <DialogTitle className="sr-only">
                {activeNote.title || "Detail Catatan"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {activeNote.subject || "Detail Catatan Materi"}
              </DialogDescription>

              {/* Top Navigation Bar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 dark:border-[#242428] bg-white/95 dark:bg-[#151518]/95 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => setIsMobileDetailOpen(false)}
                    className="p-1.5 -ml-1 rounded-xl text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#202026] transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-xs font-semibold">{isEn ? "Back" : "Kembali"}</span>
                  </button>
                  {activeNote.subject && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-transparent dark:border-indigo-500/30 truncate max-w-[120px]">
                      {activeNote.subject}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyNote(activeNote)}
                    className={`p-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                      copiedNoteId === activeNote.id
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#222228]"
                    }`}
                    title={isEn ? "Copy Note" : "Salin Catatan"}
                  >
                    {copiedNoteId === activeNote.id ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartEdit(activeNote)}
                    className="p-1.5 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#222228] transition cursor-pointer"
                    title="Edit Markdown"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenInChat}
                    className="p-1.5 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
                    title="Tanya AI"
                  >
                    <MessageSquareText className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(activeNote.id)}
                    className="p-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMobileDetailOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-[#202026] transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 leading-snug">
                    {activeNote.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs text-slate-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(activeNote.updatedAt || activeNote.createdAt).toLocaleDateString(isEn ? "en-US" : "id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {activeNote.tags?.map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded text-[10.5px] bg-slate-100 dark:bg-[#202026] text-slate-600 dark:text-zinc-400 border border-transparent dark:border-[#2e2e36]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Interactive Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 dark:bg-[#1c1c22] border border-slate-200/80 dark:border-[#2c2c34] p-2.5 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1 mr-1">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    AI:
                  </span>
                  <Button
                    size="sm"
                    onClick={handleAISummarize}
                    disabled={isSummarizing}
                    className="h-6.5 text-[11px] font-semibold bg-white hover:bg-slate-50 text-indigo-700 shadow-2xs border border-transparent dark:border-[#363642] dark:bg-[#26262e] dark:hover:bg-[#2e2e38] dark:text-indigo-300 rounded-lg gap-1 px-2.5 cursor-pointer"
                  >
                    {isSummarizing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <FileText className="w-3 h-3" />
                    )}
                    <span>{isSummarizing ? t.notes.summarizing : (activeNote.summary ? t.notes.resummarizeBtn : t.notes.summarizeBtn)}</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAIGenerateQuiz}
                    disabled={isGeneratingQuiz}
                    className="h-6.5 text-[11px] font-semibold bg-white hover:bg-slate-50 text-purple-700 shadow-2xs border border-transparent dark:border-[#363642] dark:bg-[#26262e] dark:hover:bg-[#2e2e38] dark:text-purple-300 rounded-lg gap-1 px-2.5 cursor-pointer"
                  >
                    {isGeneratingQuiz ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <BrainCircuit className="w-3 h-3" />
                    )}
                    <span>
                      {isGeneratingQuiz ? t.notes.generatingQuiz : (activeNote.aiQuiz && activeNote.aiQuiz.length > 0
                        ? (isEn ? `Quiz (${activeNote.aiQuiz.length})` : `Kuis (${activeNote.aiQuiz.length})`)
                        : t.notes.quizBtn)}
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleOpenInChat}
                    className="h-6.5 text-[11px] font-semibold bg-white hover:bg-slate-50 text-slate-800 shadow-2xs border border-transparent dark:border-[#363642] dark:bg-[#26262e] dark:hover:bg-[#2e2e38] dark:text-zinc-100 rounded-lg gap-1 px-2.5 cursor-pointer"
                  >
                    <MessageSquareText className="w-3 h-3 text-indigo-500" />
                    <span>{t.notes.askAITutor}</span>
                  </Button>
                </div>

                {/* AI Summary Box */}
                {activeNote.summary && (
                  <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                      <FileText className="w-3 h-3" />
                      <span>{isEn ? "AI Summary" : "Rangkuman AI"}</span>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={noteMarkdownComponents}
                      >
                        {formatMarkdownTables(activeNote.summary)}
                      </Markdown>
                    </div>
                  </div>
                )}

                {/* Main Content Markdown */}
                <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed break-words font-sans bg-slate-50/50 dark:bg-[#18181d] p-4 rounded-xl border border-slate-100 dark:border-[#27272e]">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={noteMarkdownComponents}
                  >
                    {formatMarkdownTables(activeNote.content || "")}
                  </Markdown>
                </div>

                {/* Practice Quiz Panel */}
                {activeQuiz && (
                  <div className="pt-3 border-t border-slate-100 dark:border-[#242428] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
                          {isEn ? "Comprehension Quiz" : "Kuis Pemahaman"}
                        </h4>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-zinc-400">
                        {activeQuiz.length} {isEn ? "Questions" : "Soal"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {activeQuiz.map((q, qIndex) => {
                        const isCorrect = userAnswers[qIndex] === q.correctAnswer;
                        return (
                          <div
                            key={qIndex}
                            className="bg-slate-50 dark:bg-[#1c1c22] border border-slate-200/80 dark:border-[#2c2c34] p-3 rounded-xl space-y-2"
                          >
                            <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                              {qIndex + 1}. {q.question}
                            </div>
                            <div className="space-y-1">
                              {q.options.map((opt, optIndex) => {
                                const selected = userAnswers[qIndex] === optIndex;
                                let btnStyle =
                                  "bg-white dark:bg-[#222228] border border-slate-200 dark:border-[#2e2e36] text-slate-700 dark:text-zinc-300";
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
                                    <span className="font-semibold mr-1.5">
                                      {String.fromCharCode(65 + optIndex)}.
                                    </span>
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                            {quizSubmitted && q.explanation && (
                              <div className="p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed border border-indigo-100 dark:border-indigo-900/40">
                                <span className="font-bold">{isEn ? "Explanation: " : "Penjelasan: "}</span>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-1">
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
                          {isEn ? "Check Answers" : "Periksa Jawaban"}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                            {isEn ? "Score: " : "Skor: "}
                            {
                              activeQuiz.filter((q, i) => userAnswers[i] === q.correctAnswer).length
                            }{" "}
                            / {activeQuiz.length} {isEn ? "Correct" : "Benar"}
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
                            {isEn ? "Try Again" : "Coba Lagi"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* ── Modal: Note Create / Edit Dialog (Centered with Full-Screen Backdrop Blur & Font Inter) ── */}
        {isEditing && (
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent
              hideCloseButton
              className="w-[calc(100%-1.5rem)] sm:w-full max-w-3xl max-h-[90vh] p-0 flex flex-col shadow-2xl rounded-2xl bg-white dark:bg-[#151518] border border-slate-200/80 dark:border-[#27272a] font-inter overflow-hidden"
            >
              <DialogTitle className="sr-only">
                {activeNoteId ? t.notes.dialogTitleEdit : t.notes.dialogTitleNew}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t.notes.dialogDesc}
              </DialogDescription>

              {/* Form Header with Action Buttons */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-[#242428] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <NotebookPen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 font-inter">
                      {activeNoteId ? t.notes.dialogTitleEdit : t.notes.dialogTitleNew}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-inter">
                      {t.notes.dialogDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="text-xs rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 dark:hover:bg-[#202026]"
                  >
                    {t.notes.cancelBtn}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => handleSaveNote(e as any)}
                    className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                  >
                    {t.notes.saveBtn}
                  </Button>
                </div>
              </div>

              {/* Form Body Container (Scrollable) */}
              <form onSubmit={handleSaveNote} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-inter">
                {/* Title Input */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    {t.notes.formTitleLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={t.notes.formTitlePlaceholder}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1c1c22] border border-slate-200/80 dark:border-[#2c2c34] text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/80 font-inter"
                    autoFocus
                  />
                </div>

                {/* Subject & Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      {t.notes.formSubjectLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={t.notes.formSubjectPlaceholder}
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1c1c22] border border-slate-200/80 dark:border-[#2c2c34] text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/80 font-inter"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      {t.notes.formTagsLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={t.notes.formTagsPlaceholder}
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1c1c22] border border-slate-200/80 dark:border-[#2c2c34] text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/80 font-inter"
                    />
                  </div>
                </div>

                {/* Rich WYSIWYG / Markdown Editor Container */}
                <div className="border border-slate-200/80 dark:border-[#2c2c34] rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-[#18181d]">
                  {/* Toolbar Header with Tab Switch & Formatting Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-slate-100/90 dark:bg-[#1c1c22] border-b border-slate-200/80 dark:border-[#2c2c34]">
                    {/* Mode Toggle: Visual (WYSIWYG), Markdown, Preview */}
                    <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-[#26262e] p-0.5 rounded-lg shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSwitchEditorTab("visual")}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${editorTab === "visual"
                            ? "bg-white dark:bg-[#151518] text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                            : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
                          }`}
                        title={isEn ? "Live visual WYSIWYG mode" : "Mode visual langsung berbentuk"}
                      >
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>{t.notes.tabVisual}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchEditorTab("markdown")}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${editorTab === "markdown"
                            ? "bg-white dark:bg-[#151518] text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                            : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
                          }`}
                        title={isEn ? "Raw Markdown syntax mode" : "Mode sintaks Markdown mentah"}
                      >
                        <Code className="w-3 h-3" />
                        <span>{t.notes.tabMarkdown}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchEditorTab("preview")}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${editorTab === "preview"
                            ? "bg-white dark:bg-[#151518] text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                            : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
                          }`}
                        title={isEn ? "Preview final rendered output" : "Pratinjau hasil akhir"}
                      >
                        <Eye className="w-3 h-3" />
                        <span>{t.notes.tabPreview}</span>
                      </button>
                    </div>

                    {/* Formatting Buttons Toolbar */}
                    {editorTab !== "preview" && (
                      <div className="flex items-center gap-0.5 flex-wrap overflow-x-auto no-scrollbar py-0.5">
                        <button
                          type="button"
                          onClick={() => applyFormat("bold")}
                          title={isEn ? "Bold (Ctrl+B)" : "Tebal / Bold (Ctrl+B)"}
                          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#26262e] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                        >
                          <Bold className="w-3.5 h-3.5 font-bold" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat("italic")}
                          title={isEn ? "Italic (Ctrl+I)" : "Miring / Italic (Ctrl+I)"}
                          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#26262e] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                        >
                          <Italic className="w-3.5 h-3.5 italic" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat("strikethrough")}
                          title={isEn ? "Strikethrough" : "Coret / Strikethrough"}
                          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#26262e] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                        >
                          <Strikethrough className="w-3.5 h-3.5" />
                        </button>

                        <div className="h-4 w-px bg-slate-300 dark:bg-[#33333d] mx-1" />

                        <button
                          type="button"
                          onClick={() => applyFormat("h1")}
                          title={isEn ? "Main Heading H1" : "Judul Utama H1"}
                          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#26262e] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                        >
                          <Heading1 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat("h2")}
                          title={isEn ? "Sub Heading H2" : "Sub Judul H2"}
                          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#26262e] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                        >
                          <Heading2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat("h3")}
                          title={isEn ? "Point H3" : "Poin H3"}
                          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#26262e] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                        >
                          <Heading3 className="w-3.5 h-3.5" />
                        </button>

                        <div className="h-4 w-px bg-slate-300 dark:bg-[#33333d] mx-1" />

                        <button
                          type="button"
                          onClick={() => applyFormat("bullet")}
                          title={isEn ? "Bullet List" : "Daftar Poin"}
                          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#26262e] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat("number")}
                          title={isEn ? "Numbered List" : "Daftar Nomor"}
                          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#26262e] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                        >
                          <ListOrdered className="w-3.5 h-3.5" />
                        </button>

                        <div className="h-4 w-px bg-slate-300 dark:bg-[#33333d] mx-1" />

                        <button
                          type="button"
                          onClick={() => applyFormat("quote")}
                          title={isEn ? "Quote" : "Kutipan"}
                          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#26262e] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                        >
                          <Quote className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat("code")}
                          title={isEn ? "Code Block / Text" : "Blok / Teks Kode"}
                          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#26262e] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat("link")}
                          title={isEn ? "Hyperlink" : "Tautan Link"}
                          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#26262e] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat("image")}
                          title={isEn ? "Insert Image URL" : "Sisipkan Foto / Gambar URL"}
                          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#26262e] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat("table")}
                          title={isEn ? "Table" : "Tabel"}
                          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-[#26262e] hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                        >
                          <Table className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Editor / Live Preview Body */}
                  {editorTab === "visual" ? (
                    <div className="relative min-h-[280px] max-h-[440px] overflow-y-auto bg-white/40 dark:bg-[#151518]/60">
                      <div
                        ref={visualEditorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={() => {
                          if (visualEditorRef.current) {
                            const md = htmlToMarkdown(visualEditorRef.current.innerHTML);
                            setFormContent(md);
                          }
                        }}
                        onKeyDown={handleVisualKeyDown}
                        onPaste={handleVisualPaste}
                        data-placeholder={isEn ? "Write coursework notes, formulas, or key concepts here..." : "Tulis materi, rumus, atau informasi penting di sini..."}
                        className="w-full p-4 min-h-[280px] bg-transparent border-0 text-slate-900 dark:text-zinc-100 focus:outline-none leading-relaxed font-inter prose prose-sm dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-zinc-500 empty:before:pointer-events-none [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-slate-200 [&_code]:dark:bg-zinc-800 [&_code]:text-indigo-600 [&_code]:dark:text-indigo-400 [&_code]:font-mono [&_code]:text-xs [&_img]:max-h-96 [&_img]:rounded-xl [&_img]:border [&_img]:border-slate-200 dark:[&_img]:border-zinc-800 [&_img]:my-2"
                      />
                    </div>
                  ) : editorTab === "markdown" ? (
                    <textarea
                      ref={textareaRef}
                      rows={12}
                      onKeyDown={handleKeyDown}
                      placeholder={isEn ? "Write course notes, formulas, key concepts, or paste study materials here... Use Markdown like **bold**, *italic*, # Heading, ![image](url), ``` code, or use the toolbar above." : "Tuliskan materi kuliah, rumus, konsep penting, atau tempelkan catatan di sini... Gunakan Markdown seperti **tebal**, *miring*, # Judul, ![foto](url), ``` kode, atau gunakan toolbar di atas."}
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      className="w-full p-4 text-xs sm:text-sm bg-transparent border-0 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none leading-relaxed font-inter"
                    />
                  ) : (
                    <div className="p-5 min-h-[280px] max-h-[440px] overflow-y-auto bg-white/50 dark:bg-[#151518]/60 font-inter">
                      {formContent.trim() ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed break-words font-inter">
                          <Markdown
                            remarkPlugins={[remarkGfm]}
                            components={noteMarkdownComponents}
                          >
                            {formatMarkdownTables(formContent)}
                          </Markdown>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-zinc-500 text-xs font-inter">
                          <NotebookPen className="w-6 h-6 mb-2 opacity-50" />
                          <span>{isEn ? "No content to preview yet." : "Belum ada isi catatan untuk dipratinjau."}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-end text-xs text-slate-500 dark:text-zinc-400 pt-1">
                  <span>
                    {formContent.length} {isEn ? "characters" : "karakter"} • {formContent.trim() ? formContent.trim().split(/\s+/).length : 0} {isEn ? "words" : "kata"}
                  </span>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Shell>
  );
}
