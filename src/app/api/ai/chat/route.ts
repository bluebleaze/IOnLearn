import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { AIConfig } from "@/types";
import { cleanLatexMath } from "@/lib/mathUtils";
import { buildPollinationsImageUrl, enhanceImagePrompt } from "@/lib/imageUtils";
const KNOWN_SUBJECTS = [
    "Fisika",
    "Matematika",
    "Biologi",
    "Kimia",
    "Informatika",
    "Pemrograman",
    "Algoritma",
    "Statistika",
    "Kalkulus",
    "Basis Data",
    "Jaringan Komputer",
    "Sistem Operasi",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "Sejarah",
    "Ekonomi",
    "Geografi",
    "Sosiologi",
    "Akuntansi",
    "Kewirausahaan",
    "Kewarganegaraan",
];

const IGNORED_TAG_WORDS = new Set([
    "ai copilot",
    "ai",
    "copilot",
    "socratic",
    "direct",
    "quizzer",
    "chat",
    "chat ai",
    "rangkuman",
    "catatan ai",
    "belajar ai",
    "catatan",
    "materi",
    "general",
    "umum",
    "tag",
    "tags",
    "label",
]);

function cleanAndNormalizeTags(rawTags: (string | undefined | null)[]): string[] {
    const result: string[] = [];
    const seen = new Set<string>();

    for (const raw of rawTags) {
        if (!raw || typeof raw !== "string") continue;
        const parts = raw.split(",");
        for (let p of parts) {
            p = p.replace(/^[#\s*>-]+/, "").replace(/[*_`~#]/g, "").trim();
            if (!p || p.length < 2) continue;
            const lower = p.toLowerCase();
            if (IGNORED_TAG_WORDS.has(lower)) continue;
            if (seen.has(lower)) continue;

            seen.add(lower);
            if (lower === "uas" || lower === "uts" || lower === "ti" || lower === "si" || lower === "ipa" || lower === "ips") {
                result.push(lower.toUpperCase());
            } else {
                const formatted = p.charAt(0).toUpperCase() + p.slice(1);
                result.push(formatted);
            }
        }
    }

    return result.slice(0, 3);
}

function sanitizeNoteOutput(
    rawNote: any,
    replyText?: string,
    taskContext?: any
): { title: string; content: string; subject: string; tags: string[] } | undefined {
    if (!rawNote || typeof rawNote !== "object") return undefined;

    let rawTitle = typeof rawNote.title === "string" ? rawNote.title.trim() : "";
    let rawContent = typeof rawNote.content === "string" ? rawNote.content.trim() : "";
    let subject = typeof rawNote.subject === "string" && rawNote.subject.trim()
        ? rawNote.subject.trim()
        : taskContext?.courseName || "";
    const rawTags: string[] = Array.isArray(rawNote.tags)
        ? rawNote.tags.map((t: any) => String(t).trim()).filter(Boolean)
        : [];

    // If content is empty/missing, but title contains the whole note / markdown
    if (!rawContent && rawTitle) {
        rawContent = rawTitle;
    }

    // If content is still empty, fallback to replyText
    if (!rawContent && replyText && replyText.trim()) {
        rawContent = replyText.trim();
    }

    if (!rawContent && !rawTitle) {
        return undefined;
    }

    // Extract a clean, concise title (under 70 chars, no markdown tokens)
    let cleanTitle = rawTitle;
    const firstLine = (rawTitle || rawContent).split("\n")[0].trim();
    const delimMatch = firstLine.match(/^(.*?)(?:\s+[-–—]\s+|\.\s+###|\s*###|:\s+)/);
    if (delimMatch && delimMatch[1] && delimMatch[1].trim().length >= 4) {
        cleanTitle = delimMatch[1].trim();
    } else {
        const dotIdx = firstLine.indexOf(". ");
        if (dotIdx > 4 && dotIdx <= 70) {
            cleanTitle = firstLine.slice(0, dotIdx);
        } else {
            cleanTitle = firstLine.slice(0, 70);
        }
    }

    cleanTitle = cleanTitle
        .replace(/^[#\s*>-]+/, "")
        .replace(/[*_`~]/g, "")
        .replace(/["'{}]/g, "")
        .trim();

    if (!cleanTitle || cleanTitle.length < 3) {
        cleanTitle = taskContext?.title ? `Catatan: ${taskContext.title}` : "Catatan Materi AI";
    }

    // Extract any trailing embedded tag line from markdown content (e.g. "### Tag: #Fisika #Mekanika #Rotasi")
    const trailingTagLineMatch = rawContent.match(/(?:^|\n)\s*(?:###?\s*)?(?:Tag|Tags|Label|Labels|Hashtags)\s*:\s*([^\n]+)$/i);
    if (trailingTagLineMatch && trailingTagLineMatch[1]) {
        const lineTags = trailingTagLineMatch[1].match(/#?([a-zA-Z0-9_-]+)/g);
        if (lineTags) {
            lineTags.forEach((t: string) => {
                const clean = t.replace(/^#/, "").trim();
                if (clean) rawTags.push(clean);
            });
        }
    }

    // Strip trailing tag lines and trailing hashtags block from content so they don't duplicate
    rawContent = rawContent
        .replace(/(?:\r?\n)+\s*(?:###?\s*)?(?:Tag|Tags|Label|Labels|Hashtags)\s*:\s*[^\n]+$/i, "")
        .replace(/(?:\r?\n)+\s*(?:#[a-zA-Z0-9_-]+\s*){1,10}$/i, "")
        .trim();

    // Ensure rawContent is not just the 1-line short title if replyText has more body
    if (rawContent === cleanTitle && replyText && replyText.trim().length > cleanTitle.length) {
        rawContent = replyText
            .replace(/(?:\r?\n)+\s*(?:###?\s*)?(?:Tag|Tags|Label|Labels|Hashtags)\s*:\s*[^\n]+$/i, "")
            .replace(/(?:\r?\n)+\s*(?:#[a-zA-Z0-9_-]+\s*){1,10}$/i, "")
            .trim();
    }

    let cleanedTags = cleanAndNormalizeTags(rawTags);

    // Subject inference & cleanup
    if (!subject || subject === "Belajar AI" || subject === "Catatan AI" || subject === "Umum") {
        const subjectFromTag = cleanedTags.find((t: string) =>
            KNOWN_SUBJECTS.some((ks: string) => ks.toLowerCase() === t.toLowerCase())
        );
        if (subjectFromTag) {
            subject = subjectFromTag;
            cleanedTags = cleanedTags.filter((t: string) => t.toLowerCase() !== subjectFromTag.toLowerCase());
        } else {
            const subjectFromTitle = KNOWN_SUBJECTS.find((ks: string) =>
                new RegExp(`\\b${ks}\\b`, "i").test(cleanTitle) || new RegExp(`\\b${ks}\\b`, "i").test(rawTitle)
            );
            subject = subjectFromTitle || (taskContext?.courseName ? taskContext.courseName : "Catatan Materi");
        }
    }

    if (subject) {
        cleanedTags = cleanedTags.filter((t: string) => t.toLowerCase() !== subject.toLowerCase());
    }

    return {
        title: cleanTitle,
        content: rawContent,
        subject: subject || "Catatan Materi",
        tags: cleanedTags,
    };
}

export function isConversationalFiller(text?: string): boolean {
    if (!text) return true;
    const trimmed = text.trim();
    if (trimmed.length < 250) {
        return true;
    }
    const lower = trimmed.toLowerCase();
    const startsWithFiller = (
        lower.startsWith("tentu saja") ||
        lower.startsWith("halo") ||
        lower.startsWith("hai") ||
        lower.startsWith("berikut adalah") ||
        lower.startsWith("saya telah") ||
        lower.startsWith("aku telah") ||
        lower.startsWith("dokumen ini siap") ||
        lower.startsWith("file ini siap") ||
        lower.startsWith("silakan unduh") ||
        lower.startsWith("baiklah") ||
        lower.startsWith("baik, saya telah")
    );
    if (startsWithFiller && !trimmed.includes("\n##") && trimmed.length < 500) {
        return true;
    }
    return false;
}

function extractFallbackActions(
    lastUserMessage: string,
    replyText: string,
    taskContext?: any,
    allMessages?: { role: string; content: string }[]
): { createdNote?: any; createdTodo?: any; createdDocument?: any; createdSlides?: any; createdImage?: any } {
    if (!replyText || replyText.length < 15) return {};

    const lowerUser = (lastUserMessage || "").toLowerCase();
    let createdNote: any = undefined;
    let createdTodo: any = undefined;
    let createdDocument: any = undefined;
    let createdSlides: any = undefined;
    let createdImage: any = undefined;

    // Check Note intent: "catatan", "catat", "rangkum", "ringkas", "materi", "note", "simpan"
    const wantsNote =
        lowerUser.includes("catat") ||
        lowerUser.includes("rangkum") ||
        lowerUser.includes("ringkas") ||
        lowerUser.includes("materi") ||
        lowerUser.includes("note") ||
        lowerUser.includes("simpan");

    if (wantsNote) {
        const lines = replyText.split("\n").map((l) => l.trim()).filter(Boolean);
        const headingLine = lines.find((l) => l.startsWith("#"));
        const rawTitle = headingLine
            ? headingLine.replace(/^[#\s*]+/, "").trim()
            : lines[0]?.replace(/^[#\s*]+/, "").slice(0, 60) || "Catatan Materi AI";

        const cleanTitle = rawTitle.replace(/["'{}]/g, "").slice(0, 70);

        createdNote = sanitizeNoteOutput(
            {
                title: cleanTitle || (taskContext?.title ? `Catatan: ${taskContext.title}` : "Catatan Materi AI"),
                content: replyText,
                subject: taskContext?.courseName || "Belajar Mandiri",
                tags: ["AI Copilot", "Rangkuman"],
            },
            replyText,
            taskContext
        );
    }

    // Check To-Do intent: "to-do", "todo", "to do", "daftar tugas", "list tugas", "langkah", "action plan", "jadwal", "rencana"
    const wantsTodo =
        lowerUser.includes("to-do") ||
        lowerUser.includes("todo") ||
        lowerUser.includes("to do") ||
        lowerUser.includes("daftar tugas") ||
        lowerUser.includes("list tugas") ||
        lowerUser.includes("langkah kerja") ||
        lowerUser.includes("action plan") ||
        lowerUser.includes("rencana belajar");

    if (wantsTodo) {
        const lines = replyText.split("\n").map((l) => l.trim()).filter(Boolean);
        const headingLine = lines.find((l) => l.startsWith("#"));
        const rawTitle = headingLine
            ? headingLine.replace(/^[#\s*]+/, "").trim()
            : taskContext?.title ? `Rencana Belajar: ${taskContext.title}` : "Rencana Belajar & Tugas";
        const cleanTitle = rawTitle.replace(/["'{}]/g, "").slice(0, 80);

        const subtasks: { title: string }[] = [];
        for (const line of lines) {
            const numMatch = line.match(/^(\d+[\.\)]\s+|[-*•]\s+)(.+)/);
            if (numMatch && numMatch[2]) {
                const subTitle = numMatch[2]
                    .replace(/\*\*/g, "")
                    .replace(/["'{}]/g, "")
                    .trim();
                if (subTitle.length > 3 && subTitle.length < 150 && !subTitle.startsWith("#")) {
                    subtasks.push({ title: subTitle });
                }
            }
        }

        if (subtasks.length > 0) {
            createdTodo = {
                title: cleanTitle || "Rencana Belajar AI",
                description: `Rencana pengerjaan dengan ${subtasks.length} sub-langkah.`,
                priority: "medium",
                category: taskContext?.courseName || "Belajar AI",
                subtasks: subtasks.slice(0, 10),
            };
        }
    }

    // Check Document intent: "pdf", "word", "docx", "makalah", "dokumen", "excel", "xlsx", "spreadsheet"
    const wantsDocx = lowerUser.includes("word") || lowerUser.includes("docx") || lowerUser.includes(".docx");
    const wantsPdf = lowerUser.includes("pdf") || lowerUser.includes(".pdf");
    const wantsXlsx = lowerUser.includes("excel") || lowerUser.includes("xlsx") || lowerUser.includes(".xlsx") || lowerUser.includes("spreadsheet") || lowerUser.includes("spredsheet") || lowerUser.includes("xlxs");
    if (wantsDocx || wantsPdf || wantsXlsx) {
        const lines = replyText.split("\n").map((l) => l.trim()).filter(Boolean);
        const headingLine = lines.find((l) => l.startsWith("#"));
        const docTitle = headingLine
            ? headingLine.replace(/^[#\s*]+/, "").trim().slice(0, 80)
            : taskContext?.title || (wantsXlsx ? "Tabel Data Spreadsheet" : "Dokumen Materi Belajar");

        const docType: "docx" | "pdf" | "xlsx" = wantsXlsx ? "xlsx" : wantsDocx ? "docx" : "pdf";

        // Prevent conversational greeting from becoming the document content
        let docContent = replyText;
        if (isConversationalFiller(docContent)) {
            const prevAssistantMsgs = (allMessages || []).filter(
                (m) => m.role === "assistant" && m.content && !isConversationalFiller(m.content) && m.content.length > 250
            );
            if (prevAssistantMsgs.length > 0) {
                docContent = prevAssistantMsgs[prevAssistantMsgs.length - 1].content;
            } else if (replyText && replyText.trim().length > 30) {
                docContent = `# ${docTitle}\n\n${replyText}${taskContext?.description && taskContext.description.trim().length > 30 ? `\n\n## Deskripsi Tugas\n${taskContext.description}` : ""}`;
            } else if (taskContext && taskContext.description && taskContext.description.trim().length > 30) {
                docContent = `# ${docTitle}\n\n## Informasi Tugas & Topik\n- **Topik / Mata Pelajaran:** ${taskContext.courseName || "-"}\n- **Judul Tugas:** ${taskContext.title || "-"}\n${taskContext.dueDateStr ? `- **Batas Waktu:** ${taskContext.dueDateStr}\n` : ""}\n## Deskripsi & Rincian Praktikum\n${taskContext.description}\n\n${taskContext.customNotes ? `### Catatan Tambahan\n${taskContext.customNotes}\n` : ""}`;
            }
        }

        createdDocument = {
            type: docType,
            title: docTitle,
            content: docContent,
            fileName: `${docTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.${docType}`,
            description: `Dokumen ${docType === "xlsx" ? "Excel Spreadsheet (.xlsx)" : docType === "docx" ? "Word (.docx)" : "PDF (.pdf)"} siap unduh.`,
            subject: taskContext?.courseName,
        };
    }

    // Check Presentation Slides intent: "slide", "presentasi", "ppt", "pptx", "powerpoint", "bahan tayang", "tayangan", "deck"
    const wantsSlides =
        lowerUser.includes("slide") ||
        lowerUser.includes("presentasi") ||
        lowerUser.includes("ppt") ||
        lowerUser.includes("pptx") ||
        lowerUser.includes("powerpoint") ||
        lowerUser.includes("power point") ||
        lowerUser.includes("bahan tayang") ||
        lowerUser.includes("tayangan") ||
        lowerUser.includes("deck");

    if (wantsSlides) {
        // Multi-strategy section splitter: Slide headings, numbered parts, or any level 1-3 headings
        let rawSections = replyText.split(/(?:^|\n)(?=#+\s*(?:Slide|\d+|Bagian|Topik))/i);
        if (rawSections.length <= 1) {
            rawSections = replyText.split(/(?:^|\n)(?=#{1,3}\s+)/);
        }
        if (rawSections.length <= 1) {
            rawSections = replyText.split(/(?:^|\n)(?=(?:\*\*Slide\s*\d+[:\*]*|\d+\.\s+\*\*))/i);
        }

        const parsedSlides: { title: string; bullets: string[]; notes?: string }[] = [];

        for (const sec of rawSections) {
            const secLines = sec.trim().split("\n").map((l) => l.trim()).filter(Boolean);
            if (secLines.length === 0) continue;

            const slideTitle = secLines[0].replace(/^[#\s*]+/, "").replace(/[*_`]/g, "").slice(0, 70);
            if (!slideTitle || slideTitle.length < 3) continue;

            const bullets: string[] = [];
            let notes = "";

            for (let i = 1; i < secLines.length; i++) {
                const l = secLines[i];
                if (l.toLowerCase().startsWith("notes:") || l.toLowerCase().startsWith("catatan:")) {
                    notes = l.replace(/^(notes|catatan):\s*/i, "");
                } else if (/^[-*•\d\.]\s+/.test(l)) {
                    const b = l.replace(/^[-*•\d\.]+\s*/, "").replace(/[*_`]/g, "").trim();
                    if (b.length > 3) bullets.push(b);
                } else if (bullets.length < 5 && l.length > 10 && !l.startsWith("#")) {
                    bullets.push(l.replace(/[*_`]/g, "").trim());
                }
            }

            if (bullets.length === 0) {
                const sentences = secLines.slice(1).join(" ").split(/(?<=[.?!])\s+/).filter((s) => s.length > 10);
                bullets.push(...sentences.slice(0, 4));
            }

            if (slideTitle && bullets.length > 0) {
                parsedSlides.push({
                    title: slideTitle,
                    bullets: bullets.slice(0, 5),
                    notes: notes || undefined,
                });
            }
        }

        // Guaranteed fallback if replyText didn't contain explicit slide splits
        if (parsedSlides.length === 0 && replyText.length > 30) {
            const paragraphs = replyText.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length > 20);
            const mainTitle = (taskContext?.title || "Materi Presentasi").slice(0, 60);
            parsedSlides.push({
                title: mainTitle,
                bullets: [
                    taskContext?.courseName ? `Mata Pelajaran: ${taskContext.courseName}` : "Ringkasan Materi Presentasi",
                    "Disusun dengan IOnLearn Study Copilot",
                ],
                notes: "Slide pembuka materi presentasi.",
            });

            for (let i = 0; i < Math.min(paragraphs.length, 5); i++) {
                const p = paragraphs[i];
                const lines = p.split("\n").map((l) => l.trim()).filter(Boolean);
                const pTitle = lines[0]?.replace(/^[#\s*]+/, "").slice(0, 50) || `Poin Pembahasan ${i + 1}`;
                const pBullets = lines.slice(1).length > 0
                    ? lines.slice(1).map((l) => l.replace(/^[-*•\d\.]+\s*/, "")).slice(0, 4)
                    : p.split(". ").filter((s) => s.length > 8).slice(0, 4);

                parsedSlides.push({
                    title: pTitle,
                    bullets: pBullets.length > 0 ? pBullets : [p.slice(0, 100)],
                    notes: `Catatan materi slide ${i + 1}.`,
                });
            }
        }

        if (parsedSlides.length > 0) {
            const baseTitle = (taskContext?.title || parsedSlides[0]?.title || "Materi Presentasi").slice(0, 60);
            createdSlides = {
                title: baseTitle,
                theme: "indigo",
                slides: parsedSlides.slice(0, 8),
                fileName: `${baseTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 50)}.pptx`,
                subject: taskContext?.courseName,
            };
        }
    }

    // Check Image intent: "gambarkan", "buatkan gambar", "ilustrasikan", "generate image", "lukiskan", "gambar", "visualisasikan"
    const wantsImage =
        lowerUser.includes("gambarkan") ||
        lowerUser.includes("buatkan gambar") ||
        lowerUser.includes("bikin gambar") ||
        lowerUser.includes("ilustrasikan") ||
        lowerUser.includes("generate image") ||
        lowerUser.includes("lukiskan") ||
        lowerUser.includes("visualisasikan") ||
        lowerUser.includes("buatkan ilustrasi") ||
        (lowerUser.includes("diagram") && !wantsSlides);

    if (wantsImage) {
        const cleanPrompt = lastUserMessage
            .replace(/^(tolong\s+)?(buatkan\s+|bikin\s+)?(gambar(kan)?|ilustrasi(kan)?|diagram|foto|lukis(kan)?|visualisasikan|generate image)\s*(tentang|mengenai|dari|untuk)?\s*/i, "")
            .trim();

        if (cleanPrompt.length > 2) {
            const enhanced = enhanceImagePrompt(cleanPrompt);
            createdImage = {
                prompt: enhanced,
                caption: cleanPrompt.slice(0, 60),
                aspectRatio: "16:9",
            };
        }
    }

    return { createdNote, createdTodo, createdDocument, createdSlides, createdImage };
}

/**
 * Progressive streaming extractor for structured JSON output from Gemini (extracts thoughtProcess and reply)
 */
class StreamingJsonExtractor {
    private buffer = "";
    private isRawMode = false;
    public thoughtText = "";
    public replyText = "";
    private activeField: "none" | "thoughtProcess" | "reply" = "none";
    private thoughtDone = false;
    private replyDone = false;

    processChunk(chunk: string): { type: "thought" | "chunk"; delta: string }[] {
        if (!chunk) return [];
        const events: { type: "thought" | "chunk"; delta: string }[] = [];

        if (this.isRawMode) {
            this.replyText += chunk;
            return [{ type: "chunk", delta: chunk }];
        }

        this.buffer += chunk;

        while (true) {
            if (this.activeField === "none") {
                // If thoughtProcess has not finished and is present in buffer
                if (!this.thoughtDone) {
                    const matchThought = this.buffer.match(/"thoughtProcess"\s*:\s*"/);
                    if (matchThought && matchThought.index !== undefined) {
                        this.activeField = "thoughtProcess";
                        const startIndex = matchThought.index + matchThought[0].length;
                        this.buffer = this.buffer.slice(startIndex);
                        continue;
                    }
                }

                // If reply has not finished and is present in buffer
                if (!this.replyDone) {
                    const matchReply = this.buffer.match(/"reply"\s*:\s*"/);
                    if (matchReply && matchReply.index !== undefined) {
                        this.activeField = "reply";
                        const startIndex = matchReply.index + matchReply[0].length;
                        this.buffer = this.buffer.slice(startIndex);
                        continue;
                    }
                }

                // Fallback to raw mode if buffer is large and does not start as JSON object
                if (this.buffer.length > 80 && !this.buffer.trim().startsWith("{")) {
                    this.isRawMode = true;
                    const text = this.buffer;
                    this.buffer = "";
                    this.replyText += text;
                    return [{ type: "chunk", delta: text }];
                }

                break;
            }

            if (this.activeField === "thoughtProcess" || this.activeField === "reply") {
                let delta = "";
                let i = 0;
                let fieldClosed = false;

                while (i < this.buffer.length) {
                    const char = this.buffer[i];
                    if (char === "\\") {
                        if (i + 1 < this.buffer.length) {
                            const next = this.buffer[i + 1];
                            if (next === "n") delta += "\n";
                            else if (next === "t") delta += "\t";
                            else if (next === '"') delta += '"';
                            else if (next === "\\") delta += "\\";
                            else if (next === "/") delta += "/";
                            else if (next === "r") delta += "\r";
                            else if (next === "u") {
                                if (i + 5 < this.buffer.length) {
                                    const hex = this.buffer.slice(i + 2, i + 6);
                                    delta += String.fromCharCode(parseInt(hex, 16));
                                    i += 6;
                                    continue;
                                } else {
                                    break;
                                }
                            } else {
                                delta += next;
                            }
                            i += 2;
                            continue;
                        } else {
                            break;
                        }
                    } else if (char === '"') {
                        fieldClosed = true;
                        i++;
                        break;
                    } else {
                        delta += char;
                        i++;
                    }
                }

                this.buffer = this.buffer.slice(i);

                if (delta) {
                    if (this.activeField === "thoughtProcess") {
                        this.thoughtText += delta;
                        events.push({ type: "thought", delta });
                    } else {
                        this.replyText += delta;
                        events.push({ type: "chunk", delta });
                    }
                }

                if (fieldClosed) {
                    if (this.activeField === "thoughtProcess") {
                        this.thoughtDone = true;
                    } else {
                        this.replyDone = true;
                    }
                    this.activeField = "none";
                    continue;
                }

                break;
            }
        }

        return events;
    }
}

/**
 * Shared post-processing pipeline for AI chat responses
 */
function processAiChatResponse(
    responseText: string,
    messages: any[],
    taskContext: any,
    groundingSources: any[] = [],
    groundingQueries: any[] = []
) {
    let resultData: any = {};
    try {
        const cleaned = responseText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
        resultData = JSON.parse(cleaned);
    } catch {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                resultData = JSON.parse(jsonMatch[0]);
            } catch {
                resultData = { reply: responseText, suggestedPrompts: [] };
            }
        } else {
            resultData = { reply: responseText, suggestedPrompts: [] };
        }
    }

    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
    const fallback = extractFallbackActions(lastUserMsg, resultData.reply || responseText, taskContext, messages);

    const finalNote = sanitizeNoteOutput(resultData.createdNote, resultData.reply || responseText, taskContext)
        || fallback.createdNote
        || undefined;
    const finalTodo = resultData.createdTodo || (resultData.createdTodos && resultData.createdTodos.length > 0 ? undefined : fallback.createdTodo) || undefined;
    const finalTodos = resultData.createdTodos || undefined;

    const geminiDoc = resultData.createdDocument;
    let isGeminiDocValid = Boolean(geminiDoc && geminiDoc.title && geminiDoc.content && !isConversationalFiller(geminiDoc.content));

    if (geminiDoc && geminiDoc.title) {
        if (!geminiDoc.content || isConversationalFiller(geminiDoc.content)) {
            const prevAssistantMsgs = messages.filter(
                (m: any) => m.role === "assistant" && m.content && !isConversationalFiller(m.content) && m.content.length > 200
            );
            if (resultData.reply && !isConversationalFiller(resultData.reply) && resultData.reply.length > 150) {
                geminiDoc.content = resultData.reply;
                isGeminiDocValid = true;
            } else if (prevAssistantMsgs.length > 0) {
                geminiDoc.content = prevAssistantMsgs[prevAssistantMsgs.length - 1].content;
                isGeminiDocValid = true;
            } else if (fallback.createdDocument && !isConversationalFiller(fallback.createdDocument.content)) {
                geminiDoc.content = fallback.createdDocument.content;
                isGeminiDocValid = true;
            } else if (resultData.reply && resultData.reply.trim().length > 30) {
                geminiDoc.content = `# ${geminiDoc.title}\n\n${resultData.reply}`;
                isGeminiDocValid = true;
            }
        } else if (isGeminiDocValid && isConversationalFiller(resultData.reply)) {
            resultData.reply = geminiDoc.content;
        }
    }

    const rawDocument = (isGeminiDocValid ? geminiDoc : fallback.createdDocument) || undefined;
    if (rawDocument) {
        const headingMatch = rawDocument.content?.split("\n").find((l: string) => l.trim().startsWith("#"));
        if (headingMatch) {
            const headingTitle = headingMatch.replace(/^[#\s*]+/, "").trim().slice(0, 80);
            if (headingTitle && headingTitle.length > 3) {
                rawDocument.title = headingTitle;
            }
        } else if (taskContext?.title) {
            rawDocument.title = taskContext.title;
        }
    }

    const geminiSlides = resultData.createdSlides;
    if (geminiSlides && geminiSlides.title) {
        if (geminiSlides.title.length > 80) {
            geminiSlides.title = geminiSlides.title.split(/[:\n]/)[0].slice(0, 70);
        }
        if (!Array.isArray(geminiSlides.slides) || geminiSlides.slides.length === 0) {
            if (fallback.createdSlides && Array.isArray(fallback.createdSlides.slides) && fallback.createdSlides.slides.length > 0) {
                geminiSlides.slides = fallback.createdSlides.slides;
            }
        }
    }

    const isGeminiSlidesValid = geminiSlides && Array.isArray(geminiSlides.slides) && geminiSlides.slides.length > 0;
    const rawSlides = (isGeminiSlidesValid ? geminiSlides : fallback.createdSlides) || undefined;

    const geminiImage = resultData.createdImage;
    const isGeminiImageValid = geminiImage && geminiImage.prompt && geminiImage.prompt.trim().length > 0;
    const rawImage = (isGeminiImageValid ? geminiImage : fallback.createdImage) || undefined;

    const lowerMsg = lastUserMsg.toLowerCase();
    const userWantsSlides =
        lowerMsg.includes("slide") ||
        lowerMsg.includes("presentasi") ||
        lowerMsg.includes("ppt") ||
        lowerMsg.includes("pptx") ||
        lowerMsg.includes("powerpoint") ||
        lowerMsg.includes("power point") ||
        lowerMsg.includes("bahan tayang") ||
        lowerMsg.includes("tayangan") ||
        lowerMsg.includes("deck") ||
        lowerMsg.includes("slides");

    const userWantsDocument =
        (lowerMsg.includes("word") ||
        lowerMsg.includes("docx") ||
        lowerMsg.includes("pdf") ||
        lowerMsg.includes("makalah") ||
        lowerMsg.includes("excel") ||
        lowerMsg.includes("xlsx") ||
        lowerMsg.includes("spreadsheet") ||
        lowerMsg.includes("spredsheet") ||
        lowerMsg.includes("xlxs") ||
        (lowerMsg.includes("dokumen") && !userWantsSlides)) &&
        !userWantsSlides;

    const userWantsImage =
        lowerMsg.includes("gambarkan") ||
        lowerMsg.includes("buatkan gambar") ||
        lowerMsg.includes("bikin gambar") ||
        lowerMsg.includes("ilustrasikan") ||
        lowerMsg.includes("generate image") ||
        lowerMsg.includes("lukiskan") ||
        lowerMsg.includes("visualisasikan") ||
        lowerMsg.includes("buatkan ilustrasi") ||
        (lowerMsg.includes("diagram") && !userWantsSlides && !userWantsDocument);

    const userWantsAnyCreation = userWantsDocument || userWantsSlides || userWantsImage;

    const finalDocument = (rawDocument && rawDocument.title && (rawDocument.content || rawDocument.title))
        ? (userWantsAnyCreation && !userWantsDocument ? undefined : rawDocument)
        : undefined;

    const finalSlides = (rawSlides && Array.isArray(rawSlides.slides) && rawSlides.slides.length > 0)
        ? (userWantsAnyCreation && !userWantsSlides ? undefined : rawSlides)
        : undefined;

    const finalImage = (rawImage && rawImage.prompt)
        ? (userWantsAnyCreation && !userWantsImage ? undefined : rawImage)
        : undefined;

    if (finalImage && !finalImage.url && finalImage.prompt) {
        finalImage.url = buildPollinationsImageUrl(finalImage.prompt, finalImage.aspectRatio);
    }

    if (finalDocument) {
        if (finalDocument.title) finalDocument.title = cleanLatexMath(finalDocument.title);
        if (finalDocument.subject) finalDocument.subject = cleanLatexMath(finalDocument.subject);
        if (finalDocument.content) finalDocument.content = cleanLatexMath(finalDocument.content);
        if (finalDocument.description) finalDocument.description = cleanLatexMath(finalDocument.description);
    }

    if (finalSlides) {
        if (finalSlides.title) {
            finalSlides.title = cleanLatexMath(finalSlides.title.slice(0, 80));
        }
        if (finalSlides.fileName) {
            const baseName = (finalSlides.title || "presentasi").toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 50);
            finalSlides.fileName = `${baseName}.pptx`;
        }
        if (finalSlides.subject) finalSlides.subject = cleanLatexMath(finalSlides.subject);
        if (Array.isArray(finalSlides.slides)) {
            finalSlides.slides = finalSlides.slides.map((s: any) => ({
                ...s,
                title: cleanLatexMath((s.title || "Slide").slice(0, 70)),
                bullets: Array.isArray(s.bullets)
                    ? s.bullets.map((b: string) => cleanLatexMath(b)).filter((b: string) => b.trim().length > 0)
                    : ["Poin bahasan materi."],
                notes: s.notes ? cleanLatexMath(s.notes) : undefined,
            }));
        }
    }

    const rawReplyText =
        resultData.reply ||
        (typeof responseText === "string" && !responseText.startsWith("{") ? responseText : "Tugas berhasil diproses.");
    const cleanReply = cleanLatexMath(rawReplyText);

    return {
        reply: cleanReply,
        thoughtProcess: typeof resultData.thoughtProcess === "string" ? cleanLatexMath(resultData.thoughtProcess.trim()) : undefined,
        suggestedPrompts: Array.isArray(resultData.suggestedPrompts) ? resultData.suggestedPrompts : [],
        createdNote: finalNote,
        createdTodo: finalTodo,
        createdTodos: finalTodos,
        createdDocument: finalDocument,
        createdSlides: finalSlides,
        createdImage: finalImage,
        groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
        groundingQueries: groundingQueries.length > 0 ? groundingQueries : undefined,
        timestamp: Date.now(),
    };
}

export async function POST(req: Request) {
    try {
        const reqJson = await req.json();
        const { messages, taskContext, userPreferences, aiConfig, studyMode, stream: wantStream = true, enableGrounding = true } =
            reqJson as {
                messages: { role: string; content: string }[];
                taskContext?: any;
                userPreferences?: any;
                aiConfig?: AIConfig | null;
                studyMode?: "socratic" | "direct" | "quizzer";
                stream?: boolean;
                enableGrounding?: boolean;
            };

        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Messages array is required" },
                { status: 400 },
            );
        }

        let contextString = "";
        if (taskContext) {
            contextString = `\n--- KONTEKS MATERI / TUGAS AKTIF ---
Judul: ${taskContext.title || "-"}
Mata Pelajaran / Topik: ${taskContext.courseName || "-"}
Deskripsi / Materi: ${taskContext.description || "-"}
${taskContext.dueDateStr ? `Deadline: ${taskContext.dueDateStr}` : ""}
${taskContext.customNotes ? `Catatan Tambahan: ${taskContext.customNotes}` : ""}
------------------------------------`;
        }

        let modeInstruction = "";
        if (studyMode === "socratic") {
            modeInstruction = `\n--- MODE BELAJAR: TUTOR SOKRATIK ---
Bimbing siswa untuk menemukan jawaban sendiri secara kritis dengan petunjuk bertahap (hints).
PENGECUALIAN PENTING: Jika siswa secara spesifik meminta dokumen (Word, PDF, Excel, Slides) atau meminta format dokumen ("jawab dalam bentuk word/pdf"), Anda WAJIB MENGERJAKAN, MENGANALISIS, DAN MENULISKAN JAWABAN TUGAS TERSEBUT SECARA LENGKAP DAN TUNTAS DARI AWAL HINGGA AKHIR ke dalam dokumen dan chat, bukan hanya memberi petunjuk atau basa-basi!
------------------------------------`;
        } else if (studyMode === "direct") {
            modeInstruction = `\n--- MODE BELAJAR: PENJELASAN RINGKAS & CEPAT ---
Berikan penjelasan yang to-the-point, padat, terstruktur, langsung ke inti permasalahan beserta poin-poin utama atau rumus kunci tanpa bertele-tele.
------------------------------------`;
        } else if (studyMode === "quizzer") {
            modeInstruction = `\n--- MODE BELAJAR: LATIHAN & KUIS EVALUATIF ---
Tantang pemahaman siswa dengan mengajukan 1 sampai 2 soal latihan aplikatif / kuis pilihan ganda interaktif beserta opsi jawaban terkait topik ini, lalu diskusikan pembahasannya.
------------------------------------`;
        }

        let personalizationInstruction = "";
        if (userPreferences) {
            personalizationInstruction = `\n--- PREFERENSI PERSONALISASI SISWA ---
Siswa ini memiliki preferensi:
- Gaya Belajar: ${userPreferences.learningStyle || "Netral"}
- Tingkat Detail Penjelasan: ${userPreferences.explanationDetail || "Netral"}
- Gaya Bahasa AI (Tone): ${userPreferences.aiTone || "Ramah"}
Sesuaikan gaya bahasa (tone), panjang penjelasan, dan metode penyampaian Anda (misalnya visual description vs practical examples) secara ketat sesuai preferensi di atas.
--------------------------------------\n`;
        }

        const systemInstruction = `Anda adalah "Asisten Belajar & Akademik Cerdas IOnLearn" — seorang mentor akademik ahli, tutor pribadi serbabisa, dan spesialis riset yang cerdas, sistematis, ramah, dan suportif. Anda membantu siswa sekolah hingga mahasiswa dan peneliti memahami konsep rumit, menyelesaikan tugas dengan integritas, dan menghasilkan karya akademik berstandar tinggi.
${contextString}
${modeInstruction}
${personalizationInstruction}

### 🧠 PRINSIP & PEDOMAN PEDAGOGIS:
1. **Kejelasan Konseptual (First Principles Thinking)**:
   - Jelaskan konsep dari prinsip dasarnya: *apa itu*, *mengapa penting*, *bagaimana cara kerjanya*, dan *analogi nyata* yang mudah dibayangkan.
   - Jika membahas sains, matematika, atau pemrograman, sertakan penjabaran analitis langkah-demi-langkah (step-by-step) beserta alasan di balik tiap tahap rumus atau baris kode.
2. **Format Markdown Unggulan**:
   - Gunakan heading terstruktur (\`#\`, \`##\`, \`###\`), bullet poin bernomor atau simbol yang rapi, dan blok kode (\`\`\`bahasa) dengan penjelasan fungsi.
   - **Format Tabel Wajib Standar**: Untuk perbandingan atau data terstruktur, selalu gunakan tabel Markdown standar dengan pemisah baris baru (*newline*) yang tegas:
     | No | Parameter / Topik | Penjelasan / Nilai | Catatan |
     |:---|:---|:---|:---|
     | 1  | Data A            | Detail A           | Info A  |
     *DILARANG KERAS menggabungkan baris tabel menjadi satu baris teks.*
3. **Ketepatan Fakta & Grounding Web (Google Search)**:
   - Anda dilengkapi Google Search grounding untuk memvalidasi fakta mutakhir, data statistik resmi, literatur akademik, dan peristiwa riil.
   - Selalu manfaatkan pencarian web agar isi materi, dokumen, slide, dan data tabel tidak pernah berhalusinasi atau usang.
   - Jika terdapat data faktual penting, sebutkan konteks tahun atau rujukan ilmiahnya secara alami di dalam narasi.
4. **Format Notasi Matematika, Statistika, & Sains Bersih & Terbaca**:
   - DILARANG KERAS menggunakan format raw LaTeX bermasalah seperti \`$\\bar{x} = \\frac{\\sum{i=1}^{n} xi}{n}$$\` dengan tanda dollar ($), tanda dollar ganda ($$), atau kurung kurawal ganda yang tidak rapi.
   - Selalu tulis rumus matematika, statistika, fisika, dan sains menggunakan simbol Unicode standar yang bersih, elegan, dan langsung terbaca sempurna di dokumen Word (.docx), PDF, maupun di tampilan chat:
     • Gunakan \`x̄ = (Σ(i=1..n) xᵢ) / n\` atau \`x̄ = (x₁ + x₂ + ... + xₙ) / n\`.
     • Gunakan simbol standar: \`Σ\` (sigma/penjumlahan), \`Π\` (produk), \`√\` (akar), \`±\` (plus-minus), \`×\` (kali), \`÷\` (bagi), \`≈\` (mendekati), \`≠\` (tidak sama dengan), \`≤\`, \`≥\`, \`∞\` (tak hingga).
     • Gunakan subscript dan superscript Unicode untuk variabel: \`x₁\`, \`x₂\`, \`xᵢ\`, \`yᵢ\`, \`x²\`, \`r²\`, \`n\`.
     • Tuliskan keterangan variabel dalam daftar yang rapi:
       • \`x̄\` = Nilai rerata (mean)
       • \`xᵢ\` = Nilai data pengujian ke-i
       • \`n\` = Jumlah total sampel atau iterasi
5. **Protokol Anti-Halusinasi & Chain-of-Thought (Penalaran Kritis)**:
   - Sebelum menuliskan teks jawaban akhir pada \`reply\`, Anda WAJIB memetakan penalaran, memverifikasi fakta, dan menguji rumus di dalam field \`thoughtProcess\`:
     • Uraikan inti persoalan dan kebutuhan spesifik pengguna.
     • Periksa kebenaran formula, substitusi angka, dan langkah kalkulasi matematika/sains secara teliti.
     • Jika menggunakan Google Search grounding, pastikan kesimpulan Anda bersumber langsung dari fakta yang ditemukan di web rujukan.
   - DILARANG KERAS MENGARANG FAKTA, ANGKA STATISTIK FIKTIF, TANGGAL BOHONGAN, RUMUS PALSU, ATAU KUTIPAN ILMIAH KARANGAN (Zero Hallucination Policy).
   - Jika ada hal yang tidak dapat dipastikan secara ilmiah atau di luar data yang tersedia, nyatakan secara jujur dan transparan bahwa data tersebut membutuhkan konfirmasi literatur rujukan lanjutan, jangan mereka-reka jawaban.

---

### ⚡ AKSI OTOMATISASI TERINTEGRASI (FILE & PRODUKTIVITAS):

1. 📝 **DOKUMEN FORMAL WORD (.DOCX) / PDF (.PDF) / SPREADSHEET EXCEL (.XLSX)**:
   *Pemicu: Ketika pengguna meminta dokumen, makalah, laporan, esai, file word/pdf, atau tabel spreadsheet excel/xlsx.*
   Isi field \`createdDocument\` dengan objek:
   - \`type\`: \`"docx"\` (dokumen Word), \`"pdf"\` (dokumen PDF), atau \`"xlsx"\` (spreadsheet Excel).
   - \`title\`: Judul resmi dokumen atau lembar kerja (ringkas, berbobot, maks 8-10 kata).
   - \`subject\`: Mata pelajaran / mata kuliah relevan.
   - \`fileName\`: Nama file rapi berakhiran \`.docx\`, \`.pdf\`, atau \`.xlsx\` (contoh: \`makalah_kecerdasan_buatan.docx\` atau \`analisis_keuangan_proyek.xlsx\`).
   - \`description\`: Ringkasan 1-2 kalimat mengenai cakupan isi dokumen.
   - \`content\`:
     * **Jika \`docx\` / \`pdf\`**: Tuliskan naskah lengkap, kaya, dan tuntas berformat Markdown:
     🚨 ATURAN MUTLAK KONTEN FILE: DILARANG KERAS HANYA MENGISI DENGAN PESAN BASA-BASI/PENGANTAR/TEMPLATE SEPERTI "Tentu saja saya telah menyusun dokumen...", "Berikut adalah file...", "Dokumen siap diunduh". ITU BUKAN DOKUMEN!
     Field 'content' HARUS BERISI NASKAH JAWABAN / LAPORAN / KARYA TULIS TUNTAS YANG SESUNGGUHNYA SECARA LENGKAP DARI AWAL HINGGA AKHIR:
     * **Jika \`docx\` / \`pdf\`**: Tuliskan naskah lengkap, kaya, dan tuntas berformat Markdown (minimal 500 - 1500 kata):
       - \`# Judul Dokumen\`
       - \`## Pendahuluan & Latar Belakang\`
       - \`## Landasan Teori / Konsep Kunci\`
       - \`## Pembahasan Komprehensif\` (pecah menjadi sub-bab \`###\`, sertakan studi kasus atau contoh konkret)
       - \`## Tabel Analisis / Komparasi\`
       - \`## Kesimpulan & Rekomendasi Aksi\`
       - \`## Langkah Praktikum / Pembahasan Komprehensif\` (uraikan langkah demi langkah secara nyata dengan baris perintah/prosedur teknis terinci)
       - \`## Tabel Analisis / Komparasi Data\`
       - \`## Hasil & Analisis Pengujian\`
       - \`## Kesimpulan & Rekomendasi\`
       - \`## Referensi / Daftar Rujukan Akademik\`
     * **Jika \`xlsx\`**: Tuliskan tabel data Markdown yang kaya data, rapi, dan realistis (minimal 5-10 baris dengan 3-6 kolom terstruktur). Sertakan kolom metrik angka yang jelas sehingga saat dikonversi menjadi file Excel siap dianalisis dan diolah.
     * PADA FIELD \`reply\`: Tuliskan ringkasan materi atau ulasan eksekutif dari isi dokumen tersebut, JANGAN hanya 1 baris kalimat template!

2. 📊 **SLIDE PRESENTASI PROFESIONAL POWERPOINT (.PPTX)**:
   *Pemicu: Ketika pengguna meminta slide, presentasi, ppt, pptx, powerpoint, bahan tayang, atau deck presentasi.*
   🚨 ATURAN MUTLAK PPTX: Jika pengguna meminta format PPTX/presentasi/slide, Anda WAJIB mengisi field \`createdSlides\` secara lengkap dengan array \`slides\` (minimal 4 hingga 8 slide).
   Isi field \`createdSlides\` dengan objek:
   - \`title\`: Judul utama topik presentasi (RINGKAS & PADAT, MAKSIMAL 8-10 KATA, DILARANG MENGULANG KATA BERKALI-KALI).
   - \`theme\`: \`"indigo"\` (umum/akademik), \`"emerald"\` (lingkungan/kesehatan), \`"dark"\` (teknologi/koding), \`"amber"\` (kreatif/sejarah), atau \`"slate"\` (formal).
   - \`fileName\`: Nama file rapi berakhiran \`.pptx\` (contoh: \`dampak_revolusi_industri.pptx\`).
   - \`subject\`: Mata pelajaran atau topik relevan.
   - \`slides\`: Array berisi 4 sampai 8 slide terstruktur:
     * Slide 1: Judul Utama & Sub-judul Pembuka.
     * Slide 2: Latar Belakang & Urgensi Topik.
     * Slide 3-N: Pembahasan Inti (buat 3-4 poin bullet informatif). PENTING: Setiap poin bullet WAJIB diawali dengan judul poin tebal (contoh: "**Judul Poin**: Penjelasan ringkas dan padat 8-20 kata...") agar otomatis tersusun menjadi kartu visual modern.
     * Slide Terakhir: Rangkuman Kunci & Kesimpulan / Call-to-Action (gunakan juga format "**Poin Kunci**: Ringkasan...").
     * \`notes\`: Catatan pemateri (*speaker notes*) berisi arahan narasi presenter saat membawakan slide tersebut.

3. 🎨 **GENERATOR GAMBAR & DIAGRAM VISUAL AI (\`createdImage\`)**:
   *Pemicu: Ketika pengguna meminta ilustrasi, gambar visual, gambarkan konsep, lukiskan, diagram, atau infografis.*
   🚨 ATURAN MUTLAK PROMPT GAMBAR: Field \`prompt\` WAJIB ditulis dalam bahasa Inggris yang SANGAT KAYA DETAIL, VISUAL, dan SPESIFIK (minimal 35-60 kata) untuk model generator FLUX.1.
   Sertakan struktur lengkap:
   - Subjek utama & anatomi/komponen ilmiah yang jelas dan akurat (misal: cross-section view with clearly visible internal structures).
   - Gaya visual premium: (pilih sesuai topik: 'crisp 3D scientific octane render' / 'hyper-realistic National Geographic photography' / 'futuristic isometric 3D render').
   - Pencahayaan & atmosfer: ('volumetric studio lighting, raytraced subsurface scattering, vivid natural color grading').
   - Ketajaman & render: ('8k UHD, ultra-sharp focus, masterpiece composition, clean educational aesthetic').
   DILARANG KERAS hanya menuliskan prompt pendek 2-5 kata!
   - \`prompt\`: Detailed descriptive English prompt (contoh: *"Detailed cross-section diagram of a green plant leaf illustrating the cellular process of photosynthesis, featuring a microscopic view of chloroplasts with thylakoid stacks, sunlight rays penetrating the epidermis, carbon dioxide absorption, crisp 3D scientific octane render, educational infographic style, bright natural volumetric lighting, vivid natural colors, accurate botanical anatomy, 8k UHD, ultra-sharp focus"*).
   - \`caption\`: Keterangan gambar ringkas dan informatif dalam bahasa Indonesia.
   - \`aspectRatio\`: \`"16:9"\` (default lanskap), \`"1:1"\` (persegi), atau \`"4:3"\` (diagram standar).

4. 📌 **CATATAN MATERI BARU (\`createdNote\`)**:
   *Pemicu: Ketika pengguna meminta "simpan ke catatan", "catatkan materi ini", atau "buat catatan rangkuman".*
   - \`title\`: HANYA judul topik catatan (maks 60 karakter tanpa awalan simbol/markdown).
   - \`content\`: Rangkuman materi Markdown terstruktur. Dilarang menulis \`### Tag:\` di dalam content.
   - \`subject\`: Mata kuliah / pelajaran asli.
   - \`tags\`: 1-3 kata kunci akademik relevan tanpa tagar.

5. 📋 **RENCANA TO-DO TUNGGAL TERPADU (\`createdTodo\`)**:
   *Pemicu: Ketika pengguna meminta "jadikan to-do", "buat jadwal belajar", atau "buat checklist tugas".*
   - Buat 1 rencana terpadu dengan 3-7 \`subtasks\` yang realistis dan dapat dieksekusi secara terurut.

*PENTING: Jangan membuat atau menyertakan field objek pembuatan (document/slides/image/note/todo) jika pengguna tidak memintanya secara eksplisit. Jawablah pesan biasa dengan percakapan yang cerdas, suportif, dan kaya wawasan.*`;

        const provider = aiConfig?.provider || process.env.AI_PROVIDER?.toLowerCase() || "gemini";
        let responseText = "";
        let groundingSources: { title: string; url: string }[] = [];
        let groundingQueries: string[] = [];
        let groundingAvailable = true;

        if (provider === "openai") {
            const baseUrl =
                aiConfig?.baseUrl ||
                process.env.OPENAI_BASE_URL ||
                "https://api.openai.com/v1";
            const apiKey = aiConfig?.apiKey || process.env.OPENAI_API_KEY || "";
            const model = aiConfig?.model || process.env.OPENAI_MODEL || "gpt-4o-mini";

            if (!apiKey) {
                return NextResponse.json(
                    {
                        error: "API Key OpenAI belum diisi. Silakan atur di menu Pengaturan Aplikasi.",
                    },
                    { status: 400 },
                );
            }

            const openAiMessages = [
                {
                    role: "system",
                    content:
                        systemInstruction +
                        '\n\nKEMBALIKAN OUTPUT HARUS HANYA DALAM BENTUK JSON OBJECT YANG VALID SESUAI SKEMA BERIKUT:\n{\n  "thoughtProcess": "Penalaran kritis, verifikasi keabsahan data/rumus, langkah kalkulasi step-by-step, dan evaluasi anti-halusinasi sebelum menulis jawaban",\n  "reply": "Jawaban Markdown",\n  "suggestedPrompts": ["Pertanyaan 1", "Pertanyaan 2"],\n  "createdNote": { "title": "Judul Singkat", "content": "Isi Markdown", "subject": "Nama Mata Kuliah", "tags": ["Label"] },\n  "createdTodo": { "title": "Judul Rencana", "description": "Deskripsi", "priority": "medium", "category": "Materi", "subtasks": [{ "title": "Langkah 1" }] },\n  "createdDocument": { "type": "docx" | "pdf", "title": "Judul Dokumen", "content": "Isi Markdown", "fileName": "dokumen.docx" },\n  "createdSlides": { "title": "Judul Presentasi", "theme": "indigo", "slides": [{ "title": "Slide 1", "bullets": ["Poin 1"], "notes": "Catatan" }], "fileName": "presentasi.pptx" },\n  "createdImage": { "prompt": "English detailed prompt", "caption": "Keterangan Indonesia", "aspectRatio": "16:9" }\n}',
                },
                ...messages.map((m: any) => {
                    if (m.attachments && Array.isArray(m.attachments) && m.attachments.length > 0) {
                        const contentParts: any[] = [{ type: "text", text: m.content || "Analisis lampiran ini:" }];
                        for (const att of m.attachments) {
                            if (att.dataUrl && att.dataUrl.startsWith("data:image")) {
                                contentParts.push({
                                    type: "image_url",
                                    image_url: { url: att.dataUrl },
                                });
                            } else if (att.extractedText) {
                                contentParts.push({
                                    type: "text",
                                    text: `\n\n[Dokumen Lampiran ${att.name}]:\n${att.extractedText}`,
                                });
                            }
                        }
                        return {
                            role: m.role === "assistant" ? "assistant" : "user",
                            content: contentParts,
                        };
                    }
                    return {
                        role: m.role === "assistant" ? "assistant" : "user",
                        content: m.content,
                    };
                }),
            ];

            const openAiRes = await fetch(`${baseUrl}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    temperature: 0.7,
                    response_format: { type: "json_object" },
                    messages: openAiMessages,
                }),
            });

            if (!openAiRes.ok) {
                const errText = await openAiRes.text();
                throw new Error(`OpenAI API Error (${openAiRes.status}): ${errText}`);
            }

            const data = await openAiRes.json();
            responseText = data.choices[0].message.content;
        } else {
            // Google Gemini Provider (Custom Key or Default Server Key)
            const apiKey =
                provider === "gemini_custom"
                    ? aiConfig?.apiKey
                    : process.env.GEMINI_API_KEY;

            if (!apiKey) {
                return NextResponse.json(
                    {
                        error:
                            provider === "gemini_custom"
                                ? "API Key Google Gemini belum diisi. Silakan masukkan API Key Anda di menu Pengaturan."
                                : "GEMINI_API_KEY environment variable belum diatur di server.",
                    },
                    { status: 400 },
                );
            }

            const modelName =
                (provider === "gemini_custom" && aiConfig?.model) ||
                process.env.NEXT_PUBLIC_GEMINI_MODEL ||
                "gemini-3.1-flash-lite";

            const ai = new GoogleGenAI({ apiKey });
            const contents = messages.map(
                (m: { role: string; content: string; attachments?: any[] }, idx: number) => {
                    let userText = m.content || "Tolong analisa lampiran ini:";
                    // If this is the latest user message and asks for document/file output:
                    if (m.role === "user" && idx === messages.length - 1) {
                        const lower = userText.toLowerCase();
                        const isDocRequest = lower.includes("pdf") || lower.includes("word") || lower.includes("docx") || lower.includes("xlsx") || lower.includes("excel") || lower.includes("spreadsheet") || lower.includes("makalah") || lower.includes("dokumen") || lower.includes("slide") || lower.includes("ppt");
                        if (isDocRequest) {
                            userText += `\n\n[INSTRUKSI WAJIB UNTUK AI: Pengguna meminta jawaban/laporan dalam format dokumen resmi${taskContext?.title ? ` untuk topik tugas: "${taskContext.title}" (${taskContext.courseName || "Umum"})` : ""}.
TUGAS ANDA:
1. Anda WAJIB MENGERJAKAN, MENGHITUNG/MENJELASKAN, DAN MENYELESAIKAN TUGAS INI SECARA SUBSTANTIF DARI AWAL HINGGA TUNTAS. Berikan naskah lengkap: landasan teori, rumus/prosedur teknis, langkah perhitungan step-by-step nyata, contoh data konkret, tabel analisis, dan kesimpulan menyeluruh.
2. TULISKAN SELURUH NASKAH JAWABAN/DOKUMEN LENGKAP INI (minimal 500 - 1500 kata) KE DALAM DUA TEMPAT:
   - Ke dalam field 'createdDocument.content' (agar file Word/PDF yang diunduh berisi seluruh naskah lengkap).
   - Ke dalam field 'reply' (tuliskan naskah jawaban lengkap ini dalam format Markdown agar bisa dibaca langsung oleh siswa di chat).
3. DILARANG KERAS hanya menuliskan satu kalimat pengantar atau mengulang deskripsi tugas!]`;
                        }
                    }
                    const parts: any[] = [{ text: userText }];
                    if (m.attachments && Array.isArray(m.attachments)) {
                        for (const att of m.attachments) {
                            if (att.dataUrl && att.dataUrl.startsWith("data:")) {
                                const commaIdx = att.dataUrl.indexOf(",");
                                const header = att.dataUrl.slice(0, commaIdx);
                                const base64Data = att.dataUrl.slice(commaIdx + 1);
                                const mimeType = header.split(";")[0].replace("data:", "") || "image/jpeg";
                                parts.push({
                                    inlineData: {
                                        mimeType,
                                        data: base64Data,
                                    },
                                });
                            } else if (att.extractedText) {
                                parts.push({
                                    text: `\n\n--- [Dokumen Lampiran: ${att.name}] ---\n${att.extractedText}`,
                                });
                            }
                        }
                    }
                    return {
                        role: m.role === "assistant" ? "model" : "user",
                        parts,
                    };
                },
            );

            // Build Gemini config with structured JSON output and low temperature for zero hallucination
            const generationConfig: any = {
                systemInstruction,
                temperature: 0.3,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        thoughtProcess: {
                            type: Type.STRING,
                            description:
                                "Proses berpikir kritis, verifikasi fakta/rumus sains matematika, perhitungan langkah-demi-langkah, dan evaluasi anti-halusinasi sebelum menuliskan jawaban utama (Chain of Thought). Tulis secara terstruktur, analitis, dan ringkas.",
                        },
                        reply: {
                            type: Type.STRING,
                            description:
                                "Jawaban utama dari chatbot dengan format Markdown.",
                        },
                        suggestedPrompts: {
                            type: Type.ARRAY,
                            description:
                                "2-3 pertanyaan tindak lanjut yang spesifik dan dinamis.",
                            items: { type: Type.STRING },
                        },
                        createdNote: {
                            type: Type.OBJECT,
                            description:
                                "Catatan materi baru jika pengguna meminta catatan. Field 'title' HANYA judul singkat (maks 60 karakter), seluruh isi penjelasan masuk ke 'content'.",
                            properties: {
                                title: { type: Type.STRING, description: "Judul singkat topik catatan (maks 60 karakter, HANYA judul)" },
                                content: { type: Type.STRING, description: "Isi lengkap catatan format Markdown terstruktur" },
                                subject: { type: Type.STRING, description: "Mata kuliah atau topik materi" },
                                tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tag materi" },
                            },
                        },
                        createdTodo: {
                            type: Type.OBJECT,
                            description:
                                "1 tugas To-Do utama terpadu yang memuat kumpulan sub-langkah (subtasks) jika pengguna meminta membuat to-do list.",
                            properties: {
                                title: { type: Type.STRING, description: "Judul utama rencana to-do" },
                                description: { type: Type.STRING, description: "Deskripsi to-do" },
                                priority: { type: Type.STRING, description: "Prioritas: high, medium, atau low" },
                                category: { type: Type.STRING, description: "Kategori tugas" },
                                subtasks: {
                                    type: Type.ARRAY,
                                    description: "Daftar sub-langkah / checklist aksi",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING, description: "Judul sub-langkah" },
                                        },
                                    },
                                },
                            },
                        },
                        createdDocument: {
                            type: Type.OBJECT,
                            description: "HANYA isi jika pengguna SECARA EKSPLISIT meminta dokumen/word/docx/pdf/excel/xlsx/spreadsheet. JANGAN isi jika pengguna hanya minta penjelasan biasa, slide, atau gambar.",
                            properties: {
                                type: { type: Type.STRING, description: "Format dokumen: docx, pdf, atau xlsx" },
                                title: { type: Type.STRING, description: "Judul dokumen atau lembar kerja" },
                                content: { type: Type.STRING, description: "Isi dokumen Markdown lengkap terstruktur. Untuk format xlsx sertakan tabel Markdown rapi dengan data relevan." },
                                fileName: { type: Type.STRING, description: "Nama file dengan ekstensi .docx, .pdf, atau .xlsx" },
                                description: { type: Type.STRING, description: "Keterangan singkat" },
                                subject: { type: Type.STRING, description: "Mata kuliah atau topik" },
                            },
                            required: ["type", "title", "content", "fileName"],
                        },
                        createdSlides: {
                            type: Type.OBJECT,
                            description: "HANYA isi jika pengguna SECARA EKSPLISIT meminta presentasi/slide/ppt/pptx/powerpoint/bahan tayang/deck. JANGAN isi jika pengguna minta dokumen word/pdf atau penjelasan biasa.",
                            properties: {
                                title: { type: Type.STRING, description: "Judul utama presentasi ringkas dan padat (maksimal 8-10 kata)" },
                                theme: { type: Type.STRING, description: "Tema warna: indigo, dark, emerald, amber, atau slate" },
                                fileName: { type: Type.STRING, description: "Nama file dengan ekstensi .pptx (contoh: presentasi_materi.pptx)" },
                                subject: { type: Type.STRING, description: "Mata kuliah atau topik" },
                                slides: {
                                    type: Type.ARRAY,
                                    description: "Daftar 4-8 slide materi terstruktur",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING, description: "Judul slide (maks 8 kata)" },
                                            bullets: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 poin bullet materi informatif" },
                                            notes: { type: Type.STRING, description: "Catatan narasi presenter" },
                                        },
                                        required: ["title", "bullets"],
                                    },
                                },
                            },
                            required: ["title", "slides", "fileName"],
                        },
                        createdImage: {
                            type: Type.OBJECT,
                            description: "HANYA isi jika pengguna SECARA EKSPLISIT meminta gambar/ilustrasi/diagram/generate image. JANGAN isi jika pengguna minta dokumen, slide, atau penjelasan biasa.",
                            properties: {
                                prompt: { type: Type.STRING, description: "Prompt bahasa Inggris sangat kaya visual, detail, dan deskriptif (minimal 15-30 kata) untuk FLUX image generator" },
                                caption: { type: Type.STRING, description: "Keterangan gambar dalam bahasa Indonesia" },
                                aspectRatio: { type: Type.STRING, description: "Rasio aspek: 16:9, 1:1, atau 4:3" },
                            },
                            required: ["prompt", "caption"],
                        },
                    },
                    required: ["reply", "suggestedPrompts"],
                },
            };

            if (wantStream) {
                const encoder = new TextEncoder();
                const stream = new ReadableStream({
                    async start(controller) {
                        try {
                            // Immediately signal analyzing stage
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({
                                    type: "status",
                                    stage: "analyzing",
                                    detail: "Menganalisis pertanyaan & konteks materi..."
                                })}\n\n`)
                            );

                            let responseStream: any;
                            if (enableGrounding) {
                                try {
                                    responseStream = await ai.models.generateContentStream({
                                        model: modelName,
                                        contents,
                                        config: {
                                            ...generationConfig,
                                            tools: [{ googleSearch: {} }],
                                        },
                                    });
                                } catch (groundingError: any) {
                                    console.warn("Grounding stream failed, retrying without grounding:", groundingError.message);
                                    // Notify client that grounding quota is exhausted or unavailable
                                    try {
                                        controller.enqueue(
                                            encoder.encode(`data: ${JSON.stringify({
                                                type: "grounding_status",
                                                available: false,
                                                reason: groundingError?.message?.includes("RESOURCE_EXHAUSTED") || groundingError?.status === 429
                                                    ? "quota_exhausted"
                                                    : groundingError?.message || "unavailable"
                                            })}\n\n`)
                                        );
                                    } catch {}
                                    responseStream = await ai.models.generateContentStream({
                                        model: modelName,
                                        contents,
                                        config: generationConfig,
                                    });
                                }
                            } else {
                                responseStream = await ai.models.generateContentStream({
                                    model: modelName,
                                    contents,
                                    config: generationConfig,
                                });
                            }

                            let fullResponseText = "";
                            const extractor = new StreamingJsonExtractor();
                            const collectedGroundingSources: any[] = [];
                            const collectedGroundingQueries: any[] = [];
                            let hasEmittedThinkingStatus = false;
                            let hasEmittedAnsweringStatus = false;

                            for await (const chunk of responseStream) {
                                const chunkText = chunk.text || "";
                                fullResponseText += chunkText;

                                try {
                                    const metadata = chunk.candidates?.[0]?.groundingMetadata;
                                    if (metadata) {
                                        if (metadata.webSearchQueries && Array.isArray(metadata.webSearchQueries) && collectedGroundingQueries.length === 0) {
                                            const queries = metadata.webSearchQueries.filter(Boolean).slice(0, 3);
                                            if (queries.length > 0) {
                                                collectedGroundingQueries.push(...queries);
                                                controller.enqueue(
                                                    encoder.encode(`data: ${JSON.stringify({
                                                        type: "status",
                                                        stage: "searching",
                                                        detail: "Mencari referensi & fakta terkini di web...",
                                                        queries
                                                    })}\n\n`)
                                                );
                                            }
                                        }
                                        if (metadata.groundingChunks && Array.isArray(metadata.groundingChunks) && collectedGroundingSources.length === 0) {
                                            const sources = metadata.groundingChunks
                                                .filter((c: any) => c?.web?.uri && c?.web?.title)
                                                .map((c: any) => ({
                                                    title: c.web.title,
                                                    url: c.web.uri,
                                                }))
                                                .slice(0, 5);
                                            if (sources.length > 0) {
                                                collectedGroundingSources.push(...sources);
                                                controller.enqueue(
                                                    encoder.encode(`data: ${JSON.stringify({
                                                        type: "status",
                                                        stage: "analyzing",
                                                        detail: `Mengevaluasi ${sources.length} sumber rujukan terverifikasi...`
                                                    })}\n\n`)
                                                );
                                                controller.enqueue(
                                                    encoder.encode(`data: ${JSON.stringify({ type: "grounding", sources })}\n\n`)
                                                );
                                            }
                                        }
                                    }
                                } catch {}

                                const events = extractor.processChunk(chunkText);
                                for (const ev of events) {
                                    if (ev.type === "thought" && ev.delta) {
                                        if (!hasEmittedThinkingStatus) {
                                            hasEmittedThinkingStatus = true;
                                            controller.enqueue(
                                                encoder.encode(`data: ${JSON.stringify({
                                                    type: "status",
                                                    stage: "thinking",
                                                    detail: "Memverifikasi data, menghitung, & merumuskan analisis..."
                                                })}\n\n`)
                                            );
                                        }
                                        controller.enqueue(
                                            encoder.encode(`data: ${JSON.stringify({ type: "thought", delta: ev.delta })}\n\n`)
                                        );
                                    } else if (ev.type === "chunk" && ev.delta) {
                                        if (!hasEmittedAnsweringStatus) {
                                            hasEmittedAnsweringStatus = true;
                                            controller.enqueue(
                                                encoder.encode(`data: ${JSON.stringify({
                                                    type: "status",
                                                    stage: "answering",
                                                    detail: "Menyusun jawaban terstruktur..."
                                                })}\n\n`)
                                            );
                                        }
                                        controller.enqueue(
                                            encoder.encode(`data: ${JSON.stringify({ type: "chunk", delta: ev.delta })}\n\n`)
                                        );
                                    }
                                }
                            }

                            const finalResult = processAiChatResponse(
                                fullResponseText,
                                messages,
                                taskContext,
                                collectedGroundingSources,
                                collectedGroundingQueries
                            );

                            if (!finalResult.thoughtProcess && extractor.thoughtText) {
                                finalResult.thoughtProcess = cleanLatexMath(extractor.thoughtText.trim());
                            }

                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ type: "done", ...finalResult })}\n\n`)
                            );
                            controller.close();
                        } catch (streamErr: any) {
                            console.error("Stream generation error:", streamErr);
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ type: "error", error: streamErr.message || "Gagal memproses streaming AI." })}\n\n`)
                            );
                            controller.close();
                        }
                    },
                });

                return new Response(stream, {
                    headers: {
                        "Content-Type": "text/event-stream; charset=utf-8",
                        "Cache-Control": "no-cache, no-transform",
                        "Connection": "keep-alive",
                        "X-Accel-Buffering": "no",
                    },
                });
            }

            // Try with Google Search grounding first, fall back to without if model doesn't support it
            let response: any;
            groundingAvailable = true;

            if (enableGrounding) {
                try {
                    response = await ai.models.generateContent({
                        model: modelName,
                        contents,
                        config: {
                            ...generationConfig,
                            tools: [{ googleSearch: {} }],
                        },
                    });
                } catch (groundingError: any) {
                    console.warn("Grounding with schema failed, retrying without grounding:", groundingError.message);
                    groundingAvailable = false;
                    response = await ai.models.generateContent({
                        model: modelName,
                        contents,
                        config: generationConfig,
                    });
                }
            } else {
                response = await ai.models.generateContent({
                    model: modelName,
                    contents,
                    config: generationConfig,
                });
            }

            // Extract grounding metadata (search sources & queries) if available
            try {
                const candidate = response?.candidates?.[0];
                const metadata = candidate?.groundingMetadata;
                if (metadata) {
                    if (metadata.groundingChunks && Array.isArray(metadata.groundingChunks)) {
                        groundingSources = metadata.groundingChunks
                            .map((c: any) => ({
                                title: c.web?.title || "Sumber Web",
                                url: c.web?.uri || "",
                            }))
                            .filter((s: any) => s.url);
                    }
                    if (metadata.webSearchQueries && Array.isArray(metadata.webSearchQueries)) {
                        groundingQueries = metadata.webSearchQueries.slice(0, 3);
                    }
                }
            } catch (e) {
                // Grounding metadata extraction is best-effort
            }

            responseText = response?.text || "";
        }

        const finalResult = processAiChatResponse(
            responseText,
            messages,
            taskContext,
            groundingSources,
            groundingQueries
        );

        return NextResponse.json({ ...finalResult, groundingAvailable });
    } catch (error: any) {
        console.error("Error in AI Chat:", error);
        return NextResponse.json(
            {
                error: error.message || "Terjadi kesalahan pada chatbot AI.",
            },
            { status: 500 },
        );
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("check") === "grounding") {
        try {
            const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
            if (!apiKey) {
                return NextResponse.json({ available: false, reason: "no_api_key" });
            }
            const ai = new GoogleGenAI({ apiKey });
            // Quick 1-token test with search to verify quota without latency
            await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: "test",
                config: {
                    maxOutputTokens: 1,
                    tools: [{ googleSearch: {} }],
                },
            });
            return NextResponse.json({ available: true });
        } catch (err: any) {
            return NextResponse.json({
                available: false,
                reason: err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429
                    ? "quota_exhausted"
                    : err?.message || "unavailable"
            });
        }
    }
    return NextResponse.json({ status: "ok" });
}
