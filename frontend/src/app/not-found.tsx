"use client";
import { useState, useEffect } from "react";

export default function NotFound() {
  const [visible, setVisible] = useState(false);
  const [btnHover, setBtnHover] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #2a0000 50%, #0f0f0f 100%)" }}
    >
      {/* Círculo decorativo de fondo */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500, height: 500,
          background: "radial-gradient(circle, rgba(139,0,0,0.15) 0%, transparent 70%)",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        {/* Ícono */}
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: "rgba(139,0,0,0.2)", border: "1px solid rgba(139,0,0,0.3)" }}
        >
          <i className="fa-solid fa-drumstick-bite text-4xl" style={{ color: "#c0392b" }} />
        </div>

        {/* 404 */}
        <h1
          className="font-serif font-bold leading-none mb-2"
          style={{
            fontSize: "clamp(5rem, 18vw, 10rem)",
            color: "#8B0000",
            textShadow: "0 0 60px rgba(139,0,0,0.4)",
          }}
        >
          404
        </h1>

        {/* Línea decorativa */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-12 bg-rojo opacity-50" />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#3AA8C1" }}>
            Página no encontrada
          </span>
          <div className="h-px w-12 bg-rojo opacity-50" />
        </div>

        <p className="text-white/60 text-base max-w-sm mb-8 leading-relaxed">
          Parece que este corte no está en nuestro menú.<br />
          Vuelve al inicio para ver todo lo que tenemos.
        </p>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/"
            onMouseEnter={() => setBtnHover("home")}
            onMouseLeave={() => setBtnHover(null)}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300"
            style={{
              background: btnHover === "home" ? "#a50000" : "#8B0000",
              color: "#fff",
              boxShadow: btnHover === "home"
                ? "0 8px 30px rgba(139,0,0,0.5)"
                : "0 4px 16px rgba(139,0,0,0.3)",
              transform: btnHover === "home" ? "scale(1.05)" : "scale(1)",
            }}
          >
            <i className="fa-solid fa-house text-xs" />
            Ir al inicio
          </a>

          <a
            href="/#products"
            onMouseEnter={() => setBtnHover("catalog")}
            onMouseLeave={() => setBtnHover(null)}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.07)",
              color: btnHover === "catalog" ? "#fff" : "rgba(255,255,255,0.7)",
              border: "1.5px solid rgba(255,255,255,0.15)",
              transform: btnHover === "catalog" ? "scale(1.05)" : "scale(1)",
            }}
          >
            <i className="fa-solid fa-basket-shopping text-xs" />
            Ver catálogo
          </a>
        </div>

        {/* Logo abajo */}
        <div className="mt-16 flex flex-col items-center gap-2 opacity-30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo-white.svg" alt="Fuente de Vida" className="h-10 w-auto" />
        </div>
      </div>
    </div>
  );
}
