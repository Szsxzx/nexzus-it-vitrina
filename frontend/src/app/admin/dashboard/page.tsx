"use client";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import { PageShell, PageHeader, ErrorBox } from "@/components/AdminUI";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

const fmtCOP = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

const CARDS = (s: DashboardStats) => [
  { label: "Productos activos",  value: `${s.products_active}/${s.products_count}`, sub: "en catálogo",        icon: "fa-box",             bg: "#8B0000", light: "#8B000015" },
  { label: "Pedidos totales",    value: s.orders_total,                              sub: `${s.orders_pending} pendientes`, icon: "fa-clipboard-list", bg: "#3AA8C1", light: "#3AA8C115" },
  { label: "Pedidos hoy",        value: s.orders_today,                              sub: "últimas 24h",        icon: "fa-calendar-day",    bg: "#d97706", light: "#d9770615" },
  { label: "Ventas hoy",         value: fmtCOP.format(s.sales_today),                sub: "excluye cancelados", icon: "fa-arrow-trend-up",  bg: "#059669", light: "#05966915" },
  { label: "Ventas totales",     value: fmtCOP.format(s.sales_total),                sub: "histórico",          icon: "fa-chart-line",      bg: "#0d9488", light: "#0d948815" },
  { label: "Usuarios",           value: s.users_count,                               sub: "registrados",        icon: "fa-users",           bg: "#7c3aed", light: "#7c3aed15" },
];

export default function DashboardPage() {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [err, setErr]     = useState<string | null>(null);

  useEffect(() => {
    api.get<DashboardStats>("/dashboard/stats")
      .then(setStats)
      .catch((e) => setErr(e.detail));
  }, []);

  return (
    <PageShell>
      <PageHeader
        title={`Bienvenido, ${(user.full_name ?? user.username).split(" ")[0]}`}
        subtitle={`${user.email} · Rol: ${user.role}`}
      />

      <ErrorBox message={err} />

      {!stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS(stats).map((k) => (
            <div
              key={k.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 transition-all duration-200"
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-3px)";
                el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)";
                el.style.borderColor = k.bg + "33";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "";
                el.style.borderColor = "";
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: k.light, color: k.bg }}
              >
                <i className={`fa-solid ${k.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{k.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5 truncate">{k.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { href: "/admin/banner",        label: "Banner",          icon: "fa-image" },
          { href: "/admin/promotions",    label: "Promociones",     icon: "fa-percent" },
          { href: "/admin/catalog",       label: "Catálogo",        icon: "fa-tags" },
          { href: "/admin/premium-cuts",  label: "Cortes Premium",  icon: "fa-cow" },
          { href: "/admin/recipes",       label: "Recetas",         icon: "fa-book-open" },
          { href: "/admin/footer",        label: "Pie de página",   icon: "fa-grip-lines" },
        ].map((q) => (
          <a
            key={q.href}
            href={q.href}
            className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 text-center hover:border-gray-200 hover:shadow-sm transition-all group"
          >
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm group-hover:scale-110 transition-transform"
              style={{ background: "#8B000012", color: "#8B0000" }}
            >
              <i className={`fa-solid ${q.icon}`} />
            </span>
            <span className="text-xs font-medium text-gray-600">{q.label}</span>
          </a>
        ))}
      </div>
    </PageShell>
  );
}
