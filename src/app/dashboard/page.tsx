import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import data from "./data.json"

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.16),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.14),_transparent_28%),linear-gradient(135deg,_#f8f9ff_0%,_#eef2ff_26%,_#f6f8ff_58%,_#f5f3ff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.26),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.18),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(135deg,_#0a1020_0%,_#111827_28%,_#0f172a_52%,_#111827_100%)]">
        <AppSidebar variant="inset" />
        <SidebarInset className="bg-transparent">
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-3 px-2 pb-6 pt-3 md:gap-5 md:px-4 md:pb-8">
              <SectionCards />
              <div className="px-2 lg:px-2">
                <ChartAreaInteractive />
              </div>
              <div className="px-2 lg:px-2">
                <DataTable data={data} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
