import { useSyncExternalStore } from "react";
import { ClassroomService } from "./classroomService";
import { DBService } from "./dbService";
import { TodoTask, DEFAULT_DATE_RANGE_MONTHS, ClassroomSyncProgress } from "../types";
import { loadTasks, persist, loadPreferences } from "../lib/taskStore";
import { toast } from "@/components/ui/sonner";

export interface SyncState {
  isSyncing: boolean;
  syncProgress: ClassroomSyncProgress | null;
  lastSyncedAt: Date | null;
  error: string | null;
}

type SyncListener = (state: SyncState) => void;

const INITIAL_SERVER_SYNC_STATE: SyncState = Object.freeze({
  isSyncing: false,
  syncProgress: null,
  lastSyncedAt: null,
  error: null,
});

class SyncManagerClass {
  private state: SyncState = {
    isSyncing: false,
    syncProgress: null,
    lastSyncedAt: null,
    error: null,
  };

  private listeners = new Set<SyncListener>();
  private activeSyncPromise: Promise<void> | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("last_classroom_sync");
      if (saved) {
        this.state.lastSyncedAt = new Date(saved);
      }
    }
  }

  public getState(): SyncState {
    return this.state;
  }

  public getServerState(): SyncState {
    return INITIAL_SERVER_SYNC_STATE;
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (err) {
        console.error("Error in sync listener:", err);
      }
    });
  }

  private setState(updates: Partial<SyncState>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  public async sync(
    token: string,
    options?: {
      overrideTasks?: TodoTask[];
      overrideEmail?: string;
      silent?: boolean;
    }
  ): Promise<void> {
    if (!token) return;

    // If sync is already running, attach to existing in-flight promise
    if (this.state.isSyncing && this.activeSyncPromise) {
      return this.activeSyncPromise;
    }

    this.activeSyncPromise = (async () => {
      this.setState({
        isSyncing: true,
        error: null,
        syncProgress: {
          current: 0,
          total: 0,
          percent: 5,
          message: "Menghubungkan ke Google Classroom...",
        },
      });

      try {
        const rangeMonths =
          loadPreferences()?.classroomDateRangeMonths ??
          DEFAULT_DATE_RANGE_MONTHS;
        let currentTasks = options?.overrideTasks ?? loadTasks();
        const email = options?.overrideEmail;

        if (email && !options?.overrideTasks) {
          try {
            const cloudData = await DBService.loadUserData(email);
            if (cloudData?.tasks && cloudData.tasks.length > 0) {
              const cloudTasks = cloudData.tasks.filter(
                (t) =>
                  (!t.userEmail || t.userEmail === email) &&
                  !t.id.startsWith("seed-")
              );
              if (cloudTasks.length > 0) {
                const cloudMap = new Map(cloudTasks.map((t) => [t.id, t]));
                currentTasks = currentTasks.map((t) => {
                  const ct = cloudMap.get(t.id);
                  if (ct) {
                    return {
                      ...t,
                      isCompleted: ct.isCompleted || t.isCompleted,
                      completedAt: ct.completedAt || t.completedAt,
                      customNotes: ct.customNotes || t.customNotes,
                      aiAnalysis: ct.aiAnalysis || t.aiAnalysis,
                    };
                  }
                  return t;
                });
                const existingIds = new Set(currentTasks.map((t) => t.id));
                for (const ct of cloudTasks) {
                  if (!existingIds.has(ct.id)) currentTasks.push(ct);
                }
              }
            }
          } catch {}
        }

        const { updatedTasks, newCount } =
          await ClassroomService.syncAllClassrooms(
            token,
            currentTasks,
            rangeMonths,
            email,
            (prog) => {
              this.setState({ syncProgress: prog });
            }
          );

        persist(updatedTasks);
        const now = new Date();
        if (typeof window !== "undefined") {
          localStorage.setItem("last_classroom_sync", now.toISOString());
          window.dispatchEvent(new Event("taskStoreChange"));
        }

        this.setState({
          isSyncing: false,
          lastSyncedAt: now,
          syncProgress: null,
        });

        if (!options?.silent) {
          if (newCount > 0) {
            toast.success("Sinkronisasi Selesai", {
              description: `Ditemukan ${newCount} tugas baru dari Google Classroom.`,
            });
          } else {
            toast.info("Classroom Sudah Terkini", {
              description: "Semua tugas Google Classroom Anda sudah sinkron.",
            });
          }
        }
      } catch (error: any) {
        this.setState({
          isSyncing: false,
          syncProgress: null,
          error: error.message || "Gagal sinkron",
        });

        const is401 =
          error.message?.includes("401") ||
          error.message?.includes("kadaluwarsa");
        if (!options?.silent) {
          if (is401) {
            toast.warning("Akses Classroom Perlu Diperbarui", {
              description:
                "Sesi Google Classroom telah berakhir. Klik avatar profil atau tombol sinkronisasi untuk masuk kembali.",
            });
          } else {
            toast.warning("Sinkronisasi Offline", {
              description:
                error.message ||
                "Gagal terhubung ke API Classroom. Menggunakan data lokal.",
            });
          }
        }
      } finally {
        this.activeSyncPromise = null;
      }
    })();

    return this.activeSyncPromise;
  }
}

export const SyncManager = new SyncManagerClass();

const subscribe = (onStoreChange: () => void) => SyncManager.subscribe(onStoreChange);
const getClientSnapshot = () => SyncManager.getState();
const getServerSnapshot = () => SyncManager.getServerState();

export function useSyncManager(): SyncState {
  return useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );
}
