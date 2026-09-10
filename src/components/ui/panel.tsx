"use client";
import React from "react";
import { DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PageDialogProps {
  pageMode?: boolean;
  className?: string;
  pageClassName?: string;
  children: React.ReactNode;
}

export const PageDialog: React.FC<PageDialogProps> = ({
  pageMode = false,
  className,
  pageClassName = "flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161616]",
  children,
}) => {
  if (pageMode) {
    return <div className={cn(pageClassName)}>{children}</div>;
  }
  return <DialogContent className={cn(className)}>{children}</DialogContent>;
};