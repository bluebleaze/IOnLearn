"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquareText,
  ListTodo,
  NotebookPen,
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
  useSidebar,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { BrandText, APP_TAGLINE } from "@/lib/brand";
import { UserProfile } from "@/services/classroomService";
import { cn } from "@/lib/utils";

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
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
      const observer = new MutationObserver(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    }
  }, []);

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
      className="border-r border-indigo-100/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(247,247,255,0.9))] backdrop-blur-xl dark:border-indigo-500/10 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.94),_rgba(17,24,39,0.96))] shadow-[0_18px_45px_rgba(79,70,229,0.09)] dark:shadow-[0_18px_45px_rgba(2,6,23,0.7)]"
      {...props}
    >
      {/* Header with Brand */}
      <SidebarHeader className="border-0 p-2 overflow-hidden whitespace-nowrap">
        <SidebarMenu className="overflow-hidden">
          <SidebarMenuItem className="overflow-hidden">
            <SidebarMenuButton
              size="lg"
              tooltip="IOnLearn"
              onClick={() => {
                if (isMobile) setOpenMobile(false);
                router.push("/");
              }}
              className="cursor-pointer hover:bg-slate-100/80 dark:hover:bg-[#181818] transition-colors rounded-xl overflow-hidden whitespace-nowrap group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center pr-8"
            >
              {isCollapsed ? (
                /* Collapsed Icon: logoionlearnkecil */
                <div className="flex aspect-square size-8 items-center justify-center shrink-0">
                  <img
                    src="/logos/logoionlearnkecil.png"
                    alt="IOnLearn"
                    className="size-6 object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-0.5 text-left leading-tight overflow-hidden whitespace-nowrap transition-[opacity,transform,max-width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-full px-1">
                  <div className="flex items-center">
                    <img
                      src={isDark ? "/logos/logoionlearnfulltext-dark.png" : "/logos/logoionlearnfulltext.png"}
                      alt="IOnLearn"
                      className="h-6 w-auto object-contain"
                    />
                  </div>
                  <span className="truncate whitespace-nowrap text-xs text-slate-500 dark:text-[#737373]">
                    {APP_TAGLINE}
                  </span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className="px-2 py-1 overflow-hidden whitespace-nowrap transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <SidebarGroup className="p-0 overflow-hidden">
          <SidebarGroupLabel className="text-xs font-bold tracking-wider text-slate-500 dark:text-[#a3a3a3] uppercase px-2 mb-1.5 whitespace-nowrap truncate select-none">
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
                    className={cn(
                      "rounded-xl font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden whitespace-nowrap group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center cursor-pointer",
                      isMobile ? "h-11 text-xs" : "h-9 text-xs",
                      item.isActive
                        ? "bg-[linear-gradient(135deg,_rgba(99,102,241,0.13),_rgba(168,85,247,0.08))] text-indigo-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.12)] dark:bg-[linear-gradient(135deg,_rgba(99,102,241,0.21),_rgba(59,130,246,0.08))] dark:text-indigo-200 font-semibold [&_svg]:text-indigo-600 dark:[&_svg]:text-indigo-300"
                        : "text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-[#f5f5f5] hover:bg-[linear-gradient(135deg,_rgba(148,163,184,0.10),_rgba(99,102,241,0.08))] dark:hover:bg-[linear-gradient(135deg,_rgba(30,41,59,0.9),_rgba(67,56,202,0.12))]"
                    )}
                  >
                    <a
                      href={item.url}
                      onClick={(e) => {
                        e.preventDefault();
                        if (isMobile) setOpenMobile(false);
                        router.push(item.url);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:gap-0"
                    >
                      <item.icon className="size-4.5 shrink-0 transition-transform duration-150 group-hover:[&_svg]:scale-105" />
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
