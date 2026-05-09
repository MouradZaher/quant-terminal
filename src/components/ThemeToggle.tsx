"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 border terminal-border hover:bg-foreground hover:text-background transition-colors flex items-center gap-2 text-xs uppercase tracking-widest"
    >
      {theme === "dark" ? (
        <>
          <Sun size={14} />
          <span>Institutional Mode</span>
        </>
      ) : (
        <>
          <Moon size={14} />
          <span>Hacker Mode</span>
        </>
      )}
    </button>
  );
}
