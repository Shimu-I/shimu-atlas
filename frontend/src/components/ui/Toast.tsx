import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { X } from "lucide-react";

interface ToastItem { id: number; message: string; tone: "info" | "error" }
const Ctx = createContext<(message: string, tone?: ToastItem["tone"]) => void>(() => {});
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const dismiss = (id: number) => setItems((l) => l.filter((t) => t.id !== id));

  const push = useCallback((message: string, tone: ToastItem["tone"] = "info") => {
    const id = nextId++;
    setItems((l) => [...l, { id, message, tone }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 5000);
  }, []);

  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6">
        {items.map((t) => (
          <div key={t.id} role={t.tone === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex max-w-sm items-start gap-3 rounded-panel border bg-surface px-4 py-3 text-sm shadow-md ${t.tone === "error" ? "border-danger" : "border-line"}`}>
            <span className="flex-1">{t.message}</span>
            <button aria-label="Dismiss notification" onClick={() => dismiss(t.id)} className="text-muted hover:text-fg"><X size={16} /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
