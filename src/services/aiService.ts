import {
    AIAnalysisResult,
    ChatMessage,
    TodoTask,
    UserPreferences,
} from "../types";
import { ClassroomService } from "./classroomService";

export async function readDriveFileContent(
    token: string,
    fileId: string,
): Promise<string | null> {
    try {
        const res = await fetch("/api/drive/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, fileId }),
        });
        if (res.ok) {
            const data = await res.json();
            return data.content || null;
        }
        return null;
    } catch (e) {
        console.error("Failed to read drive file via backend", e);
        return null;
    }
}

export function getGeminiModel() {
    return process.env.NEXT_PUBLIC_GEMINI_MODEL;
}

export async function analyzeTaskWithAI(
    task: Partial<TodoTask>,
    userPreferences?: UserPreferences | null,
): Promise<AIAnalysisResult> {
    const response = await fetch("/api/ai/analyze-task", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: task.title,
            description: task.description,
            courseName: task.courseName,
            materials: task.materials,
            userPreferences,
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
    messages: { role: "user" | "assistant"; content: string }[],
    taskContext?: Partial<TodoTask>,
    userPreferences?: UserPreferences | null,
): Promise<{ reply: string; timestamp: number; suggestedPrompts?: string[] }> {
    let extractedMaterialText = "";
    // Try to load drive contents if there are materials
    if (taskContext?.materials && Array.isArray(taskContext.materials)) {
        const token = ClassroomService.getStoredToken();
        if (token) {
            // Only process the first 2 drive files to avoid huge payloads
            let driveCount = 0;
            for (const m of taskContext.materials) {
                if (m.driveFile?.driveFile?.id && driveCount < 2) {
                    const text = await readDriveFileContent(
                        token,
                        m.driveFile.driveFile.id,
                    );
                    if (text) {
                        extractedMaterialText +=
                            `\n\n[Isi Dokumen Lampiran "${m.driveFile.driveFile.title}"]:\n` +
                            text.substring(0, 5000); // limit to 5000 chars per doc
                        driveCount++;
                    }
                }
            }
        }
    }

    const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messages,
            userPreferences,
            taskContext: taskContext
                ? {
                      title: taskContext.title,
                      courseName: taskContext.courseName,
                      description:
                          (taskContext.description || "") +
                          (extractedMaterialText
                              ? `\n\n--- LAMPIRAN DOKUMEN ---\n${extractedMaterialText}`
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
