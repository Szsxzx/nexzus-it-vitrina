"use client";
import { useEffect, useState } from "react";

const links = [
  { href: "#top", label: "Inicio" },
  { href: "#categories", label: "Cortes" },
  { href: "#products", label: "Productos" },
  { href: "#premium", label: "Premium" },
  { href: "#promotions", label: "Promociones" },
  { href: "#blog", label: "Consejos" },
  { href: "#contact", label: "Contacto" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = 0;
    let ticking = false;
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

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/85 backdrop-blur shadow-sm" : "bg-transparent",
        hidden ? "-translate-y-full" : "translate-y-0",
      ].join(" ")}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menú"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`w-6 h-0.5 ${scrolled ? "bg-negro" : "bg-white"}`}
            />
          ))}
        </button>

        <nav className="hidden md:block">
          <ul className="flex gap-6 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={`hover:text-rojo transition ${scrolled ? "text-negro" : "text-white"}`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a href="#top" aria-label="Carnicería Fuente de Vida">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={scrolled ? "/img/logo.svg" : "/img/logo-white.svg"}
            alt="Fuente de Vida"
            className="h-12 md:h-14 w-auto transition-all duration-300"
          />
        </a>

        <div className="w-10" />
      </div>

      {/* Menú móvil desplegado */}
      {open && (
        <ul className="md:hidden bg-white border-t shadow-lg flex flex-col">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-5 py-3 border-b text-negro hover:bg-crema"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
