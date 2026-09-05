import { doc, setDoc, getDoc } from 'firebase/firestore';
import { TodoTask, UserPreferences, AIConfig } from '../types';
import { auth, db } from '@/lib/firebase';

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
    userEmail?: string
  ): Promise<void> {
    const cleanTasks = JSON.parse(JSON.stringify(tasks));
    const cleanPrefs = preferences ? JSON.parse(JSON.stringify(preferences)) : null;
    const cleanConfig = aiConfig ? JSON.parse(JSON.stringify(aiConfig)) : null;

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
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        // Silently skip if Firestore API is disabled in console
      }
    }
  }

  static async loadUserData(userEmail?: string): Promise<{
    tasks: TodoTask[];
    preferences: UserPreferences | null;
    aiConfig: AIConfig | null;
  } | null> {
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
          };
        }
      } catch (error) {
        // Silently skip if Firestore API is disabled in console
      }
    }

    return null;
  }
}
