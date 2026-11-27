import { Moon, Search, Sun } from "lucide-react";
import { useTheme } from "../../lib/theme";

export function TopBar({ onSearch, username }: { onSearch: () => void; username: string }) {
  const { theme, toggle } = useTheme();
  const mac = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);
  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-bg/95 px-4 py-2.5 backdrop-blur-none md:px-8">
      <button
        onClick={onSearch}
        aria-label="Search and commands"
        className="flex min-h-10 flex-1 items-center gap-2.5 rounded-control border border-line-strong bg-surface px-3 text-left text-sm text-muted hover:bg-surface-2 md:max-w-md"
      >
        <Search aria-hidden size={16} />
        <span className="flex-1">Search…</span>
        <kbd className="hidden rounded border border-line px-1.5 text-xs md:inline">{mac ? "⌘" : "Ctrl"} K</kbd>
      </button>
      <div className="ml-auto flex items-center gap-1">
        <span className="hidden px-2 text-sm text-muted sm:inline">{username}</span>
        <button onClick={toggle} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="flex size-10 items-center justify-center rounded-control hover:bg-surface-2">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
}
