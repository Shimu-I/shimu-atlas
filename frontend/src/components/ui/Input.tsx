import { useId, type InputHTMLAttributes } from "react";

export function Input({
  label, error, hint, className = "", ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="min-h-10 w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-fg placeholder:text-muted"
        {...props}
      />
      {error ? <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-danger">{error}</p>
        : hint ? <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
