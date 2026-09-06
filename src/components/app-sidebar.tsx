"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquareText,
  ListTodo,
  NotebookPen,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { BrandText, APP_TAGLINE } from "@/lib/brand";
import { UserProfile } from "@/services/classroomService";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userProfile?: UserProfile | null;
  isConnected?: boolean;
  isSyncing?: boolean;
  onSyncClassroom?: () => void;
  onDisconnectGoogle?: () => void;
}

export function AppSidebar({
  userProfile = null,
  isConnected = false,
  isSyncing = false,
  onSyncClassroom,
  onDisconnectGoogle,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      isActive: pathname === "/",
    },
    {
      title: "Semua Tugas",
      url: "/tasks",
      icon: BookOpen,
      isActive: pathname.startsWith("/tasks") || pathname.startsWith("/tugas"),
    },
    {
      title: "Tanya AI",
      url: "/chat",
      icon: MessageSquareText,
      isActive: pathname.startsWith("/chat"),
    },
    {
      title: "To-Do List",
      url: "/todo",
      icon: ListTodo,
      isActive: pathname.startsWith("/todo"),
    },
    {
      title: "Catatan Materi",
      url: "/notes",
      icon: NotebookPen,
      isActive: pathname.startsWith("/notes"),
    },
  ];

  const user = {
    name: userProfile?.name || "Pelajar",
    email: userProfile?.email || "pelajar@classroom.id",
    avatar: userProfile?.picture,
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-0 bg-white dark:bg-[#101010] shadow-[1px_0_12px_0_rgba(0,0,0,0.06)] dark:shadow-[1px_0_16px_0_rgba(0,0,0,0.4)]"
      {...props}
    >
      {/* Header with Brand */}
      <SidebarHeader className="border-0 p-2 overflow-hidden whitespace-nowrap">
        <SidebarMenu className="overflow-hidden">
          <SidebarMenuItem className="overflow-hidden">
            <SidebarMenuButton
              size="lg"
              tooltip="IOnLearn"
              onClick={() => router.push("/")}
              className="cursor-pointer hover:bg-slate-100/80 dark:hover:bg-[#181818] transition-colors rounded-xl overflow-hidden whitespace-nowrap group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-[8px] bg-indigo-600 dark:bg-[#818cf8] text-white dark:text-[#0c0c0c] shrink-0 shadow-xs">
                <GraduationCap className="size-4 stroke-[2.2]" />
              </div>
              <div className="grid flex-1 text-left text-xs leading-tight overflow-hidden whitespace-nowrap transition-[opacity,transform,max-width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-full group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:-translate-x-2 group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:hidden">
                <span className="truncate whitespace-nowrap font-extrabold text-slate-900 dark:text-[#f5f5f5] font-heading">
                  <BrandText />
                </span>
                <span className="truncate whitespace-nowrap text-xs text-slate-500 dark:text-[#737373]">
                  {APP_TAGLINE}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className="px-2 py-1 overflow-hidden whitespace-nowrap transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <SidebarGroup className="p-0 overflow-hidden">
          <SidebarGroupLabel className="text-xs font-bold tracking-wider text-slate-400 dark:text-[#737373] uppercase px-2 mb-1.5 whitespace-nowrap truncate select-none">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent className="overflow-hidden">
            <SidebarMenu className="space-y-1 overflow-hidden">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title} className="overflow-hidden">
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    tooltip={item.title}
                    className={`h-9 rounded-xl font-medium text-xs transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden whitespace-nowrap group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center cursor-pointer ${
                      item.isActive
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-semibold [&_svg]:text-indigo-600 dark:[&_svg]:text-indigo-400"
                        : "text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f5f5f5] hover:bg-slate-100/80 dark:hover:bg-[#181818]"
                    }`}
                  >
                    <a
                      href={item.url}
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(item.url);
                      }}
                      className="flex items-center gap-2.5 px-2.5 py-2 w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:gap-0"
                    >
                      <item.icon className="size-4 shrink-0 transition-transform duration-150 group-hover:[&_svg]:scale-105" />
                      <span className="truncate whitespace-nowrap transition-[opacity,transform,max-width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-full group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:-translate-x-2 group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Profile and Settings */}
      <SidebarFooter className="border-0 p-2 overflow-hidden whitespace-nowrap">
        <NavUser
          user={user}
          onSyncClassroom={onSyncClassroom}
          isSyncing={isSyncing}
          onDisconnectGoogle={onDisconnectGoogle}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
