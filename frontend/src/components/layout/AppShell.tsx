import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav, Drawer } from "./MobileNav";
import { CommandPalette } from "./CommandPalette";

function loadCollapsed() {
  try { return localStorage.getItem("atlas-sidebar") === "collapsed"; } catch { return false; }
}

export function AppShell({ username, onSignOut }: { username: string; onSignOut: () => void }) {
  const [collapsed, setCollapsed] = useState(loadCollapsed);
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);

  const toggleSidebar = () => setCollapsed((c) => {
    try { localStorage.setItem("atlas-sidebar", c ? "open" : "collapsed"); } catch { /* ignore */ }
    return !c;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeDrawer = useCallback(() => setDrawer(false), []);
  const closePalette = useCallback(() => setPalette(false), []);

  return (
    <div className="flex min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-control focus:bg-surface focus:px-3 focus:py-2">Skip to content</a>
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <div className="min-w-0 flex-1">
        <TopBar username={username} onSearch={() => setPalette(true)} />
        <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">
          <Outlet />
        </main>
      </div>
      <BottomNav onMore={() => setDrawer(true)} />
      <Drawer open={drawer} onClose={closeDrawer} />
      <CommandPalette open={palette} onClose={closePalette} onSignOut={onSignOut} />
    </div>
  );
}
