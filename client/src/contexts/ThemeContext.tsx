import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  setTheme?: (theme: Theme) => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
  initialTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
  initialTheme,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Use initialTheme if provided (from database), otherwise use localStorage or defaultTheme
    if (initialTheme) {
      return initialTheme;
    }
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  const toggleTheme = switchable
    ? () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  const setThemeExposed = switchable ? setTheme : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeExposed, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export function useSetTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useSetTheme must be used within ThemeProvider");
  }
  return context.setTheme;
}
