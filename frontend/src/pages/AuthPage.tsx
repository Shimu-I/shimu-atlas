import { useState, type FormEvent } from "react";
import { BrandIcon } from "../lib/nav";
import { api, ApiError } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function AuthPage({ setup, onDone }: { setup: boolean; onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const mismatch = setup && confirm !== "" && confirm !== password;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (setup && password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true); setError("");
    try {
      await api(setup ? "/api/auth/setup" : "/api/auth/login", { method: "POST", json: { username, password } });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError
        ? (err.status === 422 ? "Username needs 3+ characters and password 10+ characters." : err.message)
        : "Could not reach the server. Is the backend running?");
    } finally { setBusy(false); }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-panel border border-line bg-surface p-6">
        <BrandIcon aria-hidden className="mb-3 text-accent-text" size={26} />
        <h1 className="font-serif text-2xl font-semibold">Shimu Atlas</h1>
        <p className="mb-5 mt-1 text-sm text-muted">
          {setup ? "Create your owner account. This is the only account and can be made once." : "Sign in to your library."}
        </p>
        <div className="flex flex-col gap-4">
          <Input label="Username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input label="Password" type="password" autoComplete={setup ? "new-password" : "current-password"}
            hint={setup ? "At least 10 characters." : undefined}
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          {setup && <Input label="Confirm password" type="password" autoComplete="new-password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} error={mismatch ? "Passwords do not match." : undefined} required />}
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" variant="primary" disabled={busy}>{busy ? "Please wait…" : setup ? "Create account" : "Sign in"}</Button>
        </div>
      </form>
    </main>
  );
}
