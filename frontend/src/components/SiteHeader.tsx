"use client";
import { useEffect, useState } from "react";

const links = [
  { href: "#top",        label: "Inicio",           section: "top" },
  { href: "#categories", label: "Cortes",            section: "categories" },
  { href: "#products",   label: "Productos",         section: "products" },
  { href: "#premium",    label: "Premium",           section: "premium" },
  { href: "#promotions", label: "Promociones",       section: "promotions" },
  { href: "#blog",       label: "Consejos",          section: "blog" },
  { href: "#contact",    label: "Contacto",          section: "contact" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden,   setHidden]   = useState(false);
  const [open,     setOpen]     = useState(false);
  const [active,   setActive]   = useState("top");
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

  // Scroll-spy
  useEffect(() => {
    const ids = links.map((l) => l.section).filter((s) => s !== "top");
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    const onTop = () => { if (window.scrollY < 120) setActive("top"); };
    window.addEventListener("scroll", onTop, { passive: true });
    return () => {
      observers.forEach((o) => o.disconnect());
      window.removeEventListener("scroll", onTop);
    };
  }, []);

  const isDark = !scrolled; // sobre el banner: fondo oscuro → texto blanco

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur shadow-sm"
          : open
            ? "bg-negro/95 backdrop-blur"
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
            <span key={i} className={`w-6 h-0.5 block ${isDark ? "bg-white" : "bg-negro"}`} />
          ))}
        </button>

        {/* Nav desktop */}
        <nav className="hidden md:block">
          <ul className="flex">
            {links.map((l) => {
              const isActive  = active  === l.section;
              const isHovered = hovered === l.section;
              const showLine  = isActive || isHovered;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onMouseEnter={() => setHovered(l.section)}
                    onMouseLeave={() => setHovered(null)}
                    className="relative inline-flex flex-col items-center px-3 py-2 text-sm transition-colors duration-150"
                    style={{ color: isDark ? "rgba(255,255,255,0.9)" : "#1a1a1a" }}
                  >
                    {l.label}
                    {/* Subrayado rojo animado */}
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full transition-transform duration-200 origin-left"
                      style={{
                        background: "#8B0000",
                        transform: showLine ? "scaleX(1)" : "scaleX(0)",
                      }}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logo */}
        <a href="#top" aria-label="Carnicería Fuente de Vida">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={scrolled ? "/img/logo.svg" : "/img/logo-white.svg"}
            alt="Fuente de Vida"
            className="h-12 md:h-14 w-auto transition-all duration-300"
          />
        </a>

        <div className="w-10 hidden md:block" />
      </div>

      {/* Menú móvil — sobre el banner va oscuro para no desentonar;
          al bajar (scrolled) pasa a blanco como el resto del header. */}
      {open && (
        <ul
          className={[
            "md:hidden border-t flex flex-col transition-colors duration-300",
            isDark
              ? "bg-negro/95 backdrop-blur border-white/10"
              : "bg-white border-gray-200 shadow-lg",
          ].join(" ")}
        >
          {links.map((l) => {
            const isActive = active === l.section;
            return (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={[
                    "block px-5 py-3 border-b text-sm transition-colors",
                    isDark
                      ? "text-white/90 border-white/10 hover:bg-white/10"
                      : "text-negro border-gray-100 hover:bg-gray-50",
                  ].join(" ")}
                  style={{ borderLeft: isActive ? "3px solid #8B0000" : "3px solid transparent" }}
                >
                  {l.label}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </header>
  );
}
