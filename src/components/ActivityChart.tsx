"use client";
import React, { Fragment } from "react";
import { BarChart3 } from "lucide-react";
import { TodoTask } from "../types";

interface ActivityChartProps {
  tasks: TodoTask[];
}

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export const ActivityChart: React.FC<ActivityChartProps> = ({ tasks }) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return {
      key: d.toDateString(),
      label: DAY_NAMES[d.getDay()],
      created: 0,
      completed: 0,
      isToday: i === 6,
    };
  });

  tasks.forEach((t) => {
    const buckets: [keyof TodoTask, "created" | "completed"][] = [
      ["createdAt", "created"],
      ["completedAt", "completed"],
    ];
    for (const [field, bucket] of buckets) {
      const value = t[field] as string | undefined;
      if (!value) continue;
      const day = days.find((x) => x.key === new Date(value).toDateString());
      if (day) day[bucket]++;
    }
  });

  const totalActivity = days.reduce((s, d) => s + d.created + d.completed, 0);
  const max = Math.max(1, ...days.map((d) => Math.max(d.created, d.completed)));

  return (
    <div className="bg-white dark:bg-[#161616] rounded-2xl shadow-xs p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-400 dark:text-[#737373]" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-[#f5f5f5] font-heading">
            Aktivitas 7 Hari
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[#a3a3a3]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-indigo-600 dark:bg-[#818cf8]" />
            Dibuat
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-emerald-600 dark:bg-[#34d399]" />
            Selesai
          </span>
        </div>
      </div>

      {totalActivity === 0 ? (
        <p className="py-8 text-center text-xs text-slate-500 dark:text-[#737373]">
          Belum ada aktivitas minggu ini.
        </p>
      ) : (
        <Fragment>
          <div className="flex items-end gap-1 justify-between h-28 pt-2">
            {days.map((day) => (
              <div
                key={day.key}
                className="flex-1 flex items-end justify-center gap-1 h-full min-w-0"
              >
                <div
                  className="w-2.5 rounded-t-[3px] bg-indigo-500/80 dark:bg-[#818cf8]/80 transition-all duration-500"
                  style={{
                    height: `${Math.max(4, (day.created / max) * 100)}%`,
                  }}
                  title={`${day.created} dibuat — ${day.label}`}
                />
                <div
                  className="w-2.5 rounded-t-[3px] bg-emerald-500/80 dark:bg-[#34d399]/80 transition-all duration-500"
                  style={{
                    height: `${Math.max(4, (day.completed / max) * 100)}%`,
                  }}
                  title={`${day.completed} selesai — ${day.label}`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2.5 px-0.5 text-xs text-slate-400 dark:text-[#737373]">
            {days.map((day) => (
              <span
                key={day.key}
                className={
                  day.isToday
                    ? "text-slate-800 dark:text-[#f5f5f5] font-semibold"
                    : undefined
                }
              >
                {day.label}
              </span>
            ))}
          </div>
        </Fragment>
      )}
    </div>
  );
};