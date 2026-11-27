import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { BrandIcon } from "../../lib/nav";
import { NavList } from "./NavList";

export function Brand({ showText }: { showText: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-3">
      <BrandIcon aria-hidden size={22} className="shrink-0 text-accent-text" />
      {showText && (
        <div className="leading-tight">
          <div className="font-serif text-lg font-semibold">Shimu Atlas</div>
        </div>
      )}
    </div>
  );
}

/** Desktop/tablet sidebar. Tablet width shows an icon rail; wide screens show labels unless collapsed. */
export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const wide = collapsed ? "w-16" : "w-16 lg:w-64";
  return (
    <aside className={`sticky top-0 hidden h-dvh shrink-0 flex-col gap-6 overflow-y-auto border-r border-line bg-sidebar py-5 md:flex ${wide}`}>
      <div className={collapsed ? "hidden" : "hidden lg:block"}><Brand showText /></div>
      <div className={collapsed ? "px-3" : "px-3 lg:hidden"}><Brand showText={false} /></div>
      <div className="flex-1 px-2"><NavList labels={collapsed ? "never" : "wide"} /></div>
      <div className="hidden px-2 lg:block">
        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex min-h-10 w-full items-center gap-3 rounded-control px-3 text-sm text-muted hover:bg-surface-2 hover:text-fg"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
