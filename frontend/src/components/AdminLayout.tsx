"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/lib/types";

const navGroups = [
  {
    label: "General",
    items: [
      { href: "/admin/dashboard", label: "Dashboard",   icon: "fa-chart-line" },
      { href: "/admin/products",  label: "Productos",   icon: "fa-box" },
      { href: "/admin/orders",    label: "Pedidos",     icon: "fa-clipboard-list" },
      { href: "/admin/users",     label: "Usuarios",    icon: "fa-users", adminOnly: true },
    ],
  },
  {
    label: "Sitio Web",
    items: [
      { href: "/admin/banner",        label: "Banner",           icon: "fa-image" },
      { href: "/admin/catalog",       label: "Catálogo",         icon: "fa-tags" },
      { href: "/admin/promotions",    label: "Promociones",      icon: "fa-percent" },
      { href: "/admin/premium-cuts",  label: "Cortes Premium",   icon: "fa-cow" },
      { href: "/admin/recipes",       label: "Recetas",          icon: "fa-book-open" },
      { href: "/admin/footer",        label: "Pie de página",    icon: "fa-grip-lines" },
    ],
  },
  {
    label: "Ajustes",
    items: [
      { href: "/admin/whatsapp", label: "WhatsApp pedidos", icon: "fa-whatsapp fa-brands" },
    ],
  },
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function AdminLayout({
  user,
  onLogout,
  children,
}: {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const displayName = user.full_name ?? user.username;

  return (
    <div className="min-h-screen flex" style={{ background: "#f4f3f0" }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className="w-60 flex flex-col fixed inset-y-0 left-0 overflow-y-auto"
        style={{ background: "#141414" }}
      >
        {/* Logo Fuente de Vida */}
        <div className="px-5 pt-6 pb-5 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/logo-white.svg"
            alt="Fuente de Vida"
            className="w-full max-w-[180px] h-auto"
          />
          <div
            className="mt-2 text-[9px] tracking-[0.22em] uppercase"
            style={{ color: "#555" }}
          >
            Panel Admin
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 16px" }} />

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-5">
          {navGroups.map((group) => {
            const visible = group.items.filter(
              (it) => !("adminOnly" in it) || !it.adminOnly || user.role === "admin"
            );
            if (visible.length === 0) return null;
            return (
              <div key={group.label}>
                <p
                  className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "#444" }}
                >
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {visible.map((it) => {
                    const active = pathname === it.href;
                    return (
                      <Link
                        key={it.href}
                        href={it.href}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150"
                        style={
                          active
                            ? { background: "#8B0000", color: "#fff" }
                            : { color: "#888" }
                        }
                        onMouseEnter={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                            (e.currentTarget as HTMLElement).style.color = "#fff";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "#888";
                          }
                        }}
                      >
                        <i
                          className={`fa-solid ${it.icon} text-xs w-4 text-center flex-shrink-0`}
                          style={{ opacity: active ? 1 : 0.7 }}
                        />
                        <span className="font-medium">{it.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 16px" }} />

        {/* Usuario */}
        <div className="p-3">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: "#8B0000" }}
            >
              {getInitials(displayName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{displayName}</div>
              <div className="text-[10px] capitalize" style={{ color: "#555" }}>{user.role}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150"
            style={{ color: "#666" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(139,0,0,0.15)";
              (e.currentTarget as HTMLElement).style.color = "#ff4444";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#666";
            }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido ───────────────────────────────────────────────────── */}
      <main className="flex-1 ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
