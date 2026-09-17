"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowUpRight, BookOpenText, CheckCheck, Sparkles, Target } from "lucide-react"

const stats = [
  {
    label: "Tugas selesai",
    value: "128",
    delta: "+18%",
    detail: "Dibanding minggu lalu",
    icon: CheckCheck,
    tint: "from-indigo-500/15 via-violet-500/5 to-transparent",
    badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200",
  },
  {
    label: "AI insight",
    value: "96",
    delta: "+12%",
    detail: "Jawaban relevan",
    icon: Sparkles,
    tint: "from-sky-500/15 via-cyan-500/5 to-transparent",
    badge: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200",
  },
  {
    label: "Catatan dibuat",
    value: "42",
    delta: "+9%",
    detail: "Ringkasan materi",
    icon: BookOpenText,
    tint: "from-violet-500/15 via-fuchsia-500/5 to-transparent",
    badge: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200",
  },
  {
    label: "Target minggu",
    value: "86%",
    delta: "+4.5%",
    detail: "Progress belajar",
    icon: Target,
    tint: "from-emerald-500/15 via-teal-500/5 to-transparent",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
]

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-2 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {stats.map(({ label, value, delta, detail, icon: Icon, tint, badge }) => (
        <Card
          key={label}
          className={`group relative @container/card overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(250,250,255,0.88))] shadow-[0_18px_38px_rgba(79,70,229,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_56px_rgba(79,70,229,0.12)] dark:border-indigo-500/10 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(17,24,39,0.9))] dark:shadow-[0_18px_38px_rgba(15,23,42,0.52)]`}
        >
          <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-r ${tint}`} />
          <CardHeader className="relative pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardDescription className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {label}
                </CardDescription>
                <CardTitle className="mt-3 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50 @[250px]/card:text-3xl">
                  {value}
                </CardTitle>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(255,255,255,0.9),_rgba(224,231,255,0.86))] text-slate-700 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.2)] dark:bg-[linear-gradient(135deg,_rgba(30,41,59,0.95),_rgba(51,65,85,0.82))] dark:text-slate-200">
                <Icon className="size-5" />
              </div>
            </div>
            <CardAction>
              <Badge className={`${badge} rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold`}>
                <ArrowUpRight className="mr-1 size-3.5" />
                {delta}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="relative flex-col items-start gap-1.5 border-t border-slate-200/90 pt-3 text-sm dark:border-white/10">
            <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
              {detail}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Update real-time</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
