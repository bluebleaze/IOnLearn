import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b border-indigo-100/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.86),_rgba(248,250,255,0.72))] backdrop-blur-xl dark:border-indigo-500/10 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.86),_rgba(15,23,42,0.72))] transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-2 px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 rounded-lg border border-slate-200 bg-white/80 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800/80" />
          <Separator
            orientation="vertical"
            className="mx-1 data-[orientation=vertical]:h-4"
          />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Overview</p>
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-50">Dashboard</h1>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-[linear-gradient(135deg,_rgba(99,102,241,0.10),_rgba(59,130,246,0.06))] px-3 py-1.5 text-xs font-medium text-indigo-700 shadow-[0_8px_18px_rgba(99,102,241,0.12)] dark:border-indigo-400/30 dark:bg-[linear-gradient(135deg,_rgba(99,102,241,0.18),_rgba(59,130,246,0.08))] dark:text-indigo-100">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
          Live sync
        </div>
      </div>
    </header>
  )
}
