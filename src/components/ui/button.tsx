import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9294E8]/30 dark:focus-visible:ring-[#9294E8]/40 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-95 shrink-0 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 dark:bg-[#F1F0EC] dark:text-[#0B0F17] dark:shadow-none dark:hover:bg-white dark:border dark:border-transparent",
        destructive:
          "bg-rose-600 text-white shadow-xs hover:bg-rose-700 dark:bg-rose-950/60 dark:text-rose-200 dark:border dark:border-rose-900/60 dark:hover:bg-rose-900/60 dark:hover:text-rose-100",
        outline:
          "border border-slate-200 bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-900 dark:border-[#252F42] dark:bg-[#121927] dark:text-[#F1F0EC] dark:hover:bg-[#161F30] dark:hover:text-white dark:hover:border-[#34425A]",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-[#161F30] dark:text-[#F1F0EC] dark:border dark:border-[#252F42] dark:hover:bg-[#1C273D] dark:hover:text-white",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-[#9AA6B8] dark:hover:bg-[#161F30] dark:hover:text-[#F1F0EC]",
        link:
          "text-indigo-600 dark:text-[#9294E8] underline-offset-4 hover:underline p-0 h-auto",
        primarySubtle:
          "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100/80 dark:bg-[#161F30] dark:text-[#B0B1F2] dark:border-[#252F42] dark:hover:bg-[#1C273D] dark:hover:text-[#F1F0EC]",
        emerald:
          "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border dark:border-emerald-900/60 dark:hover:bg-emerald-900/60 dark:hover:text-emerald-100",
      },
      size: {
        default: "h-9 px-4 py-2 text-xs sm:text-sm",
        sm: "h-8 rounded-[8px] px-3 text-xs",
        lg: "h-11 rounded-[12px] px-6 text-sm sm:text-base font-bold",
        icon: "h-9 w-9 rounded-[10px]",
        iconSm: "h-8 w-8 rounded-[8px] p-1.5",
        iconXs: "h-7 w-7 rounded-[6px] p-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
