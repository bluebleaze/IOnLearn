"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquareText,
  LogOut,
  LogIn,
  CheckCircle2,
  FlaskConical,
  Settings,
  ChevronDown,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import { UserProfile } from "../services/classroomService";
import { Button } from "@/components/ui/button";
import { APP_TAGLINE } from "@/lib/brand";
import { Theme, toggleThemeWithCircularAnimation } from "@/lib/theme";
import { useLanguage } from "@/context/LanguageContext";

interface NavbarProps {
  userProfile: UserProfile | null;
  isConnected: boolean;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
  onSimulateNewTask: () => void;
  onOpenMobileNav: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userProfile,
  isConnected,
  onConnectGoogle,
  onDisconnectGoogle,
  onOpenChat,
  onOpenSettings,
  onSimulateNewTask,
  onOpenMobileNav,
}) => {
  const { isEn, t } = useLanguage();
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
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0c0c0c]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#2b2b2b] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Title & Mobile Menu */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Button
              id="navbar-mobile-menu-btn"
              variant="ghost"
              size="iconSm"
              onClick={onOpenMobileNav}
              title="Buka Menu"
              className="md:hidden min-w-[44px] min-h-[44px] text-slate-500 hover:text-slate-800 dark:text-[#a3a3a3] dark:hover:text-[#f5f5f5] hover:bg-slate-100 dark:hover:bg-[#141414] rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <a href="/" className="flex items-center gap-2 shrink-0">
              <img
                src={currentTheme === "dark" ? "/logos/Ionlearnnewfulltext-dark.png" : "/logos/Ionlearnnewfulltext.png"}
                alt="IOnLearn"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </a>
            <div className="hidden sm:block min-w-0 pl-2 border-l border-slate-200 dark:border-[#2b2b2b]">
              <h1 className="text-sm font-bold font-heading tracking-tight text-slate-900 dark:text-[#f5f5f5] truncate">
                {t.nav.dashboard}
              </h1>
              <p className="text-xs text-slate-500 dark:text-[#737373] truncate">
                {isEn ? "Academic Productivity & Study Assistant" : APP_TAGLINE}
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
              onClick={onOpenChat}
              title="Tanya penjelasan materi ke Asisten AI"
              className="gap-1.5 min-h-[44px] sm:min-h-8 min-w-[44px] sm:min-w-0 px-3 dark:bg-[#141414] dark:border-[#2b2b2b] dark:text-[#a5b4fc] dark:hover:bg-[#161616]"
            >
              <MessageSquareText className="w-4 h-4 text-indigo-600 dark:text-[#a5b4fc] shrink-0" />
              <span className="hidden sm:inline">Tanya AI</span>
            </Button>

            {/* Dark / Light Mode Toggle Button with Circular Reveal Animation */}
            <Button
              id="navbar-theme-toggle-btn"
              variant="ghost"
              size="iconSm"
              onClick={handleToggleTheme}
              title={currentTheme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
              className="min-w-[44px] min-h-[44px] text-slate-500 hover:text-slate-800 dark:text-[#a3a3a3] dark:hover:text-[#f5f5f5] hover:bg-slate-100 dark:hover:bg-[#141414] rounded-xl transition cursor-pointer"
            >
              {currentTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </Button>

            {/* Profile Dropdown / Connect */}
            {isConnected ? (
              <div className="relative ml-1" ref={profileMenuRef}>
                <button
                  id="navbar-profile-menu-btn"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#141414] transition cursor-pointer"
                  title="Menu Akun & Pengaturan"
                >
                  {userProfile?.picture ? (
                    <img
                      src={userProfile.picture}
                      alt={userProfile.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-[#2b2b2b]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-[#161616] text-indigo-700 dark:text-[#818cf8] font-bold text-xs flex items-center justify-center border border-transparent dark:border-[#2b2b2b]">
                      {userProfile?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="hidden lg:block text-left max-w-[100px]">
                    <p className="text-xs font-semibold text-slate-800 dark:text-[#f5f5f5] leading-tight truncate">
                      {userProfile?.name?.split(" ")[0] || "Pelajar"}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#737373]" />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#161616] rounded-2xl shadow-xl border border-slate-200 dark:border-[#2b2b2b] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-[#2b2b2b]">
                      <p className="text-xs font-bold text-slate-900 dark:text-[#f5f5f5] truncate">
                        {userProfile?.name || "Pelajar"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-[#a3a3a3] truncate">
                        {userProfile?.email || "Akun Terhubung"}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-1 text-xs text-emerald-700 dark:text-[#34d399] font-medium bg-emerald-50 dark:bg-[#34d399]/10 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-[#34d399]/20">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-[#34d399]" />
                        Google Classroom Aktif
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenSettings();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-[#a3a3a3] hover:bg-slate-50 dark:hover:bg-[#141414] hover:text-indigo-600 dark:hover:text-[#f5f5f5] flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-400 dark:text-[#a3a3a3]" />
                        <span>Pengaturan Aplikasi & Filter</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onSimulateNewTask();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-[#a3a3a3] hover:bg-slate-50 dark:hover:bg-[#141414] hover:text-amber-600 dark:hover:text-[#fbbf24] flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <FlaskConical className="w-4 h-4 text-amber-500 dark:text-[#fbbf24]" />
                        <span>Coba Tambah Tugas Contoh (Uji Coba)</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-[#2b2b2b]">
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
                className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#f5f5f5] dark:text-[#0c0c0c] dark:hover:bg-[#fbbf24] gap-2 rounded-[10px] shadow-xs"
              >
                <LogIn className="w-4 h-4 text-emerald-400 dark:text-[#0c0c0c]" />
                <span>Masuk dengan Google</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};