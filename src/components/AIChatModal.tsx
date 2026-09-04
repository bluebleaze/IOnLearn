"use client";
import React, { useState, useRef, useEffect } from "react";
import {
    X,
    Send,
    Sparkles,
    Bot,
    User,
    Trash2,
    Copy,
    Check,
    Loader2,
    GraduationCap,
    BookOpen,
    HelpCircle,
    Lightbulb,
    Maximize2,
    Minimize2,
    RefreshCw,
} from "lucide-react";
import Markdown from "react-markdown";
import { ChatMessage, TodoTask, UserPreferences } from "../types";
import { getGeminiModel, sendChatMessageToAI } from "../services/aiService";

interface AIChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: TodoTask[];
    activeTaskId?: string;
    onSelectTaskContext: (taskId?: string) => void;
    userPreferences?: UserPreferences | null;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({
    isOpen,
    onClose,
    tasks,
    activeTaskId,
    onSelectTaskContext,
    userPreferences,
}) => {
    const [sessions, setSessions] = useState<Record<string, ChatMessage[]>>({});
    const currentSessionId = activeTaskId || "general";
    const messages = sessions[currentSessionId] || [
        {
            id: "msg-init",
            role: "assistant",
            content: `Halo! 👋 Saya adalah **Asisten AI Akademik** Anda.\n\nSaya siap membantu Anda memahami materi kuliah/sekolah, memecah instruksi tugas dari Google Classroom, menyusun outline jawaban, atau mencari referensi & rumus penting.\n\nPilih tugas di atas atau langsung tanyakan apa saja!`,
            timestamp: Date.now(),
        }
    ];

    const setMessages = (action: React.SetStateAction<ChatMessage[]>) => {
        setSessions((prev) => {
            const current = prev[currentSessionId] || messages;
            const next = typeof action === "function" ? (action as any)(current) : action;
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

    if (!isOpen) return null;

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
            // Map format for API
            const apiMessages = newMessages
                .filter((m) => m.role === "user" || m.role === "assistant")
                .map((m) => ({
                    role: m.role as "user" | "assistant",
                    content: m.content,
                }));

            const response = await sendChatMessageToAI(
                apiMessages,
                activeTask,
                userPreferences,
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
                content: `⚠️ Maaf, terjadi kendala saat memproses pertanyaan: ${error.message || "Silakan periksa koneksi atau coba lagi."}`,
                timestamp: Date.now(),
                isError: true,
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = async () => {
        const errorFreeMessages = messages.filter((m) => !m.isError);
        setMessages(errorFreeMessages);
        setIsLoading(true);
        setDynamicPrompts([]);

        try {
            const apiMessages = errorFreeMessages
                .filter((m) => m.role === "user" || m.role === "assistant")
                .map((m) => ({
                    role: m.role as "user" | "assistant",
                    content: m.content,
                }));

            const response = await sendChatMessageToAI(
                apiMessages,
                activeTask,
                userPreferences,
            );

            const botMsg: ChatMessage = {
                id: `bot-${Date.now()}`,
                role: "assistant",
                content: response.reply,
                timestamp: response.timestamp,
                taskId: activeTask?.id,
                taskTitle: activeTask?.title,
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
                content: `⚠️ Maaf, terjadi kendala saat memproses pertanyaan: ${error.message || "Silakan periksa koneksi atau coba lagi."}`,
                timestamp: Date.now(),
                isError: true,
            };
            setMessages((prev) => [...prev, errorMsg]);
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

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: `msg-reset-${Date.now()}`,
                role: "assistant",
                content: `Riwayat percakapan telah dibersihkan. Ada materi atau tugas lain yang ingin kita diskusikan?`,
                timestamp: Date.now(),
            },
        ]);
        setDynamicPrompts([]);
    };

    const getDefaultPrompts = () => {
        if (activeTask) {
            const titleSnippet =
                activeTask.title.slice(0, 30) +
                (activeTask.title.length > 30 ? "..." : "");
            const prompts = [
                `Tolong bantu saya mulai mengerjakan tugas "${titleSnippet}"`,
            ];

            if (
                activeTask.aiAnalysis?.keyConcepts &&
                activeTask.aiAnalysis.keyConcepts.length > 0
            ) {
                prompts.push(
                    `Bisa jelaskan lebih detail mengenai konsep "${activeTask.aiAnalysis.keyConcepts[0]}"?`,
                );
            } else {
                prompts.push(
                    `Apa saja materi pokok yang harus saya pahami untuk tugas ini?`,
                );
            }

            if (
                activeTask.aiAnalysis?.checklist &&
                activeTask.aiAnalysis.checklist.length > 0
            ) {
                const firstUndone = activeTask.aiAnalysis.checklist.find(
                    (c) => !c.done,
                );
                if (firstUndone) {
                    prompts.push(
                        `Bagaimana cara menyelesaikan langkah: "${firstUndone.text}"?`,
                    );
                } else {
                    prompts.push(
                        `Tugas ini sudah selesai, apa ada materi pengayaan tambahan?`,
                    );
                }
            } else {
                prompts.push(
                    `Buatkan kerangka atau langkah-langkah untuk mengerjakan tugas ini.`,
                );
            }

            prompts.push(
                `Jelaskan inti tugas ini dengan bahasa yang sangat sederhana (ELI5).`,
            );

            return prompts;
        }

        return [
            "Bagaimana cara mengatur jadwal belajar agar tidak menunda-nunda?",
            "Bantu jelaskan perbedaan antara synchronous vs asynchronous programming",
            "Buatkan contoh struktur esai argumentatif yang baik",
            "Berikan tips membaca jurnal akademis dengan cepat dan efektif",
        ];
    };

    const defaultSuggestedPrompts = getDefaultPrompts();

    const suggestedPromptsToDisplay =
        dynamicPrompts.length > 0 ? dynamicPrompts : defaultSuggestedPrompts;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div
                className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh] max-h-[850px] animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}>
                {/* Chat Header */}
                <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs shrink-0">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-base">
                                    AI Academic Tutor & Chatbot
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                                    Online
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                                Tanya materi, bimbingan tugas Classroom, & bedah
                                referensi belajar
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handleClearChat}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
                            title="Bersihkan riwayat percakapan">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Task Context Selector Ribbon */}
                <div className="px-4 py-2.5 bg-indigo-50/70 border-b border-indigo-100 flex items-center gap-2 text-xs">
                    <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-indigo-950 shrink-0">
                        Konteks Diskusi:
                    </span>
                    <select
                        id="chat-task-context-select"
                        value={activeTaskId || ""}
                        onChange={(e) =>
                            onSelectTaskContext(
                                e.target.value ? e.target.value : undefined,
                            )
                        }
                        className="flex-1 min-w-0 bg-white border border-indigo-200 text-indigo-900 font-medium rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate cursor-pointer">
                        <option value="">
                            🌐 Umum (Semua Mata Kuliah / Bebas)
                        </option>
                        {tasks.map((t) => (
                            <option key={t.id} value={t.id}>
                                📚 [{t.courseName}] {t.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Messages List Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
                    {messages.map((msg) => {
                        const isBot = msg.role === "assistant";
                        return (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${isBot ? "items-start" : "items-start flex-row-reverse"}`}>
                                {/* Avatar */}
                                <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                                        isBot
                                            ? "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-2xs"
                                            : "bg-slate-800 text-white"
                                    }`}>
                                    {isBot ? (
                                        <Sparkles className="w-4 h-4" />
                                    ) : (
                                        <User className="w-4 h-4" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div
                                    className={`group relative max-w-[85%] rounded-2xl p-4 shadow-2xs text-xs sm:text-sm leading-relaxed ${
                                        isBot
                                            ? msg.isError
                                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                                : "bg-white text-slate-800 border border-slate-200/90"
                                            : "bg-indigo-600 text-white font-medium"
                                    }`}>
                                    {/* Task Context Tag if present */}
                                    {msg.taskTitle && !isBot && (
                                        <div className="text-[10px] text-indigo-200 mb-1 flex items-center gap-1">
                                            <GraduationCap className="w-3 h-3" />
                                            <span className="truncate">
                                                {msg.taskTitle}
                                            </span>
                                        </div>
                                    )}

                                    {/* Message Content */}
                                    {isBot ? (
                                        <div className="markdown-body space-y-2">
                                            <Markdown>{msg.content}</Markdown>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap">
                                            {msg.content}
                                        </p>
                                    )}

                                    {/* Action row (Copy, timestamp, retry) */}
                                    <div
                                        className={`mt-2 flex items-center justify-end gap-2 text-[10px] ${
                                            isBot
                                                ? "text-slate-400"
                                                : "text-indigo-200"
                                        }`}>
                                        {isBot && !msg.isError && (
                                            <button
                                                onClick={() =>
                                                    handleCopy(
                                                        msg.content,
                                                        msg.id,
                                                    )
                                                }
                                                className="opacity-0 group-hover:opacity-100 hover:text-slate-700 transition flex items-center gap-0.5 cursor-pointer"
                                                title="Salin teks">
                                                {copiedId === msg.id ? (
                                                    <>
                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                        <span className="text-emerald-600">
                                                            Disalin
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3 h-3" />
                                                        <span>Salin</span>
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {msg.isError && (
                                            <button
                                                onClick={handleRetry}
                                                className="opacity-100 text-rose-600 hover:text-rose-800 transition flex items-center gap-1 cursor-pointer font-bold bg-rose-100 px-2 py-1 rounded-md">
                                                <RefreshCw className="w-3 h-3" />
                                                <span>Coba Lagi</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {isLoading && (
                        <div className="flex gap-3 items-center">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 animate-spin" />
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                <span>
                                    AI sedang berpikir & menyusun penjelasan
                                    terbaik...
                                </span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Prompts Pills */}
                <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-200 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
                    <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500" /> Contoh:
                    </span>
                    {suggestedPromptsToDisplay.map((prompt, pIdx) => (
                        <button
                            key={pIdx}
                            onClick={() => handleSendMessage(prompt)}
                            className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 text-[11px] font-medium rounded-lg whitespace-nowrap transition cursor-pointer shadow-2xs">
                            {prompt}
                        </button>
                    ))}
                </div>

                {/* Input Bar */}
                <div className="p-4 border-t border-slate-200 bg-white">
                    <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
                        <div className="flex flex-col gap-1 shrink-0 px-1">
                            <input
                                type="file"
                                id="chat-file-upload"
                                className="hidden"
                                accept=".txt,.md,.csv,.json"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        const text = event.target
                                            ?.result as string;
                                        setInputPrompt(
                                            (prev) =>
                                                prev +
                                                `\n\n[Isi Dokumen ${file.name}]:\n${text}`,
                                        );
                                    };
                                    reader.readAsText(file);
                                }}
                            />
                            <button
                                onClick={() =>
                                    document
                                        .getElementById("chat-file-upload")
                                        ?.click()
                                }
                                className="p-1.5 text-slate-400 hover:text-indigo-600 transition"
                                title="Sisipkan file teks/dokumen (.txt, .md, .csv)">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                </svg>
                            </button>
                        </div>
                        <textarea
                            id="ai-chat-input-field"
                            ref={inputRef}
                            value={inputPrompt}
                            onChange={(e) => setInputPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                activeTask
                                    ? `Tanyakan apapun tentang "${activeTask.title.slice(0, 35)}..."`
                                    : "Ketik pertanyaan, materi kuliah, atau instruksi tugas di sini..."
                            }
                            rows={2}
                            className="flex-1 bg-transparent border-0 resize-none text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none px-2 py-1"
                        />
                        <button
                            id="ai-chat-send-btn"
                            onClick={() => handleSendMessage()}
                            disabled={!inputPrompt.trim() || isLoading}
                            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white transition cursor-pointer shrink-0 shadow-xs"
                            title="Kirim pesan">
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
                        <span>
                            Tekan <strong>Enter</strong> untuk mengirim,{" "}
                            <strong>Shift + Enter</strong> untuk baris baru
                        </span>
                        <span>Didukung {getGeminiModel()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
