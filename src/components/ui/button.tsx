import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[10px] border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:focus-visible:ring-[#818cf8]/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 dark:bg-[#f5f5f5] dark:text-[#0c0c0c] dark:hover:bg-white",
        outline:
          "border-slate-200 bg-white text-slate-800 shadow-xs hover:bg-slate-100 hover:text-slate-900 dark:border-[#2b2b2b] dark:bg-[#141414] dark:text-[#f5f5f5] dark:hover:bg-[#1f1f1f] dark:hover:border-[#3b3b3b]",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-[#161616] dark:text-[#f5f5f5] dark:border dark:border-[#2b2b2b] dark:hover:bg-[#1f1f1f]",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-[#a3a3a3] dark:hover:bg-[#161616] dark:hover:text-[#f5f5f5]",
        destructive:
          "bg-rose-600 text-white shadow-xs hover:bg-rose-700 dark:bg-rose-950/60 dark:text-rose-200 dark:border dark:border-rose-900/60 dark:hover:bg-rose-900/60 dark:hover:text-rose-100",
        link: "text-indigo-600 dark:text-[#818cf8] underline-offset-4 hover:underline p-0 h-auto",
        primarySubtle:
          "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100/80 dark:bg-[#141414] dark:text-[#a5b4fc] dark:border-[#2b2b2b] dark:hover:bg-[#1f1f1f] dark:hover:text-[#f5f5f5]",
        emerald:
          "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border dark:border-emerald-900/60 dark:hover:bg-emerald-900/60 dark:hover:text-emerald-100",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[8px] px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[8px] px-2.5 text-xs",
        lg: "h-11 gap-1.5 rounded-[12px] px-5 text-sm font-bold",
        icon: "size-9 rounded-[10px]",
        iconSm: "size-8 rounded-[8px]",
        iconXs: "size-6 rounded-[6px] [&_svg:not([class*='size-'])]:size-3",
        "icon-xs": "size-6 rounded-[6px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-[8px]",
        "icon-lg": "size-10 rounded-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
