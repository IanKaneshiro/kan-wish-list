"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Theme,
  DEFAULT_THEME,
  getEffectiveTheme,
  THEME_VALUES,
} from "@/lib/constants/theme";

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  effectiveTheme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as Theme;
      return saved || DEFAULT_THEME;
    }
    return DEFAULT_THEME;
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const effectiveTheme = getEffectiveTheme(theme);

  // Apply theme to document
  const applyTheme = (themeToApply: Theme) => {
    const root = document.documentElement;
    const resolved = getEffectiveTheme(themeToApply);

    console.log("Applying theme:", {
      themeToApply,
      resolved,
      currentClasses: root.className,
    });

    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    console.log("Theme applied. New classes:", root.className);

    // Always save to localStorage
    localStorage.setItem("theme", themeToApply);
  };

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen to system preference changes when theme is set to "system"
  useEffect(() => {
    if (theme !== THEME_VALUES.SYSTEM) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      // Force re-apply when system preference changes
      applyTheme(theme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Fetch user's theme preference from the API (authenticated users only)
  useEffect(() => {
    if (status === "authenticated" && !isSyncing) {
      const fetchTheme = async () => {
        setIsSyncing(true);
        try {
          const response = await fetch("/api/settings");
          if (response.ok) {
            const data = await response.json();
            const serverTheme = data.settings?.theme;
            const localTheme = localStorage.getItem("theme");

            // Prioritize server theme for authenticated users
            // Only update if server theme exists and differs from current
            if (serverTheme && serverTheme !== theme) {
              setThemeState(serverTheme);
            } else if (!serverTheme && localTheme) {
              // If server has no theme but local does, keep local
              setThemeState(localTheme as Theme);
            }
          }
        } catch (error) {
          console.error("Error fetching theme:", error);
        } finally {
          setIsSyncing(false);
        }
      };

      fetchTheme();
    }
  }, [status]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}
