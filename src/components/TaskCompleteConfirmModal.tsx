"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

interface TaskCompleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle?: string;
  language?: "id" | "en";
}

export const TaskCompleteConfirmModal: React.FC<TaskCompleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  language,
}) => {
  const { isEn: contextIsEn } = useLanguage();
  const isEn = language ? language === "en" : contextIsEn;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/90 dark:border-[#262626] shadow-2xl p-5 sm:p-6 gap-4">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#f3f3f3] font-heading tracking-tight">
              {isEn ? "Mark task as completed?" : "Konfirmasi tugas selesai?"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-slate-600 dark:text-[#a3a3a3] leading-relaxed pt-1">
            {taskTitle ? (
              <>
                {isEn ? (
                  <>Are you sure you want to mark <span className="font-semibold text-slate-900 dark:text-[#f3f3f3]">"{taskTitle}"</span> as completed?</>
                ) : (
                  <>Apakah Anda yakin ingin menandai tugas <span className="font-semibold text-slate-900 dark:text-[#f3f3f3]">"{taskTitle}"</span> sebagai selesai?</>
                )}
              </>
            ) : (
              isEn ? "Are you sure you want to mark this task as completed?" : "Apakah Anda yakin ingin menandai tugas ini sebagai selesai?"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-xl p-3 border border-slate-100 dark:border-[#262626] flex items-center gap-2 text-xs text-slate-500 dark:text-[#888]">
          <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            {isEn
              ? "Task status will be updated to completed and can be reviewed in the Completed tab."
              : "Status tugas akan diperbarui menjadi selesai dan dapat dilihat pada tab Selesai."}
          </span>
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none text-xs rounded-xl border-slate-200 dark:border-[#2b2b2b] hover:bg-slate-100 dark:hover:bg-[#222]"
          >
            {isEn ? "Cancel" : "Batal"}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 sm:flex-none text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            {isEn ? "Confirm" : "Konfirmasi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
