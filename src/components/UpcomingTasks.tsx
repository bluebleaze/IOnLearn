"use client";
import React from "react";
import { CalendarClock, ChevronRight, CheckCircle2 } from "lucide-react";
import { TodoTask } from "../types";
import { cn } from "@/lib/utils";

interface UpcomingTasksProps {
  tasks: TodoTask[];
  onOpenDetails: (task: TodoTask) => void;
  onToggleComplete: (taskId: string) => void;
}

function formatDue(ts: number) {
  const diff = ts - Date.now();
  const minutes = Math.round(diff / 60000);
  if (diff < 0) return "Terlambat";
  if (minutes < 60) return `${minutes} mnt lagi`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lagi`;
  const due = new Date(ts);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const dayDiff = Math.round((dueStart - today.getTime()) / 86400000);
  if (dayDiff === 0) return "Hari ini";
  if (dayDiff === 1) return "Besok";
  return due.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export const UpcomingTasks: React.FC<UpcomingTasksProps> = ({
  tasks,
  onOpenDetails,
  onToggleComplete,
}) => {
  const upcoming = tasks
    .filter((t) => !t.isCompleted)
    .sort((a, b) => {
      if (!a.dueTimestamp && !b.dueTimestamp) return 0;
      if (!a.dueTimestamp) return 1;
      if (!b.dueTimestamp) return -1;
      return a.dueTimestamp - b.dueTimestamp;
    })
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-[#161616] rounded-2xl shadow-xs p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <CalendarClock className="w-4 h-4 text-slate-400 dark:text-[#737373]" />
        <h3 className="text-xs font-bold text-slate-900 dark:text-[#f5f5f5] font-heading">
          Tugas Terdekat
        </h3>
        {upcoming.length > 0 && (
          <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#141414] text-slate-600 dark:text-[#a3a3a3]">
            {upcoming.length} tersisa
          </span>
        )}
      </div>

      {upcoming.length === 0 ? (
        <div className="py-6 text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-[#34d399] mx-auto mb-1.5" />
          <p className="text-xs text-slate-500 dark:text-[#737373]">
            Tidak ada tugas aktif.
          </p>
          <p className="text-xs text-slate-400 dark:text-[#737373] mt-0.5">
            Semua beres untuk saat ini.
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          {upcoming.map((task) => {
            const overdue = task.dueTimestamp
              ? task.dueTimestamp < Date.now()
              : false;
            return (
              <li
                key={task.id}
                className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-slate-50 dark:hover:bg-[#141414] transition group"
              >
                <button
                  onClick={() => onToggleComplete(task.id)}
                  className="w-4 h-4 shrink-0 rounded-[5px] bg-slate-100 hover:bg-indigo-50 dark:bg-[#1f1f1f] dark:hover:bg-[#252530] transition cursor-pointer"
                  title={`Tandai "${task.title}" selesai`}
                  aria-label={`Tandai ${task.title} selesai`}
                />
                <button
                  onClick={() => onOpenDetails(task)}
                  className="flex-1 min-w-0 text-left flex items-center gap-1 cursor-pointer"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-medium text-slate-800 dark:text-[#f5f5f5] truncate">
                      {task.title}
                    </span>
                    <span
                      className={cn(
                        "block text-xs truncate",
                        overdue
                          ? "text-rose-600 dark:text-[#f87171] font-semibold"
                          : "text-slate-500 dark:text-[#737373]"
                      )}
                    >
                      {task.courseName} · {task.dueTimestamp ? formatDue(task.dueTimestamp) : "Tanpa batas waktu"}
                    </span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};