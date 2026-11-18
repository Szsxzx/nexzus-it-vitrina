/**
 * AdminUI — Componentes de diseño compartidos para el panel de admin.
 * Importar desde aquí para mantener coherencia visual en todas las páginas.
 */
"use client";
import { useEffect, useRef, useState } from "react";

// ─── Page Shell ───────────────────────────────────────────────────────────────

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="p-8 max-w-6xl">{children}</div>;
}

// ─── Page Header ─────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({
  children,
  className = "",
  title,
  icon,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      {title && (
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-50">
          {icon && (
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
              style={{ background: "#7C3AED15", color: "#7C3AED" }}
            >
              <i className={`fa-solid ${icon}`} />
            </span>
          )}
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

export function BtnPrimary({
  children,
  onClick,
  type = "button",
  disabled,
  loading,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 select-none overflow-hidden"
      style={{
        background: isDisabled ? "#C4B5FD" : "#7C3AED",
        boxShadow: isDisabled ? "none" : "0 2px 8px rgba(124,58,237,0.25)",
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          (e.currentTarget as HTMLElement).style.background = "#6D28D9";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(124,58,237,0.35)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          (e.currentTarget as HTMLElement).style.background = "#7C3AED";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(124,58,237,0.25)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }
      }}
    >
      {loading && (
        <svg
          className="animate-spin -ml-0.5 h-3.5 w-3.5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export function BtnSecondary({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 transition-all duration-200 select-none"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#f9f9f9";
        (e.currentTarget as HTMLElement).style.borderColor = "#d0d0d0";
        (e.currentTarget as HTMLElement).style.color = "#333";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.07)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#fff";
        (e.currentTarget as HTMLElement).style.borderColor = "#e5e5e5";
        (e.currentTarget as HTMLElement).style.color = "#4b5563";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {children}
    </button>
  );
}

export function BtnDanger({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 border border-red-100 transition-all duration-150 select-none"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#fee2e2";
        (e.currentTarget as HTMLElement).style.color = "#b91c1c";
        (e.currentTarget as HTMLElement).style.borderColor = "#fca5a5";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#fef2f2";
        (e.currentTarget as HTMLElement).style.color = "#dc2626";
        (e.currentTarget as HTMLElement).style.borderColor = "#fecaca";
      }}
    >
      {children}
    </button>
  );
}

export function BtnGhost({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all duration-150 select-none"
    >
      {children}
    </button>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-gray-100" style={{ background: "#fafaf9" }}>
        {children}
      </tr>
    </thead>
  );
}

