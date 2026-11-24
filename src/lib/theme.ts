"use client";

import { useEffect, useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark";

const themeListeners = new Set<() => void>();

export function applyThemeToDocument(nextTheme: ThemeMode) {
  const root = document.documentElement;
  root.setAttribute("data-theme", nextTheme);
  root.classList.toggle("dark", nextTheme === "dark");
  root.style.colorScheme = nextTheme;
}

function subscribeTheme(onStoreChange: () => void) {
  themeListeners.add(onStoreChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === "cm-theme") onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    themeListeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getThemeSnapshot(): ThemeMode {
  return window.localStorage.getItem("cm-theme") === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): ThemeMode {
  return "light";
}

export function useThemeMode() {
  const theme = useSyncExternalStore<ThemeMode>(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const toggleTheme = () => {
    const current = getThemeSnapshot();
    const next: ThemeMode = current === "light" ? "dark" : "light";
    window.localStorage.setItem("cm-theme", next);
    applyThemeToDocument(next);
    themeListeners.forEach((listener) => listener());
  };

  return { theme, toggleTheme };
}
