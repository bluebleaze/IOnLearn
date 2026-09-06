"use client";
import React, { useEffect } from "react";
import {
  LayoutDashboard,
  MessageSquareText,
  Plus,
  FlaskConical,
  Settings,
  RefreshCw,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { UserProfile } from "../services/classroomService";
import { BrandText, APP_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SidebarProps {
  userProfile: UserProfile | null;
  isConnected: boolean;
  isSyncing: boolean;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onSyncClassroom: () => void;
  onOpenCreateTask: () => void;
  onOpenChat: () => void;
  onSimulateNewTask: () => void;
  onOpenSettings: () => void;
  mobileOpen: boolean;
  onCloseMobileSidebar: () => void;
}

interface SidebarItemProps {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  active?: boolean;
  spinning?: boolean;
  danger?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  icon: Icon,
  onClick,
  active,
  spinning,
  danger,
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium transition cursor-pointer",
      active
        ? "bg-slate-100 dark:bg-[#141414] text-slate-900 dark:text-[#f5f5f5] border border-slate-200 dark:border-[#2b2b2b] font-semibold"
        : danger
          ? "text-rose-600 dark:text-[#f87171] hover:bg-slate-100 dark:hover:bg-[#141414] border border-transparent"
          : "text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f5f5f5] hover:bg-slate-100 dark:hover:bg-[#141414] border border-transparent"
    )}
  >
    <Icon
      className={cn(
        "w-4 h-4 shrink-0",
        spinning && "animate-spin",
        active && "text-indigo-600 dark:text-[#818cf8]",
        danger && "text-rose-500 dark:text-[#f87171]"
      )}
    />
    <span className="truncate">{label}</span>
  </button>
);

const SidebarBody: React.FC<SidebarProps & { onNavigate: () => void }> = (
  props
) => {
  const router = useRouter();
  const fire = (action: () => void) => () => {
    action();
    props.onNavigate();
  };
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 shrink-0 h-16 border-b border-slate-200 dark:border-[#2b2b2b]">
        <img
          src="/logos/logoionlearnfulltext.png"
          alt="IOnLearn"
          className="h-7 w-auto dark:hidden object-contain"
        />
        <img
          src="/logos/logoionlearnfulltext-dark.png"
          alt="IOnLearn"
          className="h-7 w-auto hidden dark:block object-contain"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div>
          <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#737373]">
            Menu Utama
          </p>
          <div className="space-y-0.5">
            <SidebarItem active label="Dashboard" icon={LayoutDashboard} onClick={fire(() => router.push("/"))} />
            <SidebarItem
              label="Tanya AI"
              icon={MessageSquareText}
              onClick={fire(() => props.onOpenChat())}
            />
            <SidebarItem
              label="Tambah Tugas"
              icon={Plus}
              onClick={fire(() => props.onOpenCreateTask())}
            />
          </div>
        </div>
        <div>
          <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-[#737373]">
            Lainnya
          </p>
          <div className="space-y-0.5">
            {props.isConnected && (
              <SidebarItem
                label={props.isSyncing ? "Memeriksa Tugas Baru..." : "Cek Tugas Baru"}
                icon={RefreshCw}
                spinning={props.isSyncing}
                onClick={fire(() => props.onSyncClassroom())}
              />
            )}
            <SidebarItem
              label="Simulasi Tugas"
              icon={FlaskConical}
              onClick={fire(() => props.onSimulateNewTask())}
            />
            <SidebarItem
              label="Pengaturan"
              icon={Settings}
              onClick={fire(() => props.onOpenSettings())}
            />
            {props.isConnected && (
              <SidebarItem
                danger
                label="Keluar dari Google"
                icon={LogOut}
                onClick={fire(() => props.onDisconnectGoogle())}
              />
            )}
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="shrink-0 px-3 py-3 border-t border-slate-200 dark:border-[#2b2b2b]">
        {props.userProfile ? (
          <div className="flex items-center gap-2.5 px-1">
            {props.userProfile.picture ? (
              <img
                src={props.userProfile.picture}
                alt={props.userProfile.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-[#2b2b2b]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-[#161616] text-indigo-700 dark:text-[#818cf8] font-bold text-xs flex items-center justify-center border border-transparent dark:border-[#2b2b2b]">
                {props.userProfile.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-[#f5f5f5] truncate">
                {props.userProfile.name?.split(" ")[0] || "Pelajar"}
              </p>
              <p className="text-xs text-slate-500 dark:text-[#737373] truncate">
                {props.userProfile.email}
              </p>
            </div>
            {props.isConnected && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#34d399] shrink-0" />
            )}
          </div>
        ) : (
          <div className="px-1 text-xs text-slate-500 dark:text-[#737373]">
            Belum terhubung akun Google.
          </div>
        )}
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const { mobileOpen, onCloseMobileSidebar } = props;

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseMobileSidebar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onCloseMobileSidebar]);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:block sticky top-0 h-screen w-60 shrink-0 border-r border-slate-200 dark:border-[#2b2b2b] bg-slate-50 dark:bg-[#0c0c0c]">
        <SidebarBody {...props} onNavigate={() => {}} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobileSidebar}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-slate-200 dark:border-[#2b2b2b] bg-slate-50 dark:bg-[#0c0c0c] shadow-2xl animate-in slide-in-from-left-1/2 duration-200">
            <SidebarBody {...props} onNavigate={onCloseMobileSidebar} />
          </aside>
        </div>
      )}
    </>
  );
};