import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { TodoTask, UserPreferences, AIConfig, PersonalTodo, StudyNote } from '../types';
import { auth, db } from '@/lib/firebase';

export interface FullUserData {
  tasks: TodoTask[];
  preferences: UserPreferences | null;
  aiConfig: AIConfig | null;
  todos: PersonalTodo[];
  notes: StudyNote[];
  onboardingCompleted?: boolean;
  spotlightCompleted?: boolean;
  hasLoggedInBefore?: boolean;
  updatedAt?: string;
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export class DBService {
  private static async getUserId(): Promise<string | null> {
    if (auth.currentUser?.uid) return auth.currentUser.uid;
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 1000);
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
    notes?: StudyNote[],
    onboardingCompleted?: boolean,
    spotlightCompleted?: boolean,
    hasLoggedInBefore?: boolean
  ): Promise<void> {
    const cleanTasks = JSON.parse(JSON.stringify(tasks || []));
    const cleanPrefs = preferences ? JSON.parse(JSON.stringify(preferences)) : null;
    const cleanConfig = aiConfig ? JSON.parse(JSON.stringify(aiConfig)) : null;
    const cleanTodos = JSON.parse(JSON.stringify(todos || []));
    const cleanNotes = JSON.parse(JSON.stringify(notes || []));

    const saveOperation = async () => {
      // 1. Primary: Save to shared server API cache per account (instant sync across all browsers/devices)
      if (userEmail) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 1500);
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
              onboardingCompleted,
              spotlightCompleted,
              hasLoggedInBefore,
            }),
            signal: controller.signal,
          });
          clearTimeout(timer);
        } catch (e) {
          console.warn('Could not save to /api/user-cache:', e);
        }
      }

      // 2. Secondary: Firestore Cloud if configured and enabled
      try {
        const uid = await withTimeout(this.getUserId(), 1000, null);
        if (uid) {
          const userRef = doc(db, 'users', uid);
          await withTimeout(
            setDoc(userRef, {
              tasks: cleanTasks,
              preferences: cleanPrefs,
              aiConfig: cleanConfig,
              todos: cleanTodos,
              notes: cleanNotes,
              ...(onboardingCompleted !== undefined ? { onboardingCompleted } : {}),
              ...(spotlightCompleted !== undefined ? { spotlightCompleted } : {}),
              ...(hasLoggedInBefore !== undefined ? { hasLoggedInBefore } : {}),
              updatedAt: new Date().toISOString()
            }, { merge: true }),
            1200,
            undefined
          );
        }
      } catch (error) {
        // Silently skip if Firestore API is disabled in console
      }
    };

    await withTimeout(saveOperation(), 2000, undefined);
  }

  static async loadUserData(userEmail?: string): Promise<FullUserData | null> {
    const fetchCloud = async (): Promise<FullUserData | null> => {
      // 1. Primary: Load from shared server API cache per account (with timeout 1500ms)
      if (userEmail) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 1500);
          const res = await fetch(`/api/user-cache?email=${encodeURIComponent(userEmail)}`, {
            signal: controller.signal,
          });
          clearTimeout(timer);
          if (res.ok) {
            const json = await res.json();
            if (json.data) {
              const d = json.data;
              const hasData =
                (d.tasks && d.tasks.length > 0) ||
                (d.todos && d.todos.length > 0) ||
                (d.notes && d.notes.length > 0) ||
                Boolean(d.preferences);
              return {
                tasks: d.tasks || [],
                preferences: d.preferences || null,
                aiConfig: d.aiConfig || null,
                todos: d.todos || [],
                notes: d.notes || [],
                onboardingCompleted: d.onboardingCompleted ?? hasData,
                spotlightCompleted: d.spotlightCompleted ?? hasData,
                hasLoggedInBefore: d.hasLoggedInBefore ?? hasData,
                updatedAt: d.updatedAt,
              };
            }
          }
        } catch (e) {
          // Silently skip timeout or network error
        }
      }

      // 2. Secondary: Load from Firestore Cloud (with timeout 1500ms)
      try {
        const uid = await withTimeout(this.getUserId(), 1000, null);
        if (uid) {
          const userRef = doc(db, 'users', uid);
          const snap = await withTimeout(getDoc(userRef), 1200, null);
          if (snap && snap.exists()) {
            const data = snap.data();
            const hasData =
              (data.tasks && data.tasks.length > 0) ||
              (data.todos && data.todos.length > 0) ||
              (data.notes && data.notes.length > 0) ||
              Boolean(data.preferences);
            return {
              tasks: data.tasks || [],
              preferences: data.preferences || null,
              aiConfig: data.aiConfig || null,
              todos: data.todos || [],
              notes: data.notes || [],
              onboardingCompleted: data.onboardingCompleted ?? hasData,
              spotlightCompleted: data.spotlightCompleted ?? hasData,
              hasLoggedInBefore: data.hasLoggedInBefore ?? hasData,
              updatedAt: data.updatedAt,
            };
          }
        }
      } catch (error) {
        // Silently skip if Firestore API is disabled in console
      }

      return null;
    };

    // Global hard timeout of 2200ms: loadUserData will NEVER hang longer than 2.2s under any circumstances
    return withTimeout(fetchCloud(), 2200, null);
  }

  static async deleteUserData(userEmail?: string): Promise<boolean> {
    let success = true;

    const deletePromise = (async () => {
      // 1. Delete from shared server cache API
      if (userEmail) {
        try {
          await fetch(`/api/user-cache?email=${encodeURIComponent(userEmail)}`, {
            method: 'DELETE',
          });
        } catch (e) {
          console.warn('Could not delete from /api/user-cache:', e);
          success = false;
        }
      }

      // 2. Delete from Firestore
      try {
        const uid = await this.getUserId();
        if (uid) {
          const userRef = doc(db, 'users', uid);
          await deleteDoc(userRef);
        }
      } catch (error) {
        console.warn('Could not delete from Firestore:', error);
      }

      // 3. Delete Firebase Auth User account if authenticated
      try {
        if (auth.currentUser) {
          await deleteUser(auth.currentUser);
        }
      } catch (authErr) {
        console.warn('Could not delete Firebase Auth user:', authErr);
      }
    })();

    // Ensure we never block the user for more than 2.5 seconds
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2500));
    await Promise.race([deletePromise, timeoutPromise]);

    return success;
  }
}
