import { useTheme } from "../hooks/useTheme";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative bg-white rounded-full px-3 py-2 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors ${className}`}
    >
      {isDark ? (
        <Sun className="size-4 text-amber-400" />
      ) : (
        <Moon className="size-4 text-gray-700" />
      )}
    </button>
  );
}
