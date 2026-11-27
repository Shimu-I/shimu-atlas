import { NavLink } from "react-router-dom";
import { GROUPS, NAV } from "../../lib/nav";

/** Shared by the desktop sidebar and the mobile drawer. `labels` controls text visibility. */
export function NavList({ labels, onNavigate }: { labels: "always" | "wide" | "never"; onNavigate?: () => void }) {
  const labelClass = labels === "always" ? "" : labels === "wide" ? "hidden lg:inline" : "sr-only";
  return (
    <nav aria-label="Main" className="flex flex-col gap-5">
      {GROUPS.map((g) => (
        <div key={g}>
          <h2 className={`mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted ${labelClass}`}>{g}</h2>
          <ul className="flex flex-col gap-0.5">
            {NAV.filter((n) => n.group === g).map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  onClick={onNavigate}
                  title={label}
                  className={({ isActive }) =>
                    `flex min-h-10 items-center gap-3 rounded-control px-3 text-sm ${
                      isActive ? "bg-surface font-medium text-accent-text shadow-[inset_2px_0_0_var(--accent)]" : "text-fg hover:bg-surface-2"
                    }`}
                >
                  <Icon aria-hidden size={18} className="shrink-0" />
                  <span className={labelClass}>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
