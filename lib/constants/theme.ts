/**
 * Theme configuration constants
 * Single source of truth for theme-related values
 */

export const THEME_VALUES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export type Theme = (typeof THEME_VALUES)[keyof typeof THEME_VALUES];

export const DEFAULT_THEME: Theme = THEME_VALUES.DARK;

/**
 * Resolves the effective theme based on system preference
 * @param theme - The theme setting (light, dark, or system)
 * @returns The resolved theme (light or dark)
 */
export function getEffectiveTheme(theme: Theme): "light" | "dark" {
  if (theme === THEME_VALUES.SYSTEM) {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? THEME_VALUES.DARK
        : THEME_VALUES.LIGHT;
    }
    return THEME_VALUES.DARK; // Server-side default
  }
  return theme as "light" | "dark";
}
