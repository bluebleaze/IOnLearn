"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ChevronsUpDown,
  Settings,
  RefreshCw,
  LogOut,
  User,
} from "lucide-react";

export interface NavUserProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onSyncClassroom?: () => void;
  isSyncing?: boolean;
  onDisconnectGoogle?: () => void;
  onOpenAccount?: () => void;
}

export function NavUser({
  user,
  onSyncClassroom,
  isSyncing = false,
  onDisconnectGoogle,
  onOpenAccount,
}: NavUserProps) {
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <SidebarMenu className="overflow-hidden group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem className="overflow-hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={user.name}
              className="data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-[#161618] hover:bg-slate-100/80 dark:hover:bg-[#141416] transition-colors rounded-lg overflow-hidden whitespace-nowrap outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ring-0 ring-offset-0 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto cursor-pointer select-none"
            >
              <Avatar className="size-8 rounded-lg shrink-0 overflow-hidden">
                <AvatarImage src={user.avatar} alt={user.name} className="rounded-lg object-cover size-full" />
                <AvatarFallback className="rounded-lg bg-slate-100 dark:bg-[#161618] text-slate-700 dark:text-slate-200 font-semibold text-xs border border-black/[0.04] dark:border-white/[0.08]">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden whitespace-nowrap transition-[opacity,transform,max-width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-full group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:-translate-x-2 group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:hidden">
                <span className="truncate whitespace-nowrap font-medium text-slate-900 dark:text-white text-xs">
                  {user.name}
                </span>
                <span className="truncate whitespace-nowrap text-xs text-slate-500 dark:text-[#8e8e93]">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-slate-400 dark:text-[#737373] shrink-0 transition-[opacity,transform] duration-200 ease-out group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 min-w-56 rounded-xl bg-white dark:bg-[#0c0c0e] border border-slate-200/80 dark:border-white/[0.08] p-1.5 shadow-lg outline-none focus:outline-none"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-2 py-1.5 text-left">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-slate-100 dark:bg-[#161618] text-slate-700 dark:text-slate-200 font-semibold text-xs border border-black/[0.04] dark:border-white/[0.08]">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-slate-900 dark:text-white text-xs">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-slate-500 dark:text-[#8e8e93]">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.08] my-1" />
            
            <DropdownMenuGroup className="space-y-0.5">
              {onOpenAccount && (
                <DropdownMenuItem
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                    onOpenAccount();
                  }}
                  className="cursor-pointer gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-[#18181b] outline-none"
                >
                  <User className="w-4 h-4 text-slate-500 dark:text-[#737373]" />
                  <span>Detail Akun</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => {
                  if (isMobile) setOpenMobile(false);
                  router.push("/settings");
                }}
                className="cursor-pointer gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-[#18181b] outline-none"
              >
                <Settings className="w-4 h-4 text-slate-500 dark:text-[#737373]" />
                <span>Pengaturan Belajar & AI</span>
              </DropdownMenuItem>

              {onSyncClassroom && (
                <DropdownMenuItem
                  onClick={onSyncClassroom}
                  disabled={isSyncing}
                  className="cursor-pointer gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-[#18181b] outline-none"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-emerald-600 dark:text-[#34d399] ${
                      isSyncing ? "animate-spin" : ""
                    }`}
                  />
                  <span>
                    {isSyncing ? "Menyinkronkan..." : "Sinkronkan Classroom"}
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>

            {onDisconnectGoogle && (
              <>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.08] my-1" />
                <DropdownMenuItem
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                    onDisconnectGoogle();
                  }}
                  className="cursor-pointer gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-[#f87171] hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-[#f87171] outline-none"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Google</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