export function Th({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-50">{children}</tbody>;
}

export function Tr({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <tr
      className={`transition-all duration-150 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#fafafa";
        const tds = (e.currentTarget as HTMLElement).querySelectorAll("td:first-child");
        tds.forEach((td) => ((td as HTMLElement).style.boxShadow = "inset 3px 0 0 #7C3AED"));
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "";
        const tds = (e.currentTarget as HTMLElement).querySelectorAll("td:first-child");
        tds.forEach((td) => ((td as HTMLElement).style.boxShadow = "none"));
      }}
    >
      {children}
    </tr>
  );
}

export function Td({
  children,
  right,
  muted,
}: {
  children?: React.ReactNode;
  right?: boolean;
  muted?: boolean;
}) {
  return (
    <td
      className={`px-5 py-3.5 transition-all ${right ? "text-right" : ""} ${
        muted ? "text-gray-400" : "text-gray-700"
      }`}
    >
      {children}
    </td>
  );
}

// ─── Form Field ───────────────────────────────────────────────────────────────

export function Field({
  label,
  children,
  required,
  hint,
  full,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "col-span-2" : ""}`}>
      <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
      {hint && <span className="block text-xs text-gray-400 mt-1">{hint}</span>}
    </label>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none transition-all duration-150 placeholder:text-gray-300 focus:border-red-700 focus:ring-2 focus:ring-red-700/10 hover:border-gray-300 bg-white";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} resize-none ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

// ─── PriceInput (formato COP con puntos de miles) ─────────────────────────────

const fmtThousands = (n: number) =>
  n === 0 ? "" : new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n);

export function PriceInput({
  value,
  onChange,
  required,
  placeholder = "0",
}: {
  value: number | undefined;
  onChange: (val: number | undefined) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const [display, setDisplay] = useState(value ? fmtThousands(value) : "");

  // Sincronizar si el valor cambia externamente (ej. al abrir modal con datos)
  useEffect(() => {
    setDisplay(value ? fmtThousands(value) : "");
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\./g, "").replace(/[^\d]/g, "");
    const num = raw === "" ? undefined : Number(raw);
    setDisplay(raw === "" ? "" : fmtThousands(num!));
    onChange(num);
  }

  return (
    <div className="relative">
      <span
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none"
        style={{ color: "#aaa" }}
      >
        $
      </span>
      <input
        type="text"
        inputMode="numeric"
        required={required}
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${inputCls} pl-7`}
      />
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const badgeStyles: Record<string, { bg: string; text: string; dot: string }> = {
  gray:   { bg: "#f3f4f6", text: "#4b5563", dot: "#9ca3af" },
  green:  { bg: "#ecfdf5", text: "#065f46", dot: "#10b981" },
  red:    { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444" },
  blue:   { bg: "#eff6ff", text: "#1e40af", dot: "#3b82f6" },
  amber:  { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b" },
  purple: { bg: "#faf5ff", text: "#6b21a8", dot: "#a855f7" },
};

export function Badge({
  children,
  color = "gray",
  dot,
}: {
  children: React.ReactNode;
  color?: "gray" | "green" | "red" | "blue" | "amber" | "purple";
  dot?: boolean;
}) {
  const s = badgeStyles[color];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.text }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: s.dot }}
        />
      )}
      {children}
    </span>
  );
}

// ─── SavedToast ───────────────────────────────────────────────────────────────

export function SavedToast({ visible }: { visible: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300"
      style={{
        color: "#059669",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(4px) scale(0.97)",
        pointerEvents: "none",
      }}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "#d1fae5" }}
      >
        <i className="fa-solid fa-check text-[10px]" style={{ color: "#059669" }} />
      </span>
      Guardado
    </span>
  );
}

// ─── Error Box ────────────────────────────────────────────────────────────────

export function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm animate-[fadeIn_0.2s_ease]">
      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <i className="fa-solid fa-exclamation text-[10px] text-red-600" />
      </div>
      <span>{message}</span>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

export function EmptyState({ message = "Sin datos" }: { message?: string }) {
  return (
    <div className="py-16 flex flex-col items-center gap-3">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "#f9f9f9", border: "1.5px dashed #e5e5e5" }}
      >
        <i className="fa-solid fa-inbox text-2xl text-gray-200" />
      </div>
      <p className="text-sm text-gray-300 font-medium">{message}</p>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  const [mounted, setMounted]   = useState(false);
  const [visible, setVisible]   = useState(false);
  const overlayRef              = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // pequeño delay para activar la transición de entrada
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{
        background: visible ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(4px)" : "blur(0px)",
        transition: "background 0.25s ease, backdrop-filter 0.25s ease",
      }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className={`bg-white rounded-2xl ${width} w-full max-h-[90vh] overflow-auto shadow-2xl`}
        style={{
          opacity:   visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
          transition: "opacity 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          style={{ background: "linear-gradient(135deg, #0B0712, #1A1030)" }}
        >
          <h2 className="font-heading font-bold text-white text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-5 space-y-4">{children}</div>;
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50">
      {children}
    </div>
  );
}

// ─── SortButtons ─────────────────────────────────────────────────────────────

export function SortButtons({
  onUp,
  onDown,
}: {
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <button
        onClick={onUp}
        className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all text-xs"
        title="Subir"
      >
        <i className="fa-solid fa-chevron-up" />
      </button>
      <button
        onClick={onDown}
        className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all text-xs"
        title="Bajar"
      >
        <i className="fa-solid fa-chevron-down" />
      </button>
    </span>
  );
}

// ─── ColorDot ─────────────────────────────────────────────────────────────────

export function ColorDot({ className }: { className: string }) {
  return <span className={`inline-block w-3 h-3 rounded-full ${className}`} />;
}
