"use client";
// Shared localStorage & Firebase persistence helpers. Every page re-reads storage on mount,
// so mutations made here are picked up after client-side navigation.
import { ClassroomService } from "../services/classroomService";
import { DBService } from "../services/dbService";
import {
  TodoTask,
  UserPreferences,
  AIConfig,
  PersonalTodo,
  StudyNote,
  DEFAULT_DATE_RANGE_MONTHS,
} from "../types";

export const TASKS_STORAGE_KEY = "classroom_ai_todo_tasks_v1";
export const TODOS_STORAGE_KEY = "classroom_ai_personal_todos_v1";
export const NOTES_STORAGE_KEY = "classroom_ai_study_notes_v1";
export const PREFS_STORAGE_KEY = "classroom_ai_user_prefs_v1";
export const AI_CONFIG_STORAGE_KEY = "classroom_ai_config_v1";
export const ONBOARDING_DONE_KEY = "ionlearn_onboarding_v2_done";
export const FEATURE_TOUR_DONE_KEY = "ionlearn_feature_tour_done_v1";

export const DEMO_EMAIL = "pelajar@contoh.com";

function getStorageKey(baseKey: string, userEmail?: string): string {
  const profile = ClassroomService.getUserProfile();
  const email = userEmail || profile?.email;
  return email ? `${baseKey}_${email}` : baseKey;
}

export function isOnboardingCompleted(userEmail?: string): boolean {
  if (typeof window === "undefined") return false;
  const profile = ClassroomService.getUserProfile();
  const email = userEmail || profile?.email;
  
  if (email) {
    const userKey = `${ONBOARDING_DONE_KEY}_${email}`;
    const userStatus = localStorage.getItem(userKey);
    if (userStatus === "true") return true;
    if (userStatus === "false") return false;

    // Check if THIS specific account has educationLevel & learningStyle & aiTone in saved preferences
    const accountPrefsKey = `${PREFS_STORAGE_KEY}_${email}`;
    const savedPrefs = localStorage.getItem(accountPrefsKey);
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        if (parsed?.educationLevel && parsed?.learningStyle && parsed?.aiTone) {
          localStorage.setItem(userKey, "true");
          return true;
        }
      } catch {}
    }
    return false;
  }

  // If no email yet, do not assume completed
  return false;
}

export function isFeatureTourCompleted(userEmail?: string): boolean {
  if (typeof window === "undefined") return false;
  const profile = ClassroomService.getUserProfile();
  const email = userEmail || profile?.email;
  if (email) {
    return localStorage.getItem(`${FEATURE_TOUR_DONE_KEY}_${email}`) === "true";
  }
  return localStorage.getItem(FEATURE_TOUR_DONE_KEY) === "true";
}

export function setFeatureTourCompleted(completed: boolean = true, userEmail?: string): void {
  if (typeof window === "undefined") return;
  const profile = ClassroomService.getUserProfile();
  const email = userEmail || profile?.email;
  const val = completed ? "true" : "false";

  if (email) {
    localStorage.setItem(`${FEATURE_TOUR_DONE_KEY}_${email}`, val);
  }
  localStorage.setItem(FEATURE_TOUR_DONE_KEY, val);
}

export function setOnboardingCompleted(completed: boolean = true, userEmail?: string): void {
  if (typeof window === "undefined") return;
  const profile = ClassroomService.getUserProfile();
  const email = userEmail || profile?.email;
  const val = completed ? "true" : "false";

  if (email) {
    localStorage.setItem(`${ONBOARDING_DONE_KEY}_${email}`, val);
  }
}

// -------------------------------------------------------------
// CLOUD SYNC TRIGGER (Firebase & Server Cache)
// -------------------------------------------------------------
export function syncAllUserDataToCloud(): void {
  if (typeof window === "undefined") return;
  const profile = ClassroomService.getUserProfile();
  if (profile?.email) {
    const tasks = loadTasks();
    const prefs = loadPreferences();
    const aiConfig = loadAIConfig();
    const todos = loadTodos();
    const notes = loadNotes();
    DBService.saveUserData(tasks, prefs, aiConfig, profile.email, todos, notes).catch(() => {});
  }
}

