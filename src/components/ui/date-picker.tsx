"use client";

import * as React from "react";
import { format, parseISO, isValid, addDays } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isEn?: boolean;
  id?: string;
}

const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_NAMES_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePicker({
  value,
  onChange,
  placeholder,
  className,
  isEn = false,
  id,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse current value or default to today's date for view
  const selectedDate = React.useMemo(() => {
    if (!value) return null;
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : null;
  }, [value]);

  const [viewDate, setViewDate] = React.useState<Date>(() => {
    return selectedDate || new Date();
  });

  // Keep viewDate in sync when value changes externally
  React.useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [selectedDate]);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const monthNames = isEn ? MONTH_NAMES_EN : MONTH_NAMES_ID;
  const dayNames = isEn ? DAY_NAMES_EN : DAY_NAMES_ID;

  // Navigate months
  const prevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Build calendar matrix
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = React.useMemo(() => {
    const days: {
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      dateStr: string;
    }[] = [];

    // Prev month padding
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, month: m, year: y, isCurrentMonth: false, dateStr });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, month: currentMonth, year: currentYear, isCurrentMonth: true, dateStr });
    }

    // Next month padding to fill up to multiple of 7 (35 or 42)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, month: m, year: y, isCurrentMonth: false, dateStr });
    }

    return days;
  }, [currentYear, currentMonth, daysInMonth, firstDayOfWeek, daysInPrevMonth]);

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    onChange(dateStr);
    setViewDate(today);
    setIsOpen(false);
  };

  const handleSelectTomorrow = () => {
    const tmrw = addDays(new Date(), 1);
    const dateStr = `${tmrw.getFullYear()}-${String(tmrw.getMonth() + 1).padStart(2, "0")}-${String(tmrw.getDate()).padStart(2, "0")}`;
    onChange(dateStr);
    setViewDate(tmrw);
    setIsOpen(false);
  };

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  // Formatted trigger label
  const formattedDisplay = React.useMemo(() => {
    if (!selectedDate) return null;
    const d = selectedDate.getDate();
    const m = monthNames[selectedDate.getMonth()].slice(0, 3);
    const y = selectedDate.getFullYear();
    return `${d} ${m} ${y}`;
  }, [selectedDate, monthNames]);

  const todayStr = React.useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            "w-full h-9 px-3 py-2 text-xs rounded-xl flex items-center justify-between gap-2 border border-slate-200/80 dark:border-[#2b2b2b] bg-slate-50 dark:bg-[#1f1f1f] text-slate-800 dark:text-[#e5e5e5] hover:bg-slate-100/80 dark:hover:bg-[#262626] transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-left font-normal cursor-pointer",
            !value && "text-slate-400 dark:text-[#666]",
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0 truncate">
            <CalendarIcon className="w-3.5 h-3.5 shrink-0 text-slate-500 dark:text-[#888]" />
            <span className="truncate">
              {formattedDisplay || placeholder || (isEn ? "Pick a date" : "Pilih tanggal...")}
            </span>
          </div>

          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === "Enter" && handleClear()}
              className="size-4.5 rounded-md hover:bg-slate-200/80 dark:hover:bg-[#333] flex items-center justify-center shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-[#ccc] transition"
              title={isEn ? "Clear date" : "Hapus tanggal"}
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="z-[150] w-[280px] p-3 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200/90 dark:border-white/[0.08] shadow-2xl text-slate-900 dark:text-[#f5f5f5]"
      >
        {/* Month & Year Navigation Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-white/[0.06]">
          <span className="text-xs font-semibold text-slate-800 dark:text-[#f1f1f1]">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="size-6 rounded-lg flex items-center justify-center text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
              title={isEn ? "Previous Month" : "Bulan Sebelumnya"}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="size-6 rounded-lg flex items-center justify-center text-slate-600 dark:text-[#a3a3a3] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition cursor-pointer"
              title={isEn ? "Next Month" : "Bulan Berikutnya"}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {dayNames.map((dn, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium text-slate-400 dark:text-[#777]"
            >
              {dn}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarDays.map((item, idx) => {
            const isSelected = value === item.dateStr;
            const isToday = item.dateStr === todayStr;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDay(item.dateStr)}
                className={cn(
                  "size-8 text-xs rounded-xl flex items-center justify-center transition cursor-pointer font-medium select-none",
                  !item.isCurrentMonth && "text-slate-300 dark:text-[#444] opacity-50",
                  item.isCurrentMonth && "text-slate-700 dark:text-[#e5e5e5] hover:bg-slate-100 dark:hover:bg-white/[0.08]",
                  isToday && !isSelected && "border border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-bold",
                  isSelected && "bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs scale-105"
                )}
              >
                {item.day}
              </button>
            );
          })}
        </div>

        {/* Quick Presets & Clear Actions */}
        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-white/[0.06] text-[11px]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSelectToday}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-[#bbb] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-white/[0.1] transition cursor-pointer font-medium"
            >
              {isEn ? "Today" : "Hari Ini"}
            </button>
            <button
              type="button"
              onClick={handleSelectTomorrow}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-[#bbb] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-white/[0.1] transition cursor-pointer font-medium"
            >
              {isEn ? "Tomorrow" : "Besok"}
            </button>
          </div>

          {value && (
            <button
              type="button"
              onClick={() => handleClear()}
              className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-medium"
            >
              {isEn ? "Clear" : "Hapus"}
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
