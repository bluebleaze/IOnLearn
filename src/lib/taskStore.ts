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
export const ONBOARDING_DONE_KEY = "classroom_ai_onboarding_done_v1";

export const DEMO_EMAIL = "pelajar@contoh.com";

function getStorageKey(baseKey: string): string {
  const profile = ClassroomService.getUserProfile();
  return profile?.email ? `${baseKey}_${profile.email}` : baseKey;
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
export function loadNotes(): StudyNote[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(getStorageKey(NOTES_STORAGE_KEY));
  if (!saved) return [];
  try {
    return JSON.parse(saved) as StudyNote[];
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
  notes.unshift(note);
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
export function loadPreferences(): UserPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(PREFS_STORAGE_KEY);
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

export function savePreferences(prefs: UserPreferences): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
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