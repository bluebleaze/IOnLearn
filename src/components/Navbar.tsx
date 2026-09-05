"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  GraduationCap,
  RefreshCw,
  Plus,
  MessageSquareText,
  LogOut,
  LogIn,
  CheckCircle2,
  FlaskConical,
  Settings,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { UserProfile } from "../services/classroomService";
import { Button } from "@/components/ui/button";
import { BrandText, APP_TAGLINE } from "@/lib/brand";
import { Theme, toggleThemeWithCircularAnimation } from "@/lib/theme";

interface NavbarProps {
  userProfile: UserProfile | null;
  isConnected: boolean;
  isSyncing: boolean;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onSyncClassroom: () => void;
  onOpenCreateTask: () => void;
  onOpenChat: (taskId?: string) => void;
  onSimulateNewTask: () => void;
  onOpenSettings: () => void;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  userProfile,
  isConnected,
  isSyncing,
  onConnectGoogle,
  onDisconnectGoogle,
  onSyncClassroom,
  onOpenCreateTask,
  onOpenChat,
  onSimulateNewTask,
  onOpenSettings,
  pendingCount,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>("light");
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setCurrentTheme(isDark ? "dark" : "light");
    }
  }, []);

  const handleToggleTheme = (e: React.MouseEvent) => {
    const next = toggleThemeWithCircularAnimation(e);
    setCurrentTheme(next);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#252F42] shadow-2xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Application Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[#9294E8] flex items-center justify-center text-[#0B0F17] shadow-xs shrink-0">
              <GraduationCap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-[#F1F0EC] text-base sm:text-lg tracking-tight font-heading">
                <BrandText />
              </span>
              <p className="text-xs text-slate-500 dark:text-[#9AA6B8] hidden sm:block">
                {APP_TAGLINE}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Ask AI Button */}
            <Button
              id="navbar-open-chat-btn"
              variant="primarySubtle"
              size="sm"
              onClick={() => onOpenChat()}
              title="Tanya penjelasan materi ke Asisten AI"
              className="gap-1.5 dark:bg-[#121927] dark:border-[#252F42] dark:text-[#B0B1F2] dark:hover:bg-[#161F30]"
            >
              <MessageSquareText className="w-4 h-4 text-indigo-600 dark:text-[#B0B1F2] shrink-0" />
              <span>Tanya AI</span>
            </Button>

            {/* Add Manual Task Button */}
            <Button
              id="navbar-create-task-btn"
              variant="outline"
              size="sm"
              onClick={onOpenCreateTask}
              title="Catat tugas baru secara manual"
              className="gap-1.5"
            >
              <Plus className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
              <span className="hidden sm:inline">Tambah Tugas</span>
            </Button>

            {/* Application Settings Button */}
            <Button
              id="navbar-open-settings-btn"
              variant="ghost"
              size="iconSm"
              onClick={onOpenSettings}
              title="Pengaturan Aplikasi & AI"
              className="text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* Dark / Light Mode Toggle Button with Circular Reveal Animation */}
            <Button
              id="navbar-theme-toggle-btn"
              variant="ghost"
              size="iconSm"
              onClick={handleToggleTheme}
              title={currentTheme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
              className="text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition cursor-pointer"
            >
              {currentTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </Button>

            {/* Sync from Google Classroom Button */}
            {isConnected && (
              <Button
                id="navbar-sync-classroom-btn"
                variant="default"
                size="sm"
                onClick={onSyncClassroom}
                disabled={isSyncing}
                title="Periksa tugas baru dari akun Google Classroom Anda"
                className="gap-1.5"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
                />
                <span className="hidden md:inline">
                  {isSyncing ? "Memeriksa..." : "Cek Tugas Baru"}
                </span>
              </Button>
            )}

            {/* Profile Dropdown */}
            {isConnected ? (
              <div className="relative ml-1" ref={profileMenuRef}>
                <button
                  id="navbar-profile-menu-btn"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl border border-slate-200 dark:border-[#252F42] bg-slate-50 dark:bg-[#121927] hover:bg-slate-100 dark:hover:bg-[#161F30] transition cursor-pointer"
                  title="Menu Akun & Pengaturan"
                >
                  {userProfile?.picture ? (
                    <img
                      src={userProfile.picture}
                      alt={userProfile.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-[#252F42]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-[#161F30] text-indigo-700 dark:text-[#9294E8] font-bold text-xs flex items-center justify-center border border-transparent dark:border-[#252F42]">
                      {userProfile?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="hidden lg:block text-left max-w-[100px]">
                    <p className="text-xs font-semibold text-slate-800 dark:text-[#F1F0EC] leading-tight truncate">
                      {userProfile?.name?.split(" ")[0] || "Pelajar"}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#9AA6B8]" />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#161F30] rounded-2xl shadow-xl border border-slate-200 dark:border-[#252F42] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-[#252F42]">
                      <p className="text-xs font-bold text-slate-900 dark:text-[#F1F0EC] truncate">
                        {userProfile?.name || "Pelajar"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-[#9AA6B8] truncate">
                        {userProfile?.email || "Akun Terhubung"}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-1 text-xs text-emerald-700 dark:text-[#91C9B5] font-medium bg-emerald-50 dark:bg-[#91C9B5]/10 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-[#91C9B5]/20">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-[#91C9B5]" />
                        Google Classroom Aktif
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenSettings();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-[#9AA6B8] hover:bg-slate-50 dark:hover:bg-[#121927] hover:text-indigo-600 dark:hover:text-[#F1F0EC] flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-400 dark:text-[#9AA6B8]" />
                        <span>Pengaturan Aplikasi & Filter</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onSimulateNewTask();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-[#9AA6B8] hover:bg-slate-50 dark:hover:bg-[#121927] hover:text-amber-600 dark:hover:text-[#E8DFC8] flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <FlaskConical className="w-4 h-4 text-amber-500 dark:text-[#E8DFC8]" />
                        <span>Coba Tambah Tugas Contoh (Uji Coba)</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-[#252F42]">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onDisconnectGoogle();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Keluar (Putuskan Hubungan Akun)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                id="navbar-connect-google-btn"
                variant="secondary"
                size="sm"
                onClick={onConnectGoogle}
                className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#F1F0EC] dark:text-[#0B0F17] dark:hover:bg-[#E8DFC8] gap-2 rounded-[10px] shadow-xs"
              >
                <LogIn className="w-4 h-4 text-emerald-400 dark:text-[#0B0F17]" />
                <span>Masuk dengan Google</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
