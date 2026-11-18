"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface BannerData {
  subtitle: string;
  title: string;
  highlight: string;
  ctaText: string;
  ctaHref: string;
}

const defaultBanner: BannerData = {
  subtitle: "Tecnología para tu negocio",
  title: "Software y Hardware",
  highlight: "NEXZUS IT SERVICE",
  ctaText: "Ver catálogo",
  ctaHref: "#products",
};

interface SettingsOut {
  banner_subtitle: string; banner_title: string; banner_highlight: string;
  banner_cta_text: string; banner_cta_href: string;
}

export default function Banner() {
  const [data, setData]       = useState<BannerData>(defaultBanner);
  const [visible, setVisible] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  useEffect(() => {
    api.get<SettingsOut>("/settings")
      .then((s) => setData({
        subtitle: s.banner_subtitle, title: s.banner_title, highlight: s.banner_highlight,
        ctaText: s.banner_cta_text, ctaHref: s.banner_cta_href,
      }))
      .catch(() => {});
    // Pequeño delay para que la animación de entrada sea visible
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="top"
      className="relative min-h-[90vh] flex flex-col items-center justify-center text-white text-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0B0712 0%, #1A1030 50%, #0B0712 100%)" }}
    >
      {/* Velo degradado inferior */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/60" />

      {/* Círculos decorativos de fondo */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Contenido principal */}
      <div
        className="relative z-10 px-4 max-w-4xl mx-auto"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {/* Etiqueta superior */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-12 bg-accent opacity-60" />
          <p className="text-xs md:text-sm uppercase tracking-[0.4em] font-semibold" style={{ color: "#A78BFA" }}>
            {data.subtitle}
          </p>
          <div className="h-px w-12 bg-accent opacity-60" />
        </div>

        {/* Título principal */}
        <h1 className="font-heading leading-tight mb-2" style={{ fontSize: "clamp(2.5rem, 8vw, 5.5rem)" }}>
          {data.title}
        </h1>
        <h1
          className="font-heading leading-tight mb-8"
          style={{
            fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
            color: "#A78BFA",
            textShadow: "0 0 40px rgba(124,58,237,0.4)",
          }}
        >
          {data.highlight}
        </h1>

        {/* Botón CTA */}
        <a
          href={data.ctaHref}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full uppercase tracking-widest text-sm font-bold transition-all duration-300"
          style={{
            background: btnHover ? "#6D28D9" : "#7C3AED",
            color: "#fff",
            boxShadow: btnHover
              ? "0 8px 30px rgba(124,58,237,0.5)"
              : "0 4px 16px rgba(124,58,237,0.3)",
            transform: btnHover ? "scale(1.05)" : "scale(1)",
          }}
        >
          {data.ctaText}
          <i
            className="fa-solid fa-arrow-right text-xs"
            style={{
              transform: btnHover ? "translateX(3px)" : "translateX(0)",
              transition: "transform 0.2s ease",
            }}
          />
        </a>
      </div>

      {/* Flecha scroll */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
        style={{
          opacity: visible ? 0.5 : 0,
          transition: "opacity 1s ease 0.8s",
          animation: "bounce 2s infinite",
        }}
      >
        <span className="text-[10px] uppercase tracking-widest text-white/50">Scroll</span>
        <i className="fa-solid fa-chevron-down text-white/50 text-xs" />
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(6px); }
        }
      `}</style>
    </section>
  );
}
