import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface Crumb { label: string; to?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight aria-hidden size={14} />}
            {c.to && i < items.length - 1
              ? <Link to={c.to} className="hover:text-fg hover:underline">{c.label}</Link>
              : <span aria-current={i === items.length - 1 ? "page" : undefined}>{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title, subtitle, crumbs, actions,
}: { title: string; subtitle?: string; crumbs?: Crumb[]; actions?: ReactNode }) {
  return (
    <header className="mb-8 border-b border-line pb-5">
      {crumbs && <Breadcrumbs items={crumbs} />}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-heading md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-prose text-muted">{subtitle}</p>}
        </div>
        {actions}
      </div>
    </header>
  );
}

/** Titled block used for dashboard sections; the heading gives screen readers structure. */
export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
        {hint && <span className="text-sm text-muted">{hint}</span>}
      </div>
      {children}
    </section>
  );
}
