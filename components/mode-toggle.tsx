"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function CustomThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative inline-flex border h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 focus-visible:ring-blue-500"
      role="switch"
      aria-checked={theme === "dark"}
    >
      <span className="sr-only">Toggle dark mode</span>
      <span
        className={`${
          theme === "dark"
            ? "translate-x-6 bg-gray-800"
            : "translate-x-1 bg-white"
        } inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ease-in-out`}
      />
      <Sun className="absolute left-1 z-50 top-1/2 h-3 w-3 -translate-y-1/2 transform text-yellow-500 transition-opacity duration-200 ease-in-out dark:opacity-0" />
      <Moon className="absolute right-1 z-50 top-1/2 h-3 w-3 -translate-y-1/2 transform text-blue-500 transition-opacity duration-200 ease-in-out opacity-0 dark:opacity-100" />
      <span
        className={`${
          theme === "dark" ? "bg-gray-900" : "bg-gray-200"
        } absolute inset-0 rounded-full transition-colors duration-200 ease-in-out`}
      />
    </button>
  );
}
