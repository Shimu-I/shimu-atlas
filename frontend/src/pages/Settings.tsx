import { useEffect, useState } from "react";
import { PageHeader, Section } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { useTheme } from "../lib/theme";
import { api } from "../lib/api";

interface Health { status: string; version: string; database: string; ai: string }

export function SettingsPage({ onSignOut }: { onSignOut: () => void }) {
  const { theme, toggle } = useTheme();
  const [health, setHealth] = useState<Health | "error" | null>(null);
  useEffect(() => { api<Health>("/api/health").then(setHealth).catch(() => setHealth("error")); }, []);

  return (
    <>
      <PageHeader title="Settings" crumbs={[{ label: "Atlas", to: "/" }, { label: "Settings" }]} />
      <Section title="Appearance">
        <div className="flex items-center justify-between rounded-panel border border-line bg-surface p-4">
          <div><div className="font-medium">Theme</div><div className="text-sm text-muted">Currently {theme}.</div></div>
          <Button onClick={toggle}>Switch to {theme === "dark" ? "light" : "dark"}</Button>
        </div>
      </Section>
      <Section title="System status">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-panel border border-line bg-surface p-4 text-sm">
          {health === null && <dd className="col-span-2 text-muted">Checking…</dd>}
          {health === "error" && <dd className="col-span-2 text-danger">Backend not reachable.</dd>}
          {health && health !== "error" && (<>
            <dt className="text-muted">Server</dt><dd>{health.status}</dd>
            <dt className="text-muted">Version</dt><dd>{health.version}</dd>
            <dt className="text-muted">Database</dt><dd>{health.database}</dd>
            <dt className="text-muted">AI assistant</dt><dd>{health.ai.replace("_", " ")}</dd>
          </>)}
        </dl>
      </Section>
      <Section title="Account">
        <Button variant="danger" onClick={onSignOut}>Sign out</Button>
      </Section>
    </>
  );
}