// -------------------------------------------------------------
// CLASSROOM TASKS STORE
// -------------------------------------------------------------
export function loadTasks(): TodoTask[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(getStorageKey(TASKS_STORAGE_KEY));
  if (!saved) return [];
  try {
    const parsed: TodoTask[] = JSON.parse(saved);
    const profile = ClassroomService.getUserProfile();
    if (profile?.email) {
      if (profile.email === DEMO_EMAIL) return parsed;
      return parsed.filter(
        (t) =>
          (!t.userEmail || t.userEmail === profile.email) &&
          !t.id.startsWith("seed-")
      );
    }
    return parsed;
  } catch {
    return [];
  }
}

export function persist(tasks: TodoTask[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(TASKS_STORAGE_KEY), JSON.stringify(tasks));
  syncAllUserDataToCloud();
  window.dispatchEvent(new Event("taskStoreChange"));
}

export function addTask(task: TodoTask): void {
  const tasks = loadTasks();
  tasks.unshift(task);
  persist(tasks);
}

export function updateTask(taskId: string, patch: Partial<TodoTask>): void {
  const tasks = loadTasks().map((t) =>
    t.id === taskId
      ? { ...t, ...patch, updatedAt: new Date().toISOString() }
      : t
  );
  persist(tasks);
}

export function deleteTask(taskId: string): void {
  persist(loadTasks().filter((t) => t.id !== taskId));
}

export function toggleTaskComplete(
  taskId: string
): { title?: string; nowCompleted: boolean } {
  const target = loadTasks().find((t) => t.id === taskId);
  if (!target) return { nowCompleted: false };
  const nowCompleted = !target.isCompleted;
  updateTask(taskId, {
    isCompleted: nowCompleted,
    completedAt: nowCompleted ? new Date().toISOString() : undefined,
  });
  return { title: target.title, nowCompleted };
}

// -------------------------------------------------------------
// PERSONAL TODOS STORE
// -------------------------------------------------------------
export function loadTodos(): PersonalTodo[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(getStorageKey(TODOS_STORAGE_KEY));
  if (!saved) return [];
  try {
    return JSON.parse(saved) as PersonalTodo[];
  } catch {
    return [];
  }
}

export function persistTodos(todos: PersonalTodo[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(TODOS_STORAGE_KEY), JSON.stringify(todos));
  syncAllUserDataToCloud();
  window.dispatchEvent(new Event("taskStoreChange"));
}

export function addTodo(todo: PersonalTodo): void {
  const todos = loadTodos();
  todos.unshift(todo);
  persistTodos(todos);
}

export function updateTodo(todoId: string, patch: Partial<PersonalTodo>): void {
  const todos = loadTodos().map((t) =>
    t.id === todoId
      ? { ...t, ...patch, updatedAt: new Date().toISOString() }
      : t
  );
  persistTodos(todos);
}

export function deleteTodo(todoId: string): void {
  persistTodos(loadTodos().filter((t) => t.id !== todoId));
}

export function toggleTodoComplete(
  todoId: string
): { title?: string; nowCompleted: boolean } {
  const target = loadTodos().find((t) => t.id === todoId);
  if (!target) return { nowCompleted: false };
  const nowCompleted = !target.isCompleted;
  updateTodo(todoId, {
    isCompleted: nowCompleted,
    completedAt: nowCompleted ? new Date().toISOString() : undefined,
  });
  return { title: target.title, nowCompleted };
}

// -------------------------------------------------------------
// STUDY NOTES STORE
// -------------------------------------------------------------
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

export function cleanAndNormalizeTags(rawTags: (string | undefined | null)[]): string[] {
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

  return result.slice(0, 4);
}

