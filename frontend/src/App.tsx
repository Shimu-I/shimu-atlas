import { useCallback, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { api, ApiError } from "./lib/api";
import { NAV } from "./lib/nav";
import { AppShell } from "./components/layout/AppShell";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { LibraryPage } from "./pages/Library";
import { SettingsPage } from "./pages/Settings";
import { Stub } from "./pages/Stub";

type Auth = { state: "loading" } | { state: "setup" } | { state: "login" } | { state: "in"; username: string } | { state: "offline" };

export default function App() {
  const [auth, setAuth] = useState<Auth>({ state: "loading" });

  const refresh = useCallback(async () => {
    try {
      const me = await api<{ username: string }>("/api/auth/me");
      setAuth({ state: "in", username: me.username });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        const s = await api<{ setup_required: boolean }>("/api/auth/status").catch(() => null);
        setAuth(s ? { state: s.setup_required ? "setup" : "login" } : { state: "offline" });
      } else setAuth({ state: "offline" });
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const signOut = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setAuth({ state: "login" });
  }, []);

  if (auth.state === "loading") return <div role="status" className="p-8 text-muted">Loading…</div>;
  if (auth.state === "offline")
    return <main className="p-8"><h1 className="font-serif text-xl">Cannot reach the server</h1>
      <p className="mt-2 text-muted">Start the backend (<code>uvicorn backend.main:app</code>) and reload this page.</p></main>;
  if (auth.state === "setup" || auth.state === "login") return <AuthPage setup={auth.state === "setup"} onDone={refresh} />;

  return (
    <Routes>
      <Route element={<AppShell username={auth.username} onSignOut={signOut} />}>
        <Route index element={<Dashboard />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="settings" element={<SettingsPage onSignOut={signOut} />} />
        {NAV.filter((n) => !["/", "/library", "/settings"].includes(n.to)).map((n) => (
          <Route key={n.to} path={n.to.slice(1)} element={<Stub />} />
        ))}
        <Route path="*" element={<Stub />} />
      </Route>
    </Routes>
  );
}
