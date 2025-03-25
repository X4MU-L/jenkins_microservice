import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const getSystemTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Define storage configuration
const storage = {
  getItem: (name: string) => {
    try {
      const str = localStorage.getItem(name);
      if (!str) return null;
      return JSON.parse(str);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: unknown) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      systemTheme: getSystemTheme(),
      resolvedTheme: getSystemTheme(),
      setTheme: (theme) => {
        set({ theme });

        // Update resolved theme
        if (theme === "system") {
          set({ resolvedTheme: get().systemTheme });
        } else {
          set({ resolvedTheme: theme });
        }

        // Apply theme to document
        if (typeof document !== "undefined") {
          const resolvedTheme = theme === "system" ? get().systemTheme : theme;

          if (resolvedTheme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      },
    }),
    {
      name: "url-shortener-theme",
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme on rehydration
          const resolvedTheme =
            state.theme === "system" ? getSystemTheme() : state.theme;
          state.resolvedTheme = resolvedTheme;

          if (typeof document !== "undefined") {
            if (resolvedTheme === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
        }
      },
    }
  )
);

// Add theme change listener
if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      const isDark = e.matches;
      const themeStore = useThemeStore.getState();

      // Update system theme
      themeStore.systemTheme = isDark ? "dark" : "light";

      // If using system theme, update resolved theme and apply it
      if (themeStore.theme === "system") {
        themeStore.resolvedTheme = themeStore.systemTheme;

        if (isDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    });
}