export function sanitizeAndRepairNote(note: Partial<StudyNote>): StudyNote {
  let title = (note.title || "").trim();
  let content = (note.content || "").trim();
  let subject = (note.subject || "").trim();
  const rawTags: string[] = Array.isArray(note.tags) ? [...note.tags] : [];

  // Case 1: content is empty or title contains the full markdown text / is excessively long
  if (!content && title) {
    content = title;

    const firstLine = title.split("\n")[0].trim();
    let cleanTitle = firstLine;
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

    title = cleanTitle || "Catatan Materi AI";
  } else if (title.length > 80 || /[#*`~_]/.test(title)) {
    const firstLine = title.split("\n")[0].trim();
    let cleanTitle = firstLine.replace(/^[#\s*>-]+/, "").replace(/[*_`~]/g, "").replace(/["'{}]/g, "").trim();
    const delimMatch = cleanTitle.match(/^(.*?)(?:\s+[-–—]\s+|\.\s+###|\s*###|:\s+)/);
    if (delimMatch && delimMatch[1] && delimMatch[1].trim().length >= 4) {
      cleanTitle = delimMatch[1].trim();
    } else if (cleanTitle.length > 70) {
      cleanTitle = cleanTitle.slice(0, 70).trim();
    }
    title = cleanTitle || "Catatan Materi AI";
  }

  // Extract any trailing embedded tag line from markdown content (e.g. "### Tag: #Fisika #Mekanika #Rotasi")
  const trailingTagLineMatch = content.match(/(?:^|\n)\s*(?:###?\s*)?(?:Tag|Tags|Label|Labels|Hashtags)\s*:\s*([^\n]+)$/i);
  if (trailingTagLineMatch && trailingTagLineMatch[1]) {
    const lineTags = trailingTagLineMatch[1].match(/#?([a-zA-Z0-9_-]+)/g);
    if (lineTags) {
      lineTags.forEach((t) => {
        const clean = t.replace(/^#/, "").trim();
        if (clean) rawTags.push(clean);
      });
    }
  }

  // Strip trailing tag lines and trailing hashtags block from content so they don't duplicate
  content = content
    .replace(/(?:\r?\n)+\s*(?:###?\s*)?(?:Tag|Tags|Label|Labels|Hashtags)\s*:\s*[^\n]+$/i, "")
    .replace(/(?:\r?\n)+\s*(?:#[a-zA-Z0-9_-]+\s*){1,10}$/i, "")
    .trim();

  // Normalize tags
  let cleanedTags = cleanAndNormalizeTags(rawTags);

  // Subject inference & cleanup
  if (!subject || subject === "Belajar AI" || subject === "Catatan AI" || subject === "Umum") {
    // Check if any tag is a known academic subject
    const subjectFromTag = cleanedTags.find((t) =>
      KNOWN_SUBJECTS.some((ks) => ks.toLowerCase() === t.toLowerCase())
    );
    if (subjectFromTag) {
      subject = subjectFromTag;
      // Remove it from tags to avoid duplicate
      cleanedTags = cleanedTags.filter((t) => t.toLowerCase() !== subjectFromTag.toLowerCase());
    } else {
      // Check if title mentions a known subject
      const subjectFromTitle = KNOWN_SUBJECTS.find((ks) =>
        new RegExp(`\\b${ks}\\b`, "i").test(title)
      );
      if (subjectFromTitle) {
        subject = subjectFromTitle;
      } else {
        subject = "Catatan Materi";
      }
    }
  }

  // Remove subject from tags if already present
  if (subject) {
    cleanedTags = cleanedTags.filter((t) => t.toLowerCase() !== subject.toLowerCase());
  }

  return {
    id: note.id || `note-${Date.now()}`,
    title: title || "Catatan Materi Baru",
    content: content || title,
    subject: subject || "Catatan Materi",
    tags: cleanedTags,
    summary: note.summary,
    aiQuiz: note.aiQuiz,
    createdAt: note.createdAt || new Date().toISOString(),
    updatedAt: note.updatedAt || new Date().toISOString(),
    userEmail: note.userEmail,
  };
}

export function loadNotes(): StudyNote[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(getStorageKey(NOTES_STORAGE_KEY));
  if (!saved) return [];
  try {
    const rawList = JSON.parse(saved) as StudyNote[];
    if (!Array.isArray(rawList)) return [];
    let needsResave = false;
    const repaired = rawList.map((n) => {
      // Auto-repair if note has missing/empty content, damaged long title, or unwanted system tags / trailing tag in content
      const hasSystemTags = n.tags?.some((t) => IGNORED_TAG_WORDS.has(t.toLowerCase()) || t.startsWith("#"));
      const hasTrailingTagInContent = n.content && /(?:^|\n)\s*(?:###?\s*)?(?:Tag|Tags|Label)\s*:/i.test(n.content);
      const isCorrupted = !n.content || n.content.trim() === "" || (n.title && n.title.length > 80 && /[#*`~_]/.test(n.title));
      
      if (isCorrupted || hasSystemTags || hasTrailingTagInContent) {
        needsResave = true;
        return sanitizeAndRepairNote(n);
      }
      return n;
    });
    if (needsResave) {
      localStorage.setItem(getStorageKey(NOTES_STORAGE_KEY), JSON.stringify(repaired));
    }
    return repaired;
  } catch {
    return [];
  }
}

export function persistNotes(notes: StudyNote[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(NOTES_STORAGE_KEY), JSON.stringify(notes));
  syncAllUserDataToCloud();
  window.dispatchEvent(new Event("taskStoreChange"));
}

export function addNote(note: StudyNote): void {
  const notes = loadNotes();
  const sanitized = sanitizeAndRepairNote(note);
  notes.unshift(sanitized);
  persistNotes(notes);
}

export function updateNote(noteId: string, patch: Partial<StudyNote>): void {
  const notes = loadNotes().map((n) =>
    n.id === noteId
      ? { ...n, ...patch, updatedAt: new Date().toISOString() }
      : n
  );
  persistNotes(notes);
}

export function deleteNote(noteId: string): void {
  persistNotes(loadNotes().filter((n) => n.id !== noteId));
}

// -------------------------------------------------------------
// PREFERENCES & AI CONFIG
// -------------------------------------------------------------
export function loadPreferences(userEmail?: string): UserPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const profile = ClassroomService.getUserProfile();
    const email = userEmail || profile?.email;
    const key = email ? `${PREFS_STORAGE_KEY}_${email}` : PREFS_STORAGE_KEY;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        classroomDateRangeMonths:
          parsed.classroomDateRangeMonths ?? DEFAULT_DATE_RANGE_MONTHS,
        toastPosition: parsed.toastPosition ?? "top-right",
        taskModalStyle: parsed.taskModalStyle ?? "drawer",
        chatLayout: parsed.chatLayout ?? "sidebar",
      };
    }
  } catch {}
  return null;
}

export function savePreferences(prefs: UserPreferences, userEmail?: string): void {
  if (typeof window === "undefined") return;
  const profile = ClassroomService.getUserProfile();
  const email = userEmail || profile?.email;
  if (email) {
    localStorage.setItem(`${PREFS_STORAGE_KEY}_${email}`, JSON.stringify(prefs));
  } else {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  }
  syncAllUserDataToCloud();
  window.dispatchEvent(new Event("taskStoreChange"));
  window.dispatchEvent(new Event("task-modal-style-changed"));
  window.dispatchEvent(new Event("chat-layout-changed"));
}

export function loadAIConfig(): AIConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as AIConfig) : null;
  } catch {
    return null;
  }
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(config));
  syncAllUserDataToCloud();
}

// -------------------------------------------------------------
// ACCOUNT DELETION & FULL LOCAL WIPE
// -------------------------------------------------------------
export function clearAllUserLocalData(userEmail?: string): void {
  if (typeof window === "undefined") return;
  const profile = ClassroomService.getUserProfile();
  const email = userEmail || profile?.email;

  if (email) {
    localStorage.removeItem(`${TASKS_STORAGE_KEY}_${email}`);
    localStorage.removeItem(`${TODOS_STORAGE_KEY}_${email}`);
    localStorage.removeItem(`${NOTES_STORAGE_KEY}_${email}`);
    localStorage.removeItem(`${PREFS_STORAGE_KEY}_${email}`);
    localStorage.removeItem(`${ONBOARDING_DONE_KEY}_${email}`);
    localStorage.removeItem(`${FEATURE_TOUR_DONE_KEY}_${email}`);
    localStorage.removeItem(`onboarding_draft_${email}`);
  }

  // Clear global/fallback keys
  localStorage.removeItem(TASKS_STORAGE_KEY);
  localStorage.removeItem(TODOS_STORAGE_KEY);
  localStorage.removeItem(NOTES_STORAGE_KEY);
  localStorage.removeItem(PREFS_STORAGE_KEY);
  localStorage.removeItem(ONBOARDING_DONE_KEY);
  localStorage.removeItem(FEATURE_TOUR_DONE_KEY);
  localStorage.removeItem("onboarding_draft");
  localStorage.removeItem("classroom_user_profile");
  localStorage.removeItem("last_classroom_sync");
  localStorage.removeItem("classroom_ai_token");
  localStorage.removeItem("classroom_ai_token_expiry");

  ClassroomService.logout().catch(() => {});
  window.dispatchEvent(new Event("taskStoreChange"));
}