"use client";
/** Primitivas de formulario del sitio público (MASTER: label visible, error junto al campo, foco visible). */
import type { ReactNode } from "react";

export const inputCls =
  "w-full min-h-[44px] rounded-lg border border-line bg-card px-3.5 py-2.5 text-base text-foreground " +
  "placeholder:text-muted-foreground/70 transition-colors duration-150 hover:border-secondary " +
  "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent aria-[invalid=true]:border-destructive";

export function FormField({
  id, label, required, hint, error, children,
}: { id: string; label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-foreground">
        {label}
        {required ? <span className="text-destructive" aria-hidden="true"> *</span> : <span className="font-normal text-muted-foreground"> (opcional)</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 flex items-start gap-1.5 text-sm font-medium text-destructive">
          <i className="fa-solid fa-circle-exclamation mt-0.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, hint?: string, error?: string) {
  return error ? `${id}-err` : hint ? `${id}-hint` : undefined;
}

export function Alert({ kind, children }: { kind: "error" | "warning" | "success" | "info"; children: ReactNode }) {
  const m = {
    error: ["border-destructive/30 bg-destructive/5 text-destructive", "fa-circle-exclamation"],
    warning: ["border-warning/30 bg-warning/5 text-warning", "fa-triangle-exclamation"],
    success: ["border-success/30 bg-success/5 text-success", "fa-circle-check"],
    info: ["border-accent/30 bg-accent-soft text-accent-hover", "fa-circle-info"],
  }[kind];
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`flex items-start gap-2.5 rounded-lg border p-3.5 text-sm font-medium ${m[0]}`}>
      <i className={`fa-solid ${m[1]} mt-0.5`} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function Spinner() {
  return <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />;
}

export const btnPrimary =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-base font-semibold text-white " +
  "transition-colors duration-150 hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-60";
export const btnOutline =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-primary bg-card px-5 py-2.5 text-base font-semibold text-primary " +
  "transition-colors duration-150 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-60";
