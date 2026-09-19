"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Settings, RefreshCw, LogOut, Mail, Compass, Trash2 } from "lucide-react";
import { UserProfile } from "@/services/classroomService";
import { useLanguage } from "@/context/LanguageContext";
import { DeleteAccountModal } from "./DeleteAccountModal";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  isConnected: boolean;
  onSyncClassroom?: () => void;
  isSyncing?: boolean;
  onDisconnectGoogle?: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  isConnected,
  onSyncClassroom,
  isSyncing = false,
  onDisconnectGoogle,
}) => {
  const router = useRouter();
  const { isEn } = useLanguage();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/90 dark:border-[#262626] shadow-2xl p-5 sm:p-6 gap-4">
          <DialogHeader className="text-left space-y-1.5">
            <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#f3f3f3] font-heading">
              {isEn ? "User Profile & Account" : "Profil & Akun Pengguna"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-[#888]">
              {isEn
                ? "Google Classroom account details and cloud sync preferences."
                : "Informasi akun Google Classroom dan preferensi akun Anda."}
            </DialogDescription>
          </DialogHeader>

          {/* User Card */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200/80 dark:border-[#262626]">
            <Avatar className="h-12 w-12 rounded-xl ring-2 ring-indigo-500/20">
              <AvatarImage src={userProfile?.picture} alt={userProfile?.name} />
              <AvatarFallback className="rounded-xl bg-indigo-100 dark:bg-[#222230] text-indigo-700 dark:text-[#818cf8] font-bold text-sm">
                {getInitials(userProfile?.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#f3f3f3] truncate">
                {userProfile?.name || (isEn ? "Student" : "Pelajar")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#888] truncate flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{userProfile?.email || (isEn ? "No email" : "Tidak ada email")}</span>
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isEn ? "Google Classroom Connected" : "Google Classroom Aktif"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Menu Actions */}
          <div className="space-y-1 pt-1">
            <Button
              variant="ghost"
              onClick={() => {
                onClose();
                router.push("/settings");
              }}
              className="w-full justify-start text-xs font-medium h-10 px-3 rounded-xl text-slate-700 dark:text-[#ccc] hover:bg-slate-100 dark:hover:bg-[#202020] gap-2.5 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-500 dark:text-[#888]" />
              <span>{isEn ? "Open Study & AI Settings" : "Buka Pengaturan Belajar & AI"}</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent("start-feature-tour"));
              }}
              className="w-full justify-start text-xs font-medium h-10 px-3 rounded-xl text-slate-700 dark:text-[#ccc] hover:bg-slate-100 dark:hover:bg-[#202020] gap-2.5 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>{isEn ? "Feature Tour & Workflow Guide" : "Panduan & Tur Fitur IOnLearn"}</span>
            </Button>

            {onSyncClassroom && (
              <Button
                variant="ghost"
                onClick={() => {
                  onSyncClassroom();
                }}
                disabled={isSyncing}
                className="w-full justify-start text-xs font-medium h-10 px-3 rounded-xl text-slate-700 dark:text-[#ccc] hover:bg-slate-100 dark:hover:bg-[#202020] gap-2.5 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 text-emerald-600 dark:text-[#34d399] ${isSyncing ? "animate-spin" : ""}`} />
                <span>
                  {isSyncing
                    ? (isEn ? "Syncing Classroom..." : "Menyinkronkan Classroom...")
                    : (isEn ? "Refresh Classroom Sync" : "Refresh Sinkronisasi Classroom")}
                </span>
              </Button>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-[#262626] space-y-1">
              {onDisconnectGoogle && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    onClose();
                    onDisconnectGoogle();
                  }}
                  className="w-full justify-start text-xs font-medium h-9.5 px-3 rounded-xl text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f5f5f5] hover:bg-slate-100 dark:hover:bg-[#202020] gap-2.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-slate-500" />
                  <span>{isEn ? "Log Out (Disconnect Account)" : "Keluar (Putuskan Hubungan Akun)"}</span>
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() => {
                  onClose();
                  setShowDeleteModal(true);
                }}
                className="w-full justify-start text-xs font-medium h-9.5 px-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-2.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>{isEn ? "Delete Account & Data" : "Hapus Akun & Data Permanen"}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userEmail={userProfile?.email}
      />
    </>
  );
};
