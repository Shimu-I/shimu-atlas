import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon, title, children, action,
}: { icon?: LucideIcon; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-panel border border-dashed border-line-strong px-6 py-10 text-center">
      {Icon && <Icon aria-hidden className="mx-auto mb-3 text-accent-text" size={24} />}
      <h2 className="text-base font-semibold">{title}</h2>
      {children && <p className="mx-auto mt-1.5 max-w-prose text-sm text-muted">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
