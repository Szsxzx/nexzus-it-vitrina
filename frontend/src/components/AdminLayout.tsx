"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { User } from "@/lib/types";

const navGroups = [
  {
    label: "General",
    items: [
      { href: "/admin/dashboard", label: "Dashboard",   icon: "fa-chart-line" },
      { href: "/admin/products",  label: "Productos",   icon: "fa-box" },
      { href: "/admin/orders",    label: "Pedidos",     icon: "fa-clipboard-list" },
      { href: "/admin/pqr",       label: "PQR",         icon: "fa-headset" },
      { href: "/admin/users",     label: "Usuarios",    icon: "fa-users", adminOnly: true },
    ],
  },
  {
    label: "Sitio Web",
    items: [
      { href: "/admin/banner",        label: "Banner",           icon: "fa-image" },
      { href: "/admin/catalog",       label: "Catálogo",         icon: "fa-tags" },
      { href: "/admin/promotions",    label: "Ofertas",           icon: "fa-percent" },
      { href: "/admin/premium-cuts",  label: "Soluciones destacadas",   icon: "fa-star" },
      { href: "/admin/recipes",       label: "Blog",          icon: "fa-book-open" },
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

/** Componente aislado para evitar re-renders del padre al hacer hover */
function NavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium relative overflow-hidden"
      style={{
        background: active
          ? "rgba(124,58,237,0.85)"
          : hovered ? "rgba(255,255,255,0.06)" : "transparent",
        color: active ? "#fff" : hovered ? "#ccc" : "#666",
        boxShadow: active ? "0 2px 10px rgba(124,58,237,0.3)" : "none",
        transition: "background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
          style={{ background: "#A78BFA" }}
        />
      )}
      <i
        className={`fa-solid ${icon} text-xs w-4 text-center flex-shrink-0`}
        style={{ opacity: active ? 1 : hovered ? 0.8 : 0.5 }}
      />
      <span>{label}</span>
    </Link>
  );
}

function VerSitioBtn() {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="px-3 pb-3">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-1.5 rounded-lg text-[11px] font-medium"
        style={{
          background: hovered ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
          color: hovered ? "#aaa" : "#555",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
        Ver sitio
      </a>
    </div>
  );
}

function LogoutBtn({ onLogout }: { onLogout: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onLogout}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs"
      style={{
        color: hovered ? "#ff5555" : "#555",
        background: hovered ? "rgba(124,58,237,0.12)" : "transparent",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
      Cerrar sesión
    </button>
  );
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
    <div className="min-h-screen flex" style={{ background: "#F8F7FB" }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className="w-60 flex flex-col fixed inset-y-0 left-0 overflow-y-auto"
        style={{ background: "#0B0712", borderRight: "1px solid rgba(255,255,255,0.04)" }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-4 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/isotipo-nexzus.png"
            alt=""
            aria-hidden="true"
            className="h-12 w-auto"
          />
          <span className="mt-2 font-heading text-lg font-bold tracking-wide text-white">
            NEXZUS <span className="text-accent-light">IT</span>
          </span>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className="text-[9px] tracking-[0.22em] uppercase font-medium"
              style={{ color: "#444" }}
            >
              Panel Admin
            </span>
          </div>
        </div>

        {/* Ver sitio */}
        <VerSitioBtn />

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 16px 4px" }} />

        {/* Navegación */}
        <nav className="flex-1 px-3 py-3 space-y-4">
          {navGroups.map((group) => {
            const visible = group.items.filter(
              (it) => !("adminOnly" in it) || !it.adminOnly || user.role === "admin"
            );
            if (visible.length === 0) return null;
            return (
              <div key={group.label}>
                <p
                  className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "#3a3a3a" }}
                >
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {visible.map((it) => (
                    <NavItem
                      key={it.href}
                      href={it.href}
                      label={it.label}
                      icon={it.icon}
                      active={pathname === it.href}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 16px" }} />

        {/* Usuario */}
        <div className="p-3">
          <div
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl mb-2"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "#7C3AED" }}
              >
                {getInitials(displayName)}
              </div>
              {/* Indicador online */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                style={{ background: "#10b981", borderColor: "#111" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{displayName}</div>
              <div className="text-[10px] capitalize" style={{ color: "#555" }}>
                {user.role}
              </div>
            </div>
          </div>
          <LogoutBtn onLogout={onLogout} />
        </div>
      </aside>

      {/* ── Contenido ───────────────────────────────────────────────────── */}
      <main className="flex-1 ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
