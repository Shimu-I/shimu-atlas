import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BOTTOM_NAV, NAV } from "../../lib/nav";
import { Brand } from "./Sidebar";
import { NavList } from "./NavList";

export function BottomNav({ onMore }: { onMore: () => void }) {
  const items = NAV.filter((n) => BOTTOM_NAV.includes(n.to));
  const cls = "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs";
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `${cls} ${isActive ? "font-medium text-accent-text" : "text-muted"}`}>
          <Icon aria-hidden size={20} />{label.replace("My ", "")}
        </NavLink>
      ))}
      <button onClick={onMore} className={`${cls} text-muted`}><Menu aria-hidden size={20} />More</button>
    </nav>
  );
}

/** Slide-in drawer for the full navigation on phones. Native <dialog> gives focus trapping and Esc. */
export function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label="Navigation"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="m-0 h-dvh max-h-none w-[min(85vw,20rem)] max-w-none border-r border-line bg-sidebar p-0 text-fg"
    >
      {open && (
        <div className="flex h-full flex-col gap-6 overflow-y-auto py-5">
          <div className="flex items-center justify-between pr-3">
            <Brand showText />
            <button aria-label="Close navigation" onClick={onClose} className="rounded-control p-2 hover:bg-surface-2"><X size={18} /></button>
          </div>
          <div className="px-2"><NavList labels="always" onNavigate={onClose} /></div>
        </div>
      )}
    </dialog>
  );
}
