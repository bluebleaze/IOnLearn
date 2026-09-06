import { doc, setDoc, getDoc } from 'firebase/firestore';
import { TodoTask, UserPreferences, AIConfig, PersonalTodo, StudyNote } from '../types';
import { auth, db } from '@/lib/firebase';

export interface FullUserData {
  tasks: TodoTask[];
  preferences: UserPreferences | null;
  aiConfig: AIConfig | null;
  todos: PersonalTodo[];
  notes: StudyNote[];
  updatedAt?: string;
}

export class DBService {
  private static async getUserId(): Promise<string | null> {
    if (auth.currentUser?.uid) return auth.currentUser.uid;
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 2000);
      const unsubscribe = auth.onAuthStateChanged((user) => {
        clearTimeout(timeout);
        unsubscribe();
        resolve(user?.uid || null);
      });
    });
  }

  static async saveUserData(
    tasks: TodoTask[],
    preferences: UserPreferences | null,
    aiConfig: AIConfig | null,
    userEmail?: string,
    todos?: PersonalTodo[],
    notes?: StudyNote[]
  ): Promise<void> {
    const cleanTasks = JSON.parse(JSON.stringify(tasks || []));
    const cleanPrefs = preferences ? JSON.parse(JSON.stringify(preferences)) : null;
    const cleanConfig = aiConfig ? JSON.parse(JSON.stringify(aiConfig)) : null;
    const cleanTodos = JSON.parse(JSON.stringify(todos || []));
    const cleanNotes = JSON.parse(JSON.stringify(notes || []));

    // 1. Primary: Save to shared server API cache per account (instant sync across all browsers/devices)
    if (userEmail) {
      try {
        await fetch('/api/user-cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            tasks: cleanTasks,
            preferences: cleanPrefs,
            aiConfig: cleanConfig,
            todos: cleanTodos,
            notes: cleanNotes,
          }),
        });
      } catch (e) {
        console.warn('Could not save to /api/user-cache:', e);
      }
    }

    // 2. Secondary: Firestore Cloud if configured and enabled
    const uid = await this.getUserId();
    if (uid) {
      try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
          tasks: cleanTasks,
          preferences: cleanPrefs,
          aiConfig: cleanConfig,
          todos: cleanTodos,
          notes: cleanNotes,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        // Silently skip if Firestore API is disabled in console
      }
    }
  }

  static async loadUserData(userEmail?: string): Promise<FullUserData | null> {
    // 1. Primary: Load from shared server API cache per account
    if (userEmail) {
      try {
        const res = await fetch(`/api/user-cache?email=${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            return {
              tasks: json.data.tasks || [],
              preferences: json.data.preferences || null,
              aiConfig: json.data.aiConfig || null,
              todos: json.data.todos || [],
              notes: json.data.notes || [],
              updatedAt: json.data.updatedAt,
            };
          }
        }
      } catch (e) {
        console.warn('Could not load from /api/user-cache:', e);
      }
    }

    // 2. Secondary: Load from Firestore Cloud
    const uid = await this.getUserId();
    if (uid) {
      try {
        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          return {
            tasks: data.tasks || [],
            preferences: data.preferences || null,
            aiConfig: data.aiConfig || null,
            todos: data.todos || [],
            notes: data.notes || [],
            updatedAt: data.updatedAt,
          };
        }
      } catch (error) {
        // Silently skip if Firestore API is disabled in console
      }
    }

    return null;
  }
}
