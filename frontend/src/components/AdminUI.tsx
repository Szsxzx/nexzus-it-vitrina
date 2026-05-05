/**
 * AdminUI — Componentes de diseño compartidos para el panel de admin.
 * Importar desde aquí para mantener coherencia visual en todas las páginas.
 */

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
        <h1 className="text-2xl font-serif font-bold text-gray-900">{title}</h1>
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
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-50">
          {icon && (
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs" style={{ background: "#8B0000" + "18", color: "#8B0000" }}>
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
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
      style={{ background: "#8B0000" }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.background = "#a50000"; }}
      onMouseLeave={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.background = "#8B0000"; }}
    >
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
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all"
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
      className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
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
      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
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
    <th className={`px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 ${right ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-50">{children}</tbody>;
}

export function Tr({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <tr
      className={`transition-colors ${onClick ? "cursor-pointer" : ""} hover:bg-gray-50/80`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function Td({ children, right, muted }: { children?: React.ReactNode; right?: boolean; muted?: boolean }) {
  return (
    <td className={`px-5 py-3.5 ${right ? "text-right" : ""} ${muted ? "text-gray-400" : "text-gray-700"}`}>
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
  "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none transition-all placeholder:text-gray-300 focus:border-red-700 focus:ring-2 focus:ring-red-700/10";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} resize-none ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function Badge({
  children,
  color = "gray",
}: {
  children: React.ReactNode;
  color?: "gray" | "green" | "red" | "blue" | "amber" | "purple";
}) {
  const styles: Record<string, string> = {
    gray:   "bg-gray-100 text-gray-600",
    green:  "bg-emerald-50 text-emerald-700",
    red:    "bg-red-50 text-red-700",
    blue:   "bg-sky-50 text-sky-700",
    amber:  "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[color]}`}>
      {children}
    </span>
  );
}

// ─── SavedToast ───────────────────────────────────────────────────────────────

export function SavedToast({ visible }: { visible: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}
    >
      <i className="fa-solid fa-circle-check text-xs" /> Guardado
    </span>
  );
}

// ─── Error Box ────────────────────────────────────────────────────────────────

export function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
      <i className="fa-solid fa-circle-exclamation mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

export function EmptyState({ message = "Sin datos" }: { message?: string }) {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-gray-300">
      <i className="fa-solid fa-inbox text-4xl" />
      <p className="text-sm">{message}</p>
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
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl ${width} w-full max-h-[90vh] overflow-auto shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif font-bold text-gray-900 text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
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
    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
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
        className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all text-xs"
        title="Subir"
      >
        <i className="fa-solid fa-chevron-up" />
      </button>
      <button
        onClick={onDown}
        className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all text-xs"
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
