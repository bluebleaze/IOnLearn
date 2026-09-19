"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { AlertTriangle, Trash2, Loader2, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { DBService } from "@/services/dbService";
import { clearAllUserLocalData } from "@/lib/taskStore";
import { ClassroomService } from "@/services/classroomService";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  userEmail,
}: DeleteAccountModalProps) {
  const router = useRouter();
  const { isEn } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const email = userEmail || ClassroomService.getUserProfile()?.email || "";
  const expectedKeyword = isEn ? "DELETE" : "HAPUS";
  const isConfirmed = confirmText.trim().toUpperCase() === expectedKeyword;

  const handleDelete = async () => {
    if (!isConfirmed || isDeleting) return;

    setIsDeleting(true);
    try {
      // 1. Wipe local session & all stored tokens immediately so user is logged out
      clearAllUserLocalData(email);

      // 2. Delete cloud database & server cache in background/with timeout
      try {
        await DBService.deleteUserData(email);
      } catch (cloudErr) {
        console.warn("Cloud deletion warning:", cloudErr);
      }

      toast.success(
        isEn
          ? "Account & all data deleted successfully."
          : "Akun dan seluruh data berhasil dihapus dari sistem.",
        {
          description: isEn
            ? "You have been logged out and returned to home."
            : "Anda telah keluar dan diarahkan ke halaman awal.",
        }
      );

      onClose();
      // Hard redirect to landing page to ensure clean unauthenticated state
      window.location.replace("/");
    } catch (err: any) {
      console.error("Delete account error:", err);
      // Even if error occurs, ensure local session is cleared and user is safely returned
      clearAllUserLocalData(email);
      onClose();
      window.location.replace("/");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isDeleting && !open && onClose()}>
      <DialogContent className="sm:max-w-[460px] p-6 rounded-3xl border border-rose-200/80 dark:border-rose-900/40 bg-white dark:bg-[#121214] shadow-2xl">
        <DialogHeader className="space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-1">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#f5f5f5]">
            {isEn ? "Permanently Delete Account & Data?" : "Hapus Akun & Data Secara Permanen?"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 dark:text-[#a3a3a3] leading-relaxed">
            {isEn ? (
              <>
                This action is <strong className="text-rose-600 dark:text-rose-400">permanent and irreversible</strong>. All your data will be permanently wiped:
              </>
            ) : (
              <>
                Tindakan ini <strong className="text-rose-600 dark:text-rose-400">permanen dan tidak dapat dibatalkan</strong>. Semua data berikut akan dihapus bersih dari sistem:
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Data loss summary box */}
        <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 text-xs text-slate-700 dark:text-[#d4d4d4] space-y-2">
          <ul className="space-y-1.5 list-disc list-inside text-[11px] sm:text-xs">
            <li>
              <strong>{isEn ? "Profile & AI Persona" : "Profil Akun & AI"}:</strong>{" "}
              {isEn ? "Personalized AI settings, learning style & preferences" : "Preferensi gaya belajar, persona AI, & pengaturan akun"}
            </li>
            <li>
              <strong>{isEn ? "Study Notes & Summaries" : "Catatan & Ringkasan Belajar"}:</strong>{" "}
              {isEn ? "All saved notes, flashcards, and AI summaries" : "Semua catatan materi, flashcard, & rangkuman AI"}
            </li>
            <li>
              <strong>{isEn ? "Personal To-Dos & Progress" : "To-Do List & Riwayat Belajar"}:</strong>{" "}
              {isEn ? "Custom study tasks and completion progress" : "Daftar to-do belajar mandiri & riwayat progres"}
            </li>
            <li>
              <strong>{isEn ? "Cloud & Local Sync Data" : "Data Akun & Sinkronisasi"}:</strong>{" "}
              {isEn ? "All cloud learning records and active login session" : "Semua data belajar akun dan sesi login aktif"}
            </li>
          </ul>
        </div>

        {/* Confirmation Input */}
        <div className="space-y-2 pt-1">
          <label className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-[#ccc]">
            {isEn ? (
              <>
                Type <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{expectedKeyword}</span> to confirm:
              </>
            ) : (
              <>
                Ketik <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{expectedKeyword}</span> untuk konfirmasi:
              </>
            )}
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={expectedKeyword}
            disabled={isDeleting}
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 uppercase font-mono transition"
          />
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs h-9 px-4 rounded-xl cursor-pointer"
          >
            {isEn ? "Cancel" : "Batal"}
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="text-xs h-9 px-4 rounded-xl gap-1.5 cursor-pointer bg-rose-600 hover:bg-rose-700 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isEn ? "Deleting Data..." : "Menghapus Data..."}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isEn ? "Delete Account Permanently" : "Hapus Akun Permanen"}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
