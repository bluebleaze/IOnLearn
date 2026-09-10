"use client";

export type Theme = "light" | "dark";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("theme") as Theme | null;
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
}

/**
 * Toggles theme with an authored circular clip-path reveal animation.
 * Originates from the trigger button's center or the click coordinates.
 */
export function toggleThemeWithCircularAnimation(
  event?: React.MouseEvent | { clientX: number; clientY: number }
): Theme {
  if (typeof window === "undefined" || typeof document === "undefined") return "light";

  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  const nextTheme: Theme = isDark ? "light" : "dark";

  // Check if View Transitions API is available and user doesn't prefer reduced motion
  const supportsViewTransition =
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!supportsViewTransition) {
    applyTheme(nextTheme);
    return nextTheme;
  }

  // Calculate origin coordinates for the circular expansion
  const x = event?.clientX ?? window.innerWidth / 2;
  const y = event?.clientY ?? window.innerHeight / 2;

  // Calculate distance to the farthest corner with safety margin so 1.03 overshoot never exposes corners
  const endRadius = Math.ceil(
    Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )
  ) + 80;

  // Set CSS variables synchronously so that ::view-transition-new(root) is initially clipped to 0px immediately
  root.style.setProperty("--theme-x", `${x}px`);
  root.style.setProperty("--theme-y", `${y}px`);
  root.style.setProperty("--theme-radius", `${endRadius}px`);
  root.classList.add("theme-transitioning");

  const transition = document.startViewTransition(() => {
    applyTheme(nextTheme);
  });

  transition.ready.then(() => {
    root.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 1000,
        easing: "cubic-bezier(1, .36, .52, 1.03)",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  });

  transition.finished.finally(() => {
    root.classList.remove("theme-transitioning");
    root.style.removeProperty("--theme-x");
    root.style.removeProperty("--theme-y");
    root.style.removeProperty("--theme-radius");
  });

  return nextTheme;
}
