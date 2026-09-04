"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  User,
  Trash2,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  Lightbulb,
  MessageSquare,
  X,
} from "lucide-react";
import Markdown from "react-markdown";
import { AIConfig, ChatMessage, TodoTask, UserPreferences } from "../types";
import { sendChatMessageToAI } from "../services/aiService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TodoTask[];
  activeTaskId?: string;
  onSelectTaskContext: (taskId?: string) => void;
  userPreferences?: UserPreferences | null;
  aiConfig?: AIConfig | null;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  tasks,
  activeTaskId,
  onSelectTaskContext,
  userPreferences,
  aiConfig,
}) => {
  const [sessions, setSessions] = useState<Record<string, ChatMessage[]>>({});
  const currentSessionId = activeTaskId || "general";
  const messages = sessions[currentSessionId] || [
    {
      id: "msg-init",
      role: "assistant",
      content: `Halo! 👋 Saya adalah **Asisten Belajar AI** Anda.\n\nSaya siap membantu memahami materi pelajaran, memecah langkah tugas sekolah, mencari rumus & konsep kunci, atau membuat contoh soal latihan.\n\nSilakan pilih tugas di atas atau langsung tanyakan apa saja yang ingin kamu pelajari! ✨`,
      timestamp: Date.now(),
    },
  ];

  const setMessages = (action: React.SetStateAction<ChatMessage[]>) => {
    setSessions((prev) => {
      const current = prev[currentSessionId] || messages;
      const next =
        typeof action === "function" ? (action as any)(current) : action;
      return { ...prev, [currentSessionId]: next };
    });
  };

  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dynamicPrompts, setDynamicPrompts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // Reset dynamic prompts when task context changes
  useEffect(() => {
    setDynamicPrompts([]);
  }, [activeTaskId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
      taskId: activeTaskId,
      taskTitle: activeTask?.title,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputPrompt("");
    setIsLoading(true);

    try {
      const apiMessages = newMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      const response = await sendChatMessageToAI(
        apiMessages,
        activeTask,
        userPreferences
      );

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        timestamp: response.timestamp,
        taskId: activeTaskId,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (
        response.suggestedPrompts &&
        response.suggestedPrompts.length > 0
      ) {
        setDynamicPrompts(response.suggestedPrompts);
      } else {
        setDynamicPrompts([]);
      }
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ Maaf, terjadi kendala saat memproses jawaban: ${
          error.message || "Silakan periksa koneksi internet atau coba lagi."
        }`,
        timestamp: Date.now(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        role: "assistant",
        content: `Obrolan telah dibersihkan. Ada materi atau tugas lain yang ingin kamu diskusikan? 😊`,
        timestamp: Date.now(),
      },
    ]);
    setDynamicPrompts([]);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // TurboLearn standard prompt chips (concise, high value)
  const defaultQuickPrompts = activeTask
    ? [
        "Jelaskan materi tugas ini dengan sangat sederhana",
        "Buatkan rangkuman poin penting",
        "Bagaimana langkah awal mengerjakannya?",
        "Berikan 2 contoh soal latihan",
      ]
    : [
        "Tips belajar efektif & tidak cepat bosan",
        "Cara membuat catatan materi yang rapi",
        "Buatkan soal latihan pemahaman",
      ];

  const displayPrompts =
    dynamicPrompts.length > 0 ? dynamicPrompts.slice(0, 3) : defaultQuickPrompts.slice(0, 3);

  const getModelLabel = () => {
    if (aiConfig?.provider === "gemini_custom") {
      const model = aiConfig.model || "gemini-3.1-flash-lite";
      return model.startsWith("gemini-")
        ? model.replace("gemini-", "Gemini ")
        : model;
    }
    if (aiConfig?.provider === "openai") {
      return aiConfig.model || "GPT-4o Mini";
    }
    return "Gemini 3.1 Flash Lite";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent hideCloseButton className="max-w-3xl h-[85vh] max-h-[780px] p-0 flex flex-col gap-0 overflow-hidden">
        {/* TurboLearn AI Chat Header (Fixed, Non-scrollable) */}
        <DialogHeader className="p-4 sm:p-5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center justify-between gap-3">
            {/* AI Avatar & Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <DialogTitle className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight truncate flex items-center gap-1.5">
                    <span>TurboLearn AI Tutor</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online & Siap"></span>
                  </DialogTitle>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                    <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                    <span>{getModelLabel()}</span>
                  </span>
                </div>
                <DialogDescription className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1.5">
                  <span>Asisten Belajar Pribadi</span>
                  <span className="text-slate-300">•</span>
                  <span className="sm:hidden font-semibold text-indigo-600">
                    {getModelLabel()}
                  </span>
                  <span className="hidden sm:inline text-slate-400">Siap Menjawab & Diskusi</span>
                </DialogDescription>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="ghost"
                size="iconSm"
                onClick={handleClearHistory}
                className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
                title="Bersihkan obrolan"
                aria-label="Bersihkan obrolan"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="iconSm"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
                title="Tutup chatbot"
                aria-label="Tutup chatbot"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Context Selector Bar */}
          <div className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 shrink-0">
              Fokus Diskusi:
            </span>
            <div className="relative flex-1 min-w-0">
              <select
                value={activeTaskId || "general"}
                onChange={(e) =>
                  onSelectTaskContext(
                    e.target.value === "general" ? undefined : e.target.value
                  )
                }
                className="w-full appearance-none pl-3 pr-8 py-1.5 text-xs font-bold bg-indigo-50 border border-indigo-200/80 rounded-xl text-indigo-900 hover:bg-indigo-100/70 focus:outline-none transition cursor-pointer truncate"
              >
                <option value="general">
                  🌐 Obrolan Umum (Semua Pelajaran)
                </option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    📖 {t.courseName}: {t.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </DialogHeader>

        {/* Chat Messages Body (THE ONLY SCROLLABLE AREA, Locked from Parent Chaining) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 bg-slate-50/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Bot Avatar */}
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-3xl p-4 sm:p-5 transition shadow-2xs ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : msg.isError
                    ? "bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-none"
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                }`}
              >
                {/* Content */}
                <div className="text-xs sm:text-sm leading-relaxed prose prose-sm max-w-none prose-slate">
                  <Markdown>{msg.content}</Markdown>
                </div>

                {/* Assistant Message Actions */}
                {msg.role === "assistant" && !msg.isError && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-[11px] text-slate-400">
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="inline-flex items-center gap-1 hover:text-indigo-600 transition cursor-pointer p-1 rounded-md"
                      title="Salin jawaban"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs font-bold text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-2.5 justify-start animate-in fade-in duration-150">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl rounded-tl-none p-4 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                <span
                  className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"
                  style={{ animationDelay: "300ms" }}
                ></span>
                <span className="text-xs text-slate-500 font-semibold ml-1">
                  AI sedang menyusun jawaban...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Chips (Fixed, Non-scrollable Wrap) */}
        {displayPrompts.length > 0 && (
          <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex flex-wrap items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1 mr-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Saran:</span>
            </span>
            {displayPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <MessageSquare className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate max-w-[280px]">{prompt}</span>
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar (Fixed, Non-scrollable) */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <textarea
              ref={inputRef}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Tanyakan materi, rumus, langkah pengerjaan, atau contoh soal..."
              rows={1}
              className="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none max-h-32 transition"
            />

            <Button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              size="icon"
              className="rounded-2xl"
              title="Kirim pesan"
              aria-label="Kirim pesan"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {/* Model & AI Disclaimer Footer Info */}
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-500">
              <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
              <span>
                Powered by <strong className="text-slate-700 font-semibold">{getModelLabel()}</strong>
              </span>
            </span>
            <span className="hidden sm:inline text-slate-400 text-[10px]">
              AI dapat membuat kekeliruan • Selalu verifikasi jawaban penting
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
