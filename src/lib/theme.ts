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

let isTransitioning = false;

/**
 * Toggles theme with an authored circular clip-path reveal animation.
 * Originates from the trigger button's center or the click coordinates.
 * Staged sequence:
 * 1. Navbar softly fades from frosted glass to solid (180ms)
 * 2. Circular reveal wave animates across the page & solid navbar (950ms)
 * 3. Navbar softly fades back from solid to frosted glass
 */
export function toggleThemeWithCircularAnimation(
  event?: React.MouseEvent | { clientX: number; clientY: number },
  onThemeApplied?: (theme: Theme) => void
): Theme {
  if (typeof window === "undefined" || typeof document === "undefined") return "light";

  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  const nextTheme: Theme = isDark ? "light" : "dark";

  if (isTransitioning) return nextTheme;

  // Check if View Transitions API is available and user doesn't prefer reduced motion
  const supportsViewTransition =
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!supportsViewTransition) {
    applyTheme(nextTheme);
    onThemeApplied?.(nextTheme);
    return nextTheme;
  }

  isTransitioning = true;

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

  // Block scrolling interactions during transition
  const preventScroll = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const preventKeys = (e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Space", "Home", "End"].includes(e.code)) {
      e.preventDefault();
    }
  };

  window.addEventListener("wheel", preventScroll, { passive: false, capture: true });
  window.addEventListener("touchmove", preventScroll, { passive: false, capture: true });
  window.addEventListener("keydown", preventKeys, { capture: true });
  window.dispatchEvent(new CustomEvent("theme-transition-start"));

  // Phase 1: Softly fade navbar from frosted glass to solid
  root.classList.add("theme-solid-nav");

  // Phase 2: Start circular reveal after navbar has smoothly faded to solid
  setTimeout(() => {
    root.style.setProperty("--theme-x", `${x}px`);
    root.style.setProperty("--theme-y", `${y}px`);
    root.style.setProperty("--theme-radius", `${endRadius}px`);
    root.classList.add("theme-transitioning");

    const transition = document.startViewTransition(() => {
      applyTheme(nextTheme);
      onThemeApplied?.(nextTheme);
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
          duration: 950,
          easing: "cubic-bezier(1, .36, .52, 1.03)",
          fill: "forwards",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });

    transition.finished.finally(() => {
      // Phase 3: Remove transition freeze, then softly fade back to frosted glass
      root.classList.remove("theme-transitioning");
      root.style.removeProperty("--theme-x");
      root.style.removeProperty("--theme-y");
      root.style.removeProperty("--theme-radius");
      window.removeEventListener("wheel", preventScroll, { capture: true });
      window.removeEventListener("touchmove", preventScroll, { capture: true });
      window.removeEventListener("keydown", preventKeys, { capture: true });
      window.dispatchEvent(new CustomEvent("theme-transition-end"));

      // Softly fade from solid back to frosted glass in next frame
      requestAnimationFrame(() => {
        root.classList.remove("theme-solid-nav");
        isTransitioning = false;
      });
    });
  }, 180);

  return nextTheme;
}
