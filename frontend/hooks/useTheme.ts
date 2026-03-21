"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const THEME_KEY = "theme";

function isValidTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    const initial: Theme = isValidTheme(saved) ? saved : "light";

    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      document.documentElement.dataset.theme = next;
      return next;
    });
  }

  return {
    theme,
    toggleTheme,
  };
}