import {
    AIAnalysisResult,
    AIConfig,
    ChatAttachment,
    ChatMessage,
    CreatedDocument,
    CreatedImage,
    CreatedSlides,
    TodoTask,
    UserPreferences,
} from "../types";
import { ClassroomService } from "./classroomService";
import { isGoogleWorkspaceUrl, parseGoogleWorkspaceUrl } from "../lib/workspaceUtils";

export async function readDriveFileContent(
    token: string | null,
    fileId?: string | null,
    url?: string | null
): Promise<string | null> {
    try {
        const res = await fetch("/api/drive/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, fileId, url }),
        });
        if (res.ok) {
            const data = await res.json();
            return data.content || null;
        }
        return null;
    } catch (e) {
        console.error("Failed to read drive/URL file via backend", e);
        return null;
    }
}

export function extractDriveFileId(urlStr?: string): string | null {
    if (!urlStr) return null;
    const match = urlStr.match(/\/(?:d|file\/d|document\/d|spreadsheets\/d|presentation\/d)\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];
    try {
        const parsed = new URL(urlStr);
        return parsed.searchParams.get("id");
    } catch {
        return null;
    }
}

async function extractMaterialsText(materials?: any[]): Promise<string> {
    if (!materials || !Array.isArray(materials)) return "";
    const token = ClassroomService.getStoredToken();

    let extracted = "";
    let processed = 0;
    for (const m of materials) {
        if (processed >= 3) break;
        let fileId: string | null = m.driveFile?.driveFile?.id || null;
        let url: string | null = m.link?.url || null;
        let title: string = m.driveFile?.driveFile?.title || m.link?.title || "Dokumen Lampiran";

        if (!fileId && url) {
            fileId = extractDriveFileId(url);
        }

        if (fileId || url) {
            const text = await readDriveFileContent(token, fileId, url);
            if (text) {
                extracted += `\n\n[Isi Lampiran: "${title}"]:\n` + text.substring(0, 6000);
                processed++;
            }
        }
    }
    return extracted;
}

export function getGeminiModel() {
    return process.env.NEXT_PUBLIC_GEMINI_MODEL;
}

export async function analyzeTaskWithAI(
    task: Partial<TodoTask>,
    userPreferences?: UserPreferences | null,
    aiConfig?: AIConfig | null,
): Promise<AIAnalysisResult> {
    const extractedMaterialText = await extractMaterialsText(task.materials);
    const enrichedDescription = (task.description || "") + (extractedMaterialText ? `\n\n--- LAMPIRAN DOKUMEN & SPREADSHEET ---\n${extractedMaterialText}` : "");

    const response = await fetch("/api/ai/analyze-task", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: task.title,
            description: enrichedDescription,
            courseName: task.courseName,
            materials: task.materials,
            userPreferences,
            aiConfig,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.error || `Failed to analyze task (${response.status})`,
        );
    }

    return response.json();
}

export async function sendChatMessageToAI(
    messages: {
        role: "user" | "assistant";
        content: string;
        attachments?: ChatAttachment[];
    }[],
    taskContext?: Partial<TodoTask>,
    userPreferences?: UserPreferences | null,
    aiConfig?: AIConfig | null,
    studyMode?: "socratic" | "direct" | "quizzer",
): Promise<{
    reply: string;
    timestamp: number;
    suggestedPrompts?: string[];
    createdNote?: {
        title: string;
        content: string;
        subject?: string;
        tags?: string[];
    };
    createdTodo?: {
        title: string;
        description?: string;
        priority?: "high" | "medium" | "low";
        category?: string;
        subtasks?: {
            title: string;
        }[];
    };
    createdTodos?: {
        title: string;
        description?: string;
        priority?: "high" | "medium" | "low";
        category?: string;
        subtasks?: {
            title: string;
        }[];
    }[];
    createdDocument?: CreatedDocument;
    createdSlides?: CreatedSlides;
    createdImage?: CreatedImage;
    groundingSources?: { title: string; url: string }[];
    groundingQueries?: string[];
}> {
    const extractedMaterialText = await extractMaterialsText(taskContext?.materials);

    // Check if user's chat message contains URLs (e.g. Google Docs, Sheets, Slides, Drive, or Web links)
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    let extractedMessageLinkText = "";
    if (lastUserMessage?.content) {
        const urlMatches = lastUserMessage.content.match(/(https?:\/\/[^\s<>"'{}|\\^`]+)/gi);
        if (urlMatches && urlMatches.length > 0) {
            const token = ClassroomService.getStoredToken();
            const uniqueUrls = Array.from(new Set(urlMatches)).slice(0, 3);
            for (const urlStr of uniqueUrls) {
                const parsedWorkspace = parseGoogleWorkspaceUrl(urlStr);
                const fileId = parsedWorkspace?.fileId || extractDriveFileId(urlStr);
                const text = await readDriveFileContent(token, fileId, urlStr);
                if (text && text.trim()) {
                    const typeLabel = parsedWorkspace
                        ? `Google ${parsedWorkspace.type.charAt(0).toUpperCase() + parsedWorkspace.type.slice(1)}`
                        : "Dokumen Link";
                    extractedMessageLinkText += `\n\n[Isi ${typeLabel} dari ${urlStr}]:\n${text.substring(0, 10000)}`;
                }
            }
        }
    }

    const processedMessages = messages.map((m, idx) => {
        if (idx === messages.length - 1 && m.role === "user" && extractedMessageLinkText) {
            return {
                ...m,
                content: m.content + extractedMessageLinkText,
            };
        }
        return m;
    });

    const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messages: processedMessages,
            userPreferences,
            aiConfig,
            studyMode,
            taskContext: taskContext
                ? {
                      title: taskContext.title,
                      courseName: taskContext.courseName,
                      description:
                          (taskContext.description || "") +
                          (extractedMaterialText
                              ? `\n\n--- LAMPIRAN DOKUMEN & SPREADSHEET ---\n${extractedMaterialText}`
                              : ""),
                      dueDateStr: taskContext.dueDateStr,
                      customNotes: taskContext.customNotes,
                  }
                : undefined,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.error ||
                `Failed to get reply from AI (${response.status})`,
        );
    }

    return response.json();
}
