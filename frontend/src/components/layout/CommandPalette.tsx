import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CornerDownLeft, LogOut, Moon, Sun, type LucideIcon } from "lucide-react";
import { Dialog } from "../ui/Dialog";
import { NAV } from "../../lib/nav";
import { useTheme } from "../../lib/theme";

interface Command { id: string; label: string; hint: string; icon: LucideIcon; run: () => void }

/** Ctrl/Cmd+K. Only lists commands that work today; note and book search arrive with those modules. */
export function CommandPalette({ open, onClose, onSignOut }: { open: boolean; onClose: () => void; onSignOut: () => void }) {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(() => [
    ...NAV.map((n) => ({ id: n.to, label: n.label, hint: "Go to", icon: n.icon, run: () => navigate(n.to) })),
    { id: "theme", label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme", hint: "Appearance", icon: theme === "dark" ? Sun : Moon, run: toggle },
    { id: "signout", label: "Sign out", hint: "Account", icon: LogOut, run: onSignOut },
  ], [navigate, theme, toggle, onSignOut]);

  const results = commands.filter((c) => c.label.toLowerCase().includes(query.trim().toLowerCase()));
  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => {
    if (open) { setQuery(""); inputRef.current?.focus(); }
  }, [open]);

  const choose = (c: Command | undefined) => { if (c) { onClose(); c.run(); } };

  return (
    <Dialog open={open} onClose={onClose} title="Command palette">
      <div className="p-3">
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
          aria-label="Type a command or page name"
          placeholder="Go to a page or run a command…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === "Enter") { e.preventDefault(); choose(results[active]); }
          }}
          className="min-h-11 w-full rounded-control border border-line-strong bg-bg px-3 text-sm"
        />
        <ul id="palette-list" role="listbox" aria-label="Commands" className="mt-2 max-h-72 overflow-y-auto">
          {results.map((c, i) => (
            <li key={c.id} id={`cmd-${c.id}`} role="option" aria-selected={i === active}
              onMouseMove={() => setActive(i)} onClick={() => choose(c)}
              className={`flex min-h-10 cursor-pointer items-center gap-3 rounded-control px-3 text-sm ${i === active ? "bg-surface-2" : ""}`}>
              <c.icon aria-hidden size={16} className="text-accent-text" />
              <span className="flex-1">{c.label}</span>
              <span className="text-xs text-muted">{c.hint}</span>
              {i === active && <CornerDownLeft aria-hidden size={14} className="text-muted" />}
            </li>
          ))}
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No matching commands.</li>}
        </ul>
      </div>
    </Dialog>
  );
}
