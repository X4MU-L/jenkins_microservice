"use client";

import { Fragment, useEffect } from "react";

import { useThemeStore } from "@/store/theme-store";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, systemTheme, setTheme } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    // Apply the current theme from store
    const currentTheme = theme === "system" ? systemTheme : theme;

    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, systemTheme]);

  return <Fragment>{children}</Fragment>;
}
