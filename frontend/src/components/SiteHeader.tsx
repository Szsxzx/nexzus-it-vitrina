"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",          label: "Inicio" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/tienda",    label: "Tienda" },
  { href: "/pqr",       label: "PQR" },
  { href: "/#contacto", label: "Contacto" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden,   setHidden]   = useState(false);
  const [open,     setOpen]     = useState(false);
  const pathname = usePathname();
  const [hovered,  setHovered]  = useState<string | null>(null);

  // Ocultar/mostrar + fondo al hacer scroll
  useEffect(() => {
    let last = 0, ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 80);
        if (y > 150) {
          if (y > last + 8) setHidden(true);
          else if (y < last - 4) setHidden(false);
        } else setHidden(false);
        last = y;
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActiveHref = (href: string) => (href === "/" ? pathname === "/" : href.startsWith("/#") ? false : pathname.startsWith(href));
  // El home y /tienda arrancan con un hero oscuro detrás del header; el resto
  // de páginas (PQR, checkout) son claras, así que ahí el header es sólido.
  const overDarkBanner = pathname === "/" || pathname === "/tienda";
  const solid = scrolled || !overDarkBanner;
  const isDark = !solid; // sobre el banner: fondo oscuro → texto blanco

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        solid
          ? "bg-white/90 backdrop-blur shadow-sm"
          : open
            ? "bg-primary/95 backdrop-blur"
            : "bg-transparent",
        hidden ? "-translate-y-full" : "translate-y-0",
      ].join(" ")}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3">

        {/* Hamburguesa móvil */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menú"
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className={`w-6 h-0.5 block ${isDark ? "bg-white" : "bg-primary"}`} />
          ))}
        </button>

        {/* Nav desktop */}
        <nav className="hidden md:block">
          <ul className="flex">
            {links.map((l) => {
              const isActive  = isActiveHref(l.href);
              const isHovered = hovered === l.href;
              const showLine  = isActive || isHovered;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onMouseEnter={() => setHovered(l.href)}
                    onMouseLeave={() => setHovered(null)}
                    className="relative inline-flex flex-col items-center px-3 py-2 text-sm transition-colors duration-150"
                    style={{ color: isDark ? "rgba(255,255,255,0.9)" : "#1a1a1a" }}
                  >
                    {l.label}
                    {/* Subrayado morado animado */}
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full transition-transform duration-200 origin-left"
                      style={{
                        background: "#7C3AED",
                        transform: showLine ? "scaleX(1)" : "scaleX(0)",
                      }}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logo */}
        <Link href="/" aria-label="NEXZUS IT SERVICE" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/isotipo-nexzus.png"
            alt=""
            aria-hidden="true"
            className="h-9 md:h-10 w-auto"
          />
          <span
            className="font-heading text-xl font-bold tracking-wide transition-colors duration-300"
            style={{ color: isDark ? "#fff" : "#0B0712" }}
          >
            NEXZUS <span style={{ color: isDark ? "#A78BFA" : "#7C3AED" }}>IT</span>
          </span>
        </Link>

        <div className="w-10 hidden md:block" />
      </div>

      {/* Menú móvil — sobre el banner va oscuro para no desentonar;
          al bajar (scrolled) pasa a blanco como el resto del header. */}
      {open && (
        <ul
          className={[
            "md:hidden border-t flex flex-col transition-colors duration-300",
            isDark
              ? "bg-primary/95 backdrop-blur border-white/10"
              : "bg-white border-gray-200 shadow-lg",
          ].join(" ")}
        >
          {links.map((l) => {
            const isActive = isActiveHref(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={[
                    "block px-5 py-3 border-b text-sm transition-colors",
                    isDark
                      ? "text-white/90 border-white/10 hover:bg-white/10"
                      : "text-primary border-gray-100 hover:bg-gray-50",
                  ].join(" ")}
                  style={{ borderLeft: isActive ? "3px solid #7C3AED" : "3px solid transparent" }}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </header>
  );
}
